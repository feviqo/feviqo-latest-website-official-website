import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  ChevronDown,
  ArrowRight,
  AlertCircle,
  User,
} from 'lucide-react';
import { AppRoute } from '../../types';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  MEMBERSHIP_PLANS,
  MEMBERSHIP_DRAMAS,
  MembershipPlan,
  MembershipPlanId,
  CatalogDramaMeta,
} from '../../data/membershipCatalog';
import {
  fetchMembershipCatalog,
  fetchMemberAccount,
  logoutMemberAccount,
  createMembershipCheckout,
  MemberAccountState,
  MembershipOrder,
  PublicMembershipConfig,
} from '../../services/membershipService';
import { MembershipAuthModal } from '../membership/MembershipAuthModal';
import { MembershipAccountPanel } from '../membership/MembershipAccountPanel';
import { BankQrPaymentSection } from '../membership/BankQrPaymentSection';
import { useLanguage } from '../../i18n/LanguageContext';
import { MEMBERSHIP_COPY } from '../../i18n/membershipTranslations';

interface MembershipPageProps {
  onNavigatePage: (route: AppRoute) => void;
  onBookCall: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: (view?: 'login' | 'register' | 'admin') => void;
  initialViewAccount?: boolean;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({
  onNavigatePage,
  onBookCall,
  onNavigateSection,
  onNavigatePricing,
  onNavigateFlow,
  initialViewAccount = false,
}) => {
  const { t, isUrdu, dir } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState<MembershipPlanId | null>(null);
  const [selectedDramaIds, setSelectedDramaIds] = useState<string[]>([]);
  const [selectionWarning, setSelectionWarning] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>('q1');

  // Auth, catalog config & account state
  const [account, setAccount] = useState<MemberAccountState | null>(null);
  const [publicConfig, setPublicConfig] = useState<PublicMembershipConfig | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [showAccountSection, setShowAccountSection] = useState(initialViewAccount);
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false);

  // Manual Bank QR Checkout state
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<MembershipOrder | null>(null);

  const pricingRef = useRef<HTMLElement | null>(null);
  const dramaSelectionRef = useRef<HTMLElement | null>(null);
  const paymentSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setShowAccountSection(initialViewAccount);
  }, [initialViewAccount]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [catalogRes, accountRes] = await Promise.all([
          fetchMembershipCatalog().catch(() => null),
          fetchMemberAccount().catch(() => null),
        ]);
        if (!active) return;
        if (catalogRes?.publicConfig) {
          setPublicConfig(catalogRes.publicConfig);
        }
        if (accountRes && accountRes.success) {
          setAccount(accountRes);
          if (accountRes.publicConfig) {
            setPublicConfig(accountRes.publicConfig);
          }
        }
      } catch {
        // Guest viewer
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  const selectedPlan: MembershipPlan | undefined = selectedPlanId
    ? MEMBERSHIP_PLANS.find((p) => p.id === selectedPlanId)
    : undefined;

  const scrollToSection = (el: HTMLElement | null) => {
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlanId(plan.id);
    setSelectionWarning(null);
    setCheckoutError(null);
    setActivePaymentOrder(null);

    if (plan.dramaLimit === 'all') {
      setSelectedDramaIds(MEMBERSHIP_DRAMAS.filter((d) => d.vipEligible).map((d) => d.id));
    } else if (selectedDramaIds.length > plan.dramaLimit) {
      setSelectedDramaIds((prev) => prev.slice(0, plan.dramaLimit as number));
    }

    setTimeout(() => {
      scrollToSection(dramaSelectionRef.current);
    }, 60);
  };

  const handleToggleDrama = (drama: CatalogDramaMeta) => {
    if (!selectedPlan) return;
    setSelectionWarning(null);
    setCheckoutError(null);

    if (selectedPlan.dramaLimit === 'all') {
      setSelectionWarning(
        isUrdu
          ? 'VIP پلان میں تمام دستیاب VIP ڈرامے خودکار طور پر شامل ہیں۔'
          : 'VIP includes all eligible VIP catalogue dramas automatically.'
      );
      return;
    }

    const limit = selectedPlan.dramaLimit;
    const exists = selectedDramaIds.includes(drama.id);

    if (exists) {
      setSelectedDramaIds((prev) => prev.filter((id) => id !== drama.id));
      return;
    }

    if (selectedDramaIds.length >= limit) {
      setSelectionWarning(
        isUrdu
          ? `آپ کے منتخب ${selectedPlan.name} پلان میں ${limit} ڈرامے شامل ہیں۔ تبدیل کرنے کے لیے پہلے موجودہ انتخاب ہٹائیں۔`
          : limit === 1
          ? `Your ${selectedPlan.name} plan includes 1 drama. Deselect the current drama to switch, or upgrade to Plus for 2 dramas.`
          : `Your ${selectedPlan.name} plan includes ${limit} dramas. Deselect one drama first, or switch to VIP for the entire eligible catalogue.`
      );
      return;
    }

    setSelectedDramaIds((prev) => [...prev, drama.id]);
  };

  const runServerCheckout = async (plan: MembershipPlan, dramaIds: string[]) => {
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await createMembershipCheckout({
        planId: plan.id,
        selectedDramaIds: dramaIds,
      });

      if (!res.success || !res.order) {
        setCheckoutError(res.error || 'Could not initiate payment request. Please verify your selection.');
        return;
      }

      if (res.account) {
        setAccount(res.account);
      }
      if (res.publicConfig) {
        setPublicConfig(res.publicConfig);
      }
      setActivePaymentOrder(res.order);

      setTimeout(() => {
        scrollToSection(paymentSectionRef.current);
      }, 80);
    } catch {
      setCheckoutError('Network error while preparing Bank QR payment. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!selectedPlan) {
      setCheckoutError(
        isUrdu ? 'براہ کرم پہلے اوپر کوئی ممبرشپ پلان منتخب کریں۔' : 'Please select a membership plan above first.'
      );
      return;
    }

    setSelectionWarning(null);
    setCheckoutError(null);

    if (selectedPlan.dramaLimit !== 'all') {
      if (selectedDramaIds.length === 0) {
        setSelectionWarning(
          isUrdu
            ? `آگے بڑھنے سے پہلے براہ کرم ${selectedPlan.dramaLimit} ڈرامہ منتخب کریں۔`
            : `Please select ${selectedPlan.dramaLimit} drama${selectedPlan.dramaLimit > 1 ? 's' : ''} before continuing.`
        );
        return;
      }
      if (selectedDramaIds.length < selectedPlan.dramaLimit) {
        setSelectionWarning(
          isUrdu
            ? `آپ کے ${selectedPlan.name} پلان میں ${selectedPlan.dramaLimit} ڈرامے شامل ہیں۔ براہ کرم ایک اور ڈرامہ منتخب کریں۔`
            : `Your ${selectedPlan.name} plan includes ${selectedPlan.dramaLimit} dramas. Please select ${
                selectedPlan.dramaLimit - selectedDramaIds.length
              } more drama before continuing.`
        );
        return;
      }
    }

    const finalIds =
      selectedPlan.dramaLimit === 'all'
        ? MEMBERSHIP_DRAMAS.filter((d) => d.vipEligible).map((d) => d.id)
        : selectedDramaIds;

    if (!account) {
      setPendingCheckoutAfterAuth(true);
      setAuthModalMode('signup');
      setAuthModalOpen(true);
      return;
    }

    await runServerCheckout(selectedPlan, finalIds);
  };

  const handleAuthenticated = async (loggedAccount: MemberAccountState) => {
    setAccount(loggedAccount);
    if (loggedAccount.publicConfig) {
      setPublicConfig(loggedAccount.publicConfig);
    }
    setAuthModalOpen(false);

    if (pendingCheckoutAfterAuth && selectedPlan) {
      setPendingCheckoutAfterAuth(false);
      const finalIds =
        selectedPlan.dramaLimit === 'all'
          ? MEMBERSHIP_DRAMAS.filter((d) => d.vipEligible).map((d) => d.id)
          : selectedDramaIds;
      await runServerCheckout(selectedPlan, finalIds);
    } else if (!selectedPlan) {
      setShowAccountSection(true);
    }
  };

  const handleSignOut = async () => {
    await logoutMemberAccount();
    setAccount(null);
    setShowAccountSection(false);
    setActivePaymentOrder(null);
  };

  const handleOpenMyAccount = () => {
    if (!account) {
      setPendingCheckoutAfterAuth(false);
      setAuthModalMode('signin');
      setAuthModalOpen(true);
      return;
    }
    setShowAccountSection(true);
    setTimeout(() => {
      const el = document.getElementById('my-account');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const heroFeatured = MEMBERSHIP_DRAMAS[0];
  const heroSecondary = MEMBERSHIP_DRAMAS.slice(1);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0B0B0D] font-sans flex flex-col selection:bg-[#22C55E] selection:text-[#0B0B0D]">
      {/* Shared Website Header */}
      <Navbar
        onBookCall={onBookCall}
        onNavigateSection={onNavigateSection}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      {/* Compact Member Subbar */}
      <div dir={dir} className="bg-[#F8FAFC] border-b border-zinc-200">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4 ${
            isUrdu ? 'font-urdu-slim' : ''
          }`}
        >
          <div className="flex items-center gap-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setShowAccountSection(false);
                scrollToSection(pricingRef.current);
              }}
              className={`cursor-pointer transition-colors ${
                !showAccountSection ? 'text-[#16A34A]' : 'text-zinc-600 hover:text-[#0B0B0D]'
              }`}
            >
              {t(MEMBERSHIP_COPY.subbar.membershipTab)}
            </button>
            <button
              type="button"
              onClick={handleOpenMyAccount}
              className={`cursor-pointer transition-colors ${
                showAccountSection ? 'text-[#16A34A]' : 'text-zinc-600 hover:text-[#0B0B0D]'
              }`}
            >
              {t(MEMBERSHIP_COPY.subbar.myAccountTab)}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {account ? (
              <button
                type="button"
                onClick={handleOpenMyAccount}
                className="px-3.5 py-1.5 rounded-lg bg-[#0B0B0D] hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>{account.member.fullName}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPendingCheckoutAfterAuth(false);
                  setAuthModalMode('signup');
                  setAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                {t(MEMBERSHIP_COPY.subbar.signInSignUp)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Optional My Account Panel */}
      {account && showAccountSection && (
        <div className="border-b border-zinc-200 bg-white">
          <MembershipAccountPanel
            account={account}
            onAccountUpdated={(updated) => setAccount(updated)}
            onSignOut={handleSignOut}
            onChoosePlanClick={() => {
              setShowAccountSection(false);
              scrollToSection(pricingRef.current);
            }}
          />
        </div>
      )}

      <main dir={dir} className={`flex-1 ${isUrdu ? 'font-urdu-slim' : ''}`}>
        {/* Editorial Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-18 sm:pb-22">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#16A34A]">
                {t(MEMBERSHIP_COPY.hero.eyebrow)}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-[#0B0B0D] leading-[1.08]">
                {t(MEMBERSHIP_COPY.hero.title)}
              </h1>

              {!isUrdu && (
                <p dir="rtl" className="font-urdu-slim text-2xl sm:text-[26px] text-[#0B0B0D]/85 pt-1">
                  {MEMBERSHIP_COPY.hero.subtitleUrLine}
                </p>
              )}

              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                {t(MEMBERSHIP_COPY.hero.description)}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection(pricingRef.current)}
                  className="px-6 py-3.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>{t(MEMBERSHIP_COPY.hero.exploreMemberships)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="/dramas"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigatePage('dramas');
                  }}
                  className="px-6 py-3.5 rounded-xl border border-zinc-300 hover:border-[#0B0B0D] text-[#0B0B0D] text-sm font-semibold inline-flex items-center justify-center transition"
                >
                  {t(MEMBERSHIP_COPY.hero.exploreDramas)}
                </a>
              </div>
            </div>

            {/* Approved FEVIQO Drama Visual Showcase */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#0B0B0D] border border-zinc-200">
                <img
                  src={heroFeatured.posterUrl}
                  referrerPolicy="no-referrer"
                  alt={`${heroFeatured.title} — ${heroFeatured.seasonLabel} Urdu Dubbed`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (e.currentTarget.src !== window.location.origin + heroFeatured.fallbackPosterUrl) {
                      e.currentTarget.src = heroFeatured.fallbackPosterUrl;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#22C55E]">
                      {heroFeatured.seasonLabel} · {t(MEMBERSHIP_COPY.dramaSelection.urduDubbed)}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
                      {heroFeatured.title}
                    </div>
                  </div>
                  <div className="font-urdu-slim text-lg text-white/90 shrink-0" dir="rtl">
                    {heroFeatured.urduTitle}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {heroSecondary.map((drama) => (
                  <div
                    key={drama.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-[#0B0B0D] border border-zinc-200"
                  >
                    <img
                      src={drama.posterUrl}
                      referrerPolicy="no-referrer"
                      alt={`${drama.title} — ${drama.seasonLabel} Urdu Dubbed`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (e.currentTarget.src !== window.location.origin + drama.fallbackPosterUrl) {
                          e.currentTarget.src = drama.fallbackPosterUrl;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                      <div className="text-[10px] font-medium text-zinc-300">
                        {drama.seasonLabel} · {t(MEMBERSHIP_COPY.dramaSelection.urduDubbed)} · {drama.episodes.length}{' '}
                        {t(MEMBERSHIP_COPY.dramaSelection.episodes)}
                      </div>
                      <div className="text-sm font-bold leading-snug truncate mt-0.5">{drama.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How Membership Works */}
        <section className="bg-[#F8FAFC] border-y border-zinc-200/80 py-16 sm:py-22">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
                {t(MEMBERSHIP_COPY.howItWorks.eyebrow)}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B0B0D]">
                {t(MEMBERSHIP_COPY.howItWorks.heading)}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="space-y-3 pt-4 border-t border-zinc-300">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                  {t(MEMBERSHIP_COPY.howItWorks.step1Title)}
                </div>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {t(MEMBERSHIP_COPY.howItWorks.step1Desc)}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-300">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                  {t(MEMBERSHIP_COPY.howItWorks.step2Title)}
                </div>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {t(MEMBERSHIP_COPY.howItWorks.step2Desc)}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-300">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                  {t(MEMBERSHIP_COPY.howItWorks.step3Title)}
                </div>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {t(MEMBERSHIP_COPY.howItWorks.step3Desc)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Membership Pricing */}
        <section
          id="membership-pricing"
          ref={pricingRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-22 space-y-12"
        >
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B0B0D]">
              {t(MEMBERSHIP_COPY.plans.heading)}
            </h2>
            <p className="text-base text-zinc-600">{t(MEMBERSHIP_COPY.plans.subheading)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MEMBERSHIP_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isPopular = Boolean(plan.isFeatured);
              const copy = MEMBERSHIP_COPY.plans.items[plan.id];

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-colors ${
                    isPopular
                      ? 'bg-[#0B0B0D] text-white border border-[#0B0B0D]'
                      : isSelected
                      ? 'bg-white text-[#0B0B0D] border-2 border-[#22C55E]'
                      : 'bg-white text-[#0B0B0D] border border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="space-y-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold tracking-tight">{t(copy.name)}</h3>
                      {plan.featuredLabel && (
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#22C55E]">
                          {t(MEMBERSHIP_COPY.plans.mostPopular)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-3xl font-bold tracking-tight tabular-nums" dir="ltr">
                        {plan.priceDisplay}
                      </div>
                      <div className={`text-xs font-medium ${isPopular ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {t(copy.durationLabel)}
                      </div>
                    </div>

                    <div
                      className={`pt-4 border-t text-sm font-semibold ${
                        isPopular ? 'border-zinc-800 text-white' : 'border-zinc-100 text-[#0B0B0D]'
                      }`}
                    >
                      {t(copy.inclusionText)}
                    </div>

                    <p className={`text-xs leading-relaxed ${isPopular ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {t(copy.summary)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className={`mt-8 w-full py-3 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${
                      isPopular
                        ? 'bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white'
                        : isSelected
                        ? 'bg-[#0B0B0D] text-white'
                        : 'bg-[#F4F4F5] hover:bg-[#0B0B0D] text-[#0B0B0D] hover:text-white'
                    }`}
                  >
                    {isSelected
                      ? `${t(copy.name)} · ${t(MEMBERSHIP_COPY.plans.selectedSuffix)}`
                      : t(copy.ctaLabel)}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Drama Selection & Bank QR Payment Flow */}
        {selectedPlan && (
          <section
            id="drama-selection"
            ref={dramaSelectionRef}
            className="bg-[#F8FAFC] border-y border-zinc-200 py-14 sm:py-20"
            aria-labelledby="drama-selection-heading"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
                    {t(MEMBERSHIP_COPY.dramaSelection.stepEyebrow)} · {selectedPlan.name} (
                    <span dir="ltr">{selectedPlan.priceDisplay}</span> /{' '}
                    {t(MEMBERSHIP_COPY.plans.items[selectedPlan.id].durationLabel)})
                  </div>
                  <h2 id="drama-selection-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0B0D]">
                    {selectedPlan.dramaLimit === 'all'
                      ? t(MEMBERSHIP_COPY.dramaSelection.allVipHeading)
                      : selectedPlan.dramaLimit === 2
                      ? t(MEMBERSHIP_COPY.dramaSelection.selectTwoHeading)
                      : t(MEMBERSHIP_COPY.dramaSelection.selectOneHeading)}
                  </h2>
                  <p className="text-sm text-zinc-600">
                    {selectedPlan.dramaLimit === 'all'
                      ? t(MEMBERSHIP_COPY.dramaSelection.vipDesc)
                      : t(MEMBERSHIP_COPY.dramaSelection.chooseCountDesc)}
                  </p>
                </div>

                <div className="text-sm font-semibold text-[#0B0B0D] tabular-nums shrink-0" dir="ltr">
                  {selectedPlan.dramaLimit === 'all'
                    ? `${MEMBERSHIP_DRAMAS.length} / ${MEMBERSHIP_DRAMAS.length}`
                    : `${selectedDramaIds.length} / ${selectedPlan.dramaLimit}`}
                </div>
              </div>

              {selectionWarning && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  <span>{selectionWarning}</span>
                </div>
              )}

              {/* Real FEVIQO 3-Drama Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MEMBERSHIP_DRAMAS.map((drama) => {
                  const isVipAuto = selectedPlan.dramaLimit === 'all' && drama.vipEligible;
                  const isChosen = isVipAuto || selectedDramaIds.includes(drama.id);

                  return (
                    <button
                      key={drama.id}
                      type="button"
                      onClick={() => handleToggleDrama(drama)}
                      className={`text-left rounded-2xl overflow-hidden bg-white transition flex flex-col cursor-pointer ${
                        isChosen ? 'border-2 border-[#22C55E]' : 'border border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <div className="relative aspect-video w-full bg-[#0B0B0D]">
                        <img
                          src={drama.posterUrl}
                          referrerPolicy="no-referrer"
                          alt={drama.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (e.currentTarget.src !== window.location.origin + drama.fallbackPosterUrl) {
                              e.currentTarget.src = drama.fallbackPosterUrl;
                            }
                          }}
                        />
                        {isChosen && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#22C55E] text-[#0B0B0D] flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="text-lg font-bold text-[#0B0B0D]">{drama.title}</h3>
                            <span className="font-urdu-slim text-base text-zinc-700" dir="rtl">
                              {drama.urduTitle}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-zinc-500">
                            {drama.seasonLabel} · {drama.genreLabel} · {drama.episodes.length}{' '}
                            {t(MEMBERSHIP_COPY.dramaSelection.episodes)}
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed">{drama.synopsis}</p>
                        </div>

                        <div className="pt-3 border-t border-zinc-100 text-xs font-semibold flex items-center justify-between">
                          <span className={isChosen ? 'text-[#16A34A]' : 'text-zinc-600'}>
                            {isVipAuto
                              ? t(MEMBERSHIP_COPY.dramaSelection.includedVip)
                              : isChosen
                              ? t(MEMBERSHIP_COPY.dramaSelection.selectedForMembership)
                              : t(MEMBERSHIP_COPY.dramaSelection.selectDrama)}
                          </span>
                          <span className="text-zinc-500">{t(MEMBERSHIP_COPY.dramaSelection.urduDubbed)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {checkoutError && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Checkout Action Bar */}
              <div className="rounded-2xl bg-white border border-zinc-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#0B0B0D]">
                    {selectedPlan.name} · <span dir="ltr">{selectedPlan.priceDisplay}</span> (
                    {t(MEMBERSHIP_COPY.plans.items[selectedPlan.id].durationLabel)})
                  </div>
                  <div className="text-xs text-zinc-600">
                    {account
                      ? `${t(MEMBERSHIP_COPY.dramaSelection.signedInAs)} ${account.member.email}`
                      : t(MEMBERSHIP_COPY.dramaSelection.guestCheckoutNote)}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={checkingOut}
                  onClick={handleCheckoutSubmit}
                  className="px-6 py-3.5 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-[#0B0B0D] disabled:opacity-60 text-sm font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
                >
                  <span>
                    {checkingOut
                      ? t(MEMBERSHIP_COPY.dramaSelection.preparingCheckout)
                      : account
                      ? t(MEMBERSHIP_COPY.dramaSelection.proceedToPayment)
                      : t(MEMBERSHIP_COPY.dramaSelection.continueSignInCheckout)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Manual Bank QR Payment & Proof Upload Section */}
              {activePaymentOrder && account && (
                <div ref={paymentSectionRef}>
                  <BankQrPaymentSection
                    order={activePaymentOrder}
                    member={account.member}
                    publicConfig={publicConfig}
                    onProofSubmitted={(updatedAcc, updatedOrd) => {
                      setAccount(updatedAcc);
                      setActivePaymentOrder(updatedOrd);
                    }}
                    onViewMyAccount={() => {
                      setShowAccountSection(true);
                      setTimeout(() => {
                        const el = document.getElementById('my-account');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 60);
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Important Membership Information */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-22 space-y-12">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
              {t(MEMBERSHIP_COPY.policies.eyebrow)}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B0B0D]">
              {t(MEMBERSHIP_COPY.policies.heading)}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 border-t border-zinc-200 pt-10">
            {MEMBERSHIP_COPY.policies.items.map((policy) => (
              <div key={policy.id} className="space-y-2">
                <h3 className="text-base font-bold text-[#0B0B0D]">{t(policy.title)}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{t(policy.description)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-[#F8FAFC] border-y border-zinc-200/80 py-16 sm:py-22">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
                {t(MEMBERSHIP_COPY.faq.eyebrow)}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B0B0D]">
                {t(MEMBERSHIP_COPY.faq.heading)}
              </h2>
            </div>

            <div className="divide-y divide-zinc-200 border-y border-zinc-200">
              {MEMBERSHIP_COPY.faq.items.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="py-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="text-base font-semibold text-[#0B0B0D]">{t(faq.question)}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#0B0B0D]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-sm text-zinc-600 leading-relaxed pr-6">{t(faq.answer)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-18 sm:py-24 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0B0B0D] max-w-2xl mx-auto leading-tight">
            {t(MEMBERSHIP_COPY.finalCta.heading)}
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 max-w-xl mx-auto">
            {t(MEMBERSHIP_COPY.finalCta.subtitle)}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => scrollToSection(pricingRef.current)}
              className="px-7 py-3.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-sm font-semibold inline-flex items-center gap-2 transition cursor-pointer"
            >
              <span>{t(MEMBERSHIP_COPY.finalCta.cta)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Shared Website Footer */}
      <Footer
        onBookCall={onBookCall}
        onGetStarted={onBookCall}
        onNavigateSection={onNavigateSection}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={() => onNavigateFlow()}
        onNavigatePage={onNavigatePage}
      />

      <MembershipAuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        pendingContextLabel={
          selectedPlan
            ? `${selectedPlan.name} (${selectedPlan.priceDisplay} · ${selectedPlan.durationLabel})`
            : undefined
        }
        onClose={() => {
          setAuthModalOpen(false);
          setPendingCheckoutAfterAuth(false);
        }}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
};

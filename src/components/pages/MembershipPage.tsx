import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  AlertCircle,
  Lock,
  User,
} from 'lucide-react';
import { AppRoute } from '../../types';
import { FeviqoHeaderLogo } from '../FeviqoLogo';
import {
  MEMBERSHIP_PLANS,
  MEMBERSHIP_DRAMAS,
  MEMBERSHIP_POLICIES,
  MEMBERSHIP_FAQS,
  MembershipPlan,
  MembershipPlanId,
  CatalogDramaMeta,
} from '../../data/membershipCatalog';
import {
  fetchMemberAccount,
  logoutMemberAccount,
  createMembershipCheckout,
  confirmStripeCheckout,
  MemberAccountState,
  MembershipOrder,
  PaymentGatewayStatus,
} from '../../services/membershipService';
import { MembershipAuthModal } from '../membership/MembershipAuthModal';
import { MembershipAccountPanel } from '../membership/MembershipAccountPanel';

interface MembershipPageProps {
  onNavigatePage: (route: AppRoute) => void;
  onBookCall?: () => void;
  initialViewAccount?: boolean;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({
  onNavigatePage,
  onBookCall,
  initialViewAccount = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<MembershipPlanId | null>(null);
  const [selectedDramaIds, setSelectedDramaIds] = useState<string[]>([]);
  const [selectionWarning, setSelectionWarning] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>('q1');

  // Auth & account state
  const [account, setAccount] = useState<MemberAccountState | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [showAccountSection, setShowAccountSection] = useState(initialViewAccount);
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false);

  // Checkout state
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [createdOrderResult, setCreatedOrderResult] = useState<{
    order: MembershipOrder;
    paymentSetupRequired: boolean;
    gatewayStatus?: PaymentGatewayStatus;
  } | null>(null);
  const [stripeConfirmMessage, setStripeConfirmMessage] = useState<string | null>(null);

  const pricingRef = useRef<HTMLElement | null>(null);
  const dramaSelectionRef = useRef<HTMLElement | null>(null);

  // Load current member session on mount + verify Stripe return URL if present
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const res = await fetchMemberAccount();
        if (active && res.success) {
          setAccount(res);
        }
      } catch {
        // Guest viewer
      }

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('order');
        const sessionId = params.get('session_id');
        if (orderId && sessionId) {
          const confirmed = await confirmStripeCheckout({ orderId, sessionId });
          if (active && !('error' in confirmed)) {
            setAccount(confirmed);
            setShowAccountSection(true);
            setStripeConfirmMessage('Payment verified. Your FEVIQO Premium Membership is now active.');
            window.history.replaceState({}, '', '/membership');
          } else if (active && 'error' in confirmed) {
            setStripeConfirmMessage(confirmed.error || 'Payment verification is still pending.');
          }
        }
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
    setCreatedOrderResult(null);

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
      setSelectionWarning('VIP includes all eligible VIP catalogue dramas automatically.');
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
        limit === 1
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

      if (!res.success) {
        setCheckoutError(res.error || 'Could not initiate checkout. Please verify your selection.');
        return;
      }

      if (res.account) {
        setAccount(res.account);
      }

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }

      if (res.order) {
        setCreatedOrderResult({
          order: res.order,
          paymentSetupRequired: Boolean(res.paymentSetupRequired),
          gatewayStatus: res.gatewayStatus,
        });
      }
    } catch {
      setCheckoutError('Network error while creating checkout order. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!selectedPlan) {
      setCheckoutError('Please select a membership plan above first.');
      return;
    }

    setSelectionWarning(null);
    setCheckoutError(null);

    if (selectedPlan.dramaLimit !== 'all') {
      if (selectedDramaIds.length === 0) {
        setSelectionWarning(
          `Please select ${selectedPlan.dramaLimit} drama${selectedPlan.dramaLimit > 1 ? 's' : ''} before continuing.`
        );
        return;
      }
      if (selectedDramaIds.length < selectedPlan.dramaLimit) {
        setSelectionWarning(
          `Your ${selectedPlan.name} plan includes ${selectedPlan.dramaLimit} dramas. Please select ${
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
    setCreatedOrderResult(null);
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

  const heroFeatured = MEMBERSHIP_DRAMAS[0]; // Teşkilat
  const heroSecondary = MEMBERSHIP_DRAMAS.slice(1); // Mehmed + Güneşin Doğduğu Yer

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0B0B0D] font-sans flex flex-col selection:bg-[#22C55E] selection:text-[#0B0B0D]">
      {/* SECTION A — Clean Minimal Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigatePage('home');
            }}
            className="flex items-center shrink-0"
            aria-label="FEVIQO Home"
          >
            <FeviqoHeaderLogo theme="light" className="h-7 sm:h-8 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-700">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('home');
              }}
              className="hover:text-[#0B0B0D] transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <a
              href="/dramas"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('dramas');
              }}
              className="hover:text-[#0B0B0D] transition-colors whitespace-nowrap shrink-0"
            >
              Explore Dramas
            </a>
            <button
              type="button"
              onClick={() => {
                setShowAccountSection(false);
                scrollToSection(pricingRef.current);
              }}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !showAccountSection ? 'text-[#0B0B0D] font-semibold' : 'hover:text-[#0B0B0D]'
              }`}
            >
              Membership
            </button>
            <button
              type="button"
              onClick={handleOpenMyAccount}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showAccountSection ? 'text-[#16A34A] font-semibold' : 'hover:text-[#0B0B0D]'
              }`}
            >
              My Account
            </button>

            {account ? (
              <button
                type="button"
                onClick={handleOpenMyAccount}
                className="px-4 py-2 rounded-xl bg-[#0B0B0D] hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0"
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
                className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
              >
                Sign In / Create Account
              </button>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-[#0B0B0D] hover:bg-zinc-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-2">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigatePage('home');
              }}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[#0B0B0D] hover:bg-zinc-50"
            >
              Home
            </a>
            <a
              href="/dramas"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigatePage('dramas');
              }}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[#0B0B0D] hover:bg-zinc-50"
            >
              Explore Dramas
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowAccountSection(false);
                scrollToSection(pricingRef.current);
              }}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-[#0B0B0D] hover:bg-zinc-50 cursor-pointer"
            >
              Membership
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenMyAccount();
              }}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-[#0B0B0D] hover:bg-zinc-50 cursor-pointer"
            >
              My Account
            </button>
            <div className="pt-2">
              {account ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenMyAccount();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0B0B0D] text-white text-sm font-semibold cursor-pointer"
                >
                  {account.member.fullName} — View Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setPendingCheckoutAfterAuth(false);
                    setAuthModalMode('signup');
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#22C55E] text-[#0B0B0D] text-sm font-semibold cursor-pointer"
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {stripeConfirmMessage && (
        <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 text-center text-sm font-medium text-[#0B0B0D]">
          {stripeConfirmMessage}
        </div>
      )}

      {/* Optional My Account Drawer View when authenticated & opened */}
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

      <main className="flex-1">
        {/* SECTION B — Editorial Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#16A34A]">
                FEVIQO PREMIUM MEMBERSHIP
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#0B0B0D] leading-[1.06]">
                Your Favourite Turkish Dramas. In Urdu.
              </h1>

              <p
                dir="rtl"
                className="font-urdu-slim text-2xl sm:text-[28px] text-[#0B0B0D]/85 pt-1"
              >
                اپنے پسندیدہ ترکی ڈرامے اردو زبان میں دیکھیں۔
              </p>

              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                Choose the exact series you follow or unlock the full eligible VIP catalogue in Urdu—built for smooth, high-definition viewing across Pakistan.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection(pricingRef.current)}
                  className="px-6 py-3.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Explore Memberships</span>
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
                  Explore Dramas
                </a>
              </div>
            </div>

            {/* Approved FEVIQO Drama Visual Showcase (Real 3-Series Catalogue Only) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Primary 16:9 Drama Showcase Frame */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#0B0B0D] border border-zinc-200">
                <img
                  src={heroFeatured.posterUrl}
                  referrerPolicy="no-referrer"
                  alt={`${heroFeatured.title} — ${heroFeatured.seasonLabel} in Urdu`}
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
                      {heroFeatured.seasonLabel} · {heroFeatured.languageLabel}
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

              {/* Supporting Real FEVIQO Series Pair */}
              <div className="grid grid-cols-2 gap-4">
                {heroSecondary.map((drama) => (
                  <div
                    key={drama.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-[#0B0B0D] border border-zinc-200"
                  >
                    <img
                      src={drama.posterUrl}
                      referrerPolicy="no-referrer"
                      alt={`${drama.title} — ${drama.seasonLabel} in Urdu`}
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
                        {drama.seasonLabel} · {drama.episodes.length} Episodes
                      </div>
                      <div className="text-sm font-bold leading-snug truncate mt-0.5">
                        {drama.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION C — How Membership Works */}
        <section className="bg-[#F8FAFC] border-y border-zinc-200/80 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
                How Membership Works
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B0B0D]">
                Your Membership. Your Choice.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="space-y-3 pt-4 border-t border-zinc-300">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                  01 — Choose Your Dramas
                </div>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  Pick the membership tier that matches how you watch, then choose one or two specific Turkish dramas—or unlock all eligible VIP titles at once.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-300">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                  02 — Activate Your Membership
                </div>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  Sign in or create your personal FEVIQO account and verify your order to begin your 15-day or 30-day membership term.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-300">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                  03 — Enjoy New Episodes
                </div>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  Stream existing episodes right away and receive every newly published eligible episode for your selected dramas throughout your term.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION D — Membership Pricing */}
        <section
          id="membership-pricing"
          ref={pricingRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12"
        >
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B0B0D]">
              Choose Your Membership
            </h2>
            <p className="text-base text-zinc-600">
              The right membership for the dramas you want to watch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MEMBERSHIP_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isPopular = Boolean(plan.isFeatured);

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
                      <h3 className="text-lg font-bold tracking-tight">{plan.name}</h3>
                      {plan.featuredLabel && (
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#22C55E]">
                          {plan.featuredLabel}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-3xl font-bold tracking-tight tabular-nums">
                        {plan.priceDisplay}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          isPopular ? 'text-zinc-400' : 'text-zinc-500'
                        }`}
                      >
                        {plan.durationLabel}
                      </div>
                    </div>

                    <div
                      className={`pt-4 border-t text-sm font-semibold ${
                        isPopular
                          ? 'border-zinc-800 text-white'
                          : 'border-zinc-100 text-[#0B0B0D]'
                      }`}
                    >
                      {plan.inclusionText}
                    </div>

                    <p
                      className={`text-xs leading-relaxed ${
                        isPopular ? 'text-zinc-300' : 'text-zinc-600'
                      }`}
                    >
                      {plan.summary}
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
                    {isSelected ? `${plan.name} Selected` : plan.ctaLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION E — Drama Selection (Appears after selecting a plan) */}
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
                    Step 2 · {selectedPlan.name} Plan ({selectedPlan.priceDisplay} / {selectedPlan.durationLabel})
                  </div>
                  <h2 id="drama-selection-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0B0D]">
                    {selectedPlan.dramaLimit === 'all'
                      ? 'All Eligible VIP Catalogue Dramas Included'
                      : `Select ${selectedPlan.dramaLimit} Drama${selectedPlan.dramaLimit > 1 ? 's' : ''} for Your Membership`}
                  </h2>
                  <p className="text-sm text-zinc-600">
                    {selectedPlan.dramaLimit === 'all'
                      ? 'Your VIP plan unlocks every eligible Turkish series below for 30 days.'
                      : `Choose ${selectedPlan.dramaLimit} series from the official FEVIQO catalogue (${selectedDramaIds.length} of ${selectedPlan.dramaLimit} selected).`}
                  </p>
                </div>

                <div className="text-sm font-semibold text-[#0B0B0D] tabular-nums shrink-0">
                  {selectedPlan.dramaLimit === 'all'
                    ? `${MEMBERSHIP_DRAMAS.length} of ${MEMBERSHIP_DRAMAS.length} included`
                    : `${selectedDramaIds.length} / ${selectedPlan.dramaLimit} selected`}
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
                        isChosen
                          ? 'border-2 border-[#22C55E]'
                          : 'border border-zinc-200 hover:border-zinc-400'
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
                            {drama.seasonLabel} · {drama.genreLabel} · {drama.episodes.length} Episodes
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            {drama.synopsis}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-zinc-100 text-xs font-semibold flex items-center justify-between">
                          <span className={isChosen ? 'text-[#16A34A]' : 'text-zinc-600'}>
                            {isVipAuto
                              ? 'Included with VIP'
                              : isChosen
                              ? 'Selected for Membership'
                              : 'Select Drama'}
                          </span>
                          <span className="text-zinc-400">{drama.languageLabel}</span>
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

              {/* Honest Pending Order / Payment Verification Notice (Never fakes activation) */}
              {createdOrderResult && (
                <div className="rounded-2xl bg-white border border-zinc-300 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                        Order Saved · Pending Payment Verification
                      </div>
                      <h3 className="text-lg font-bold text-[#0B0B0D] mt-0.5">
                        {createdOrderResult.order.planName} Plan — PKR{' '}
                        {createdOrderResult.order.amountPkr.toLocaleString()} ({createdOrderResult.order.durationDays} Days)
                      </h3>
                    </div>
                    <div className="text-xs text-zinc-500 tabular-nums">
                      Order ID: {createdOrderResult.order.id}
                    </div>
                  </div>

                  {createdOrderResult.paymentSetupRequired && (
                    <div className="space-y-2 text-sm text-zinc-700 leading-relaxed">
                      <div className="flex items-center gap-2 font-semibold text-[#0B0B0D]">
                        <Lock className="w-4 h-4 text-zinc-500" />
                        <span>Payment Gateway Credentials Required for Activation</span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        Your checkout selection has been securely recorded under your account as <strong>Pending Payment</strong>. Because live merchant payment credentials are not configured on this server yet, this membership remains inactive until payment settlement is verified.
                      </p>
                      {createdOrderResult.gatewayStatus && (
                        <ul className="text-xs text-zinc-500 list-disc pl-5 space-y-1 pt-1">
                          {createdOrderResult.gatewayStatus.missingCredentials.map((cred) => (
                            <li key={cred}>{cred}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleOpenMyAccount}
                      className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-[#0B0B0D] hover:bg-zinc-100 transition cursor-pointer"
                    >
                      View Order in My Account
                    </button>
                  </div>
                </div>
              )}

              {/* Checkout Action Bar */}
              <div className="rounded-2xl bg-white border border-zinc-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#0B0B0D]">
                    {selectedPlan.name} · {selectedPlan.priceDisplay} for {selectedPlan.durationLabel}
                  </div>
                  <div className="text-xs text-zinc-600">
                    {account
                      ? `Signed in as ${account.member.email}`
                      : 'Sign in or create a personal FEVIQO account at the next step to complete verification.'}
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
                      ? 'Preparing Checkout...'
                      : account
                      ? 'Proceed to Checkout'
                      : 'Continue to Sign In & Checkout'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION F — Important Membership Information */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
              Membership Details
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B0B0D]">
              Everything You Need to Know
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 border-t border-zinc-200 pt-10">
            {MEMBERSHIP_POLICIES.map((policy) => (
              <div key={policy.id} className="space-y-2">
                <h3 className="text-base font-bold text-[#0B0B0D]">{policy.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{policy.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION G — Frequently Asked Questions */}
        <section className="bg-[#F8FAFC] border-y border-zinc-200/80 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
                Questions &amp; Answers
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B0B0D]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="divide-y divide-zinc-200 border-y border-zinc-200">
              {MEMBERSHIP_FAQS.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="py-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="text-base font-semibold text-[#0B0B0D]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#0B0B0D]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-sm text-zinc-600 leading-relaxed pr-6">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION H — Final CTA & Minimalist Footer */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0B0B0D] max-w-2xl mx-auto leading-tight">
            Your Next Favourite Story Is Waiting.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 max-w-xl mx-auto">
            Join FEVIQO Premium and experience Turkish dramas in Urdu.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => scrollToSection(pricingRef.current)}
              className="px-7 py-3.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-sm font-semibold inline-flex items-center gap-2 transition cursor-pointer"
            >
              <span>Choose Your Membership</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Clean Membership Footer */}
      <footer className="border-t border-zinc-200 bg-[#FFFFFF] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <FeviqoHeaderLogo theme="light" className="h-6 w-auto" />
              <span className="sr-only">FEVIQO</span>
            </div>
            <p dir="rtl" className="font-urdu-slim text-lg text-zinc-700">
              ترکی کہانیاں، اب آپ کی زبان میں۔
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600"
          >
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('home');
              }}
              className="hover:text-[#0B0B0D] transition-colors"
            >
              Home
            </a>
            <a
              href="/dramas"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('dramas');
              }}
              className="hover:text-[#0B0B0D] transition-colors"
            >
              Explore Dramas
            </a>
            <a
              href="/membership"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(pricingRef.current);
              }}
              className="hover:text-[#0B0B0D] font-medium text-[#0B0B0D] transition-colors"
            >
              Membership
            </a>
            <a
              href="/booking"
              onClick={(e) => {
                e.preventDefault();
                if (onBookCall) onBookCall();
                else onNavigatePage('booking');
              }}
              className="hover:text-[#0B0B0D] transition-colors"
            >
              Contact
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('terms');
              }}
              className="hover:text-[#0B0B0D] transition-colors"
            >
              Terms
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('privacy');
              }}
              className="hover:text-[#0B0B0D] transition-colors"
            >
              Privacy Policy
            </a>
          </nav>
        </div>
      </footer>

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

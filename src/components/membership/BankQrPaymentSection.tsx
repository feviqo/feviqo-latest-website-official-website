import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  RefreshCw,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';
import {
  MembershipOrder,
  SafeMember,
  PublicMembershipConfig,
  MemberAccountState,
  submitOrderPaymentProofFile,
  confirmZeroBalanceOrder,
} from '../../services/membershipService';
import {
  compressProofImageToDataUrl,
  isFirebaseSignedInVerified,
  syncOrderToFirestore,
  syncHistoryEntryToFirestore,
} from '../../services/firestoreMembershipSync';
import { getDramaById } from '../../data/membershipCatalog';
import { useLanguage } from '../../i18n/LanguageContext';
import { MEMBERSHIP_COPY } from '../../i18n/membershipTranslations';

interface BankQrPaymentSectionProps {
  order: MembershipOrder;
  member: SafeMember;
  publicConfig?: PublicMembershipConfig;
  onProofSubmitted: (updatedAccount: MemberAccountState, updatedOrder: MembershipOrder) => void;
  onViewMyAccount: () => void;
}

export const BankQrPaymentSection: React.FC<BankQrPaymentSectionProps> = ({
  order,
  member,
  publicConfig,
  onProofSubmitted,
  onViewMyAccount,
}) => {
  const { t, isUrdu, dir } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState(order.paymentNote || '');
  const [declaredAmountInput, setDeclaredAmountInput] = useState<string>(() => {
    if (typeof order.customerDeclaredAmountPkr === 'number' && order.customerDeclaredAmountPkr > 0) {
      return String(Math.round(order.customerDeclaredAmountPkr));
    }
    return '';
  });
  const [uploading, setUploading] = useState(false);
  const [confirmingFree, setConfirmingFree] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [whatsappNotice, setWhatsappNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPaymentNote(order.paymentNote || '');
    if (typeof order.customerDeclaredAmountPkr === 'number' && order.customerDeclaredAmountPkr > 0) {
      setDeclaredAmountInput(String(Math.round(order.customerDeclaredAmountPkr)));
    } else {
      setDeclaredAmountInput('');
    }
  }, [order.id, order.customerDeclaredAmountPkr, order.paymentNote]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const dramaTitlesList = order.selectedDramaIds.map((id) => getDramaById(id)?.title || id);
  const dramaTitlesText = dramaTitlesList.join(', ');

  const isInternational =
    order.paymentMethod === 'binance_qr' ||
    order.paymentRegion === 'international' ||
    order.currency === 'USD';
  const isRenewal = order.orderType === 'renewal';
  const usdAmount = Number(order.expectedAmount ?? order.amountUsd ?? 0);
  const optionalContributionPkr = !isInternational
    ? Math.max(0, Math.round(Number(order.optionalContributionPkr) || 0))
    : 0;
  const expectedTotalPkr = !isInternational
    ? Math.max(0, Math.round(Number(order.expectedTotalPkr ?? order.amountPkr ?? 0)))
    : 0;
  const subscriptionPricePkr = !isInternational
    ? Math.max(
        0,
        Math.round(
          typeof order.subscriptionPricePkr === 'number'
            ? order.subscriptionPricePkr
            : Math.max(0, expectedTotalPkr - optionalContributionPkr)
        )
      )
    : 0;
  const payableAmount = isInternational ? usdAmount : expectedTotalPkr;
  const isZeroBalance = payableAmount <= 0;
  const originalAmount = isInternational
    ? Number(order.originalAmountUsd ?? order.amountUsd ?? 0)
    : Number(order.originalAmountPkr ?? subscriptionPricePkr ?? 0);
  const promoDiscount = isInternational
    ? Number(order.promoDiscountUsd ?? 0)
    : Number(order.promoDiscountPkr ?? 0);
  const referralDiscount = isInternational
    ? Number(order.referralDiscountUsd ?? 0)
    : Number(order.referralDiscountPkr ?? 0);
  const creditsUsed = isInternational
    ? Number(order.creditsUsedUsd ?? 0)
    : Number(order.creditsUsedPkr ?? 0);
  const hasSavings = promoDiscount > 0 || referralDiscount > 0 || creditsUsed > 0;
  const formatCurrencyAmt = (val: number) =>
    isInternational ? `$${val.toFixed(2)} USD` : `PKR ${Math.round(val).toLocaleString()}`;
  const exactAmountLabel = formatCurrencyAmt(payableAmount);
  const parsedDeclaredPkr = Number(declaredAmountInput.replace(/,/g, '').trim());
  const declaredAmountValid =
    !isInternational &&
    declaredAmountInput.trim() !== '' &&
    Number.isFinite(parsedDeclaredPkr) &&
    parsedDeclaredPkr > 0 &&
    parsedDeclaredPkr <= 5000000;
  const declaredDiffersFromExpected =
    declaredAmountValid && Math.round(parsedDeclaredPkr) !== expectedTotalPkr;

  const qrUrl = isInternational
    ? order.qrImageUrl ||
      publicConfig?.binanceQrImages?.[order.planId] ||
      `/images/qr/${order.planId}-binance-qr.jpg`
    : order.qrImageUrl ||
      publicConfig?.qrImages?.[order.planId] ||
      `/images/qr/${order.planId}-qr.jpg`;
  const qrDownloadUrl = `/api/membership/qr/${encodeURIComponent(order.planId)}/download?region=${
    isInternational ? 'international' : 'pakistan'
  }`;

  const statusEntry = MEMBERSHIP_COPY.statuses[order.status] || MEMBERSHIP_COPY.statuses.awaiting_payment;

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    const validType =
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type) ||
      /\.(jpe?g|png|webp)$/i.test(lower);
    if (!validType) {
      setUploadError(
        isUrdu
          ? 'صرف JPG، JPEG، PNG یا WebP اسکرین شاٹ اپ لوڈ کیے جا سکتے ہیں۔'
          : 'Unsupported format. Please select a JPG, JPEG, PNG, or WebP screenshot.'
      );
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError(
        isUrdu
          ? 'فائل کا سائز 8 MB سے کم ہونا چاہیے۔'
          : 'Screenshot file size must be 8 MB or smaller.'
      );
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError(
        isUrdu
          ? 'براہ کرم ادائیگی کا اسکرین شاٹ منتخب کریں۔'
          : 'Please choose a payment confirmation screenshot before submitting.'
      );
      return;
    }

    if (!isInternational) {
      const cleaned = declaredAmountInput.replace(/,/g, '').trim();
      const parsed = Number(cleaned);
      if (!cleaned || !Number.isFinite(parsed) || parsed <= 0) {
        setUploadError(
          isUrdu
            ? 'براہ کرم بتائیں کہ آپ نے اصل میں کتنی رقم (PKR) ادا کی ہے۔'
            : 'Please enter a valid positive amount in PKR for "How much did you actually pay? (PKR)".'
        );
        return;
      }
      if (parsed > 5000000) {
        setUploadError(
          isUrdu
            ? 'درج کردہ رقم 5,000,000 PKR سے زیادہ نہیں ہو سکتی۔'
            : 'Declared payment amount cannot exceed PKR 5,000,000.'
        );
        return;
      }
    }

    setUploading(true);
    setUploadError(null);
    try {
      const proofDataUrl = await compressProofImageToDataUrl(selectedFile).catch(() => '');
      const declaredAmountPkr = !isInternational
        ? Math.round(Number(declaredAmountInput.replace(/,/g, '').trim()))
        : undefined;
      const res = await submitOrderPaymentProofFile({
        orderId: order.id,
        file: selectedFile,
        paymentNote,
        proofDataUrl: proofDataUrl || undefined,
        customerDeclaredAmountPkr: declaredAmountPkr,
        leaderboardDisplayName: order.leaderboardDisplayName,
        showExactAmount: order.showExactAmount,
      });

      if ('error' in res) {
        setUploadError(res.error || 'Failed to upload payment proof.');
        setUploading(false);
        return;
      }

      if (isFirebaseSignedInVerified()) {
        await syncOrderToFirestore(res.order, {
          member: res.account.member,
          proofDataUrl: proofDataUrl || res.order.proofDataUrl,
        }).catch(() => {});
        const latestHistory = res.account.history?.[0];
        if (latestHistory && latestHistory.orderId === res.order.id) {
          await syncHistoryEntryToFirestore(latestHistory).catch(() => {});
        }
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
      onProofSubmitted(res.account, res.order);
    } catch {
      setUploadError('Network error while uploading payment proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmFreeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmingFree(true);
    setUploadError(null);
    try {
      const res = await confirmZeroBalanceOrder({
        orderId: order.id,
        paymentNote,
      });
      if ('error' in res) {
        setUploadError(res.error || 'Could not confirm free order.');
        return;
      }
      if (isFirebaseSignedInVerified()) {
        await syncOrderToFirestore(res.order, { member: res.account.member }).catch(() => {});
        const latestHistory = res.account.history?.[0];
        if (latestHistory && latestHistory.orderId === res.order.id) {
          await syncHistoryEntryToFirestore(latestHistory).catch(() => {});
        }
      }
      onProofSubmitted(res.account, res.order);
    } catch {
      setUploadError('Network error while confirming zero-balance order. Please try again.');
    } finally {
      setConfirmingFree(false);
    }
  };

  const whatsappMessage = [
    'Assalam-o-Alaikum FEVIQO Team,',
    'I have paid for my FEVIQO Premium Membership and am sending my payment details:',
    `Request ID: ${order.id}`,
    `Order Type: ${isRenewal ? 'Membership Renewal' : 'New Membership'}`,
    `Payment Method: ${isInternational ? 'International Binance QR (USD)' : 'Pakistan Bank QR (PKR)'}`,
    `Name: ${member.fullName}`,
    `Email: ${member.email}`,
    member.phone ? `Phone: ${member.phone}` : '',
    `Plan: ${order.planName} (${order.durationDays} Days)`,
    !isInternational ? `Subscription Price: PKR ${subscriptionPricePkr.toLocaleString()}` : '',
    optionalContributionPkr > 0
      ? `Optional FEVIQO Contribution: PKR ${optionalContributionPkr.toLocaleString()}`
      : '',
    hasSavings ? `Original Price: ${formatCurrencyAmt(originalAmount)}` : '',
    order.promoCode ? `Promo Applied: ${order.promoCode} (-${formatCurrencyAmt(promoDiscount)})` : '',
    referralDiscount > 0 ? `Referral Discount: -${formatCurrencyAmt(referralDiscount)}` : '',
    creditsUsed > 0 ? `Wallet Credits Used: -${formatCurrencyAmt(creditsUsed)}` : '',
    `Expected Total: ${exactAmountLabel}`,
    typeof order.customerDeclaredAmountPkr === 'number' && order.customerDeclaredAmountPkr > 0
      ? `Declared Amount Transferred: PKR ${order.customerDeclaredAmountPkr.toLocaleString()}`
      : '',
    `Selected Drama(s): ${dramaTitlesText}`,
    isZeroBalance ? '(Zero-balance order confirmed on FEVIQO)' : '(Payment screenshot attached below)',
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappConfigured = Boolean(publicConfig?.whatsappConfigured && publicConfig?.whatsappDigits);
  const whatsappUrl = whatsappConfigured
    ? `https://wa.me/${publicConfig!.whatsappDigits}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const isPendingVerification = order.status === 'pending_verification';
  const isApproved = order.status === 'approved';
  const isRejected = order.status === 'rejected';

  return (
    <div
      id="bank-qr-payment-section"
      dir={dir}
      className="rounded-2xl bg-white border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-8"
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A] flex flex-wrap items-center gap-2">
            <span>
              {isInternational
                ? t(MEMBERSHIP_COPY.payment.stepTitleBinance)
                : t(MEMBERSHIP_COPY.payment.stepTitle)}
            </span>
            {isRenewal && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {t(MEMBERSHIP_COPY.payment.orderTypeRenewal)}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-[#0B0B0D]">
            {order.planName} Plan — <span dir="ltr">{exactAmountLabel}</span> ({order.durationDays}{' '}
            {isUrdu ? 'دن' : 'Days'})
          </h3>
          {isInternational && order.indicativeLocalDisplay && (
            <p className="text-xs text-zinc-500">
              {t(MEMBERSHIP_COPY.plans.approxLocalPrefix)}{' '}
              <span dir="ltr" className="font-semibold text-zinc-700">
                {order.indicativeLocalDisplay}
              </span>{' '}
              — {t(MEMBERSHIP_COPY.plans.exactUsdPayable)} <strong dir="ltr">{exactAmountLabel}</strong>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
              isApproved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isPendingVerification
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : isRejected
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-zinc-100 text-[#0B0B0D] border border-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {t(MEMBERSHIP_COPY.payment.paymentStatusLabel)}: {t(statusEntry)}
            </span>
          </span>
        </div>
      </div>

      {/* Confirmation Banner when proof already submitted */}
      {isPendingVerification && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-amber-950">
              <p className="font-semibold leading-relaxed">{MEMBERSHIP_COPY.payment.pendingConfirmEn}</p>
              <p dir="rtl" className="font-urdu-slim text-base text-amber-900 leading-relaxed">
                {MEMBERSHIP_COPY.payment.pendingConfirmUr}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onViewMyAccount}
              className="px-4 py-2 rounded-xl bg-[#0B0B0D] text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
            >
              {t(MEMBERSHIP_COPY.subbar.myAccountTab)}
            </button>
          </div>
        </div>
      )}

      {/* Admin Correction / New Screenshot Requested Alert */}
      {order.status === 'awaiting_payment' && order.correctionRequestNote && (
        <div role="alert" className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-5 space-y-2">
          <div className="flex items-start gap-2.5 text-sm font-bold text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <span>
              {isUrdu
                ? 'ایڈمن نے نیا اسکرین شاٹ / تصحیح طلب کی ہے'
                : 'New Payment Screenshot / Correction Requested by Admin'}
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed pl-7">
            <strong>{isUrdu ? 'ایڈمن نوٹ:' : 'Admin Note:'}</strong> {order.correctionRequestNote}
          </p>
        </div>
      )}

      {/* Rejection Alert */}
      {isRejected && (
        <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 p-5 space-y-2">
          <div className="flex items-start gap-2.5 text-sm font-semibold text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{t(MEMBERSHIP_COPY.account.rejectedBannerPrefix)}</span>
          </div>
          {order.rejectionReason && (
            <p className="text-xs text-red-700">
              <strong>{t(MEMBERSHIP_COPY.account.rejectionReasonLabel)}</strong> {order.rejectionReason}
            </p>
          )}
        </div>
      )}

      {/* 2-Column QR + Summary & Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Exact Uncropped Plan Bank OR Binance QR Code (or Zero-Balance Confirmation Notice) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#F8FAFC] border border-zinc-200 p-6 space-y-5 text-center">
          {isZeroBalance ? (
            <div className="py-6 px-3 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-[#0B0B0D]">
                  {t(MEMBERSHIP_COPY.promo.zeroBalanceTitle)}
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {t(MEMBERSHIP_COPY.promo.zeroBalanceDesc)}
                </p>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-4 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-600">
                  <span>{t(MEMBERSHIP_COPY.promo.originalPrice)}</span>
                  <span dir="ltr" className="line-through">{formatCurrencyAmt(originalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#16A34A] text-sm">
                  <span>{t(MEMBERSHIP_COPY.promo.netPayable)}</span>
                  <span dir="ltr">{exactAmountLabel}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#16A34A] inline-flex items-center justify-center gap-1.5">
                {isInternational && <Globe className="w-3.5 h-3.5" />}
                <span>
                  {isInternational
                    ? t(MEMBERSHIP_COPY.payment.binanceQrHeading)
                    : t(MEMBERSHIP_COPY.payment.qrHeading)}
                </span>
              </div>

              {qrUrl ? (
                <>
                  <div className="mx-auto max-w-[300px] bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs flex items-center justify-center">
                    <img
                      src={qrUrl}
                      alt={`${order.planName} ${isInternational ? 'Binance' : 'Bank'} QR Code — ${exactAmountLabel}`}
                      className="w-full h-auto max-h-[340px] object-contain block"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <a
                    href={qrDownloadUrl}
                    download={
                      isInternational
                        ? `FEVIQO-${order.planName}-Binance-${usdAmount.toFixed(2)}USD-QR.png`
                        : `FEVIQO-${order.planName}-${order.amountPkr}PKR-QR.jpg`
                    }
                    className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-[#0B0B0D] text-xs font-semibold inline-flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-[#16A34A]" />
                    <span>{t(MEMBERSHIP_COPY.payment.downloadQr)}</span>
                  </a>
                </>
              ) : (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-xs text-amber-900 space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-700 mx-auto" />
                  <p className="font-semibold leading-relaxed">
                    {t(MEMBERSHIP_COPY.payment.binanceQrMissing)}
                  </p>
                </div>
              )}

              <div className="text-left space-y-2.5 pt-2 border-t border-zinc-200">
                <p className="text-xs font-semibold text-[#0B0B0D] leading-relaxed">
                  {isInternational
                    ? publicConfig?.internationalInstructionsEn ||
                      MEMBERSHIP_COPY.payment.binanceInstructionEn
                    : MEMBERSHIP_COPY.payment.scanInstructionEn}
                </p>
                <p dir="rtl" className="font-urdu-slim text-sm text-zinc-700 leading-relaxed">
                  {isInternational
                    ? publicConfig?.internationalInstructionsUr ||
                      MEMBERSHIP_COPY.payment.binanceInstructionUr
                    : MEMBERSHIP_COPY.payment.scanInstructionUr}
                </p>
              </div>

              <div className="rounded-xl bg-white border border-zinc-200 p-3.5 text-left space-y-1.5">
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  {MEMBERSHIP_COPY.payment.mobileNoteEn}
                </p>
                <p dir="rtl" className="font-urdu-slim text-xs text-zinc-600 leading-relaxed">
                  {MEMBERSHIP_COPY.payment.mobileNoteUr}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right: Payment Details Summary + Screenshot Proof Upload + WhatsApp Option */}
        <div className="lg:col-span-7 space-y-6">
          {/* Payment Details Grid */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
              {t(MEMBERSHIP_COPY.payment.orderSummaryHeading)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.planLabel)}</div>
                <div className="font-bold text-[#0B0B0D] mt-0.5 text-sm">{order.planName}</div>
              </div>
              <div>
                <div className="text-zinc-500">
                  {isUrdu ? 'متوقع کل رقم' : 'Expected Total Payable'}
                </div>
                <div className="font-bold text-[#16A34A] mt-0.5 text-sm tabular-nums" dir="ltr">
                  {exactAmountLabel}
                </div>
              </div>
              {!isInternational && (optionalContributionPkr > 0 || typeof order.customerDeclaredAmountPkr === 'number') && (
                <div className="sm:col-span-2 rounded-xl bg-zinc-50 border border-zinc-200 p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>{isUrdu ? 'سبسکرپشن پلان کی قیمت' : 'Subscription Price'}</span>
                    <span dir="ltr" className="font-semibold text-[#0B0B0D] tabular-nums">
                      PKR {subscriptionPricePkr.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>{isUrdu ? 'اختیاری تعاون (Support FEVIQO)' : 'Optional Extra Contribution'}</span>
                    <span dir="ltr" className="font-semibold text-[#16A34A] tabular-nums">
                      {optionalContributionPkr > 0
                        ? `+ PKR ${optionalContributionPkr.toLocaleString()}`
                        : 'PKR 0'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-zinc-200 font-bold text-[#0B0B0D]">
                    <span>{isUrdu ? 'متوقع کل رقم' : 'Expected Total'}</span>
                    <span dir="ltr" className="tabular-nums text-[#16A34A]">
                      PKR {expectedTotalPkr.toLocaleString()}
                    </span>
                  </div>
                  {typeof order.customerDeclaredAmountPkr === 'number' && order.customerDeclaredAmountPkr > 0 && (
                    <div className="flex justify-between pt-1 border-t border-zinc-200/80 text-zinc-700">
                      <span>{isUrdu ? 'آپ کی درج کردہ ادا شدہ رقم' : 'Your Declared Amount Paid'}</span>
                      <span dir="ltr" className="font-bold text-[#0B0B0D] tabular-nums">
                        PKR {order.customerDeclaredAmountPkr.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {optionalContributionPkr > 0 && (
                    <div className="pt-1 text-[11px] text-zinc-500 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Leaderboard Name:{' '}
                        <strong className="text-zinc-800">
                          {order.leaderboardDisplayName || 'Anonymous Patron'}
                        </strong>
                      </span>
                      <span>
                        Amount Visibility:{' '}
                        <strong className="text-zinc-800">
                          {order.showExactAmount === false ? 'Amount Hidden' : 'Show Exact Amount'}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
              {hasSavings && (
                <div className="sm:col-span-2 rounded-xl bg-emerald-50/70 border border-emerald-200 p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>{t(MEMBERSHIP_COPY.promo.originalPrice)}</span>
                    <span dir="ltr" className="tabular-nums">{formatCurrencyAmt(originalAmount)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-[#16A34A] font-semibold">
                      <span>
                        {t(MEMBERSHIP_COPY.promo.promoDiscount)}
                        {order.promoCode ? ` (${order.promoCode})` : ''}
                      </span>
                      <span dir="ltr" className="tabular-nums">-{formatCurrencyAmt(promoDiscount)}</span>
                    </div>
                  )}
                  {referralDiscount > 0 && (
                    <div className="flex justify-between text-[#16A34A] font-semibold">
                      <span>{t(MEMBERSHIP_COPY.promo.referralDiscount)}</span>
                      <span dir="ltr" className="tabular-nums">-{formatCurrencyAmt(referralDiscount)}</span>
                    </div>
                  )}
                  {creditsUsed > 0 && (
                    <div className="flex justify-between text-[#16A34A] font-semibold">
                      <span>{t(MEMBERSHIP_COPY.promo.walletCredits)}</span>
                      <span dir="ltr" className="tabular-nums">-{formatCurrencyAmt(creditsUsed)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-emerald-200 font-bold text-[#0B0B0D]">
                    <span>{t(MEMBERSHIP_COPY.promo.netPayable)}</span>
                    <span dir="ltr" className="tabular-nums text-[#16A34A]">{exactAmountLabel}</span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.paymentMethodLabel)}</div>
                <div className="font-semibold text-[#0B0B0D] mt-0.5">
                  {isInternational
                    ? t(MEMBERSHIP_COPY.payment.methodBinanceQr)
                    : t(MEMBERSHIP_COPY.payment.methodBankQr)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.orderTypeLabel)}</div>
                <div className="font-semibold text-[#0B0B0D] mt-0.5">
                  {isRenewal
                    ? t(MEMBERSHIP_COPY.payment.orderTypeRenewal)
                    : t(MEMBERSHIP_COPY.payment.orderTypeNew)}
                </div>
              </div>
              {isInternational && order.indicativeLocalDisplay && (
                <div className="sm:col-span-2 rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2">
                  <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.indicativeLocalLabel)}</div>
                  <div className="font-semibold text-[#0B0B0D] mt-0.5" dir="ltr">
                    {order.indicativeLocalDisplay}{' '}
                    <span className="text-zinc-500 font-normal">
                      ({MEMBERSHIP_COPY.plans.exactUsdPayable.en} {exactAmountLabel})
                    </span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.durationLabel)}</div>
                <div className="font-semibold text-[#0B0B0D] mt-0.5">
                  {order.durationDays} {isUrdu ? 'دن' : 'Days'}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.requestIdLabel)}</div>
                <div className="font-mono text-[#0B0B0D] mt-0.5 break-all" dir="ltr">
                  {order.id}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.customerNameLabel)}</div>
                <div className="font-semibold text-[#0B0B0D] mt-0.5">{member.fullName}</div>
              </div>
              <div>
                <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.customerEmailLabel)}</div>
                <div className="font-semibold text-[#0B0B0D] mt-0.5 break-all" dir="ltr">
                  {member.email}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.dramasLabel)}</div>
                <div className="font-semibold text-[#0B0B0D] mt-0.5">{dramaTitlesText}</div>
              </div>
            </div>
          </div>

          {/* Proof Upload Form OR Zero-Balance Confirmation Form */}
          {!isApproved && isZeroBalance && !isPendingVerification ? (
            <form
              onSubmit={handleConfirmFreeOrder}
              className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-[#0B0B0D]">
                  {t(MEMBERSHIP_COPY.promo.zeroBalanceTitle)}
                </h4>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {t(MEMBERSHIP_COPY.promo.zeroBalanceDesc)}
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700">
                  {t(MEMBERSHIP_COPY.payment.noteLabel)}
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder={t(MEMBERSHIP_COPY.payment.notePlaceholder)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
                />
              </div>
              {uploadError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={confirmingFree}
                className="w-full py-3.5 px-5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white disabled:opacity-50 text-sm font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {confirmingFree
                    ? t(MEMBERSHIP_COPY.promo.confirmingFreeBtn)
                    : t(MEMBERSHIP_COPY.promo.zeroBalanceBtn)}
                </span>
              </button>
            </form>
          ) : !isApproved && !isZeroBalance && (
            <form
              id="payment-screenshot-upload-box"
              onSubmit={handleSubmitProof}
              className="rounded-2xl border-2 border-[#22C55E] bg-[#F8FAFC] p-5 sm:p-6 space-y-4 shadow-xs"
            >
              {order.status === 'awaiting_payment' && (
                <div className="rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold">
                      {isUrdu
                        ? 'ادائیگی کا اسکرین شاٹ اپ لوڈ کرنا لازمی ہے'
                        : 'Payment Screenshot Required to Continue'}
                    </div>
                    <p className="text-amber-900 leading-relaxed">
                      {isUrdu
                        ? 'براہ کرم ادائیگی مکمل کریں اور آگے بڑھنے کے لیے نیچے ادائیگی کا اسکرین شاٹ لازمی جمع کروائیں۔ اسکرین شاٹ اپ لوڈ کیے بغیر آرڈر مکمل نہیں ہوگا۔'
                        : 'Please complete your payment via the QR code and upload your payment confirmation screenshot below. You must submit your screenshot at this step to continue.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-[#0B0B0D]">
                  {t(MEMBERSHIP_COPY.payment.proofHeading)} <span className="text-red-600">*</span>
                </h4>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {MEMBERSHIP_COPY.payment.uploadInstructionEn}
                </p>
                <p dir="rtl" className="font-urdu-slim text-sm text-zinc-700 leading-relaxed">
                  {MEMBERSHIP_COPY.payment.uploadInstructionUr}
                </p>
                <div className="text-[11px] text-zinc-500">{t(MEMBERSHIP_COPY.payment.allowedFormats)}</div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                onChange={handleFilePicked}
                className="sr-only"
                id={`proof-file-${order.id}`}
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-zinc-300 bg-white p-3 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Selected payment proof preview"
                      className="w-32 h-32 object-contain rounded-lg border border-zinc-200 bg-zinc-50 shrink-0"
                    />
                    <div className="flex-1 space-y-2 text-xs">
                      <div className="font-semibold text-[#0B0B0D] break-all" dir="ltr">
                        {selectedFile?.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-[#0B0B0D] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{t(MEMBERSHIP_COPY.payment.replaceScreenshot)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 px-4 rounded-xl border-2 border-dashed border-zinc-300 hover:border-[#22C55E] bg-white transition flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-6 h-6 text-[#16A34A]" />
                  <span className="text-sm font-semibold text-[#0B0B0D]">
                    {t(MEMBERSHIP_COPY.payment.chooseScreenshot)}
                  </span>
                  <span className="text-xs text-zinc-500">JPG, JPEG, PNG, WebP (Required)</span>
                </button>
              )}

              {/* Customer Payment Declaration Field (Required for PKR Bank QR) */}
              {!isInternational && (
                <div className="rounded-xl bg-white border border-zinc-200 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-2 border-b border-zinc-100">
                    <span className="text-zinc-600">
                      Subscription: <strong className="text-[#0B0B0D] tabular-nums">PKR {subscriptionPricePkr.toLocaleString()}</strong>
                      {optionalContributionPkr > 0 && (
                        <>
                          {' '}+ Contribution:{' '}
                          <strong className="text-[#16A34A] tabular-nums">
                            PKR {optionalContributionPkr.toLocaleString()}
                          </strong>
                        </>
                      )}
                    </span>
                    <span className="font-bold text-[#16A34A] tabular-nums" dir="ltr">
                      Expected Total: PKR {expectedTotalPkr.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`declared-amount-${order.id}`}
                      className="block text-xs font-bold text-[#0B0B0D]"
                    >
                      How much did you actually pay? (PKR) <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                        PKR
                      </span>
                      <input
                        id={`declared-amount-${order.id}`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={5000000}
                        step={1}
                        required
                        dir="ltr"
                        value={declaredAmountInput}
                        onChange={(e) => {
                          setDeclaredAmountInput(e.target.value);
                          setUploadError(null);
                        }}
                        placeholder={`e.g. ${expectedTotalPkr}`}
                        className="w-full pl-12 pr-3.5 py-2.5 text-sm font-semibold tabular-nums bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Enter the exact total amount you transferred via bank transfer. Your payment
                      will be manually verified by an admin before membership activation.
                    </p>
                    {declaredDiffersFromExpected && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-900">
                        Note: Your entered amount (PKR{' '}
                        <span className="font-bold tabular-nums">
                          {Math.round(parsedDeclaredPkr).toLocaleString()}
                        </span>
                        ) differs from the expected total (PKR{' '}
                        <span className="font-bold tabular-nums">
                          {expectedTotalPkr.toLocaleString()}
                        </span>
                        ). You can still submit — our admin will verify the exact received amount
                        from your screenshot.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700">
                  {t(MEMBERSHIP_COPY.payment.noteLabel)}
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder={t(MEMBERSHIP_COPY.payment.notePlaceholder)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
                />
              </div>

              {uploadError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                onClick={(e) => {
                  if (!selectedFile) {
                    e.preventDefault();
                    setUploadError(
                      isUrdu
                        ? 'آگے بڑھنے سے پہلے براہ کرم ادائیگی کا اسکرین شاٹ منتخب اور اپ لوڈ کریں۔'
                        : 'Please select and upload your payment confirmation screenshot before continuing.'
                    );
                    fileInputRef.current?.click();
                  }
                }}
                className="w-full py-3.5 px-5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white disabled:opacity-50 text-sm font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {uploading
                    ? t(MEMBERSHIP_COPY.payment.submittingProof)
                    : t(MEMBERSHIP_COPY.payment.submitProof)}
                </span>
              </button>
            </form>
          )}

          {/* Optional Secondary WhatsApp Option (only after proof is uploaded or for zero-balance orders) */}
          {(isPendingVerification || isApproved || isZeroBalance || Boolean(order.proofFileName || order.proofDataUrl)) && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                {t(MEMBERSHIP_COPY.payment.whatsappAltHeading)}
              </div>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl border border-zinc-300 hover:border-[#22C55E] hover:bg-emerald-50 text-[#0B0B0D] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                  <span>{t(MEMBERSHIP_COPY.payment.whatsappButton)}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setWhatsappNotice(t(MEMBERSHIP_COPY.payment.whatsappUnconfigured))}
                  className="w-full py-3 px-4 rounded-xl border border-zinc-300 hover:border-[#22C55E] hover:bg-emerald-50 text-[#0B0B0D] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                  <span>{t(MEMBERSHIP_COPY.payment.whatsappButton)}</span>
                </button>
              )}

              <p className="text-[11px] text-zinc-600 leading-relaxed">
                {MEMBERSHIP_COPY.payment.whatsappNoteEn}
              </p>
              <p dir="rtl" className="font-urdu-slim text-xs text-zinc-600 leading-relaxed">
                {MEMBERSHIP_COPY.payment.whatsappNoteUr}
              </p>

              {whatsappNotice && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  {whatsappNotice}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

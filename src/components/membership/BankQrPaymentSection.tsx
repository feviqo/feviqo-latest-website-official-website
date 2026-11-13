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
} from 'lucide-react';
import {
  MembershipOrder,
  SafeMember,
  PublicMembershipConfig,
  MemberAccountState,
  submitOrderPaymentProofFile,
} from '../../services/membershipService';
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [whatsappNotice, setWhatsappNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const dramaTitlesList = order.selectedDramaIds.map((id) => getDramaById(id)?.title || id);
  const dramaTitlesText = dramaTitlesList.join(', ');

  const qrUrl =
    order.qrImageUrl ||
    publicConfig?.qrImages?.[order.planId] ||
    `/images/qr/${order.planId}-qr.jpg`;
  const qrDownloadUrl = `/api/membership/qr/${encodeURIComponent(order.planId)}/download`;

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

    setUploading(true);
    setUploadError(null);
    try {
      const res = await submitOrderPaymentProofFile({
        orderId: order.id,
        file: selectedFile,
        paymentNote,
      });

      if ('error' in res) {
        setUploadError(res.error || 'Failed to upload payment proof.');
        setUploading(false);
        return;
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

  const whatsappMessage = [
    'Assalam-o-Alaikum FEVIQO Team,',
    'I have paid for my FEVIQO Premium Membership and am sending my payment details:',
    `Request ID: ${order.id}`,
    `Name: ${member.fullName}`,
    `Email: ${member.email}`,
    member.phone ? `Phone: ${member.phone}` : '',
    `Plan: ${order.planName} (${order.durationDays} Days)`,
    `Amount Paid: PKR ${order.amountPkr.toLocaleString()}`,
    `Selected Drama(s): ${dramaTitlesText}`,
    '(Payment screenshot attached below)',
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
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
            {t(MEMBERSHIP_COPY.payment.stepTitle)}
          </div>
          <h3 className="text-2xl font-bold text-[#0B0B0D]">
            {order.planName} Plan — <span dir="ltr">PKR {order.amountPkr.toLocaleString()}</span> ({order.durationDays}{' '}
            {isUrdu ? 'دن' : 'Days'})
          </h3>
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
        {/* Left: Exact Uncropped Plan Bank QR Code */}
        <div className="lg:col-span-5 rounded-2xl bg-[#F8FAFC] border border-zinc-200 p-6 space-y-5 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#16A34A]">
            {t(MEMBERSHIP_COPY.payment.qrHeading)}
          </div>

          <div className="mx-auto max-w-[300px] bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs flex items-center justify-center">
            <img
              src={qrUrl}
              alt={`${order.planName} Bank QR Code — PKR ${order.amountPkr}`}
              className="w-full h-auto max-h-[340px] object-contain block"
              referrerPolicy="no-referrer"
            />
          </div>

          <a
            href={qrDownloadUrl}
            download={`FEVIQO-${order.planName}-${order.amountPkr}PKR-QR.jpg`}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-[#0B0B0D] text-xs font-semibold inline-flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-[#16A34A]" />
            <span>{t(MEMBERSHIP_COPY.payment.downloadQr)}</span>
          </a>

          <div className="text-left space-y-2.5 pt-2 border-t border-zinc-200">
            <p className="text-xs font-semibold text-[#0B0B0D] leading-relaxed">
              {MEMBERSHIP_COPY.payment.scanInstructionEn}
            </p>
            <p dir="rtl" className="font-urdu-slim text-sm text-zinc-700 leading-relaxed">
              {MEMBERSHIP_COPY.payment.scanInstructionUr}
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
                <div className="text-zinc-500">{t(MEMBERSHIP_COPY.payment.totalAmountLabel)}</div>
                <div className="font-bold text-[#16A34A] mt-0.5 text-sm tabular-nums" dir="ltr">
                  PKR {order.amountPkr.toLocaleString()}
                </div>
              </div>
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

          {/* Proof Upload Form */}
          {!isApproved && (
            <form
              onSubmit={handleSubmitProof}
              className="rounded-2xl border border-zinc-200 bg-[#F8FAFC] p-5 sm:p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-[#0B0B0D]">
                  {t(MEMBERSHIP_COPY.payment.proofHeading)}
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
                  <span className="text-xs text-zinc-500">JPG, JPEG, PNG, WebP</span>
                </button>
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
                disabled={uploading || !selectedFile}
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

          {/* Optional Secondary WhatsApp Option */}
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
        </div>
      </div>
    </div>
  );
};

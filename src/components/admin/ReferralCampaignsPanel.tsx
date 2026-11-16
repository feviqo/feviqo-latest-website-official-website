import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2,
  Plus,
  Copy,
  Check,
  BarChart3,
  Pause,
  Play,
  Ban,
  Edit2,
  Download,
  Calendar,
  DollarSign,
  Users,
  MousePointerClick,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowLeft,
  Save,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  AdminReferralCampaignsOverview,
  CampaignCommissionRecord,
  MonthlyCommissionReportRow,
  MonthlyCommissionReportSnapshot,
  ReferralCampaignDetail,
  ReferralCampaignStatus,
  approveAdminCampaignCommission,
  createAdminReferralCampaign,
  downloadAdminMonthlyCommissionCsv,
  fetchAdminMonthlyCommissionReport,
  fetchAdminReferralCampaignDetail,
  fetchAdminReferralCampaignsOverview,
  markAdminCampaignCommissionsPaid,
  reverseAdminCampaignCommission,
  saveAdminMonthlyCommissionReportSnapshot,
  updateAdminReferralCampaign,
} from '../../services/membershipService';

interface ReferralCampaignsPanelProps {
  onSuccessMessage?: (msg: string) => void;
  onErrorMessage?: (msg: string) => void;
}

function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatPkr(amount: number): string {
  return `PKR ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export const ReferralCampaignsPanel: React.FC<ReferralCampaignsPanelProps> = ({
  onSuccessMessage,
  onErrorMessage,
}) => {
  const [subTab, setSubTab] = useState<'campaigns' | 'detail' | 'monthly'>('campaigns');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AdminReferralCampaignsOverview | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReferralCampaignDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // Create campaign state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createPartnerName, setCreatePartnerName] = useState('');
  const [createPartnerEmail, setCreatePartnerEmail] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createRate, setCreateRate] = useState('2');
  const [createWindowDays, setCreateWindowDays] = useState('30');
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');
  const [createStatus, setCreateStatus] = useState<ReferralCampaignStatus>('active');

  // Edit campaign state
  const [editingDetail, setEditingDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPartnerName, setEditPartnerName] = useState('');
  const [editPartnerEmail, setEditPartnerEmail] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRate, setEditRate] = useState('2');
  const [editWindowDays, setEditWindowDays] = useState('30');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  // Monthly report state
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [monthlyRows, setMonthlyRows] = useState<MonthlyCommissionReportRow[]>([]);
  const [monthlySnapshot, setMonthlySnapshot] = useState<MonthlyCommissionReportSnapshot | null>(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // Payout modal state
  const [payoutModal, setPayoutModal] = useState<{
    isOpen: boolean;
    commissionIds: string[];
    title: string;
    totalPkr: number;
  } | null>(null);
  const [payoutDate, setPayoutDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Reverse reason prompt modal
  const [reverseModal, setReverseModal] = useState<{
    commissionId: string;
    orderId: string;
  } | null>(null);
  const [reverseReason, setReverseReason] = useState('Order refunded or disqualified by admin');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminReferralCampaignsOverview();
      if (res.success) {
        setOverview(res);
      } else {
        onErrorMessage?.(('error' in res ? res.error : undefined) || 'Failed to load referral campaigns.');
      }
    } catch {
      onErrorMessage?.('Network error loading referral campaigns.');
    } finally {
      setLoading(false);
    }
  }, [onErrorMessage]);

  const loadMonthlyReport = useCallback(
    async (monthKey: string) => {
      setLoadingMonthly(true);
      try {
        const res = await fetchAdminMonthlyCommissionReport(monthKey);
        if (res.success && res.rows) {
          setMonthlyRows(res.rows);
          setMonthlySnapshot(res.snapshot || null);
        } else {
          onErrorMessage?.(res.error || 'Failed to load monthly commission report.');
        }
      } catch {
        onErrorMessage?.('Network error loading monthly commission report.');
      } finally {
        setLoadingMonthly(false);
      }
    },
    [onErrorMessage]
  );

  const openCampaignDetail = useCallback(
    async (campaignId: string) => {
      setSelectedCampaignId(campaignId);
      setSubTab('detail');
      setLoadingDetail(true);
      setEditingDetail(false);
      try {
        const res = await fetchAdminReferralCampaignDetail(campaignId);
        if (res.success) {
          setDetail(res);
          setEditName(res.campaign.name);
          setEditPartnerName(res.campaign.partnerName);
          setEditPartnerEmail(res.campaign.partnerEmail || '');
          setEditSlug(res.campaign.slug);
          setEditDescription(res.campaign.description || '');
          setEditRate(String(res.campaign.commissionRatePercent));
          setEditWindowDays(String(res.campaign.attributionWindowDays));
          setEditStartDate(res.campaign.startDate ? res.campaign.startDate.slice(0, 10) : '');
          setEditEndDate(res.campaign.endDate ? res.campaign.endDate.slice(0, 10) : '');
        } else {
          onErrorMessage?.(('error' in res ? res.error : undefined) || 'Failed to load campaign analytics.');
        }
      } catch {
        onErrorMessage?.('Network error loading campaign analytics.');
      } finally {
        setLoadingDetail(false);
      }
    },
    [onErrorMessage]
  );

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (subTab === 'monthly') {
      loadMonthlyReport(selectedMonth);
    }
  }, [subTab, selectedMonth, loadMonthlyReport]);

  const handleCopyUrl = async (url: string, key: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(key);
      setTimeout(() => setCopiedSlug(null), 2000);
      onSuccessMessage?.(`Copied ${url}`);
    } catch {
      onErrorMessage?.('Unable to copy link to clipboard.');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyAction('create');
    try {
      const res = await createAdminReferralCampaign({
        name: createName.trim(),
        partnerName: createPartnerName.trim(),
        partnerEmail: createPartnerEmail.trim() || undefined,
        description: createDescription.trim(),
        slug: createSlug.trim().toLowerCase(),
        commissionRatePercent: Number(createRate),
        attributionWindowDays: Number(createWindowDays),
        startDate: createStartDate || undefined,
        endDate: createEndDate || undefined,
        status: createStatus,
      });
      if (res.success) {
        setOverview(res.overview);
        setShowCreateForm(false);
        setCreateName('');
        setCreatePartnerName('');
        setCreatePartnerEmail('');
        setCreateSlug('');
        setCreateDescription('');
        setCreateRate('2');
        setCreateWindowDays('30');
        setCreateStartDate('');
        setCreateEndDate('');
        onSuccessMessage?.(`Campaign "${res.campaign.name}" created (${res.campaign.referralUrl}).`);
      } else {
        onErrorMessage?.(('error' in res ? res.error : undefined) || 'Unable to create campaign.');
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveCampaignEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setBusyAction('edit-campaign');
    try {
      const res = await updateAdminReferralCampaign(detail.campaign.id, {
        name: editName.trim(),
        partnerName: editPartnerName.trim(),
        partnerEmail: editPartnerEmail.trim(),
        slug: editSlug.trim().toLowerCase(),
        description: editDescription.trim(),
        commissionRatePercent: Number(editRate),
        attributionWindowDays: Number(editWindowDays),
        startDate: editStartDate || '',
        endDate: editEndDate || '',
      });
      if (res.success) {
        setOverview(res.overview);
        setEditingDetail(false);
        await openCampaignDetail(detail.campaign.id);
        onSuccessMessage?.(`Updated campaign "${res.campaign.name}".`);
      } else {
        onErrorMessage?.(('error' in res ? res.error : undefined) || 'Failed to update campaign.');
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleCampaignStatusChange = async (
    campaignId: string,
    status: ReferralCampaignStatus
  ) => {
    setBusyAction(`status-${campaignId}`);
    try {
      const res = await updateAdminReferralCampaign(campaignId, { status });
      if (res.success) {
        setOverview(res.overview);
        if (detail && detail.campaign.id === campaignId) {
          await openCampaignDetail(campaignId);
        }
        onSuccessMessage?.(`Campaign status changed to ${status}.`);
      } else {
        onErrorMessage?.(('error' in res ? res.error : undefined) || 'Failed to update campaign status.');
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleApproveCommission = async (commissionId: string) => {
    setBusyAction(`approve-${commissionId}`);
    try {
      const res = await approveAdminCampaignCommission(commissionId);
      if (res.success) {
        setOverview(res.overview);
        if (selectedCampaignId) await openCampaignDetail(selectedCampaignId);
        if (subTab === 'monthly') await loadMonthlyReport(selectedMonth);
        onSuccessMessage?.('Commission approved for partner payout.');
      } else {
        onErrorMessage?.(('error' in res ? res.error : undefined) || 'Unable to approve commission.');
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModal) return;
    setBusyAction('mark-paid');
    try {
      const res = await markAdminCampaignCommissionsPaid({
        commissionIds: payoutModal.commissionIds,
        paymentDate: payoutDate,
        paymentMethod: payoutMethod.trim(),
        paymentReference: payoutRef.trim(),
        notes: payoutNotes.trim(),
      });
      if (res.success) {
        setOverview(res.overview);
        setPayoutModal(null);
        setPayoutRef('');
        setPayoutNotes('');
        if (selectedCampaignId) await openCampaignDetail(selectedCampaignId);
        if (subTab === 'monthly') await loadMonthlyReport(selectedMonth);
        onSuccessMessage?.(`Recorded commission payout (${formatPkr(res.payment.totalAmountPkr)}).`);
      } else {
        onErrorMessage?.(('error' in res ? res.error : undefined) || 'Failed to record commission payout.');
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmReverse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reverseModal) return;
    setBusyAction(`reverse-${reverseModal.commissionId}`);
    try {
      const res = await reverseAdminCampaignCommission(
        reverseModal.commissionId,
        reverseReason.trim()
      );
      if (res.success) {
        setOverview(res.overview);
        setReverseModal(null);
        if (selectedCampaignId) await openCampaignDetail(selectedCampaignId);
        if (subTab === 'monthly') await loadMonthlyReport(selectedMonth);
        onSuccessMessage?.(`Commission for order ${reverseModal.orderId} reversed.`);
      } else {
        onErrorMessage?.(('error' in res ? res.error : undefined) || 'Unable to reverse commission.');
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveSnapshot = async () => {
    setBusyAction('save-snapshot');
    try {
      const res = await saveAdminMonthlyCommissionReportSnapshot(selectedMonth);
      if (res.success) {
        if (res.overview) setOverview(res.overview);
        if (res.snapshot) setMonthlySnapshot(res.snapshot);
        onSuccessMessage?.(`Saved permanent monthly report snapshot for ${selectedMonth}.`);
      } else {
        onErrorMessage?.(res.error || 'Failed to save monthly snapshot.');
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleDownloadCsv = async () => {
    setBusyAction('csv');
    const ok = await downloadAdminMonthlyCommissionCsv(selectedMonth);
    setBusyAction(null);
    if (ok) {
      onSuccessMessage?.(`Exported CSV report for ${selectedMonth}.`);
    } else {
      onErrorMessage?.('Failed to download CSV commission report.');
    }
  };

  const openCampaignMonthPayout = (campaignId: string, campaignName: string, monthKey: string) => {
    if (!overview) return;
    const eligible = overview.commissions.filter(
      (c) =>
        c.campaignId === campaignId &&
        c.monthKey === monthKey &&
        (c.status === 'pending' || c.status === 'approved')
    );
    if (eligible.length === 0) {
      onErrorMessage?.(`No unpaid pending/approved commissions found for ${campaignName} in ${monthKey}.`);
      return;
    }
    const totalPkr = eligible.reduce((s, c) => s + Number(c.commissionAmountPkr || 0), 0);
    setPayoutModal({
      isOpen: true,
      commissionIds: eligible.map((c) => c.id),
      title: `Pay ${campaignName} (${monthKey})`,
      totalPkr,
    });
  };

  const previewSlug = createSlug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const statusTextClass = (status: ReferralCampaignStatus) => {
    if (status === 'active') return 'text-emerald-700 font-semibold';
    if (status === 'paused') return 'text-amber-700 font-semibold';
    return 'text-red-700 font-semibold';
  };

  const commissionStatusClass = (status: CampaignCommissionRecord['status']) => {
    if (status === 'paid') return 'text-emerald-700 font-semibold';
    if (status === 'approved') return 'text-blue-700 font-semibold';
    if (status === 'pending') return 'text-amber-700 font-semibold';
    return 'text-red-700 font-semibold';
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A]">
            Partner Attribution &amp; Commission Ledger (Independent of Promo Codes)
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            Referral Campaigns &amp; Link Analytics
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Create partner referral URLs with independent editable slugs (such as{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[#0F172A] font-mono">
              https://feviqo.com/?ref=kameer-play
            </code>
            ), track clicks and unique visitors, preserve 30-day attribution without promo codes, and
            manage verified partner commissions &amp; monthly payouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              loadOverview();
              if (subTab === 'detail' && selectedCampaignId) openCampaignDetail(selectedCampaignId);
              if (subTab === 'monthly') loadMonthlyReport(selectedMonth);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubTab('campaigns');
              setShowCreateForm((prev) => !prev);
            }}
            className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showCreateForm ? 'Close Form' : 'New Referral Campaign'}</span>
          </button>
        </div>
      </div>

      {/* Totals KPI Row */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 space-y-1">
            <div className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Total Clicks / Unique</span>
            </div>
            <div className="text-xl font-bold text-[#0F172A] tabular-nums">
              {overview.totals.totalClicks} · {overview.totals.uniqueVisitors}
            </div>
            <div className="text-xs text-slate-400">
              {overview.totals.activeCampaigns} / {overview.totals.totalCampaigns} campaigns active
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 space-y-1">
            <div className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Registrations · Paid</span>
            </div>
            <div className="text-xl font-bold text-[#0F172A] tabular-nums">
              {overview.totals.registeredUsers} · {overview.totals.successfulPaidMemberships}
            </div>
            <div className="text-xs text-slate-400">
              {overview.totals.checkoutAttempts} checkout attempts
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 space-y-1">
            <div className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Verified Revenue</span>
            </div>
            <div className="text-xl font-bold text-[#0F172A] tabular-nums">
              {formatPkr(overview.totals.revenueGeneratedPkr)}
            </div>
            <div className="text-xs text-slate-400">Paid &amp; verified orders only</div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 space-y-1">
            <div className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Partner Commissions</span>
            </div>
            <div className="text-xl font-bold text-[#0F172A] tabular-nums">
              {formatPkr(overview.totals.totalCommissionEarnedPkr)}
            </div>
            <div className="text-xs text-slate-400 tabular-nums">
              Pending {formatPkr(overview.totals.pendingCommissionPkr)} · Paid{' '}
              {formatPkr(overview.totals.paidCommissionPkr)}
            </div>
          </div>
        </div>
      )}

      {/* Sub-navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 inline-flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSubTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition ${
            subTab === 'campaigns'
              ? 'bg-[#0F172A] text-white'
              : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>All Campaigns</span>
        </button>

        {selectedCampaignId && (
          <button
            type="button"
            onClick={() => setSubTab('detail')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition ${
              subTab === 'detail'
                ? 'bg-[#0F172A] text-white'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{detail?.campaign.name || 'Campaign Analytics'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setSubTab('monthly')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition ${
            subTab === 'monthly'
              ? 'bg-[#0F172A] text-white'
              : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Monthly Commission Reports</span>
        </button>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && subTab === 'campaigns' && (
        <form
          onSubmit={handleCreateCampaign}
          className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Create Partner Referral Campaign</h3>
              <p className="text-xs text-slate-500">
                Campaign Name and Custom Referral Slug are stored independently. Partner Name is never auto-inserted into the public URL.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Campaign Name *</label>
              <input
                type="text"
                required
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Kameer Play"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Partner / Person Name *</label>
              <input
                type="text"
                required
                value={createPartnerName}
                onChange={(e) => setCreatePartnerName(e.target.value)}
                placeholder="e.g. Hafiz Akash"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Partner Email (Optional — Self-Referral Guard)
              </label>
              <input
                type="email"
                value={createPartnerEmail}
                onChange={(e) => setCreatePartnerEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Custom Referral Slug * (Independently Editable)
              </label>
              <input
                type="text"
                required
                value={createSlug}
                onChange={(e) => setCreateSlug(e.target.value)}
                placeholder="kameer-play"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[#0F172A]"
              />
              <div className="text-[11px] text-slate-500 mt-1 truncate">
                Generated URL:{' '}
                <span className="font-mono text-[#0F172A]">
                  https://feviqo.com/membership/{previewSlug || 'your-slug'}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Commission Percentage (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={createRate}
                onChange={(e) => setCreateRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Attribution Window (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                required
                value={createWindowDays}
                onChange={(e) => setCreateWindowDays(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Start Date (Optional)</label>
              <input
                type="date"
                value={createStartDate}
                onChange={(e) => setCreateStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">End Date (Optional)</label>
              <input
                type="date"
                value={createEndDate}
                onChange={(e) => setCreateEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Initial Status</label>
              <select
                value={createStatus}
                onChange={(e) => setCreateStatus(e.target.value as ReferralCampaignStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0F172A]"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1.5">Description / Notes</label>
            <textarea
              rows={2}
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Campaign notes, placement channel, agreed payout terms..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F172A]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busyAction === 'create'}
              className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold transition cursor-pointer disabled:opacity-60"
            >
              {busyAction === 'create' ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      )}

      {/* TAB A: CAMPAIGNS LIST */}
      {subTab === 'campaigns' && (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          {loading && !overview ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading referral campaigns...</div>
          ) : !overview || overview.campaigns.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="text-sm font-semibold text-[#0F172A]">No referral campaigns yet</div>
              <p className="text-xs text-slate-500">
                Click "New Referral Campaign" to create your first campaign (for example: Kameer Play →{' '}
                <code className="font-mono">https://feviqo.com/membership/kameer-play</code>).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Campaign / Partner</th>
                    <th className="py-3.5 px-4">Referral URL</th>
                    <th className="py-3.5 px-4 text-right">Clicks / Unique</th>
                    <th className="py-3.5 px-4 text-right">Signups / Paid</th>
                    <th className="py-3.5 px-4 text-right">Revenue</th>
                    <th className="py-3.5 px-4 text-right">Commission</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.campaigns.map(({ campaign, analytics }) => (
                    <tr key={campaign.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0F172A] text-[13px]">{campaign.name}</div>
                        <div className="text-slate-500">Partner: {campaign.partnerName}</div>
                        <div className="text-[11px] text-slate-400">
                          {campaign.commissionRatePercent}% rate · {campaign.attributionWindowDays}d window
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 rounded bg-slate-100 text-[11px] font-mono text-[#0F172A] max-w-[240px] truncate">
                            {campaign.referralUrl}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(campaign.referralUrl, campaign.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                            title="Copy referral URL"
                          >
                            {copiedSlug === campaign.id ? (
                              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <div className="font-semibold text-[#0F172A]">{analytics.totalClicks} clicks</div>
                        <div className="text-slate-500">{analytics.uniqueVisitors} unique</div>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <div className="font-semibold text-[#0F172A]">
                          {analytics.registeredUsers} users · {analytics.successfulPaidMemberships} paid
                        </div>
                        <div className="text-slate-500">{analytics.conversionRatePercent}% conv.</div>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-[#0F172A]">
                        {formatPkr(analytics.revenueGeneratedPkr)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <div className="font-semibold text-[#0F172A]">
                          {formatPkr(analytics.totalCommissionEarnedPkr)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Pend: {formatPkr(analytics.pendingCommissionPkr)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 capitalize">
                        <span className={statusTextClass(campaign.status)}>{campaign.status}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openCampaignDetail(campaign.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                          >
                            <BarChart3 className="w-3 h-3" />
                            <span>Analytics</span>
                          </button>

                          {campaign.status === 'active' ? (
                            <button
                              type="button"
                              disabled={busyAction === `status-${campaign.id}`}
                              onClick={() => handleCampaignStatusChange(campaign.id, 'paused')}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 text-amber-700 cursor-pointer"
                              title="Pause campaign"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busyAction === `status-${campaign.id}`}
                              onClick={() => handleCampaignStatusChange(campaign.id, 'active')}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 text-emerald-700 cursor-pointer"
                              title="Activate campaign"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {campaign.status !== 'disabled' && (
                            <button
                              type="button"
                              disabled={busyAction === `status-${campaign.id}`}
                              onClick={() => handleCampaignStatusChange(campaign.id, 'disabled')}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-600 cursor-pointer"
                              title="Disable link (preserves analytics & commissions)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB B: SINGLE CAMPAIGN ISOLATED ANALYTICS & MANAGEMENT */}
      {subTab === 'detail' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSubTab('campaigns')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0F172A] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Campaigns</span>
            </button>
          </div>

          {loadingDetail || !detail ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
              Loading campaign analytics...
            </div>
          ) : (
            <>
              {/* Campaign Header Card */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold uppercase tracking-wider text-[#16A34A]">
                        Isolated Campaign Analytics
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className={`capitalize ${statusTextClass(detail.campaign.status)}`}>
                        {detail.campaign.status}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">
                        Window: {detail.campaign.attributionWindowDays} days
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F172A]">{detail.campaign.name}</h3>
                    <div className="text-xs text-slate-600">
                      Partner: <strong className="text-[#0F172A]">{detail.campaign.partnerName}</strong>
                      {detail.campaign.partnerEmail ? ` (${detail.campaign.partnerEmail})` : ''} · ID:{' '}
                      <code className="font-mono text-slate-500">{detail.campaign.id}</code>
                    </div>
                    {detail.campaign.description && (
                      <p className="text-xs text-slate-500 pt-1">{detail.campaign.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                      <code className="text-xs font-mono text-[#0F172A]">
                        {detail.campaign.referralUrl}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(detail.campaign.referralUrl, detail.campaign.id)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        {copiedSlug === detail.campaign.id ? (
                          <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingDetail((prev) => !prev)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0F172A] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{editingDetail ? 'Cancel Edit' : 'Edit Details'}</span>
                    </button>

                    {detail.campaign.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => handleCampaignStatusChange(detail.campaign.id, 'paused')}
                        className="px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCampaignStatusChange(detail.campaign.id, 'active')}
                        className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </button>
                    )}

                    {detail.campaign.status !== 'disabled' && (
                      <button
                        type="button"
                        onClick={() => handleCampaignStatusChange(detail.campaign.id, 'disabled')}
                        className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Disable Link</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Form */}
                {editingDetail && (
                  <form
                    onSubmit={handleSaveCampaignEdits}
                    className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Campaign Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Partner Name</label>
                        <input
                          type="text"
                          required
                          value={editPartnerName}
                          onChange={(e) => setEditPartnerName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Partner Email</label>
                        <input
                          type="email"
                          value={editPartnerEmail}
                          onChange={(e) => setEditPartnerEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Custom Slug (Independent)
                        </label>
                        <input
                          type="text"
                          required
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Future Commission Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          required
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Attribution Window (Days)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          required
                          value={editWindowDays}
                          onChange={(e) => setEditWindowDays(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={editEndDate}
                          onChange={(e) => setEditEndDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        disabled={busyAction === 'edit-campaign'}
                        className="px-4 py-2 rounded-lg bg-[#0F172A] text-white font-semibold hover:bg-[#22C55E] hover:text-[#0F172A] cursor-pointer"
                      >
                        {busyAction === 'edit-campaign' ? 'Saving...' : 'Save Campaign Changes'}
                      </button>
                    </div>
                  </form>
                )}

                {/* All 11 Required Campaign Analytics Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Total Clicks', val: String(detail.analytics.totalClicks) },
                    { label: 'Unique Visitors', val: String(detail.analytics.uniqueVisitors) },
                    { label: 'Registered Users', val: String(detail.analytics.registeredUsers) },
                    { label: 'Checkout Attempts', val: String(detail.analytics.checkoutAttempts) },
                    {
                      label: 'Paid Memberships',
                      val: String(detail.analytics.successfulPaidMemberships),
                    },
                    { label: 'Conversion Rate', val: `${detail.analytics.conversionRatePercent}%` },
                    {
                      label: 'Revenue Generated',
                      val: formatPkr(detail.analytics.revenueGeneratedPkr),
                    },
                    {
                      label: 'Commission Rate',
                      val: `${detail.analytics.commissionRatePercent}%`,
                    },
                    {
                      label: 'Total Commission',
                      val: formatPkr(detail.analytics.totalCommissionEarnedPkr),
                    },
                    {
                      label: 'Pending Commission',
                      val: formatPkr(detail.analytics.pendingCommissionPkr),
                    },
                    {
                      label: 'Paid Commission',
                      val: formatPkr(detail.analytics.paidCommissionPkr),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3"
                    >
                      <div className="text-[11px] font-medium text-slate-500">{item.label}</div>
                      <div className="text-base font-bold text-[#0F172A] tabular-nums mt-0.5">
                        {item.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commissions Table for This Campaign */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">
                      Campaign Commissions ({detail.commissions.length})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Each record snapshots the campaign commission percentage and verified order amount permanently.
                    </p>
                  </div>
                </div>
                {detail.commissions.length === 0 ? (
                  <div className="p-6 text-xs text-slate-500">
                    No verified commission records for this campaign yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <th className="py-3 px-4">Order / Month</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Plan &amp; Order Amount</th>
                          <th className="py-3 px-4 text-right">Rate</th>
                          <th className="py-3 px-4 text-right">Commission</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detail.commissions.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <div className="font-mono font-semibold text-[#0F172A]">{c.orderId}</div>
                              <div className="text-slate-500">{c.monthKey}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#0F172A]">{c.customerName}</div>
                              <div className="text-slate-500">{c.maskedCustomerEmail}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#0F172A]">{c.planName}</div>
                              <div className="text-slate-500 tabular-nums">
                                {c.currency} {c.orderAmount.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums font-semibold">
                              {c.commissionRatePercent}%
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums font-bold text-[#0F172A]">
                              {c.currency === 'USD'
                                ? `$${c.commissionAmountUsd.toFixed(2)}`
                                : formatPkr(c.commissionAmountPkr)}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              <span className={commissionStatusClass(c.status)}>{c.status}</span>
                              {c.paymentDate && (
                                <div className="text-[11px] text-slate-400">Paid {c.paymentDate}</div>
                              )}
                              {c.reversedReason && (
                                <div className="text-[11px] text-red-500">{c.reversedReason}</div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1.5">
                                {c.status === 'pending' && (
                                  <button
                                    type="button"
                                    disabled={busyAction === `approve-${c.id}`}
                                    onClick={() => handleApproveCommission(c.id)}
                                    className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                {(c.status === 'pending' || c.status === 'approved') && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPayoutModal({
                                        isOpen: true,
                                        commissionIds: [c.id],
                                        title: `Mark Order ${c.orderId} Commission Paid`,
                                        totalPkr: c.commissionAmountPkr,
                                      })
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-[11px] font-semibold cursor-pointer"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                {c.status !== 'reversed' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReverseModal({ commissionId: c.id, orderId: c.orderId })
                                    }
                                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                                    title="Reverse commission"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Referred Customers & Activity History */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-[#0F172A]">
                      Referred Customers ({detail.customers.length})
                    </h4>
                  </div>
                  {detail.customers.length === 0 ? (
                    <div className="p-5 text-xs text-slate-500">No attributed customers yet.</div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {detail.customers.map((cust) => (
                        <div key={cust.memberId} className="px-5 py-3 text-xs flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-[#0F172A]">{cust.customerName}</div>
                            <div className="text-slate-500">{cust.maskedEmail}</div>
                            <div className="text-[11px] text-slate-400">
                              Attributed {new Date(cust.attributedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-[#0F172A]">
                              {cust.lastOrderPlan || 'Registered'}
                            </div>
                            <div className="text-slate-500">
                              {cust.lastOrderAmountDisplay || 'No order yet'}
                            </div>
                            {cust.lastOrderStatus && (
                              <div className="text-[11px] capitalize text-emerald-700">
                                Order: {cust.lastOrderStatus.replace(/_/g, ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-[#0F172A]">
                      Campaign Activity History ({detail.campaign.activityHistory.length})
                    </h4>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {detail.campaign.activityHistory.map((item) => (
                      <div key={item.id} className="px-5 py-3 text-xs space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#0F172A] capitalize">
                            {item.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(item.at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-slate-600">{item.summary}</div>
                        <div className="text-[11px] text-slate-400">Actor: {item.actorEmail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB C: MONTHLY COMMISSION REPORTS & PAYOUTS */}
      {subTab === 'monthly' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-700">Select Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#0F172A]"
              />
              {monthlySnapshot && (
                <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Saved snapshot: {new Date(monthlySnapshot.generatedAt).toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busyAction === 'save-snapshot'}
                onClick={handleSaveSnapshot}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0F172A] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{busyAction === 'save-snapshot' ? 'Saving...' : 'Save Permanent Snapshot'}</span>
              </button>
              <button
                type="button"
                disabled={busyAction === 'csv'}
                onClick={handleDownloadCsv}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{busyAction === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
            {loadingMonthly ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading monthly report...</div>
            ) : monthlyRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No verified paid campaign memberships recorded for {selectedMonth}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Campaign Name</th>
                      <th className="py-3.5 px-4">Partner Name</th>
                      <th className="py-3.5 px-4 text-right">Paid Memberships</th>
                      <th className="py-3.5 px-4 text-right">Total Revenue</th>
                      <th className="py-3.5 px-4 text-right">Commission %</th>
                      <th className="py-3.5 px-4 text-right">Total Earned</th>
                      <th className="py-3.5 px-4 text-right">Pending</th>
                      <th className="py-3.5 px-4 text-right">Paid</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyRows.map((row) => (
                      <tr key={row.campaignId} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-bold text-[#0F172A]">{row.campaignName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.partnerName}</td>
                        <td className="py-3.5 px-4 text-right tabular-nums font-semibold">
                          {row.successfulPaidMemberships}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums font-semibold">
                          {formatPkr(row.revenuePkr)}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums">
                          {row.commissionRatePercent}%
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums font-bold text-[#0F172A]">
                          {formatPkr(row.totalCommissionEarnedPkr)}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums text-amber-700 font-semibold">
                          {formatPkr(row.pendingCommissionPkr + row.approvedCommissionPkr)}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums text-emerald-700 font-semibold">
                          {formatPkr(row.paidCommissionPkr)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openCampaignDetail(row.campaignId)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold cursor-pointer"
                            >
                              Details
                            </button>
                            {row.pendingCommissionPkr + row.approvedCommissionPkr > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  openCampaignMonthPayout(
                                    row.campaignId,
                                    row.campaignName,
                                    selectedMonth
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-[11px] font-semibold cursor-pointer"
                              >
                                Pay Month
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Saved Historical Snapshots & Partner Payment History */}
          {overview && (overview.payments.length > 0 || overview.savedMonthlyReports.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Partner Payment History ({overview.payments.length})
                  </h4>
                </div>
                {overview.payments.length === 0 ? (
                  <div className="p-5 text-xs text-slate-500">No partner payments recorded yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {overview.payments.map((p) => (
                      <div key={p.id} className="px-5 py-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0F172A]">
                            {p.campaignName} ({p.partnerName})
                          </span>
                          <span className="font-bold text-emerald-700 tabular-nums">
                            {formatPkr(p.totalAmountPkr)}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          Month: {p.monthKey} · Paid on: {p.paymentDate} · {p.paymentMethod || 'Transfer'}
                          {p.paymentReference ? ` · Ref: ${p.paymentReference}` : ''}
                        </div>
                        {p.notes && <div className="text-slate-600">{p.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Saved Monthly Report Snapshots ({overview.savedMonthlyReports.length})
                  </h4>
                </div>
                {overview.savedMonthlyReports.length === 0 ? (
                  <div className="p-5 text-xs text-slate-500">No permanent snapshots saved yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {overview.savedMonthlyReports.map((snap) => (
                      <div
                        key={snap.id}
                        className="px-5 py-3 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#0F172A]">Month {snap.monthKey}</div>
                          <div className="text-slate-500">
                            {snap.rows.length} campaigns · Saved{' '}
                            {new Date(snap.generatedAt).toLocaleString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedMonth(snap.monthKey)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Commission Payout Modal */}
      {payoutModal?.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPayoutModal(null)}
        >
          <form
            onSubmit={handleSubmitPayout}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">{payoutModal.title}</h3>
              <button
                type="button"
                onClick={() => setPayoutModal(null)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900 font-semibold">
              Paying {payoutModal.commissionIds.length} commission record(s) totaling{' '}
              {formatPkr(payoutModal.totalPkr)}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={payoutDate}
                onChange={(e) => setPayoutDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <input
                type="text"
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                placeholder="JazzCash / SadaPay / Bank Transfer"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transaction Reference</label>
              <input
                type="text"
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
                placeholder="Optional TXN ID"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Notes</label>
              <textarea
                rows={2}
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                placeholder="Notes stored permanently in payment ledger"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoutModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyAction === 'mark-paid'}
                className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] font-semibold cursor-pointer"
              >
                {busyAction === 'mark-paid' ? 'Recording...' : 'Confirm Mark Paid'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reverse Commission Modal */}
      {reverseModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setReverseModal(null)}
        >
          <form
            onSubmit={handleConfirmReverse}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs shadow-2xl"
          >
            <h3 className="text-base font-bold text-[#0F172A]">
              Reverse Commission ({reverseModal.orderId})
            </h3>
            <p className="text-slate-500">
              Reversing marks this commission as reversed and excludes it from partner totals while keeping an audit trail.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason *</label>
              <input
                type="text"
                required
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReverseModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyAction === `reverse-${reverseModal.commissionId}`}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 cursor-pointer"
              >
                Confirm Reverse
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

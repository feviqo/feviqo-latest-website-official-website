import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Trophy,
  Crown,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  Save,
  RefreshCw,
  Sliders,
  Sparkles,
  Archive,
  X,
  Star,
} from 'lucide-react';
import {
  AdminSupportersLeaderboardOverview,
  SupporterLeaderboardEntry,
  SupporterLeaderboardSettings,
  fetchAdminSupportersLeaderboard,
  createSupporterEntryAdmin,
  seedInitialFeaturedSupportersAdmin,
  updateSupporterEntryAdmin,
  deleteSupporterEntryAdmin,
  updateSupporterLeaderboardSettingsAdmin,
} from '../../services/membershipService';
import {
  isFirebaseAdminUser,
  syncSupporterEntryToFirestore,
  deleteSupporterEntryInFirestore,
  syncSupporterSettingsToFirestore,
} from '../../services/firestoreMembershipSync';

interface AdminSupportersLeaderboardTabProps {
  initialData?: AdminSupportersLeaderboardOverview | null;
  onDataChange?: (next: AdminSupportersLeaderboardOverview) => void;
  onSuccessMessage: (msg: string) => void;
  onErrorMessage: (msg: string) => void;
}

const DEFAULT_SETTINGS: SupporterLeaderboardSettings = {
  id: 'main',
  enabled: true,
  maxDisplayed: 10,
  showAmountsGlobally: true,
  allowAutomaticRanking: true,
  allowManualPriority: true,
  showBadges: true,
  showSubtitle: true,
  includeManualFeatured: true,
  updatedAt: new Date(0).toISOString(),
};

function normalizeAdminSupportersOverview(
  raw: any
): AdminSupportersLeaderboardOverview {
  const entries: SupporterLeaderboardEntry[] = Array.isArray(raw?.entries)
    ? raw.entries.map((entry: any) => ({
        id: String(entry?.id || ''),
        displayName: String(entry?.displayName || 'Anonymous Patron'),
        contributionAmount: Math.max(0, Math.round(Number(entry?.contributionAmount) || 0)),
        amountVisible: entry?.amountVisible !== false,
        badge: String(entry?.badge || ''),
        displayPriority:
          entry?.displayPriority !== null &&
          entry?.displayPriority !== undefined &&
          Number.isFinite(Number(entry.displayPriority))
            ? Math.round(Number(entry.displayPriority))
            : null,
        entryType: entry?.entryType === 'verified_customer' ? 'verified_customer' : 'manual_featured',
        active: entry?.active !== false,
        featured: Boolean(entry?.featured),
        removed: Boolean(entry?.removed),
        createdAt: String(entry?.createdAt || new Date().toISOString()),
        updatedAt: String(entry?.updatedAt || entry?.createdAt || new Date().toISOString()),
        sourceOrderId: entry?.sourceOrderId ? String(entry.sourceOrderId) : undefined,
        updatedByAdminEmail: entry?.updatedByAdminEmail ? String(entry.updatedByAdminEmail) : undefined,
      })).filter((e: SupporterLeaderboardEntry) => Boolean(e.id))
    : [];

  const rawSettings = raw?.settings || {};
  const settings: SupporterLeaderboardSettings = {
    id: 'main',
    enabled: rawSettings.enabled !== undefined ? Boolean(rawSettings.enabled) : DEFAULT_SETTINGS.enabled,
    maxDisplayed: Math.max(1, Math.min(50, Math.round(Number(rawSettings.maxDisplayed ?? 10) || 10))),
    showAmountsGlobally:
      rawSettings.showAmountsGlobally !== undefined
        ? Boolean(rawSettings.showAmountsGlobally)
        : DEFAULT_SETTINGS.showAmountsGlobally,
    allowAutomaticRanking:
      rawSettings.allowAutomaticRanking !== undefined
        ? Boolean(rawSettings.allowAutomaticRanking)
        : DEFAULT_SETTINGS.allowAutomaticRanking,
    allowManualPriority:
      rawSettings.allowManualPriority !== undefined
        ? Boolean(rawSettings.allowManualPriority)
        : DEFAULT_SETTINGS.allowManualPriority,
    showBadges:
      rawSettings.showBadges !== undefined ? Boolean(rawSettings.showBadges) : DEFAULT_SETTINGS.showBadges,
    showSubtitle:
      rawSettings.showSubtitle !== undefined
        ? Boolean(rawSettings.showSubtitle)
        : DEFAULT_SETTINGS.showSubtitle,
    includeManualFeatured:
      rawSettings.includeManualFeatured !== undefined
        ? Boolean(rawSettings.includeManualFeatured)
        : DEFAULT_SETTINGS.includeManualFeatured,
    updatedAt:
      typeof rawSettings.updatedAt === 'string' && rawSettings.updatedAt
        ? rawSettings.updatedAt
        : DEFAULT_SETTINGS.updatedAt,
  };

  const activeEntries = entries.filter((e) => e.active && !e.removed).length;
  const verifiedCustomerEntries = entries.filter(
    (e) => e.entryType === 'verified_customer' && !e.removed
  );
  const manualFeaturedEntries = entries.filter(
    (e) => e.entryType === 'manual_featured' && !e.removed
  );
  const computedVerifiedTotal = verifiedCustomerEntries.reduce(
    (sum, e) => sum + (Number(e.contributionAmount) || 0),
    0
  );

  const rawStats = raw?.stats || {};
  const rawPreview = raw?.publicPreview || {};
  const previewEntries = Array.isArray(rawPreview.entries) ? rawPreview.entries : [];

  return {
    entries,
    settings,
    publicPreview: {
      enabled: rawPreview.enabled !== undefined ? Boolean(rawPreview.enabled) : settings.enabled,
      settings: rawPreview.settings ? { ...settings, ...rawPreview.settings } : settings,
      entries: previewEntries,
      updatedAt: String(rawPreview.updatedAt || settings.updatedAt),
    },
    stats: {
      totalEntries: Number(rawStats.totalEntries ?? entries.length) || 0,
      activeEntries: Number(rawStats.activeEntries ?? rawStats.activeCount ?? activeEntries) || 0,
      activeCount: Number(rawStats.activeCount ?? rawStats.activeEntries ?? activeEntries) || 0,
      verifiedCustomerCount:
        Number(rawStats.verifiedCustomerCount ?? verifiedCustomerEntries.length) || 0,
      manualFeaturedCount:
        Number(rawStats.manualFeaturedCount ?? manualFeaturedEntries.length) || 0,
      removedCount:
        Number(rawStats.removedCount ?? entries.filter((e) => e.removed).length) || 0,
      verifiedContributionTotalPkr:
        Number(
          rawStats.verifiedContributionTotalPkr ??
            rawStats.totalVerifiedContributionsPkr ??
            computedVerifiedTotal
        ) || 0,
      totalVerifiedContributionsPkr:
        Number(
          rawStats.totalVerifiedContributionsPkr ??
            rawStats.verifiedContributionTotalPkr ??
            computedVerifiedTotal
        ) || 0,
    },
  };
}

const BADGE_PRESETS = [
  'Executive Patron',
  'Founding Supporter',
  'Community Patron',
  'Featured Patron',
  'VIP Supporter',
];

export const AdminSupportersLeaderboardTab: React.FC<AdminSupportersLeaderboardTabProps> = ({
  initialData = null,
  onDataChange,
  onSuccessMessage,
  onErrorMessage,
}) => {
  const initialNormalized = initialData ? normalizeAdminSupportersOverview(initialData) : null;
  const [data, setData] = useState<AdminSupportersLeaderboardOverview>(
    () => initialNormalized || normalizeAdminSupportersOverview(null)
  );
  const [loading, setLoading] = useState(!initialNormalized);
  const [busy, setBusy] = useState(false);

  const onSuccessRef = useRef(onSuccessMessage);
  const onErrorRef = useRef(onErrorMessage);
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => {
    onSuccessRef.current = onSuccessMessage;
    onErrorRef.current = onErrorMessage;
    onDataChangeRef.current = onDataChange;
  }, [onSuccessMessage, onErrorMessage, onDataChange]);

  // Filter
  const [filterMode, setFilterMode] = useState<
    'all' | 'active' | 'verified_customer' | 'manual_featured' | 'removed'
  >('all');

  // Settings draft
  const [settingsDraft, setSettingsDraft] = useState<SupporterLeaderboardSettings>(
    () => (initialNormalized ? initialNormalized.settings : { ...DEFAULT_SETTINGS })
  );
  const [savingSettings, setSavingSettings] = useState(false);

  // Add Manual Entry Form
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('1000');
  const [newBadge, setNewBadge] = useState('Founding Supporter');
  const [newPriority, setNewPriority] = useState('');
  const [newAmountVisible, setNewAmountVisible] = useState(true);
  const [newFeatured, setNewFeatured] = useState(true);
  const [newActive, setNewActive] = useState(true);

  // Edit Entry Modal state
  const [editingEntry, setEditingEntry] = useState<SupporterLeaderboardEntry | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('0');
  const [editBadge, setEditBadge] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editAmountVisible, setEditAmountVisible] = useState(true);
  const [editFeatured, setEditFeatured] = useState(false);
  const [editActive, setEditActive] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const applyNormalizedData = useCallback(
    (rawPayload: any, syncSettingsDraft = true) => {
      const normalized = normalizeAdminSupportersOverview(rawPayload);
      setData(normalized);
      if (syncSettingsDraft) {
        setSettingsDraft(normalized.settings);
      }
      onDataChangeRef.current?.(normalized);
      return normalized;
    },
    []
  );

  const loadOverview = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await fetchAdminSupportersLeaderboard();
        if (!res || !res.success || 'error' in res) {
          onErrorRef.current(
            (res && 'error' in res && res.error) || 'Could not load Supporters Leaderboard data.'
          );
        } else {
          applyNormalizedData(res, true);
        }
      } catch {
        onErrorRef.current('Network error loading Supporters Leaderboard.');
      } finally {
        setLoading(false);
      }
    },
    [applyNormalizedData]
  );

  useEffect(() => {
    void loadOverview(Boolean(initialNormalized));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOverview]);

  const mirrorEntriesAndSettingsQuietly = async (
    entries?: SupporterLeaderboardEntry[],
    settings?: SupporterLeaderboardSettings
  ) => {
    if (!isFirebaseAdminUser()) return;
    if (entries) {
      for (const entry of entries) {
        await syncSupporterEntryToFirestore(entry).catch(() => {});
      }
    }
    if (settings) {
      await syncSupporterSettingsToFirestore(settings).catch(() => {});
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsDraft) return;
    setSavingSettings(true);
    try {
      const res = await updateSupporterLeaderboardSettingsAdmin({
        enabled: settingsDraft.enabled,
        maxDisplayed: Math.max(1, Math.min(50, Number(settingsDraft.maxDisplayed) || 10)),
        showAmountsGlobally: settingsDraft.showAmountsGlobally,
        allowAutomaticRanking: settingsDraft.allowAutomaticRanking,
        allowManualPriority: settingsDraft.allowManualPriority,
        showBadges: settingsDraft.showBadges,
        showSubtitle: settingsDraft.showSubtitle,
        includeManualFeatured: settingsDraft.includeManualFeatured,
      });
      if (!res || !res.success || 'error' in res) {
        onErrorRef.current(
          (res && 'error' in res && res.error) || 'Failed to update leaderboard settings.'
        );
      } else {
        const normalized = applyNormalizedData(res, true);
        await mirrorEntriesAndSettingsQuietly(undefined, normalized.settings);
        onSuccessRef.current('Supporters Leaderboard display & ranking settings saved live.');
      }
    } catch {
      onErrorRef.current('Network error saving leaderboard settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = Number(newAmount);
    if (!Number.isFinite(parsedAmt) || parsedAmt < 0 || parsedAmt > 5000000) {
      onErrorRef.current('Enter a valid non-negative contribution amount (PKR 0 – 5,000,000).');
      return;
    }
    const parsedPriority =
      newPriority.trim() === '' ? null : Math.round(Number(newPriority.trim()));
    if (
      parsedPriority !== null &&
      (!Number.isFinite(parsedPriority) || parsedPriority < 1 || parsedPriority > 999)
    ) {
      onErrorRef.current('Manual display priority must be blank (auto) or a whole number 1–999.');
      return;
    }

    setBusy(true);
    try {
      const res = await createSupporterEntryAdmin({
        displayName: newName.trim() || 'Anonymous Patron',
        contributionAmount: Math.round(parsedAmt),
        amountVisible: newAmountVisible,
        badge: newBadge.trim(),
        displayPriority: parsedPriority,
        entryType: 'manual_featured',
        active: newActive,
        featured: newFeatured,
      });
      if (!res || !res.success || 'error' in res) {
        onErrorRef.current((res && 'error' in res && res.error) || 'Failed to add supporter entry.');
      } else {
        const normalized = applyNormalizedData(res, false);
        setNewName('');
        setNewAmount('1000');
        setNewPriority('');
        await mirrorEntriesAndSettingsQuietly(
          res.entry ? [res.entry] : undefined,
          normalized.settings
        );
        onSuccessRef.current(
          `Added featured supporter "${res.entry?.displayName || 'Supporter'}" to the leaderboard.`
        );
      }
    } catch {
      onErrorRef.current('Network error creating supporter entry.');
    } finally {
      setBusy(false);
    }
  };

  const handleSeedInitialFeatured = async () => {
    setBusy(true);
    try {
      const res = await seedInitialFeaturedSupportersAdmin();
      if (!res || !res.success || 'error' in res) {
        onErrorRef.current(
          (res && 'error' in res && res.error) || 'Failed to seed initial featured patrons.'
        );
      } else {
        const normalized = applyNormalizedData(res, false);
        const createdList = Array.isArray(res.created) ? res.created : [];
        await mirrorEntriesAndSettingsQuietly(createdList, normalized.settings);
        if (createdList.length === 0) {
          onSuccessRef.current('All 5 initial featured patron templates already exist.');
        } else {
          onSuccessRef.current(
            `Added ${createdList.length} editable featured patron entries (not financial transactions).`
          );
        }
      }
    } catch {
      onErrorRef.current('Network error adding initial featured patrons.');
    } finally {
      setBusy(false);
    }
  };

  const openEditModal = (entry: SupporterLeaderboardEntry) => {
    setEditingEntry(entry);
    setEditName(entry.displayName);
    setEditAmount(String(entry.contributionAmount));
    setEditBadge(entry.badge || '');
    setEditPriority(entry.displayPriority !== null ? String(entry.displayPriority) : '');
    setEditAmountVisible(entry.amountVisible);
    setEditFeatured(entry.featured);
    setEditActive(entry.active);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    const parsedAmt = Number(editAmount);
    if (!Number.isFinite(parsedAmt) || parsedAmt < 0 || parsedAmt > 5000000) {
      onErrorMessage('Contribution amount must be between PKR 0 and 5,000,000.');
      return;
    }
    const parsedPriority =
      editPriority.trim() === '' ? null : Math.round(Number(editPriority.trim()));
    if (
      parsedPriority !== null &&
      (!Number.isFinite(parsedPriority) || parsedPriority < 1 || parsedPriority > 999)
    ) {
      onErrorMessage('Display priority must be blank (auto) or a number between 1 and 999.');
      return;
    }

    setBusy(true);
    try {
      const res = await updateSupporterEntryAdmin(editingEntry.id, {
        displayName: editName.trim() || 'Anonymous Patron',
        contributionAmount: Math.round(parsedAmt),
        amountVisible: editAmountVisible,
        badge: editBadge.trim(),
        displayPriority: parsedPriority,
        featured: editFeatured,
        active: editActive,
      });
      if (!res || !res.success || 'error' in res) {
        onErrorRef.current(
          (res && 'error' in res && res.error) || 'Failed to update supporter entry.'
        );
      } else {
        const normalized = applyNormalizedData(res, false);
        setEditingEntry(null);
        await mirrorEntriesAndSettingsQuietly(
          res.entry ? [res.entry] : undefined,
          normalized.settings
        );
        onSuccessRef.current(`Updated supporter entry "${res.entry?.displayName || 'Supporter'}".`);
      }
    } catch {
      onErrorRef.current('Network error updating supporter entry.');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickPatch = async (
    entry: SupporterLeaderboardEntry,
    patch: Partial<{
      amountVisible: boolean;
      active: boolean;
      featured: boolean;
      removed: boolean;
    }>,
    label: string
  ) => {
    setBusy(true);
    try {
      const res = await updateSupporterEntryAdmin(entry.id, patch);
      if (!res || !res.success || 'error' in res) {
        onErrorRef.current(
          (res && 'error' in res && res.error) || 'Could not update supporter entry.'
        );
      } else {
        const normalized = applyNormalizedData(res, false);
        await mirrorEntriesAndSettingsQuietly(
          res.entry ? [res.entry] : undefined,
          normalized.settings
        );
        onSuccessRef.current(`${label}: "${res.entry?.displayName || entry.displayName}".`);
      }
    } catch {
      onErrorRef.current('Network error updating supporter entry.');
    } finally {
      setBusy(false);
    }
  };

  const handlePermanentDelete = async (entryId: string, name: string) => {
    setBusy(true);
    try {
      const res = await deleteSupporterEntryAdmin(entryId);
      if (!res || !res.success || 'error' in res) {
        onErrorRef.current(
          (res && 'error' in res && res.error) || 'Could not delete supporter entry.'
        );
      } else {
        applyNormalizedData(res, false);
        setConfirmDeleteId(null);
        if (isFirebaseAdminUser()) {
          await deleteSupporterEntryInFirestore(entryId).catch(() => {});
        }
        onSuccessRef.current(`Permanently deleted "${name}" from the Supporters Leaderboard.`);
      }
    } catch {
      onErrorRef.current('Network error deleting supporter entry.');
    } finally {
      setBusy(false);
    }
  };

  const entries = data?.entries || [];
  const filteredEntries = entries.filter((entry) => {
    if (filterMode === 'active') return entry.active && !entry.removed;
    if (filterMode === 'verified_customer') return entry.entryType === 'verified_customer' && !entry.removed;
    if (filterMode === 'manual_featured') return entry.entryType === 'manual_featured' && !entry.removed;
    if (filterMode === 'removed') return entry.removed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Summary KPIs */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#16A34A]">
              <Trophy className="w-4 h-4" />
              <span>Editable Live Supporters Leaderboard</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              FEVIQO Top Supporters Management
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Manage public supporter rankings, badges, amount visibility, and featured entries in
              real time. Verified customer entries are automatically added only after admin payment
              approval with a verified extra contribution &gt; PKR 0.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={busy}
              onClick={handleSeedInitialFeatured}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add 5 Initial Featured Patrons</span>
            </button>
            <button
              type="button"
              disabled={loading || busy}
              onClick={() => void loadOverview()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {data?.stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <div className="text-[11px] font-semibold text-slate-500">Active Public Entries</div>
              <div className="text-2xl font-bold text-[#0F172A] tabular-nums mt-0.5">
                {Number(data.stats.activeEntries ?? data.stats.activeCount ?? 0)}
              </div>
              <div className="text-[11px] text-slate-500">
                {data.publicPreview?.entries?.length ?? 0} currently displayed
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 px-4 py-3">
              <div className="text-[11px] font-semibold text-emerald-800">Verified Customers</div>
              <div className="text-2xl font-bold text-emerald-950 tabular-nums mt-0.5">
                {Number(data.stats.verifiedCustomerCount ?? 0)}
              </div>
              <div className="text-[11px] text-emerald-700">From approved bank payments</div>
            </div>
            <div className="rounded-xl bg-blue-50/70 border border-blue-200 px-4 py-3">
              <div className="text-[11px] font-semibold text-blue-800">Manual Featured</div>
              <div className="text-2xl font-bold text-blue-950 tabular-nums mt-0.5">
                {Number(data.stats.manualFeaturedCount ?? 0)}
              </div>
              <div className="text-[11px] text-blue-700">Admin-curated (no fake orders)</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <div className="text-[11px] font-semibold text-slate-500">
                Verified Extra Contributions
              </div>
              <div className="text-xl font-bold text-[#16A34A] tabular-nums mt-0.5">
                PKR{' '}
                {Number(
                  data.stats.verifiedContributionTotalPkr ??
                    data.stats.totalVerifiedContributionsPkr ??
                    0
                ).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">Real verified customer total</div>
            </div>
          </div>
        )}
      </div>

      {/* Top 2-Column Workspace: Control Settings + Add Manual Supporter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Control Settings Panel (All 8 Controls) */}
        <form
          onSubmit={handleSaveSettings}
          className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
              <Sliders className="w-4 h-4 text-[#16A34A]" />
              <span>Leaderboard Display &amp; Ranking Controls</span>
            </div>
            {settingsDraft && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  settingsDraft.enabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {settingsDraft.enabled ? 'Publicly Visible' : 'Hidden'}
              </span>
            )}
          </div>

          {settingsDraft && (
            <div className="space-y-3 text-xs">
              {[
                {
                  key: 'enabled' as const,
                  label: 'Enable Public Supporters Leaderboard',
                  desc: 'Show or hide the entire FEVIQO Top Supporters section on /membership.',
                },
                {
                  key: 'showAmountsGlobally' as const,
                  label: 'Show Contribution Amounts Globally',
                  desc: 'When OFF, all amounts display as "Amount Hidden" regardless of per-entry settings.',
                },
                {
                  key: 'allowAutomaticRanking' as const,
                  label: 'Automatic Ranking by Contribution Amount',
                  desc: 'Sort entries automatically from highest contribution to lowest.',
                },
                {
                  key: 'allowManualPriority' as const,
                  label: 'Allow Manual Priority Override',
                  desc: 'Entries with a manual priority number (1, 2, 3...) appear in exact priority order first.',
                },
                {
                  key: 'showBadges' as const,
                  label: 'Show Supporter Badges',
                  desc: 'Display Executive Patron, Founding Supporter, and custom badges.',
                },
                {
                  key: 'showSubtitle' as const,
                  label: 'Show Episode Credits Subtitle Banner',
                  desc: '"Top 3 supporters receive featured badges and shoutouts in FEVIQO\'s upcoming episode credits."',
                },
                {
                  key: 'includeManualFeatured' as const,
                  label: 'Include Manual Featured Entries Publicly',
                  desc: 'Turn OFF to show only real verified customer supporters on the public page.',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(settingsDraft[item.key])}
                    onChange={(e) =>
                      setSettingsDraft((prev) =>
                        prev ? { ...prev, [item.key]: e.target.checked } : prev
                      )
                    }
                    className="mt-0.5 h-4 w-4 accent-[#16A34A] rounded cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#0F172A]">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </div>
                </label>
              ))}

              <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div>
                  <div className="font-semibold text-[#0F172A]">
                    Max Top Supporters Displayed
                  </div>
                  <div className="text-[11px] text-slate-500">Default is Top 10 (1 – 50).</div>
                </div>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settingsDraft.maxDisplayed}
                  onChange={(e) =>
                    setSettingsDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            maxDisplayed: Math.max(1, Math.min(50, Number(e.target.value) || 10)),
                          }
                        : prev
                    )
                  }
                  className="w-20 px-3 py-1.5 text-sm font-bold tabular-nums text-center bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] disabled:opacity-60 text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving Settings...' : 'Save Leaderboard Settings'}</span>
              </button>
            </div>
          )}
        </form>

        {/* Add Supporter Manually Form */}
        <form
          onSubmit={handleCreateManualEntry}
          className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4"
        >
          <div className="pb-3 border-b border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
              <Plus className="w-4 h-4 text-[#16A34A]" />
              <span>Add Featured Supporter Entry</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Stored internally as <span className="font-semibold text-blue-700">Manual Featured</span>{' '}
              — never creates fake payments or affects financial revenue totals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-semibold text-slate-700">Display Name *</label>
              <input
                type="text"
                maxLength={60}
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Founding Patron or Anonymous Patron"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Contribution Amount (PKR) *</label>
              <input
                type="number"
                min={0}
                max={5000000}
                required
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full px-3.5 py-2 font-semibold tabular-nums bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">
                Manual Priority (Optional)
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                placeholder="Auto by amount"
                className="w-full px-3.5 py-2 tabular-nums bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F172A]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block font-semibold text-slate-700">Supporter Badge</label>
              <input
                type="text"
                maxLength={48}
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                placeholder="e.g. Executive Patron, Founding Supporter"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F172A]"
              />
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {BADGE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewBadge(preset)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border cursor-pointer transition ${
                      newBadge === preset
                        ? 'bg-[#0F172A] text-white border-[#0F172A]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAmountVisible}
                  onChange={(e) => setNewAmountVisible(e.target.checked)}
                  className="h-4 w-4 accent-[#16A34A] rounded"
                />
                <span className="font-semibold text-slate-700">Show Amount Publicly</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFeatured}
                  onChange={(e) => setNewFeatured(e.target.checked)}
                  className="h-4 w-4 accent-[#16A34A] rounded"
                />
                <span className="font-semibold text-slate-700">Featured</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newActive}
                  onChange={(e) => setNewActive(e.target.checked)}
                  className="h-4 w-4 accent-[#16A34A] rounded"
                />
                <span className="font-semibold text-slate-700">Active Immediately</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 px-4 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] hover:text-white disabled:opacity-60 text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{busy ? 'Adding...' : 'Add Supporter to Leaderboard'}</span>
          </button>
        </form>
      </div>

      {/* Live Public Preview Strip */}
      {data?.publicPreview && (
        <div className="rounded-2xl bg-[#0B0B0D] text-white border border-zinc-800 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#22C55E]">
              <Crown className="w-4 h-4" />
              <span>Live Public Leaderboard Preview (/membership)</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              {data.publicPreview.enabled
                ? `${data.publicPreview.entries.length} entries shown publicly · Zero PII`
                : 'Leaderboard currently disabled publicly'}
            </span>
          </div>
          {!data.publicPreview.enabled ? (
            <div className="text-xs text-zinc-400 py-2">
              The public Top Supporters section is currently turned OFF in settings.
            </div>
          ) : data.publicPreview.entries.length === 0 ? (
            <div className="text-xs text-zinc-400 py-2">
              No active public entries yet. Add a featured patron or approve a customer order with
              an extra contribution.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {data.publicPreview.entries.slice(0, 5).map((row) => (
                <div
                  key={row.id}
                  className={`rounded-xl p-3 border ${
                    row.rank === 1
                      ? 'bg-[#121D16] border-[#22C55E]/40'
                      : row.rank <= 3
                      ? 'bg-[#12141E] border-[#3B82F6]/35'
                      : 'bg-zinc-900/80 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                    <span
                      className={
                        row.rank === 1
                          ? 'text-[#22C55E]'
                          : row.rank <= 3
                          ? 'text-[#60A5FA]'
                          : 'text-zinc-400'
                      }
                    >
                      #{row.rank}
                    </span>
                    {row.badge && (
                      <span className="text-zinc-300 truncate max-w-[120px]">{row.badge}</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white truncate mt-1">{row.displayName}</div>
                  <div
                    className={`text-xs font-bold tabular-nums mt-0.5 ${
                      row.amountVisible ? 'text-[#22C55E]' : 'text-zinc-500 font-medium'
                    }`}
                  >
                    {row.amountDisplay}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Editable Entries Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100">
            {(
              [
                { id: 'all', label: `All (${entries.length})` },
                { id: 'active', label: `Active (${entries.filter((e) => e.active && !e.removed).length})` },
                {
                  id: 'verified_customer',
                  label: `Verified Customers (${
                    entries.filter((e) => e.entryType === 'verified_customer' && !e.removed).length
                  })`,
                },
                {
                  id: 'manual_featured',
                  label: `Manual Featured (${
                    entries.filter((e) => e.entryType === 'manual_featured' && !e.removed).length
                  })`,
                },
                { id: 'removed', label: `Archived (${entries.filter((e) => e.removed).length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  filterMode === tab.id
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-[0.06em] text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Supporter &amp; Badge</th>
                <th className="py-3 px-4">Entry Type</th>
                <th className="py-3 px-4">Contribution</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Visibility &amp; Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                    No supporter entries match this filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      entry.removed ? 'opacity-65 bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                        <span>{entry.displayName}</span>
                        {entry.featured && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {entry.badge || 'Default Rank Badge'}
                      </div>
                      {entry.sourceOrderId && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Order: {entry.sourceOrderId}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      {entry.entryType === 'verified_customer' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Customer</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
                          <Sparkles className="w-3 h-3" />
                          <span>Manual Featured</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-bold text-[#0F172A] tabular-nums">
                        PKR {Number(entry.contributionAmount ?? 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {entry.amountVisible ? 'Shown publicly' : 'Amount Hidden'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap tabular-nums text-xs">
                      {entry.displayPriority !== null ? (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold">
                          #{entry.displayPriority}
                        </span>
                      ) : (
                        <span className="text-slate-400">Auto</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {entry.removed ? (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[11px] font-bold">
                            Removed / Archived
                          </span>
                        ) : entry.active ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-bold">
                            Disabled
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openEditModal(entry)}
                          title="Edit supporter details"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void handleQuickPatch(
                              entry,
                              { amountVisible: !entry.amountVisible },
                              entry.amountVisible ? 'Hid amount for' : 'Made amount visible for'
                            )
                          }
                          title={entry.amountVisible ? 'Hide amount publicly' : 'Show amount publicly'}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          {entry.amountVisible ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                        {!entry.removed ? (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void handleQuickPatch(
                                  entry,
                                  { active: !entry.active },
                                  entry.active ? 'Disabled' : 'Enabled'
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                            >
                              {entry.active ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void handleQuickPatch(
                                  entry,
                                  { removed: true, active: false },
                                  'Archived'
                                )
                              }
                              title="Soft remove / archive"
                              className="p-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 text-amber-700 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void handleQuickPatch(
                                entry,
                                { removed: false, active: true },
                                'Restored'
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                        )}

                        {confirmDeleteId === entry.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void handlePermanentDelete(entry.id, entry.displayName)}
                              className="px-2 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setConfirmDeleteId(entry.id)}
                            title="Permanently delete"
                            className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Supporter Entry Modal */}
      {editingEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingEntry(null)}
        >
          <form
            onSubmit={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#16A34A]">
                  Edit Supporter Entry ·{' '}
                  {editingEntry.entryType === 'verified_customer'
                    ? 'Verified Customer'
                    : 'Manual Featured'}
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {editingEntry.displayName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="block font-semibold text-slate-700">Display Name</label>
                <input
                  type="text"
                  maxLength={60}
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Contribution Amount (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  max={5000000}
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-3.5 py-2 font-bold tabular-nums bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Manual Rank Priority (Blank = Auto)
                </label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  placeholder="Automatic"
                  className="w-full px-3.5 py-2 tabular-nums bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block font-semibold text-slate-700">Badge Text</label>
                <input
                  type="text"
                  maxLength={48}
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  placeholder="e.g. Executive Patron"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F172A]"
                />
                <div className="flex flex-wrap gap-1.5">
                  {BADGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditBadge(preset)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border cursor-pointer ${
                        editBadge === preset
                          ? 'bg-[#0F172A] text-white border-[#0F172A]'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAmountVisible}
                    onChange={(e) => setEditAmountVisible(e.target.checked)}
                    className="h-4 w-4 accent-[#16A34A] rounded"
                  />
                  <span className="font-semibold text-slate-700">Show Amount</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    className="h-4 w-4 accent-[#16A34A] rounded"
                  />
                  <span className="font-semibold text-slate-700">Featured</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="h-4 w-4 accent-[#16A34A] rounded"
                  />
                  <span className="font-semibold text-slate-700">Active</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-bold cursor-pointer transition"
              >
                {busy ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

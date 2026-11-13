import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  LogOut,
  Eye,
  Upload,
  Mail,
  Users,
  Settings,
  ClipboardList,
  AlertCircle,
  X,
  Lock,
  UserPlus,
} from 'lucide-react';
import { AppRoute } from '../../types';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { MEMBERSHIP_PLANS, MembershipPlanId, getDramaById } from '../../data/membershipCatalog';
import {
  AdminMembershipsOverview,
  MembershipOrder,
  SafeAdmin,
  fetchAdminAuthStatus,
  bootstrapAdminAccount,
  loginAdminAccount,
  logoutAdminAccount,
  fetchAdminMembershipsOverview,
  approvePaymentOrder,
  rejectPaymentOrder,
  revokeMembershipAccess,
  updateMembershipSettings,
  uploadPlanQrImage,
  retryEmailNotification,
  grantAdminRole,
  updateAdminRoleStatus,
  fetchAdminEmailTransport,
  saveAdminEmailTransport,
} from '../../services/membershipService';

interface MembershipAdminPageProps {
  onBookCall: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

type AdminTab = 'requests' | 'memberships' | 'config' | 'audit' | 'roles';

export const MembershipAdminPage: React.FC<MembershipAdminPageProps> = ({
  onBookCall,
  onNavigateSection,
  onNavigatePricing,
  onNavigateFlow,
  onNavigatePage,
}) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState<SafeAdmin | null>(null);
  const [hasConfiguredAdmins, setHasConfiguredAdmins] = useState(true);

  // Auth form state
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('FEVIQO Owner');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Overview workspace state
  const [overview, setOverview] = useState<AdminMembershipsOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('requests');
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [membershipStatusFilter, setMembershipStatusFilter] = useState<string>('all');
  const [membershipSearch, setMembershipSearch] = useState('');

  // Selected request detail & action state
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  // Revoke membership state
  const [revokingMembershipId, setRevokingMembershipId] = useState<string | null>(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState('');

  // Settings form state
  const [whatsappInput, setWhatsappInput] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [supportEmailInput, setSupportEmailInput] = useState('');
  const [supportNoteEnInput, setSupportNoteEnInput] = useState('');
  const [supportNoteUrInput, setSupportNoteUrInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingQrPlanId, setUploadingQrPlanId] = useState<MembershipPlanId | null>(null);

  // Add new admin role state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Email transport (SMTP / Resend) form state
  const [smtpHostInput, setSmtpHostInput] = useState('smtp.gmail.com');
  const [smtpPortInput, setSmtpPortInput] = useState('587');
  const [smtpUserInput, setSmtpUserInput] = useState('');
  const [smtpPassInput, setSmtpPassInput] = useState('');
  const [resendKeyInput, setResendKeyInput] = useState('');
  const [savingTransport, setSavingTransport] = useState(false);

  const syncSettingsFromOverview = (ov: AdminMembershipsOverview) => {
    setWhatsappInput(ov.config.whatsappNumber || '');
    setAdminEmailInput(ov.config.adminEmail || '');
    setSupportEmailInput(ov.config.supportEmail || '');
    setSupportNoteEnInput(ov.config.supportNoteEn || '');
    setSupportNoteUrInput(ov.config.supportNoteUr || '');
  };

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const [res, trRes] = await Promise.all([
        fetchAdminMembershipsOverview(),
        fetchAdminEmailTransport().catch(() => null),
      ]);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
        if (res.code === 'ADMIN_AUTH_REQUIRED' || res.code === 'ADMIN_FORBIDDEN') {
          setAuthenticatedAdmin(null);
        }
      } else {
        setOverview(res);
        syncSettingsFromOverview(res);
      }
      if (trRes && trRes.success && trRes.transport) {
        setSmtpHostInput(trRes.transport.smtpHost || 'smtp.gmail.com');
        setSmtpPortInput(String(trRes.transport.smtpPort || 587));
        setSmtpUserInput(trRes.transport.smtpUser || '');
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Could not load admin dashboard overview.' });
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const status = await fetchAdminAuthStatus();
        if (!active) return;
        setHasConfiguredAdmins(status.hasConfiguredAdmins);
        if (status.configuredAdminEmail && !authEmail) {
          setAuthEmail(status.configuredAdminEmail);
        }
        if (status.authenticated && status.admin) {
          setAuthenticatedAdmin(status.admin);
          await loadOverview();
        }
      } catch {
        // ignore
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  // Auto-open request from ?request=ORDER_ID deep link once overview loads
  useEffect(() => {
    if (!overview || typeof window === 'undefined') return;
    const reqParam = new URLSearchParams(window.location.search).get('request');
    if (reqParam) {
      const found = overview.requests.find((r) => r.id === reqParam);
      if (found) {
        setSelectedRequestId(found.id);
        setActiveTab('requests');
      }
    }
  }, [overview?.requests.length]);

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (authPassword !== authConfirmPassword) {
      setAuthError('Password and Confirm Password do not match.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await bootstrapAdminAccount({
        name: authName.trim(),
        email: authEmail.trim(),
        password: authPassword,
        confirmPassword: authConfirmPassword,
      });
      if ('error' in res) {
        setAuthError(res.error);
      } else {
        setAuthenticatedAdmin(res.admin);
        setHasConfiguredAdmins(true);
        setAuthPassword('');
        setAuthConfirmPassword('');
        await loadOverview();
      }
    } catch {
      setAuthError('Network error initializing owner admin.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const res = await loginAdminAccount({
        email: authEmail.trim(),
        password: authPassword,
      });
      if ('error' in res) {
        setAuthError(res.error);
      } else {
        setAuthenticatedAdmin(res.admin);
        setAuthPassword('');
        await loadOverview();
      }
    } catch {
      setAuthError('Network error signing into FEVIQO Admin.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdminAccount();
    setAuthenticatedAdmin(null);
    setOverview(null);
    setSelectedRequestId(null);
  };

  const handleApproveRequest = async (orderId: string) => {
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await approvePaymentOrder(orderId);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setConfirmApproveId(null);
        setFeedbackBanner({
          type: 'success',
          text: `Payment request ${orderId} approved and customer membership activated immediately.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to approve payment request.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleRejectRequest = async (orderId: string) => {
    if (!rejectReasonInput.trim() || rejectReasonInput.trim().length < 3) {
      setFeedbackBanner({ type: 'error', text: 'Please enter a clear rejection reason before rejecting.' });
      return;
    }
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await rejectPaymentOrder(orderId, rejectReasonInput.trim());
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setRejectReasonInput('');
        setFeedbackBanner({
          type: 'success',
          text: `Payment request ${orderId} rejected cleanly.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to reject payment request.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleRevokeMembership = async (membershipId: string) => {
    if (!revokeReasonInput.trim()) {
      setFeedbackBanner({ type: 'error', text: 'Please enter a reason to revoke this membership.' });
      return;
    }
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await revokeMembershipAccess(membershipId, revokeReasonInput.trim());
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setRevokingMembershipId(null);
        setRevokeReasonInput('');
        setFeedbackBanner({ type: 'success', text: `Membership ${membershipId} revoked.` });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to revoke membership.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setFeedbackBanner(null);
    try {
      const res = await updateMembershipSettings({
        whatsappNumber: whatsappInput.trim(),
        adminEmail: adminEmailInput.trim(),
        supportEmail: supportEmailInput.trim(),
        supportNoteEn: supportNoteEnInput.trim(),
        supportNoteUr: supportNoteUrInput.trim(),
      });
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        syncSettingsFromOverview(res.overview);
        setFeedbackBanner({ type: 'success', text: 'FEVIQO membership & payment settings saved.' });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUploadQr = async (planId: MembershipPlanId, file?: File) => {
    if (!file) return;
    setUploadingQrPlanId(planId);
    setFeedbackBanner(null);
    try {
      const res = await uploadPlanQrImage(planId, file);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setFeedbackBanner({ type: 'success', text: `Updated Bank QR image for ${planId.toUpperCase()} plan.` });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to upload QR image.' });
    } finally {
      setUploadingQrPlanId(null);
    }
  };

  const handleRetryEmail = async (notifId: string) => {
    setFeedbackBanner(null);
    try {
      const res = await retryEmailNotification(notifId);
      if (!res.success || res.error) {
        if (res.overview) setOverview(res.overview);
        setFeedbackBanner({ type: 'error', text: res.error || 'Email retry failed.' });
      } else if (res.overview) {
        setOverview(res.overview);
        setFeedbackBanner({ type: 'success', text: 'Admin notification email sent successfully.' });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to retry email notification.' });
    }
  };

  const handleAddAdminRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    setFeedbackBanner(null);
    try {
      const res = await grantAdminRole({
        name: newAdminName.trim(),
        email: newAdminEmail.trim(),
        password: newAdminPassword,
      });
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        setFeedbackBanner({ type: 'success', text: 'New FEVIQO admin account created and authorized.' });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to add admin role.' });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleToggleAdminActive = async (admin: SafeAdmin) => {
    setFeedbackBanner(null);
    try {
      const res = await updateAdminRoleStatus(admin.id, !admin.isActive);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setFeedbackBanner({
          type: 'success',
          text: `${admin.email} is now ${!admin.isActive ? 'active' : 'disabled'}.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to update admin status.' });
    }
  };

  const selectedRequest: MembershipOrder | undefined = selectedRequestId
    ? overview?.requests.find((r) => r.id === selectedRequestId)
    : undefined;

  const filteredRequests = (overview?.requests || []).filter((req) => {
    if (requestStatusFilter !== 'all' && req.status !== requestStatusFilter) return false;
    if (!requestSearch.trim()) return true;
    const q = requestSearch.toLowerCase();
    return (
      req.id.toLowerCase().includes(q) ||
      (req.customerName || '').toLowerCase().includes(q) ||
      (req.customerEmail || '').toLowerCase().includes(q) ||
      (req.customerPhone || '').toLowerCase().includes(q) ||
      req.planName.toLowerCase().includes(q)
    );
  });

  const filteredMemberships = (overview?.memberships || []).filter((m) => {
    if (membershipStatusFilter !== 'all' && m.status !== membershipStatusFilter) return false;
    if (!membershipSearch.trim()) return true;
    const q = membershipSearch.toLowerCase();
    return (
      m.customerName.toLowerCase().includes(q) ||
      m.customerEmail.toLowerCase().includes(q) ||
      m.customerPhone.toLowerCase().includes(q) ||
      m.planName.toLowerCase().includes(q)
    );
  });

  const formatDateTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B0B0D] font-sans flex flex-col">
      <Navbar
        onBookCall={onBookCall}
        onNavigateSection={onNavigateSection}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {authLoading ? (
          <div className="rounded-2xl bg-white border border-zinc-200 p-10 text-center text-sm text-zinc-600">
            Checking FEVIQO administrator authorization...
          </div>
        ) : !authenticatedAdmin ? (
          <div className="max-w-md mx-auto rounded-2xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Restricted Admin Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-[#0B0B0D]">
                {hasConfiguredAdmins ? 'FEVIQO Admin Sign In' : 'Initialize Primary Owner Admin'}
              </h1>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {hasConfiguredAdmins
                  ? 'Sign in with your authorized FEVIQO administrator credentials to review Bank QR payment proofs and manage memberships.'
                  : 'No administrator account is initialized yet. Create the primary owner admin account once to lock and protect this portal.'}
              </p>
            </div>

            {authError && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={hasConfiguredAdmins ? handleLogin : handleBootstrap} className="space-y-4">
              {!hasConfiguredAdmins && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={hasConfiguredAdmins ? 1 : 8}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder={hasConfiguredAdmins ? 'Enter admin password' : 'Minimum 8 characters'}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
                />
              </div>

              {!hasConfiguredAdmins && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="Re-enter admin password"
                    className="w-full px-3.5 py-2.5 text-sm border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-[#0B0B0D] text-sm font-semibold transition cursor-pointer disabled:opacity-60"
              >
                {authSubmitting
                  ? 'Verifying...'
                  : hasConfiguredAdmins
                  ? 'Sign In to Admin Panel'
                  : 'Create Primary Owner Admin'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Admin Workspace Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-zinc-200 p-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>FEVIQO Membership &amp; Payment Verification Admin</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0B0B0D] mt-1">
                  Payment Verification &amp; Subscriptions
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Signed in as <strong>{authenticatedAdmin.name}</strong> ({authenticatedAdmin.email})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={loadOverview}
                  disabled={loadingOverview}
                  className="px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOverview ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Admin</span>
                </button>
              </div>
            </div>

            {feedbackBanner && (
              <div
                role={feedbackBanner.type === 'error' ? 'alert' : 'status'}
                className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-4 ${
                  feedbackBanner.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span>{feedbackBanner.text}</span>
                <button
                  type="button"
                  onClick={() => setFeedbackBanner(null)}
                  className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Overview Metrics */}
            {overview && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { label: 'Total Members', value: overview.metrics.totalMembers, accent: 'text-[#0B0B0D]' },
                  { label: 'Active Plans', value: overview.metrics.activeMemberships, accent: 'text-[#16A34A]' },
                  { label: 'Pending Review', value: overview.metrics.pendingVerifications, accent: 'text-amber-600' },
                  { label: 'Awaiting Pay', value: overview.metrics.awaitingPayments, accent: 'text-zinc-600' },
                  { label: 'Approved', value: overview.metrics.approvedPayments, accent: 'text-emerald-700' },
                  { label: 'Rejected', value: overview.metrics.rejectedPayments, accent: 'text-red-600' },
                  { label: 'Expired', value: overview.metrics.expiredMemberships, accent: 'text-zinc-500' },
                  { label: 'Failed Emails', value: overview.metrics.failedEmails, accent: overview.metrics.failedEmails > 0 ? 'text-red-600' : 'text-zinc-500' },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-xl bg-white border border-zinc-200 p-3.5">
                    <div className="text-[11px] text-zinc-500 font-medium">{metric.label}</div>
                    <div className={`text-2xl font-bold tabular-nums mt-1 ${metric.accent}`}>{metric.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Admin Workspace Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
              {(
                [
                  { id: 'requests', label: 'Payment Verification Queue', icon: CheckCircle2 },
                  { id: 'memberships', label: 'Customer Memberships', icon: Users },
                  { id: 'config', label: 'QR Codes & Settings', icon: Settings },
                  { id: 'audit', label: 'Email Logs & Audit Trail', icon: ClipboardList },
                  { id: 'roles', label: 'Admin Roles', icon: ShieldCheck },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer ${
                      active
                        ? 'bg-[#0B0B0D] text-white'
                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: PAYMENT VERIFICATION QUEUE */}
            {overview && activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'pending_verification', label: 'Pending Verification' },
                      { id: 'awaiting_payment', label: 'Awaiting Payment' },
                      { id: 'approved', label: 'Approved' },
                      { id: 'rejected', label: 'Rejected' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setRequestStatusFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          requestStatusFilter === f.id
                            ? 'bg-[#22C55E] text-[#0B0B0D]'
                            : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      placeholder="Search name, email, phone, request ID"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-zinc-200 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4">Request ID</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Plan &amp; Amount</th>
                        <th className="py-3.5 px-4">Selected Dramas</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-zinc-500">
                            No payment requests match the current filter.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-zinc-50/70">
                            <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-700 whitespace-nowrap">
                              {req.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-[#0B0B0D]">{req.customerName || 'Member'}</div>
                              <div className="text-zinc-500">{req.customerEmail}</div>
                              {req.customerPhone && <div className="text-zinc-400">{req.customerPhone}</div>}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-semibold text-[#0B0B0D]">
                                {req.planName} ({req.durationDays}d)
                              </div>
                              <div className="text-[#16A34A] font-bold tabular-nums">
                                PKR {req.amountPkr.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 max-w-[220px]">
                              {req.selectedDramaIds.map((id) => getDramaById(id)?.title || id).join(', ')}
                            </td>
                            <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                              {formatDateTime(req.proofSubmittedAt || req.createdAt)}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                                  req.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : req.status === 'pending_verification'
                                    ? 'bg-amber-50 text-amber-800'
                                    : req.status === 'rejected'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-zinc-100 text-zinc-700'
                                }`}
                              >
                                {req.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRequestId(req.id);
                                  setConfirmApproveId(null);
                                  setRejectReasonInput('');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-[#0B0B0D] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: MEMBERSHIPS MANAGEMENT */}
            {overview && activeTab === 'memberships' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {['all', 'active', 'expired', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setMembershipStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                          membershipStatusFilter === st
                            ? 'bg-[#22C55E] text-[#0B0B0D]'
                            : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={membershipSearch}
                      onChange={(e) => setMembershipSearch(e.target.value)}
                      placeholder="Search member name, email, phone"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-zinc-200 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Plan</th>
                        <th className="py-3.5 px-4">Selected Dramas</th>
                        <th className="py-3.5 px-4">Activated / Expires</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredMemberships.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-zinc-500">
                            No memberships recorded yet.
                          </td>
                        </tr>
                      ) : (
                        filteredMemberships.map((m) => (
                          <tr key={m.id} className="hover:bg-zinc-50/70">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-[#0B0B0D]">{m.customerName}</div>
                              <div className="text-zinc-500">{m.customerEmail}</div>
                              {m.customerPhone && <div className="text-zinc-400">{m.customerPhone}</div>}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-semibold">{m.planName}</div>
                              <div className="text-zinc-500">PKR {m.pricePkr.toLocaleString()}</div>
                            </td>
                            <td className="py-3.5 px-4 max-w-[220px]">
                              {m.selectedDramaIds.map((id) => getDramaById(id)?.title || id).join(', ')}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-zinc-600">
                              <div>Start: {formatDateTime(m.activatedAt)}</div>
                              <div>End: {formatDateTime(m.expiresAt)}</div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                                  m.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : m.status === 'cancelled'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-zinc-100 text-zinc-700'
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              {m.status === 'active' ? (
                                revokingMembershipId === m.id ? (
                                  <div className="inline-flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={revokeReasonInput}
                                      onChange={(e) => setRevokeReasonInput(e.target.value)}
                                      placeholder="Reason to revoke"
                                      className="px-2.5 py-1 border border-zinc-300 rounded-lg text-xs"
                                    />
                                    <button
                                      type="button"
                                      disabled={actionBusy}
                                      onClick={() => handleRevokeMembership(m.id)}
                                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-semibold cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRevokingMembershipId(null)}
                                      className="px-2 py-1 text-zinc-500 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRevokingMembershipId(m.id);
                                      setRevokeReasonInput('');
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold cursor-pointer"
                                  >
                                    Revoke Access
                                  </button>
                                )
                              ) : (
                                <span className="text-zinc-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: QR CODES & SETTINGS */}
            {overview && activeTab === 'config' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-2xl bg-white border border-zinc-200 p-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-[#0B0B0D]">Plan Bank QR Codes</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Each membership plan displays its corresponding uncropped Bank QR code below. Upload a replacement image anytime if your bank QR updates.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MEMBERSHIP_PLANS.map((plan) => {
                      const imgSrc =
                        plan.id === 'starter'
                          ? overview.config.starterQrImage
                          : plan.id === 'standard'
                          ? overview.config.standardQrImage
                          : plan.id === 'plus'
                          ? overview.config.plusQrImage
                          : overview.config.vipQrImage;

                      return (
                        <div key={plan.id} className="rounded-xl border border-zinc-200 bg-[#F8FAFC] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{plan.name}</span>
                            <span className="text-xs font-semibold text-[#16A34A]">
                              PKR {plan.pricePkr.toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-white rounded-lg border border-zinc-200 p-2 h-44 flex items-center justify-center">
                            <img
                              src={imgSrc}
                              alt={`${plan.name} Bank QR`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <label className="w-full py-2 px-3 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {uploadingQrPlanId === plan.id ? 'Uploading...' : `Replace ${plan.name} QR`}
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                              className="sr-only"
                              onChange={(e) => handleUploadQr(plan.id, e.target.files?.[0])}
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <form
                  onSubmit={handleSaveSettings}
                  className="lg:col-span-5 rounded-2xl bg-white border border-zinc-200 p-6 space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#0B0B0D]">Notification &amp; Support Settings</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Configure WhatsApp proof forwarding, admin verification emails, and customer support notes.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      WhatsApp Number (International digits, e.g. 923001234567)
                    </label>
                    <input
                      type="text"
                      value={whatsappInput}
                      onChange={(e) => setWhatsappInput(e.target.value)}
                      placeholder="Leave empty until configured"
                      className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Admin Verification Email Recipient
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={supportEmailInput}
                      onChange={(e) => setSupportEmailInput(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Support Note (EN)</label>
                    <textarea
                      rows={2}
                      value={supportNoteEnInput}
                      onChange={(e) => setSupportNoteEnInput(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Support Note (Urdu)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={supportNoteUrInput}
                      onChange={(e) => setSupportNoteUrInput(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm font-urdu-slim border border-zinc-300 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-sm font-semibold transition cursor-pointer disabled:opacity-60"
                  >
                    {savingSettings ? 'Saving Settings...' : 'Save Settings'}
                  </button>
                </form>

                {/* Email Delivery Credentials (Gmail SMTP App Password / Resend API Key) */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSavingTransport(true);
                    setFeedbackBanner(null);
                    try {
                      const res = await saveAdminEmailTransport({
                        smtpHost: smtpHostInput.trim(),
                        smtpPort: Number(smtpPortInput) || 587,
                        smtpUser: smtpUserInput.trim(),
                        smtpPass: smtpPassInput.trim() || undefined,
                        resendApiKey: resendKeyInput.trim() ? resendKeyInput.trim() : undefined,
                        sendTestEmail: true,
                      });
                      if ('error' in res) {
                        setFeedbackBanner({ type: 'error', text: res.error });
                      } else {
                        setOverview(res.overview);
                        setSmtpPassInput('');
                        setResendKeyInput('');
                        if (res.testResult?.success) {
                          setFeedbackBanner({
                            type: 'success',
                            text: `Email credentials saved & verified via ${res.testResult.provider?.toUpperCase()}! Check inbox for test email.`,
                          });
                        } else {
                          setFeedbackBanner({
                            type: 'error',
                            text: `Saved settings, but test email failed: ${res.testResult?.error || 'Verify Gmail App Password or Resend key.'}`,
                          });
                        }
                      }
                    } catch {
                      setFeedbackBanner({ type: 'error', text: 'Failed to save email transport credentials.' });
                    } finally {
                      setSavingTransport(false);
                    }
                  }}
                  className="lg:col-span-12 rounded-2xl bg-white border border-zinc-200 p-6 space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#0B0B0D]">
                      Email Delivery Credentials (Gmail SMTP App Password or Resend)
                    </h2>
                    <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                      Required for automatic admin verification alerts when a customer uploads a screenshot. For Gmail, enable 2-Step Verification and generate a 16-character App Password under Google Account → Security → App passwords.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={smtpHostInput}
                        onChange={(e) => setSmtpHostInput(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value={smtpPortInput}
                        onChange={(e) => setSmtpPortInput(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">SMTP Email (Sender)</label>
                      <input
                        type="email"
                        value={smtpUserInput}
                        onChange={(e) => setSmtpUserInput(e.target.value)}
                        placeholder="Sender email address"
                        className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        New Gmail App Password
                      </label>
                      <input
                        type="password"
                        value={smtpPassInput}
                        onChange={(e) => setSmtpPassInput(e.target.value)}
                        placeholder="16-character App Password"
                        className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Or Resend API Key (Optional Alternative)
                      </label>
                      <input
                        type="password"
                        value={resendKeyInput}
                        onChange={(e) => setResendKeyInput(e.target.value)}
                        placeholder="re_..."
                        className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingTransport}
                      className="py-2.5 px-5 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-[#0B0B0D] text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                    >
                      {savingTransport ? 'Testing Email Delivery...' : 'Save Credentials & Send Test Email'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: EMAIL LOGS & AUDIT TRAIL */}
            {overview && activeTab === 'audit' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-white border border-zinc-200 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#16A34A]" />
                    <h2 className="text-base font-bold text-[#0B0B0D]">Admin Email Notifications Log</h2>
                  </div>

                  {overview.emailNotifications.length === 0 ? (
                    <p className="text-xs text-zinc-500">No verification emails recorded yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto">
                      {overview.emailNotifications.map((notif) => (
                        <div key={notif.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[#0B0B0D] truncate">{notif.subject}</span>
                            <span
                              className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] shrink-0 ${
                                notif.status === 'sent'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {notif.status}
                            </span>
                          </div>
                          <div className="text-zinc-500">
                            To: {notif.to} · Attempts: {notif.attempts} · {formatDateTime(notif.lastAttemptAt)}
                          </div>
                          {notif.error && <div className="text-red-700">{notif.error}</div>}
                          {notif.status === 'failed' && (
                            <button
                              type="button"
                              onClick={() => handleRetryEmail(notif.id)}
                              className="px-3 py-1 rounded-lg bg-[#0B0B0D] text-white font-semibold cursor-pointer"
                            >
                              Retry Send
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-white border border-zinc-200 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#16A34A]" />
                    <h2 className="text-base font-bold text-[#0B0B0D]">Admin Action Audit Trail</h2>
                  </div>

                  {overview.auditLogs.length === 0 ? (
                    <p className="text-xs text-zinc-500">No admin actions recorded yet.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
                      {overview.auditLogs.map((log) => (
                        <div key={log.id} className="p-3 rounded-xl border border-zinc-200 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold uppercase text-[11px] text-[#0B0B0D]">{log.action}</span>
                            <span className="text-zinc-400">{formatDateTime(log.createdAt)}</span>
                          </div>
                          <div className="text-zinc-700">{log.details}</div>
                          <div className="text-[11px] text-zinc-500">By: {log.adminEmail}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: ADMIN ROLES */}
            {overview && activeTab === 'roles' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-2xl bg-white border border-zinc-200 p-6 space-y-4">
                  <h2 className="text-lg font-bold text-[#0B0B0D]">Authorized Administrators</h2>
                  <div className="divide-y divide-zinc-100">
                    {overview.admins.map((adm) => (
                      <div key={adm.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <div className="font-bold text-[#0B0B0D] text-sm">{adm.name}</div>
                          <div className="text-zinc-600">{adm.email}</div>
                          <div className="text-zinc-400 mt-0.5">Created by: {adm.createdBy}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-md font-bold uppercase text-[11px] ${
                              adm.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {adm.isActive ? 'Active' : 'Disabled'}
                          </span>
                          {adm.id !== authenticatedAdmin.id && (
                            <button
                              type="button"
                              onClick={() => handleToggleAdminActive(adm)}
                              className="px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 font-semibold cursor-pointer"
                            >
                              {adm.isActive ? 'Revoke Admin' : 'Restore Admin'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={handleAddAdminRole}
                  className="lg:col-span-5 rounded-2xl bg-white border border-zinc-200 p-6 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#16A34A]" />
                    <h2 className="text-lg font-bold text-[#0B0B0D]">Grant Admin Role</h2>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Temporary Password (min 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-zinc-300 rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingAdmin}
                    className="w-full py-2.5 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-[#0B0B0D] text-xs font-semibold transition cursor-pointer"
                  >
                    {creatingAdmin ? 'Creating Admin...' : 'Grant Admin Access'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* Request Detail & Full Proof Inspector Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedRequestId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                  Verification Request Detail
                </div>
                <h3 className="text-xl font-bold text-[#0B0B0D] mt-0.5">
                  {selectedRequest.planName} — PKR {selectedRequest.amountPkr.toLocaleString()} ({selectedRequest.durationDays} Days)
                </h3>
                <div className="text-xs font-mono text-zinc-500 mt-0.5">{selectedRequest.id}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestId(null)}
                className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Proof Screenshot Viewer */}
              <div className="md:col-span-7 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-2">
                <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                  Customer Payment Proof Screenshot
                </div>
                {selectedRequest.hasProof ? (
                  <div className="bg-white rounded-xl border border-zinc-200 p-2 flex items-center justify-center min-h-[320px]">
                    <img
                      src={`/api/membership/orders/${encodeURIComponent(selectedRequest.id)}/proof?t=${encodeURIComponent(selectedRequest.updatedAt)}`}
                      alt={`Payment proof for ${selectedRequest.id}`}
                      className="max-w-full max-h-[520px] object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="h-60 flex items-center justify-center text-xs text-zinc-500 bg-white rounded-xl border border-dashed border-zinc-300">
                    No payment screenshot has been uploaded for this request yet.
                  </div>
                )}
              </div>

              {/* Request Metadata & Approve / Reject Actions */}
              <div className="md:col-span-5 space-y-5">
                <div className="rounded-xl border border-zinc-200 p-4 space-y-2.5 text-xs">
                  <div>
                    <span className="text-zinc-500">Customer Name:</span>{' '}
                    <strong className="text-[#0B0B0D]">{selectedRequest.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Customer Email:</span>{' '}
                    <strong className="text-[#0B0B0D]">{selectedRequest.customerEmail}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Phone Number:</span>{' '}
                    <strong className="text-[#0B0B0D]">{selectedRequest.customerPhone || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Selected Dramas:</span>{' '}
                    <strong className="text-[#0B0B0D]">
                      {selectedRequest.selectedDramaIds.map((d) => getDramaById(d)?.title || d).join(', ')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Submitted At:</span>{' '}
                    <strong>{formatDateTime(selectedRequest.proofSubmittedAt || selectedRequest.createdAt)}</strong>
                  </div>
                  {selectedRequest.paymentNote && (
                    <div>
                      <span className="text-zinc-500">Customer Note:</span>{' '}
                      <strong>{selectedRequest.paymentNote}</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-zinc-500">Current Status:</span>{' '}
                    <strong className="uppercase">{selectedRequest.status.replace('_', ' ')}</strong>
                  </div>
                  {selectedRequest.reviewedByAdminEmail && (
                    <div>
                      <span className="text-zinc-500">Reviewed By:</span>{' '}
                      <strong>{selectedRequest.reviewedByAdminEmail}</strong> ({formatDateTime(selectedRequest.reviewedAt)})
                    </div>
                  )}
                  {selectedRequest.rejectionReason && (
                    <div className="text-red-700">
                      <span>Rejection Reason:</span> <strong>{selectedRequest.rejectionReason}</strong>
                    </div>
                  )}
                </div>

                {selectedRequest.status !== 'approved' && (
                  <div className="space-y-4">
                    {/* Approve Section with Confirmation Guard */}
                    {confirmApproveId !== selectedRequest.id ? (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => setConfirmApproveId(selectedRequest.id)}
                        className="w-full py-3 px-4 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Payment &amp; Activate Membership</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                        <p className="text-xs font-semibold text-emerald-950">
                          Confirm approval for PKR {selectedRequest.amountPkr.toLocaleString()}? This immediately activates {selectedRequest.planName} ({selectedRequest.durationDays} days).
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => handleApproveRequest(selectedRequest.id)}
                            className="flex-1 py-2 rounded-lg bg-[#16A34A] text-white text-xs font-bold cursor-pointer"
                          >
                            {actionBusy ? 'Approving...' : 'Yes, Confirm Approve'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmApproveId(null)}
                            className="px-3 py-2 rounded-lg border border-zinc-300 bg-white text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reject Section (Reason Required) */}
                    {selectedRequest.status !== 'rejected' && (
                      <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2.5">
                        <label className="block text-xs font-bold text-red-900">
                          Reject Payment (Reason Required)
                        </label>
                        <textarea
                          rows={2}
                          value={rejectReasonInput}
                          onChange={(e) => setRejectReasonInput(e.target.value)}
                          placeholder="e.g. Amount does not match plan or screenshot is blurry"
                          className="w-full px-3 py-2 text-xs bg-white border border-red-200 rounded-lg focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => handleRejectRequest(selectedRequest.id)}
                          className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Payment</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer
        onBookCall={onBookCall}
        onGetStarted={onBookCall}
        onNavigateSection={onNavigateSection}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={() => onNavigateFlow()}
        onNavigatePage={onNavigatePage}
      />
    </div>
  );
};

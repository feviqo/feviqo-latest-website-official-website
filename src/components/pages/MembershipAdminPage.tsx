import React, { useState, useEffect, useCallback } from 'react';
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
  Plus,
  Cloud,
  Bell,
  Clock,
  Globe,
  Trash2,
  Tag,
  Gift,
  Edit2,
  Link2,
  Ban,
  RotateCcw,
  MessageSquare,
  Bot,
} from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { ReferralCampaignsPanel } from '../admin/ReferralCampaignsPanel';
import { MuxSecurityPanel } from '../admin/MuxSecurityPanel';
import { AppRoute } from '../../types';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  MEMBERSHIP_PLANS,
  MEMBERSHIP_DRAMAS,
  MembershipPlanId,
  PaymentRegion,
  getDramaById,
  getPlanById,
} from '../../data/membershipCatalog';
import {
  AdminMembershipsOverview,
  AdminPromoCodeView,
  MembershipOrder,
  PromoDiscountType,
  ReferralConfig,
  SafeAdmin,
  SafeMember,
  fetchAdminAuthStatus,
  bootstrapAdminAccount,
  loginAdminAccount,
  authenticateAdminWithGoogle,
  logoutAdminAccount,
  fetchAdminMembershipsOverview,
  approvePaymentOrder,
  rejectPaymentOrder,
  assignCustomerMembership,
  extendMembershipByAdmin,
  runAdminLifecycleReminders,
  retryCustomerNotificationEmail,
  syncAdminCloudState,
  revokeMembershipAccess,
  deletePaymentOrderByAdmin,
  deleteMemberAccountByAdmin,
  deleteMembershipRecordByAdmin,
  updateMembershipSettings,
  uploadPlanQrImage,
  retryEmailNotification,
  grantAdminRole,
  updateAdminRoleStatus,
  fetchAdminEmailTransport,
  saveAdminEmailTransport,
  fetchAuthenticatedProofObjectUrl,
  createAdminPromoCode,
  updateAdminPromoCode,
  deleteAdminPromoCode,
  updateAdminReferralConfig,
  updateAdminReferralStatus,
  getStoredReferralCampaignsVault,
  blockUserEmailByAdmin,
  unblockUserEmailByAdmin,
  MembershipRecoveryReport,
  recoverAdminMemberships,
  saveAdminMembershipsVault,
  getStoredAdminMembershipsVault,
} from '../../services/membershipService';
import { auth, googleProvider } from '../../firebase';
import {
  isFirebaseAdminUser,
  pullAllCloudDataFromFirestore,
  pushAdminSnapshotToFirestore,
  CloudPushReport,
  deleteOrderInFirestore,
  deleteMemberCascadeInFirestore,
  deleteMembershipInFirestore,
  syncBlockedUserToFirestore,
  deleteBlockedUserInFirestore,
} from '../../services/firestoreMembershipSync';

interface MembershipAdminPageProps {
  onBookCall: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

type AdminTab =
  | 'requests'
  | 'memberships'
  | 'promos'
  | 'campaigns'
  | 'security'
  | 'accounts'
  | 'blocked'
  | 'notifications'
  | 'config'
  | 'audit'
  | 'roles';

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
  const [requestTypeFilter, setRequestTypeFilter] = useState<'all' | 'new' | 'renewal'>('all');
  const [requestMethodFilter, setRequestMethodFilter] = useState<'all' | 'bank_qr' | 'binance_qr'>('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [membershipStatusFilter, setMembershipStatusFilter] = useState<
    'all' | 'active' | 'expiring_7d' | 'expired' | 'pending_renewal' | 'cancelled' | 'history'
  >('all');
  const [membershipSearch, setMembershipSearch] = useState('');
  const [accountAuthFilter, setAccountAuthFilter] = useState<'all' | 'google' | 'email' | 'admin_assigned' | 'blocked'>('all');
  const [accountSearch, setAccountSearch] = useState('');

  // Permanent User Email Blocking state
  const [blockingMemberId, setBlockingMemberId] = useState<string | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [directBlockEmailInput, setDirectBlockEmailInput] = useState('');
  const [directBlockPhoneInput, setDirectBlockPhoneInput] = useState('');
  const [directBlockReasonInput, setDirectBlockReasonInput] = useState('');
  const [blockedSearch, setBlockedSearch] = useState('');

  // Missing-Membership Recovery & Cloud Push Diagnostics state
  const [recoveringMemberships, setRecoveringMemberships] = useState(false);
  const [recoveryReport, setRecoveryReport] = useState<MembershipRecoveryReport | null>(null);
  const [lastPushReport, setLastPushReport] = useState<CloudPushReport | null>(null);

  // Selected request detail & action state
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  // Revoke / Extend / Delete membership & lead state
  const [revokingMembershipId, setRevokingMembershipId] = useState<string | null>(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState('');
  const [extendingMembershipId, setExtendingMembershipId] = useState<string | null>(null);
  const [extendDaysInput, setExtendDaysInput] = useState('30');
  const [extendReasonInput, setExtendReasonInput] = useState('');
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
  const [deletingMembershipId, setDeletingMembershipId] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  // Lifecycle Scheduler & Customer Notifications state
  const [runningScheduler, setRunningScheduler] = useState(false);
  const [retryingCustNotifId, setRetryingCustNotifId] = useState<string | null>(null);

  // Settings form state
  const [whatsappInput, setWhatsappInput] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [supportEmailInput, setSupportEmailInput] = useState('');
  const [supportNoteEnInput, setSupportNoteEnInput] = useState('');
  const [supportNoteUrInput, setSupportNoteUrInput] = useState('');
  const [usdPriceInputs, setUsdPriceInputs] = useState<Record<MembershipPlanId, string>>({
    starter: '1.20',
    standard: '2.50',
    plus: '3.50',
    vip: '5.00',
  });
  const [intlInstructionsEnInput, setIntlInstructionsEnInput] = useState('');
  const [intlInstructionsUrInput, setIntlInstructionsUrInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingQrPlanId, setUploadingQrPlanId] = useState<MembershipPlanId | null>(null);
  const [uploadingBinanceQrPlanId, setUploadingBinanceQrPlanId] = useState<MembershipPlanId | null>(null);

  // Add new admin role state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Cloud sync & Firebase Google admin status
  const [firebaseAdminConnected, setFirebaseAdminConnected] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudSyncedAt, setCloudSyncedAt] = useState<string | null>(null);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);

  // Proof image viewer state (supports Bearer header fallback when third-party cookies are blocked)
  const [proofModalSrc, setProofModalSrc] = useState<string | null>(null);
  const [proofModalLoading, setProofModalLoading] = useState(false);

  // Assign Membership modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignExistingMemberId, setAssignExistingMemberId] = useState<string>('');
  const [assignFullName, setAssignFullName] = useState('');
  const [assignEmail, setAssignEmail] = useState('');
  const [assignPhone, setAssignPhone] = useState('');
  const [assignPassword, setAssignPassword] = useState('');
  const [assignPlanId, setAssignPlanId] = useState<MembershipPlanId>('vip');
  const [assignDurationDays, setAssignDurationDays] = useState('30');
  const [assignDramaIds, setAssignDramaIds] = useState<string[]>(
    MEMBERSHIP_DRAMAS.slice(0, 3).map((d) => d.id)
  );
  const [assignNote, setAssignNote] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Email transport (SMTP / Resend) form state
  const [smtpHostInput, setSmtpHostInput] = useState('smtp.gmail.com');
  const [smtpPortInput, setSmtpPortInput] = useState('587');
  const [smtpUserInput, setSmtpUserInput] = useState('');
  const [smtpPassInput, setSmtpPassInput] = useState('');
  const [resendKeyInput, setResendKeyInput] = useState('');
  const [savingTransport, setSavingTransport] = useState(false);
  const [testingTransport, setTestingTransport] = useState(false);
  const [transportStatus, setTransportStatus] = useState<{
    smtpConfigured: boolean;
    smtpSource?: string;
    resendConfigured: boolean;
    resendSource?: string;
    notificationRecipients?: string[];
  } | null>(null);

  // Promo Codes & Referral Program Admin State
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoCodeField, setPromoCodeField] = useState('');
  const [promoDescField, setPromoDescField] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<PromoDiscountType>('percentage');
  const [promoPercentField, setPromoPercentField] = useState('20');
  const [promoMaxPkrField, setPromoMaxPkrField] = useState('');
  const [promoMaxUsdField, setPromoMaxUsdField] = useState('');
  const [promoAmtPkrField, setPromoAmtPkrField] = useState('150');
  const [promoAmtUsdField, setPromoAmtUsdField] = useState('0.50');
  const [promoMinPkrField, setPromoMinPkrField] = useState('0');
  const [promoMinUsdField, setPromoMinUsdField] = useState('0');
  const [promoPlansField, setPromoPlansField] = useState<MembershipPlanId[]>([]);
  const [promoUsageLimitField, setPromoUsageLimitField] = useState('');
  const [promoPerUserLimitField, setPromoPerUserLimitField] = useState('1');
  const [promoExpiresAtField, setPromoExpiresAtField] = useState('');
  const [promoIsActiveField, setPromoIsActiveField] = useState(true);
  const [savingPromo, setSavingPromo] = useState(false);
  const [deletingPromoId, setDeletingPromoId] = useState<string | null>(null);
  const [promoSearch, setPromoSearch] = useState('');

  const [refEnabled, setRefEnabled] = useState(true);
  const [refRewardType, setRefRewardType] = useState<ReferralConfig['referrerRewardType']>('credit');
  const [refRewardPkr, setRefRewardPkr] = useState('100');
  const [refRewardUsd, setRefRewardUsd] = useState('0.5');
  const [refPromoPercent, setRefPromoPercent] = useState('20');
  const [refPromoExpiryDays, setRefPromoExpiryDays] = useState('30');
  const [refereeDiscType, setRefereeDiscType] = useState<ReferralConfig['refereeDiscountType']>('percentage');
  const [refereeDiscPercent, setRefereeDiscPercent] = useState('10');
  const [refereeDiscPkr, setRefereeDiscPkr] = useState('50');
  const [refereeDiscUsd, setRefereeDiscUsd] = useState('0.25');
  const [refMinOrderPkr, setRefMinOrderPkr] = useState('300');
  const [refMinOrderUsd, setRefMinOrderUsd] = useState('1');
  const [refMaxConversions, setRefMaxConversions] = useState('25');
  const [savingRefConfig, setSavingRefConfig] = useState(false);

  const [referralStatusFilter, setReferralStatusFilter] = useState<'all' | 'signed_up' | 'converted' | 'blocked'>('all');
  const [referralSearch, setReferralSearch] = useState('');
  const [updatingReferralId, setUpdatingReferralId] = useState<string | null>(null);

  const syncSettingsFromOverview = (ov: AdminMembershipsOverview) => {
    setWhatsappInput(ov.config.whatsappNumber || '');
    setAdminEmailInput(ov.config.adminEmail || '');
    setSupportEmailInput(ov.config.supportEmail || '');
    setSupportNoteEnInput(ov.config.supportNoteEn || '');
    setSupportNoteUrInput(ov.config.supportNoteUr || '');
    setUsdPriceInputs({
      starter: String(ov.config.usdPrices?.starter ?? 1.2),
      standard: String(ov.config.usdPrices?.standard ?? 2.5),
      plus: String(ov.config.usdPrices?.plus ?? 3.5),
      vip: String(ov.config.usdPrices?.vip ?? 5),
    });
    setIntlInstructionsEnInput(ov.config.internationalInstructionsEn || '');
    setIntlInstructionsUrInput(ov.config.internationalInstructionsUr || '');
    const rc = ov.referralConfig || ov.config.referralConfig;
    if (rc) {
      setRefEnabled(Boolean(rc.enabled));
      setRefRewardType(rc.referrerRewardType);
      setRefRewardPkr(String(rc.referrerRewardPkr ?? 100));
      setRefRewardUsd(String(rc.referrerRewardUsd ?? 0.5));
      setRefPromoPercent(String(rc.referrerPromoDiscountPercent ?? 20));
      setRefPromoExpiryDays(String(rc.referrerPromoExpiryDays ?? 30));
      setRefereeDiscType(rc.refereeDiscountType || 'none');
      setRefereeDiscPercent(String(rc.refereeDiscountPercent ?? 10));
      setRefereeDiscPkr(String(rc.refereeDiscountPkr ?? 50));
      setRefereeDiscUsd(String(rc.refereeDiscountUsd ?? 0.25));
      setRefMinOrderPkr(String(rc.minOrderPkrForReward ?? 300));
      setRefMinOrderUsd(String(rc.minOrderUsdForReward ?? 1));
      setRefMaxConversions(rc.maxConversionsPerReferrer === null ? '' : String(rc.maxConversionsPerReferrer ?? 25));
    }
  };

  const runBidirectionalCloudSync = useCallback(
    async (opts?: { interactive?: boolean; seedOverview?: AdminMembershipsOverview | null }) => {
      if (!isFirebaseAdminUser()) {
        if (!opts?.interactive) return null;
        await signInWithPopup(auth, googleProvider);
      }
      if (!isFirebaseAdminUser()) {
        throw new Error(
          'Signed-in Google account is not in the authorized Firestore admin list.'
        );
      }
      setCloudSyncing(true);
      try {
        const cloudSnap = await pullAllCloudDataFromFirestore();
        const localVault = getStoredAdminMembershipsVault();

        const mergeById = <T extends { id?: string }>(primary: T[] = [], fallback: T[] = []): T[] => {
          const map = new Map<string, T>();
          for (const item of fallback) {
            if (item?.id) map.set(item.id, item);
          }
          for (const item of primary) {
            if (item?.id) map.set(item.id, item);
          }
          return Array.from(map.values());
        };

        const mergedMembers = mergeById(cloudSnap.members, localVault?.members || []);
        const mergedBlocked = mergeById(cloudSnap.blockedUsers, localVault?.blockedUsers || []);
        const mergedOrders = mergeById(cloudSnap.orders, localVault?.orders || []);
        const mergedMemberships = mergeById(cloudSnap.memberships, localVault?.memberships || []);
        const mergedHistory = mergeById(cloudSnap.history, localVault?.history || []);
        const mergedNotifications = mergeById(
          cloudSnap.customerNotifications,
          localVault?.customerNotifications || []
        );

        const mergeRes = await syncAdminCloudState({
          members: mergedMembers,
          blockedUsers: mergedBlocked,
          orders: mergedOrders,
          memberships: mergedMemberships,
          history: mergedHistory,
          customerNotifications: mergedNotifications,
          schedulerRuns: cloudSnap.schedulerRuns,
          config: cloudSnap.config,
          referralCampaigns: cloudSnap.referralCampaigns,
          referralVisits: cloudSnap.referralVisits,
          referralUniqueVisitors: cloudSnap.referralUniqueVisitors,
          userCampaignAttributions: cloudSnap.userCampaignAttributions,
          orderCampaignAttributions: cloudSnap.orderCampaignAttributions,
          campaignCommissions: cloudSnap.campaignCommissions,
          commissionPayments: cloudSnap.commissionPayments,
          monthlyCommissionReports: cloudSnap.monthlyCommissionReports,
        });
        let latestOverview = 'overview' in mergeRes ? mergeRes.overview : opts?.seedOverview || null;
        if ('recovery' in mergeRes && mergeRes.recovery && mergeRes.recovery.recoveredCount > 0) {
          setRecoveryReport(mergeRes.recovery);
        }
        if (latestOverview) {
          saveAdminMembershipsVault(latestOverview);
          const vault = getStoredReferralCampaignsVault();
          const pushReport = await pushAdminSnapshotToFirestore({
            members: latestOverview.members,
            blockedUsers: latestOverview.blockedUsers,
            orders: latestOverview.requests,
            memberships: latestOverview.memberships,
            history: latestOverview.history,
            customerNotifications: latestOverview.customerNotifications,
            config: latestOverview.config,
            referralCampaigns: vault?.referralCampaigns || cloudSnap.referralCampaigns,
            referralVisits: vault?.referralVisits || cloudSnap.referralVisits,
            referralUniqueVisitors: vault?.referralUniqueVisitors || cloudSnap.referralUniqueVisitors,
            userCampaignAttributions: vault?.userCampaignAttributions || cloudSnap.userCampaignAttributions,
            orderCampaignAttributions: vault?.orderCampaignAttributions || cloudSnap.orderCampaignAttributions,
            campaignCommissions: vault?.campaignCommissions || cloudSnap.campaignCommissions,
            commissionPayments: vault?.commissionPayments || cloudSnap.commissionPayments,
            monthlyCommissionReports: vault?.monthlyCommissionReports || cloudSnap.monthlyCommissionReports,
          });
          setLastPushReport(pushReport);
          setOverview(latestOverview);
          syncSettingsFromOverview(latestOverview);
          setCloudSyncedAt(new Date().toISOString());
        }
        setFirebaseAdminConnected(isFirebaseAdminUser());
        return latestOverview;
      } finally {
        setCloudSyncing(false);
      }
    },
    []
  );

  const loadOverview = async (triggerCloudSync = false) => {
    setLoadingOverview(true);
    try {
      const [res, trRes] = await Promise.all([
        fetchAdminMembershipsOverview(),
        fetchAdminEmailTransport().catch(() => null),
      ]);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
        if (
          res.code === 'ADMIN_UNAUTHENTICATED' ||
          res.code === 'FORBIDDEN_NOT_ADMIN' ||
          res.code === 'ADMIN_AUTH_REQUIRED' ||
          res.code === 'ADMIN_FORBIDDEN'
        ) {
          setAuthenticatedAdmin(null);
        }
      } else {
        setOverview(res);
        saveAdminMembershipsVault(res);
        syncSettingsFromOverview(res);
        if (triggerCloudSync && isFirebaseAdminUser()) {
          runBidirectionalCloudSync({ seedOverview: res }).catch(() => {});
        }
      }
      if (trRes && trRes.success && trRes.transport) {
        setSmtpHostInput(trRes.transport.smtpHost || 'smtp.gmail.com');
        setSmtpPortInput(String(trRes.transport.smtpPort || 587));
        setSmtpUserInput(trRes.transport.smtpUser || '');
        setTransportStatus({
          smtpConfigured: trRes.transport.smtpConfigured,
          smtpSource: trRes.transport.smtpSource,
          resendConfigured: trRes.transport.resendConfigured,
          resendSource: trRes.transport.resendSource,
          notificationRecipients: trRes.transport.notificationRecipients,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Could not load admin dashboard overview.' });
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {
      setFirebaseAdminConnected(isFirebaseAdminUser());
    });
    return () => unsub();
  }, []);

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
          await loadOverview(true);
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
        await loadOverview(true);
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
        await loadOverview(true);
      }
    } catch {
      setAuthError('Network error signing into FEVIQO Admin.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const formatUnauthorizedDomainMessage = () => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
    return `Domain "${host}" is not authorized for Google popup sign-in yet. Add "${host}" in Firebase Console → Authentication → Settings → Authorized domains (Project: double-foundation-r98sv), or set FIREBASE_SERVICE_ACCOUNT_JSON in your server environment variables for automatic zero-popup Cloud DB persistence.`;
  };

  const handleGoogleAdminSignIn = async () => {
    setAuthError(null);
    setGoogleAuthLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      const res = await authenticateAdminWithGoogle(idToken);
      if ('error' in res) {
        setAuthError(res.error);
      } else {
        setAuthenticatedAdmin(res.admin);
        setFirebaseAdminConnected(isFirebaseAdminUser());
        await loadOverview(true);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in popup was closed before finishing.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setAuthError(formatUnauthorizedDomainMessage());
      } else {
        setAuthError(err?.message || 'Google administrator sign-in failed.');
      }
    } finally {
      setGoogleAuthLoading(false);
    }
  };

  const handleManualCloudSync = async () => {
    setFeedbackBanner(null);
    try {
      if (overview?.serverCloudConnected && !isFirebaseAdminUser()) {
        setCloudSyncing(true);
        try {
          const res = await syncAdminCloudState({
            members: overview.members,
            blockedUsers: overview.blockedUsers,
            orders: overview.requests,
            memberships: overview.memberships,
            history: overview.history,
            customerNotifications: overview.customerNotifications,
            schedulerRuns: overview.schedulerRuns,
            config: overview.config,
          });
          if ('error' in res) {
            setFeedbackBanner({ type: 'error', text: res.error });
          } else {
            setOverview(res.overview);
            syncSettingsFromOverview(res.overview);
            setCloudSyncedAt(new Date().toISOString());
            setFeedbackBanner({
              type: 'success',
              text: 'Server Cloud Firestore database synchronized successfully.',
            });
          }
        } finally {
          setCloudSyncing(false);
        }
        return;
      }

      await runBidirectionalCloudSync({ interactive: true, seedOverview: overview });
      setFeedbackBanner({
        type: 'success',
        text: 'Cloud Firestore database synchronized successfully.',
      });
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
        setFeedbackBanner({
          type: 'error',
          text: formatUnauthorizedDomainMessage(),
        });
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setFeedbackBanner({
          type: 'error',
          text: 'Google sign-in popup was closed before finishing Cloud Sync.',
        });
      } else {
        setFeedbackBanner({
          type: 'error',
          text: err?.message || 'Could not sync with Cloud Firestore.',
        });
      }
    }
  };

  const handleLogout = async () => {
    await logoutAdminAccount();
    await signOut(auth).catch(() => {});
    setAuthenticatedAdmin(null);
    setFirebaseAdminConnected(false);
    setOverview(null);
    setSelectedRequestId(null);
  };

  const mirrorToCloudQuietly = (ov: AdminMembershipsOverview) => {
    saveAdminMembershipsVault(ov);
    if (isFirebaseAdminUser()) {
      const vault = getStoredReferralCampaignsVault();
      pushAdminSnapshotToFirestore({
        members: ov.members,
        blockedUsers: ov.blockedUsers,
        orders: ov.requests,
        memberships: ov.memberships,
        history: ov.history,
        customerNotifications: ov.customerNotifications,
        config: ov.config,
        referralCampaigns: vault?.referralCampaigns,
        referralVisits: vault?.referralVisits,
        referralUniqueVisitors: vault?.referralUniqueVisitors,
        userCampaignAttributions: vault?.userCampaignAttributions,
        orderCampaignAttributions: vault?.orderCampaignAttributions,
        campaignCommissions: vault?.campaignCommissions,
        commissionPayments: vault?.commissionPayments,
        monthlyCommissionReports: vault?.monthlyCommissionReports,
      })
        .then((report) => {
          setLastPushReport(report);
          setCloudSyncedAt(new Date().toISOString());
        })
        .catch(() => {});
    }
  };

  const handleRecoverMissingMemberships = async () => {
    setRecoveringMemberships(true);
    setFeedbackBanner(null);
    try {
      let cloudSnap: Awaited<ReturnType<typeof pullAllCloudDataFromFirestore>> | null = null;
      if (!isFirebaseAdminUser() && !overview?.serverCloudConnected) {
        try {
          await signInWithPopup(auth, googleProvider);
          setFirebaseAdminConnected(isFirebaseAdminUser());
        } catch (err: any) {
          if (err?.code === 'auth/unauthorized-domain') {
            setFeedbackBanner({ type: 'error', text: formatUnauthorizedDomainMessage() });
          } else if (err?.code === 'auth/popup-closed-by-user') {
            setFeedbackBanner({
              type: 'error',
              text: 'Google sign-in popup was closed. Running local + server recovery only.',
            });
          }
        }
      }

      if (isFirebaseAdminUser()) {
        cloudSnap = await pullAllCloudDataFromFirestore();
      }
      const localVault = getStoredAdminMembershipsVault();

      const mergeById = <T extends { id?: string }>(primary: T[] = [], fallback: T[] = []): T[] => {
        const map = new Map<string, T>();
        for (const item of fallback) {
          if (item?.id) map.set(item.id, item);
        }
        for (const item of primary) {
          if (item?.id) map.set(item.id, item);
        }
        return Array.from(map.values());
      };

      const recoveryRes = await recoverAdminMemberships({
        members: mergeById(cloudSnap?.members || [], localVault?.members || []),
        blockedUsers: mergeById(cloudSnap?.blockedUsers || [], localVault?.blockedUsers || []),
        orders: mergeById(cloudSnap?.orders || [], localVault?.orders || []),
        memberships: mergeById(cloudSnap?.memberships || [], localVault?.memberships || []),
        history: mergeById(cloudSnap?.history || [], localVault?.history || []),
        notifications: mergeById(
          cloudSnap?.customerNotifications || [],
          localVault?.customerNotifications || []
        ),
      });

      if ('error' in recoveryRes) {
        setFeedbackBanner({ type: 'error', text: recoveryRes.error });
        return;
      }

      setOverview(recoveryRes.overview);
      saveAdminMembershipsVault(recoveryRes.overview);
      syncSettingsFromOverview(recoveryRes.overview);
      setRecoveryReport(recoveryRes.recovery);

      let pushNote = '';
      if (isFirebaseAdminUser()) {
        const refVault = getStoredReferralCampaignsVault();
        const pushReport = await pushAdminSnapshotToFirestore({
          members: recoveryRes.overview.members,
          blockedUsers: recoveryRes.overview.blockedUsers,
          orders: recoveryRes.overview.requests,
          memberships: recoveryRes.overview.memberships,
          history: recoveryRes.overview.history,
          customerNotifications: recoveryRes.overview.customerNotifications,
          config: recoveryRes.overview.config,
          referralCampaigns: refVault?.referralCampaigns || cloudSnap?.referralCampaigns,
          referralVisits: refVault?.referralVisits || cloudSnap?.referralVisits,
          referralUniqueVisitors: refVault?.referralUniqueVisitors || cloudSnap?.referralUniqueVisitors,
          userCampaignAttributions: refVault?.userCampaignAttributions || cloudSnap?.userCampaignAttributions,
          orderCampaignAttributions: refVault?.orderCampaignAttributions || cloudSnap?.orderCampaignAttributions,
          campaignCommissions: refVault?.campaignCommissions || cloudSnap?.campaignCommissions,
          commissionPayments: refVault?.commissionPayments || cloudSnap?.commissionPayments,
          monthlyCommissionReports: refVault?.monthlyCommissionReports || cloudSnap?.monthlyCommissionReports,
        });
        setLastPushReport(pushReport);
        setCloudSyncedAt(new Date().toISOString());
        pushNote = ` Cloud Firestore synced (${pushReport.syncedMemberships} memberships, ${pushReport.syncedOrders} orders${
          pushReport.failedCount > 0 ? `, ${pushReport.failedCount} skipped` : ''
        }).`;
      }

      const r = recoveryRes.recovery;
      setFeedbackBanner({
        type: 'success',
        text:
          r.recoveredCount > 0
            ? `Recovered ${r.recoveredCount} missing membership(s) (${r.recoveredActiveCount} active). Total active memberships now: ${r.totalActiveMemberships}.${pushNote}`
            : `Recovery scan complete: ${r.totalActiveMemberships} active membership(s) verified across ${r.totalOrders} order(s) and ${r.totalMembers} member(s).${
                r.pendingBigPlanOrders.length > 0
                  ? ` Found ${r.pendingBigPlanOrders.length} Plus/VIP order(s) awaiting approval.`
                  : ''
              }${pushNote}`,
      });
    } catch (err: any) {
      setFeedbackBanner({
        type: 'error',
        text: err?.message || 'Failed to recover missing memberships from Cloud Firestore.',
      });
    } finally {
      setRecoveringMemberships(false);
    }
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
        mirrorToCloudQuietly(res.overview);
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
        mirrorToCloudQuietly(res.overview);
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
        mirrorToCloudQuietly(res.overview);
        setFeedbackBanner({ type: 'success', text: `Membership ${membershipId} revoked.` });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to revoke membership.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteRequest = async (orderId: string) => {
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await deletePaymentOrderByAdmin(orderId);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setDeletingRequestId(null);
        if (selectedRequestId === orderId) {
          setSelectedRequestId(null);
        }
        if (isFirebaseAdminUser()) {
          deleteOrderInFirestore(res.deletedOrderId, res.deletedNotificationIds || [])
            .then(() => setCloudSyncedAt(new Date().toISOString()))
            .catch(() => {});
        }
        setFeedbackBanner({
          type: 'success',
          text: `Payment request ${orderId} deleted permanently.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to delete payment request.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteMembership = async (membershipId: string) => {
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await deleteMembershipRecordByAdmin(membershipId);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setDeletingMembershipId(null);
        if (isFirebaseAdminUser()) {
          deleteMembershipInFirestore(res.deletedMembershipId, res.deletedNotificationIds || [])
            .then(() => setCloudSyncedAt(new Date().toISOString()))
            .catch(() => {});
        }
        setFeedbackBanner({
          type: 'success',
          text: `Membership record ${membershipId} deleted permanently.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to delete membership record.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteAccount = async (memberId: string, label: string) => {
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await deleteMemberAccountByAdmin(memberId);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setDeletingAccountId(null);
        if (isFirebaseAdminUser()) {
          deleteMemberCascadeInFirestore(res.deletedIds)
            .then(() => setCloudSyncedAt(new Date().toISOString()))
            .catch(() => {});
        }
        setFeedbackBanner({
          type: 'success',
          text: `Account ${label} and its associated unpaid/inactive records were deleted.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to delete customer account.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleBlockUserEmail = async (params: {
    email?: string;
    phone?: string;
    memberId?: string;
    reason?: string;
  }) => {
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await blockUserEmailByAdmin(params);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setBlockingMemberId(null);
        setBlockReasonInput('');
        setDirectBlockEmailInput('');
        setDirectBlockPhoneInput('');
        setDirectBlockReasonInput('');
        if (isFirebaseAdminUser()) {
          syncBlockedUserToFirestore(res.blockedUser)
            .then(() => setCloudSyncedAt(new Date().toISOString()))
            .catch(() => {});
        }
        const cleanupParts: string[] = [];
        if (res.blockedUser.phone) cleanupParts.push(`phone ${res.blockedUser.phone} blocked`);
        if (res.cleanup?.deletedPendingOrdersCount) {
          cleanupParts.push(`${res.cleanup.deletedPendingOrdersCount} pending verification(s) deleted`);
        }
        if (res.cleanup?.revokedMembershipsCount) {
          cleanupParts.push(`${res.cleanup.revokedMembershipsCount} membership(s) revoked`);
        }
        if (res.cleanup?.cancelledJobsCount) {
          cleanupParts.push(`${res.cleanup.cancelledJobsCount} scheduled job(s) cancelled`);
        }
        if (res.cleanup?.cancelledManualNotificationsCount) {
          cleanupParts.push(`${res.cleanup.cancelledManualNotificationsCount} queued WhatsApp item(s) cancelled`);
        }
        const identity = res.blockedUser.email || res.blockedUser.phone || 'User';
        setFeedbackBanner({
          type: 'success',
          text: `${identity} permanently blocked${cleanupParts.length ? ` (${cleanupParts.join(', ')})` : ''}.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to block user and phone number.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleUnblockUserEmail = async (identifier: string, displayEmail?: string) => {
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await unblockUserEmailByAdmin(identifier);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        if (isFirebaseAdminUser()) {
          deleteBlockedUserInFirestore(res.unblockedUser.id)
            .then(() => setCloudSyncedAt(new Date().toISOString()))
            .catch(() => {});
        }
        setFeedbackBanner({
          type: 'success',
          text: `${displayEmail || res.unblockedUser.email} has been unblocked and website access is restored.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to unblock email address.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleOpenAssignModal = (prefillMember?: SafeMember) => {
    const defaultPlan = MEMBERSHIP_PLANS.find((p) => p.id === 'vip') || MEMBERSHIP_PLANS[0];
    setAssignExistingMemberId(prefillMember?.id || '');
    setAssignFullName(prefillMember?.fullName || '');
    setAssignEmail(prefillMember?.email || '');
    setAssignPhone(prefillMember?.phone || '');
    setAssignPassword('');
    setAssignPlanId(defaultPlan.id);
    setAssignDurationDays(String(defaultPlan.durationDays));
    setAssignDramaIds(MEMBERSHIP_DRAMAS.slice(0, 3).map((d) => d.id));
    setAssignNote('');
    setAssignModalOpen(true);
  };

  const handleAssignPlanChange = (nextPlanId: MembershipPlanId) => {
    setAssignPlanId(nextPlanId);
    const plan = MEMBERSHIP_PLANS.find((p) => p.id === nextPlanId);
    if (!plan) return;
    setAssignDurationDays(String(plan.durationDays));
    const limit = plan.dramaLimit === 'all' ? 3 : plan.dramaLimit;
    setAssignDramaIds((prev) => {
      const sliced = prev.slice(0, limit);
      if (sliced.length === limit) return sliced;
      const fill = MEMBERSHIP_DRAMAS.map((d) => d.id).filter((id) => !sliced.includes(id));
      return [...sliced, ...fill].slice(0, limit);
    });
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignSubmitting(true);
    setFeedbackBanner(null);
    try {
      const res = await assignCustomerMembership({
        fullName: assignFullName.trim(),
        email: assignEmail.trim(),
        phone: assignPhone.trim(),
        password: assignPassword.trim() || undefined,
        planId: assignPlanId,
        selectedDramaIds: assignDramaIds,
        durationDays: Number(assignDurationDays) || undefined,
        paymentNote: assignNote.trim() || undefined,
      });
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setAssignModalOpen(false);
        mirrorToCloudQuietly(res.overview);
        setFeedbackBanner({
          type: 'success',
          text: `${res.membership.planName} membership assigned and activated for ${res.member.fullName} (${res.member.email}).`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to assign customer membership.' });
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleExtendMembership = async (membershipId: string) => {
    const days = Math.round(Number(extendDaysInput));
    if (!Number.isFinite(days) || days < 1 || days > 3650) {
      setFeedbackBanner({ type: 'error', text: 'Enter a valid number of days (1 to 3650).' });
      return;
    }
    if (!extendReasonInput.trim() || extendReasonInput.trim().length < 2) {
      setFeedbackBanner({ type: 'error', text: 'Please enter a short reason or note for extending access.' });
      return;
    }
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await extendMembershipByAdmin(membershipId, days, extendReasonInput.trim());
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setExtendingMembershipId(null);
        setExtendReasonInput('');
        mirrorToCloudQuietly(res.overview);
        setFeedbackBanner({
          type: 'success',
          text: `Extended membership ${membershipId} by +${days} days.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to extend membership.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleRunSchedulerNow = async () => {
    setRunningScheduler(true);
    setFeedbackBanner(null);
    try {
      const res = await runAdminLifecycleReminders();
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        mirrorToCloudQuietly(res.overview);
        setFeedbackBanner({
          type: 'success',
          text: `Lifecycle check complete: ${res.runLog.summary}`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to run expiry & renewal scheduler.' });
    } finally {
      setRunningScheduler(false);
    }
  };

  const handleRetryCustomerEmail = async (notifId: string) => {
    setRetryingCustNotifId(notifId);
    setFeedbackBanner(null);
    try {
      const res = await retryCustomerNotificationEmail(notifId);
      if (res.overview) {
        setOverview(res.overview);
        mirrorToCloudQuietly(res.overview);
      }
      if (!res.success || res.error) {
        setFeedbackBanner({ type: 'error', text: res.error || 'Customer email delivery failed.' });
      } else {
        setFeedbackBanner({ type: 'success', text: 'Customer renewal/lifecycle email sent successfully.' });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to retry customer notification email.' });
    } finally {
      setRetryingCustNotifId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setFeedbackBanner(null);
    try {
      const parsedUsdPrices: Record<MembershipPlanId, number> = {
        starter: Math.max(0.5, Number(usdPriceInputs.starter) || 1.2),
        standard: Math.max(0.5, Number(usdPriceInputs.standard) || 2.5),
        plus: Math.max(0.5, Number(usdPriceInputs.plus) || 3.5),
        vip: Math.max(0.5, Number(usdPriceInputs.vip) || 5),
      };
      const res = await updateMembershipSettings({
        whatsappNumber: whatsappInput.trim(),
        adminEmail: adminEmailInput.trim(),
        supportEmail: supportEmailInput.trim(),
        supportNoteEn: supportNoteEnInput.trim(),
        supportNoteUr: supportNoteUrInput.trim(),
        usdPrices: parsedUsdPrices,
        internationalInstructionsEn: intlInstructionsEnInput.trim(),
        internationalInstructionsUr: intlInstructionsUrInput.trim(),
      });
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        syncSettingsFromOverview(res.overview);
        mirrorToCloudQuietly(res.overview);
        setFeedbackBanner({
          type: 'success',
          text: 'FEVIQO membership, USD pricing & payment settings saved.',
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUploadQr = async (
    planId: MembershipPlanId,
    file?: File,
    region: PaymentRegion = 'pakistan'
  ) => {
    if (!file) return;
    if (region === 'international') {
      setUploadingBinanceQrPlanId(planId);
    } else {
      setUploadingQrPlanId(planId);
    }
    setFeedbackBanner(null);
    try {
      const res = await uploadPlanQrImage(planId, file, region);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        mirrorToCloudQuietly(res.overview);
        setFeedbackBanner({
          type: 'success',
          text:
            region === 'international'
              ? `Updated Binance USD QR image for ${planId.toUpperCase()} plan.`
              : `Updated Bank PKR QR image for ${planId.toUpperCase()} plan.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to upload QR image.' });
    } finally {
      setUploadingQrPlanId(null);
      setUploadingBinanceQrPlanId(null);
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

  const resetPromoForm = () => {
    setEditingPromoId(null);
    setPromoCodeField('');
    setPromoDescField('');
    setPromoDiscountType('percentage');
    setPromoPercentField('20');
    setPromoMaxPkrField('');
    setPromoMaxUsdField('');
    setPromoAmtPkrField('150');
    setPromoAmtUsdField('0.50');
    setPromoMinPkrField('0');
    setPromoMinUsdField('0');
    setPromoPlansField([]);
    setPromoUsageLimitField('');
    setPromoPerUserLimitField('1');
    setPromoExpiresAtField('');
    setPromoIsActiveField(true);
  };

  const handleEditPromoClick = (promo: AdminPromoCodeView) => {
    setEditingPromoId(promo.id);
    setPromoCodeField(promo.code);
    setPromoDescField(promo.description || '');
    setPromoDiscountType(promo.discountType);
    setPromoPercentField(String(promo.discountPercent || 20));
    setPromoMaxPkrField(promo.maxDiscountPkr ? String(promo.maxDiscountPkr) : '');
    setPromoMaxUsdField(promo.maxDiscountUsd ? String(promo.maxDiscountUsd) : '');
    setPromoAmtPkrField(String(promo.discountAmountPkr || 0));
    setPromoAmtUsdField(String(promo.discountAmountUsd || 0));
    setPromoMinPkrField(String(promo.minPurchasePkr || 0));
    setPromoMinUsdField(String(promo.minPurchaseUsd || 0));
    setPromoPlansField(promo.applicablePlanIds || []);
    setPromoUsageLimitField(promo.usageLimit === null ? '' : String(promo.usageLimit));
    setPromoPerUserLimitField(String(promo.perUserLimit || 1));
    setPromoExpiresAtField(promo.expiresAt ? promo.expiresAt.slice(0, 16) : '');
    setPromoIsActiveField(Boolean(promo.isActive));
  };

  const handleSavePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPromo(true);
    setFeedbackBanner(null);
    try {
      const expiresIso = promoExpiresAtField.trim()
        ? new Date(promoExpiresAtField.trim()).toISOString()
        : undefined;
      const usageLim = promoUsageLimitField.trim() ? Number(promoUsageLimitField.trim()) : null;
      const payload = {
        code: promoCodeField.trim().toUpperCase(),
        description: promoDescField.trim(),
        discountType: promoDiscountType,
        discountPercent: Number(promoPercentField) || 0,
        discountAmountPkr: Number(promoAmtPkrField) || 0,
        discountAmountUsd: Number(promoAmtUsdField) || 0,
        maxDiscountPkr: promoMaxPkrField.trim() ? Number(promoMaxPkrField.trim()) : undefined,
        maxDiscountUsd: promoMaxUsdField.trim() ? Number(promoMaxUsdField.trim()) : undefined,
        minPurchasePkr: Number(promoMinPkrField) || 0,
        minPurchaseUsd: Number(promoMinUsdField) || 0,
        applicablePlanIds: promoPlansField,
        usageLimit: usageLim,
        perUserLimit: Math.max(1, Number(promoPerUserLimitField) || 1),
        expiresAt: expiresIso,
        isActive: promoIsActiveField,
      };
      const res = editingPromoId
        ? await updateAdminPromoCode(editingPromoId, {
            ...payload,
            maxDiscountPkr: payload.maxDiscountPkr ?? null,
            maxDiscountUsd: payload.maxDiscountUsd ?? null,
            expiresAt: expiresIso ?? null,
          })
        : await createAdminPromoCode(payload);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        resetPromoForm();
        setFeedbackBanner({
          type: 'success',
          text: editingPromoId
            ? `Promo code ${res.promo.code} updated.`
            : `Promo code ${res.promo.code} created and activated.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to save promo code.' });
    } finally {
      setSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (promo: AdminPromoCodeView) => {
    setFeedbackBanner(null);
    try {
      const res = await updateAdminPromoCode(promo.id, { isActive: !promo.isActive });
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setFeedbackBanner({
          type: 'success',
          text: `Promo code ${promo.code} is now ${!promo.isActive ? 'active' : 'disabled'}.`,
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to toggle promo code status.' });
    }
  };

  const handleDeletePromo = async (promoId: string, code: string) => {
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await deleteAdminPromoCode(promoId);
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setDeletingPromoId(null);
        if (editingPromoId === promoId) resetPromoForm();
        setFeedbackBanner({ type: 'success', text: `Promo code ${code} deleted.` });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to delete promo code.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveReferralConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRefConfig(true);
    setFeedbackBanner(null);
    try {
      const res = await updateAdminReferralConfig({
        enabled: refEnabled,
        referrerRewardType: refRewardType,
        referrerRewardPkr: Math.max(0, Number(refRewardPkr) || 0),
        referrerRewardUsd: Math.max(0, Number(refRewardUsd) || 0),
        referrerPromoDiscountPercent: Math.min(100, Math.max(1, Number(refPromoPercent) || 20)),
        referrerPromoExpiryDays: Math.max(1, Number(refPromoExpiryDays) || 30),
        refereeDiscountType: refereeDiscType,
        refereeDiscountPercent: Math.min(100, Math.max(0, Number(refereeDiscPercent) || 0)),
        refereeDiscountPkr: Math.max(0, Number(refereeDiscPkr) || 0),
        refereeDiscountUsd: Math.max(0, Number(refereeDiscUsd) || 0),
        minOrderPkrForReward: Math.max(0, Number(refMinOrderPkr) || 0),
        minOrderUsdForReward: Math.max(0, Number(refMinOrderUsd) || 0),
        maxConversionsPerReferrer: refMaxConversions.trim() ? Number(refMaxConversions.trim()) : null,
      });
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        syncSettingsFromOverview(res.overview);
        setFeedbackBanner({ type: 'success', text: 'Referral reward settings saved.' });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to save referral program settings.' });
    } finally {
      setSavingRefConfig(false);
    }
  };

  const handleToggleReferralStatus = async (referralId: string, nextStatus: 'blocked' | 'signed_up') => {
    setUpdatingReferralId(referralId);
    setFeedbackBanner(null);
    try {
      const res = await updateAdminReferralStatus(
        referralId,
        nextStatus,
        nextStatus === 'blocked' ? 'Flagged by admin review' : undefined
      );
      if ('error' in res) {
        setFeedbackBanner({ type: 'error', text: res.error });
      } else {
        setOverview(res.overview);
        setFeedbackBanner({
          type: 'success',
          text: nextStatus === 'blocked' ? 'Referral marked as blocked.' : 'Referral eligibility restored.',
        });
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to update referral status.' });
    } finally {
      setUpdatingReferralId(null);
    }
  };

  const selectedRequest: MembershipOrder | undefined = selectedRequestId
    ? overview?.requests.find((r) => r.id === selectedRequestId)
    : undefined;

  useEffect(() => {
    if (!selectedRequest || !selectedRequest.hasProof) {
      setProofModalSrc(null);
      setProofModalLoading(false);
      return;
    }
    if (selectedRequest.proofDataUrl) {
      setProofModalSrc(selectedRequest.proofDataUrl);
      setProofModalLoading(false);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    setProofModalLoading(true);
    fetchAuthenticatedProofObjectUrl(selectedRequest.id, true).then((url) => {
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      objectUrl = url;
      setProofModalSrc(url);
      setProofModalLoading(false);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedRequest?.id, selectedRequest?.proofDataUrl, selectedRequest?.hasProof, selectedRequest?.updatedAt]);

  const resolvePackageDramaNames = (planId?: string, selectedDramaIds?: string[]): string[] => {
    const ids = Array.isArray(selectedDramaIds) ? [...selectedDramaIds] : [];
    if (planId === 'vip' && ids.length === 0) {
      for (const d of MEMBERSHIP_DRAMAS.slice(0, 3)) {
        ids.push(d.id);
      }
    }
    const cappedIds = planId === 'vip' ? ids.slice(0, 3) : ids;
    const seen = new Set<string>();
    const titles: string[] = [];
    for (const id of cappedIds) {
      const title = getDramaById(id)?.title || id;
      if (title && !seen.has(title)) {
        seen.add(title);
        titles.push(title);
      }
    }
    return titles;
  };

  const formatOrderAmount = (req: Pick<MembershipOrder, 'currency' | 'paymentMethod' | 'expectedAmount' | 'amountUsd' | 'amountPkr'>) => {
    if (req.currency === 'USD' || req.paymentMethod === 'binance_qr') {
      const usd = Number(req.expectedAmount ?? req.amountUsd ?? 0);
      return `$${usd.toFixed(2)} USD`;
    }
    return `PKR ${Number(req.amountPkr || 0).toLocaleString()}`;
  };

  const formatMembershipAmount = (
    m: { currency?: string; paymentMethod?: string; expectedAmount?: number; priceUsd?: number; pricePkr: number }
  ) => {
    if (m.currency === 'USD' || m.paymentMethod === 'binance_qr') {
      const usd = Number(m.expectedAmount ?? m.priceUsd ?? 0);
      return `$${usd.toFixed(2)} USD`;
    }
    return `PKR ${Number(m.pricePkr || 0).toLocaleString()}`;
  };

  const getProjectedExtendedExpiry = (req: MembershipOrder) => {
    const nowMs = Date.now();
    const existingMs = req.targetMembershipCurrentExpiry ? Date.parse(req.targetMembershipCurrentExpiry) : 0;
    const baseMs = Number.isFinite(existingMs) && existingMs > nowMs ? existingMs : nowMs;
    return new Date(baseMs + Math.max(1, req.durationDays) * 86400000).toISOString();
  };

  const isExpiringWithin7Days = (m: { status: string; expiresAt: string }) => {
    if (m.status !== 'active') return false;
    const ms = Date.parse(m.expiresAt) - Date.now();
    return Number.isFinite(ms) && ms > 0 && ms <= 7 * 86400000;
  };

  const filteredRequests = (overview?.requests || []).filter((req) => {
    if (requestStatusFilter !== 'all' && req.status !== requestStatusFilter) return false;
    const effectiveType = req.orderType === 'renewal' ? 'renewal' : 'new';
    if (requestTypeFilter !== 'all' && effectiveType !== requestTypeFilter) return false;
    const effectiveMethod = req.paymentMethod === 'binance_qr' ? 'binance_qr' : 'bank_qr';
    if (requestMethodFilter !== 'all' && effectiveMethod !== requestMethodFilter) return false;
    if (!requestSearch.trim()) return true;
    const q = requestSearch.toLowerCase();
    const dramaText = resolvePackageDramaNames(req.planId, req.selectedDramaIds).join(' ').toLowerCase();
    return (
      req.id.toLowerCase().includes(q) ||
      (req.customerName || '').toLowerCase().includes(q) ||
      (req.customerEmail || '').toLowerCase().includes(q) ||
      (req.customerPhone || '').toLowerCase().includes(q) ||
      req.planName.toLowerCase().includes(q) ||
      dramaText.includes(q)
    );
  });

  const filteredMemberships = (overview?.memberships || []).filter((m) => {
    if (membershipStatusFilter === 'active' && m.status !== 'active') return false;
    if (membershipStatusFilter === 'expired' && m.status !== 'expired') return false;
    if (membershipStatusFilter === 'cancelled' && m.status !== 'cancelled') return false;
    if (membershipStatusFilter === 'expiring_7d' && !isExpiringWithin7Days(m)) return false;
    if (membershipStatusFilter === 'pending_renewal' && !m.hasPendingRenewal) return false;
    if (membershipStatusFilter === 'history' && (!m.renewalHistory || m.renewalHistory.length === 0)) return false;
    if (!membershipSearch.trim()) return true;
    const q = membershipSearch.toLowerCase();
    const dramaText = resolvePackageDramaNames(m.planId, m.selectedDramaIds).join(' ').toLowerCase();
    return (
      m.customerName.toLowerCase().includes(q) ||
      m.customerEmail.toLowerCase().includes(q) ||
      m.customerPhone.toLowerCase().includes(q) ||
      m.planName.toLowerCase().includes(q) ||
      dramaText.includes(q)
    );
  });

  const getMemberAuthMethod = (member: Pick<SafeMember, 'ownerUid' | 'authMethod'>): 'google' | 'email' | 'admin_assigned' => {
    if (member.authMethod) return member.authMethod;
    if (member.ownerUid && member.ownerUid !== 'admin_assigned' && member.ownerUid !== 'email_member') {
      return 'google';
    }
    if (member.ownerUid === 'admin_assigned') return 'admin_assigned';
    return 'email';
  };

  const memberByIdMap = new Map((overview?.members || []).map((m) => [m.id, m]));

  const blockedUsersList = overview?.blockedUsers || [];
  const blockedEmailsSet = new Set(
    blockedUsersList.map((b) => (b.email || '').trim().toLowerCase()).filter(Boolean)
  );

  const filteredAccounts = (overview?.members || []).filter((member) => {
    const method = getMemberAuthMethod(member);
    const isMemberBlocked = Boolean(
      member.isBlocked || blockedEmailsSet.has((member.email || '').trim().toLowerCase())
    );
    if (accountAuthFilter === 'blocked') {
      if (!isMemberBlocked) return false;
    } else if (accountAuthFilter !== 'all' && method !== accountAuthFilter) {
      return false;
    }
    if (!accountSearch.trim()) return true;
    const q = accountSearch.toLowerCase();
    const memberPlanDramas = [
      ...(overview?.memberships || [])
        .filter((s) => s.memberId === member.id)
        .map((s) => `${s.planName} ${resolvePackageDramaNames(s.planId, s.selectedDramaIds).join(' ')}`),
      ...(overview?.requests || [])
        .filter((r) => r.memberId === member.id)
        .map((r) => `${r.planName} ${resolvePackageDramaNames(r.planId, r.selectedDramaIds).join(' ')}`),
    ]
      .join(' ')
      .toLowerCase();
    return (
      member.fullName.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      (member.phone || '').toLowerCase().includes(q) ||
      memberPlanDramas.includes(q)
    );
  });

  const filteredBlockedUsers = blockedUsersList.filter((item) => {
    if (!blockedSearch.trim()) return true;
    const q = blockedSearch.toLowerCase();
    return (
      (item.email || '').toLowerCase().includes(q) ||
      (item.fullName || '').toLowerCase().includes(q) ||
      (item.reason || '').toLowerCase().includes(q) ||
      (item.blockedByAdminEmail || '').toLowerCase().includes(q)
    );
  });

  const googleAccountsCount = (overview?.members || []).filter(
    (m) => getMemberAuthMethod(m) === 'google'
  ).length;
  const emailAccountsCount = (overview?.members || []).filter(
    (m) => getMemberAuthMethod(m) === 'email'
  ).length;
  const adminAssignedAccountsCount = (overview?.members || []).filter(
    (m) => getMemberAuthMethod(m) === 'admin_assigned'
  ).length;
  const blockedAccountsCount = (overview?.members || []).filter(
    (m) => Boolean(m.isBlocked || blockedEmailsSet.has((m.email || '').trim().toLowerCase()))
  ).length;

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
    <div
      className="admin-workspace min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <Navbar
        onBookCall={onBookCall}
        onNavigateSection={onNavigateSection}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {authLoading ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center text-sm text-slate-600">
            Checking FEVIQO administrator authorization...
          </div>
        ) : !authenticatedAdmin ? (
          <div className="max-w-md mx-auto rounded-2xl bg-white border border-slate-200 p-7 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#16A34A] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Restricted Admin Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">
                {hasConfiguredAdmins ? 'FEVIQO Admin Sign In' : 'Initialize Primary Owner Admin'}
              </h1>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {hasConfiguredAdmins
                  ? 'Sign in with your authorized FEVIQO administrator credentials to review payment proofs and manage memberships.'
                  : 'No administrator account is initialized yet. Create the primary owner admin account once to lock and protect this portal.'}
              </p>
            </div>

            {authError && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700 flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={hasConfiguredAdmins ? handleLogin : handleBootstrap} className="space-y-4">
              {!hasConfiguredAdmins && (
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Admin Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Admin Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={hasConfiguredAdmins ? 1 : 8}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder={hasConfiguredAdmins ? 'Enter admin password' : 'Minimum 8 characters'}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              {!hasConfiguredAdmins && (
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="Re-enter admin password"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting || googleAuthLoading}
                className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-sm font-semibold transition cursor-pointer disabled:opacity-60"
              >
                {authSubmitting
                  ? 'Verifying...'
                  : hasConfiguredAdmins
                  ? 'Sign In to Admin Panel'
                  : 'Create Primary Owner Admin'}
              </button>
            </form>

            {hasConfiguredAdmins && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.06em] text-slate-400">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span>or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <button
                  type="button"
                  disabled={googleAuthLoading || authSubmitting}
                  onClick={handleGoogleAdminSignIn}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 text-[#0F172A] text-[13px] font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                  </svg>
                  <span>{googleAuthLoading ? 'Signing in...' : 'Sign In with Authorized Google'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Admin Workspace Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#16A34A] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>FEVIQO Admin · Membership &amp; Payment Operations</span>
                </div>
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A] tracking-normal leading-snug">
                  Payment Verification &amp; Subscriptions
                </h1>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-slate-600 leading-relaxed">
                  <span>
                    Signed in as <strong className="font-semibold text-[#0F172A]">{authenticatedAdmin.name}</strong> ({authenticatedAdmin.email})
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  {firebaseAdminConnected || overview?.serverCloudConnected ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                      <Cloud className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Cloud Sync Connected{overview?.serverCloudConnected && !firebaseAdminConnected ? ' (Server)' : ''}
                        {cloudSyncedAt ? ` · Updated ${new Date(cloudSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
                      <Cloud className="w-3.5 h-3.5 shrink-0" />
                      <span>Connect Cloud Sync for permanent persistence</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigatePage('admin-automation')}
                  className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition whitespace-nowrap shrink-0"
                  title="Manage WhatsApp Cloud API, membership automation, episode broadcasts & AI assistant"
                >
                  <Bot className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                  <span>WhatsApp Automation</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigatePage('admin-automation-whatsapp')}
                  className="px-4 py-2.5 rounded-xl border border-slate-900 bg-[#0B0B0D] hover:bg-[#22C55E] hover:border-[#22C55E] hover:text-[#0B0B0D] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition whitespace-nowrap shrink-0"
                  title="Open Manual One-Click WhatsApp Recipient Directory & Queue"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>Manual WhatsApp Center</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigatePage('admin-automation-leads')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition whitespace-nowrap shrink-0"
                  title="Open Video Editing Leads CRM & Unified WhatsApp Inbox"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                  <span>Video Leads &amp; Inbox</span>
                </button>
                <button
                  type="button"
                  onClick={handleRecoverMissingMemberships}
                  disabled={recoveringMemberships || cloudSyncing}
                  className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition whitespace-nowrap shrink-0"
                  title="Scan Cloud Firestore orders, history, notifications & local backup to restore any missing active or big-plan memberships"
                >
                  <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${recoveringMemberships ? 'animate-spin' : ''}`} />
                  <span>{recoveringMemberships ? 'Recovering...' : 'Recover Missing & Sync'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleManualCloudSync}
                  disabled={cloudSyncing || recoveringMemberships}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition whitespace-nowrap shrink-0 ${
                    firebaseAdminConnected || overview?.serverCloudConnected
                      ? 'border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      : 'bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] hover:text-white'
                  }`}
                >
                  <Cloud className={`w-3.5 h-3.5 shrink-0 ${cloudSyncing ? 'animate-pulse' : ''}`} />
                  <span>
                    {cloudSyncing
                      ? 'Syncing...'
                      : firebaseAdminConnected || overview?.serverCloudConnected
                      ? 'Sync Cloud DB'
                      : 'Connect Cloud Sync'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => loadOverview(true)}
                  disabled={loadingOverview}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition whitespace-nowrap shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loadingOverview ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {!firebaseAdminConnected && !overview?.serverCloudConnected && (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 text-[13px] leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Cloud Firestore Sync is not connected in this browser session.</strong>{' '}
                    Connect with your authorized Google account (<span className="font-mono text-xs">rexanmedia01@gmail.com</span>) so every approved Plus/VIP membership is permanently saved to Cloud Firestore and recovered across website updates.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRecoverMissingMemberships}
                  disabled={recoveringMemberships || cloudSyncing}
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap shrink-0"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Connect &amp; Recover Now</span>
                </button>
              </div>
            )}

            {recoveryReport && (
              <div className="rounded-2xl bg-white border border-indigo-200 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Membership Recovery &amp; Cloud Audit Report
                    </div>
                    <div className="text-sm text-slate-700 mt-1">
                      Active Memberships: <strong className="text-[#0F172A]">{recoveryReport.totalActiveMemberships}</strong> ·
                      Total Memberships: <strong className="text-[#0F172A]">{recoveryReport.totalMemberships}</strong> ·
                      Recovered Now: <strong className="text-emerald-700">{recoveryReport.recoveredCount}</strong>
                      {lastPushReport && (
                        <>
                          {' '}· Cloud Synced: <strong className="text-emerald-700">{lastPushReport.syncedMemberships} memberships / {lastPushReport.syncedOrders} orders</strong>
                          {lastPushReport.failedCount > 0 && (
                            <span className="text-amber-700"> ({lastPushReport.failedCount} doc warning(s))</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecoveryReport(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                    aria-label="Close recovery report"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {recoveryReport.recoveredMemberships.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-emerald-800">
                      Restored Missing Memberships ({recoveryReport.recoveredMemberships.length})
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {recoveryReport.recoveredMemberships.map((rec) => (
                        <div
                          key={`${rec.membershipId}-${rec.orderId}`}
                          className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{rec.customerName}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold uppercase text-[10px]">
                              {rec.planName} · {rec.status}
                            </span>
                          </div>
                          <div className="text-slate-600">{rec.customerEmail || 'No email recorded'}</div>
                          <div className="text-slate-500">
                            Expires: {formatDateTime(rec.expiresAt)} · Source: {rec.source.replace(/_/g, ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recoveryReport.pendingBigPlanOrders.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-amber-800">
                      Plus / VIP Big-Plan Orders Currently Pending or Awaiting Payment ({recoveryReport.pendingBigPlanOrders.length})
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {recoveryReport.pendingBigPlanOrders.map((ord) => (
                        <div
                          key={ord.orderId}
                          className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {ord.customerName} ({ord.planName})
                            </div>
                            <div className="text-slate-600 truncate">{ord.customerEmail}</div>
                            <div className="text-slate-500">
                              Status: {ord.status.replace(/_/g, ' ')} ·{' '}
                              {ord.currency === 'USD'
                                ? `$${(ord.amountUsd ?? 0).toFixed(2)} USD`
                                : `PKR ${ord.amountPkr.toLocaleString()}`}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('requests');
                              setSelectedRequestId(ord.orderId);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shrink-0 cursor-pointer"
                          >
                            Review Order
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {feedbackBanner && (
              <div
                role={feedbackBanner.type === 'error' ? 'alert' : 'status'}
                className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-4 leading-relaxed ${
                  feedbackBanner.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span>{feedbackBanner.text}</span>
                <button
                  type="button"
                  onClick={() => setFeedbackBanner(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Overview Metrics: Symmetric 4 Primary KPIs + 7-Column Status Ledger */}
            {overview && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'Total Members',
                      value: overview.metrics.totalMembers,
                      sub: 'Registered customer accounts',
                      accent: 'text-[#0F172A]',
                    },
                    {
                      label: 'Active Memberships',
                      value: overview.metrics.activeMemberships,
                      sub: 'Currently unlocked subscribers',
                      accent: 'text-[#16A34A]',
                    },
                    {
                      label: 'Pending Verification',
                      value: overview.metrics.pendingVerifications,
                      sub: 'Proofs awaiting admin review',
                      accent: overview.metrics.pendingVerifications > 0 ? 'text-amber-600' : 'text-[#0F172A]',
                    },
                    {
                      label: 'Binance USD Orders',
                      value: overview.metrics.internationalOrders ?? 0,
                      sub: 'International USD checkouts',
                      accent: 'text-[#0F172A]',
                    },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-2xl bg-white border border-slate-200 px-5 py-4 flex flex-col justify-between gap-1.5"
                    >
                      <div className="text-[13px] font-medium text-slate-500">{kpi.label}</div>
                      <div className={`text-3xl font-bold tabular-nums tracking-normal leading-tight ${kpi.accent}`}>
                        {kpi.value}
                      </div>
                      <div className="text-xs text-slate-400">{kpi.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-hidden">
                  {[
                    { label: 'Expiring ≤7d', value: overview.metrics.expiringIn7Days ?? 0, accent: 'text-amber-600' },
                    { label: 'Renewals', value: overview.metrics.pendingRenewals ?? 0, accent: 'text-blue-700' },
                    { label: 'Awaiting Pay', value: overview.metrics.awaitingPayments, accent: 'text-slate-700' },
                    { label: 'Approved', value: overview.metrics.approvedPayments, accent: 'text-emerald-700' },
                    { label: 'Rejected', value: overview.metrics.rejectedPayments, accent: 'text-red-600' },
                    { label: 'Expired', value: overview.metrics.expiredMemberships, accent: 'text-slate-600' },
                    {
                      label: 'Failed Emails',
                      value: overview.metrics.failedEmails,
                      accent: overview.metrics.failedEmails > 0 ? 'text-red-600' : 'text-slate-500',
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="px-4 py-3.5 flex flex-col justify-between gap-1">
                      <div className="text-xs font-medium text-slate-500 whitespace-nowrap">{metric.label}</div>
                      <div className={`text-xl font-bold tabular-nums tracking-normal ${metric.accent}`}>
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Growth, Promos & Referrals KPI Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 flex flex-col justify-between gap-1">
                    <div className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Total Referrals</span>
                    </div>
                    <div className="text-2xl font-bold text-[#0F172A] tabular-nums">
                      {overview.metrics.totalReferrals ?? 0}
                    </div>
                    <div className="text-xs text-slate-400 tabular-nums">
                      {overview.metrics.pendingReferrals ?? 0} pending · {overview.metrics.blockedReferrals ?? 0} blocked
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 flex flex-col justify-between gap-1">
                    <div className="text-[13px] font-medium text-slate-500">Referral Conversions</div>
                    <div className="text-2xl font-bold text-[#16A34A] tabular-nums">
                      {overview.metrics.convertedReferrals ?? 0}
                      <span className="text-sm font-semibold text-slate-500 ml-1.5">
                        ({overview.metrics.referralConversionRate ?? 0}%)
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">Approved invited purchases</div>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 flex flex-col justify-between gap-1">
                    <div className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Promo Redemptions</span>
                    </div>
                    <div className="text-2xl font-bold text-[#0F172A] tabular-nums">
                      {overview.metrics.promoRedemptions ?? 0}
                    </div>
                    <div className="text-xs text-slate-400 tabular-nums">
                      {overview.metrics.activePromoCodes ?? 0} active promo campaigns
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 flex flex-col justify-between gap-1">
                    <div className="text-[13px] font-medium text-slate-500">Discounts &amp; Referral Rewards</div>
                    <div className="text-base font-bold text-[#0F172A] tabular-nums leading-snug">
                      PKR {Math.round(overview.metrics.totalDiscountGivenPkr ?? 0).toLocaleString()} · $
                      {Number(overview.metrics.totalDiscountGivenUsd ?? 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400 tabular-nums">
                      Rewards: PKR {Math.round(overview.metrics.totalReferralRewardsPkr ?? 0).toLocaleString()} · $
                      {Number(overview.metrics.totalReferralRewardsUsd ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Workspace Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex items-center gap-1.5 overflow-x-auto">
              {(
                [
                  { id: 'requests', label: 'Payment Verification', icon: CheckCircle2 },
                  { id: 'memberships', label: 'Memberships', icon: Users },
                  { id: 'promos', label: 'Promo & Referrals', icon: Tag },
                  { id: 'campaigns', label: 'Referral Campaigns & Link Analytics', icon: Link2 },
                  { id: 'security', label: 'Mux Video Security', icon: Lock },
                  { id: 'accounts', label: 'Registered Accounts', icon: UserPlus },
                  { id: 'blocked', label: 'Blocked Users', icon: Ban },
                  { id: 'notifications', label: 'Reminders & Scheduler', icon: Bell },
                  { id: 'config', label: 'QR & USD Settings', icon: Settings },
                  { id: 'audit', label: 'Email & Audit Logs', icon: ClipboardList },
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
                    className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold inline-flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                    {tab.id === 'blocked' && blockedUsersList.length > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
                          active ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {blockedUsersList.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: PAYMENT VERIFICATION QUEUE */}
            {overview && activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'pending_verification', label: 'Pending Review' },
                        { id: 'awaiting_payment', label: 'Awaiting Pay' },
                        { id: 'approved', label: 'Approved' },
                        { id: 'rejected', label: 'Rejected' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setRequestStatusFilter(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition ${
                            requestStatusFilter === f.id
                              ? 'bg-white text-[#0F172A] shadow-xs'
                              : 'text-slate-600 hover:text-[#0F172A]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <select
                      value={requestTypeFilter}
                      onChange={(e) => setRequestTypeFilter(e.target.value as 'all' | 'new' | 'renewal')}
                      aria-label="Filter by request type"
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-[#0F172A]"
                    >
                      <option value="all">All Order Types</option>
                      <option value="new">New Memberships</option>
                      <option value="renewal">Renewals Only</option>
                    </select>

                    <select
                      value={requestMethodFilter}
                      onChange={(e) => setRequestMethodFilter(e.target.value as 'all' | 'bank_qr' | 'binance_qr')}
                      aria-label="Filter by payment method"
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-[#0F172A]"
                    >
                      <option value="all">All Methods</option>
                      <option value="bank_qr">PKR Bank QR</option>
                      <option value="binance_qr">USD Binance QR</option>
                    </select>
                  </div>

                  <div className="relative w-full xl:w-80 shrink-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      placeholder="Search customer, drama, or request ID"
                      className="w-full pl-10 pr-3.5 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 overflow-x-auto">
                  <table className="w-full text-left text-[13px] leading-relaxed">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-[0.06em] text-[11px] font-semibold">
                      <tr>
                        <th className="py-3.5 px-5 whitespace-nowrap">Request</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Customer</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Plan &amp; Amount</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Included Dramas</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Submitted</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Status</th>
                        <th className="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                            No payment requests match the current filter.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((req) => {
                          const isRenewal = req.orderType === 'renewal';
                          const isBinance = req.paymentMethod === 'binance_qr' || req.currency === 'USD';
                          const dramaNames = resolvePackageDramaNames(req.planId, req.selectedDramaIds);
                          return (
                            <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-4 px-5 align-top whitespace-nowrap">
                                <div className="font-mono text-xs font-medium text-[#0F172A] tabular-nums">
                                  {req.id}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                  <span className={isRenewal ? 'font-semibold text-blue-700' : 'font-medium text-slate-600'}>
                                    {isRenewal ? 'Renewal' : 'New'}
                                  </span>
                                  <span aria-hidden="true" className="text-slate-300">·</span>
                                  <span className={isBinance ? 'font-semibold text-amber-700' : 'font-semibold text-emerald-700'}>
                                    {isBinance ? 'Binance USD' : 'Bank PKR'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-5 align-top min-w-[200px]">
                                <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                                  <span>{req.customerName || 'Member'}</span>
                                  {(() => {
                                    const m = memberByIdMap.get(req.memberId);
                                    const method = m
                                      ? getMemberAuthMethod(m)
                                      : req.ownerUid && req.ownerUid !== 'admin_assigned' && req.ownerUid !== 'email_member'
                                      ? 'google'
                                      : null;
                                    return method === 'google' ? (
                                      <span className="text-[11px] font-medium text-blue-700">· Google</span>
                                    ) : null;
                                  })()}
                                </div>
                                <div className="text-xs text-slate-600 mt-0.5">{req.customerEmail}</div>
                                {(req.customerPhone || req.visitorCountryCode) && (
                                  <div className="text-xs text-slate-400 mt-0.5 tabular-nums flex items-center gap-1.5">
                                    {req.customerPhone && <span>{req.customerPhone}</span>}
                                    {req.customerPhone && req.visitorCountryCode && <span aria-hidden="true">·</span>}
                                    {req.visitorCountryCode && <span>Country: {req.visitorCountryCode}</span>}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-5 align-top whitespace-nowrap">
                                <div className="font-semibold text-[#0F172A]">
                                  {req.planName} · {req.durationDays}d
                                </div>
                                <div className="text-emerald-700 font-bold tabular-nums mt-0.5">
                                  {formatOrderAmount(req)}
                                </div>
                                {(req.promoCode || (req.discountTotalPkr || 0) > 0 || (req.discountTotalUsd || 0) > 0) && (
                                  <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1.5">
                                    {req.promoCode && (
                                      <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                                        {req.promoCode}
                                      </span>
                                    )}
                                    {((req.discountTotalPkr || 0) > 0 || (req.discountTotalUsd || 0) > 0) && (
                                      <span>
                                        Saved{' '}
                                        {isBinance
                                          ? `$${Number(req.discountTotalUsd || 0).toFixed(2)}`
                                          : `PKR ${Number(req.discountTotalPkr || 0).toLocaleString()}`}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {req.indicativeLocalDisplay && (
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    Ref: {req.indicativeLocalDisplay}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-5 align-top min-w-[210px] max-w-[260px]">
                                {req.planId === 'vip' && (
                                  <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-emerald-700 mb-1">
                                    VIP · 3 Dramas
                                  </div>
                                )}
                                <div className="space-y-0.5 text-[13px] font-medium text-[#0F172A]">
                                  {dramaNames.length > 0 ? (
                                    dramaNames.map((title) => (
                                      <div key={title} className="leading-snug">
                                        {title}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-5 align-top text-xs text-slate-600 whitespace-nowrap tabular-nums">
                                {formatDateTime(req.proofSubmittedAt || req.createdAt)}
                              </td>
                              <td className="py-4 px-5 align-top whitespace-nowrap">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                                    req.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : req.status === 'pending_verification'
                                      ? 'bg-amber-50 text-amber-800'
                                      : req.status === 'rejected'
                                      ? 'bg-red-50 text-red-700'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {req.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                                {(() => {
                                  const linkedToActive =
                                    req.status === 'approved' &&
                                    overview.memberships.some(
                                      (s) =>
                                        s.status === 'active' &&
                                        (s.orderId === req.id ||
                                          (Boolean(req.targetMembershipId) && s.id === req.targetMembershipId))
                                    );
                                  return (
                                    <div className="inline-flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedRequestId(req.id);
                                          setConfirmApproveId(null);
                                          setDeletingRequestId(null);
                                          setRejectReasonInput('');
                                        }}
                                        className="px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap"
                                      >
                                        <Eye className="w-3.5 h-3.5 shrink-0" />
                                        <span>Inspect</span>
                                      </button>
                                      {!linkedToActive && (
                                        deletingRequestId === req.id ? (
                                          <div className="inline-flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              disabled={actionBusy}
                                              onClick={() => handleDeleteRequest(req.id)}
                                              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60 whitespace-nowrap"
                                            >
                                              {actionBusy ? 'Deleting...' : 'Confirm'}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setDeletingRequestId(null)}
                                              className="px-2.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => setDeletingRequestId(req.id)}
                                            className="px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap"
                                            title="Delete unnecessary or unpaid request"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                            <span>Delete</span>
                                          </button>
                                        )
                                      )}
                                    </div>
                                  );
                                })()}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: MEMBERSHIPS MANAGEMENT */}
            {overview && activeTab === 'memberships' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                  <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100">
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'active', label: 'Active' },
                        { id: 'expiring_7d', label: 'Expiring ≤7d' },
                        { id: 'expired', label: 'Expired' },
                        { id: 'pending_renewal', label: 'Pending Renewal' },
                        { id: 'cancelled', label: 'Cancelled' },
                        { id: 'history', label: 'Renewal History' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setMembershipStatusFilter(st.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition ${
                          membershipStatusFilter === st.id
                            ? 'bg-white text-[#0F172A] shadow-xs'
                            : 'text-slate-600 hover:text-[#0F172A]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={membershipSearch}
                        onChange={(e) => setMembershipSearch(e.target.value)}
                        placeholder="Search member, drama, email, phone"
                        className="w-full pl-10 pr-3.5 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal()}
                      className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span>Assign Membership</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 overflow-x-auto">
                  <table className="w-full text-left text-[13px] leading-relaxed">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-[0.06em] text-[11px] font-semibold">
                      <tr>
                        <th className="py-3.5 px-5 whitespace-nowrap">Customer</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Plan &amp; Billing</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Included Dramas</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Validity Period</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Status</th>
                        <th className="py-3.5 px-5 text-right whitespace-nowrap">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMemberships.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                            No memberships match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredMemberships.map((m) => {
                          const remDays = Math.max(
                            0,
                            Math.ceil((Date.parse(m.expiresAt) - Date.now()) / 86400000)
                          );
                          const renewalCount = Array.isArray(m.renewalHistory) ? m.renewalHistory.length : 0;
                          const dramaNames = resolvePackageDramaNames(m.planId, m.selectedDramaIds);
                          return (
                            <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-4 px-5 align-top min-w-[200px]">
                                <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                                  <span>{m.customerName}</span>
                                  {(() => {
                                    const member = memberByIdMap.get(m.memberId);
                                    const method = member
                                      ? getMemberAuthMethod(member)
                                      : m.ownerUid && m.ownerUid !== 'admin_assigned' && m.ownerUid !== 'email_member'
                                      ? 'google'
                                      : null;
                                    return method === 'google' ? (
                                      <span className="text-[11px] font-medium text-blue-700">· Google</span>
                                    ) : null;
                                  })()}
                                </div>
                                <div className="text-xs text-slate-600 mt-0.5">{m.customerEmail}</div>
                                {m.customerPhone && (
                                  <div className="text-xs text-slate-400 mt-0.5 tabular-nums">{m.customerPhone}</div>
                                )}
                              </td>
                              <td className="py-4 px-5 align-top whitespace-nowrap">
                                <div className="font-semibold text-[#0F172A]">{m.planName}</div>
                                <div className="text-emerald-700 font-bold tabular-nums mt-0.5">
                                  {formatMembershipAmount(m)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                  <span>
                                    {m.paymentMethod === 'binance_qr'
                                      ? 'Binance QR'
                                      : m.paymentMethod === 'admin_assigned'
                                      ? 'Admin Assigned'
                                      : 'Bank QR'}
                                  </span>
                                  {renewalCount > 0 && (
                                    <>
                                      <span aria-hidden="true" className="text-slate-300">·</span>
                                      <span className="font-medium text-blue-700">
                                        {renewalCount} {renewalCount === 1 ? 'Renewal' : 'Renewals'}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-5 align-top min-w-[210px] max-w-[260px]">
                                {m.planId === 'vip' && (
                                  <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-emerald-700 mb-1">
                                    VIP · 3 Dramas
                                  </div>
                                )}
                                <div className="space-y-0.5 text-[13px] font-medium text-[#0F172A]">
                                  {dramaNames.length > 0 ? (
                                    dramaNames.map((title) => (
                                      <div key={title} className="leading-snug">
                                        {title}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-5 align-top whitespace-nowrap text-xs text-slate-600 tabular-nums space-y-1">
                                <div>Start: {formatDateTime(m.activatedAt)}</div>
                                <div>End: {formatDateTime(m.expiresAt)}</div>
                                {m.status === 'active' && (
                                  <div className={`font-semibold ${remDays <= 7 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                    {remDays} {remDays === 1 ? 'day' : 'days'} remaining
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-5 align-top whitespace-nowrap space-y-1.5">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize inline-block ${
                                    m.status === 'active'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : m.status === 'cancelled'
                                      ? 'bg-red-50 text-red-700'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {m.status}
                                </span>
                                {m.hasPendingRenewal && (
                                  <div className="text-xs font-semibold text-amber-700">Pending Renewal</div>
                                )}
                              </td>
                              <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                                <div className="inline-flex flex-col items-end gap-2">
                                  {extendingMembershipId === m.id ? (
                                    <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                      <input
                                        type="number"
                                        min={1}
                                        max={3650}
                                        value={extendDaysInput}
                                        onChange={(e) => setExtendDaysInput(e.target.value)}
                                        className="w-16 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                        title="Days to add"
                                      />
                                      <input
                                        type="text"
                                        value={extendReasonInput}
                                        onChange={(e) => setExtendReasonInput(e.target.value)}
                                        placeholder="Reason / note"
                                        className="w-32 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                      />
                                      <button
                                        type="button"
                                        disabled={actionBusy}
                                        onClick={() => handleExtendMembership(m.id)}
                                        className="px-3 py-1.5 rounded-lg bg-[#22C55E] text-[#0F172A] text-xs font-semibold cursor-pointer whitespace-nowrap"
                                      >
                                        +Add
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setExtendingMembershipId(null)}
                                        className="px-2.5 py-1.5 text-xs text-slate-500 cursor-pointer whitespace-nowrap"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setExtendingMembershipId(m.id);
                                          setRevokingMembershipId(null);
                                          setExtendDaysInput('30');
                                          setExtendReasonInput('Admin manual extension');
                                        }}
                                        className="px-3 py-2 rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold cursor-pointer transition whitespace-nowrap"
                                      >
                                        Extend +Days
                                      </button>
                                      {m.status === 'active' ? (
                                        revokingMembershipId === m.id ? (
                                          <div className="inline-flex items-center gap-1.5">
                                            <input
                                              type="text"
                                              value={revokeReasonInput}
                                              onChange={(e) => setRevokeReasonInput(e.target.value)}
                                              placeholder="Reason to revoke"
                                              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                            />
                                            <button
                                              type="button"
                                              disabled={actionBusy}
                                              onClick={() => handleRevokeMembership(m.id)}
                                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                                            >
                                              Confirm
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setRevokingMembershipId(null)}
                                              className="px-2.5 py-1.5 text-xs text-slate-500 cursor-pointer whitespace-nowrap"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setRevokingMembershipId(m.id);
                                              setExtendingMembershipId(null);
                                              setDeletingMembershipId(null);
                                              setRevokeReasonInput('');
                                            }}
                                            className="px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer transition whitespace-nowrap"
                                          >
                                            Revoke
                                          </button>
                                        )
                                      ) : deletingMembershipId === m.id ? (
                                        <div className="inline-flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            disabled={actionBusy}
                                            onClick={() => handleDeleteMembership(m.id)}
                                            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60 whitespace-nowrap"
                                          >
                                            {actionBusy ? 'Deleting...' : 'Confirm'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setDeletingMembershipId(null)}
                                            className="px-2.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDeletingMembershipId(m.id);
                                            setExtendingMembershipId(null);
                                            setRevokingMembershipId(null);
                                          }}
                                          className="px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap"
                                          title="Delete expired or cancelled membership record"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                          <span>Delete</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: PROMO CODES & REFERRAL SYSTEM */}
            {overview && activeTab === 'promos' && (
              <div className="space-y-6">
                {/* Section 1: Promo Code Builder + Directory */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <form
                    onSubmit={handleSavePromoSubmit}
                    className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#16A34A]" />
                        <h2 className="text-base font-bold text-[#0F172A]">
                          {editingPromoId ? 'Edit Promo Code' : 'Create Promo Code'}
                        </h2>
                      </div>
                      {editingPromoId && (
                        <button
                          type="button"
                          onClick={resetPromoForm}
                          className="text-xs font-semibold text-slate-500 hover:text-[#0F172A] cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Promo Code *</label>
                        <input
                          type="text"
                          required
                          value={promoCodeField}
                          onChange={(e) => setPromoCodeField(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                          placeholder="e.g. EID25"
                          className="w-full px-3.5 py-2 text-[13px] font-mono uppercase border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                        <select
                          value={promoDiscountType}
                          onChange={(e) => setPromoDiscountType(e.target.value as PromoDiscountType)}
                          className="w-full px-3.5 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (PKR / USD)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Description</label>
                      <input
                        type="text"
                        value={promoDescField}
                        onChange={(e) => setPromoDescField(e.target.value)}
                        placeholder="e.g. Weekend Launch Offer"
                        className="w-full px-3.5 py-2 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>

                    {promoDiscountType === 'percentage' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Discount (%)</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            step="1"
                            required
                            value={promoPercentField}
                            onChange={(e) => setPromoPercentField(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Max Cap PKR</label>
                          <input
                            type="number"
                            min={0}
                            value={promoMaxPkrField}
                            onChange={(e) => setPromoMaxPkrField(e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Max Cap USD</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={promoMaxUsdField}
                            onChange={(e) => setPromoMaxUsdField(e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Fixed Off (PKR)</label>
                          <input
                            type="number"
                            min={0}
                            required
                            value={promoAmtPkrField}
                            onChange={(e) => setPromoAmtPkrField(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Fixed Off (USD)</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            required
                            value={promoAmtUsdField}
                            onChange={(e) => setPromoAmtUsdField(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Min Purchase (PKR)</label>
                        <input
                          type="number"
                          min={0}
                          value={promoMinPkrField}
                          onChange={(e) => setPromoMinPkrField(e.target.value)}
                          className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Min Purchase (USD)</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={promoMinUsdField}
                          onChange={(e) => setPromoMinUsdField(e.target.value)}
                          className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Limit</label>
                        <input
                          type="number"
                          min={1}
                          value={promoUsageLimitField}
                          onChange={(e) => setPromoUsageLimitField(e.target.value)}
                          placeholder="Unlimited"
                          className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Per-User Limit</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={promoPerUserLimitField}
                          onChange={(e) => setPromoPerUserLimitField(e.target.value)}
                          className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                        <input
                          type="datetime-local"
                          value={promoExpiresAtField}
                          onChange={(e) => setPromoExpiresAtField(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Applicable Plans (leave all unchecked for All Plans)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MEMBERSHIP_PLANS.map((plan) => {
                          const checked = promoPlansField.includes(plan.id);
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() =>
                                setPromoPlansField((prev) =>
                                  checked ? prev.filter((id) => id !== plan.id) : [...prev, plan.id]
                                )
                              }
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                                checked
                                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {plan.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={promoIsActiveField}
                        onChange={(e) => setPromoIsActiveField(e.target.checked)}
                        className="h-4 w-4 accent-[#16A34A] rounded cursor-pointer"
                      />
                      <span>Promo Code Active Immediately</span>
                    </label>

                    <button
                      type="submit"
                      disabled={savingPromo}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                    >
                      {savingPromo
                        ? 'Saving Promo Code...'
                        : editingPromoId
                        ? 'Save Promo Changes'
                        : 'Create Promo Code'}
                    </button>
                  </form>

                  {/* Right: Promo Codes Table */}
                  <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#0F172A]">
                          Promo Codes Directory ({(overview.promoCodes || []).length})
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Create, edit, disable, or delete checkout discount campaigns.
                        </p>
                      </div>
                      <div className="relative w-full sm:w-56">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={promoSearch}
                          onChange={(e) => setPromoSearch(e.target.value)}
                          placeholder="Search promo code"
                          className="w-full pl-8.5 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F172A]"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[13px] leading-relaxed">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-[0.06em] text-[11px] font-semibold">
                          <tr>
                            <th className="py-3 px-4">Code</th>
                            <th className="py-3 px-4">Discount &amp; Rules</th>
                            <th className="py-3 px-4">Usage</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            const rows = (overview.promoCodes || []).filter((p) => {
                              if (!promoSearch.trim()) return true;
                              const q = promoSearch.toLowerCase();
                              return p.code.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
                            });
                            if (rows.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                                    No promo codes configured yet. Create your first code on the left.
                                  </td>
                                </tr>
                              );
                            }
                            return rows.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50/70">
                                <td className="py-3.5 px-4 align-top">
                                  <div className="font-mono font-bold text-[#0F172A]">{p.code}</div>
                                  {p.description && <div className="text-xs text-slate-500 mt-0.5">{p.description}</div>}
                                  {p.rewardForReferrerMemberId && (
                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                                      Referral Reward Code
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 align-top text-xs space-y-0.5">
                                  <div className="font-bold text-[#16A34A]">
                                    {p.discountType === 'percentage'
                                      ? `${p.discountPercent}% OFF`
                                      : `PKR ${p.discountAmountPkr} / $${Number(p.discountAmountUsd || 0).toFixed(2)} OFF`}
                                  </div>
                                  <div className="text-slate-500">
                                    Plans:{' '}
                                    {p.applicablePlanIds && p.applicablePlanIds.length > 0
                                      ? p.applicablePlanIds.join(', ').toUpperCase()
                                      : 'All'}
                                  </div>
                                  {(p.minPurchasePkr > 0 || p.minPurchaseUsd > 0) && (
                                    <div className="text-slate-500">
                                      Min: PKR {p.minPurchasePkr} / ${p.minPurchaseUsd}
                                    </div>
                                  )}
                                  {p.expiresAt && (
                                    <div className="text-slate-400">Exp: {formatDateTime(p.expiresAt)}</div>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 align-top text-xs tabular-nums">
                                  <div className="font-semibold text-[#0F172A]">
                                    {p.usedCount} / {p.usageLimit === null ? '∞' : p.usageLimit}
                                  </div>
                                  <div className="text-slate-500">{p.approvedUses} approved</div>
                                  <div className="text-slate-400">
                                    Saved: PKR {Math.round(p.totalDiscountGivenPkr)} / ${Number(p.totalDiscountGivenUsd || 0).toFixed(2)}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePromoActive(p)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition ${
                                      p.isActive
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {p.isActive ? 'Active' : 'Disabled'}
                                  </button>
                                </td>
                                <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                                  {deletingPromoId === p.id ? (
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        disabled={actionBusy}
                                        onClick={() => handleDeletePromo(p.id, p.code)}
                                        className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingPromoId(null)}
                                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleEditPromoClick(p)}
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingPromoId(p.id)}
                                        className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Section 2: Referral Program Config + Referral Attribution Ledger */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <form
                    onSubmit={handleSaveReferralConfig}
                    className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-[#16A34A]" />
                        <h2 className="text-base font-bold text-[#0F172A]">Referral Reward Settings</h2>
                      </div>
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={refEnabled}
                          onChange={(e) => setRefEnabled(e.target.checked)}
                          className="h-4 w-4 accent-[#16A34A] rounded cursor-pointer"
                        />
                        <span>Program Enabled</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Referrer Reward Mode</label>
                      <select
                        value={refRewardType}
                        onChange={(e) => setRefRewardType(e.target.value as ReferralConfig['referrerRewardType'])}
                        className="w-full px-3.5 py-2 text-[13px] bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="credit">Account Wallet Credit (PKR &amp; USD)</option>
                        <option value="promo_code">Personal Reward Promo Code</option>
                        <option value="both">Both Credit + Personal Promo Code</option>
                      </select>
                    </div>

                    {(refRewardType === 'credit' || refRewardType === 'both') && (
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Referrer Credit (PKR)</label>
                          <input
                            type="number"
                            min={0}
                            value={refRewardPkr}
                            onChange={(e) => setRefRewardPkr(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Referrer Credit (USD)</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={refRewardUsd}
                            onChange={(e) => setRefRewardUsd(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    {(refRewardType === 'promo_code' || refRewardType === 'both') && (
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Reward Promo (%)</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={refPromoPercent}
                            onChange={(e) => setRefPromoPercent(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Promo Expiry (Days)</label>
                          <input
                            type="number"
                            min={1}
                            value={refPromoExpiryDays}
                            onChange={(e) => setRefPromoExpiryDays(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <label className="block text-xs font-semibold text-slate-700">
                        Friend (Referee) First-Order Welcome Discount
                      </label>
                      <select
                        value={refereeDiscType}
                        onChange={(e) => setRefereeDiscType(e.target.value as ReferralConfig['refereeDiscountType'])}
                        className="w-full px-3.5 py-2 text-[13px] bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="none">No Welcome Discount (Referrer Reward Only)</option>
                        <option value="percentage">Percentage Welcome Discount (%)</option>
                        <option value="fixed">Fixed Welcome Discount (PKR / USD)</option>
                      </select>

                      {refereeDiscType === 'percentage' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Welcome Discount (%)</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={refereeDiscPercent}
                            onChange={(e) => setRefereeDiscPercent(e.target.value)}
                            className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                          />
                        </div>
                      )}

                      {refereeDiscType === 'fixed' && (
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Welcome Off (PKR)</label>
                            <input
                              type="number"
                              min={0}
                              value={refereeDiscPkr}
                              onChange={(e) => setRefereeDiscPkr(e.target.value)}
                              className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Welcome Off (USD)</label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={refereeDiscUsd}
                              onChange={(e) => setRefereeDiscUsd(e.target.value)}
                              className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order PKR</label>
                        <input
                          type="number"
                          min={0}
                          value={refMinOrderPkr}
                          onChange={(e) => setRefMinOrderPkr(e.target.value)}
                          className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order USD</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={refMinOrderUsd}
                          onChange={(e) => setRefMinOrderUsd(e.target.value)}
                          className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Max / Referrer</label>
                        <input
                          type="number"
                          min={1}
                          value={refMaxConversions}
                          onChange={(e) => setRefMaxConversions(e.target.value)}
                          placeholder="Unlimited"
                          className="w-full px-3 py-2 text-[13px] tabular-nums border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingRefConfig}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                    >
                      {savingRefConfig ? 'Saving Referral Settings...' : 'Save Referral Reward Settings'}
                    </button>
                  </form>

                  {/* Right: Referral Attribution & Anti-Abuse Table */}
                  <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                      <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100">
                        {(['all', 'signed_up', 'converted', 'blocked'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setReferralStatusFilter(st)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition ${
                              referralStatusFilter === st
                                ? 'bg-white text-[#0F172A] shadow-xs'
                                : 'text-slate-600 hover:text-[#0F172A]'
                            }`}
                          >
                            {st.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                      <div className="relative w-full xl:w-56">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={referralSearch}
                          onChange={(e) => setReferralSearch(e.target.value)}
                          placeholder="Search name, email, code"
                          className="w-full pl-8.5 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F172A]"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[13px] leading-relaxed">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-[0.06em] text-[11px] font-semibold">
                          <tr>
                            <th className="py-3 px-4">Referrer</th>
                            <th className="py-3 px-4">Invited Customer</th>
                            <th className="py-3 px-4">Reward &amp; Order</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Abuse Guard</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            const list = (overview.referrals || []).filter((r) => {
                              if (referralStatusFilter !== 'all' && r.status !== referralStatusFilter) return false;
                              if (!referralSearch.trim()) return true;
                              const q = referralSearch.toLowerCase();
                              return (
                                r.referrerCode.toLowerCase().includes(q) ||
                                r.referrerName.toLowerCase().includes(q) ||
                                r.referrerEmail.toLowerCase().includes(q) ||
                                r.referredName.toLowerCase().includes(q) ||
                                r.referredEmail.toLowerCase().includes(q)
                              );
                            });
                            if (list.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                                    No referral attributions recorded under this filter yet.
                                  </td>
                                </tr>
                              );
                            }
                            return list.map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50/70">
                                <td className="py-3.5 px-4 align-top text-xs">
                                  <div className="font-semibold text-[#0F172A]">{r.referrerName}</div>
                                  <div className="font-mono font-bold text-[#16A34A]">{r.referrerCode}</div>
                                  <div className="text-slate-400">{r.referrerEmail}</div>
                                </td>
                                <td className="py-3.5 px-4 align-top text-xs">
                                  <div className="font-semibold text-[#0F172A]">{r.referredName}</div>
                                  <div className="text-slate-600">{r.referredEmail}</div>
                                  <div className="text-slate-400 tabular-nums">{formatDateTime(r.createdAt)}</div>
                                </td>
                                <td className="py-3.5 px-4 align-top text-xs">
                                  {r.status === 'converted' ? (
                                    <div className="space-y-0.5">
                                      <div className="font-bold text-[#16A34A]">
                                        {r.rewardAmountPkr > 0
                                          ? `PKR ${r.rewardAmountPkr} / $${Number(r.rewardAmountUsd || 0).toFixed(2)}`
                                          : 'Promo Issued'}
                                      </div>
                                      {r.rewardPromoCode && (
                                        <div className="font-mono font-semibold text-[#0F172A]">{r.rewardPromoCode}</div>
                                      )}
                                      {r.conversionOrderId && (
                                        <div className="font-mono text-slate-400">{r.conversionOrderId}</div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 align-top text-xs">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded font-semibold capitalize ${
                                      r.status === 'converted'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : r.status === 'blocked'
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-amber-50 text-amber-800'
                                    }`}
                                  >
                                    {r.status.replace('_', ' ')}
                                  </span>
                                  {r.blockReason && (
                                    <div className="text-[11px] text-red-600 mt-1 max-w-[180px] leading-snug">
                                      {r.blockReason}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                                  {r.status !== 'converted' && (
                                    <button
                                      type="button"
                                      disabled={updatingReferralId === r.id}
                                      onClick={() =>
                                        handleToggleReferralStatus(
                                          r.id,
                                          r.status === 'blocked' ? 'signed_up' : 'blocked'
                                        )
                                      }
                                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                                        r.status === 'blocked'
                                          ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                          : 'border-red-200 text-red-700 hover:bg-red-50'
                                      }`}
                                    >
                                      {r.status === 'blocked' ? 'Restore' : 'Block'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REGISTERED ACCOUNTS & SIGN-IN METHOD (GOOGLE VS EMAIL) */}
            {overview && activeTab === 'accounts' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                  <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100">
                    {[
                      { id: 'all' as const, label: `All (${overview.members.length})` },
                      { id: 'google' as const, label: `Google Sign-In (${googleAccountsCount})` },
                      { id: 'email' as const, label: `Email & Password (${emailAccountsCount})` },
                      { id: 'admin_assigned' as const, label: `Admin Created (${adminAssignedAccountsCount})` },
                      { id: 'blocked' as const, label: `Blocked (${blockedAccountsCount})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAccountAuthFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition ${
                          accountAuthFilter === f.id
                            ? 'bg-white text-[#0F172A] shadow-xs'
                            : 'text-slate-600 hover:text-[#0F172A]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full xl:w-80 shrink-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={accountSearch}
                      onChange={(e) => setAccountSearch(e.target.value)}
                      placeholder="Search account name, email, phone, drama"
                      className="w-full pl-10 pr-3.5 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 overflow-x-auto">
                  <table className="w-full text-left text-[13px] leading-relaxed">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-[0.06em] text-[11px] font-semibold">
                      <tr>
                        <th className="py-3.5 px-5 whitespace-nowrap">Customer</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Sign-In Method</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Package &amp; Dramas</th>
                        <th className="py-3.5 px-5 whitespace-nowrap">Joined</th>
                        <th className="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                            No registered accounts match this filter yet.
                          </td>
                        </tr>
                      ) : (
                        filteredAccounts.map((member) => {
                          const method = getMemberAuthMethod(member);
                          const isBlocked = Boolean(
                            member.isBlocked ||
                              blockedEmailsSet.has((member.email || '').trim().toLowerCase())
                          );
                          const activeSubs = overview.memberships.filter(
                            (s) => s.memberId === member.id && s.status === 'active'
                          );
                          const activeSub = activeSubs[0];
                          const latestSub = overview.memberships.find((s) => s.memberId === member.id);
                          const latestReq = overview.requests.find((r) => r.memberId === member.id);
                          return (
                            <tr
                              key={member.id}
                              className={`transition-colors ${
                                isBlocked ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50/70'
                              }`}
                            >
                              <td className="py-4 px-5 align-top min-w-[220px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-[#0F172A]">{member.fullName}</span>
                                  {isBlocked && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                                      <Ban className="w-3 h-3" />
                                      Blocked
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-600 mt-0.5">{member.email}</div>
                                {member.phone && (
                                  <div className="text-xs text-slate-400 mt-0.5 tabular-nums">{member.phone}</div>
                                )}
                                {isBlocked && member.blockedReason && (
                                  <div className="text-[11px] text-red-600 mt-1 max-w-[260px]">
                                    Reason: {member.blockedReason}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-5 align-top whitespace-nowrap">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                                    method === 'google'
                                      ? 'bg-blue-50 text-blue-700'
                                      : method === 'admin_assigned'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {method === 'google'
                                    ? 'Google Sign-In'
                                    : method === 'admin_assigned'
                                    ? 'Admin Created'
                                    : 'Email & Password'}
                                </span>
                              </td>
                              <td className="py-4 px-5 align-top min-w-[240px] max-w-[320px] space-y-2.5">
                                {activeSubs.length > 0 ? (
                                  activeSubs.map((sub) => {
                                    const dramaNames = resolvePackageDramaNames(sub.planId, sub.selectedDramaIds);
                                    return (
                                      <div key={sub.id} className="space-y-1">
                                        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                                          <span>{sub.planName}</span>
                                          <span aria-hidden="true" className="text-slate-300">·</span>
                                          <span className="text-xs font-semibold text-emerald-700">Active</span>
                                        </div>
                                        {dramaNames.length > 0 && (
                                          <div className="text-xs text-slate-600 leading-relaxed">
                                            {dramaNames.join(', ')}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                ) : latestReq ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                                      <span>{latestReq.planName}</span>
                                      <span aria-hidden="true" className="text-slate-300">·</span>
                                      <span className="text-xs font-semibold capitalize text-amber-700">
                                        {latestReq.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-600 leading-relaxed">
                                      {resolvePackageDramaNames(latestReq.planId, latestReq.selectedDramaIds).join(', ') || '—'}
                                    </div>
                                  </div>
                                ) : latestSub ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                                      <span>{latestSub.planName}</span>
                                      <span aria-hidden="true" className="text-slate-300">·</span>
                                      <span className="text-xs font-semibold capitalize text-slate-500">
                                        {latestSub.status}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-600 leading-relaxed">
                                      {resolvePackageDramaNames(latestSub.planId, latestSub.selectedDramaIds).join(', ') || '—'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">No active plan</span>
                                )}
                              </td>
                              <td className="py-4 px-5 align-top text-xs text-slate-500 whitespace-nowrap tabular-nums">
                                {formatDateTime(member.createdAt)}
                              </td>
                              <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                                <div className="inline-flex flex-wrap items-center justify-end gap-2">
                                  {!isBlocked && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAssignModal(member)}
                                      className="px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap"
                                    >
                                      <Plus className="w-3.5 h-3.5 shrink-0" />
                                      <span>Assign Plan</span>
                                    </button>
                                  )}

                                  {isBlocked ? (
                                    <button
                                      type="button"
                                      disabled={actionBusy}
                                      onClick={() => handleUnblockUserEmail(member.email, member.email)}
                                      className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition whitespace-nowrap"
                                      title="Restore website access for this email"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                                      <span>Unblock</span>
                                    </button>
                                  ) : blockingMemberId === member.id ? (
                                    <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                      <input
                                        type="text"
                                        value={blockReasonInput}
                                        onChange={(e) => setBlockReasonInput(e.target.value)}
                                        placeholder="Reason (optional)"
                                        className="w-40 px-2.5 py-1.5 rounded-lg border border-red-300 text-xs focus:outline-none focus:border-red-600"
                                      />
                                      <button
                                        type="button"
                                        disabled={actionBusy}
                                        onClick={() =>
                                          handleBlockUserEmail({
                                            memberId: member.id,
                                            email: member.email,
                                            reason: blockReasonInput.trim() || undefined,
                                          })
                                        }
                                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60 whitespace-nowrap"
                                      >
                                        {actionBusy ? 'Blocking...' : 'Confirm Block'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setBlockingMemberId(null);
                                          setBlockReasonInput('');
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeletingAccountId(null);
                                        setBlockingMemberId(member.id);
                                        setBlockReasonInput('');
                                      }}
                                      className="px-3 py-2 rounded-lg border border-red-300 bg-red-50/70 text-red-700 hover:bg-red-600 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap"
                                      title="Permanently block this email from accessing the website"
                                    >
                                      <Ban className="w-3.5 h-3.5 shrink-0" />
                                      <span>Block</span>
                                    </button>
                                  )}

                                  {!activeSub && blockingMemberId !== member.id && (
                                    deletingAccountId === member.id ? (
                                      <div className="inline-flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          disabled={actionBusy}
                                          onClick={() => handleDeleteAccount(member.id, member.email || member.fullName)}
                                          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60 whitespace-nowrap"
                                        >
                                          {actionBusy ? 'Deleting...' : 'Confirm'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeletingAccountId(null)}
                                          className="px-2.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setDeletingAccountId(member.id)}
                                        className="px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap"
                                        title="Delete unnecessary or unpaid customer lead"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                        <span>Delete</span>
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: PERMANENTLY BLOCKED USERS BY EMAIL */}
            {overview && activeTab === 'blocked' && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-[0.06em] text-red-600 flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5 shrink-0" />
                      <span>Permanent Account &amp; Phone Access Control</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#0F172A] leading-snug">
                      Block Email &amp; Phone Number Permanently
                    </h2>
                    <p className="text-[13px] text-slate-500 leading-relaxed max-w-3xl">
                      Enter an email address and/or phone number to permanently block that person from signing in, creating any new account, submitting payments, or watching streams. Blocking immediately deletes all pending verifications, revokes active memberships, cancels queued WhatsApp jobs, and blocks all associated phone numbers.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!directBlockEmailInput.trim() && !directBlockPhoneInput.trim()) return;
                      void handleBlockUserEmail({
                        email: directBlockEmailInput.trim() || undefined,
                        phone: directBlockPhoneInput.trim() || undefined,
                        reason: directBlockReasonInput.trim() || undefined,
                      });
                    }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1"
                  >
                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={directBlockEmailInput}
                        onChange={(e) => setDirectBlockEmailInput(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={directBlockPhoneInput}
                        onChange={(e) => setDirectBlockPhoneInput(e.target.value)}
                        placeholder="+923001234567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Reason (Optional)
                      </label>
                      <input
                        type="text"
                        value={directBlockReasonInput}
                        onChange={(e) => setDirectBlockReasonInput(e.target.value)}
                        placeholder="e.g. Fake payment proof, abuse"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="submit"
                        disabled={actionBusy || (!directBlockEmailInput.trim() && !directBlockPhoneInput.trim())}
                        className="w-full px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 transition"
                      >
                        <Ban className="w-3.5 h-3.5 shrink-0" />
                        <span>{actionBusy ? 'Blocking...' : 'Block Permanently'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        Blocked Users &amp; Phone Numbers ({blockedUsersList.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Blocked emails and phone numbers cannot register new accounts or access FEVIQO until unblocked.
                      </p>
                    </div>
                    <div className="relative w-full sm:w-72 shrink-0">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={blockedSearch}
                        onChange={(e) => setBlockedSearch(e.target.value)}
                        placeholder="Search blocked email, phone, or reason"
                        className="w-full pl-10 pr-3.5 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] leading-relaxed">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-[0.06em] text-[11px] font-semibold">
                        <tr>
                          <th className="py-3.5 px-5 whitespace-nowrap">Blocked Email &amp; Phone</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Reason</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Blocked By</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Blocked On</th>
                          <th className="py-3.5 px-5 text-right whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBlockedUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                              {blockedUsersList.length === 0
                                ? 'No emails or phone numbers are currently blocked.'
                                : 'No blocked records match your search.'}
                            </td>
                          </tr>
                        ) : (
                          filteredBlockedUsers.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-4 px-5 align-top min-w-[240px]">
                                <div className="flex items-start gap-2">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-red-100 text-red-700 shrink-0 mt-0.5">
                                    <Ban className="w-3.5 h-3.5" />
                                  </span>
                                  <div className="space-y-0.5">
                                    <div className="font-semibold text-[#0F172A]">
                                      {entry.email || 'Phone-only block'}
                                    </div>
                                    {entry.phone && (
                                      <div className="text-xs font-mono text-red-700">
                                        Phone blocked: {entry.phone}
                                      </div>
                                    )}
                                    {Array.isArray(entry.additionalPhones) && entry.additionalPhones.length > 0 && (
                                      <div className="text-[11px] font-mono text-slate-500">
                                        Also blocked: {entry.additionalPhones.join(', ')}
                                      </div>
                                    )}
                                    {entry.fullName && (
                                      <div className="text-xs text-slate-500">{entry.fullName}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-5 align-top text-xs text-slate-700 max-w-[300px]">
                                {entry.reason || 'Blocked by FEVIQO administrator'}
                              </td>
                              <td className="py-4 px-5 align-top text-xs text-slate-500 whitespace-nowrap">
                                {entry.blockedByAdminEmail || 'Administrator'}
                              </td>
                              <td className="py-4 px-5 align-top text-xs text-slate-500 whitespace-nowrap tabular-nums">
                                {formatDateTime(entry.blockedAt || entry.createdAt)}
                              </td>
                              <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  disabled={actionBusy}
                                  onClick={() => handleUnblockUserEmail(entry.id, entry.email || entry.phone)}
                                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition whitespace-nowrap"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                                  <span>Unblock &amp; Restore Access</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: LIFECYCLE REMINDERS & SCHEDULER */}
            {overview && activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#16A34A] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Automated Membership Expiry &amp; Renewal Reminders</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#0F172A] leading-snug">
                      Lifecycle Check &amp; Customer Notification Engine
                    </h2>
                    <p className="text-[13px] text-slate-500 leading-relaxed">
                      Runs automatically every 15 minutes to revoke expired memberships and generate 7d, 3d, 1d, and expired reminders.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={runningScheduler}
                    onClick={handleRunSchedulerNow}
                    className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${runningScheduler ? 'animate-spin' : ''}`} />
                    <span>{runningScheduler ? 'Running Check...' : 'Run Expiry & Renewal Check Now'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <h3 className="text-base font-bold text-[#0F172A]">Scheduler Run History</h3>
                    </div>
                    {!overview.schedulerRuns || overview.schedulerRuns.length === 0 ? (
                      <p className="text-[13px] text-slate-500">No scheduler runs recorded yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {overview.schedulerRuns.map((run) => (
                          <div key={run.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold uppercase tracking-[0.04em] text-xs text-[#0F172A]">
                                {run.triggerSource.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
                                {formatDateTime(run.ranAt)}
                              </span>
                            </div>
                            <div className="text-[13px] text-slate-700 leading-relaxed">{run.summary}</div>
                            <div className="text-xs text-slate-500 tabular-nums">
                              Checked: {run.checkedMemberships} · Expired: {run.expiredCount} · Reminders: {run.remindersCreated} · Emails Sent: {run.emailsSent} · Failed: {run.emailsFailed}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <h3 className="text-base font-bold text-[#0F172A]">Customer Notification Log</h3>
                      </div>
                      <span className="text-xs font-medium text-slate-500 tabular-nums">
                        {(overview.customerNotifications || []).length} recorded
                      </span>
                    </div>
                    {!overview.customerNotifications || overview.customerNotifications.length === 0 ? (
                      <p className="text-[13px] text-slate-500">No customer reminders or notifications recorded yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {overview.customerNotifications.map((notif) => (
                          <div key={notif.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-[0.04em] text-[#0F172A]">
                                  {notif.type.replace('_', ' ')}
                                </span>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span className="text-[13px] font-semibold text-[#0F172A]">{notif.title}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
                                <span
                                  className={
                                    notif.emailStatus === 'sent'
                                      ? 'text-emerald-700'
                                      : notif.emailStatus === 'failed'
                                      ? 'text-red-700'
                                      : 'text-slate-600'
                                  }
                                >
                                  Email: {notif.emailStatus.replace('_', ' ')}
                                </span>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span className={notif.isRead ? 'text-slate-500' : 'text-blue-700'}>
                                  {notif.isRead ? 'Read' : 'Unread'}
                                </span>
                              </div>
                            </div>
                            <p className="text-[13px] text-slate-700 leading-relaxed">{notif.message}</p>
                            {(notif.planId || (notif.dramaIds && notif.dramaIds.length > 0)) && (
                              <div className="text-xs text-slate-600 leading-relaxed">
                                {notif.planId && (
                                  <span className="font-semibold text-emerald-800">
                                    {getPlanById(notif.planId)?.name || notif.planId}
                                  </span>
                                )}
                                {notif.planId && resolvePackageDramaNames(notif.planId, notif.dramaIds).length > 0 && (
                                  <span aria-hidden="true" className="text-slate-300 mx-1.5">·</span>
                                )}
                                <span>{resolvePackageDramaNames(notif.planId, notif.dramaIds).join(', ')}</span>
                              </div>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-0.5">
                              <span className="tabular-nums">
                                To: {notif.customerEmail || notif.memberId} · {formatDateTime(notif.createdAt)}
                                {notif.supersededAt ? ' · Superseded on renewal' : ''}
                              </span>
                              {(notif.emailStatus === 'failed' || notif.emailStatus === 'not_configured' || notif.emailStatus === 'not_sent') && notif.customerEmail && (
                                <button
                                  type="button"
                                  disabled={retryingCustNotifId === notif.id}
                                  onClick={() => handleRetryCustomerEmail(notif.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold cursor-pointer transition whitespace-nowrap shrink-0 disabled:opacity-60"
                                >
                                  {retryingCustNotifId === notif.id ? 'Sending...' : 'Send / Retry Email'}
                                </button>
                              )}
                            </div>
                            {notif.emailError && <div className="text-red-700 text-xs">{notif.emailError}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: QR CODES & SETTINGS */}
            {overview && activeTab === 'config' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-6">
                  {/* Pakistan Bank QR Codes */}
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-[#0F172A]">Pakistan Bank QR Codes (PKR)</h2>
                      <p className="text-[13px] text-slate-500 leading-relaxed">
                        Each membership plan displays its corresponding uncropped Pakistani Bank QR code. Upload a replacement image anytime.
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
                          <div key={plan.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-[#0F172A]">{plan.name}</span>
                              <span className="text-xs font-semibold text-[#16A34A] tabular-nums">
                                PKR {plan.pricePkr.toLocaleString()}
                              </span>
                            </div>
                            <div className="bg-white rounded-lg border border-slate-200 p-2 h-44 flex items-center justify-center">
                              <img
                                src={imgSrc}
                                alt={`${plan.name} Bank QR`}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <label className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition whitespace-nowrap">
                              <Upload className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {uploadingQrPlanId === plan.id ? 'Uploading...' : `Replace ${plan.name} Bank QR`}
                              </span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                className="sr-only"
                                onChange={(e) => handleUploadQr(plan.id, e.target.files?.[0], 'pakistan')}
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* International Binance Pay QR Codes */}
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold uppercase tracking-[0.06em] text-amber-700 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span>International Payments</span>
                      </div>
                      <h2 className="text-lg font-bold text-[#0F172A]">
                        International Binance Pay QR Codes (USD)
                      </h2>
                      <p className="text-[13px] text-slate-500 leading-relaxed">
                        Upload separate Binance QR images for Starter, Standard, Plus, and VIP. International members always pay the exact USD amount below.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {MEMBERSHIP_PLANS.map((plan) => {
                        const binanceSrc =
                          plan.id === 'starter'
                            ? overview.config.starterBinanceQrImage
                            : plan.id === 'standard'
                            ? overview.config.standardBinanceQrImage
                            : plan.id === 'plus'
                            ? overview.config.plusBinanceQrImage
                            : overview.config.vipBinanceQrImage;
                        const usdVal = Number(usdPriceInputs[plan.id] || overview.config.usdPrices?.[plan.id] || plan.priceUsd);

                        return (
                          <div key={plan.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-[#0F172A]">{plan.name}</span>
                              <span className="text-xs font-bold text-amber-800 tabular-nums">
                                ${usdVal.toFixed(2)} USD
                              </span>
                            </div>
                            <div className="bg-white rounded-lg border border-slate-200 p-2 h-44 flex items-center justify-center">
                              {binanceSrc ? (
                                <img
                                  src={binanceSrc}
                                  alt={`${plan.name} Binance QR`}
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <span className="text-xs text-slate-400 text-center px-3">
                                  No Binance QR uploaded for {plan.name} yet
                                </span>
                              )}
                            </div>
                            <label className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition whitespace-nowrap">
                              <Upload className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {uploadingBinanceQrPlanId === plan.id
                                  ? 'Uploading...'
                                  : binanceSrc
                                  ? `Replace ${plan.name} Binance QR`
                                  : `Upload ${plan.name} Binance QR`}
                              </span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                className="sr-only"
                                onChange={(e) => handleUploadQr(plan.id, e.target.files?.[0], 'international')}
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSaveSettings}
                  className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 space-y-4 h-fit"
                >
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-[#0F172A]">USD Pricing, Instructions &amp; Support Settings</h2>
                    <p className="text-[13px] text-slate-500 leading-relaxed">
                      Configure exact USD plan pricing, international Binance instructions, WhatsApp proof forwarding, and support notes.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <div className="text-xs font-bold text-amber-950">Exact USD Prices (International Binance QR)</div>
                    <div className="grid grid-cols-2 gap-3">
                      {MEMBERSHIP_PLANS.map((plan) => (
                        <div key={plan.id}>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {plan.name} (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.50"
                            required
                            value={usdPriceInputs[plan.id]}
                            onChange={(e) =>
                              setUsdPriceInputs((prev) => ({
                                ...prev,
                                [plan.id]: e.target.value,
                              }))
                            }
                            className="w-full px-3.5 py-2 text-[13px] tabular-nums bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                      International Binance Instructions (EN)
                    </label>
                    <textarea
                      rows={2}
                      value={intlInstructionsEnInput}
                      onChange={(e) => setIntlInstructionsEnInput(e.target.value)}
                      placeholder="Scan the Binance Pay QR and send the exact USD amount shown..."
                      className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                      International Binance Instructions (Urdu)
                    </label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={intlInstructionsUrInput}
                      onChange={(e) => setIntlInstructionsUrInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-urdu-slim border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                      WhatsApp Number (International digits, e.g. 923001234567)
                    </label>
                    <input
                      type="text"
                      value={whatsappInput}
                      onChange={(e) => setWhatsappInput(e.target.value)}
                      placeholder="Leave empty until configured"
                      className="w-full px-3.5 py-2.5 text-[13px] tabular-nums border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                      Admin Verification Email Recipient
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Support Email</label>
                    <input
                      type="email"
                      value={supportEmailInput}
                      onChange={(e) => setSupportEmailInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Support Note (EN)</label>
                    <textarea
                      rows={2}
                      value={supportNoteEnInput}
                      onChange={(e) => setSupportNoteEnInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Support Note (Urdu)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={supportNoteUrInput}
                      onChange={(e) => setSupportNoteUrInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-urdu-slim border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] hover:text-white text-sm font-semibold transition cursor-pointer disabled:opacity-60"
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
                        if (res.transport) {
                          setTransportStatus({
                            smtpConfigured: res.transport.smtpConfigured,
                            smtpSource: res.transport.smtpSource,
                            resendConfigured: res.transport.resendConfigured,
                            resendSource: res.transport.resendSource,
                            notificationRecipients: res.transport.notificationRecipients,
                          });
                        }
                        if (res.testResult?.success) {
                          setFeedbackBanner({
                            type: 'success',
                            text: `Email credentials saved & verified via ${res.testResult.provider?.toUpperCase()}! Check inbox for test email.`,
                          });
                        } else {
                          setFeedbackBanner({
                            type: 'error',
                            text: `Test email failed: ${res.testResult?.error || 'Verify Gmail App Password or Resend key.'}`,
                          });
                        }
                      }
                    } catch {
                      setFeedbackBanner({ type: 'error', text: 'Failed to save email transport credentials.' });
                    } finally {
                      setSavingTransport(false);
                    }
                  }}
                  className="lg:col-span-12 rounded-2xl bg-white border border-slate-200 p-6 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <h2 className="text-lg font-bold text-[#0F172A]">
                        Email Delivery Credentials (Gmail SMTP App Password or Resend)
                      </h2>
                      <p className="text-[13px] text-slate-600 leading-relaxed">
                        Used for automatic admin alerts on payment proofs and customer membership notifications. Set via Render environment variables or save below.
                      </p>
                      {transportStatus && (
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium pt-0.5">
                          <span className={transportStatus.smtpConfigured ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                            SMTP: {transportStatus.smtpConfigured ? `Configured (${transportStatus.smtpSource || 'active'})` : 'Not configured'}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className={transportStatus.resendConfigured ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                            Resend: {transportStatus.resendConfigured ? `Configured (${transportStatus.resendSource || 'active'})` : 'Not configured'}
                          </span>
                          {transportStatus.notificationRecipients?.length ? (
                            <>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="text-slate-600">
                                Alerts to: {transportStatus.notificationRecipients.join(', ')}
                              </span>
                            </>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={testingTransport}
                      onClick={async () => {
                        setTestingTransport(true);
                        setFeedbackBanner(null);
                        try {
                          const res = await saveAdminEmailTransport({ testOnly: true });
                          if ('error' in res) {
                            setFeedbackBanner({ type: 'error', text: res.error });
                          } else if (res.testResult?.success) {
                            setOverview(res.overview);
                            setFeedbackBanner({
                              type: 'success',
                              text: `Active email setup verified via ${res.testResult.provider?.toUpperCase()} (${res.testResult.source || 'server'})! Test email dispatched.`,
                            });
                          } else {
                            setFeedbackBanner({
                              type: 'error',
                              text: `Active email delivery test failed: ${res.testResult?.error || 'Check Render SMTP/Resend env vars or credentials below.'}`,
                            });
                          }
                        } catch {
                          setFeedbackBanner({ type: 'error', text: 'Could not run email delivery test.' });
                        } finally {
                          setTestingTransport(false);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 cursor-pointer transition disabled:opacity-60"
                    >
                      {testingTransport ? 'Testing...' : 'Test Current Email Setup'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">SMTP Host</label>
                      <input
                        type="text"
                        value={smtpHostInput}
                        onChange={(e) => setSmtpHostInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">SMTP Port</label>
                      <input
                        type="number"
                        value={smtpPortInput}
                        onChange={(e) => setSmtpPortInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-[13px] tabular-nums border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">SMTP Email (Sender)</label>
                      <input
                        type="email"
                        value={smtpUserInput}
                        onChange={(e) => setSmtpUserInput(e.target.value)}
                        placeholder="Sender email address"
                        className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                        New Gmail App Password
                      </label>
                      <input
                        type="password"
                        value={smtpPassInput}
                        onChange={(e) => setSmtpPassInput(e.target.value)}
                        placeholder="16-character App Password"
                        className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                        Or Resend API Key (Optional Alternative)
                      </label>
                      <input
                        type="password"
                        value={resendKeyInput}
                        onChange={(e) => setResendKeyInput(e.target.value)}
                        placeholder="re_..."
                        className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingTransport}
                      className="py-2.5 px-5 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-[13px] font-semibold transition cursor-pointer disabled:opacity-60"
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
                <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <h2 className="text-base font-bold text-[#0F172A]">Admin Email Notifications Log</h2>
                  </div>

                  {overview.emailNotifications.length === 0 ? (
                    <p className="text-[13px] text-slate-500">No verification emails recorded yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {overview.emailNotifications.map((notif) => (
                        <div key={notif.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[13px] font-semibold text-[#0F172A] truncate">{notif.subject}</span>
                            <span
                              className={`text-xs font-bold uppercase shrink-0 ${
                                notif.status === 'sent' ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
                              {notif.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 tabular-nums">
                            To: {notif.to} · Attempts: {notif.attempts} · {formatDateTime(notif.lastAttemptAt)}
                          </div>
                          {notif.error && <div className="text-xs text-red-700 leading-relaxed">{notif.error}</div>}
                          {notif.status === 'failed' && (
                            <button
                              type="button"
                              onClick={() => handleRetryEmail(notif.id)}
                              className="mt-1 px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-xs font-semibold cursor-pointer transition"
                            >
                              Retry Send
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <h2 className="text-base font-bold text-[#0F172A]">Admin Action Audit Trail</h2>
                  </div>

                  {overview.auditLogs.length === 0 ? (
                    <p className="text-[13px] text-slate-500">No admin actions recorded yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {overview.auditLogs.map((log) => (
                        <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold uppercase tracking-[0.04em] text-xs text-[#0F172A]">
                              {log.action}
                            </span>
                            <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
                              {formatDateTime(log.createdAt)}
                            </span>
                          </div>
                          <div className="text-[13px] text-slate-700 leading-relaxed">{log.details}</div>
                          <div className="text-xs text-slate-500">By: {log.adminEmail}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: ADMIN ROLES */}
            {overview && activeTab === 'roles' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
                  <h2 className="text-lg font-bold text-[#0F172A]">Authorized Administrators</h2>
                  <div className="divide-y divide-slate-100">
                    {overview.admins.map((adm) => (
                      <div key={adm.id} className="py-4 flex items-center justify-between gap-4">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-[#0F172A] text-sm">{adm.name}</div>
                          <div className="text-[13px] text-slate-600 truncate">{adm.email}</div>
                          <div className="text-xs text-slate-400">Created by: {adm.createdBy}</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-xs font-semibold uppercase tracking-[0.04em] ${
                              adm.isActive ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            {adm.isActive ? 'Active' : 'Disabled'}
                          </span>
                          {adm.id !== authenticatedAdmin.id && (
                            <button
                              type="button"
                              onClick={() => handleToggleAdminActive(adm)}
                              className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap transition"
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
                  className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <h2 className="text-lg font-bold text-[#0F172A]">Grant Admin Role</h2>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                      Temporary Password (min 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingAdmin}
                    className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] text-white hover:text-[#0F172A] text-[13px] font-semibold transition cursor-pointer disabled:opacity-60"
                  >
                    {creatingAdmin ? 'Creating Admin...' : 'Grant Admin Access'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB: REFERRAL CAMPAIGNS & LINK ANALYTICS */}
            {overview && activeTab === 'campaigns' && (
              <ReferralCampaignsPanel
                onSuccessMessage={(msg) => setFeedbackBanner({ type: 'success', text: msg })}
                onErrorMessage={(msg) => setFeedbackBanner({ type: 'error', text: msg })}
              />
            )}

            {/* TAB: MUX VIDEO SECURITY */}
            {overview && activeTab === 'security' && (
              <MuxSecurityPanel
                onSuccessMessage={(msg) => setFeedbackBanner({ type: 'success', text: msg })}
                onErrorMessage={(msg) => setFeedbackBanner({ type: 'error', text: msg })}
              />
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
            className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="uppercase tracking-[0.06em] text-[#16A34A]">
                    Verification Request Detail
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className={selectedRequest.orderType === 'renewal' ? 'text-blue-700' : 'text-slate-600'}>
                    {selectedRequest.orderType === 'renewal' ? 'Membership Renewal' : 'New Membership'}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span
                    className={
                      selectedRequest.paymentMethod === 'binance_qr' || selectedRequest.currency === 'USD'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }
                  >
                    {selectedRequest.paymentMethod === 'binance_qr' || selectedRequest.currency === 'USD'
                      ? 'International Binance QR (USD)'
                      : 'Pakistan Bank QR (PKR)'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">
                  {selectedRequest.planName} — {formatOrderAmount(selectedRequest)} ({selectedRequest.durationDays} Days)
                </h3>
                <div className="text-[13px] font-medium text-slate-700 leading-relaxed">
                  Included Dramas:{' '}
                  <strong className="font-semibold text-[#0F172A]">
                    {resolvePackageDramaNames(selectedRequest.planId, selectedRequest.selectedDramaIds).join(', ') || '—'}
                  </strong>
                </div>
                <div className="text-xs font-mono text-slate-500 tabular-nums">{selectedRequest.id}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestId(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Proof Screenshot Viewer */}
              <div className="md:col-span-7 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-[0.06em]">
                  Customer Payment Proof Screenshot
                </div>
                {selectedRequest.hasProof ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center min-h-[320px]">
                    {proofModalLoading ? (
                      <div className="text-[13px] text-slate-500">Loading payment screenshot...</div>
                    ) : proofModalSrc ? (
                      <img
                        src={proofModalSrc}
                        alt={`Payment proof for ${selectedRequest.id}`}
                        className="max-w-full max-h-[520px] object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-[13px] text-slate-500 text-center px-4">
                        Payment proof file could not be loaded cleanly. Try refreshing or syncing Cloud DB.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-60 flex items-center justify-center text-[13px] text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                    No payment screenshot has been uploaded for this request yet.
                  </div>
                )}
              </div>

              {/* Request Metadata & Approve / Reject Actions */}
              <div className="md:col-span-5 space-y-5">
                <dl className="rounded-xl border border-slate-200 bg-white p-5 grid grid-cols-[118px_1fr] gap-y-3 gap-x-3 text-[13px] leading-relaxed">
                  <dt className="text-slate-500 font-medium">Customer</dt>
                  <dd className="font-semibold text-[#0F172A] break-words">{selectedRequest.customerName}</dd>

                  <dt className="text-slate-500 font-medium">Email</dt>
                  <dd className="font-medium text-[#0F172A] break-all">{selectedRequest.customerEmail}</dd>

                  <dt className="text-slate-500 font-medium">Phone</dt>
                  <dd className="font-medium text-[#0F172A] tabular-nums">{selectedRequest.customerPhone || '—'}</dd>

                  <dt className="text-slate-500 font-medium">Amount</dt>
                  <dd className="font-semibold text-[#16A34A] tabular-nums">
                    {formatOrderAmount(selectedRequest)}
                    {selectedRequest.indicativeLocalDisplay && (
                      <span className="text-xs font-normal text-slate-400 ml-1.5">
                        (Ref: {selectedRequest.indicativeLocalDisplay})
                      </span>
                    )}
                  </dd>

                  {(() => {
                    const isUsd = selectedRequest.paymentMethod === 'binance_qr' || selectedRequest.currency === 'USD';
                    const orig = isUsd
                      ? Number(selectedRequest.originalAmountUsd ?? selectedRequest.amountUsd ?? 0)
                      : Number(selectedRequest.originalAmountPkr ?? selectedRequest.amountPkr ?? 0);
                    const pDisc = isUsd ? Number(selectedRequest.promoDiscountUsd ?? 0) : Number(selectedRequest.promoDiscountPkr ?? 0);
                    const rDisc = isUsd ? Number(selectedRequest.referralDiscountUsd ?? 0) : Number(selectedRequest.referralDiscountPkr ?? 0);
                    const cUsed = isUsd ? Number(selectedRequest.creditsUsedUsd ?? 0) : Number(selectedRequest.creditsUsedPkr ?? 0);
                    const hasAny = pDisc > 0 || rDisc > 0 || cUsed > 0 || Boolean(selectedRequest.promoCode);
                    if (!hasAny) return null;
                    const fmt = (v: number) => (isUsd ? `$${v.toFixed(2)} USD` : `PKR ${Math.round(v).toLocaleString()}`);
                    return (
                      <>
                        <dt className="text-slate-500 font-medium">Discounts</dt>
                        <dd className="text-xs space-y-1 text-emerald-800">
                          <div>Original: <span className="font-semibold">{fmt(orig)}</span></div>
                          {selectedRequest.promoCode && (
                            <div>
                              Promo <span className="font-mono font-bold">{selectedRequest.promoCode}</span>: -{fmt(pDisc)}
                            </div>
                          )}
                          {rDisc > 0 && <div>Referral Welcome: -{fmt(rDisc)}</div>}
                          {cUsed > 0 && <div>Wallet Credits: -{fmt(cUsed)}</div>}
                        </dd>
                      </>
                    );
                  })()}

                  {selectedRequest.visitorCountryCode && (
                    <>
                      <dt className="text-slate-500 font-medium">Country</dt>
                      <dd className="font-semibold text-[#0F172A]">{selectedRequest.visitorCountryCode}</dd>
                    </>
                  )}

                  <dt className="text-slate-500 font-medium">Dramas</dt>
                  <dd className="font-medium text-[#0F172A]">
                    {resolvePackageDramaNames(selectedRequest.planId, selectedRequest.selectedDramaIds).join(', ') || '—'}
                  </dd>

                  <dt className="text-slate-500 font-medium">Submitted</dt>
                  <dd className="font-medium text-[#0F172A] tabular-nums">
                    {formatDateTime(selectedRequest.proofSubmittedAt || selectedRequest.createdAt)}
                  </dd>

                  {selectedRequest.paymentNote && (
                    <>
                      <dt className="text-slate-500 font-medium">Note</dt>
                      <dd className="font-medium text-[#0F172A]">{selectedRequest.paymentNote}</dd>
                    </>
                  )}

                  <dt className="text-slate-500 font-medium">Status</dt>
                  <dd className="font-semibold uppercase tracking-[0.04em] text-xs text-[#0F172A] self-center">
                    {selectedRequest.status.replace('_', ' ')}
                  </dd>

                  {selectedRequest.reviewedByAdminEmail && (
                    <>
                      <dt className="text-slate-500 font-medium">Reviewed By</dt>
                      <dd className="text-xs text-slate-700 tabular-nums">
                        <span className="font-semibold text-[#0F172A]">{selectedRequest.reviewedByAdminEmail}</span>
                        <div className="text-slate-400 mt-0.5">{formatDateTime(selectedRequest.reviewedAt)}</div>
                      </dd>
                    </>
                  )}

                  {selectedRequest.rejectionReason && (
                    <>
                      <dt className="text-red-700 font-medium">Rejection</dt>
                      <dd className="font-semibold text-red-700">{selectedRequest.rejectionReason}</dd>
                    </>
                  )}

                  {selectedRequest.orderType === 'renewal' && (
                    <div className="col-span-2 mt-1 p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1 text-xs text-blue-950">
                      <div className="font-bold">Renewal Extension Preview</div>
                      <div className="tabular-nums">
                        Target Membership: <span className="font-mono">{selectedRequest.targetMembershipId}</span>
                      </div>
                      {selectedRequest.targetMembershipCurrentExpiry && (
                        <div className="tabular-nums">
                          Current Expiry: {formatDateTime(selectedRequest.targetMembershipCurrentExpiry)}
                        </div>
                      )}
                      <div className="tabular-nums">
                        Projected New Expiry:{' '}
                        <strong>{formatDateTime(getProjectedExtendedExpiry(selectedRequest))}</strong>
                      </div>
                    </div>
                  )}
                </dl>

                {selectedRequest.status !== 'approved' && (
                  <div className="space-y-4">
                    {/* Approve Section with Confirmation Guard */}
                    {confirmApproveId !== selectedRequest.id ? (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => setConfirmApproveId(selectedRequest.id)}
                        className="w-full py-3 px-4 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] hover:text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          {selectedRequest.orderType === 'renewal'
                            ? 'Approve Renewal & Extend Membership'
                            : 'Approve Payment & Activate Membership'}
                        </span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                        <p className="text-[13px] font-semibold text-emerald-950 leading-relaxed">
                          {selectedRequest.orderType === 'renewal'
                            ? `Confirm renewal approval for ${formatOrderAmount(selectedRequest)}? This adds +${selectedRequest.durationDays} days to membership ${selectedRequest.targetMembershipId} (New Expiry: ${formatDateTime(getProjectedExtendedExpiry(selectedRequest))}).`
                            : `Confirm approval for ${formatOrderAmount(selectedRequest)}? This immediately activates ${selectedRequest.planName} (${selectedRequest.durationDays} days).`}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => handleApproveRequest(selectedRequest.id)}
                            className="flex-1 py-2 rounded-lg bg-[#16A34A] text-white text-xs font-semibold cursor-pointer"
                          >
                            {actionBusy ? 'Approving...' : 'Yes, Confirm Approve'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmApproveId(null)}
                            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reject Section (Reason Required) */}
                    {selectedRequest.status !== 'rejected' && (
                      <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2.5">
                        <label className="block text-xs font-semibold text-red-900">
                          Reject Payment (Reason Required)
                        </label>
                        <textarea
                          rows={2}
                          value={rejectReasonInput}
                          onChange={(e) => setRejectReasonInput(e.target.value)}
                          placeholder="e.g. Amount does not match plan or screenshot is blurry"
                          className="w-full px-3 py-2 text-[13px] bg-white border border-red-200 rounded-lg focus:outline-none focus:border-red-400"
                        />
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => handleRejectRequest(selectedRequest.id)}
                          className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
                        >
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>Reject Payment</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {(() => {
                  const linkedToActive =
                    selectedRequest.status === 'approved' &&
                    Boolean(
                      overview?.memberships.some(
                        (s) =>
                          s.status === 'active' &&
                          (s.orderId === selectedRequest.id ||
                            (Boolean(selectedRequest.targetMembershipId) && s.id === selectedRequest.targetMembershipId))
                      )
                    );
                  if (linkedToActive) return null;
                  return (
                    <div className="pt-3 border-t border-slate-200">
                      {deletingRequestId === selectedRequest.id ? (
                        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2.5">
                          <p className="text-xs font-semibold text-red-900 leading-relaxed">
                            Permanently delete this payment request and any uploaded screenshot?
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={actionBusy}
                              onClick={() => handleDeleteRequest(selectedRequest.id)}
                              className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                            >
                              {actionBusy ? 'Deleting...' : 'Yes, Delete Request'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingRequestId(null)}
                              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingRequestId(selectedRequest.id)}
                          className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Delete Unnecessary Request</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Assign Membership Modal */}
      {assignModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setAssignModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 my-8 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#16A34A]">
                  Direct Admin Provisioning
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">
                  Assign Customer Membership
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Activate a Starter, Standard, Plus, or VIP plan for a new or existing customer immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {overview && overview.members.length > 0 && (
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                    Select Existing Customer (Optional)
                  </label>
                  <select
                    value={assignExistingMemberId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAssignExistingMemberId(val);
                      const found = overview.members.find((m) => m.id === val);
                      if (found) {
                        setAssignFullName(found.fullName);
                        setAssignEmail(found.email);
                        setAssignPhone(found.phone || '');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#0F172A]"
                  >
                    <option value="">+ Create / Match by Email Below</option>
                    {overview.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={assignFullName}
                    onChange={(e) => setAssignFullName(e.target.value)}
                    placeholder="e.g. Bilal Ahmed"
                    className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={assignPhone}
                    onChange={(e) => setAssignPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3.5 py-2.5 text-[13px] tabular-nums border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                    Account Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={assignPassword}
                    onChange={(e) => setAssignPassword(e.target.value)}
                    placeholder="Min 6 chars (optional)"
                    className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Membership Plan</label>
                  <select
                    value={assignPlanId}
                    onChange={(e) => handleAssignPlanChange(e.target.value as MembershipPlanId)}
                    className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#0F172A]"
                  >
                    {MEMBERSHIP_PLANS.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — {plan.priceDisplay} ({plan.durationLabel})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    required
                    value={assignDurationDays}
                    onChange={(e) => setAssignDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-[13px] tabular-nums border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-semibold text-slate-700">
                    Included Dramas
                  </label>
                  <span className="text-xs text-slate-500">
                    {`Select ${
                      MEMBERSHIP_PLANS.find((p) => p.id === assignPlanId)?.dramaLimit === 'all'
                        ? 3
                        : MEMBERSHIP_PLANS.find((p) => p.id === assignPlanId)?.dramaLimit || 1
                    }`}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {MEMBERSHIP_DRAMAS.map((drama) => {
                    const selected = assignDramaIds.includes(drama.id);
                    const rawLimit = MEMBERSHIP_PLANS.find((p) => p.id === assignPlanId)?.dramaLimit;
                    const limit = rawLimit === 'all' ? 3 : rawLimit || 1;
                    return (
                      <button
                        key={drama.id}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setAssignDramaIds((prev) => prev.filter((id) => id !== drama.id));
                          } else {
                            setAssignDramaIds((prev) => {
                              const next = [...prev, drama.id];
                              if (typeof limit === 'number' && next.length > limit) {
                                return next.slice(next.length - limit);
                              }
                              return next;
                            });
                          }
                        }}
                        className={`px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                          selected
                            ? 'bg-emerald-50 border-[#22C55E] text-[#0F172A]'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate">{drama.title}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Admin Note (Optional)</label>
                <input
                  type="text"
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="e.g. Verified via WhatsApp transfer"
                  className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] hover:text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap disabled:opacity-60"
                >
                  {assignSubmitting ? 'Activating...' : 'Assign & Activate Membership'}
                </button>
              </div>
            </form>
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

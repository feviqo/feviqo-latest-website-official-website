import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Lock,
  Activity,
  Ban,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import {
  MuxSecurityOverview,
  fetchAdminMuxSecurityOverview,
  revokeAdminMuxPlaybackSession,
} from '../../services/membershipService';

interface MuxSecurityPanelProps {
  onSuccessMessage?: (msg: string) => void;
  onErrorMessage?: (msg: string) => void;
}

export const MuxSecurityPanel: React.FC<MuxSecurityPanelProps> = ({
  onSuccessMessage,
  onErrorMessage,
}) => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<MuxSecurityOverview | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminMuxSecurityOverview();
      if (res.success) {
        setOverview(res);
      } else {
        onErrorMessage?.(('error' in res ? res.error : undefined) || 'Failed to load Mux video security status.');
      }
    } catch {
      onErrorMessage?.('Network error loading Mux video security status.');
    } finally {
      setLoading(false);
    }
  }, [onErrorMessage]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const res = await revokeAdminMuxPlaybackSession(
        sessionId,
        'Revoked manually from Admin Mux Security Monitor'
      );
      if (res.success) {
        setOverview(res);
        onSuccessMessage?.('Playback session revoked immediately.');
      } else {
        onErrorMessage?.(('error' in res ? res.error : undefined) || 'Unable to revoke playback session.');
      }
    } finally {
      setRevokingId(null);
    }
  };

  if (loading && !overview) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
        Loading Mux Premium Video Security overview...
      </div>
    );
  }

  if (!overview) return null;

  const { posture, assetAudit, activeSessions, recentSecurityEvents } = overview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A]">
            Mux Signed Playback · Proxy HLS Guard · Session Controls
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">Mux Video Security &amp; Audit</h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Monitors premium episode playback IDs, RS256 Mux JWT signing configuration, Widevine/FairPlay/PlayReady DRM readiness, concurrent playback sessions, and blocked downloader/direct-MP4 requests.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOverview}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Security Status</span>
        </button>
      </div>

      {/* Posture Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Mux RS256 Signed JWTs</span>
            {posture.signingConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="text-base font-bold text-[#0F172A]">
            {posture.signingConfigured ? 'Configured & Signing' : 'HMAC Proxy Mode Only'}
          </div>
          <div className="text-[11px] text-slate-500">
            {posture.signingConfigured
              ? `Key ID: ${posture.signingKeyIdMasked}`
              : 'Set MUX_SIGNING_KEY_ID & MUX_SIGNING_PRIVATE_KEY on backend.'}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">HLS Proxy &amp; MP4 Blocker</span>
            <Lock className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-base font-bold text-[#0F172A]">Active on Backend</div>
          <div className="text-[11px] text-slate-500">
            Direct .mp4 blocked · Short-lived {Math.round(posture.sessionTtlSeconds / 60)}m session
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Mux DRM &amp; Restrictions</span>
            {posture.drmConfigured ? (
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="text-base font-bold text-[#0F172A]">
            {posture.drmConfigured ? 'DRM + Restrictions Ready' : 'Requires Mux DRM Config'}
          </div>
          <div className="text-[11px] text-slate-500 leading-snug">{posture.drmNote}</div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Session &amp; Watermark Policy</span>
            <Eye className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-base font-bold text-[#0F172A]">
            Max {posture.maxConcurrentSessionsPerMember} Concurrent / Member
          </div>
          <div className="text-[11px] text-slate-500">
            Allowed domains: {posture.allowedDomains.join(', ')}
          </div>
        </div>
      </div>

      {/* Asset & Playback ID Audit Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-[#0F172A]">
            Premium Mux Asset &amp; Playback ID Audit ({assetAudit.length})
          </h3>
          <p className="text-xs text-slate-500">
            Audits whether premium episodes use isolated signed playback IDs or currently share a playback ID with a free episode.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Drama / Episode</th>
                <th className="py-3 px-4">Mux Playback ID</th>
                <th className="py-3 px-4">Policy Mode</th>
                <th className="py-3 px-4">Status &amp; Finding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assetAudit.map((row) => (
                <tr key={`${row.dramaId}:${row.episodeSlug}`} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0F172A]">{row.dramaTitle}</div>
                    <div className="text-slate-500">{row.episodeTitle}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <code className="px-2 py-1 rounded bg-slate-100 text-[11px] font-mono text-[#0F172A]">
                      {row.playbackId}
                    </code>
                    {row.playbackIdOverrideActive && (
                      <div className="text-[11px] text-emerald-700 font-medium mt-1">
                        Env override active
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#0F172A]">
                      {row.playbackPolicyMode === 'signed_jwt' ? 'RS256 Signed JWT' : 'Proxy Token Only'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      DRM: {row.drmReady ? 'Enabled' : 'Not configured'} · Restriction:{' '}
                      {row.restrictionApplied ? 'Yes' : 'Not set'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <div
                      className={`font-semibold ${
                        row.auditStatus === 'protected' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {row.auditStatus === 'protected'
                        ? 'Isolated & Protected'
                        : row.auditStatus === 'warning_shared_playback_id'
                        ? `Shares Playback ID with Free ${row.sharedFreeEpisodeSlug}`
                        : 'Missing Mux Signing Keys'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {row.auditNote}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Playback Sessions & Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#16A34A]" />
              <span>Active Playback Sessions ({activeSessions.length})</span>
            </h3>
          </div>
          {activeSessions.length === 0 ? (
            <div className="p-5 text-xs text-slate-500">No active premium playback sessions right now.</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {activeSessions.map((s) => (
                <div key={s.id} className="px-5 py-3.5 text-xs flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#0F172A]">
                      {s.memberEmail} · {s.dramaId}/{s.episodeSlug}
                    </div>
                    <div className="text-slate-500">
                      Watermark: <code className="font-mono">{s.watermarkText}</code>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      IP: {s.ip} · Expires {new Date(s.expiresAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={revokingId === s.id}
                    onClick={() => handleRevokeSession(s.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Ban className="w-3 h-3" />
                    <span>{revokingId === s.id ? 'Revoking...' : 'Revoke'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Recent Security &amp; Suspicious Request Events ({recentSecurityEvents.length})
            </h3>
          </div>
          {recentSecurityEvents.length === 0 ? (
            <div className="p-5 text-xs text-slate-500">No suspicious playback or downloader attempts logged yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {recentSecurityEvents.map((ev) => (
                <div key={ev.id} className="px-5 py-3 text-xs space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#0F172A]">{ev.type}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-600">{ev.reason}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    IP: {ev.ip} · {ev.memberEmail || 'anonymous'} · UA: {ev.userAgent}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

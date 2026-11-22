import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { CatalogDramaMeta } from '../src/data/membershipCatalog';

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'mux_playback_sessions.json');
const SECURITY_EVENTS_FILE = path.join(DATA_DIR, 'mux_security_events.json');
const STREAM_SECRET_FILE = path.join(DATA_DIR, '.mux_stream_proxy_secret');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface MuxPlaybackSession {
  id: string;
  sessionToken: string;
  memberId: string;
  memberEmail: string;
  membershipId: string;
  planName: string;
  dramaId: string;
  episodeSlug: string;
  playbackId: string;
  ipHash: string;
  uaHash: string;
  watermarkText: string;
  watermarkSubtext: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  requestCount: number;
  revoked: boolean;
  revokedAt?: string;
  revokedReason?: string;
}

export interface MuxSecurityEvent {
  id: string;
  type:
    | 'session_created'
    | 'concurrent_limit_evicted'
    | 'session_revoked'
    | 'downloader_ua_blocked'
    | 'rate_limit_blocked'
    | 'invalid_proxy_signature'
    | 'entitlement_lost_mid_stream'
    | 'mp4_direct_blocked'
    | 'domain_mismatch_blocked'
    | 'suspicious_request';
  severity: 'info' | 'warning' | 'critical';
  memberId?: string;
  memberEmail?: string;
  dramaId?: string;
  episodeSlug?: string;
  ipHash?: string;
  userAgent?: string;
  details: string;
  createdAt: string;
}

export interface MuxAssetAuditItem {
  dramaId: string;
  dramaTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  playbackId: string;
  playbackIdSource: 'env_override' | 'default_catalog';
  sharesPlaybackIdWithFreeEpisode: boolean;
  sharedWithFreeSlugs: string[];
  protectedByBackendProxy: boolean;
  signedPolicyStatus: 'active_rs256_signed' | 'proxy_protected_unsigned_origin';
  drmStatus: 'configured' | 'requires_mux_enterprise_drm_id';
  playbackRestrictionConfigured: boolean;
  directMp4Blocked: boolean;
}

export interface MuxSecurityStatus {
  signedUrlsEnabled: boolean;
  signingKeyIdConfigured: boolean;
  signingKeyIdMasked: string | null;
  signingPrivateKeyValid: boolean;
  playbackRestrictionConfigured: boolean;
  playbackRestrictionId: string | null;
  drmConfigured: boolean;
  drmConfigurationId: string | null;
  drmNote: string;
  drmSystems: {
    widevine: boolean;
    fairplay: boolean;
    playready: boolean;
  };
  allowedDomains: string[];
  jwtTtlSeconds: number;
  maxConcurrentSessionsPerMember: number;
  sessionTtlSeconds: number;
  backendProxyEnabled: boolean;
  mp4DirectAccessBlocked: boolean;
  watermarkingEnabled: boolean;
}

const MAX_CONCURRENT_SESSIONS = 3;
const SESSION_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours (re-validated against membership status & revocation on every request)
const PROXY_URL_TTL_SECONDS = 6 * 60 * 60; // 6 hours for full VOD episode playback without mid-episode 403 expiry

const DOWNLOADER_UA_PATTERNS: RegExp[] = [
  /\bIDM\b/i,
  /Internet\s*Download\s*Manager/i,
  /yt-?dlp/i,
  /youtube-?dl/i,
  /\bffmpeg\b/i,
  /\bffprobe\b/i,
  /\baria2\b/i,
  /\bwget\b/i,
  /\bcurl\b/i,
  /python-requests/i,
  /python-urllib/i,
  /aiohttp/i,
  /httpclient/i,
  /go-http-client/i,
  /jdownloader/i,
  /streamlink/i,
  /hlsdl/i,
  /N_m3u8DL/i,
  /Free\s*Download\s*Manager/i,
  /\bFDM\b/i,
  /EagleGet/i,
  /Folx/i,
  /Neat\s*Download/i,
  /1DM/i,
  /ADM\b/i,
  /DownThemAll/i,
  /VideoDownloadHelper/i,
  /SaveFrom/i,
  /AnyVideoConverter/i,
];

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  const tmpPath = `${filePath}.${crypto.randomBytes(3).toString('hex')}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

function getStreamProxySecret(): string {
  const envSecret = process.env.MUX_STREAM_PROXY_SECRET?.trim() || process.env.MEMBER_SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 24) return envSecret;
  try {
    if (fs.existsSync(STREAM_SECRET_FILE)) {
      const saved = fs.readFileSync(STREAM_SECRET_FILE, 'utf-8').trim();
      if (saved.length >= 24) return saved;
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(STREAM_SECRET_FILE, generated, { mode: 0o600 });
    return generated;
  } catch {
    return 'feviqo-fallback-mux-proxy-secret-rotate-in-prod';
  }
}

function hashValue(val: string): string {
  return crypto
    .createHmac('sha256', getStreamProxySecret())
    .update(String(val || ''))
    .digest('hex')
    .slice(0, 16);
}

export function maskMemberEmailForWatermark(email?: string): string {
  const clean = String(email || '').trim().toLowerCase();
  const at = clean.indexOf('@');
  if (at <= 0) return 'feviqo-member';
  const local = clean.slice(0, at);
  const domain = clean.slice(at + 1);
  const visibleLocal = local.length <= 2 ? local[0] : `${local.slice(0, 2)}***`;
  return `${visibleLocal}@${domain}`;
}

function parseMuxPrivateKey(): crypto.KeyObject | null {
  const raw = (process.env.MUX_SIGNING_PRIVATE_KEY || '').trim();
  if (!raw) return null;
  const candidates: string[] = [];
  if (raw.includes('BEGIN') && raw.includes('PRIVATE KEY')) {
    candidates.push(raw.replace(/\\n/g, '\n'));
  } else {
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf-8');
      if (decoded.includes('PRIVATE KEY')) {
        candidates.push(decoded.replace(/\\n/g, '\n'));
      }
    } catch {}
    candidates.push(raw.replace(/\\n/g, '\n'));
  }

  for (const pem of candidates) {
    try {
      return crypto.createPrivateKey(pem);
    } catch {}
  }
  return null;
}

export function getAllowedMuxDomains(): string[] {
  const raw = process.env.MUX_ALLOWED_DOMAINS || 'feviqo.com,www.feviqo.com,localhost,127.0.0.1';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getMuxSecurityStatus(): MuxSecurityStatus {
  const keyId = (process.env.MUX_SIGNING_KEY_ID || '').trim();
  const keyObj = parseMuxPrivateKey();
  const restrictionId = (process.env.MUX_PLAYBACK_RESTRICTION_ID || '').trim() || null;
  const drmId = (process.env.MUX_DRM_CONFIGURATION_ID || '').trim() || null;
  const ttlRaw = Number(process.env.MUX_JWT_TTL_SECONDS || 14400);
  const jwtTtlSeconds = Number.isFinite(ttlRaw) ? Math.min(21600, Math.max(300, Math.round(ttlRaw))) : 14400;
  const signedUrlsEnabled = Boolean(keyId && keyObj);

  const signingKeyIdMasked = keyId
    ? keyId.length <= 8
      ? `${keyId.slice(0, 2)}***`
      : `${keyId.slice(0, 4)}...${keyId.slice(-4)}`
    : null;
  const drmNote = drmId
    ? 'Mux DRM (Widevine, FairPlay, PlayReady) configuration ID is attached to playback tokens.'
    : 'Mux Enterprise DRM requires a MUX_DRM_CONFIGURATION_ID in your Mux account; streams are currently protected by backend membership HLS proxy and RS256 playback signing when configured.';

  return {
    signedUrlsEnabled,
    signingKeyIdConfigured: Boolean(keyId),
    signingKeyIdMasked,
    signingPrivateKeyValid: Boolean(keyObj),
    playbackRestrictionConfigured: Boolean(restrictionId),
    playbackRestrictionId: restrictionId,
    drmConfigured: Boolean(drmId),
    drmConfigurationId: drmId,
    drmNote,
    drmSystems: {
      widevine: Boolean(drmId),
      fairplay: Boolean(drmId),
      playready: Boolean(drmId),
    },
    allowedDomains: getAllowedMuxDomains(),
    jwtTtlSeconds,
    maxConcurrentSessionsPerMember: MAX_CONCURRENT_SESSIONS,
    sessionTtlSeconds: Math.round(SESSION_TTL_MS / 1000),
    backendProxyEnabled: true,
    mp4DirectAccessBlocked: true,
    watermarkingEnabled: true,
  };
}

export function extractPlaybackIdFromUrl(url: string): string {
  const match = String(url || '').match(/stream\.mux\.com\/([a-zA-Z0-9_-]+)/i);
  return match?.[1] || '';
}

export function resolveEpisodePlaybackOverride(
  dramaId: string,
  episodeSlug: string,
  defaultStreamUrl: string
): { streamUrl: string; playbackId: string; source: 'env_override' | 'default_catalog' } {
  const key = `${dramaId}:${episodeSlug}`;
  let overridePid = '';

  const jsonMapRaw = (process.env.MUX_PREMIUM_PLAYBACK_IDS_JSON || '').trim();
  if (jsonMapRaw) {
    try {
      const parsed = JSON.parse(jsonMapRaw) as Record<string, string>;
      if (parsed[key] && /^[a-zA-Z0-9_-]{8,}$/.test(parsed[key].trim())) {
        overridePid = parsed[key].trim();
      }
    } catch {}
  }

  const envVarName = `MUX_PLAYBACK_${dramaId.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()}_${episodeSlug
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toUpperCase()}`;
  const directEnvPid = (process.env[envVarName] || '').trim();
  if (directEnvPid && /^[a-zA-Z0-9_-]{8,}$/.test(directEnvPid)) {
    overridePid = directEnvPid;
  }

  if (overridePid) {
    return {
      streamUrl: `https://stream.mux.com/${overridePid}.m3u8`,
      playbackId: overridePid,
      source: 'env_override',
    };
  }

  return {
    streamUrl: defaultStreamUrl,
    playbackId: extractPlaybackIdFromUrl(defaultStreamUrl),
    source: 'default_catalog',
  };
}

export function generateMuxPlaybackJwt(
  playbackId: string,
  audience: 'v' | 't' | 'g' | 's' | 'drm_license' = 'v',
  ttlSeconds?: number
): { token: string; expiresAt: string } | null {
  const keyId = (process.env.MUX_SIGNING_KEY_ID || '').trim();
  const privateKey = parseMuxPrivateKey();
  if (!keyId || !privateKey || !playbackId) return null;

  const status = getMuxSecurityStatus();
  const ttl = ttlSeconds ?? status.jwtTtlSeconds;
  const exp = Math.floor(Date.now() / 1000) + ttl;

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: keyId,
  };

  const payload: Record<string, unknown> = {
    sub: playbackId,
    aud: audience,
    exp,
  };

  if (audience === 'v' && status.playbackRestrictionId) {
    payload.playback_restriction_id = status.playbackRestrictionId;
  }

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${b64Header}.${b64Payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), privateKey).toString('base64url');

  return {
    token: `${signingInput}.${signature}`,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

export function isAllowedUpstreamMuxUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    // Explicitly block static/progressive mp4 files on premium proxy paths
    if (u.pathname.toLowerCase().endsWith('.mp4') || u.searchParams.get('download') === '1') {
      return false;
    }
    return (
      host === 'stream.mux.com' ||
      host.endsWith('.mux.com') ||
      host.endsWith('.muxed.com') ||
      host === 'fastly.mux.com' ||
      host === 'license.mux.com'
    );
  } catch {
    return false;
  }
}

export function attachMuxJwtIfConfigured(upstreamUrl: string, playbackId: string): string {
  if (!playbackId) return upstreamUrl;
  try {
    const u = new URL(upstreamUrl);
    if (u.hostname.toLowerCase() !== 'stream.mux.com') {
      return upstreamUrl;
    }
    const jwt = generateMuxPlaybackJwt(playbackId, 'v');
    if (!jwt) return upstreamUrl;
    u.searchParams.set('token', jwt.token);
    return u.toString();
  } catch {
    return upstreamUrl;
  }
}

export function detectDownloaderUserAgent(userAgent?: string | null): string | null {
  const ua = String(userAgent || '').trim();
  if (!ua) return 'Missing User-Agent header';
  for (const pat of DOWNLOADER_UA_PATTERNS) {
    if (pat.test(ua)) {
      return `Blocked automated downloader / ripper client (${pat.source})`;
    }
  }
  return null;
}

export function isAllowedPlaybackRequestOrigin(originHeader?: string, refererHeader?: string, hostHeader?: string): boolean {
  const candidate = originHeader || refererHeader;
  if (!candidate) return true; // Direct XHR or same-site fetches without Origin/Referer allowed when session token is valid
  try {
    const u = new URL(candidate);
    const hostname = u.hostname.toLowerCase();
    const requestHost = String(hostHeader || '').split(':')[0].toLowerCase();
    if (requestHost && hostname === requestHost) return true;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.run.app') ||
      hostname.endsWith('.pages.dev') ||
      hostname.endsWith('.workers.dev')
    ) {
      return true;
    }
    const allowed = getAllowedMuxDomains();
    return allowed.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export function checkPlaybackRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = rateBuckets.get(bucketKey);
  if (!existing || existing.resetAt <= now) {
    rateBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  existing.count += 1;
  rateBuckets.set(bucketKey, existing);
  if (existing.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  return { allowed: true, remaining: maxRequests - existing.count, resetAt: existing.resetAt };
}

export function appendMuxSecurityEvent(
  event: Omit<MuxSecurityEvent, 'id' | 'createdAt'>
): MuxSecurityEvent {
  const list = readJson<MuxSecurityEvent[]>(SECURITY_EVENTS_FILE, []);
  const entry: MuxSecurityEvent = {
    id: `mxs-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    ...event,
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  writeJson(SECURITY_EVENTS_FILE, list.slice(0, 400));
  return entry;
}

export function createPlaybackSession(params: {
  memberId: string;
  memberEmail: string;
  membershipId: string;
  membershipExpiresAt: string;
  planName: string;
  dramaId: string;
  episodeSlug: string;
  playbackId: string;
  ip: string;
  ua: string;
}): MuxPlaybackSession {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const membershipExpMs = Date.parse(params.membershipExpiresAt) || nowMs + SESSION_TTL_MS;
  const sessionExpMs = Math.min(nowMs + SESSION_TTL_MS, membershipExpMs);

  let sessions = readJson<MuxPlaybackSession[]>(SESSIONS_FILE, []);
  // Prune expired sessions older than 24h to keep file compact
  sessions = sessions.filter((s) => Date.parse(s.expiresAt) > nowMs - 24 * 60 * 60 * 1000);

  // Enforce concurrent active session limit per member
  const activeForMember = sessions
    .filter((s) => s.memberId === params.memberId && !s.revoked && Date.parse(s.expiresAt) > nowMs)
    .sort((a, b) => Date.parse(a.lastActivityAt) - Date.parse(b.lastActivityAt));

  if (activeForMember.length >= MAX_CONCURRENT_SESSIONS) {
    const toEvictCount = activeForMember.length - MAX_CONCURRENT_SESSIONS + 1;
    const toEvictIds = new Set(activeForMember.slice(0, toEvictCount).map((s) => s.id));
    for (let i = 0; i < sessions.length; i += 1) {
      if (toEvictIds.has(sessions[i].id)) {
        sessions[i].revoked = true;
        sessions[i].revokedAt = nowIso;
        sessions[i].revokedReason = `Concurrent playback session cap (${MAX_CONCURRENT_SESSIONS}) exceeded`;
      }
    }
    appendMuxSecurityEvent({
      type: 'concurrent_limit_evicted',
      severity: 'info',
      memberId: params.memberId,
      memberEmail: params.memberEmail,
      dramaId: params.dramaId,
      episodeSlug: params.episodeSlug,
      ipHash: hashValue(params.ip),
      details: `Evicted ${toEvictIds.size} oldest session(s) for ${params.memberEmail} after reaching ${MAX_CONCURRENT_SESSIONS} active sessions.`,
    });
  }

  const id = `msid-${nowMs}-${crypto.randomBytes(3).toString('hex')}`;
  const randomSecret = crypto.randomBytes(18).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getStreamProxySecret())
    .update(`${id}:${params.memberId}:${params.dramaId}:${params.episodeSlug}:${randomSecret}`)
    .digest('base64url')
    .slice(0, 20);
  const sessionToken = `${id}.${randomSecret}.${sig}`;

  const maskedEmail = maskMemberEmailForWatermark(params.memberEmail);
  const watermarkText = `${maskedEmail} · ID:${params.memberId.slice(-6).toUpperCase()}`;
  const watermarkSubtext = `FEVIQO PROTECTED · SES:${id.slice(-6).toUpperCase()}`;

  const session: MuxPlaybackSession = {
    id,
    sessionToken,
    memberId: params.memberId,
    memberEmail: params.memberEmail,
    membershipId: params.membershipId,
    planName: params.planName,
    dramaId: params.dramaId,
    episodeSlug: params.episodeSlug,
    playbackId: params.playbackId,
    ipHash: hashValue(params.ip),
    uaHash: hashValue(params.ua),
    watermarkText,
    watermarkSubtext,
    createdAt: nowIso,
    lastActivityAt: nowIso,
    expiresAt: new Date(sessionExpMs).toISOString(),
    requestCount: 1,
    revoked: false,
  };

  sessions.unshift(session);
  writeJson(SESSIONS_FILE, sessions.slice(0, 500));

  appendMuxSecurityEvent({
    type: 'session_created',
    severity: 'info',
    memberId: params.memberId,
    memberEmail: params.memberEmail,
    dramaId: params.dramaId,
    episodeSlug: params.episodeSlug,
    ipHash: session.ipHash,
    userAgent: String(params.ua || '').slice(0, 140),
    details: `Authorized playback session ${id} (${params.planName}) for ${params.dramaId}/${params.episodeSlug}.`,
  });

  return session;
}

export function getPlaybackSessionByToken(sessionToken: string): MuxPlaybackSession | null {
  if (!sessionToken || typeof sessionToken !== 'string') return null;
  const sessions = readJson<MuxPlaybackSession[]>(SESSIONS_FILE, []);
  return sessions.find((s) => s.sessionToken === sessionToken) || null;
}

export function getPlaybackSessionById(sessionId: string): MuxPlaybackSession | null {
  if (!sessionId || typeof sessionId !== 'string') return null;
  const sessions = readJson<MuxPlaybackSession[]>(SESSIONS_FILE, []);
  return sessions.find((s) => s.id === sessionId) || null;
}

const lastSessionDiskTouchMs = new Map<string, number>();

export function touchPlaybackSession(sessionId: string): void {
  const nowMs = Date.now();
  const prevTouch = lastSessionDiskTouchMs.get(sessionId) || 0;
  if (nowMs - prevTouch < 25_000) {
    return;
  }
  lastSessionDiskTouchMs.set(sessionId, nowMs);
  const sessions = readJson<MuxPlaybackSession[]>(SESSIONS_FILE, []);
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx].lastActivityAt = new Date(nowMs).toISOString();
  sessions[idx].requestCount = (sessions[idx].requestCount || 0) + 1;
  // Sliding expiration window so active viewers watching a 2.5h+ episode never hit mid-stream expiry
  const extendedMs = nowMs + SESSION_TTL_MS;
  const currentExpMs = Date.parse(sessions[idx].expiresAt) || 0;
  if (extendedMs > currentExpMs) {
    sessions[idx].expiresAt = new Date(extendedMs).toISOString();
  }
  writeJson(SESSIONS_FILE, sessions);
}

export function revokePlaybackSessionById(sessionId: string, reason: string): MuxPlaybackSession | null {
  const sessions = readJson<MuxPlaybackSession[]>(SESSIONS_FILE, []);
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return null;
  const nowIso = new Date().toISOString();
  sessions[idx].revoked = true;
  sessions[idx].revokedAt = nowIso;
  sessions[idx].revokedReason = reason;
  writeJson(SESSIONS_FILE, sessions);

  appendMuxSecurityEvent({
    type: 'session_revoked',
    severity: 'warning',
    memberId: sessions[idx].memberId,
    memberEmail: sessions[idx].memberEmail,
    dramaId: sessions[idx].dramaId,
    episodeSlug: sessions[idx].episodeSlug,
    details: `Playback session ${sessionId} revoked: ${reason}`,
  });

  return sessions[idx];
}

export function revokePlaybackSessionsForMember(memberId: string, reason: string): number {
  const sessions = readJson<MuxPlaybackSession[]>(SESSIONS_FILE, []);
  const nowIso = new Date().toISOString();
  let count = 0;
  for (let i = 0; i < sessions.length; i += 1) {
    if (sessions[i].memberId === memberId && !sessions[i].revoked) {
      sessions[i].revoked = true;
      sessions[i].revokedAt = nowIso;
      sessions[i].revokedReason = reason;
      count += 1;
    }
  }
  if (count > 0) {
    writeJson(SESSIONS_FILE, sessions);
    appendMuxSecurityEvent({
      type: 'session_revoked',
      severity: 'warning',
      memberId,
      details: `Revoked ${count} active playback session(s) for member ${memberId}: ${reason}`,
    });
  }
  return count;
}

export function signProxyTarget(sessionId: string, targetUrl: string, ttlSeconds = PROXY_URL_TTL_SECONDS): {
  u: string;
  exp: string;
  sig: string;
} {
  const exp = String(Math.floor(Date.now() / 1000) + ttlSeconds);
  const u = Buffer.from(targetUrl, 'utf-8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getStreamProxySecret())
    .update(`${sessionId}:${u}:${exp}`)
    .digest('base64url')
    .slice(0, 24);
  return { u, exp, sig };
}

export function verifyProxyTarget(sessionId: string, u: string, exp: string, sig: string): string | null {
  if (!sessionId || !u || !exp || !sig) return null;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Math.floor(Date.now() / 1000)) {
    return null;
  }
  const expectedSig = crypto
    .createHmac('sha256', getStreamProxySecret())
    .update(`${sessionId}:${u}:${exp}`)
    .digest('base64url')
    .slice(0, 24);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const decoded = Buffer.from(u, 'base64url').toString('utf-8');
    if (!isAllowedUpstreamMuxUrl(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function rewriteM3u8Manifest(params: {
  manifestText: string;
  baseManifestUrl: string;
  sessionId: string;
  sessionToken: string;
}): string {
  const { manifestText, baseManifestUrl, sessionId, sessionToken } = params;
  const lines = manifestText.split(/\r?\n/);

  const buildProxyHref = (rawTarget: string, kind: 'variant.m3u8' | 'seg'): string => {
    try {
      const resolved = new URL(rawTarget, baseManifestUrl).toString();
      if (!isAllowedUpstreamMuxUrl(resolved)) {
        return rawTarget;
      }
      const signed = signProxyTarget(sessionId, resolved);
      return `/api/membership/stream/${encodeURIComponent(sessionToken)}/${kind}?u=${encodeURIComponent(
        signed.u
      )}&exp=${encodeURIComponent(signed.exp)}&sig=${encodeURIComponent(signed.sig)}`;
    } catch {
      return rawTarget;
    }
  };

  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      // Rewrite URI="..." attributes inside HLS tags (#EXT-X-KEY, #EXT-X-MAP, #EXT-X-MEDIA, #EXT-X-I-FRAME-STREAM-INF)
      if (trimmed.startsWith('#')) {
        if (!trimmed.includes('URI="')) return line;
        const isNestedManifest =
          trimmed.startsWith('#EXT-X-MEDIA') || trimmed.startsWith('#EXT-X-I-FRAME-STREAM-INF');
        return line.replace(/URI="([^"]+)"/g, (_m, uriVal: string) => {
          const isPlaylist = isNestedManifest || /\.m3u8(\?|$)/i.test(uriVal);
          const proxied = buildProxyHref(uriVal, isPlaylist ? 'variant.m3u8' : 'seg');
          return `URI="${proxied}"`;
        });
      }

      // Non-comment media/playlist URI line
      const isPlaylist = /\.m3u8(\?|$)/i.test(trimmed);
      return buildProxyHref(trimmed, isPlaylist ? 'variant.m3u8' : 'seg');
    })
    .join('\n');
}

export function auditProtectedMuxAssets(
  protectedStreams: Record<string, Record<string, string>>,
  catalogDramas: CatalogDramaMeta[]
): MuxAssetAuditItem[] {
  const status = getMuxSecurityStatus();
  const out: MuxAssetAuditItem[] = [];

  for (const drama of catalogDramas) {
    const dramaStreams = protectedStreams[drama.id] || {};
    const freeUrls = new Map<string, string[]>();
    for (const ep of drama.episodes) {
      if (ep.accessType === 'free') {
        const u = dramaStreams[ep.slug];
        const pid = extractPlaybackIdFromUrl(u || '');
        if (pid) {
          freeUrls.set(pid, [...(freeUrls.get(pid) || []), ep.slug]);
        }
      }
    }

    for (const ep of drama.episodes) {
      if (ep.accessType !== 'premium') continue;
      const defaultUrl = dramaStreams[ep.slug] || '';
      const resolved = resolveEpisodePlaybackOverride(drama.id, ep.slug, defaultUrl);
      const sharedFree = resolved.playbackId ? freeUrls.get(resolved.playbackId) || [] : [];

      out.push({
        dramaId: drama.id,
        dramaTitle: drama.title,
        episodeSlug: ep.slug,
        episodeTitle: ep.title,
        playbackId: resolved.playbackId,
        playbackIdSource: resolved.source,
        sharesPlaybackIdWithFreeEpisode: sharedFree.length > 0,
        sharedWithFreeSlugs: sharedFree,
        protectedByBackendProxy: true,
        signedPolicyStatus: status.signedUrlsEnabled
          ? 'active_rs256_signed'
          : 'proxy_protected_unsigned_origin',
        drmStatus: status.drmConfigured ? 'configured' : 'requires_mux_enterprise_drm_id',
        playbackRestrictionConfigured: status.playbackRestrictionConfigured,
        directMp4Blocked: true,
      });
    }
  }

  return out;
}

export function getMuxSecurityAdminOverview(
  protectedStreams: Record<string, Record<string, string>>,
  catalogDramas: CatalogDramaMeta[]
) {
  const nowMs = Date.now();
  const sessions = readJson<MuxPlaybackSession[]>(SESSIONS_FILE, []).sort(
    (a, b) => Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt)
  );
  const events = readJson<MuxSecurityEvent[]>(SECURITY_EVENTS_FILE, []).slice(0, 120);
  const activeSessions = sessions.filter((s) => !s.revoked && Date.parse(s.expiresAt) > nowMs);

  return {
    configStatus: getMuxSecurityStatus(),
    assetsAudit: auditProtectedMuxAssets(protectedStreams, catalogDramas),
    activeSessions: activeSessions.slice(0, 100),
    recentSessions: sessions.slice(0, 60),
    securityEvents: events,
    metrics: {
      activeSessionCount: activeSessions.length,
      totalSessionsLogged: sessions.length,
      blockedEventsCount: events.filter((e) => e.severity === 'warning' || e.severity === 'critical').length,
      downloaderBlocksCount: events.filter((e) => e.type === 'downloader_ua_blocked').length,
      rateLimitBlocksCount: events.filter((e) => e.type === 'rate_limit_blocked').length,
    },
  };
}

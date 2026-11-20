/**
 * Cloudflare Pages Function — Official FEVIQO WhatsApp Cloud API Webhook Proxy
 *
 * Route: https://feviqo.com/api/webhooks/whatsapp (GET & POST only)
 *
 * Forwards Meta WhatsApp Cloud API webhook verification (GET) and signed webhook
 * event payloads (POST) directly to the FEVIQO Express backend hosted on Render,
 * preserving:
 *   - Exact query string parameters (hub.mode, hub.verify_token, hub.challenge)
 *   - Exact untouched raw POST body bytes (required for X-Hub-Signature-256 HMAC verification)
 *   - Original X-Hub-Signature-256, Content-Type, and forwarding headers
 *
 * Required Cloudflare Pages Environment Variable (Production & Preview):
 *   RENDER_BACKEND_ORIGIN = https://<your-render-service>.onrender.com
 *
 * Scoped strictly to /api/webhooks/whatsapp so no other website routes or static
 * pages on feviqo.com are affected.
 */

interface PagesEnv {
  RENDER_BACKEND_ORIGIN?: string;
  FEVIQO_BACKEND_ORIGIN?: string;
}

interface PagesContext {
  request: Request;
  env: PagesEnv;
}

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
};

function resolveRenderOrigin(env: PagesEnv, incomingHost: string): {
  ok: true;
  origin: string;
} | {
  ok: false;
  status: number;
  error: string;
} {
  const rawOrigin = String(env.RENDER_BACKEND_ORIGIN || env.FEVIQO_BACKEND_ORIGIN || '').trim();
  if (!rawOrigin) {
    return {
      ok: false,
      status: 503,
      error:
        'RENDER_BACKEND_ORIGIN is not configured in Cloudflare Pages environment variables. Set RENDER_BACKEND_ORIGIN to your Render backend URL (e.g. https://your-service.onrender.com).',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawOrigin);
  } catch {
    return {
      ok: false,
      status: 500,
      error: 'RENDER_BACKEND_ORIGIN is not a valid URL.',
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      ok: false,
      status: 500,
      error: 'RENDER_BACKEND_ORIGIN must use HTTPS.',
    };
  }

  const targetHost = parsed.hostname.toLowerCase();
  const requestHost = incomingHost.toLowerCase();
  if (
    targetHost === requestHost ||
    targetHost === 'feviqo.com' ||
    targetHost === 'www.feviqo.com'
  ) {
    return {
      ok: false,
      status: 508,
      error:
        'Loop prevented: RENDER_BACKEND_ORIGIN must point directly to your Render backend hostname (e.g. https://<service>.onrender.com), not feviqo.com.',
    };
  }

  return { ok: true, origin: parsed.origin };
}

async function proxyWhatsAppWebhook(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  if (method !== 'GET' && method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method Not Allowed. Only GET and POST are supported.' }),
      {
        status: 405,
        headers: {
          ...NO_STORE_HEADERS,
          Allow: 'GET, POST',
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }

  if (request.headers.get('x-feviqo-webhook-proxy')) {
    return new Response(
      JSON.stringify({ success: false, error: 'Webhook proxy loop detected.' }),
      {
        status: 508,
        headers: {
          ...NO_STORE_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }

  const incomingUrl = new URL(request.url);
  const resolved = resolveRenderOrigin(env, incomingUrl.hostname);
  if ('error' in resolved) {
    return new Response(
      JSON.stringify({
        success: false,
        code: 'WEBHOOK_PROXY_NOT_CONFIGURED',
        error: resolved.error,
      }),
      {
        status: resolved.status,
        headers: {
          ...NO_STORE_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }

  const upstreamUrl = `${resolved.origin}/api/webhooks/whatsapp${incomingUrl.search}`;

  const forwardHeaders = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) forwardHeaders.set('content-type', contentType);

  const hubSig256 = request.headers.get('x-hub-signature-256');
  if (hubSig256) forwardHeaders.set('x-hub-signature-256', hubSig256);

  const hubSigLegacy = request.headers.get('x-hub-signature');
  if (hubSigLegacy) forwardHeaders.set('x-hub-signature', hubSigLegacy);

  const userAgent = request.headers.get('user-agent');
  if (userAgent) forwardHeaders.set('user-agent', userAgent);

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const existingXff = request.headers.get('x-forwarded-for');
  if (cfConnectingIp) {
    forwardHeaders.set(
      'x-forwarded-for',
      existingXff ? `${existingXff}, ${cfConnectingIp}` : cfConnectingIp
    );
  } else if (existingXff) {
    forwardHeaders.set('x-forwarded-for', existingXff);
  }

  forwardHeaders.set('x-forwarded-host', incomingUrl.host);
  forwardHeaders.set('x-forwarded-proto', 'https');
  forwardHeaders.set('x-feviqo-webhook-proxy', 'cloudflare-pages');

  try {
    // Preserve exact untouched raw bytes for POST so Meta HMAC-SHA256 verification succeeds on Render
    const rawBody = method === 'POST' ? await request.arrayBuffer() : undefined;

    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: forwardHeaders,
      body: rawBody,
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    const upstreamContentType = upstreamResponse.headers.get('content-type');
    if (upstreamContentType) {
      responseHeaders.set('content-type', upstreamContentType);
    }
    responseHeaders.set('cache-control', 'no-store, no-cache, must-revalidate');
    responseHeaders.set('x-content-type-options', 'nosniff');

    const responseBody = await upstreamResponse.arrayBuffer();
    return new Response(responseBody, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        code: 'UPSTREAM_RENDER_UNREACHABLE',
        error: 'Unable to reach FEVIQO Render backend for WhatsApp webhook.',
      }),
      {
        status: 502,
        headers: {
          ...NO_STORE_HEADERS,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

export const onRequestGet = (context: PagesContext) => proxyWhatsAppWebhook(context);
export const onRequestPost = (context: PagesContext) => proxyWhatsAppWebhook(context);
export const onRequest = (context: PagesContext) => proxyWhatsAppWebhook(context);

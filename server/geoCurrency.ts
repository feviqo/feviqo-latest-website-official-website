import type { Request } from 'express';
import {
  DEFAULT_USD_PRICES,
  MembershipPlanId,
  PaymentRegion,
} from '../src/data/membershipCatalog';

export interface CurrencyMeta {
  code: string;
  symbol: string;
  decimals: number;
}

export interface IndicativePlanPrice {
  usd: number;
  formattedUsd: string;
  approxLocal: number;
  formattedApproxLocal: string;
  currencyCode: string;
}

export interface GeoPricingInfo {
  countryCode: string;
  countryName: string;
  detected: boolean;
  defaultRegion: PaymentRegion;
  localCurrencyCode: string;
  localCurrencySymbol: string;
  rateFromUsd: number;
  rateSource: 'live' | 'cached' | 'fallback';
  ratesUpdatedAt: string;
  indicativePlans: Record<MembershipPlanId, IndicativePlanPrice>;
}

const COUNTRY_NAMES: Record<string, string> = {
  PK: 'Pakistan',
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  CA: 'Canada',
  AU: 'Australia',
  TR: 'Türkiye',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  ES: 'Spain',
  IT: 'Italy',
  MY: 'Malaysia',
  BD: 'Bangladesh',
  QA: 'Qatar',
  KW: 'Kuwait',
  OM: 'Oman',
  BH: 'Bahrain',
  NO: 'Norway',
  SE: 'Sweden',
};

const EURO_COUNTRIES = new Set([
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'HR',
]);

const COUNTRY_CURRENCY_MAP: Record<string, CurrencyMeta> = {
  PK: { code: 'PKR', symbol: 'PKR ', decimals: 0 },
  IN: { code: 'INR', symbol: '₹', decimals: 0 },
  US: { code: 'USD', symbol: '$', decimals: 2 },
  GB: { code: 'GBP', symbol: '£', decimals: 2 },
  UK: { code: 'GBP', symbol: '£', decimals: 2 },
  AE: { code: 'AED', symbol: 'AED ', decimals: 2 },
  SA: { code: 'SAR', symbol: 'SAR ', decimals: 2 },
  CA: { code: 'CAD', symbol: 'CA$', decimals: 2 },
  AU: { code: 'AUD', symbol: 'A$', decimals: 2 },
  TR: { code: 'TRY', symbol: '₺', decimals: 0 },
  MY: { code: 'MYR', symbol: 'RM ', decimals: 2 },
  BD: { code: 'BDT', symbol: '৳', decimals: 0 },
  QA: { code: 'QAR', symbol: 'QAR ', decimals: 2 },
  KW: { code: 'KWD', symbol: 'KWD ', decimals: 2 },
  OM: { code: 'OMR', symbol: 'OMR ', decimals: 2 },
  BH: { code: 'BHD', symbol: 'BHD ', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', decimals: 2 },
};

const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1,
  PKR: 278.5,
  INR: 84.5,
  GBP: 0.79,
  EUR: 0.93,
  AED: 3.6725,
  SAR: 3.75,
  CAD: 1.39,
  AUD: 1.54,
  TRY: 34.4,
  MYR: 4.42,
  BDT: 119.5,
  QAR: 3.64,
  KWD: 0.307,
  OMR: 0.385,
  BHD: 0.376,
};

let cachedRates: Record<string, number> | null = null;
let cachedRatesFetchedAt = 0;
let cachedRatesIso = new Date().toISOString();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

async function getUsdExchangeRates(): Promise<{
  rates: Record<string, number>;
  source: 'live' | 'cached' | 'fallback';
  updatedAt: string;
}> {
  const now = Date.now();
  if (cachedRates && now - cachedRatesFetchedAt < CACHE_TTL_MS) {
    return { rates: cachedRates, source: 'cached', updatedAt: cachedRatesIso };
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(2500),
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = (await res.json()) as { result?: string; rates?: Record<string, number> };
      if (json?.rates && typeof json.rates.INR === 'number' && typeof json.rates.GBP === 'number') {
        cachedRates = { ...FALLBACK_USD_RATES, ...json.rates, USD: 1 };
        cachedRatesFetchedAt = now;
        cachedRatesIso = new Date(now).toISOString();
        return { rates: cachedRates, source: 'live', updatedAt: cachedRatesIso };
      }
    }
  } catch {
    // Silent network fallback to curated table or stale cache
  }

  if (cachedRates) {
    return { rates: cachedRates, source: 'cached', updatedAt: cachedRatesIso };
  }
  return { rates: FALLBACK_USD_RATES, source: 'fallback', updatedAt: cachedRatesIso };
}

export function extractVisitorCountryCode(req: Request): { countryCode: string; detected: boolean } {
  const queryOverride = typeof req.query?.country === 'string' ? req.query.country.trim().toUpperCase() : '';
  if (/^[A-Z]{2}$/.test(queryOverride) && queryOverride !== 'XX' && queryOverride !== 'T1') {
    return { countryCode: queryOverride === 'UK' ? 'GB' : queryOverride, detected: true };
  }

  const headerCandidates = [
    req.headers['cf-ipcountry'],
    req.headers['x-vercel-ip-country'],
    req.headers['x-country-code'],
    req.headers['fly-client-country'],
    req.headers['x-appengine-country'],
    req.headers['cloudfront-viewer-country'],
  ];

  for (const h of headerCandidates) {
    const raw = Array.isArray(h) ? h[0] : h;
    const code = String(raw || '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(code) && code !== 'XX' && code !== 'T1' && code !== 'ZZ') {
      return { countryCode: code === 'UK' ? 'GB' : code, detected: true };
    }
  }

  return { countryCode: '', detected: false };
}

export function resolveCountryCurrencyMeta(countryCode: string): CurrencyMeta {
  if (!countryCode) return { code: 'USD', symbol: '$', decimals: 2 };
  if (COUNTRY_CURRENCY_MAP[countryCode]) return COUNTRY_CURRENCY_MAP[countryCode];
  if (EURO_COUNTRIES.has(countryCode)) return COUNTRY_CURRENCY_MAP.EUR;
  return { code: 'USD', symbol: '$', decimals: 2 };
}

function formatCurrencyValue(amount: number, meta: CurrencyMeta): string {
  const rounded =
    meta.decimals === 0 ? Math.round(amount) : Math.round(amount * 100) / 100;
  const formattedNum =
    meta.decimals === 0
      ? rounded.toLocaleString('en-US')
      : rounded.toLocaleString('en-US', {
          minimumFractionDigits: meta.decimals,
          maximumFractionDigits: meta.decimals,
        });
  return `${meta.symbol}${formattedNum}`;
}

export async function resolveGeoPricing(
  req: Request,
  usdPrices: Record<MembershipPlanId, number> = DEFAULT_USD_PRICES
): Promise<GeoPricingInfo> {
  const { countryCode, detected } = extractVisitorCountryCode(req);
  const defaultRegion: PaymentRegion =
    !detected || countryCode === 'PK' ? 'pakistan' : 'international';

  const currencyMeta = resolveCountryCurrencyMeta(countryCode || 'US');
  const { rates, source, updatedAt } = await getUsdExchangeRates();
  const rate = rates[currencyMeta.code] || 1;

  const planIds: MembershipPlanId[] = ['starter', 'standard', 'plus', 'vip'];
  const indicativePlans = {} as Record<MembershipPlanId, IndicativePlanPrice>;

  for (const id of planIds) {
    const usd = Number(usdPrices[id] ?? DEFAULT_USD_PRICES[id]);
    const approxLocal =
      currencyMeta.code === 'USD'
        ? usd
        : currencyMeta.decimals === 0
          ? Math.round(usd * rate)
          : Math.round(usd * rate * 100) / 100;
    indicativePlans[id] = {
      usd,
      formattedUsd: `$${usd.toFixed(2)} USD`,
      approxLocal,
      formattedApproxLocal: `~${formatCurrencyValue(approxLocal, currencyMeta)}`,
      currencyCode: currencyMeta.code,
    };
  }

  return {
    countryCode: countryCode || (defaultRegion === 'pakistan' ? 'PK' : 'GLOBAL'),
    countryName: countryCode ? COUNTRY_NAMES[countryCode] || countryCode : 'Global / Auto',
    detected,
    defaultRegion,
    localCurrencyCode: currencyMeta.code,
    localCurrencySymbol: currencyMeta.symbol,
    rateFromUsd: rate,
    rateSource: source,
    ratesUpdatedAt: updatedAt,
    indicativePlans,
  };
}

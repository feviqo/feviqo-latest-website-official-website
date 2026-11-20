import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { MEMBERSHIP_PLANS, MEMBERSHIP_DRAMAS } from '../src/data/membershipCatalog';

export type AssistantIntent =
  | 'feviqo_premium'
  | 'feviqo_creative'
  | 'general'
  | 'escalate_human';

export interface ScopedCustomerContext {
  // ONLY the single verified/matched customer's own non-sensitive status — NEVER another customer's data.
  memberName?: string;
  hasActiveMembership?: boolean;
  activePlanName?: string;
  activeExpiresAt?: string;
  activeDramas?: string[];
  hasPendingOrder?: boolean;
  pendingOrderPlan?: string;
  pendingOrderStatus?: string;
}

export interface AssistantTurnInput {
  userMessage: string;
  contactName?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; text: string }>;
  scopedCustomer?: ScopedCustomerContext | null;
  bookingUrl?: string;
  escalationKeywords?: string[];
}

export interface ExtractedLeadFields {
  companyOrAgency?: string;
  editingService?: string;
  numberOfVideos?: string;
  videoDuration?: string;
  referenceLinks?: string;
  projectDeadline?: string;
  budgetRange?: string;
  additionalInstructions?: string;
}

export interface AssistantReplyResult {
  ok: boolean;
  error?: string;
  replyText: string;
  intent: AssistantIntent;
  detectedLanguage: 'en' | 'ur' | 'mixed';
  escalateToHuman: boolean;
  escalationReason?: string;
  isHighIntentLead: boolean;
  extractedLead?: ExtractedLeadFields;
}

let cachedClient: GoogleGenAI | null = null;
let cachedKey = '';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;
  if (cachedClient && cachedKey === apiKey) return cachedClient;
  cachedKey = apiKey;
  cachedClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return cachedClient;
}

export function isAiAssistantConfigured(): boolean {
  return Boolean((process.env.GEMINI_API_KEY || '').trim());
}

function buildPublicFeviqoKnowledge(bookingUrl: string): string {
  const plansSummary = MEMBERSHIP_PLANS.map(
    (p) =>
      `- ${p.name} (${p.id.toUpperCase()}): PKR ${p.pricePkr} / ${p.durationDays} days — ${
        p.isVip ? 'All VIP-eligible dramas' : `${p.dramaLimit} drama(s)`
      }`
  ).join('\n');

  const dramasSummary = MEMBERSHIP_DRAMAS.map((d) => {
    const latestEp = d.episodes[0];
    return `- ${d.title}: ${d.episodes.length} listed episodes (latest: Episode ${latestEp?.number ?? 'N/A'} — ${latestEp?.title ?? ''})`;
  }).join('\n');

  return `
=== VERIFIED FEVIQO BUSINESS FACTS (SOURCE OF TRUTH) ===
FEVIQO operates TWO distinct services:

1) FEVIQO PREMIUM (Urdu-Dubbed Turkish Dramas & Membership)
Website: https://feviqo.com/membership
Account Login / Payment Upload: https://feviqo.com/account
Official Membership Plans (PKR):
${plansSummary}
Payment Method: Manual Bank QR transfer (Pakistan PKR) or International Binance QR (USD). Users select a package on https://feviqo.com/membership, transfer payment, and upload their payment screenshot. Membership activates ONLY after manual admin verification — NEVER promise instant/automatic activation before verification.
Available Dramas:
${dramasSummary}

2) FEVIQO CREATIVE (Video Editing & Agency Services)
Services offered:
- Short-form video editing (Reels, TikToks, YouTube Shorts)
- Performance ad creatives
- Video editing for agencies & white-label editing services (we edit behind the scenes under your agency's brand with strict confidentiality)
- Monthly editing arrangements
Workflow: Client submits requirements & reference links -> creative brief & scope review -> human team confirms custom quote or monthly arrangement -> dedicated editor assignment & revisions.
Booking / Enquiry Link: ${bookingUrl}

=== STRICT SAFETY & HONESTY RULES (NON-NEGOTIABLE) ===
1. NEVER invent pricing for custom video editing, NEVER invent testimonials, client names, delivery guarantees, ROI numbers, or business results.
2. NEVER finalize custom quotes, discounts, or negotiate contracts without human approval. Tell the user a human FEVIQO producer will confirm exact scope/pricing.
3. NEVER claim a payment is verified or activate a membership.
4. NEVER expose or guess another customer's account, email, phone, payment, or membership data. Only reference the scoped customer context explicitly given for THIS sender.
5. Support BOTH English and Urdu (including Roman Urdu) naturally, matching the language the user writes in.
6. Keep WhatsApp replies concise, warm, clear, and well-structured (2 to 5 short paragraphs max).
7. If the user explicitly asks for a human/manager/call, reports a billing dispute/refund/account block, or is a serious agency/high-volume video editing prospect requesting a custom quote or contract, set escalateToHuman = true with a clear reason.
8. For FEVIQO Creative prospects, politely qualify by asking relevant missing details (service type, number of videos, video duration, reference links, deadline, budget range) and offer the booking link (${bookingUrl}).
`;
}

export async function generateFeviqoAiReply(
  input: AssistantTurnInput
): Promise<AssistantReplyResult> {
  const userMessage = String(input.userMessage || '').trim();
  const bookingUrl = input.bookingUrl || 'https://feviqo.com/booking';
  const escalationKeywords = input.escalationKeywords || [
    'human',
    'agent',
    'manager',
    'refund',
    'complaint',
    'lawyer',
    'call me',
    'نمائندہ',
    'انسان',
  ];

  const lowerMsg = userMessage.toLowerCase();
  const matchedKeyword = escalationKeywords.find(
    (kw) => kw.trim() && lowerMsg.includes(kw.trim().toLowerCase())
  );

  const ai = getGeminiClient();
  if (!ai) {
    return {
      ok: false,
      error:
        'GEMINI_API_KEY is not configured on the backend. Configure GEMINI_API_KEY to enable AI responses.',
      replyText: '',
      intent: matchedKeyword ? 'escalate_human' : 'general',
      detectedLanguage: /[\u0600-\u06FF]/.test(userMessage) ? 'ur' : 'en',
      escalateToHuman: Boolean(matchedKeyword),
      escalationReason: matchedKeyword
        ? `Triggered escalation keyword: "${matchedKeyword}"`
        : undefined,
      isHighIntentLead: false,
    };
  }

  const scopedBlock = input.scopedCustomer
    ? `\n=== SCOPED SENDER ACCOUNT CONTEXT (THIS SENDER ONLY) ===\n${JSON.stringify(
        input.scopedCustomer,
        null,
        2
      )}\n`
    : '\n=== SCOPED SENDER ACCOUNT CONTEXT ===\nNo verified FEVIQO Premium membership record matched this phone number.\n';

  const historyLines = (input.conversationHistory || [])
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'Customer' : 'FEVIQO'}: ${m.text}`)
    .join('\n');

  const prompt = `${historyLines ? `Recent conversation:\n${historyLines}\n\n` : ''}Latest message from ${
    input.contactName || 'Customer'
  }:\n${userMessage}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          `You are the official unified FEVIQO WhatsApp & Customer Support Assistant.\n` +
          `Automatically detect whether the sender is inquiring about FEVIQO Premium (Urdu dramas/membership/payments) or FEVIQO Creative (video editing/Reels/ads/white-label agency services).\n` +
          buildPublicFeviqoKnowledge(bookingUrl) +
          scopedBlock +
          (matchedKeyword
            ? `\nNOTE: The user's message matched human-escalation keyword "${matchedKeyword}". Acknowledge politely and inform them that a FEVIQO team member has been notified to take over.\n`
            : ''),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description:
                'Natural, friendly WhatsApp reply in the user language (English, Urdu, or Roman Urdu).',
            },
            intent: {
              type: Type.STRING,
              description:
                'One of: feviqo_premium, feviqo_creative, general, escalate_human',
            },
            detectedLanguage: {
              type: Type.STRING,
              description: 'One of: en, ur, mixed',
            },
            escalateToHuman: {
              type: Type.BOOLEAN,
              description:
                'True if human takeover is needed (billing dispute, custom quote negotiation, serious high-value lead, or explicit human request).',
            },
            escalationReason: {
              type: Type.STRING,
              description: 'Short reason if escalateToHuman is true, else empty string.',
            },
            isHighIntentLead: {
              type: Type.BOOLEAN,
              description:
                'True if sender looks like a serious FEVIQO Creative video editing client/agency.',
            },
            extractedLead: {
              type: Type.OBJECT,
              description: 'Any project details explicitly provided by the sender (leave blank if not mentioned).',
              properties: {
                companyOrAgency: { type: Type.STRING },
                editingService: { type: Type.STRING },
                numberOfVideos: { type: Type.STRING },
                videoDuration: { type: Type.STRING },
                referenceLinks: { type: Type.STRING },
                projectDeadline: { type: Type.STRING },
                budgetRange: { type: Type.STRING },
                additionalInstructions: { type: Type.STRING },
              },
            },
          },
          required: [
            'replyText',
            'intent',
            'detectedLanguage',
            'escalateToHuman',
            'isHighIntentLead',
          ],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return {
        ok: false,
        error: 'Gemini returned an empty response.',
        replyText: '',
        intent: 'general',
        detectedLanguage: 'en',
        escalateToHuman: Boolean(matchedKeyword),
        isHighIntentLead: false,
      };
    }

    const parsed = JSON.parse(rawText);
    const validIntents: AssistantIntent[] = [
      'feviqo_premium',
      'feviqo_creative',
      'general',
      'escalate_human',
    ];
    const intent: AssistantIntent = validIntents.includes(parsed.intent)
      ? parsed.intent
      : matchedKeyword
        ? 'escalate_human'
        : 'general';

    const detectedLanguage: 'en' | 'ur' | 'mixed' =
      parsed.detectedLanguage === 'ur' || parsed.detectedLanguage === 'mixed'
        ? parsed.detectedLanguage
        : 'en';

    const escalateToHuman = Boolean(parsed.escalateToHuman || matchedKeyword);
    const escalationReason =
      parsed.escalationReason ||
      (matchedKeyword ? `Matched escalation keyword: ${matchedKeyword}` : undefined);

    return {
      ok: true,
      replyText: String(parsed.replyText || '').trim(),
      intent,
      detectedLanguage,
      escalateToHuman,
      escalationReason,
      isHighIntentLead: Boolean(parsed.isHighIntentLead),
      extractedLead:
        parsed.extractedLead && typeof parsed.extractedLead === 'object'
          ? parsed.extractedLead
          : undefined,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Failed to generate AI support response.',
      replyText: '',
      intent: matchedKeyword ? 'escalate_human' : 'general',
      detectedLanguage: 'en',
      escalateToHuman: Boolean(matchedKeyword),
      escalationReason: matchedKeyword
        ? `Matched escalation keyword: ${matchedKeyword}`
        : undefined,
      isHighIntentLead: false,
    };
  }
}

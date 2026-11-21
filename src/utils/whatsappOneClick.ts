export type OneClickEventType =
  | 'customer_registration'
  | 'signup_followup_unpaid'
  | 'plan_selected'
  | 'unpaid_plan_reminder'
  | 'payment_submitted'
  | 'payment_approved'
  | 'membership_renewed'
  | 'payment_rejected'
  | 'expiry_reminder_7d'
  | 'expiry_reminder_3d'
  | 'expiry_reminder_1d'
  | 'membership_expired'
  | 'episode_published'
  | 'account_security_alert'
  | 'creative_enquiry';

export type OneClickNotificationCategory =
  | 'registration'
  | 'payment'
  | 'activation'
  | 'rejection'
  | 'expiry'
  | 'episodes'
  | 'security'
  | 'creative_enquiries';

export type OneClickNotificationStatus =
  | 'pending'
  | 'opened'
  | 'confirmed_sent'
  | 'failed'
  | 'cancelled';

export interface FormattedWhatsAppRecipient {
  valid: boolean;
  rawInput: string;
  waDigits: string; // e.g. 923227811264 (no '+') for https://wa.me/{waDigits}
  e164: string; // e.g. +923227811264
  reason?: string;
}

/**
 * Strict WhatsApp international phone formatter.
 * - Removes spaces, brackets, dashes, dots, and leading '+'
 * - Converts Pakistani local mobile numbers (03XXXXXXXXX -> 923XXXXXXXXX)
 * - NEVER guesses missing country codes; flags incomplete/ambiguous numbers for admin correction
 */
export function formatWhatsAppRecipient(rawPhone?: string | null): FormattedWhatsAppRecipient {
  const rawInput = String(rawPhone || '').trim();
  if (!rawInput) {
    return {
      valid: false,
      rawInput,
      waDigits: '',
      e164: '',
      reason: 'Customer phone number is missing.',
    };
  }

  // Reject characters that shouldn't exist in a phone number (e.g. letters)
  if (/[a-zA-Z]/.test(rawInput)) {
    return {
      valid: false,
      rawInput,
      waDigits: '',
      e164: '',
      reason: 'Phone number contains invalid characters.',
    };
  }

  const trimmed = rawInput.replace(/[\s().-]+/g, '');
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (!digitsOnly) {
    return {
      valid: false,
      rawInput,
      waDigits: '',
      e164: '',
      reason: 'Phone number contains no digits.',
    };
  }

  // Case 1: Explicit + international prefix
  if (hasPlus) {
    // Guard against +9203XXXXXXXXX typo or leading 0 right after +
    if (digitsOnly.startsWith('0')) {
      return {
        valid: false,
        rawInput,
        waDigits: '',
        e164: '',
        reason: 'International number cannot begin with 0 after +.',
      };
    }
    if (digitsOnly.startsWith('92')) {
      // Handle +9203XXXXXXXXX specifically as invalid/ambiguous
      if (digitsOnly.startsWith('920')) {
        return {
          valid: false,
          rawInput,
          waDigits: '',
          e164: '',
          reason: 'Remove the 0 after +92 (use +923XXXXXXXXX or 03XXXXXXXXX).',
        };
      }
      if (!/^923\d{9}$/.test(digitsOnly) && (digitsOnly.length < 11 || digitsOnly.length > 13)) {
        return {
          valid: false,
          rawInput,
          waDigits: '',
          e164: '',
          reason: 'Incomplete Pakistani international number (+923XXXXXXXXX).',
        };
      }
    }
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return {
        valid: false,
        rawInput,
        waDigits: '',
        e164: '',
        reason: 'International number must be between 8 and 15 digits.',
      };
    }
    return {
      valid: true,
      rawInput,
      waDigits: digitsOnly,
      e164: `+${digitsOnly}`,
    };
  }

  // Case 2: Explicit 00 international exit prefix (e.g. 00923227811264 or 00447911123456)
  if (digitsOnly.startsWith('00')) {
    const intl = digitsOnly.slice(2);
    if (!intl || intl.startsWith('0') || intl.length < 8 || intl.length > 15) {
      return {
        valid: false,
        rawInput,
        waDigits: '',
        e164: '',
        reason: 'Invalid 00-prefixed international phone number.',
      };
    }
    if (intl.startsWith('920')) {
      return {
        valid: false,
        rawInput,
        waDigits: '',
        e164: '',
        reason: 'Remove the 0 after 0092 (use 00923XXXXXXXXX).',
      };
    }
    return {
      valid: true,
      rawInput,
      waDigits: intl,
      e164: `+${intl}`,
    };
  }

  // Case 3: Pakistani local mobile number (03XXXXXXXXX -> 923XXXXXXXXX)
  if (/^03\d{9}$/.test(digitsOnly)) {
    const pkDigits = `92${digitsOnly.slice(1)}`;
    return {
      valid: true,
      rawInput,
      waDigits: pkDigits,
      e164: `+${pkDigits}`,
    };
  }

  // Case 4: Already formatted Pakistani international digits without '+' (923XXXXXXXXX)
  if (/^923\d{9}$/.test(digitsOnly)) {
    return {
      valid: true,
      rawInput,
      waDigits: digitsOnly,
      e164: `+${digitsOnly}`,
    };
  }

  // Case 5: Other local 0-prefixed numbers (e.g. 07911123456 UK, 0300 incomplete) -> DO NOT GUESS
  if (digitsOnly.startsWith('0')) {
    return {
      valid: false,
      rawInput,
      waDigits: '',
      e164: '',
      reason:
        digitsOnly.startsWith('03')
          ? 'Pakistani mobile number must be 11 digits (e.g. 03227811264).'
          : 'Local number is missing its international country code (add +, e.g. +44...).',
    };
  }

  // Case 6: Bare digits without +, 00, 03, or unambiguous 923 prefix -> DO NOT GUESS COUNTRY CODE
  return {
    valid: false,
    rawInput,
    waDigits: '',
    e164: '',
    reason: 'Missing country code. Include +country code (e.g. +1..., +44..., +92...) or Pakistani 03XXXXXXXXX.',
  };
}

export function buildWhatsAppWaMeUrl(rawPhone: string, message: string): {
  ok: true;
  url: string;
  waDigits: string;
  e164: string;
} | {
  ok: false;
  error: string;
} {
  const formatted = formatWhatsAppRecipient(rawPhone);
  if (!formatted.valid) {
    return { ok: false, error: formatted.reason || 'Invalid WhatsApp phone number.' };
  }
  const cleanMessage = String(message || '').trim();
  if (!cleanMessage) {
    return { ok: false, error: 'Message text cannot be empty.' };
  }
  return {
    ok: true,
    url: `https://wa.me/${formatted.waDigits}?text=${encodeURIComponent(cleanMessage)}`,
    waDigits: formatted.waDigits,
    e164: formatted.e164,
  };
}

export function getNotificationCategoryForEvent(
  eventType: OneClickEventType
): OneClickNotificationCategory {
  switch (eventType) {
    case 'customer_registration':
    case 'signup_followup_unpaid':
      return 'registration';
    case 'plan_selected':
    case 'unpaid_plan_reminder':
    case 'payment_submitted':
      return 'payment';
    case 'payment_approved':
    case 'membership_renewed':
      return 'activation';
    case 'payment_rejected':
      return 'rejection';
    case 'expiry_reminder_7d':
    case 'expiry_reminder_3d':
    case 'expiry_reminder_1d':
    case 'membership_expired':
      return 'expiry';
    case 'episode_published':
      return 'episodes';
    case 'account_security_alert':
      return 'security';
    case 'creative_enquiry':
      return 'creative_enquiries';
  }
}

export function formatReadableDateUtc(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export interface GenerateOneClickMessageInput {
  eventType: OneClickEventType;
  customerName?: string;
  planName?: string;
  amountDisplay?: string;
  startDate?: string;
  expiryDate?: string;
  rejectionReason?: string;
  seriesName?: string;
  episodeNumber?: string | number;
  episodeLink?: string;
  accessType?: 'free' | 'premium';
  securityEventSummary?: string;
  serviceName?: string;
}

export function generateOneClickWhatsAppMessage(
  input: GenerateOneClickMessageInput
): { ok: true; message: string } | { ok: false; error: string } {
  const customerName = String(input.customerName || 'Valued Member').trim() || 'Valued Member';
  const planName = String(input.planName || 'FEVIQO Membership').trim();
  const amountDisplay = String(input.amountDisplay || '').trim();

  switch (input.eventType) {
    case 'customer_registration': {
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `Welcome to FEVIQO!`,
          ``,
          `Your account is ready. Select your preferred drama membership plan and complete your setup anytime here:`,
          `https://feviqo.com/membership`,
          ``,
          `Reply to this message if you need help choosing a plan.`,
        ].join('\n'),
      };
    }

    case 'plan_selected': {
      const priceText = amountDisplay ? ` (${amountDisplay})` : '';
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `You selected the ${planName}${priceText} plan on FEVIQO.`,
          ``,
          `To activate your membership, please complete your transfer via Bank QR (PKR) or Binance QR (USD) on our checkout page and upload your payment screenshot:`,
          `https://feviqo.com/membership`,
          ``,
          `Your membership remains pending until your payment proof is submitted and verified.`,
        ].join('\n'),
      };
    }

    case 'payment_submitted': {
      const amountLine = amountDisplay ? ` (${amountDisplay})` : '';
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `We have received your payment submission for ${planName}${amountLine}.`,
          ``,
          `Your payment is currently under verification. You will receive access shortly once confirmed.`,
        ].join('\n'),
      };
    }

    case 'payment_approved': {
      const startDate = formatReadableDateUtc(input.startDate || new Date().toISOString());
      const expiryDate = formatReadableDateUtc(input.expiryDate || '');
      const lines = [
        `Assalam o Alaikum ${customerName},`,
        `Your FEVIQO membership is now active.`,
        ``,
        `Plan: ${planName}`,
      ];
      if (amountDisplay) lines.push(`Amount: ${amountDisplay}`);
      lines.push(
        `Start Date: ${startDate}`,
        `Expiry Date: ${expiryDate}`,
        `Status: Active`,
        ``,
        `Access your dramas here:`,
        `https://feviqo.com/membership`
      );
      return { ok: true, message: lines.join('\n') };
    }

    case 'payment_rejected': {
      const actualReason = String(input.rejectionReason || '').trim();
      if (!actualReason) {
        return {
          ok: false,
          error: 'An actual rejection reason is required before generating a rejection notice.',
        };
      }
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `Your payment verification could not be completed.`,
          ``,
          `Reason: ${actualReason}`,
          ``,
          `Please reply here or upload a valid payment screenshot at https://feviqo.com/account.`,
          `Support: +923227811264`,
        ].join('\n'),
      };
    }

    case 'expiry_reminder_7d':
    case 'expiry_reminder_3d':
    case 'expiry_reminder_1d': {
      const daysLabel =
        input.eventType === 'expiry_reminder_7d'
          ? '7 days'
          : input.eventType === 'expiry_reminder_3d'
          ? '3 days'
          : '1 day';
      const expiryDate = formatReadableDateUtc(input.expiryDate || '');
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `Reminder: Your FEVIQO ${planName} membership expires in ${daysLabel} (on ${expiryDate}).`,
          ``,
          `Renew early from your existing account to keep uninterrupted access:`,
          `https://feviqo.com/membership`,
        ].join('\n'),
      };
    }

    case 'membership_expired': {
      const expiryDate = formatReadableDateUtc(input.expiryDate || '');
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `Your FEVIQO ${planName} membership expired on ${expiryDate}.`,
          ``,
          `Renew anytime from your existing account to restore access immediately:`,
          `https://feviqo.com/membership`,
        ].join('\n'),
      };
    }

    case 'signup_followup_unpaid': {
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `Your FEVIQO account is ready, and you haven't activated a drama membership plan yet.`,
          ``,
          `Explore our Urdu-dubbed drama packages anytime here:`,
          `https://feviqo.com/membership`,
          ``,
          `Reply here if you need help choosing the right plan.`,
        ].join('\n'),
      };
    }

    case 'unpaid_plan_reminder': {
      const priceText = amountDisplay ? ` (${amountDisplay})` : '';
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `Friendly reminder: your selected ${planName}${priceText} membership order on FEVIQO is still awaiting payment proof.`,
          ``,
          `Upload your Bank QR or Binance QR screenshot on your account page to submit for verification:`,
          `https://feviqo.com/account`,
        ].join('\n'),
      };
    }

    case 'membership_renewed': {
      const startDate = formatReadableDateUtc(input.startDate || new Date().toISOString());
      const expiryDate = formatReadableDateUtc(input.expiryDate || '');
      const lines = [
        `Assalam o Alaikum ${customerName},`,
        `Your FEVIQO membership has been renewed.`,
        ``,
        `Plan: ${planName}`,
      ];
      if (amountDisplay) lines.push(`Amount: ${amountDisplay}`);
      lines.push(
        `Activation Date: ${startDate}`,
        `New Expiry Date: ${expiryDate}`,
        `Status: Active`,
        ``,
        `Watch your Urdu-dubbed dramas here:`,
        `https://feviqo.com/account`
      );
      return { ok: true, message: lines.join('\n') };
    }

    case 'episode_published': {
      const seriesName = String(input.seriesName || '').trim();
      const epNum = String(input.episodeNumber ?? '').trim();
      const epLink = String(input.episodeLink || '').trim() || 'https://feviqo.com/dramas';
      const accessLabel = input.accessType === 'free' ? 'Free' : 'Premium';
      if (!seriesName || !epNum) {
        return { ok: false, error: 'Series name and episode number are required.' };
      }
      return {
        ok: true,
        message: [
          `New Urdu-Dubbed Episode Available on FEVIQO! 🎬`,
          ``,
          `Drama: ${seriesName}`,
          `Episode: ${epNum}`,
          `Access: ${accessLabel}`,
          ``,
          `Watch now:`,
          epLink,
          ``,
          `Visit FEVIQO Premium for more Urdu-dubbed entertainment.`,
        ].join('\n'),
      };
    }

    case 'account_security_alert': {
      const summary =
        String(input.securityEventSummary || '').trim() ||
        'A security or password update was detected on your FEVIQO account.';
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `FEVIQO Account Security Notice:`,
          ``,
          summary,
          ``,
          `If this was you, no action is needed. If you did not authorize this change, please secure your account immediately at https://feviqo.com/account.`,
        ].join('\n'),
      };
    }

    case 'creative_enquiry': {
      const serviceName = String(input.serviceName || 'video editing services').trim();
      return {
        ok: true,
        message: [
          `Assalam o Alaikum ${customerName},`,
          `Thank you for contacting FEVIQO Creative regarding ${serviceName}.`,
          ``,
          `Our production team has received your enquiry and will review your project details before sharing next steps. You can also manage or book your strategy call here:`,
          `https://feviqo.com/booking`,
        ].join('\n'),
      };
    }
  }
}

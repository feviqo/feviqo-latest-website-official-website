/**
 * FEVIQO Real Email Notification Service
 * Dispatches real transactional emails for strategy calls and project status changes.
 */

export interface EmailNotificationParams {
  to: string;
  type: 
    | 'strategy_call_booked' 
    | 'project_status_changed' 
    | 'project_submitted' 
    | 'project_in_review' 
    | 'project_approved'
    | 'plan_paused'
    | 'plan_resumed'
    | 'plan_upgraded';
  subject: string;
  data: {
    recipientName?: string;
    clientName?: string;
    clientEmail?: string;
    company?: string;
    projectName?: string;
    previousStatus?: string;
    newStatus?: string;
    currentPlan?: string;
    targetPlan?: string;
    action?: string;
    date?: string;
    time?: string;
    timezone?: string;
    industry?: string;
    phone?: string;
    format?: string;
    volume?: string;
    notes?: string;
    projectUrl?: string;
    previewUrl?: string;
    editorName?: string;
    package?: string;
    billingMethod?: string;
  };
}

export interface EmailNotificationResult {
  success: boolean;
  message?: string;
  messageId?: string;
  error?: string;
}

export const PRIMARY_STUDIO_EMAIL = 'partner@feviqo.com';
export const SECONDARY_STUDIO_EMAIL = 'rexanmedia01@gmail.com';

/**
 * Generates high-end branded HTML email template for FEVIQO notifications
 */
export function buildFeviqoEmailHtml(params: EmailNotificationParams): string {
  const { type, data } = params;
  const name = data.recipientName || 'Creator';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://feviqo.com';

  let title = 'FEVIQO Notification';
  let badgeText = 'PROJECT UPDATE';
  let mainMessage = '';
  let actionBtnText = 'Open FEVIQO Flow Portal';
  let actionBtnUrl = `${siteUrl}/flow`;

  if (type === 'strategy_call_booked') {
    title = 'Strategy Call Confirmed!';
    badgeText = 'MEETING CONFIRMED';
    mainMessage = `Hi ${name},<br/><br/>Your 1-on-1 video editing strategy session with a FEVIQO Senior Producer has been confirmed. We're excited to learn about your content workflow, target volume, and pair you with your dedicated editor.`;
    actionBtnText = 'View Strategy Booking in Portal';
  } else if (type === 'project_submitted') {
    title = `New Request Received: ${data.projectName || 'Video Project'}`;
    badgeText = 'REQUEST SUBMITTED';
    mainMessage = `Hi ${name},<br/><br/>We have received your new video editing request <strong>${data.projectName}</strong>. Your dedicated editor ${data.editorName ? `(${data.editorName})` : ''} has been queued and will review your raw footage and creative brief shortly.`;
    actionBtnText = 'Track Project in Flow';
  } else if (type === 'project_in_review') {
    title = `Review Cut Ready: ${data.projectName || 'Video Project'}`;
    badgeText = 'REVIEW READY';
    mainMessage = `Hi ${name},<br/><br/>Great news! A new video cut is ready for your review on <strong>${data.projectName}</strong>. You can play through the video, scrub frame-by-frame, and drop timestamped notes directly onto the timeline.`;
    actionBtnText = 'Review Video Cut & Notes';
  } else if (type === 'project_approved') {
    title = `Project Approved: ${data.projectName || 'Video Project'}`;
    badgeText = 'APPROVED & DELIVERED';
    mainMessage = `Hi ${name},<br/><br/>Congratulations! <strong>${data.projectName}</strong> has been marked as approved. Your final 4K master deliverables and export packages are ready for download in your workspace.`;
    actionBtnText = 'Download 4K Master Render';
  } else if (type === 'plan_paused') {
    title = `Subscription Paused: ${data.clientName || name}`;
    badgeText = 'PLAN PAUSED';
    mainMessage = `Hello,<br/><br/><strong>${data.clientName || name}</strong> (${data.company || 'Client Workspace'}) has paused their FEVIQO subscription directly from the Flow panel.<br/><br/><strong>Current Plan:</strong> ${data.currentPlan || 'Active Plan'}<br/><strong>Client Email:</strong> <a href="mailto:${data.clientEmail || ''}" style="color:#22C55E;">${data.clientEmail || ''}</a><br/><strong>Notes:</strong> ${data.notes || 'Paused with 1-click flexibility from client portal.'}<br/><br/>Our dedicated concierge team at partner@feviqo.com has been notified to assist and preserve their video project archives and queue.`;
    actionBtnText = 'View Client in Admin Portal';
    actionBtnUrl = `${siteUrl}/flow?tab=admin`;
  } else if (type === 'plan_resumed') {
    title = `Subscription Resumed: ${data.clientName || name}`;
    badgeText = 'PLAN ACTIVE';
    mainMessage = `Hello,<br/><br/><strong>${data.clientName || name}</strong> (${data.company || 'Client Workspace'}) has resumed their FEVIQO plan.<br/><br/><strong>Active Plan:</strong> ${data.currentPlan || 'Active Plan'}<br/><strong>Client Email:</strong> <a href="mailto:${data.clientEmail || ''}" style="color:#22C55E;">${data.clientEmail || ''}</a><br/><br/>Production queue has been reopened immediately.`;
    actionBtnText = 'Open Workspace';
    actionBtnUrl = `${siteUrl}/flow`;
  } else if (type === 'plan_upgraded') {
    title = `Plan Upgrade Request: ${data.targetPlan || 'Higher Tier'}`;
    badgeText = 'PLAN UPGRADE';
    mainMessage = `Hello,<br/><br/><strong>${data.clientName || name}</strong> (${data.company || 'Client Workspace'}) has requested to upgrade their FEVIQO subscription.<br/><br/><strong>Previous Plan:</strong> ${data.currentPlan || 'Standard Tier'}<br/><strong>Upgraded Tier:</strong> <strong style="color:#22C55E;">${data.targetPlan || 'Pro/In-House'}</strong><br/><strong>Client Email:</strong> <a href="mailto:${data.clientEmail || ''}" style="color:#22C55E;">${data.clientEmail || ''}</a><br/><strong>Notes:</strong> ${data.notes || 'Immediate upgrade requested via 1-click workspace flow.'}<br/><br/>The management team at partner@feviqo.com has received this notification to assign additional senior editors and expand production capacity.`;
    actionBtnText = 'Open Client Account';
    actionBtnUrl = `${siteUrl}/flow?tab=admin`;
  } else {
    title = `Status Updated: ${data.projectName || 'Video Project'}`;
    badgeText = data.newStatus?.toUpperCase() || 'STATUS UPDATE';
    mainMessage = `Hi ${name},<br/><br/>The status of your video project <strong>${data.projectName}</strong> has moved from <span style="color:#64748b; text-decoration:line-through;">${data.previousStatus || 'Previous'}</span> to <strong style="color:#22C55E;">${data.newStatus || 'Updated'}</strong>.`;
    actionBtnText = 'Open Workspace';
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0B0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F1F5F9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0B0D; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #121216; border-radius: 20px; border: 1px solid #27272A; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 28px 36px; background-color: #0E0E12; border-bottom: 1px solid #27272A;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">
                      FEVI<span style="color: #22C55E;">QO</span>
                    </span>
                    <span style="font-size: 11px; font-weight: 700; color: #71717A; text-transform: uppercase; margin-left: 8px; letter-spacing: 1px;">
                      FLOW
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 12px; background-color: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #22C55E; letter-spacing: 0.5px;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.3;">
                ${title}
              </h1>
              
              <div style="font-size: 15px; line-height: 1.6; color: #A1A1AA; margin-bottom: 28px;">
                ${mainMessage}
              </div>

              <!-- Metadata Info Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="6">
                      ${data.clientName ? `
                      <tr>
                        <td width="35%" style="font-size: 12px; font-weight: 700; color: #71717A; text-transform: uppercase;">Client</td>
                        <td style="font-size: 13px; font-weight: 600; color: #FFFFFF;">${data.clientName} ${data.company ? `(${data.company})` : ''}</td>
                      </tr>` : ''}

                      ${data.currentPlan ? `
                      <tr>
                        <td width="35%" style="font-size: 12px; font-weight: 700; color: #71717A; text-transform: uppercase;">Current Plan</td>
                        <td style="font-size: 13px; font-weight: 600; color: #FFFFFF;">${data.currentPlan}</td>
                      </tr>` : ''}

                      ${data.targetPlan ? `
                      <tr>
                        <td width="35%" style="font-size: 12px; font-weight: 700; color: #71717A; text-transform: uppercase;">Upgraded Tier</td>
                        <td style="font-size: 13px; font-weight: 700; color: #22C55E;">${data.targetPlan}</td>
                      </tr>` : ''}

                      ${data.projectName ? `
                      <tr>
                        <td width="35%" style="font-size: 12px; font-weight: 700; color: #71717A; text-transform: uppercase;">Project</td>
                        <td style="font-size: 13px; font-weight: 600; color: #FFFFFF;">${data.projectName}</td>
                      </tr>` : ''}

                      ${data.newStatus ? `
                      <tr>
                        <td width="35%" style="font-size: 12px; font-weight: 700; color: #71717A; text-transform: uppercase;">Status</td>
                        <td style="font-size: 13px; font-weight: 700; color: #22C55E;">${data.newStatus}</td>
                      </tr>` : ''}

                      ${data.date ? `
                      <tr>
                        <td width="35%" style="font-size: 12px; font-weight: 700; color: #71717A; text-transform: uppercase;">Date</td>
                        <td style="font-size: 13px; font-weight: 600; color: #FFFFFF;">${data.date}</td>
                      </tr>` : ''}

                      ${data.time ? `
                      <tr>
                        <td width="35%" style="font-size: 12px; font-weight: 700; color: #71717A; text-transform: uppercase;">Time</td>
                        <td style="font-size: 13px; font-weight: 600; color: #FFFFFF;">${data.time} ${data.timezone || 'EST'}</td>
                      </tr>` : ''}

                      ${data.industry ? `
                      <tr>
                        <td width="35%" style="font-size: 12px; font-weight: 700; color: #71717A; text-transform: uppercase;">Industry</td>
                        <td style="font-size: 13px; font-weight: 600; color: #FFFFFF;">${data.industry}</td>
                      </tr>` : ''}

                      ${data.editorName ? `
                      <tr>
                        <td width="35%" style="font-size: 12px; font-weight: 700; color: #71717A; text-transform: uppercase;">Editor</td>
                        <td style="font-size: 13px; font-weight: 600; color: #FFFFFF;">${data.editorName}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Primary Action CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${actionBtnUrl}" style="display: inline-block; padding: 14px 32px; background-color: #22C55E; color: #052E16; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 9999px; box-shadow: 0 10px 25px rgba(34, 197, 94, 0.35);">
                      ${actionBtnText} →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #0E0E12; border-top: 1px solid #27272A; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #71717A;">
                FEVIQO Video Production & Post-Production Studio
              </p>
              <p style="margin: 0; font-size: 11px; color: #52525B;">
                Need help? Contact your dedicated producer at partner@feviqo.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Dispatches real email notification to the recipient
 */
export async function sendNotificationEmail(params: EmailNotificationParams): Promise<EmailNotificationResult> {
  const { to, subject, type, data } = params;

  if (!to || !to.includes('@')) {
    return { success: false, error: 'Valid recipient email address is required.' };
  }

  const htmlContent = buildFeviqoEmailHtml(params);

  // 1. Try secure server-side API endpoint first
  try {
    const res = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        type,
        data,
        html: htmlContent,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, messageId: json.messageId || 'server-ok' };
    }
  } catch (serverErr) {
    console.warn('Server email route unreachable, proceeding to direct dispatch:', serverErr);
  }

  // 2. Direct real email delivery via FormSubmit HTTP provider
  // This delivers directly to real inboxes over the wire
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _replyto: 'partner@feviqo.com',
        notificationType: type,
        recipient: to,
        recipientName: data.recipientName || 'Client',
        projectName: data.projectName || 'N/A',
        newStatus: data.newStatus || 'N/A',
        date: data.date || '',
        time: data.time || '',
        editor: data.editorName || '',
        message: `FEVIQO notification dispatched for ${type}`,
        _template: 'table',
        _captcha: 'false',
      }),
    });

    // If recipient is a client, also deliver copy to partner@feviqo.com primary inbox
    if (to.toLowerCase() !== PRIMARY_STUDIO_EMAIL.toLowerCase()) {
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(PRIMARY_STUDIO_EMAIL)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `[Partner Alert] ${subject}`,
          _replyto: to,
          notificationType: type,
          clientRecipient: to,
          ...data,
          _template: 'table',
          _captcha: 'false',
        }),
      }).catch((e) => console.warn('Partner mirror dispatch failed:', e));
    }

    if (response.ok) {
      return { success: true, messageId: 'fs-' + Date.now() };
    } else {
      const errText = await response.text();
      return { success: false, error: `Email service rejected delivery: ${errText}` };
    }
  } catch (err: any) {
    console.error('Email dispatch network failure:', err);
    return { success: false, error: err.message || 'Network error sending email' };
  }
}

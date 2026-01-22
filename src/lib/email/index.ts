/**
 * Email Service
 * 
 * This service handles sending emails using Resend with dashboard-managed templates.
 * 
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Create your email templates in the Resend dashboard
 * 3. Add environment variables:
 *    - RESEND_API_KEY
 *    - RESEND_DOMAIN (your verified domain)
 *    - RESEND_TEMPLATE_REGISTRATION_SUCCESS (template ID)
 */

import { 
  type RegistrationEmailData,
  EMAIL_TEMPLATES,
  BRAND_CONFIG 
} from './templates';

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SendEmailWithTemplateOptions {
  to: string | string[];
  templateId: string;
  data: Record<string, string>;
  subject?: string;
}

/**
 * Send an email using a Resend template
 */
export async function sendEmailWithTemplate(
  options: SendEmailWithTemplateOptions
): Promise<EmailResponse> {
  const { to, templateId, data, subject } = options;

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  if (!templateId) {
    console.warn('Template ID not configured. Email not sent.');
    return { success: false, error: 'Template ID not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${BRAND_CONFIG.name} <noreply@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        reply_to: BRAND_CONFIG.supportEmail,
        // Resend template with dynamic data
        template_id: templateId,
        template_data: data,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to send email:', result);
      return { success: false, error: result.message || 'Failed to send email' };
    }

    console.log('Email sent successfully:', result.id);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send registration success email to team captain
 * 
 * Make sure your Resend template uses these variables:
 * {{team_name}}, {{captain_name}}, {{event_name}}, {{event_url}},
 * {{college_name}}, {{team_members}}, {{amount_paid}}, {{payment_id}}, {{registration_date}}
 */
export async function sendRegistrationSuccessEmail(
  data: RegistrationEmailData
): Promise<EmailResponse> {
  return sendEmailWithTemplate({
    to: data.captain_email,
    templateId: EMAIL_TEMPLATES.REGISTRATION_SUCCESS,
    subject: `🎉 Registration Confirmed - ${data.event_name} | ${BRAND_CONFIG.name}`,
    data: {
      team_name: data.team_name,
      captain_name: data.captain_name,
      captain_email: data.captain_email,
      event_name: data.event_name,
      event_url: data.event_url,
      college_name: data.college_name,
      team_members: data.team_members,
      amount_paid: data.amount_paid,
      payment_id: data.payment_id,
      registration_date: data.registration_date,
    },
  });
}

/**
 * Check if email service is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.RESEND_API_KEY && 
    EMAIL_TEMPLATES.REGISTRATION_SUCCESS
  );
}

interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded content
  type?: string;
}

/**
 * Simple email sending function with HTML content and optional attachments
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<EmailResponse> {
  const { to, subject, html, attachments } = options;

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  const fromAddress = process.env.EMAIL_FROM_ADDRESS || `noreply@${process.env.RESEND_DOMAIN || 'resend.dev'}`;
  const fromName = process.env.EMAIL_FROM_NAME || BRAND_CONFIG.name;

  try {
    const emailPayload: Record<string, unknown> = {
      from: `${fromName} <${fromAddress}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      reply_to: BRAND_CONFIG.supportEmail,
      html,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type || 'image/png',
      }));
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to send email:', result);
      return { success: false, error: result.message || 'Failed to send email' };
    }

    console.log('Email sent successfully:', result.id);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate registration confirmation email HTML
 */
export function getRegistrationConfirmationEmail(data: {
  teamName: string;
  captainName: string;
  eventName: string;
  teamId: string;
  collegeName?: string;
  memberCount?: number;
  transactionId?: string;
}): string {
  const { teamName, captainName, eventName, teamId, collegeName, memberCount, transactionId } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Verified - Gantavya 2026</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #171717; border-radius: 16px; overflow: hidden; border: 1px solid #262626;">
              
              <!-- Header with Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); padding: 40px 32px; text-align: center; border-bottom: 1px solid #262626;">
                  <h1 style="margin: 0 0 8px 0; color: #E8E4DD; font-size: 42px; font-weight: 800; letter-spacing: -1px;">Gantavya</h1>
                  <p style="margin: 0; color: #737373; font-size: 14px; text-transform: uppercase; letter-spacing: 3px;">2026</p>
                </td>
              </tr>
              
              <!-- Success Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 24px 32px; text-align: center;">
                  <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>
                      <td style="padding-right: 12px;">
                        <span style="font-size: 32px;">✓</span>
                      </td>
                      <td>
                        <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">Payment Verified!</h2>
                        <p style="margin: 4px 0 0 0; color: #bbf7d0; font-size: 14px;">Your registration is now complete</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Greeting -->
              <tr>
                <td style="padding: 32px 32px 24px 32px;">
                  <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0;">
                    Hi <strong style="color: #ffffff;">${captainName}</strong>,
                  </p>
                  <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 16px 0 0 0;">
                    Great news! We've verified your payment and your team is officially registered for <strong style="color: #E8E4DD;">${eventName}</strong> at Gantavya 2026.
                  </p>
                </td>
              </tr>
              
              <!-- Team Details Card -->
              <tr>
                <td style="padding: 0 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1f1f1f; border-radius: 12px; border: 1px solid #333333; overflow: hidden;">
                    <tr>
                      <td style="background-color: #262626; padding: 16px 20px; border-bottom: 1px solid #333333;">
                        <h3 style="margin: 0; color: #E8E4DD; font-size: 16px; font-weight: 600;">Registration Details</h3>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #333333;">
                              <span style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Team ID</span><br/>
                              <span style="color: #ffffff; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace;">${teamId}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
                              <span style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Team Name</span><br/>
                              <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${teamName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
                              <span style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Event</span><br/>
                              <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${eventName}</span>
                            </td>
                          </tr>
                          ${collegeName ? `
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
                              <span style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">College</span><br/>
                              <span style="color: #ffffff; font-size: 16px;">${collegeName}</span>
                            </td>
                          </tr>
                          ` : ''}
                          ${memberCount ? `
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
                              <span style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Team Size</span><br/>
                              <span style="color: #ffffff; font-size: 16px;">${memberCount} member${memberCount > 1 ? 's' : ''}</span>
                            </td>
                          </tr>
                          ` : ''}
                          ${transactionId ? `
                          <tr>
                            <td style="padding: 12px 0;">
                              <span style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Transaction ID</span><br/>
                              <span style="color: #a3a3a3; font-size: 14px; font-family: 'Courier New', monospace;">${transactionId}</span>
                            </td>
                          </tr>
                          ` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Event Pass Notice -->
              <tr>
                <td style="padding: 24px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #172554 100%); border-radius: 12px; border: 1px solid #1e40af;">
                    <tr>
                      <td style="padding: 20px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-right: 16px; vertical-align: top;">
                              <span style="font-size: 28px;">🎟️</span>
                            </td>
                            <td>
                              <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">Your Event Pass is Attached</h4>
                              <p style="margin: 0; color: #93c5fd; font-size: 14px; line-height: 1.5;">
                                We've attached your personalized event pass to this email. Please save it and bring it (printed or digital) to the event for check-in.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- What's Next Section -->
              <tr>
                <td style="padding: 8px 32px 32px 32px;">
                  <h3 style="margin: 0 0 16px 0; color: #E8E4DD; font-size: 18px; font-weight: 600;">What's Next?</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #262626;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <span style="color: #22c55e; font-size: 16px;">✓</span>
                            </td>
                            <td>
                              <span style="color: #ffffff; font-size: 15px;">Save your event pass from the attachment</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #262626;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <span style="color: #22c55e; font-size: 16px;">✓</span>
                            </td>
                            <td>
                              <span style="color: #ffffff; font-size: 15px;">Review the event rules and guidelines</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #262626;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <span style="color: #22c55e; font-size: 16px;">✓</span>
                            </td>
                            <td>
                              <span style="color: #ffffff; font-size: 15px;">Prepare your team for the competition</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <span style="color: #22c55e; font-size: 16px;">✓</span>
                            </td>
                            <td>
                              <span style="color: #ffffff; font-size: 15px;">Arrive at the venue on February 16-17, 2026</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Support -->
              <tr>
                <td style="padding: 0 32px 32px 32px;">
                  <p style="color: #737373; font-size: 14px; line-height: 1.6; margin: 0;">
                    Questions? Reach out to us at 
                    <a href="mailto:${BRAND_CONFIG.supportEmail}" style="color: #60a5fa; text-decoration: none;">${BRAND_CONFIG.supportEmail}</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #0f0f0f; padding: 24px 32px; text-align: center; border-top: 1px solid #262626;">
                  <p style="color: #525252; font-size: 13px; margin: 0 0 8px 0;">
                    <strong style="color: #737373;">Gantavya 2026</strong> | Robotics Club SRMCEM
                  </p>
                  <p style="color: #404040; font-size: 12px; margin: 0;">
                    <a href="${BRAND_CONFIG.website}" style="color: #525252; text-decoration: none;">${BRAND_CONFIG.website}</a>
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

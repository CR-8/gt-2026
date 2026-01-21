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

/**
 * Email Service
 * 
 * This service handles sending emails using Resend.
 * Resend is recommended for Supabase projects and provides reliable email delivery.
 * 
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Get your API key from the dashboard
 * 3. Add RESEND_API_KEY to your .env file
 * 4. Verify your domain or use the sandbox for testing
 */

import { 
  getRegistrationSuccessEmail, 
  getRegistrationFailedEmail,
  type RegistrationEmailData,
  BRAND_CONFIG 
} from './templates';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend API
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
  const { to, subject, html, text, replyTo } = options;

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email not sent.');
    return { 
      success: false, 
      error: 'Email service not configured' 
    };
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
        html,
        text,
        reply_to: replyTo || BRAND_CONFIG.supportEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to send email:', data);
      return {
        success: false,
        error: data.message || 'Failed to send email',
      };
    }

    console.log('Email sent successfully:', data.id);
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send registration success email to team captain
 */
export async function sendRegistrationSuccessEmail(
  data: RegistrationEmailData
): Promise<EmailResponse> {
  const template = getRegistrationSuccessEmail(data);
  
  return sendEmail({
    to: data.captainEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send registration failed email to team captain
 */
export async function sendRegistrationFailedEmail(
  captainEmail: string,
  captainName: string,
  eventName: string,
  reason?: string
): Promise<EmailResponse> {
  const template = getRegistrationFailedEmail({
    captainName,
    eventName,
    reason,
  });
  
  return sendEmail({
    to: captainEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Email configuration check
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

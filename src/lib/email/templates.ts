/**
 * Email Configuration
 * 
 * This file contains configuration for Resend emails.
 * Templates are created and managed in the Resend dashboard (https://resend.com/templates)
 */

export interface RegistrationEmailData {
  team_name: string;
  captain_name: string;
  captain_email: string;
  event_name: string;
  event_url: string;
  college_name: string;
  team_members: string;
  amount_paid: string;
  payment_id: string;
  registration_date: string;
}

// Brand configuration
export const BRAND_CONFIG = {
  name: 'Gantavya 2026',
  website: 'https://gantavya.roboticsclubsrmcem.in',
  supportEmail: 'grobotsclub@gmail.com',
};

/**
 * Resend Template IDs
 * 
 * Create your templates in the Resend dashboard and add the IDs here.
 * Template variables should match the RegistrationEmailData interface.
 * 
 * Example template variables you can use:
 * - {{team_name}}
 * - {{captain_name}}
 * - {{event_name}}
 * - {{event_url}}
 * - {{college_name}}
 * - {{team_members}}
 * - {{amount_paid}}
 * - {{payment_id}}
 * - {{registration_date}}
 */
export const EMAIL_TEMPLATES = {
  REGISTRATION_SUCCESS: process.env.RESEND_TEMPLATE_REGISTRATION_SUCCESS || '',
  REGISTRATION_FAILED: process.env.RESEND_TEMPLATE_REGISTRATION_FAILED || '',
};

/**
 * Email Templates Configuration
 * 
 * This file contains all email templates used in the application.
 * Customize the templates here to change email content without modifying the email service.
 */

export interface RegistrationEmailData {
  teamName: string;
  captainName: string;
  captainEmail: string;
  eventName: string;
  eventSlug: string;
  collegeName: string;
  teamMembers: string[];
  amountPaid: number;
  paymentId?: string;
  registrationDate: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Brand configuration
export const BRAND_CONFIG = {
  name: 'Gantavya 2026',
  tagline: 'The Ultimate Tech Fest',
  website: 'https://gantavya.roboticsclubsrmcem.in',
  supportEmail: 'grobotsclub@gmail.com',
  instagram: 'https://www.instagram.com/gantavya.fest/',
  linkedin: 'https://www.linkedin.com/company/grobots-club/',
  primaryColor: '#FF4500',
  logoUrl: 'https://gantavya.roboticsclubsrmcem.in/logo.svg',
};

// Common email styles
const emailStyles = `
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0A0A; color: #FFFFFF; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .header { text-align: center; margin-bottom: 40px; }
  .logo { width: 80px; height: 80px; margin-bottom: 20px; }
  .title { font-size: 28px; font-weight: 700; color: #FFFFFF; margin: 0; }
  .subtitle { font-size: 14px; color: #B3B3B3; margin-top: 8px; }
  .card { background-color: #1A1A1A; border-radius: 16px; padding: 32px; margin: 24px 0; border: 1px solid #252525; }
  .success-badge { display: inline-block; background: linear-gradient(135deg, #00FF88, #00CC6A); color: #000000; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #252525; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #B3B3B3; font-size: 14px; }
  .detail-value { color: #FFFFFF; font-size: 14px; font-weight: 500; }
  .highlight { color: #FF4500; }
  .button { display: inline-block; background: linear-gradient(135deg, #FF4500, #FF6B35); color: #FFFFFF; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; }
  .footer { text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #252525; }
  .footer-text { color: #666666; font-size: 12px; line-height: 1.6; }
  .social-links { margin-top: 16px; }
  .social-link { color: #B3B3B3; text-decoration: none; margin: 0 12px; font-size: 12px; }
  .social-link:hover { color: #FF4500; }
`;

/**
 * Registration Success Email Template
 */
export function getRegistrationSuccessEmail(data: RegistrationEmailData): EmailTemplate {
  const {
    teamName,
    captainName,
    captainEmail,
    eventName,
    eventSlug,
    collegeName,
    teamMembers,
    amountPaid,
    paymentId,
    registrationDate,
  } = data;

  const eventUrl = `${BRAND_CONFIG.website}/events/${eventSlug}`;
  const formattedAmount = `₹${amountPaid.toLocaleString('en-IN')}`;
  const formattedDate = new Date(registrationDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `🎉 Registration Confirmed - ${eventName} | ${BRAND_CONFIG.name}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="${BRAND_CONFIG.logoUrl}" alt="${BRAND_CONFIG.name}" class="logo" />
      <h1 class="title">${BRAND_CONFIG.name}</h1>
      <p class="subtitle">${BRAND_CONFIG.tagline}</p>
    </div>

    <!-- Success Message -->
    <div style="text-align: center; margin-bottom: 32px;">
      <span class="success-badge">✓ Registration Successful</span>
      <h2 style="color: #FFFFFF; font-size: 24px; margin-top: 24px; margin-bottom: 8px;">
        Welcome aboard, ${captainName}!
      </h2>
      <p style="color: #B3B3B3; font-size: 16px; margin: 0;">
        Your team has been successfully registered for <span class="highlight">${eventName}</span>
      </p>
    </div>

    <!-- Registration Details Card -->
    <div class="card">
      <h3 style="color: #FFFFFF; font-size: 18px; margin: 0 0 24px 0; padding-bottom: 16px; border-bottom: 1px solid #252525;">
        Registration Details
      </h3>
      
      <div class="detail-row">
        <span class="detail-label">Team Name</span>
        <span class="detail-value">${teamName}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Event</span>
        <span class="detail-value highlight">${eventName}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Captain</span>
        <span class="detail-value">${captainName}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">${captainEmail}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">College</span>
        <span class="detail-value">${collegeName}</span>
      </div>
      
      ${teamMembers.length > 0 ? `
      <div class="detail-row">
        <span class="detail-label">Team Members</span>
        <span class="detail-value">${teamMembers.join(', ')}</span>
      </div>
      ` : ''}
      
      <div class="detail-row">
        <span class="detail-label">Amount Paid</span>
        <span class="detail-value" style="color: #00FF88;">${formattedAmount}</span>
      </div>
      
      ${paymentId ? `
      <div class="detail-row">
        <span class="detail-label">Payment ID</span>
        <span class="detail-value" style="font-family: monospace; font-size: 12px;">${paymentId}</span>
      </div>
      ` : ''}
      
      <div class="detail-row">
        <span class="detail-label">Registered On</span>
        <span class="detail-value">${formattedDate}</span>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center;">
      <a href="${eventUrl}" class="button">View Event Details</a>
    </div>

    <!-- Next Steps -->
    <div class="card" style="background-color: #252525;">
      <h3 style="color: #FFFFFF; font-size: 16px; margin: 0 0 16px 0;">
        📋 What's Next?
      </h3>
      <ul style="color: #B3B3B3; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
        <li>Keep this email safe - it's your registration confirmation</li>
        <li>Join our WhatsApp/Discord group for event updates</li>
        <li>Review the event rulebook and prepare your team</li>
        <li>Arrive at the venue on time with valid ID proof</li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        If you have any questions, reach out to us at<br/>
        <a href="mailto:${BRAND_CONFIG.supportEmail}" style="color: #FF4500; text-decoration: none;">${BRAND_CONFIG.supportEmail}</a>
      </p>
      <div class="social-links">
        <a href="${BRAND_CONFIG.instagram}" class="social-link">Instagram</a>
        <a href="${BRAND_CONFIG.linkedin}" class="social-link">LinkedIn</a>
        <a href="${BRAND_CONFIG.website}" class="social-link">Website</a>
      </div>
      <p class="footer-text" style="margin-top: 24px;">
        © 2026 SRMCEM Robotics Club. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${BRAND_CONFIG.name} - Registration Confirmed!

Welcome aboard, ${captainName}!

Your team has been successfully registered for ${eventName}.

REGISTRATION DETAILS
--------------------
Team Name: ${teamName}
Event: ${eventName}
Captain: ${captainName}
Email: ${captainEmail}
College: ${collegeName}
${teamMembers.length > 0 ? `Team Members: ${teamMembers.join(', ')}` : ''}
Amount Paid: ${formattedAmount}
${paymentId ? `Payment ID: ${paymentId}` : ''}
Registered On: ${formattedDate}

WHAT'S NEXT?
------------
- Keep this email safe - it's your registration confirmation
- Join our WhatsApp/Discord group for event updates
- Review the event rulebook and prepare your team
- Arrive at the venue on time with valid ID proof

View Event Details: ${eventUrl}

If you have any questions, reach out to us at ${BRAND_CONFIG.supportEmail}

© 2026 SRMCEM Robotics Club. All rights reserved.
  `;

  return { subject, html, text };
}

/**
 * Registration Failed Email Template (for future use)
 */
export function getRegistrationFailedEmail(data: {
  captainName: string;
  eventName: string;
  reason?: string;
}): EmailTemplate {
  const { captainName, eventName, reason } = data;
  
  const subject = `Payment Failed - ${eventName} | ${BRAND_CONFIG.name}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${BRAND_CONFIG.name}</h1>
    </div>
    <div class="card">
      <h2 style="color: #FF3366; margin: 0 0 16px 0;">Payment Failed</h2>
      <p style="color: #B3B3B3;">
        Hi ${captainName},<br/><br/>
        Unfortunately, your payment for <strong>${eventName}</strong> could not be processed.
        ${reason ? `<br/><br/>Reason: ${reason}` : ''}
      </p>
      <p style="color: #B3B3B3; margin-top: 24px;">
        Please try again or contact us at <a href="mailto:${BRAND_CONFIG.supportEmail}" style="color: #FF4500;">${BRAND_CONFIG.supportEmail}</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Payment Failed - ${eventName}

Hi ${captainName},

Unfortunately, your payment for ${eventName} could not be processed.
${reason ? `Reason: ${reason}` : ''}

Please try again or contact us at ${BRAND_CONFIG.supportEmail}
  `;

  return { subject, html, text };
}

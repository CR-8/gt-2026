import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { BRAND_CONFIG } from '@/lib/email/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teamIds, subject, message } = body

    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return NextResponse.json(
        { error: 'Team IDs are required' },
        { status: 400 }
      )
    }

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Fetch team details with captain emails
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id,
        team_name,
        captain_name,
        captain_email,
        events (
          name
        )
      `)
      .in('id', teamIds)

    if (teamsError || !teams) {
      return NextResponse.json(
        { error: 'Failed to fetch team details' },
        { status: 500 }
      )
    }

    // Send emails to each team captain
    const emailPromises = teams.map(async (team) => {
      if (!team.captain_email) return null

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${BRAND_CONFIG.name}</h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #ff6b35; margin-top: 0;">Hello ${team.captain_name}!</h2>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #495057;">Team: ${team.team_name}</p>
              <p style="margin: 5px 0 0 0; color: #6c757d;">Event: ${team?.events || 'N/A'}</p>
            </div>

            <div style="margin: 30px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

            <div style="text-align: center; color: #6c757d; font-size: 14px;">
              <p style="margin: 0;">This is an automated message from ${BRAND_CONFIG.name}</p>
              <p style="margin: 5px 0 0 0;">If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `

      return sendEmail({
        to: team.captain_email,
        subject: `${BRAND_CONFIG.name} - ${subject}`,
        html: htmlContent
      })
    })

    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter(result => result.status === 'fulfilled' && result.value?.success).length
    const failed = results.length - successful

    return NextResponse.json({
      success: true,
      message: `Emails sent: ${successful} successful, ${failed} failed`,
      details: {
        total: teamIds.length,
        successful,
        failed
      }
    })

  } catch (error) {
    console.error('Bulk email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
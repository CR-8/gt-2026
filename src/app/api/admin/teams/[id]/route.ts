import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail, getRegistrationConfirmationEmail } from '@/lib/email'
import { generateEventPassBase64 } from '@/lib/pass-generator'

// GET team details with members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    // Fetch team with event details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(`
        *,
        events (
          name,
          slug,
          start_time,
          venue
        )
      `)
      .eq('id', id)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Fetch team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id)
      .order('role', { ascending: false }) // Captain first

    if (membersError) {
      console.error('Error fetching members:', membersError)
    }

    return NextResponse.json({
      team,
      members: members || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update team
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()
    const body = await request.json()

    // Get the current team state before update
    const { data: currentTeam, error: fetchError } = await supabase
      .from('teams')
      .select(`
        *,
        events (
          name,
          slug,
          start_time,
          venue
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !currentTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const wasUnpaid = !currentTeam.has_paid
    const isBeingVerified = body.has_paid === true && (
      body.payment_status === 'completed' || 
      body.payment_status === 'captured' ||
      currentTeam.payment_status === 'pending_verification'
    )

    // Update the team
    const { data: team, error } = await supabase
      .from('teams')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating team:', error)
      return NextResponse.json(
        { error: 'Failed to update team', details: error.message },
        { status: 500 }
      )
    }

    // Send confirmation email if payment was just verified
    if (wasUnpaid && isBeingVerified && currentTeam) {
      try {
        const eventName = currentTeam.events?.title || currentTeam.events?.name || 'Gantavya Event'
        const teamId = currentTeam.team_code || currentTeam.id.slice(0, 8).toUpperCase()

        // Get member count
        const { count: memberCount } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', currentTeam.id)

        // Generate the event pass
        let passBase64: string | null = null
        try {
          passBase64 = await generateEventPassBase64({
            teamId: teamId,
            teamName: currentTeam.team_name,
            eventName: eventName,
            collegeName: currentTeam.college_name || 'N/A',
          })
        } catch (passError) {
          console.error('Error generating event pass:', passError)
          // Continue without the pass if generation fails
        }
        
        const emailHtml = getRegistrationConfirmationEmail({
          teamName: currentTeam.team_name,
          captainName: currentTeam.captain_name,
          eventName: eventName,
          teamId: teamId,
          collegeName: currentTeam.college_name,
          memberCount: memberCount || undefined,
          transactionId: currentTeam.transaction_id,
        })

        // Prepare attachments
        const attachments = passBase64 ? [
          {
            filename: `Gantavya-Pass-${teamId}.jpg`,
            content: passBase64,
            contentType: 'image/jpeg',
          }
        ] : undefined

        const emailResult = await sendEmail({
          to: currentTeam.captain_email,
          subject: `🎉 Payment Verified - ${eventName} | Gantavya 2026`,
          html: emailHtml,
          attachments,
        })

        if (!emailResult.success) {
          console.error(`Failed to send email to ${currentTeam.captain_email}:`, emailResult.error)
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Don't fail the request if email fails - team is already updated
      }
    }

    return NextResponse.json({ 
      team,
      emailSent: wasUnpaid && isBeingVerified
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail, getRegistrationConfirmationEmail } from '@/lib/email'
import { generateEventPassBase64 } from '@/lib/pass-generator'
import { generatePassesForTeam } from '@/lib/pass-generation'

// GET team details with members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔄 GET /api/admin/teams/[id] - Starting request')
  try {
    const { id } = await params
    console.log(`📝 Extracted team ID: ${id}`)
    const supabase = createServiceClient()
    console.log('🔗 Created Supabase service client')

    // Fetch team with event details
    console.log('🔍 Fetching team with event details...')
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
      console.log('❌ Team fetch error:', teamError)
      console.log('❌ Team data:', team)
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }
    console.log('✅ Team fetched successfully:', team)

    // Fetch team members
    console.log('👥 Fetching team members...')
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id)
      .order('role', { ascending: false }) // Captain first

    if (membersError) {
      console.log('⚠️ Members fetch error:', membersError)
      console.log('⚠️ Members data:', members)
    } else {
      console.log('✅ Members fetched successfully:', members)
    }

    console.log('🎉 GET request completed successfully')
    return NextResponse.json({
      team,
      members: members || []
    })
  } catch (error) {
    console.error('💥 GET request failed with error:', error)
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
  console.log('🔄 PATCH /api/admin/teams/[id] - Starting request')
  try {
    const { id } = await params
    console.log(`📝 Extracted team ID: ${id}`)
    const supabase = createServiceClient()
    console.log('🔗 Created Supabase service client')
    const body = await request.json()
    console.log('📦 Parsed request body:', body)

    // Normalize payment_status: 'captured' should be treated as 'completed'
    if (body.payment_status === 'captured') {
      body.payment_status = 'completed'
      console.log('🔄 Normalized payment_status from "captured" to "completed"')
    }

    // Get the current team state before update
    console.log('🔍 Fetching current team state...')
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
      console.log('❌ Team fetch error:', fetchError)
      console.log('❌ Current team data:', currentTeam)
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }
    console.log('✅ Current team fetched successfully:', currentTeam)

    const wasUnpaid = !currentTeam.has_paid
    const isBeingVerified = body.has_paid === true && (
      body.payment_status === 'completed' || 
      currentTeam.payment_status === 'pending_verification'
    )
    console.log(`💰 Payment status check - wasUnpaid: ${wasUnpaid}, isBeingVerified: ${isBeingVerified}`)

    // If payment is being verified, set passes_generated to false for later processing
    if (wasUnpaid && isBeingVerified) {
      body.passes_generated = false
      console.log('🔄 Set passes_generated to false for payment verification')
    }

    // Update the team
    console.log('📝 Updating team in database...')
    const { data: team, error } = await supabase
      .from('teams')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.log('❌ Team update error:', error)
      return NextResponse.json(
        { error: 'Failed to update team', details: error.message },
        { status: 500 }
      )
    }
    console.log('✅ Team updated successfully:', team)

    // Trigger pass generation immediately after payment verification
    if (wasUnpaid && isBeingVerified) {
      console.log(`💰 Payment verified for team ${team.id}. Triggering pass generation...`)
      
      try {
        const result = await generatePassesForTeam(team.id)
        console.log(`✅ Pass generation completed for team ${team.id}:`, result)
      } catch (error) {
        console.error(`❌ Failed to generate passes for team ${team.id}:`, error)
      }
    }

    console.log('🎉 PATCH request completed successfully')
    return NextResponse.json({ 
      team,
      passesTriggered: wasUnpaid && isBeingVerified
    })
  } catch (error) {
    console.error('💥 PATCH request failed with error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

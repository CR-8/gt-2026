import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { teamId, participantEmail } = await request.json()

    if (!teamId || !participantEmail) {
      return NextResponse.json(
        { error: 'Team ID and participant email are required' },
        { status: 400 }
      )
    }

    // Find the team by team_code
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('team_code', teamId)
      .single()

    if (teamError || !teamData) {
      console.error('Team lookup failed:', teamError)
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Find the team member by email in this team
    const { data: member, error } = await supabase
      .from('team_members')
      .select(`
        id,
        member_name,
        member_email,
        member_contact,
        role,
        is_present,
        attendance_marked_at,
        teams!inner (
          team_name,
          college_name,
          events!inner (
            name
          )
        )
      `)
      .eq('member_email', participantEmail)
      .eq('team_id', teamData.id)
      .single()

    if (error || !member) {
      console.error('Member lookup failed:', error)
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    const memberData = {
      id: member.id,
      member_name: member.member_name,
      member_email: member.member_email,
      member_contact: member.member_contact,
      role: member.role,
      is_present: member.is_present || false,
      attendance_marked_at: member.attendance_marked_at,
      team_name: (member.teams as any).team_name,
      college_name: (member.teams as any).college_name,
      event_name: (member.teams as any).events.name,
    }

    return NextResponse.json({ member: memberData })

  } catch (error) {
    console.error('Fetch member API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
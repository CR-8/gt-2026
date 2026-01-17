import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to check if user is admin
async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return false
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single()

  return !!adminUser
}

// GET team details with members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = await createClient()

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
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()

    const { data: team, error } = await supabase
      .from('teams')
      .update({
        ...body,
        updated_by: user?.id,
      })
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

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

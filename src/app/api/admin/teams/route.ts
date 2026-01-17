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

// GET all teams with filters
export async function GET(request: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')
    const hasPaid = searchParams.get('has_paid')
    const collegeName = searchParams.get('college_name')

    const supabase = await createClient()
    
    let query = supabase
      .from('teams')
      .select(`
        *,
        events (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    if (hasPaid !== null) {
      query = query.eq('has_paid', hasPaid === 'true')
    }

    if (collegeName) {
      query = query.ilike('college_name', `%${collegeName}%`)
    }

    const { data: teams, error } = await query

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      )
    }

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

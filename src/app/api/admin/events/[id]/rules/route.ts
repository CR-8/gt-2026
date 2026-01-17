import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET rules for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    const { data: rules, error } = await supabase
      .from('event_rules')
      .select('*')
      .eq('event_id', id)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching rules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch rules' },
        { status: 500 }
      )
    }

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

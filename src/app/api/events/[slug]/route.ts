import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createServiceClient()
    
    // Fetch event with rules
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('visibility', 'public')
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Fetch rules for this event
    const { data: rules, error: rulesError } = await supabase
      .from('event_rules')
      .select('rule_text')
      .eq('event_id', event.id)

    if (rulesError) {
      console.error('Error fetching rules:', rulesError)
      // Continue without rules rather than failing
    }

    return NextResponse.json({
      event: {
        ...event,
        rules: rules?.map(r => r.rule_text) || []
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

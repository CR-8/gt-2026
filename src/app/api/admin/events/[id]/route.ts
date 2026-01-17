import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// PUT update event
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()
    const body = await request.json()
    
    // Extract rules from body
    const { rules, ...eventData } = body

    const { data: event, error } = await supabase
      .from('events')
      .update({
        ...eventData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return NextResponse.json(
        { error: 'Failed to update event', details: error.message },
        { status: 500 }
      )
    }

    // Update rules if provided
    if (rules !== undefined) {
      // Delete existing rules
      await supabase
        .from('event_rules')
        .delete()
        .eq('event_id', id)

      // Insert new rules
      if (rules.length > 0) {
        const rulesData = rules.map((rule: string) => ({
          event_id: id,
          rule_text: rule,
        }))

        const { error: rulesError } = await supabase
          .from('event_rules')
          .insert(rulesData)

        if (rulesError) {
          console.error('Error updating rules:', rulesError)
        }
      }
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json(
        { error: 'Failed to delete event', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Generate a random access code
function generateAccessCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

// Super admin only endpoint
export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    
    const { action, code, expiresInDays } = body

    if (action === 'create') {
      // Create new access code
      const newCode = code || generateAccessCode()
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null

      const { data, error } = await supabase
        .from('access_codes')
        .insert({
          code: newCode,
          is_active: true,
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create access code', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, code: data })
    }

    if (action === 'deactivate') {
      // Deactivate old code
      if (!code) {
        return NextResponse.json(
          { error: 'Code is required for deactivation' },
          { status: 400 }
        )
      }

      const { error } = await supabase
        .from('access_codes')
        .update({ is_active: false })
        .eq('code', code)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to deactivate code' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Code deactivated' })
    }

    if (action === 'list') {
      // List all codes
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch codes' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, codes: data })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Access code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('access_codes')
      .select('code, is_active, created_at, expires_at, last_used_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch codes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ codes: data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

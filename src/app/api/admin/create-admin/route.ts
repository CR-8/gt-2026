import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createAdminSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  accessCode: z.string().min(1, 'Access code is required'),
  role: z.enum(['admin', 'super_admin']).default('admin'),
})

// This endpoint should only be accessible once or via super admin
// For initial setup, you can call it once and then disable it
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const validation = createAdminSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { username, email, password, accessCode, role } = validation.data
    const supabase = createServiceClient()

    // Step 0: Validate access code exists and is active
    const { data: validCode, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', accessCode)
      .eq('is_active', true)
      .single()

    if (codeError || !validCode) {
      return NextResponse.json(
        { error: 'Invalid or expired access code' },
        { status: 400 }
      )
    }

    // Check if code has expired
    if (validCode.expires_at && new Date(validCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Access code has expired' },
        { status: 400 }
      )
    }

    // Step 1: Create user in Supabase Auth first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: 'Failed to create auth user', details: authError?.message },
        { status: 500 }
      )
    }

    // Step 2: Hash password for our table
    const passwordHash = await bcrypt.hash(password, 10)

    // Step 3: Create admin user with the auth user's ID
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        username,
        email,
        password_hash: passwordHash,
        access_code: accessCode,
        role,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating admin:', error)
      // Rollback: delete auth user if admin creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create admin', details: error.message },
        { status: 500 }
      )
    }

    // Step 4: Mark access code as used (deactivate it)
    await supabase
      .from('access_codes')
      .update({ 
        is_active: false, 
        used_by: authData.user.id,
        used_at: new Date().toISOString()
      })
      .eq('code', accessCode)

    console.log('Admin user created :', adminUser)
    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      }
      }, { status: 201 })


  } catch (error: any) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

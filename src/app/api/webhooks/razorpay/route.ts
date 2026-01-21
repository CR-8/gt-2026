import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendRegistrationSuccessEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // 1. Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // 2. Parse webhook payload
    const event = JSON.parse(body)
    
    console.log('Razorpay webhook event:', event.event)

    // 3. Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id
      const paymentId = payment.id
      const paymentMethod = payment.method // 'card', 'upi', 'netbanking', etc.
      const amount = payment.amount / 100 // Convert from paise

      console.log(`Payment captured: ${paymentId} for order: ${orderId}`)

      // Use service role client to bypass RLS
      const supabase = createServiceClient()

      // 4. Update team payment status
      const { data: team, error: updateError } = await supabase
        .from('teams')
        .update({
          has_paid: true,
          payment_status: 'captured',
          payment_mode: paymentMethod,
        })
        .eq('payment_order_id', orderId)
        .select(`
          id,
          team_name,
          captain_name,
          captain_email,
          college_name,
          total_amount_payable,
          created_at,
          event_id,
          events (
            name,
            slug
          )
        `)
        .single()

      if (updateError) {
        console.error('Error updating team payment status:', updateError)
        return NextResponse.json(
          { error: 'Failed to update payment status' },
          { status: 500 }
        )
      }

      console.log(`Team ${team.id} payment marked as captured`)

      // 5. Fetch team members
      const { data: members } = await supabase
        .from('team_members')
        .select('member_name')
        .eq('team_id', team.id)
        .neq('role', 'captain')

      // 6. Send confirmation email to captain
      try {
        const eventsArray = team.events as { name: string; slug: string }[] | null;
        const eventData = eventsArray?.[0] ?? null;
        const eventUrl = `https://gantavya.roboticsclubsrmcem.in/events/${eventData?.slug || ''}`;
        const formattedAmount = `₹${team.total_amount_payable.toLocaleString('en-IN')}`;
        const formattedDate = new Date(team.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        
        await sendRegistrationSuccessEmail({
          team_name: team.team_name,
          captain_name: team.captain_name,
          captain_email: team.captain_email,
          event_name: eventData?.name || 'Event',
          event_url: eventUrl,
          college_name: team.college_name,
          team_members: members?.map(m => m.member_name).join(', ') || 'None',
          amount_paid: formattedAmount,
          payment_id: paymentId,
          registration_date: formattedDate,
        });
        
        console.log(`Confirmation email sent to ${team.captain_email}`);
      } catch (emailError) {
        // Log but don't fail the webhook if email fails
        console.error('Failed to send confirmation email:', emailError);
      }

      return NextResponse.json({ 
        success: true,
        message: 'Payment status updated and confirmation email sent'
      })
    }

    // 4. Handle payment.failed event
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id

      console.log(`Payment failed for order: ${orderId}`)

      const supabase = createServiceClient()

      await supabase
        .from('teams')
        .update({
          payment_status: 'failed',
        })
        .eq('payment_order_id', orderId)

      return NextResponse.json({ 
        success: true,
        message: 'Payment failure recorded'
      })
    }

    // Other events - just acknowledge
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

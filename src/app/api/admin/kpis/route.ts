import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Note: Auth is handled by admin layout using localStorage
    // This API is only accessible from admin pages which are protected
    
    const supabase = await createClient()

    // Fetch event KPIs from view
    const { data: eventKpis, error: kpisError } = await supabase
      .from('event_kpis')
      .select('*')

    if (kpisError) {
      console.error('Error fetching event KPIs:', kpisError)
      return NextResponse.json(
        { error: 'Failed to fetch KPIs' },
        { status: 500 }
      )
    }

    // Fetch global stats
    const { data: globalStats, error: statsError } = await supabase
      .rpc('get_global_stats')
      .single()

    // If RPC doesn't exist yet, calculate manually
    let global = {
      total_events: 0,
      total_teams: 0,
      total_participants: 0,
      total_revenue: 0,
      paid_teams: 0,
    }

    if (!statsError && globalStats) {
      global = globalStats as typeof global
    } else {
      // Fallback: calculate from event_kpis
      global = {
        total_events: eventKpis?.length || 0,
        total_teams: eventKpis?.reduce((sum, e) => sum + (e.total_teams || 0), 0) || 0,
        total_participants: eventKpis?.reduce((sum, e) => sum + (e.total_participants || 0), 0) || 0,
        total_revenue: eventKpis?.reduce((sum, e) => sum + (e.total_collection || 0), 0) || 0,
        paid_teams: eventKpis?.reduce((sum, e) => sum + (e.paid_teams || 0), 0) || 0,
      }
    }

    // Payment mode distribution
    const { data: paymentModes, error: modesError } = await supabase
      .from('teams')
      .select('payment_mode')
      .eq('has_paid', true)

    const paymentDistribution = paymentModes?.reduce((acc: any, team) => {
      const mode = team.payment_mode || 'unknown'
      acc[mode] = (acc[mode] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      event_kpis: eventKpis || [],
      global_stats: global,
      payment_distribution: paymentDistribution,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

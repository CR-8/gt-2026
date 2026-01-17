"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Users, Calendar, DollarSign } from 'lucide-react'

interface KPIData {
  event_kpis: any[]
  global_stats: {
    total_events: number
    total_teams: number
    total_participants: number
    total_revenue: number
    paid_teams: number
  }
  payment_distribution: Record<string, number>
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const response = await fetch('/api/admin/kpis')
        if (response.ok) {
          const data = await response.json()
          setKpis(data)
        }
      } catch (error) {
        console.error('Error fetching KPIs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Events',
      value: kpis?.global_stats.total_events || 0,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Total Teams',
      value: kpis?.global_stats.total_teams || 0,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      name: 'Total Participants',
      value: kpis?.global_stats.total_participants || 0,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      name: 'Total Revenue',
      value: `₹${kpis?.global_stats.total_revenue.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-neutral-400">Overview of your event management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/events"
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-orange-500 transition-colors"
          >
            <Calendar className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Manage Events</h3>
            <p className="text-sm text-neutral-400">Create and edit events</p>
          </Link>

          <Link
            href="/admin/teams"
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-orange-500 transition-colors"
          >
            <Users className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">View Teams</h3>
            <p className="text-sm text-neutral-400">Monitor registrations</p>
          </Link>

          <Link
            href="/admin/payments"
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-orange-500 transition-colors"
          >
            <DollarSign className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Payment Status</h3>
            <p className="text-sm text-neutral-400">Track payments</p>
          </Link>
        </div>
      </div>

      {/* Event KPIs Table */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Event Performance</h2>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {kpis?.event_kpis.map((event: any) => (
                <tr key={event.event_id} className="hover:bg-neutral-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {event.event_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    {event.total_teams}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    {event.total_participants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    {event.paid_teams}/{event.total_teams}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                    ₹{event.total_collection.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

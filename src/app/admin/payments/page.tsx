"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, DollarSign, CheckCircle2, Clock, XCircle, Search } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface Team {
  id: string
  team_name: string
  captain_name: string
  captain_email: string
  payment_status: string
  payment_amount: number | null
  payment_id: string | null
  created_at: string
  event: {
    name: string
    slug: string
  } | null
}

export default function PaymentsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchPayments() {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select(`
            id,
            team_name,
            captain_name,
            captain_email,
            payment_status,
            payment_amount,
            payment_id,
            created_at,
            event:events(name, slug)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        // Transform data to handle Supabase's array response for relations
        const transformedData: Team[] = (data || []).map((team: any) => ({
          id: team.id,
          team_name: team.team_name,
          captain_name: team.captain_name,
          captain_email: team.captain_email,
          payment_status: team.payment_status,
          payment_amount: team.payment_amount,
          payment_id: team.payment_id,
          created_at: team.created_at,
          event: Array.isArray(team.event) ? team.event[0] || null : team.event
        }))
        
        setTeams(transformedData)
      } catch (error) {
        console.error('Error fetching payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [supabase])

  const filteredTeams = teams.filter(team => {
    const matchesFilter = filter === 'all' || team.payment_status === filter
    const matchesSearch = search === '' || 
      team.team_name.toLowerCase().includes(search.toLowerCase()) ||
      team.captain_name.toLowerCase().includes(search.toLowerCase()) ||
      team.captain_email.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: teams.length,
    paid: teams.filter(t => t.payment_status === 'paid').length,
    pending: teams.filter(t => t.payment_status === 'pending').length,
    failed: teams.filter(t => t.payment_status === 'failed').length,
    totalRevenue: teams.filter(t => t.payment_status === 'paid').reduce((sum, t) => sum + (t.payment_amount || 0), 0)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-neutral-500" />
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Status</h1>
          <p className="text-neutral-400">Track and manage team payments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-neutral-400">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-neutral-400">Total Teams</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-neutral-400">Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{stats.paid}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-neutral-400">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-neutral-400">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'paid', 'pending', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Team</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Event</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Captain</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Payment ID</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    No teams found
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-neutral-800/50">
                    <td className="p-4">
                      <span className="font-medium text-white">{team.team_name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-neutral-300">{team.event?.name || '-'}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{team.captain_name}</p>
                        <p className="text-sm text-neutral-400">{team.captain_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(team.payment_status)}`}>
                        {getStatusIcon(team.payment_status)}
                        {team.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white">
                        {team.payment_amount ? `₹${team.payment_amount}` : '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-neutral-400 font-mono text-sm">
                        {team.payment_id || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-neutral-400 text-sm">
                        {new Date(team.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

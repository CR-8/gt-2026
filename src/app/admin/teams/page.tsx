"use client"

import { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface Team {
  id: string
  team_name: string
  college_name: string
  captain_name: string
  captain_email: string
  has_paid: boolean
  total_amount_payable: number
  payment_status: string
  created_at: string
  events: {
    name: string
    slug: string
  }
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')

  useEffect(() => {
    fetchTeams()
  }, [filter])

  async function fetchTeams() {
    try {
      let url = '/api/admin/teams'
      if (filter !== 'all') {
        url += `?has_paid=${filter === 'paid'}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teams</h1>
          <p className="text-neutral-400">View and manage team registrations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Search teams..."
            className="pl-10 bg-neutral-900 border-neutral-800"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' 
                ? 'bg-orange-600 text-white' 
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'paid' 
                ? 'bg-orange-600 text-white' 
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unpaid' 
                ? 'bg-orange-600 text-white' 
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            Unpaid
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Team Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Captain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-neutral-800/50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  <Link href={`/admin/teams/${team.id}`}>
                    {team.team_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  {team.events?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  {team.college_name}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-400">
                  <div>{team.captain_name}</div>
                  <div className="text-xs text-neutral-500">{team.captain_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  ₹{team.total_amount_payable}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    team.has_paid 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {team.has_paid ? 'Paid' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, User, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TeamMember {
  id: string
  member_name: string
  member_email: string
  member_contact: string
  role: 'captain' | 'member'
  is_active: boolean
}

interface TeamDetails {
  id: string
  team_name: string
  college_name: string
  captain_name: string
  captain_email: string
  total_amount_payable: number
  has_paid: boolean
  payment_status: string
  payment_mode: string
  payment_order_id: string
  created_at: string
  events: {
    name: string
    slug: string
    start_time: string
    venue: string
  }
}

export default function TeamDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamDetails()
  }, [params.id])

  async function fetchTeamDetails() {
    try {
      const response = await fetch(`/api/admin/teams/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTeam(data.team)
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching team details:', error)
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

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">Team not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-neutral-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">{team.team_name}</h1>
          <p className="text-neutral-400">{team.events.name}</p>
        </div>
      </div>

      {/* Team Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Team Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-400 mb-1">College</p>
              <p className="text-white">{team.college_name}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Captain</p>
              <p className="text-white">{team.captain_name}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Email</p>
              <p className="text-white">{team.captain_email}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Registered On</p>
              <p className="text-white">
                {new Date(team.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Payment Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-400 mb-1">Amount</p>
              <p className="text-2xl font-bold text-white">₹{team.total_amount_payable}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                team.has_paid 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {team.has_paid ? 'Paid' : 'Pending'}
              </span>
            </div>
            {team.payment_mode && (
              <div>
                <p className="text-xs text-neutral-400 mb-1">Payment Mode</p>
                <p className="text-white uppercase">{team.payment_mode}</p>
              </div>
            )}
            {team.payment_order_id && (
              <div>
                <p className="text-xs text-neutral-400 mb-1">Order ID</p>
                <p className="text-xs text-white font-mono">{team.payment_order_id}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Team Members ({members.length})</h2>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  member.role === 'captain' 
                    ? 'bg-orange-500/10 text-orange-500' 
                    : 'bg-neutral-700 text-neutral-400'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{member.member_name}</p>
                    {member.role === 'captain' && (
                      <span className="px-2 py-0.5 text-xs bg-orange-500/10 text-orange-500 rounded">
                        Captain
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-neutral-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.member_email}
                    </p>
                    <p className="text-sm text-neutral-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {member.member_contact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

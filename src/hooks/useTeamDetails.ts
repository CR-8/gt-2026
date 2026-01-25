import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

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
  passes_generated: boolean
  payment_status: string
  payment_gateway: string
  razorpay_payment_id: string
  created_at: string
  events: {
    name: string
    slug: string
    start_time: string
    venue: string
  }
}

export function useTeamDetails() {
  const params = useParams()
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

  return { team, members, loading, refetch: fetchTeamDetails }
}
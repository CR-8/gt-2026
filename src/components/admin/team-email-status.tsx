import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Mail } from "lucide-react"

interface Team {
  id: string
  team_name: string
  has_paid: boolean
  passes_generated: boolean
  error_message?: string
}

interface TeamEmailStatusProps {
  team: Team
}

export function TeamEmailStatus({ team }: TeamEmailStatusProps) {
  const getStatusIcon = (status: 'completed' | 'pending' | 'in-progress' | 'error') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: 'completed' | 'pending' | 'in-progress' | 'error') => {
    const variants = {
      completed: 'default' as const,
      pending: 'secondary' as const,
      'in-progress': 'outline' as const,
      error: 'destructive' as const,
    }
    const labels = {
      completed: 'Completed',
      pending: 'Pending',
      'in-progress': 'In Progress',
      error: 'Error',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="registration">
          <AccordionTrigger className="flex items-center gap-2">
            {getStatusIcon('completed')}
            <span>Registration Confirmation</span>
            {getStatusBadge('completed')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              Registration confirmation email has been sent to the team captain.
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payment">
          <AccordionTrigger className="flex items-center gap-2">
            {getStatusIcon(team.has_paid ? 'completed' : 'pending')}
            <span>Payment Verification</span>
            {getStatusBadge(team.has_paid ? 'completed' : 'pending')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground">
              {team.has_paid
                ? "Payment has been verified and confirmed."
                : "Waiting for payment verification. Once verified, pass generation will begin."
              }
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="passes">
          <AccordionTrigger className="flex items-center gap-2">
            {getStatusIcon(
              !team.has_paid ? 'pending' :
              team.passes_generated ? 'completed' : 'in-progress'
            )}
            <span>Pass Generation</span>
            {getStatusBadge(
              !team.has_paid ? 'pending' :
              team.passes_generated ? 'completed' : 'in-progress'
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground">
              {!team.has_paid
                ? "Pass generation will start once payment is verified."
                : team.passes_generated
                ? "Event passes have been generated and emailed to the team captain."
                : "Passes are currently being generated. This may take a few minutes."
              }
            </div>
          </AccordionContent>
        </AccordionItem>

        {team.error_message && (
          <AccordionItem value="error">
            <AccordionTrigger className="flex items-center gap-2">
              {getStatusIcon('error')}
              <span>Error Details</span>
              {getStatusBadge('error')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border">
                {team.error_message}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )
}
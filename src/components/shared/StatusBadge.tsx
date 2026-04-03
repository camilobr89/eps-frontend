import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  scheduled: {
    label: 'Agendada',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  confirmed: {
    label: 'Confirmada',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  completed: {
    label: 'Completada',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  expired: {
    label: 'Vencida',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  },
  no_show: {
    label: 'No asistió',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  }

  return (
    <Badge
      variant="outline"
      className={cn('border-transparent font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

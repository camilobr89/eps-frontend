import {
  Bell,
  Calendar,
  ChevronRight,
  Clock3,
  FileText,
  TimerReset,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/shared/Skeleton'
import { useDashboardSummary, useDashboardTimeline } from '@/hooks/useDashboard'
import { useSendReminders } from '@/hooks/useNotifications'
import type { TimelineEvent } from '@/types'

const SUMMARY_CARD_STYLES = {
  totalAuthorizations: {
    icon: FileText,
    accent: 'text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-500/15',
  },
  pendingAuthorizations: {
    icon: Clock3,
    accent: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/15',
  },
  upcomingAppointments: {
    icon: Calendar,
    accent: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/15',
  },
  unreadNotifications: {
    icon: Bell,
    accent: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/15',
  },
} as const

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-CO', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('es-CO', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDaysLeftStyle(daysLeft: number): string {
  if (daysLeft <= 3) return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/15'
  if (daysLeft <= 15) return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/15'
  return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/15'
}

function getDaysLeftLabel(daysLeft: number): string {
  if (daysLeft < 0) return `Vencida hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) === 1 ? '' : 's'}`
  if (daysLeft === 0) return 'Vence hoy'
  if (daysLeft === 1) return 'Vence en 1 día'
  return `Vence en ${daysLeft} días`
}

function getTimelineTarget(event: TimelineEvent): string {
  return event.type === 'appointment'
    ? `/appointments/${event.entityId}`
    : `/authorizations/${event.entityId}`
}

export function DashboardPage() {
  const navigate = useNavigate()
  const {
    data: summary,
    isLoading: isLoadingSummary,
    isError: isSummaryError,
  } = useDashboardSummary()
  const {
    data: timeline = [],
    isLoading: isLoadingTimeline,
    isError: isTimelineError,
  } = useDashboardTimeline()
  const sendReminders = useSendReminders()
  const hasSentReminders = useRef(false)

  useEffect(() => {
    if (hasSentReminders.current) return
    hasSentReminders.current = true
    void sendReminders.mutateAsync().catch(() => undefined)
  }, [sendReminders])

  if (isLoadingSummary || isLoadingTimeline) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Dashboard"
          description="Resumen rápido del estado de autorizaciones, citas y notificaciones."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <div key={rowIndex} className="space-y-2 rounded-xl border border-border/70 p-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!summary || isSummaryError || isTimelineError) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Dashboard"
          description="Resumen rápido del estado de autorizaciones, citas y notificaciones."
        />
        <Card>
          <CardContent>
            <EmptyState
              icon={<TimerReset className="h-12 w-12" />}
              title="No fue posible cargar el dashboard"
              description="Intenta recargar la página para volver a consultar el resumen."
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const expiringAuthorizations = summary.expiringAuthorizations ?? []

  const summaryCards = [
    {
      key: 'totalAuthorizations' as const,
      title: 'Total autorizaciones',
      value: summary.totalAuthorizations,
      description: 'Ver todas las autorizaciones registradas',
      onClick: () => navigate('/authorizations'),
    },
    {
      key: 'pendingAuthorizations' as const,
      title: 'Pendientes',
      value: summary.pendingAuthorizations,
      description: 'Revisar autorizaciones aún por gestionar',
      onClick: () => navigate('/authorizations?status=pending'),
    },
    {
      key: 'upcomingAppointments' as const,
      title: 'Próximas citas',
      value: summary.upcomingAppointments,
      description: 'Abrir agenda de citas próximas',
      onClick: () => navigate('/appointments'),
    },
    {
      key: 'unreadNotifications' as const,
      title: 'No leídas',
      value: summary.unreadNotifications,
      description: 'Ir al centro de notificaciones',
      onClick: () => navigate('/notifications'),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Dashboard"
        description="Resumen rápido del estado de autorizaciones, citas y notificaciones."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = SUMMARY_CARD_STYLES[card.key].icon
          return (
            <Card key={card.key} className="overflow-hidden">
              <CardContent className="p-0">
                <button
                  type="button"
                  onClick={card.onClick}
                  className="flex w-full flex-col gap-4 p-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${SUMMARY_CARD_STYLES[card.key].accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight">{card.value}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{card.description}</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Autorizaciones por vencer</CardTitle>
          </CardHeader>
          <CardContent>
            {expiringAuthorizations.length === 0 ? (
              <EmptyState
                icon={<Clock3 className="h-12 w-12" />}
                title="Sin vencimientos cercanos"
                description="No hay autorizaciones próximas a vencer en este momento."
              />
            ) : (
              <div className="space-y-3">
                {expiringAuthorizations.map((authorization) => (
                  <button
                    key={authorization.id}
                    type="button"
                    onClick={() => navigate(`/authorizations/${authorization.id}`)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {authorization.requestNumber || 'Sin número de solicitud'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vence el {formatDate(authorization.expirationDate)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getDaysLeftStyle(authorization.daysLeft)}`}
                    >
                      {getDaysLeftLabel(authorization.daysLeft)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-12 w-12" />}
                title="Sin eventos próximos"
                description="Cuando haya citas o vencimientos cercanos, aparecerán aquí."
              />
            ) : (
              <div className="space-y-4">
                {timeline.map((event, index) => {
                  const isAppointment = event.type === 'appointment'
                  const Icon = isAppointment ? Calendar : Clock3
                  const accent = isAppointment
                    ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/15'
                    : 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/15'

                  return (
                    <button
                      key={`${event.type}-${event.entityId}-${event.date}-${index}`}
                      type="button"
                      onClick={() => navigate(getTimelineTarget(event))}
                      className="flex w-full gap-3 text-left"
                    >
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${accent}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="mt-2 h-full w-px bg-border" />
                        )}
                      </div>
                      <div className="flex-1 rounded-xl border border-border/70 px-4 py-3 transition-colors hover:bg-muted/40">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {formatDateTime(event.date)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

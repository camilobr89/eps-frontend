import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Bell,
  Calendar,
  CheckCheck,
  Clock3,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { QueryWrapper } from '@/components/shared/QueryWrapper'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/formatters'
import { usePagination } from '@/hooks/usePagination'
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from '@/hooks/useNotifications'
import { useNotificationsStore } from '@/stores/notifications.store'
import type { Notification, NotificationType } from '@/types'

type FilterMode = 'all' | 'unread'

function inferNotificationType(notification: Notification): NotificationType | null {
  if (notification.type) return notification.type

  const text = `${notification.title} ${notification.message}`.toLowerCase()

  if (text.includes('ocr') || text.includes('documento')) {
    return text.includes('error') || text.includes('fall') ? 'ocr_failed' : 'ocr_completed'
  }

  if (text.includes('cita') || text.includes('consulta')) {
    return 'appointment_reminder'
  }

  if (
    text.includes('vence') ||
    text.includes('vencimiento') ||
    text.includes('expira')
  ) {
    return 'expiration_warning'
  }

  return null
}

function getNotificationIcon(notification: Notification) {
  const type = inferNotificationType(notification)

  if (type === 'appointment_reminder') {
    return {
      icon: Calendar,
      accent: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/15',
    }
  }

  if (type === 'ocr_completed' || type === 'ocr_failed') {
    return {
      icon: FileText,
      accent: 'text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-500/15',
    }
  }

  return {
    icon: Clock3,
    accent: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/15',
  }
}

function getNotificationTarget(notification: Notification): string | null {
  if (!notification.relatedEntityType || !notification.relatedEntityId) {
    return null
  }

  if (notification.relatedEntityType === 'appointment') {
    return `/appointments/${notification.relatedEntityId}`
  }

  if (notification.relatedEntityType === 'authorization') {
    return `/authorizations/${notification.relatedEntityId}`
  }

  return null
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterMode>('all')
  const { page, limit, setPage, setLimit } = usePagination()
  const unreadCount = useNotificationsStore((s) => s.unreadCount)

  const readFilter = filter === 'unread' ? false : undefined
  const notificationsQuery = useNotifications(readFilter, {
    page,
    limit,
  })
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()

  function handleFilterChange(nextFilter: FilterMode) {
    setFilter(nextFilter)
    setPage(1)
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsReadMutation.mutateAsync()
      toast.success('Todas las notificaciones se marcaron como leídas')
    } catch {
      toast.error('No fue posible marcar las notificaciones como leídas')
    }
  }

  async function handleNotificationClick(notification: Notification) {
    try {
      if (!notification.read) {
        await markAsReadMutation.mutateAsync(notification.id)
      }

      const target = getNotificationTarget(notification)
      if (target) {
        navigate(target)
      }
    } catch {
      toast.error('No fue posible actualizar la notificación')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Notificaciones"
        description="Consulta vencimientos, recordatorios de citas y actualizaciones del OCR."
        action={
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('all')}
        >
          Todas
        </Button>
        <Button
          type="button"
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('unread')}
        >
          No leídas
        </Button>
        {notificationsQuery.isFetching && (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Actualizando...
          </span>
        )}
      </div>

      <QueryWrapper
        query={notificationsQuery}
        loadingFallback={<ListPageSkeleton showFilters={false} />}
        isEmpty={(notificationPage) => notificationPage.data.length === 0}
        emptyState={
          <Card>
            <CardContent>
              <EmptyState
                icon={<Bell className="h-12 w-12" />}
                title={
                  filter === 'unread'
                    ? 'No tienes notificaciones sin leer'
                    : 'Aún no hay notificaciones'
                }
                description={
                  filter === 'unread'
                    ? 'Cuando llegue una nueva alerta aparecerá en este listado.'
                    : 'Aquí verás vencimientos, recordatorios de citas y resultados del OCR.'
                }
              />
            </CardContent>
          </Card>
        }
        errorTitle="No fue posible cargar las notificaciones"
      >
        {(notificationPage) => (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {filter === 'unread' ? 'No leídas' : 'Todas las notificaciones'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notificationPage.data.map((notification) => {
                  const { icon: Icon, accent } = getNotificationIcon(notification)
                  const target = getNotificationTarget(notification)

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void handleNotificationClick(notification)}
                      className={cn(
                        'flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition-colors hover:bg-muted/40',
                        notification.read
                          ? 'border-border/70 bg-background'
                          : 'border-primary/20 bg-primary/5',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          accent,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          {target && <span>Abrir detalle</span>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <Pagination
              page={page}
              limit={limit}
              total={notificationPage.meta.total}
              totalPages={notificationPage.meta.totalPages}
              hasNextPage={page < notificationPage.meta.totalPages}
              hasPreviousPage={page > 1}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        )}
      </QueryWrapper>
    </div>
  )
}

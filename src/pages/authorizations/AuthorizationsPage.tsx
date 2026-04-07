import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, FileText, Trash2, Pencil, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Pagination } from '@/components/shared/Pagination'
import { QueryWrapper } from '@/components/shared/QueryWrapper'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAuthorizations, useDeleteAuthorization } from '@/hooks/useAuthorizations'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import { usePagination } from '@/hooks/usePagination'
import type { Authorization, AuthorizationStatus, Priority } from '@/types'

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  urgente: { label: 'Urgente', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  alta: { label: 'Alta', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  normal: { label: 'Normal', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  baja: { label: 'Baja', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
}

function getExpirationClass(expirationDate: string | null): string {
  if (!expirationDate) return 'text-muted-foreground'
  const daysLeft = Math.floor(
    (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  )
  if (daysLeft < 3) return 'font-semibold text-red-600'
  if (daysLeft < 15) return 'font-semibold text-yellow-600'
  return 'text-green-600'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-CO')
}

const STATUS_OPTIONS: { value: AuthorizationStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'completed', label: 'Completada' },
  { value: 'expired', label: 'Vencida' },
  { value: 'cancelled', label: 'Cancelada' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'urgente', label: 'Urgente' },
  { value: 'alta', label: 'Alta' },
  { value: 'normal', label: 'Normal' },
  { value: 'baja', label: 'Baja' },
]

export function AuthorizationsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [authToDelete, setAuthToDelete] = useState<Authorization | null>(null)
  const { page, limit, setPage, setLimit } = usePagination()

  const status = searchParams.get('status') as AuthorizationStatus | null
  const priority = searchParams.get('priority') as Priority | null
  const familyMemberId = searchParams.get('familyMemberId') || undefined

  const filters = {
    page,
    limit,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(familyMemberId && { familyMemberId }),
  }

  const authQuery = useAuthorizations(filters)
  const { data: familyMembersPage } = useFamilyMembers()
  const deleteMutation = useDeleteAuthorization()

  const familyMembers = familyMembersPage?.data ?? []
  const hasFilters = !!(status || priority || familyMemberId)
  const statusFilterOptions = [
    { value: 'all', label: 'Todos los estados' },
    ...STATUS_OPTIONS,
  ]
  const priorityFilterOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    ...PRIORITY_OPTIONS,
  ]
  const familyMemberFilterOptions = [
    { value: 'all', label: 'Todos los familiares' },
    ...familyMembers.map((member) => ({
      value: member.id,
      label: member.fullName,
    })),
  ]

  function updateFilter(key: string, value: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }

  function clearFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams()
      const currentLimit = prev.get('limit')
      if (currentLimit) {
        next.set('limit', currentLimit)
      }
      return next
    })
  }

  async function handleDelete() {
    if (!authToDelete) return
    try {
      await deleteMutation.mutateAsync(authToDelete.id)
      toast.success('Autorización eliminada exitosamente')
    } catch {
      toast.error('Error al eliminar la autorización')
    } finally {
      setAuthToDelete(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Autorizaciones"
        action={
          <Button onClick={() => navigate('/authorizations/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva autorización
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          items={statusFilterOptions}
          value={status ?? 'all'}
          onValueChange={(v) => updateFilter('status', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={priorityFilterOptions}
          value={priority ?? 'all'}
          onValueChange={(v) => updateFilter('priority', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            {priorityFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={familyMemberFilterOptions}
          value={familyMemberId ?? 'all'}
          onValueChange={(v) => updateFilter('familyMemberId', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Miembro de familia" />
          </SelectTrigger>
          <SelectContent>
            {familyMemberFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Listado */}
      <QueryWrapper
        query={authQuery}
        loadingFallback={<ListPageSkeleton />}
        isEmpty={(authPage) => authPage.data.length === 0}
        emptyState={
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title={hasFilters ? 'Sin resultados' : 'Aún no hay autorizaciones'}
            description={
              hasFilters
                ? 'No hay autorizaciones que coincidan con los filtros aplicados.'
                : 'Crea tu primera autorización para comenzar a gestionar los servicios médicos.'
            }
            action={
              !hasFilters ? (
                <Button onClick={() => navigate('/authorizations/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva autorización
                </Button>
              ) : undefined
            }
          />
        }
        errorTitle="No fue posible cargar las autorizaciones"
      >
        {(authPage) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {authPage.data.map((auth) => {
                const priorityCfg = PRIORITY_CONFIG[auth.priority]
                return (
                  <Card
                    key={auth.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => navigate(`/authorizations/${auth.id}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-1">
                          <StatusBadge status={auth.status} />
                          {priorityCfg && (
                            <Badge
                              variant="outline"
                              className={`ml-1 border-transparent text-xs font-medium ${priorityCfg.className}`}
                            >
                              {priorityCfg.label}
                            </Badge>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {auth.services.length} servicio{auth.services.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-sm">
                        {auth.familyMember && (
                          <p className="font-medium">{auth.familyMember.fullName}</p>
                        )}
                        <p className="text-muted-foreground">{auth.documentType}</p>
                        {auth.requestNumber && (
                          <p className="text-xs text-muted-foreground">
                            N° {auth.requestNumber}
                          </p>
                        )}
                      </div>

                      {auth.expirationDate && (
                        <p className={`mt-2 text-xs ${getExpirationClass(auth.expirationDate)}`}>
                          Vence: {formatDate(auth.expirationDate)}
                        </p>
                      )}

                      <div className="mt-4 flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Agendar cita"
                          title="Agendar cita"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/appointments/new?authorizationId=${auth.id}`)
                          }}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/authorizations/${auth.id}/edit`)
                          }}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setAuthToDelete(auth)
                          }}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Pagination
              page={page}
              limit={limit}
              total={authPage.meta.total}
              totalPages={authPage.meta.totalPages}
              hasNextPage={page < authPage.meta.totalPages}
              hasPreviousPage={page > 1}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        )}
      </QueryWrapper>

      <ConfirmDialog
        open={!!authToDelete}
        onOpenChange={(open) => !open && setAuthToDelete(null)}
        title="Eliminar autorización"
        description={`¿Estás seguro de que deseas eliminar esta autorización${authToDelete?.requestNumber ? ` (N° ${authToDelete.requestNumber})` : ''}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

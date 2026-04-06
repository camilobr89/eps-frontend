import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Plus, Calendar, Trash2, Pencil, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAppointments, useDeleteAppointment } from '@/hooks/useAppointments'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import type { Appointment, AppointmentStatus } from '@/types'

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Agendada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
]

function formatDayHeader(dateKey: string): string {
  return new Date(dateKey + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupByDay(appointments: Appointment[]): Map<string, Appointment[]> {
  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(),
  )
  const map = new Map<string, Appointment[]>()
  for (const appt of sorted) {
    // Use local date as key to avoid UTC offset issues
    const d = new Date(appt.appointmentDate)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const arr = map.get(key) ?? []
    arr.push(appt)
    map.set(key, arr)
  }
  return map
}

export function AppointmentsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [apptToDelete, setApptToDelete] = useState<Appointment | null>(null)

  const status = searchParams.get('status') as AppointmentStatus | null
  const familyMemberId = searchParams.get('familyMemberId') || undefined
  const dateFrom = searchParams.get('dateFrom') || undefined
  const dateTo = searchParams.get('dateTo') || undefined

  const filters = {
    ...(status && { status }),
    ...(familyMemberId && { familyMemberId }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  }

  const { data: apptPage, isLoading } = useAppointments(filters)
  const { data: familyMembersPage } = useFamilyMembers()
  const deleteMutation = useDeleteAppointment()

  const appointments = apptPage?.data ?? []
  const familyMembers = familyMembersPage?.data ?? []
  const hasFilters = !!(status || familyMemberId || dateFrom || dateTo)

  const familyMemberFilterOptions = [
    { value: 'all', label: 'Todos los familiares' },
    ...familyMembers.map((m) => ({ value: m.id, label: m.fullName })),
  ]
  const statusFilterOptions = [
    { value: 'all', label: 'Todos los estados' },
    ...STATUS_OPTIONS,
  ]

  function updateFilter(key: string, value: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  function clearFilters() {
    setSearchParams({})
  }

  async function handleDelete() {
    if (!apptToDelete) return
    try {
      await deleteMutation.mutateAsync(apptToDelete.id)
      toast.success('Cita eliminada exitosamente')
    } catch {
      toast.error('Error al eliminar la cita')
    } finally {
      setApptToDelete(null)
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  const grouped = groupByDay(appointments)

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Citas"
        action={
          <Button onClick={() => navigate('/appointments/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva cita
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        <Select
          items={statusFilterOptions}
          value={status ?? 'all'}
          onValueChange={(v) => updateFilter('status', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
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
            {familyMemberFilterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Desde</label>
            <Input
              type="date"
              className="w-36"
              value={dateFrom ?? ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value || null)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Hasta</label>
            <Input
              type="date"
              className="w-36"
              value={dateTo ?? ''}
              onChange={(e) => updateFilter('dateTo', e.target.value || null)}
            />
          </div>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Listado */}
      {appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title={hasFilters ? 'Sin resultados' : 'Aún no hay citas'}
          description={
            hasFilters
              ? 'No hay citas que coincidan con los filtros aplicados.'
              : 'Crea tu primera cita para comenzar a gestionar tus consultas médicas.'
          }
          action={
            !hasFilters ? (
              <Button onClick={() => navigate('/appointments/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva cita
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([dateKey, dayAppts]) => (
            <div key={dateKey}>
              <h2 className="mb-3 text-sm font-semibold capitalize text-muted-foreground">
                {formatDayHeader(dateKey)}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dayAppts.map((appt) => (
                  <Card
                    key={appt.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => navigate(`/appointments/${appt.id}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-lg font-semibold tabular-nums">
                            {formatTime(appt.appointmentDate)}
                          </p>
                          {appt.familyMember && (
                            <p className="text-sm font-medium">{appt.familyMember.fullName}</p>
                          )}
                        </div>
                        <StatusBadge status={appt.status} />
                      </div>

                      <div className="mt-3 space-y-0.5 text-sm text-muted-foreground">
                        {appt.specialty && <p>{appt.specialty}</p>}
                        {appt.doctorName && <p>{appt.doctorName}</p>}
                        {appt.location && <p>{appt.location}</p>}
                      </div>

                      {appt.authorizationId && (
                        <div className="mt-3">
                          <Link
                            to={`/authorizations/${appt.authorizationId}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver autorización
                          </Link>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/appointments/${appt.id}/edit`)
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
                            setApptToDelete(appt)
                          }}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!apptToDelete}
        onOpenChange={(open) => !open && setApptToDelete(null)}
        title="Eliminar cita"
        description="¿Estás seguro de que deseas eliminar esta cita? Si estaba vinculada a una autorización, su estado volverá a pendiente. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  User,
  Stethoscope,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageBackButton } from '@/components/shared/PageBackButton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  useAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from '@/hooks/useAppointments'
import type { AppointmentStatus } from '@/types'

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Agendada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
]

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('es-CO')
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  )
}

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: appt, isLoading } = useAppointment(id!)
  const updateMutation = useUpdateAppointment()
  const deleteMutation = useDeleteAppointment()
  const [showDelete, setShowDelete] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  async function handleStatusChange(newStatus: AppointmentStatus) {
    if (!appt || newStatus === appt.status) return
    setIsUpdatingStatus(true)
    try {
      await updateMutation.mutateAsync({ id: id!, data: { status: newStatus } })
      toast.success('Estado actualizado')
    } catch {
      toast.error('Error al actualizar el estado')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id!)
      toast.success('Cita eliminada exitosamente')
      navigate('/appointments')
    } catch {
      toast.error('Error al eliminar la cita')
    }
  }

  if (isLoading) {
    return <DetailPageSkeleton cards={3} />
  }

  if (!appt) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="Cita no encontrada"
          description="No fue posible encontrar esta cita o ya no está disponible."
          action={<Button onClick={() => navigate('/appointments')}>Volver al listado</Button>}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <PageBackButton onClick={() => navigate('/appointments')} label="Volver a citas" />
        <PageHeader
          title={appt.specialty ?? 'Detalle de cita'}
          action={
            <div className="flex flex-wrap gap-2">
              {/* Status changer */}
              <Select
                items={STATUS_OPTIONS}
                value={appt.status}
                onValueChange={(v) => handleStatusChange(v as AppointmentStatus)}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => navigate(`/appointments/${id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={() => setShowDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          }
        />
      </div>

      {/* Datos principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Información de la cita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <StatusBadge status={appt.status} />
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm text-muted-foreground">Fecha y hora</dt>
              <dd className="mt-0.5 text-sm font-medium capitalize">
                {formatDateTime(appt.appointmentDate)}
              </dd>
            </div>
            {appt.familyMember && (
              <DetailRow label="Miembro de familia" value={appt.familyMember.fullName} />
            )}
            <DetailRow label="Especialidad" value={appt.specialty} />
            <DetailRow label="Médico" value={appt.doctorName} />
            <DetailRow label="Ubicación" value={appt.location} />
          </dl>
          {appt.notes && (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground">Notas</dt>
              <dd className="mt-0.5 text-sm">{appt.notes}</dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Miembro de familia */}
      {appt.familyMember && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Miembro de familia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Nombre" value={appt.familyMember.fullName} />
              <DetailRow label="Parentesco" value={appt.familyMember.relationship} />
              <DetailRow label="Documento" value={appt.familyMember.documentNumber} />
              <DetailRow label="Teléfono" value={appt.familyMember.cellphone ?? appt.familyMember.phone} />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Autorización vinculada */}
      {appt.authorization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Autorización vinculada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailRow
                label="Número de solicitud"
                value={appt.authorization.requestNumber}
              />
              <DetailRow label="Tipo" value={appt.authorization.documentType} />
              <DetailRow
                label="Vencimiento"
                value={formatDate(appt.authorization.expirationDate)}
              />
              <DetailRow label="Prestador" value={appt.authorization.providerName} />
              {appt.authorization.diagnosisDescription && (
                <div className="sm:col-span-2">
                  <DetailRow
                    label="Diagnóstico"
                    value={appt.authorization.diagnosisDescription}
                  />
                </div>
              )}
            </dl>
            <div className="mt-4">
              <Link
                to={`/authorizations/${appt.authorizationId}`}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                <Stethoscope className="h-3.5 w-3.5" />
                Ver autorización completa
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Servicio específico */}
      {appt.authorizationServiceId && appt.authorization?.services && (() => {
        const svc = appt.authorization!.services.find(
          (s) => s.id === appt.authorizationServiceId,
        )
        if (!svc) return null
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Servicio específico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="Código CUPS" value={svc.serviceCode} />
                <DetailRow label="Nombre" value={svc.serviceName} />
                <DetailRow label="Cantidad" value={String(svc.quantity)} />
                {svc.serviceType && <DetailRow label="Tipo" value={svc.serviceType} />}
              </dl>
            </CardContent>
          </Card>
        )
      })()}

      <Separator />
      <div className="text-xs text-muted-foreground">
        Creada: {new Date(appt.createdAt).toLocaleDateString('es-CO')}
        {appt.updatedAt !== appt.createdAt && (
          <> · Actualizada: {new Date(appt.updatedAt).toLocaleDateString('es-CO')}</>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Eliminar cita"
        description="¿Estás seguro de que deseas eliminar esta cita? Si estaba vinculada a una autorización, su estado volverá a pendiente. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

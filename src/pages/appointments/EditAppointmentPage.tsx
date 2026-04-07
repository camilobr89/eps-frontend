import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { PageHeader } from '@/components/shared/PageHeader'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { PageBackButton } from '@/components/shared/PageBackButton'
import { useAppointment, useUpdateAppointment } from '@/hooks/useAppointments'
import { AppointmentForm } from './AppointmentForm'
import type { AppointmentFormValues } from '@/lib/validations/appointment.validations'
import type { ApiError } from '@/types'

function stripEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  )
}

function toIso(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString()
}

export function EditAppointmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: appt, isLoading } = useAppointment(id!)
  const updateMutation = useUpdateAppointment()

  async function handleSubmit(data: AppointmentFormValues) {
    try {
      const { appointmentDate, ...rest } = data
      const payload = stripEmpty({
        ...rest,
        appointmentDate: toIso(appointmentDate),
      })
      await updateMutation.mutateAsync({
        id: id!,
        data: payload as Parameters<typeof updateMutation.mutateAsync>[0]['data'],
      })
      toast.success('Cita actualizada exitosamente')
      navigate(`/appointments/${id}`)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      toast.error(axiosError.response?.data?.message ?? 'Error al actualizar la cita')
    }
  }

  if (isLoading) {
    return <DetailPageSkeleton cards={1} />
  }

  if (!appt) {
    return (
      <div className="p-6 text-center text-muted-foreground">Cita no encontrada</div>
    )
  }

  const defaultValues: Partial<AppointmentFormValues> = {
    familyMemberId: appt.familyMemberId,
    authorizationId: appt.authorizationId ?? '',
    authorizationServiceId: appt.authorizationServiceId ?? '',
    appointmentDate: appt.appointmentDate,
    location: appt.location ?? '',
    doctorName: appt.doctorName ?? '',
    specialty: appt.specialty ?? '',
    notes: appt.notes ?? '',
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <PageBackButton
          onClick={() => navigate(`/appointments/${id}`)}
          label="Volver al detalle de la cita"
        />
        <PageHeader title="Editar cita" />
      </div>

      <AppointmentForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}

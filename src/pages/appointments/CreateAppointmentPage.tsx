import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { PageHeader } from '@/components/shared/PageHeader'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { PageBackButton } from '@/components/shared/PageBackButton'
import { useCreateAppointment } from '@/hooks/useAppointments'
import { useAuthorization } from '@/hooks/useAuthorizations'
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

export function CreateAppointmentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const authorizationId = searchParams.get('authorizationId') || undefined

  const createMutation = useCreateAppointment()

  // If navigating from an authorization, preload it to get the familyMemberId
  const { data: preloadedAuth, isLoading: isLoadingAuth } = useAuthorization(
    authorizationId ?? '',
  )

  async function handleSubmit(data: AppointmentFormValues) {
    try {
      const { appointmentDate, ...rest } = data
      const payload = stripEmpty({
        ...rest,
        appointmentDate: toIso(appointmentDate),
      })
      const created = await createMutation.mutateAsync(
        payload as unknown as Parameters<typeof createMutation.mutateAsync>[0],
      )
      toast.success('Cita creada exitosamente')
      navigate(`/appointments/${created.id}`)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      toast.error(axiosError.response?.data?.message ?? 'Error al crear la cita')
    }
  }

  if (authorizationId && isLoadingAuth) {
    return <DetailPageSkeleton cards={1} />
  }

  const defaultValues = preloadedAuth
    ? {
        authorizationId: preloadedAuth.id,
        familyMemberId: preloadedAuth.familyMemberId,
      }
    : undefined

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <PageBackButton onClick={() => navigate('/appointments')} label="Volver a citas" />
        <PageHeader title="Nueva cita" />
      </div>

      <AppointmentForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Crear cita"
      />
    </div>
  )
}

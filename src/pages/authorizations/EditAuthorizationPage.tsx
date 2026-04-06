import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuthorization, useUpdateAuthorization } from '@/hooks/useAuthorizations'
import { AuthorizationForm } from './AuthorizationForm'
import type { AuthorizationFormValues } from '@/lib/validations/authorization.validations'
import type { ApiError } from '@/types'

function stripEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  )
}

export function EditAuthorizationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: auth, isLoading } = useAuthorization(id!)
  const updateMutation = useUpdateAuthorization()

  async function handleSubmit(data: AuthorizationFormValues) {
    try {
      const { services, ...rest } = data
      const payload = {
        ...stripEmpty(rest as Record<string, unknown>),
        services: (services ?? []).map((s) => stripEmpty(s as Record<string, unknown>)),
      }
      await updateMutation.mutateAsync({
        id: id!,
        data: payload as unknown as Parameters<typeof updateMutation.mutateAsync>[0]['data'],
      })
      toast.success('Autorización actualizada exitosamente')
      navigate(`/authorizations/${id}`)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      toast.error(axiosError.response?.data?.message ?? 'Error al actualizar la autorización')
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  if (!auth) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Autorización no encontrada
      </div>
    )
  }

  const defaultValues: Partial<AuthorizationFormValues> = {
    familyMemberId: auth.familyMemberId,
    epsProviderId: auth.epsProviderId ?? '',
    documentType: auth.documentType,
    requestNumber: auth.requestNumber ?? '',
    issuingDate: auth.issuingDate?.slice(0, 10) ?? '',
    expirationDate: auth.expirationDate?.slice(0, 10) ?? '',
    priority: auth.priority,
    notes: auth.notes ?? '',
    diagnosisCode: auth.diagnosisCode ?? '',
    diagnosisDescription: auth.diagnosisDescription ?? '',
    patientLocation: auth.patientLocation ?? '',
    serviceOrigin: auth.serviceOrigin ?? '',
    providerName: auth.providerName ?? '',
    providerNit: auth.providerNit ?? '',
    providerCode: auth.providerCode ?? '',
    providerAddress: auth.providerAddress ?? '',
    providerPhone: auth.providerPhone ?? '',
    providerDepartment: auth.providerDepartment ?? '',
    providerCity: auth.providerCity ?? '',
    paymentType: auth.paymentType ?? '',
    copayValue: auth.copayValue ?? undefined,
    copayPercentage: auth.copayPercentage ?? undefined,
    maxValue: auth.maxValue ?? undefined,
    weeksContributed: auth.weeksContributed ?? undefined,
    services: auth.services.map((s) => ({
      serviceCode: s.serviceCode,
      serviceName: s.serviceName,
      quantity: s.quantity,
      serviceType: s.serviceType ?? '',
    })),
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/authorizations/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Editar autorización" />
      </div>

      <AuthorizationForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}

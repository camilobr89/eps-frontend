import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { useCreateAuthorization } from '@/hooks/useAuthorizations'
import { AuthorizationForm } from './AuthorizationForm'
import type { AuthorizationFormValues } from '@/lib/validations/authorization.validations'
import type { ApiError } from '@/types'

function stripEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  )
}

export function CreateAuthorizationPage() {
  const navigate = useNavigate()
  const createMutation = useCreateAuthorization()

  async function handleSubmit(data: AuthorizationFormValues) {
    try {
      const { services, ...rest } = data
      const payload = {
        ...stripEmpty(rest as Record<string, unknown>),
        services: (services ?? []).map((s) => stripEmpty(s as Record<string, unknown>)),
      }
      const created = await createMutation.mutateAsync(
        payload as unknown as Parameters<typeof createMutation.mutateAsync>[0],
      )
      toast.success('Autorización creada exitosamente')
      navigate(`/authorizations/${created.id}`)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      toast.error(axiosError.response?.data?.message ?? 'Error al crear la autorización')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/authorizations')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Nueva autorización" />
      </div>

      <AuthorizationForm onSubmit={handleSubmit} submitLabel="Crear autorización" />
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageBackButton } from '@/components/shared/PageBackButton'
import { useCreateFamilyMember } from '@/hooks/useFamilyMembers'
import { FamilyMemberForm } from './FamilyMemberForm'
import type { FamilyMemberFormValues } from '@/lib/validations/family-member.validations'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function CreateFamilyMemberPage() {
  const navigate = useNavigate()
  const createMutation = useCreateFamilyMember()

  async function handleSubmit(data: FamilyMemberFormValues) {
    try {
      const filtered = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
      )
      await createMutation.mutateAsync(filtered as unknown as Parameters<typeof createMutation.mutateAsync>[0])
      toast.success('Miembro de familia creado exitosamente')
      navigate('/family-members')
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      toast.error(
        axiosError.response?.data?.message ?? 'Error al crear el miembro de familia',
      )
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <PageBackButton
          onClick={() => navigate('/family-members')}
          label="Volver a miembros de familia"
        />
        <PageHeader title="Agregar miembro de familia" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del familiar</CardTitle>
        </CardHeader>
        <CardContent>
          <FamilyMemberForm onSubmit={handleSubmit} submitLabel="Crear miembro" />
        </CardContent>
      </Card>
    </div>
  )
}

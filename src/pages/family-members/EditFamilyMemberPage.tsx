import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useFamilyMember, useUpdateFamilyMember } from '@/hooks/useFamilyMembers'
import { FamilyMemberForm } from './FamilyMemberForm'
import type { FamilyMemberFormValues } from '@/lib/validations/family-member.validations'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function EditFamilyMemberPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: member, isLoading } = useFamilyMember(id!)
  const updateMutation = useUpdateFamilyMember()

  async function handleSubmit(data: FamilyMemberFormValues) {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
      ) as Parameters<typeof updateMutation.mutateAsync>[0]['data']
      await updateMutation.mutateAsync({ id: id!, data: payload })
      toast.success('Miembro de familia actualizado exitosamente')
      navigate(`/family-members/${id}`)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      toast.error(
        axiosError.response?.data?.message ?? 'Error al actualizar el miembro',
      )
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  if (!member) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Miembro no encontrado
      </div>
    )
  }

  const defaultValues: Partial<FamilyMemberFormValues> = {
    fullName: member.fullName,
    relationship: member.relationship,
    documentType: member.documentType ?? '',
    documentNumber: member.documentNumber ?? '',
    birthDate: member.birthDate ?? '',
    epsProviderId: member.epsProviderId ?? '',
    regime: member.regime ?? '',
    address: member.address ?? '',
    phone: member.phone ?? '',
    cellphone: member.cellphone ?? '',
    email: member.email ?? '',
    department: member.department ?? '',
    city: member.city ?? '',
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/family-members/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Editar miembro de familia" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del familiar</CardTitle>
        </CardHeader>
        <CardContent>
          <FamilyMemberForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
          />
        </CardContent>
      </Card>
    </div>
  )
}

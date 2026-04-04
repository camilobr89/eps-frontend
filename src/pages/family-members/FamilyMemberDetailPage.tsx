import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, User, MapPin, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useFamilyMember, useDeleteFamilyMember } from '@/hooks/useFamilyMembers'

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  )
}

export function FamilyMemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: member, isLoading } = useFamilyMember(id!)
  const deleteMutation = useDeleteFamilyMember()
  const [showDelete, setShowDelete] = useState(false)

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id!)
      toast.success('Miembro eliminado exitosamente')
      navigate('/family-members')
    } catch {
      toast.error('Error al eliminar el miembro')
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/family-members')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={member.fullName}
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/family-members/${id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Información personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Nombre completo" value={member.fullName} />
              <div>
                <dt className="text-sm text-muted-foreground">Relación</dt>
                <dd className="mt-0.5">
                  <Badge variant="outline">{member.relationship}</Badge>
                </dd>
              </div>
              <DetailRow label="Tipo de documento" value={member.documentType} />
              <DetailRow label="Número de documento" value={member.documentNumber} />
              <DetailRow label="Fecha de nacimiento" value={member.birthDate} />
              <DetailRow label="Régimen" value={member.regime} />
              {member.epsProvider && (
                <DetailRow label="EPS" value={member.epsProvider.name} />
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Contacto y ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              {member.email && (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">
                    <Mail className="mr-1 inline h-3.5 w-3.5" />
                    Email
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium">{member.email}</dd>
                </div>
              )}
              <DetailRow label="Celular" value={member.cellphone} />
              <DetailRow label="Teléfono fijo" value={member.phone} />
              <DetailRow label="Dirección" value={member.address} />
              <DetailRow label="Departamento" value={member.department} />
              <DetailRow label="Ciudad" value={member.city} />
            </dl>

            {!member.email && !member.cellphone && !member.phone && !member.address && (
              <p className="text-sm text-muted-foreground">
                No hay información de contacto registrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="text-xs text-muted-foreground">
        Creado: {new Date(member.createdAt).toLocaleDateString('es-CO')}
        {member.updatedAt !== member.createdAt && (
          <> · Actualizado: {new Date(member.updatedAt).toLocaleDateString('es-CO')}</>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Eliminar miembro"
        description={`¿Estás seguro de que deseas eliminar a ${member.fullName}? Se eliminarán también sus autorizaciones y citas asociadas.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

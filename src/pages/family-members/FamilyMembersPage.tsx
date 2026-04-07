import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Pagination } from '@/components/shared/Pagination'
import { QueryWrapper } from '@/components/shared/QueryWrapper'
import { useFamilyMembers, useDeleteFamilyMember } from '@/hooks/useFamilyMembers'
import { usePagination } from '@/hooks/usePagination'
import type { FamilyMember } from '@/types'

export function FamilyMembersPage() {
  const navigate = useNavigate()
  const { page, limit, setPage, setLimit } = usePagination()
  const membersQuery = useFamilyMembers({ page, limit })
  const deleteMutation = useDeleteFamilyMember()
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null)

  async function handleDelete() {
    if (!memberToDelete) return
    try {
      await deleteMutation.mutateAsync(memberToDelete.id)
      toast.success(`${memberToDelete.fullName} eliminado exitosamente`)
    } catch {
      toast.error('Error al eliminar el miembro')
    } finally {
      setMemberToDelete(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Miembros de familia"
        action={
          <Button onClick={() => navigate('/family-members/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar miembro
          </Button>
        }
      />

      <QueryWrapper
        query={membersQuery}
        isEmpty={(membersPage) => membersPage.data.length === 0}
        emptyState={
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="Aún no has agregado miembros de tu familia"
            description="Agrega a los miembros de tu familia para gestionar sus autorizaciones y citas"
            action={
              <Button onClick={() => navigate('/family-members/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar primer miembro
              </Button>
            }
          />
        }
        errorTitle="No fue posible cargar los miembros de familia"
      >
        {(membersPage) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {membersPage.data.map((member) => (
                <Card
                  key={member.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => navigate(`/family-members/${member.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold">
                          {member.fullName}
                        </h3>
                        <Badge variant="outline" className="mt-1">
                          {member.relationship}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {member.documentType && member.documentNumber && (
                        <p>{member.documentType}: {member.documentNumber}</p>
                      )}
                      {member.epsProvider && <p>EPS: {member.epsProvider.name}</p>}
                      {member.regime && (
                        <p className="capitalize">Régimen: {member.regime}</p>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/family-members/${member.id}/edit`)
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
                          setMemberToDelete(member)
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

            <Pagination
              page={page}
              limit={limit}
              total={membersPage.meta.total}
              totalPages={membersPage.meta.totalPages}
              hasNextPage={page < membersPage.meta.totalPages}
              hasPreviousPage={page > 1}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        )}
      </QueryWrapper>

      <ConfirmDialog
        open={!!memberToDelete}
        onOpenChange={(open) => !open && setMemberToDelete(null)}
        title="Eliminar miembro"
        description={`¿Estás seguro de que deseas eliminar a ${memberToDelete?.fullName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

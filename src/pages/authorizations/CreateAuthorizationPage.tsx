import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { useCreateAuthorization } from '@/hooks/useAuthorizations'
import { useUploadDocumentAndCreateAuthorization } from '@/hooks/useDocuments'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import { FileUpload } from '@/components/shared/FileUpload'
import { PageBackButton } from '@/components/shared/PageBackButton'
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
  const [creationMode, setCreationMode] = useState<'document' | 'manual'>('document')
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState('')
  const createMutation = useCreateAuthorization()
  const uploadAndCreateMutation = useUploadDocumentAndCreateAuthorization()
  const { data: familyMembersPage, isLoading: isLoadingFamilyMembers } = useFamilyMembers()
  const familyMembers = familyMembersPage?.data ?? []

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

  async function handleUpload(file: File, onProgress: (progress: number) => void) {
    if (!selectedFamilyMemberId) {
      throw new Error('Selecciona un miembro de familia antes de subir el documento.')
    }

    try {
      const created = await uploadAndCreateMutation.mutateAsync({
        familyMemberId: selectedFamilyMemberId,
        file,
        onUploadProgress: onProgress,
      })
      toast.success('Se creó una autorización borrador a partir del documento')
      navigate(`/authorizations/${created.authorization.id}`)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      throw new Error(
        axiosError.response?.data?.message ??
          'Error al subir el documento y crear la autorización',
      )
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <PageBackButton
          onClick={() => navigate('/authorizations')}
          label="Volver a autorizaciones"
        />
        <PageHeader title="Nueva autorización" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={creationMode === 'document' ? 'default' : 'outline'}
          onClick={() => setCreationMode('document')}
        >
          Desde PDF o imagen
        </Button>
        <Button
          type="button"
          variant={creationMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setCreationMode('manual')}
        >
          Manual
        </Button>
      </div>

      {creationMode === 'document' ? (
        <Card>
          <CardHeader>
            <CardTitle>Crear desde documento</CardTitle>
            <CardDescription>
              Sube un PDF o una imagen para crear una autorización borrador y dejar que el OCR
              complete sus datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="uploadFamilyMemberId">Miembro de familia *</Label>
              <Select
                items={familyMembers.map((member) => ({
                  value: member.id,
                  label: member.fullName,
                }))}
                value={selectedFamilyMemberId || null}
                onValueChange={(value) => setSelectedFamilyMemberId(value ?? '')}
              >
                <SelectTrigger
                  id="uploadFamilyMemberId"
                  className="w-full sm:max-w-md"
                  disabled={isLoadingFamilyMembers}
                >
                  <SelectValue
                    placeholder={
                      isLoadingFamilyMembers ? 'Cargando familiares...' : 'Seleccionar familiar'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingFamilyMembers ? (
                    <SelectItem value="__loading__" disabled>
                      Cargando...
                    </SelectItem>
                  ) : familyMembers.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      No hay familiares registrados
                    </SelectItem>
                  ) : (
                    familyMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.fullName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                El documento se asociará a este familiar y se creará una autorización en estado
                borrador para que el OCR llene la información.
              </p>
            </div>

            <FileUpload
              onUpload={handleUpload}
              disabled={!selectedFamilyMemberId || uploadAndCreateMutation.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <AuthorizationForm onSubmit={handleSubmit} submitLabel="Crear autorización" />
      )}
    </div>
  )
}

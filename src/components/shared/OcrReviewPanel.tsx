import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateAuthorization } from '@/hooks/useAuthorizations'
import type { Authorization } from '@/types'

const OCR_FIELDS = [
  { key: 'documentType', label: 'Tipo de documento', multiline: false },
  { key: 'requestNumber', label: 'Número de solicitud', multiline: false },
  { key: 'diagnosisCode', label: 'Código CIE-10', multiline: false },
  { key: 'diagnosisDescription', label: 'Descripción del diagnóstico', multiline: true },
  { key: 'providerName', label: 'Prestador / IPS', multiline: false },
  { key: 'providerNit', label: 'NIT del prestador', multiline: false },
] as const

type EditableFieldKey = (typeof OCR_FIELDS)[number]['key']

type ReviewValues = Record<EditableFieldKey, string> & {
  manuallyReviewed: boolean
}

interface OcrReviewPanelProps {
  authorization: Authorization
  onSaved?: () => void
}

function getInitialValues(authorization: Authorization): ReviewValues {
  return {
    documentType: authorization.documentType ?? '',
    requestNumber: authorization.requestNumber ?? '',
    diagnosisCode: authorization.diagnosisCode ?? '',
    diagnosisDescription: authorization.diagnosisDescription ?? '',
    providerName: authorization.providerName ?? '',
    providerNit: authorization.providerNit ?? '',
    manuallyReviewed: authorization.manuallyReviewed,
  }
}

export function OcrReviewPanel({ authorization, onSaved }: OcrReviewPanelProps) {
  const updateMutation = useUpdateAuthorization()
  const [editingField, setEditingField] = useState<EditableFieldKey | null>(null)
  const [values, setValues] = useState<ReviewValues>(() => getInitialValues(authorization))

  useEffect(() => {
    setValues(getInitialValues(authorization))
    setEditingField(null)
  }, [authorization])

  const visibleFields = useMemo(
    () =>
      OCR_FIELDS.filter((field) => {
        const value = values[field.key]
        return value.trim() !== '' || authorization.ocrRawText
      }),
    [authorization.ocrRawText, values],
  )

  if (!authorization.ocrRawText && authorization.ocrConfidence == null && visibleFields.length === 0) {
    return null
  }

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        id: authorization.id,
        data: {
          documentType: values.documentType,
          requestNumber: values.requestNumber || undefined,
          diagnosisCode: values.diagnosisCode || undefined,
          diagnosisDescription: values.diagnosisDescription || undefined,
          providerName: values.providerName || undefined,
          providerNit: values.providerNit || undefined,
          manuallyReviewed: values.manuallyReviewed,
        },
      })
      toast.success('Correcciones OCR guardadas')
      setEditingField(null)
      onSaved?.()
    } catch {
      toast.error('No fue posible guardar las correcciones OCR')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-4 w-4" />
          Revisión OCR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay campos OCR identificados para revisar.
          </p>
        ) : (
          <div className="space-y-4">
            {visibleFields.map((field) => {
              const isEditing = editingField === field.key
              const confidence = authorization.ocrConfidence ?? 0
              const confidencePercent = Math.max(0, Math.min(100, confidence))

              return (
                <div key={field.key} className="rounded-xl border border-border/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Label className="text-sm font-medium">{field.label}</Label>
                      {!isEditing && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {values[field.key] || 'Sin valor extraído'}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingField(isEditing ? null : field.key)}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      {isEditing ? 'Cerrar' : 'Editar'}
                    </Button>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Confianza OCR</span>
                      <span>{confidencePercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-[width]"
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-3">
                      {field.multiline ? (
                        <Textarea
                          value={values[field.key]}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          rows={3}
                        />
                      ) : (
                        <Input
                          value={values[field.key]}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.manuallyReviewed}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                manuallyReviewed: event.target.checked,
              }))
            }
          />
          Marcar como revisado manualmente
        </label>

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aplicar correcciones
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

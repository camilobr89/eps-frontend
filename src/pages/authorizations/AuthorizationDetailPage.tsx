import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  FileText,
  Stethoscope,
  Building2,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAuthorization, useDeleteAuthorization } from '@/hooks/useAuthorizations'
import type { Priority } from '@/types'

const PRIORITY_LABELS: Record<Priority, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  normal: 'Normal',
  baja: 'Baja',
}

const PRIORITY_CLASSES: Record<Priority, string> = {
  urgente: 'bg-red-100 text-red-800',
  alta: 'bg-orange-100 text-orange-800',
  normal: 'bg-blue-100 text-blue-800',
  baja: 'bg-gray-100 text-gray-800',
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-CO')
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{String(value)}</dd>
    </div>
  )
}

export function AuthorizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: auth, isLoading } = useAuthorization(id!)
  const deleteMutation = useDeleteAuthorization()
  const [showDelete, setShowDelete] = useState(false)
  const [ocrExpanded, setOcrExpanded] = useState(false)

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id!)
      toast.success('Autorización eliminada exitosamente')
      navigate('/authorizations')
    } catch {
      toast.error('Error al eliminar la autorización')
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

  const hasProviderInfo =
    auth.providerName || auth.providerNit || auth.providerAddress || auth.providerPhone
  const hasDiagnosisInfo =
    auth.diagnosisCode || auth.diagnosisDescription || auth.patientLocation || auth.serviceOrigin
  const hasPaymentInfo =
    auth.paymentType || auth.copayValue != null || auth.maxValue != null || auth.weeksContributed != null
  const hasOcrInfo = auth.ocrParserUsed || auth.ocrRawText

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/authorizations')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={auth.requestNumber ? `N° ${auth.requestNumber}` : 'Autorización'}
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/appointments/new?authorizationId=${auth.id}`)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Agendar cita
              </Button>
              <Button variant="outline" onClick={() => navigate(`/authorizations/${id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={() => setShowDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          }
        />
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Información general
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge status={auth.status} />
            <Badge
              variant="outline"
              className={`border-transparent font-medium ${PRIORITY_CLASSES[auth.priority]}`}
            >
              {PRIORITY_LABELS[auth.priority]}
            </Badge>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="Tipo de documento" value={auth.documentType} />
            <DetailRow label="Número de solicitud" value={auth.requestNumber} />
            <DetailRow label="Fecha de emisión" value={formatDate(auth.issuingDate)} />
            <DetailRow label="Fecha de vencimiento" value={formatDate(auth.expirationDate)} />
            {auth.familyMember && (
              <DetailRow label="Miembro de familia" value={auth.familyMember.fullName} />
            )}
          </dl>
          {auth.notes && (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground">Notas</dt>
              <dd className="mt-0.5 text-sm">{auth.notes}</dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      {hasDiagnosisInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4" />
              Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Código CIE-10" value={auth.diagnosisCode} />
              <div className="sm:col-span-2">
                <DetailRow label="Descripción" value={auth.diagnosisDescription} />
              </div>
              <DetailRow label="Ubicación del paciente" value={auth.patientLocation} />
              <DetailRow label="Origen del servicio" value={auth.serviceOrigin} />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Prestador */}
      {hasProviderInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Prestador / IPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <DetailRow label="Nombre" value={auth.providerName} />
              </div>
              <DetailRow label="NIT" value={auth.providerNit} />
              <DetailRow label="Código" value={auth.providerCode} />
              <div className="sm:col-span-2">
                <DetailRow label="Dirección" value={auth.providerAddress} />
              </div>
              <DetailRow label="Teléfono" value={auth.providerPhone} />
              <DetailRow label="Departamento" value={auth.providerDepartment} />
              <DetailRow label="Ciudad" value={auth.providerCity} />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Pagos */}
      {hasPaymentInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Pagos compartidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Tipo de recaudo" value={auth.paymentType} />
              <DetailRow label="Valor del copago" value={formatCurrency(auth.copayValue)} />
              <DetailRow
                label="Porcentaje de copago"
                value={auth.copayPercentage != null ? `${auth.copayPercentage}%` : null}
              />
              <DetailRow label="Valor máximo" value={formatCurrency(auth.maxValue)} />
              <DetailRow
                label="Semanas cotizadas"
                value={auth.weeksContributed != null ? String(auth.weeksContributed) : null}
              />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Servicios */}
      {auth.services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Servicios direccionados ({auth.services.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auth.services.map((svc, idx) => (
                <div key={svc.id}>
                  {idx > 0 && <Separator className="mb-3" />}
                  <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailRow label="Código CUPS" value={svc.serviceCode} />
                    <DetailRow label="Nombre" value={svc.serviceName} />
                    <DetailRow label="Cantidad" value={String(svc.quantity)} />
                    {svc.serviceType && (
                      <DetailRow label="Tipo" value={svc.serviceType} />
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* OCR */}
      {hasOcrInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Metadatos OCR</CardTitle>
              {auth.manuallyReviewed && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-transparent">
                  Revisada manualmente
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Parser usado" value={auth.ocrParserUsed} />
              <DetailRow
                label="Confianza OCR"
                value={auth.ocrConfidence != null ? `${auth.ocrConfidence}%` : null}
              />
            </dl>
            {auth.ocrRawText && (
              <div className="mt-4">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setOcrExpanded((v) => !v)}
                >
                  {ocrExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {ocrExpanded ? 'Ocultar' : 'Ver'} texto OCR
                </button>
                {ocrExpanded && (
                  <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {auth.ocrRawText}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />
      <div className="text-xs text-muted-foreground">
        Creado: {new Date(auth.createdAt).toLocaleDateString('es-CO')}
        {auth.updatedAt !== auth.createdAt && (
          <> · Actualizado: {new Date(auth.updatedAt).toLocaleDateString('es-CO')}</>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Eliminar autorización"
        description="¿Estás seguro de que deseas eliminar esta autorización? Se eliminarán también las citas asociadas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

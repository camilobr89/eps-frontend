import { useEffect, useRef, useState } from 'react'
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
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  UploadCloud,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileUpload } from '@/components/shared/FileUpload'
import { OcrReviewPanel } from '@/components/shared/OcrReviewPanel'
import { useAuthorization, useDeleteAuthorization } from '@/hooks/useAuthorizations'
import {
  useDocumentDownloadUrl as getDocumentDownloadUrl,
  useOcrStatus,
  useUploadDocument,
} from '@/hooks/useDocuments'
import type { AuthorizationDocument, Priority } from '@/types'
import type { DocumentUploadResponse } from '@/services/documents.service'

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

function formatFileSize(value: number | null | undefined): string {
  if (value == null) return '—'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function normalizeDocument(
  document: Partial<AuthorizationDocument> | DocumentUploadResponse,
  authorizationId: string,
): AuthorizationDocument {
  return {
    id: document.id ?? crypto.randomUUID(),
    authorizationId: document.authorizationId ?? authorizationId,
    fileName: document.fileName ?? 'Documento sin nombre',
    fileSize: document.fileSize ?? 0,
    mimeType: document.mimeType ?? null,
    fileUrl: 'fileUrl' in document ? document.fileUrl ?? null : null,
    ocrStatus: document.ocrStatus ?? 'pending',
    ocrError: 'ocrError' in document ? document.ocrError ?? null : null,
    ocrCompletedAt: 'ocrCompletedAt' in document ? document.ocrCompletedAt ?? null : null,
    createdAt: document.createdAt ?? new Date().toISOString(),
    updatedAt: 'updatedAt' in document ? document.updatedAt : undefined,
  }
}

function getDocumentStatusMeta(status: AuthorizationDocument['ocrStatus']) {
  switch (status) {
    case 'processing':
      return {
        label: 'Procesando OCR...',
        icon: Loader2,
        className: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/15',
        spin: true,
      }
    case 'completed':
      return {
        label: 'OCR completado',
        icon: CheckCircle2,
        className: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-500/15',
        spin: false,
      }
    case 'failed':
      return {
        label: 'Error en OCR',
        icon: AlertCircle,
        className: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-500/15',
        spin: false,
      }
    default:
      return {
        label: 'En cola...',
        icon: Clock3,
        className: 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/15',
        spin: false,
      }
  }
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

function AuthorizationDocumentItem({
  authorizationId,
  document,
}: {
  authorizationId: string
  document: AuthorizationDocument
}) {
  const queryClient = useQueryClient()
  const previousStatusRef = useRef(document.ocrStatus)
  const [isDownloading, setIsDownloading] = useState(false)
  const { data: ocrStatus } = useOcrStatus(document.id)

  const currentStatus = ocrStatus?.ocrStatus ?? document.ocrStatus
  const currentError = ocrStatus?.ocrError ?? document.ocrError
  const statusMeta = getDocumentStatusMeta(currentStatus)
  const StatusIcon = statusMeta.icon

  useEffect(() => {
    if (currentStatus === 'completed' && previousStatusRef.current !== 'completed') {
      queryClient.invalidateQueries({ queryKey: ['authorizations', authorizationId] })
      queryClient.invalidateQueries({ queryKey: ['authorizations'] })
    }
    previousStatusRef.current = currentStatus
  }, [authorizationId, currentStatus, queryClient])

  async function handleDownload() {
    try {
      setIsDownloading(true)
      const { url } = await getDocumentDownloadUrl(document.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('No fue posible obtener la URL de descarga')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-medium">{document.fileName}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(document.fileSize)} · Subido el {formatDate(document.createdAt)}
          </p>
          {document.mimeType && (
            <p className="text-xs text-muted-foreground">{document.mimeType}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
          >
            <StatusIcon className={`h-3.5 w-3.5 ${statusMeta.spin ? 'animate-spin' : ''}`} />
            {statusMeta.label}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-2 h-3.5 w-3.5" />
            )}
            Descargar
          </Button>
        </div>
      </div>
      {currentStatus === 'failed' && currentError && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{currentError}</p>
      )}
    </div>
  )
}

export function AuthorizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: auth, isLoading } = useAuthorization(id!)
  const deleteMutation = useDeleteAuthorization()
  const uploadMutation = useUploadDocument()
  const [showDelete, setShowDelete] = useState(false)
  const [ocrExpanded, setOcrExpanded] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<AuthorizationDocument[]>([])

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id!)
      toast.success('Autorización eliminada exitosamente')
      navigate('/authorizations')
    } catch {
      toast.error('Error al eliminar la autorización')
    }
  }

  async function handleUpload(file: File, onProgress: (progress: number) => void) {
    if (!auth) return

    const uploaded = await uploadMutation.mutateAsync({
      authorizationId: auth.id,
      file,
      onUploadProgress: onProgress,
    })

    setUploadedDocuments((current) => {
      const next = [normalizeDocument(uploaded, auth.id), ...current]
      return next.filter(
        (document, index, array) =>
          array.findIndex((candidate) => candidate.id === document.id) === index,
      )
    })
    setShowUploader(false)
    toast.success('Documento subido exitosamente')
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
  const services = auth.services ?? []
  const serverDocuments = (auth.documents ?? []).map((document) =>
    normalizeDocument(document, auth.id),
  )

  const documents = [...uploadedDocuments, ...serverDocuments].filter(
    (document, index, array) =>
      array.findIndex((candidate) => candidate.id === document.id) === index,
  )
  const isPendingOcrDraft =
    auth.documentType === 'pendiente_ocr' &&
    documents.length > 0 &&
    !hasOcrInfo

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
      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Servicios direccionados ({services.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((svc, idx) => (
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

      {isPendingOcrDraft && (
        <Alert>
          <AlertDescription>
            El documento ya fue cargado y esta autorización está siendo completada por OCR.
            No necesitas volver a subir el archivo. Cuando el procesamiento termine, los datos
            extraídos aparecerán aquí automáticamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Documentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UploadCloud className="h-4 w-4" />
              Documentos
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUploader((current) => !current)}
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              {showUploader ? 'Ocultar upload' : 'Subir documento'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showUploader && (
            <FileUpload
              onUpload={handleUpload}
              disabled={uploadMutation.isPending}
            />
          )}

          {documents.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="Sin documentos"
              description="Todavía no hay documentos asociados a esta autorización."
            />
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <AuthorizationDocumentItem
                  key={document.id}
                  authorizationId={auth.id}
                  document={document}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

      {hasOcrInfo && (
        <OcrReviewPanel authorization={auth} />
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

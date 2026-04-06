import { useId, useRef, useState, type DragEvent } from 'react'
import { AlertCircle, FileText, Loader2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Tipo no permitido. Usa PDF, JPG, JPEG o PNG.'
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'El archivo supera el tamaño máximo permitido de 10 MB.'
  }

  return null
}

interface FileUploadProps {
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<void>
  disabled?: boolean
}

export function FileUpload({ onUpload, disabled = false }: FileUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  function handleFile(file: File | null) {
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setSelectedFile(null)
      setError(validationError)
      return
    }

    setSelectedFile(file)
    setError(null)
    setProgress(0)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return

    handleFile(event.dataTransfer.files[0] ?? null)
  }

  async function handleUpload() {
    if (!selectedFile || disabled || isUploading) return

    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      await onUpload(selectedFile, setProgress)
      setSelectedFile(null)
      setProgress(0)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'No fue posible subir el archivo.',
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        disabled={disabled || isUploading}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled && !isUploading) {
            setIsDragging(true)
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-6 transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Arrastra tu archivo aquí</p>
            <p className="text-sm text-muted-foreground">
              PDF, JPG, JPEG o PNG. Máximo 10 MB.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            Seleccionar archivo
          </Button>
        </div>
      </div>

      {selectedFile && (
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedFile.type || 'Tipo desconocido'} · {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Subiendo... {progress}%</p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={disabled || isUploading}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subir documento
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSelectedFile(null)
                setError(null)
                setProgress(0)
                if (inputRef.current) {
                  inputRef.current.value = ''
                }
              }}
              disabled={isUploading}
            >
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

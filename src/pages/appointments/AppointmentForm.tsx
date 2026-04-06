import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import { authorizationsService } from '@/services/authorizations.service'
import {
  appointmentSchema,
  type AppointmentFormValues,
} from '@/lib/validations/appointment.validations'

function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function toSelectValue(val: string | undefined | null): string | null {
  return val || null
}

interface AppointmentFormProps {
  defaultValues?: Partial<AppointmentFormValues>
  onSubmit: (data: AppointmentFormValues) => Promise<void>
  submitLabel?: string
}

export function AppointmentForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Guardar',
}: AppointmentFormProps) {
  const hasInitializedFamilyMember = useRef(false)
  const hasInitializedAuthorization = useRef(false)
  const { data: familyMembersPage, isLoading: isLoadingFamilyMembers } = useFamilyMembers()
  const familyMembers = familyMembersPage?.data ?? []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      familyMemberId: '',
      authorizationId: '',
      authorizationServiceId: '',
      appointmentDate: defaultValues?.appointmentDate
        ? toDatetimeLocal(defaultValues.appointmentDate)
        : '',
      location: '',
      doctorName: '',
      specialty: '',
      notes: '',
      ...defaultValues,
      // appointmentDate already handled above
    },
  })

  const familyMemberId = watch('familyMemberId')
  const authorizationId = watch('authorizationId')

  // Fetch authorizations for selected family member (only pending ones)
  const { data: authsPage } = useQuery({
    queryKey: ['authorizations', { familyMemberId, status: 'pending' }],
    queryFn: () =>
      authorizationsService.getAll({ familyMemberId, status: 'pending' as const }),
    enabled: !!familyMemberId,
  })
  const authorizations = authsPage?.data ?? []

  // Find selected authorization to get its services
  const selectedAuth = authorizations.find((a) => a.id === authorizationId)
  const authServices = selectedAuth?.services ?? []

  // Reset authorization and service when family member changes
  useEffect(() => {
    if (!hasInitializedFamilyMember.current) {
      hasInitializedFamilyMember.current = true
      return
    }
    setValue('authorizationId', '')
    setValue('authorizationServiceId', '')
  }, [familyMemberId, setValue])

  // Reset service when authorization changes
  useEffect(() => {
    if (!hasInitializedAuthorization.current) {
      hasInitializedAuthorization.current = true
      return
    }
    setValue('authorizationServiceId', '')
  }, [authorizationId, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información de la cita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Miembro de familia */}
            <div className="space-y-2">
              <Label htmlFor="familyMemberId">Miembro de familia *</Label>
              <Select
                items={familyMembers.map((m) => ({ value: m.id, label: m.fullName }))}
                value={toSelectValue(familyMemberId)}
                onValueChange={(val) =>
                  setValue('familyMemberId', val ?? '', { shouldValidate: true })
                }
              >
                <SelectTrigger
                  id="familyMemberId"
                  className="w-full"
                  aria-invalid={!!errors.familyMemberId}
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
                    familyMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.fullName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.familyMemberId && (
                <p className="text-sm text-destructive">{errors.familyMemberId.message}</p>
              )}
            </div>

            {/* Autorización (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="authorizationId">Autorización (opcional)</Label>
              <Select
                items={authorizations.map((a) => ({
                  value: a.id,
                  label: a.requestNumber
                    ? `N° ${a.requestNumber}`
                    : a.documentType,
                }))}
                value={toSelectValue(authorizationId)}
                onValueChange={(val) => setValue('authorizationId', val ?? '')}
                disabled={!familyMemberId}
              >
                <SelectTrigger id="authorizationId" className="w-full">
                  <SelectValue
                    placeholder={
                      !familyMemberId
                        ? 'Primero selecciona un familiar'
                        : authorizations.length === 0
                          ? 'Sin autorizaciones pendientes'
                          : 'Seleccionar autorización'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin autorización</SelectItem>
                  {authorizations.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.requestNumber ? `N° ${a.requestNumber}` : a.documentType}
                      {a.diagnosisDescription ? ` — ${a.diagnosisDescription}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Servicio de la autorización (opcional) */}
            {authorizationId && authServices.length > 0 && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="authorizationServiceId">Servicio de la autorización (opcional)</Label>
                <Select
                  items={authServices.map((s) => ({
                    value: s.id,
                    label: `${s.serviceCode} — ${s.serviceName}`,
                  }))}
                  value={toSelectValue(watch('authorizationServiceId'))}
                  onValueChange={(val) => setValue('authorizationServiceId', val ?? '')}
                >
                  <SelectTrigger id="authorizationServiceId" className="w-full">
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin servicio específico</SelectItem>
                    {authServices.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.serviceCode} — {s.serviceName}
                        {s.quantity > 1 ? ` (x${s.quantity})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Fecha y hora */}
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Fecha y hora *</Label>
              <Input
                id="appointmentDate"
                type="datetime-local"
                aria-invalid={!!errors.appointmentDate}
                {...register('appointmentDate')}
              />
              {errors.appointmentDate && (
                <p className="text-sm text-destructive">{errors.appointmentDate.message}</p>
              )}
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                placeholder="Cardiología"
                {...register('specialty')}
              />
            </div>

            {/* Nombre del doctor */}
            <div className="space-y-2">
              <Label htmlFor="doctorName">Nombre del médico</Label>
              <Input
                id="doctorName"
                placeholder="Dr. Juan Pérez"
                {...register('doctorName')}
              />
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                placeholder="Hospital Central, Piso 2"
                {...register('location')}
              />
            </div>

            {/* Notas */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Instrucciones previas, documentos requeridos..."
                rows={3}
                {...register('notes')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

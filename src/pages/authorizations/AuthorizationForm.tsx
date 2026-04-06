import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { useFamilyMembers } from '@/hooks/useFamilyMembers'
import { useEpsProviders } from '@/hooks/useEpsProviders'
import {
  authorizationSchema,
  type AuthorizationFormValues,
} from '@/lib/validations/authorization.validations'

const DOCUMENT_TYPES = [
  { value: 'Carta de Autorización', label: 'Carta de Autorización' },
  { value: 'Orden de Direccionamiento', label: 'Orden de Direccionamiento' },
  { value: 'Orden Médica', label: 'Orden Médica' },
  { value: 'Remisión', label: 'Remisión' },
  { value: 'Otro', label: 'Otro' },
]

const PRIORITIES = [
  { value: 'urgente', label: 'Urgente' },
  { value: 'alta', label: 'Alta' },
  { value: 'normal', label: 'Normal' },
  { value: 'baja', label: 'Baja' },
]

function toSelectValue(val: string | undefined | null): string | null {
  return val || null
}

interface AuthorizationFormProps {
  defaultValues?: Partial<AuthorizationFormValues>
  onSubmit: (data: AuthorizationFormValues) => Promise<void>
  submitLabel?: string
}

export function AuthorizationForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Guardar',
}: AuthorizationFormProps) {
  const { data: familyMembersData, isLoading: isLoadingFamilyMembers } = useFamilyMembers()
  const { data: epsProviders = [] } = useEpsProviders()
  const familyMembers = familyMembersData?.items ?? []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      familyMemberId: '',
      epsProviderId: '',
      documentType: '',
      requestNumber: '',
      issuingDate: '',
      expirationDate: '',
      notes: '',
      diagnosisCode: '',
      diagnosisDescription: '',
      patientLocation: '',
      serviceOrigin: '',
      providerName: '',
      providerNit: '',
      providerCode: '',
      providerAddress: '',
      providerPhone: '',
      providerDepartment: '',
      providerCity: '',
      paymentType: '',
      services: [],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'services' })

  const familyMemberId = watch('familyMemberId')
  const epsProviderId = watch('epsProviderId')
  const documentType = watch('documentType')
  const priority = watch('priority')

  // Auto-fill EPS when a family member is selected (only if EPS isn't already set)
  useEffect(() => {
    if (!familyMemberId) return
    const member = familyMembers.find((m) => m.id === familyMemberId)
    if (member?.epsProviderId) {
      setValue('epsProviderId', member.epsProviderId)
    }
  }, [familyMemberId, familyMembers, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sección 1 — General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="familyMemberId">Miembro de familia *</Label>
              <Select
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

            <div className="space-y-2">
              <Label htmlFor="epsProviderId">EPS</Label>
              <Select
                value={toSelectValue(epsProviderId)}
                onValueChange={(val) => setValue('epsProviderId', val ?? '')}
              >
                <SelectTrigger id="epsProviderId" className="w-full">
                  <SelectValue placeholder="Seleccionar EPS" />
                </SelectTrigger>
                <SelectContent>
                  {epsProviders
                    .filter((eps) => eps.isActive !== false)
                    .map((eps) => (
                      <SelectItem key={eps.id} value={eps.id}>
                        {eps.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de documento *</Label>
              <Select
                value={toSelectValue(documentType)}
                onValueChange={(val) =>
                  setValue('documentType', val ?? '', { shouldValidate: true })
                }
              >
                <SelectTrigger
                  id="documentType"
                  className="w-full"
                  aria-invalid={!!errors.documentType}
                >
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-sm text-destructive">{errors.documentType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestNumber">Número de solicitud</Label>
              <Input
                id="requestNumber"
                placeholder="AUTH-2024-001"
                {...register('requestNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuingDate">Fecha de emisión</Label>
              <Input id="issuingDate" type="date" {...register('issuingDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Fecha de vencimiento</Label>
              <Input id="expirationDate" type="date" {...register('expirationDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={toSelectValue(priority)}
                onValueChange={(val) =>
                  setValue('priority', val as AuthorizationFormValues['priority'])
                }
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones adicionales..."
                rows={2}
                {...register('notes')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 2 — Diagnóstico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="diagnosisCode">Código CIE-10</Label>
              <Input
                id="diagnosisCode"
                placeholder="E11.9"
                {...register('diagnosisCode')}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="diagnosisDescription">Descripción del diagnóstico</Label>
              <Input
                id="diagnosisDescription"
                placeholder="Diabetes mellitus tipo 2 sin complicaciones"
                {...register('diagnosisDescription')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientLocation">Ubicación del paciente</Label>
              <Input
                id="patientLocation"
                placeholder="Hospitalización"
                {...register('patientLocation')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceOrigin">Origen del servicio</Label>
              <Input
                id="serviceOrigin"
                placeholder="Remisión médica"
                {...register('serviceOrigin')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 3 — Prestador / IPS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prestador / IPS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="providerName">Nombre del prestador</Label>
              <Input
                id="providerName"
                placeholder="Hospital Central"
                {...register('providerName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerNit">NIT</Label>
              <Input
                id="providerNit"
                placeholder="901234567-8"
                {...register('providerNit')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerCode">Código</Label>
              <Input
                id="providerCode"
                placeholder="PROV001"
                {...register('providerCode')}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="providerAddress">Dirección</Label>
              <Input
                id="providerAddress"
                placeholder="Calle 123 #45-67"
                {...register('providerAddress')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerPhone">Teléfono</Label>
              <Input
                id="providerPhone"
                placeholder="+573001234567"
                {...register('providerPhone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerDepartment">Departamento</Label>
              <Input
                id="providerDepartment"
                placeholder="Antioquia"
                {...register('providerDepartment')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerCity">Ciudad</Label>
              <Input
                id="providerCity"
                placeholder="Medellín"
                {...register('providerCity')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 4 — Pagos compartidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagos compartidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Tipo de recaudo</Label>
              <Input
                id="paymentType"
                placeholder="Copago"
                {...register('paymentType')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copayValue">Valor del copago</Label>
              <Input
                id="copayValue"
                type="number"
                min={0}
                placeholder="50000"
                {...register('copayValue', { setValueAs: (v) => (v === '' ? undefined : parseFloat(v)) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copayPercentage">Porcentaje de copago (%)</Label>
              <Input
                id="copayPercentage"
                type="number"
                min={0}
                max={100}
                placeholder="10"
                {...register('copayPercentage', { setValueAs: (v) => (v === '' ? undefined : parseFloat(v)) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxValue">Valor máximo autorizado</Label>
              <Input
                id="maxValue"
                type="number"
                min={0}
                placeholder="1000000"
                {...register('maxValue', { setValueAs: (v) => (v === '' ? undefined : parseFloat(v)) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeksContributed">Semanas cotizadas</Label>
              <Input
                id="weeksContributed"
                type="number"
                min={0}
                placeholder="52"
                {...register('weeksContributed', { setValueAs: (v) => (v === '' ? undefined : parseInt(v, 10)) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 5 — Servicios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Servicios direccionados</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ serviceCode: '', serviceName: '', quantity: 1, serviceType: '' })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Agregar servicio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay servicios agregados. Haz clic en "Agregar servicio" para incluir uno.
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`services.${index}.serviceCode`}>
                        Código CUPS *
                      </Label>
                      <Input
                        id={`services.${index}.serviceCode`}
                        placeholder="CONSULTA"
                        {...register(`services.${index}.serviceCode`)}
                        aria-invalid={!!errors.services?.[index]?.serviceCode}
                      />
                      {errors.services?.[index]?.serviceCode && (
                        <p className="text-xs text-destructive">
                          {errors.services[index].serviceCode.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`services.${index}.serviceName`}>
                        Nombre del servicio *
                      </Label>
                      <Input
                        id={`services.${index}.serviceName`}
                        placeholder="Consulta médica general"
                        {...register(`services.${index}.serviceName`)}
                        aria-invalid={!!errors.services?.[index]?.serviceName}
                      />
                      {errors.services?.[index]?.serviceName && (
                        <p className="text-xs text-destructive">
                          {errors.services[index].serviceName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`services.${index}.quantity`}>Cantidad</Label>
                      <Input
                        id={`services.${index}.quantity`}
                        type="number"
                        min={1}
                        defaultValue={1}
                        {...register(`services.${index}.quantity`, { setValueAs: (v) => (v === '' ? 1 : parseInt(v, 10)) })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`services.${index}.serviceType`}>
                        Tipo de servicio
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`services.${index}.serviceType`}
                          placeholder="Consulta"
                          {...register(`services.${index}.serviceType`)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

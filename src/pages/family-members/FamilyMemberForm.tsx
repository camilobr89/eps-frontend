import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEpsProviders } from '@/hooks/useEpsProviders'
import {
  familyMemberSchema,
  type FamilyMemberFormValues,
} from '@/lib/validations/family-member.validations'

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
]

const RELATIONSHIPS = [
  { value: 'Titular', label: 'Titular' },
  { value: 'Cónyuge', label: 'Cónyuge' },
  { value: 'Hijo', label: 'Hijo/a' },
  { value: 'Padre', label: 'Padre/Madre' },
]

const REGIMES = [
  { value: 'contributivo', label: 'Contributivo' },
  { value: 'subsidiado', label: 'Subsidiado' },
]

function toSelectValue(val: string | undefined): string | null {
  return val || null
}

interface FamilyMemberFormProps {
  defaultValues?: Partial<FamilyMemberFormValues>
  onSubmit: (data: FamilyMemberFormValues) => Promise<void>
  submitLabel?: string
}

export function FamilyMemberForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Guardar',
}: FamilyMemberFormProps) {
  const { data: epsProviders = [] } = useEpsProviders()
  const relationshipOptions = RELATIONSHIPS.map((relationship) => ({
    value: relationship.value,
    label: relationship.label,
  }))
  const documentTypeOptions = DOCUMENT_TYPES.map((documentType) => ({
    value: documentType.value,
    label: documentType.label,
  }))
  const epsProviderOptions = epsProviders
    .filter((provider) => provider.isActive !== false)
    .map((provider) => ({
      value: provider.id,
      label: provider.name,
    }))
  const regimeOptions = REGIMES.map((regime) => ({
    value: regime.value,
    label: regime.label,
  }))

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FamilyMemberFormValues>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      fullName: '',
      relationship: '',
      documentType: '',
      documentNumber: '',
      birthDate: '',
      epsProviderId: '',
      regime: '',
      address: '',
      phone: '',
      cellphone: '',
      email: '',
      department: '',
      city: '',
      ...defaultValues,
    },
  })

  const documentType = useWatch({ control, name: 'documentType' })
  const relationship = useWatch({ control, name: 'relationship' })
  const epsProviderId = useWatch({ control, name: 'epsProviderId' })
  const regime = useWatch({ control, name: 'regime' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Nombre completo *</Label>
          <Input
            id="fullName"
            placeholder="Juan Pérez"
            {...register('fullName')}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship">Relación *</Label>
          <Select
            items={relationshipOptions}
            value={toSelectValue(relationship)}
            onValueChange={(val) => setValue('relationship', val ?? '', { shouldValidate: true })}
          >
            <SelectTrigger id="relationship" className="w-full" aria-invalid={!!errors.relationship}>
              <SelectValue placeholder="Seleccionar relación" />
            </SelectTrigger>
            <SelectContent>
              {relationshipOptions.map((relationshipOption) => (
                <SelectItem key={relationshipOption.value} value={relationshipOption.value}>
                  {relationshipOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.relationship && (
            <p className="text-sm text-destructive">{errors.relationship.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentType">Tipo de documento</Label>
          <Select
            items={documentTypeOptions}
            value={toSelectValue(documentType)}
            onValueChange={(val) => setValue('documentType', val ?? '')}
          >
            <SelectTrigger id="documentType" className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {documentTypeOptions.map((documentTypeOption) => (
                <SelectItem key={documentTypeOption.value} value={documentTypeOption.value}>
                  {documentTypeOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentNumber">Número de documento</Label>
          <Input
            id="documentNumber"
            placeholder="1234567890"
            {...register('documentNumber')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Fecha de nacimiento</Label>
          <Input id="birthDate" type="date" {...register('birthDate')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="epsProviderId">EPS</Label>
          <Select
            items={epsProviderOptions}
            value={toSelectValue(epsProviderId)}
            onValueChange={(val) => setValue('epsProviderId', val ?? '')}
          >
            <SelectTrigger id="epsProviderId" className="w-full">
              <SelectValue placeholder="Seleccionar EPS" />
            </SelectTrigger>
            <SelectContent>
              {epsProviderOptions.map((eps) => (
                <SelectItem key={eps.value} value={eps.value}>
                  {eps.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="regime">Régimen</Label>
          <Select
            items={regimeOptions}
            value={toSelectValue(regime)}
            onValueChange={(val) => setValue('regime', val ?? '')}
          >
            <SelectTrigger id="regime" className="w-full">
              <SelectValue placeholder="Seleccionar régimen" />
            </SelectTrigger>
            <SelectContent>
              {regimeOptions.map((regimeOption) => (
                <SelectItem key={regimeOption.value} value={regimeOption.value}>
                  {regimeOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="juan@email.com"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cellphone">Celular</Label>
          <Input
            id="cellphone"
            placeholder="3001234567"
            {...register('cellphone')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono fijo</Label>
          <Input
            id="phone"
            placeholder="6012345678"
            {...register('phone')}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            placeholder="Calle 123 #45-67"
            {...register('address')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Departamento</Label>
          <Input
            id="department"
            placeholder="Antioquia"
            {...register('department')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            placeholder="Medellín"
            {...register('city')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

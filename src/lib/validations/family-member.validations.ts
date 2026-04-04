import { z } from 'zod'

export const familyMemberSchema = z.object({
  fullName: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  relationship: z.string().min(1, 'La relación es obligatoria'),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  birthDate: z.string().optional(),
  epsProviderId: z.string().optional(),
  regime: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  cellphone: z.string().optional(),
  email: z
    .string()
    .email('Ingresa un email válido')
    .or(z.literal(''))
    .optional(),
  department: z.string().optional(),
  city: z.string().optional(),
})

export type FamilyMemberFormValues = z.infer<typeof familyMemberSchema>

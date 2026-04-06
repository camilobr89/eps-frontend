import { z } from 'zod'

const serviceSchema = z.object({
  serviceCode: z.string().min(1, 'El código del servicio es obligatorio'),
  serviceName: z.string().min(1, 'El nombre del servicio es obligatorio'),
  quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
  serviceType: z.string().optional(),
})

export const authorizationSchema = z.object({
  // General
  familyMemberId: z.string().min(1, 'El miembro de familia es obligatorio'),
  epsProviderId: z.string().optional(),
  documentType: z.string().min(1, 'El tipo de documento es obligatorio'),
  requestNumber: z.string().optional(),
  issuingDate: z.string().optional(),
  expirationDate: z.string().optional(),
  priority: z.enum(['urgente', 'alta', 'normal', 'baja']).optional(),
  notes: z.string().optional(),
  // Diagnóstico
  diagnosisCode: z.string().optional(),
  diagnosisDescription: z.string().optional(),
  patientLocation: z.string().optional(),
  serviceOrigin: z.string().optional(),
  // Prestador
  providerName: z.string().optional(),
  providerNit: z.string().optional(),
  providerCode: z.string().optional(),
  providerAddress: z.string().optional(),
  providerPhone: z.string().optional(),
  providerDepartment: z.string().optional(),
  providerCity: z.string().optional(),
  // Pagos
  paymentType: z.string().optional(),
  copayValue: z.number().optional(),
  copayPercentage: z.number().optional(),
  maxValue: z.number().optional(),
  weeksContributed: z.number().optional(),
  // Servicios
  services: z.array(serviceSchema).optional(),
})

export type AuthorizationFormValues = z.infer<typeof authorizationSchema>

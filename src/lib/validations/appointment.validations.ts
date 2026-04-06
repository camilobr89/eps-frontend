import { z } from 'zod'

export const appointmentSchema = z.object({
  familyMemberId: z.string().min(1, 'El miembro de familia es obligatorio'),
  authorizationId: z.string().optional(),
  authorizationServiceId: z.string().optional(),
  appointmentDate: z.string().min(1, 'La fecha y hora de la cita es obligatoria'),
  location: z.string().optional(),
  doctorName: z.string().optional(),
  specialty: z.string().optional(),
  notes: z.string().optional(),
})

export type AppointmentFormValues = z.infer<typeof appointmentSchema>

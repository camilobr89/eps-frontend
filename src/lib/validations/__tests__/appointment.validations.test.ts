import { describe, it, expect } from 'vitest'
import { appointmentSchema } from '../appointment.validations'

describe('appointmentSchema', () => {
  const validData = {
    familyMemberId: 'member-1',
    appointmentDate: '2026-04-10T09:30',
  }

  it('should pass with minimum required fields', () => {
    const result = appointmentSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should pass with all fields filled', () => {
    const result = appointmentSchema.safeParse({
      ...validData,
      authorizationId: 'auth-1',
      authorizationServiceId: 'service-1',
      location: 'Clinica Central',
      doctorName: 'Dra. Ana Torres',
      specialty: 'Cardiologia',
      notes: 'Llegar 15 minutos antes',
    })

    expect(result.success).toBe(true)
  })

  it('should fail with empty familyMemberId', () => {
    const result = appointmentSchema.safeParse({
      ...validData,
      familyMemberId: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('El miembro de familia es obligatorio')
    }
  })

  it('should fail with empty appointmentDate', () => {
    const result = appointmentSchema.safeParse({
      ...validData,
      appointmentDate: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'La fecha y hora de la cita es obligatoria',
      )
    }
  })

  it('should accept empty optional fields', () => {
    const result = appointmentSchema.safeParse({
      ...validData,
      authorizationId: '',
      authorizationServiceId: '',
      location: '',
      doctorName: '',
      specialty: '',
      notes: '',
    })

    expect(result.success).toBe(true)
  })
})

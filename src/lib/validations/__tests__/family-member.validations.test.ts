import { describe, it, expect } from 'vitest'
import { familyMemberSchema } from '../family-member.validations'

describe('familyMemberSchema', () => {
  const validData = {
    fullName: 'Juan Pérez',
    relationship: 'Titular',
  }

  it('should pass with minimum required fields', () => {
    const result = familyMemberSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should pass with all fields filled', () => {
    const result = familyMemberSchema.safeParse({
      ...validData,
      documentType: 'CC',
      documentNumber: '123456789',
      birthDate: '1990-01-15',
      epsProviderId: 'eps-uuid-123',
      regime: 'contributivo',
      address: 'Calle 123 #45-67',
      phone: '6012345678',
      cellphone: '3001234567',
      email: 'juan@example.com',
      department: 'Antioquia',
      city: 'Medellín',
    })
    expect(result.success).toBe(true)
  })

  it('should fail with empty fullName', () => {
    const result = familyMemberSchema.safeParse({ ...validData, fullName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('El nombre es obligatorio')
    }
  })

  it('should fail with fullName shorter than 2 characters', () => {
    const result = familyMemberSchema.safeParse({ ...validData, fullName: 'J' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'El nombre debe tener al menos 2 caracteres',
      )
    }
  })

  it('should fail with empty relationship', () => {
    const result = familyMemberSchema.safeParse({ ...validData, relationship: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('La relación es obligatoria')
    }
  })

  it('should pass with valid email', () => {
    const result = familyMemberSchema.safeParse({
      ...validData,
      email: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('should fail with invalid email format', () => {
    const result = familyMemberSchema.safeParse({
      ...validData,
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailError = result.error.issues.find((i) =>
        i.path.includes('email'),
      )
      expect(emailError?.message).toBe('Ingresa un email válido')
    }
  })

  it('should pass with empty email (optional field)', () => {
    const result = familyMemberSchema.safeParse({
      ...validData,
      email: '',
    })
    expect(result.success).toBe(true)
  })

  it('should pass without optional fields', () => {
    const result = familyMemberSchema.safeParse({
      fullName: 'María García',
      relationship: 'Cónyuge',
    })
    expect(result.success).toBe(true)
  })

  it('should accept all document types', () => {
    for (const docType of ['CC', 'TI', 'RC', 'CE', 'PA']) {
      const result = familyMemberSchema.safeParse({
        ...validData,
        documentType: docType,
      })
      expect(result.success).toBe(true)
    }
  })

  it('should accept both regime values', () => {
    for (const regime of ['contributivo', 'subsidiado']) {
      const result = familyMemberSchema.safeParse({
        ...validData,
        regime,
      })
      expect(result.success).toBe(true)
    }
  })
})

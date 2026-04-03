import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '../auth.validations'

describe('loginSchema', () => {
  it('should pass with valid data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '12345678',
    })
    expect(result.success).toBe(true)
  })

  it('should fail with empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: '12345678' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('El email es obligatorio')
    }
  })

  it('should fail with invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '12345678',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Ingresa un email válido')
    }
  })

  it('should fail with empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('La contraseña es obligatoria')
    }
  })

  it('should fail with password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '1234567',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'La contraseña debe tener al menos 8 caracteres',
      )
    }
  })
})

describe('registerSchema', () => {
  const validData = {
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    password: '12345678',
    confirmPassword: '12345678',
  }

  it('should pass with valid data', () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should fail with empty name', () => {
    const result = registerSchema.safeParse({ ...validData, fullName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('El nombre es obligatorio')
    }
  })

  it('should fail with name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...validData, fullName: 'J' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'El nombre debe tener al menos 2 caracteres',
      )
    }
  })

  it('should fail when passwords do not match', () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path.includes('confirmPassword'),
      )
      expect(confirmError?.message).toBe('Las contraseñas no coinciden')
    }
  })

  it('should fail with empty confirmPassword', () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })

  it('should fail with invalid email', () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: 'bad-email',
    })
    expect(result.success).toBe(false)
  })
})

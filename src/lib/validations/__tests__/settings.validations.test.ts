import { describe, expect, it } from 'vitest'
import { settingsPreferencesSchema } from '../settings.validations'

describe('settingsPreferencesSchema', () => {
  it('accepts a valid phone and email preference', () => {
    const result = settingsPreferencesSchema.safeParse({
      phone: '+57 300 123 4567',
      emailNotifications: true,
    })

    expect(result.success).toBe(true)
  })

  it('accepts an empty phone', () => {
    const result = settingsPreferencesSchema.safeParse({
      phone: '',
      emailNotifications: false,
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid phone characters', () => {
    const result = settingsPreferencesSchema.safeParse({
      phone: 'abc123',
      emailNotifications: true,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Ingresa un teléfono válido')
    }
  })
})

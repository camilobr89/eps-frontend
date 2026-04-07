import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from '../formatters'

describe('formatters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-07T12:00:00.000-05:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats relative times in Spanish', () => {
    expect(formatRelativeTime('2026-04-07T11:55:00.000-05:00')).toBe('hace 5 min')
    expect(formatRelativeTime('2026-04-07T10:00:00.000-05:00')).toBe('hace 2 horas')
    expect(formatRelativeTime('2026-04-06T12:00:00.000-05:00')).toBe('ayer')
    expect(formatRelativeTime('2026-04-04T12:00:00.000-05:00')).toBe('hace 3 días')
  })

  it('formats dates for Colombia', () => {
    expect(formatDate('2026-01-31T14:30:00.000-05:00')).toBe('31 Ene 2026')
    expect(formatDateTime('2026-01-31T14:30:00.000-05:00')).toBe('31 Ene 2026, 2:30 PM')
  })

  it('formats currency as COP', () => {
    expect(formatCurrency(12900)).toBe('$12.900')
    expect(formatCurrency('19200')).toBe('$19.200')
  })
})

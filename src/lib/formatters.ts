const COLOMBIA_LOCALE = 'es-CO'
const COLOMBIA_TIMEZONE = 'America/Bogota'

function capitalizeWords(value: string) {
  return value.replace(/\b\p{L}/gu, (match) => match.toUpperCase())
}

export function formatRelativeTime(date: string | Date): string {
  const target = new Date(date).getTime()
  const diffMs = target - Date.now()
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  const absMinutes = Math.abs(diffMinutes)

  if (absMinutes < 60) {
    if (diffMinutes >= 0) {
      return diffMinutes <= 1 ? 'en 1 min' : `en ${diffMinutes} min`
    }

    return absMinutes <= 1 ? 'hace 1 min' : `hace ${absMinutes} min`
  }

  const diffHours = Math.round(diffMinutes / 60)
  const absHours = Math.abs(diffHours)

  if (absHours < 24) {
    if (diffHours >= 0) {
      return diffHours === 1 ? 'en 1 hora' : `en ${diffHours} horas`
    }

    return absHours === 1 ? 'hace 1 hora' : `hace ${absHours} horas`
  }

  const diffDays = Math.round(diffHours / 24)
  const absDays = Math.abs(diffDays)

  if (diffDays === -1) return 'ayer'
  if (diffDays === 1) return 'mañana'
  if (diffDays < 0) return `hace ${absDays} días`

  return `en ${diffDays} días`
}

export function formatDate(date: string | Date): string {
  const parts = new Intl.DateTimeFormat(COLOMBIA_LOCALE, {
    timeZone: COLOMBIA_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(new Date(date))

  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''
  const year = parts.find((part) => part.type === 'year')?.value ?? ''

  return `${day} ${capitalizeWords(month.replace(/\./g, ''))} ${year}`.trim()
}

export function formatDateTime(date: string | Date): string {
  const timePart = new Intl.DateTimeFormat('en-US', {
    timeZone: COLOMBIA_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))

  return `${formatDate(date)}, ${timePart}`
}

export function formatCurrency(value: number | string): string {
  const amount = typeof value === 'number' ? value : Number(value)

  return new Intl.NumberFormat(COLOMBIA_LOCALE, {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(Number.isFinite(amount) ? amount : 0)
    .replace(/\s+/g, '')
}

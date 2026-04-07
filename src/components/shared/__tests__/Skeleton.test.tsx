import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '../Skeleton'

describe('Skeleton', () => {
  it('renders with pulse styles', () => {
    const { container } = render(<Skeleton className="h-8 w-20" />)
    const skeleton = container.firstElementChild

    expect(skeleton).not.toBeNull()
    expect(skeleton?.className).toContain('animate-pulse')
    expect(skeleton?.className).toContain('h-8')
  })
})

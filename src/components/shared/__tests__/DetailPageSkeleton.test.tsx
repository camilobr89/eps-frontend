import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DetailPageSkeleton } from '../DetailPageSkeleton'

describe('DetailPageSkeleton', () => {
  it('renders section placeholders', () => {
    const { container } = render(<DetailPageSkeleton cards={2} />)
    const skeletons = container.querySelectorAll('.animate-pulse')

    expect(skeletons.length).toBeGreaterThan(10)
  })
})

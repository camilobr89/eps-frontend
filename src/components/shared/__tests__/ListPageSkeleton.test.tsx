import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListPageSkeleton } from '../ListPageSkeleton'

describe('ListPageSkeleton', () => {
  it('renders filter placeholders and cards', () => {
    const { container } = render(<ListPageSkeleton items={3} />)
    const skeletons = container.querySelectorAll('.animate-pulse')

    expect(skeletons.length).toBeGreaterThan(3)
  })
})

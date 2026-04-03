import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render with default size', () => {
    const { container } = render(<LoadingSpinner />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.getAttribute('class')).toContain('h-8')
    expect(svg?.getAttribute('class')).toContain('w-8')
  })

  it('should render with sm size', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('h-4')
    expect(svg?.getAttribute('class')).toContain('w-4')
  })

  it('should render with lg size', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('h-12')
    expect(svg?.getAttribute('class')).toContain('w-12')
  })

  it('should apply custom className to wrapper', () => {
    const { container } = render(<LoadingSpinner className="mt-10" />)
    expect(container.firstElementChild?.className).toContain('mt-10')
  })
})

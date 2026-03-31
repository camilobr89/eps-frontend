import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByText('Get started')).toBeInTheDocument()
  })

  it('renders the counter button with initial value 0', () => {
    render(<App />)
    expect(screen.getByText('Count is 0')).toBeInTheDocument()
  })

  it('increments counter on click', () => {
    render(<App />)
    const button = screen.getByText('Count is 0')
    fireEvent.click(button)
    expect(screen.getByText('Count is 1')).toBeInTheDocument()
  })

  it('renders documentation links', () => {
    render(<App />)
    expect(screen.getByText('Explore Vite')).toBeInTheDocument()
    expect(screen.getByText('Learn more')).toBeInTheDocument()
  })

  it('renders social links', () => {
    render(<App />)
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Discord')).toBeInTheDocument()
  })
})

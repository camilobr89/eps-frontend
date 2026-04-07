import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { ErrorBoundary } from '../ErrorBoundary'

describe('ErrorBoundary', () => {
  it('shows fallback UI and retries rendering', async () => {
    const user = userEvent.setup()

    function AlwaysThrow(): never {
      throw new Error('Boom')
    }

    function Wrapper() {
      const [fixed, setFixed] = useState(false)

      return (
        <>
          <button type="button" onClick={() => setFixed(true)}>
            Corregir
          </button>
          <ErrorBoundary>
            {fixed ? <div>Contenido recuperado</div> : <AlwaysThrow />}
          </ErrorBoundary>
        </>
      )
    }

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(<Wrapper />)

    expect(screen.getByText('Ocurrió un error inesperado')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Corregir' }))
    await user.click(screen.getByRole('button', { name: /reintentar/i }))

    expect(screen.getByText('Contenido recuperado')).toBeInTheDocument()
    errorSpy.mockRestore()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PageBackButton } from '../PageBackButton'

describe('PageBackButton', () => {
  it('renders an accessible icon button and handles click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<PageBackButton onClick={onClick} label="Volver a citas" />)

    await user.click(screen.getByRole('button', { name: 'Volver a citas' }))
    expect(onClick).toHaveBeenCalled()
  })
})

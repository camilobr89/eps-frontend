import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload } from '../FileUpload'

describe('FileUpload', () => {
  it('shows error for unsupported file type', async () => {
    render(<FileUpload onUpload={vi.fn()} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['bad'], 'virus.exe', { type: 'application/x-msdownload' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(
      screen.getByText('Tipo no permitido. Usa PDF, JPG, JPEG o PNG.'),
    ).toBeInTheDocument()
  })

  it('shows error for oversized file', async () => {
    render(<FileUpload onUpload={vi.fn()} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(input, { target: { files: [file] } })

    expect(
      screen.getByText('El archivo supera el tamaño máximo permitido de 10 MB.'),
    ).toBeInTheDocument()
  })

  it('uploads a valid file and displays preview', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn(async (_file: File, onProgress: (progress: number) => void) => {
      onProgress(100)
    })

    render(<FileUpload onUpload={onUpload} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['pdf'], 'autorizacion.pdf', { type: 'application/pdf' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('autorizacion.pdf')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Subir documento' }))

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(1)
    })
  })

  it('accepts a valid file through drag and drop and clears previous errors', () => {
    render(<FileUpload onUpload={vi.fn()} />)

    const dropzone = screen.getByText('Arrastra tu archivo aquí').closest('div')?.parentElement
    expect(dropzone).not.toBeNull()

    const invalidFile = new File(['bad'], 'virus.exe', { type: 'application/x-msdownload' })
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [invalidFile] },
    })

    expect(
      screen.getByText('Tipo no permitido. Usa PDF, JPG, JPEG o PNG.'),
    ).toBeInTheDocument()

    const validFile = new File(['ok'], 'orden.png', { type: 'image/png' })
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [validFile] },
    })

    expect(screen.queryByText('Tipo no permitido. Usa PDF, JPG, JPEG o PNG.')).not.toBeInTheDocument()
    expect(screen.getByText('orden.png')).toBeInTheDocument()
  })
})

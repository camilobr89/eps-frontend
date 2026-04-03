import type { ReactNode } from 'react'

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span
      className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
      style={{ clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)' }}
    >
      {children}
    </span>
  )
}

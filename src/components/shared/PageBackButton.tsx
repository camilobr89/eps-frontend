import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageBackButtonProps {
  onClick: () => void
  label?: string
}

export function PageBackButton({
  onClick,
  label = 'Volver',
}: PageBackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  )
}

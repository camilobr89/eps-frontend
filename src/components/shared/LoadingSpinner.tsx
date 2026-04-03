import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

interface LoadingSpinnerProps {
  size?: keyof typeof sizes
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-muted-foreground', sizes[size])} />
    </div>
  )
}

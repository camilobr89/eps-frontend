import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-lg text-muted-foreground">Página no encontrada</p>
      <Link
        to="/dashboard"
        className={cn(buttonVariants({ variant: 'default' }))}
      >
        Volver al inicio
      </Link>
    </div>
  )
}

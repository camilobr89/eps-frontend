import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return error.statusText || 'Ocurrió un error al cargar la ruta.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente.'
}

export function RouteErrorPage() {
  const error = useRouteError()
  const message = getErrorMessage(error)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          No fue posible cargar esta vista
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reintentar
        </button>
        <Link
          to="/dashboard"
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}

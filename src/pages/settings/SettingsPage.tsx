import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogOut, Mail, Phone, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuthStore } from '@/stores/auth.store'
import {
  settingsPreferencesSchema,
  type SettingsPreferencesFormValues,
} from '@/lib/validations/settings.validations'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function SettingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const updatePreferences = useAuthStore((s) => s.updatePreferences)
  const [preferencesError, setPreferencesError] = useState<string | null>(null)
  const [preferencesSuccess, setPreferencesSuccess] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsPreferencesFormValues>({
    resolver: zodResolver(settingsPreferencesSchema),
    defaultValues: {
      phone: user?.phone ?? '',
      emailNotifications: user?.emailNotifications ?? true,
    },
  })

  useEffect(() => {
    reset({
      phone: user?.phone ?? '',
      emailNotifications: user?.emailNotifications ?? true,
    })
  }, [reset, user?.emailNotifications, user?.phone])

  async function onSubmit(data: SettingsPreferencesFormValues) {
    setPreferencesError(null)
    setPreferencesSuccess(null)

    try {
      await updatePreferences({
        phone: data.phone.trim() || undefined,
        emailNotifications: data.emailNotifications,
      })
      setPreferencesSuccess('Preferencias guardadas correctamente')
      reset(data)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      setPreferencesError(
        axiosError.response?.data?.message ??
          'No fue posible guardar tus preferencias',
      )
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    await logout()
    navigate('/login')
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Configuración"
        description="Administra tu perfil, preferencias de contacto y la sesión actual."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>
              Por ahora estos datos son de solo lectura. Cuando el backend exponga edición
              del perfil, se podrá actualizar el nombre desde aquí.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settingsFullName">Nombre completo</Label>
              <Input
                id="settingsFullName"
                value={user?.fullName ?? ''}
                readOnly
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settingsEmail">Email</Label>
              <Input
                id="settingsEmail"
                value={user?.email ?? ''}
                readOnly
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Preferencias
            </CardTitle>
            <CardDescription>
              Define el teléfono de contacto y si deseas recibir notificaciones por email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferencesSuccess && (
              <Alert>
                <AlertDescription>{preferencesSuccess}</AlertDescription>
              </Alert>
            )}
            {preferencesError && (
              <Alert variant="destructive">
                <AlertDescription>{preferencesError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+57 300 123 4567"
                  {...register('phone')}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <label
                htmlFor="emailNotifications"
                className="flex items-start gap-3 rounded-lg border border-border/70 px-4 py-3"
              >
                <input
                  id="emailNotifications"
                  type="checkbox"
                  aria-label="Recibir notificaciones por email"
                  className="mt-1 h-4 w-4 rounded border-input"
                  {...register('emailNotifications')}
                />
                <div className="space-y-1">
                  <span className="font-medium">Recibir notificaciones por email</span>
                  <p className="text-sm text-muted-foreground">
                    Incluye recordatorios de citas, vencimientos y resultados del OCR.
                  </p>
                </div>
              </label>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar preferencias
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Sesión
          </CardTitle>
          <CardDescription>
            Esta sesión está asociada al correo actual y puede cerrarse desde aquí.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Sesión iniciada como <span className="font-medium text-foreground">{user?.email}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

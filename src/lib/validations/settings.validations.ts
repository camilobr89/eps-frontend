import { z } from 'zod'

export const settingsPreferencesSchema = z.object({
  phone: z
    .string()
    .trim()
    .max(30, 'El teléfono no puede superar los 30 caracteres')
    .refine((value) => value === '' || /^[0-9+\-\s()]+$/.test(value), {
      message: 'Ingresa un teléfono válido',
    }),
  emailNotifications: z.boolean(),
})

export type SettingsPreferencesFormValues = z.infer<
  typeof settingsPreferencesSchema
>

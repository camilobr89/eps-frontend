export type NotificationType =
  | 'expiration_warning'
  | 'appointment_reminder'
  | 'ocr_completed'
  | 'ocr_failed'

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  updatedAt?: string
}

export type NotificationType =
  | 'expiration_warning'
  | 'appointment_reminder'
  | 'ocr_completed'
  | 'ocr_failed'

export type NotificationRelatedEntityType = 'authorization' | 'appointment' | string

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  type?: NotificationType | null
  relatedEntityType?: NotificationRelatedEntityType | null
  relatedEntityId?: string | null
  createdAt: string
  updatedAt?: string
}

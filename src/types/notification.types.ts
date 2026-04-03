export type NotificationType =
  | 'expiration_warning'
  | 'appointment_reminder'
  | 'ocr_completed'
  | 'ocr_failed'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  related_entity_type: string | null
  related_entity_id: string | null
  read: boolean
  sent_at: string
}

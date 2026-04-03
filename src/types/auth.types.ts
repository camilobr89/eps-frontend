export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  accessToken: string
}

export interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
  email_notifications: boolean
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

export interface AuthResponse {
  accessToken: string
}

export interface User {
  id: string
  email: string
  fullName: string
  isActive: boolean
  emailNotifications: boolean
  createdAt: string
}

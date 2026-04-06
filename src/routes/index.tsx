import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PublicRoute } from '@/components/layout/PublicRoute'
import { AppLayout } from '@/components/layout/AppLayout'

import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { FamilyMembersPage } from '@/pages/family-members/FamilyMembersPage'
import { FamilyMemberDetailPage } from '@/pages/family-members/FamilyMemberDetailPage'
import { CreateFamilyMemberPage } from '@/pages/family-members/CreateFamilyMemberPage'
import { EditFamilyMemberPage } from '@/pages/family-members/EditFamilyMemberPage'
import { AuthorizationsPage } from '@/pages/authorizations/AuthorizationsPage'
import { CreateAuthorizationPage } from '@/pages/authorizations/CreateAuthorizationPage'
import { AuthorizationDetailPage } from '@/pages/authorizations/AuthorizationDetailPage'
import { EditAuthorizationPage } from '@/pages/authorizations/EditAuthorizationPage'
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage'
import { CreateAppointmentPage } from '@/pages/appointments/CreateAppointmentPage'
import { AppointmentDetailPage } from '@/pages/appointments/AppointmentDetailPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/family-members', element: <FamilyMembersPage /> },
          { path: '/family-members/new', element: <CreateFamilyMemberPage /> },
          { path: '/family-members/:id', element: <FamilyMemberDetailPage /> },
          { path: '/family-members/:id/edit', element: <EditFamilyMemberPage /> },
          { path: '/authorizations', element: <AuthorizationsPage /> },
          { path: '/authorizations/new', element: <CreateAuthorizationPage /> },
          { path: '/authorizations/:id', element: <AuthorizationDetailPage /> },
          { path: '/authorizations/:id/edit', element: <EditAuthorizationPage /> },
          { path: '/appointments', element: <AppointmentsPage /> },
          { path: '/appointments/new', element: <CreateAppointmentPage /> },
          { path: '/appointments/:id', element: <AppointmentDetailPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

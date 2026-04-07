import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Bell,
  LogOut,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useUiStore } from '@/stores/ui.store'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/family-members', label: 'Familia', icon: Users },
  { to: '/authorizations', label: 'Autorizaciones', icon: FileText },
  { to: '/appointments', label: 'Citas', icon: Calendar },
  { to: '/notifications', label: 'Notificaciones', icon: Bell },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const unreadCount = useNotificationsStore((s) => s.unreadCount)
  const closeSidebar = useUiStore((s) => s.closeSidebar)
  const unreadCountLabel = unreadCount > 99 ? '99+' : unreadCount

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  function handleNav() {
    closeSidebar()
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-4">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Gestión EPS</span>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={handleNav}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(to)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {to === '/notifications' && unreadCount > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {unreadCountLabel}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <Separator />

      <div className="p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

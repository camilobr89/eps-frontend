import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useUiStore } from '@/stores/ui.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { VisuallyHidden } from '@/components/shared/VisuallyHidden'

export function AppLayout() {
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen)
  const closeSidebar = useUiStore((s) => s.closeSidebar)
  const startPolling = useNotificationsStore((s) => s.startPolling)
  const stopPolling = useNotificationsStore((s) => s.stopPolling)

  useEffect(() => {
    startPolling()
    return () => stopPolling()
  }, [startPolling, stopPolling])

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar md:block">
        <Sidebar />
      </aside>

      <Sheet open={isSidebarOpen} onOpenChange={closeSidebar}>
        <SheetContent side="left" className="w-60 p-0">
          <VisuallyHidden>
            <SheetTitle>Menú de navegación</SheetTitle>
          </VisuallyHidden>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

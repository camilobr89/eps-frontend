import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from '../ui.store'

describe('ui.store', () => {
  beforeEach(() => {
    useUiStore.setState({ isSidebarOpen: false })
  })

  it('should start with sidebar closed', () => {
    expect(useUiStore.getState().isSidebarOpen).toBe(false)
  })

  it('toggleSidebar should open when closed', () => {
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().isSidebarOpen).toBe(true)
  })

  it('toggleSidebar should close when open', () => {
    useUiStore.setState({ isSidebarOpen: true })
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().isSidebarOpen).toBe(false)
  })

  it('closeSidebar should close the sidebar', () => {
    useUiStore.setState({ isSidebarOpen: true })
    useUiStore.getState().closeSidebar()
    expect(useUiStore.getState().isSidebarOpen).toBe(false)
  })

  it('closeSidebar should be a no-op when already closed', () => {
    useUiStore.getState().closeSidebar()
    expect(useUiStore.getState().isSidebarOpen).toBe(false)
  })
})

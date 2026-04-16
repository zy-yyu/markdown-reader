import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../../src/stores/settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults to system theme', () => {
    const store = useSettingsStore()
    expect(store.theme).toBe('system')
  })

  it('toggleTheme cycles light → dark → system', () => {
    const store = useSettingsStore()
    store.theme = 'light'
    store.toggleTheme()
    expect(store.theme).toBe('dark')
    store.toggleTheme()
    expect(store.theme).toBe('system')
    store.toggleTheme()
    expect(store.theme).toBe('light')
  })

  it('defaults fontSize to 16', () => {
    const store = useSettingsStore()
    expect(store.fontSize).toBe(16)
  })

  it('sidebarVisible defaults to true', () => {
    const store = useSettingsStore()
    expect(store.sidebarVisible).toBe(true)
  })

  it('tocVisible defaults to true', () => {
    const store = useSettingsStore()
    expect(store.tocVisible).toBe(true)
  })
})

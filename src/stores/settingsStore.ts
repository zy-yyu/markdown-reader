import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'markdown-reader-settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveSettings(data: object) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = loadSettings()

  const theme = ref<Theme>(saved.theme ?? 'system')
  const fontSize = ref<number>(saved.fontSize ?? 16)
  const sidebarVisible = ref<boolean>(saved.sidebarVisible ?? true)
  const tocVisible = ref<boolean>(saved.tocVisible ?? true)

  function toggleTheme() {
    const cycle: Theme[] = ['light', 'dark', 'system']
    const idx = cycle.indexOf(theme.value)
    theme.value = cycle[(idx + 1) % cycle.length]
  }

  watch([theme, fontSize, sidebarVisible, tocVisible], () => {
    saveSettings({
      theme: theme.value,
      fontSize: fontSize.value,
      sidebarVisible: sidebarVisible.value,
      tocVisible: tocVisible.value,
    })
  })

  return { theme, fontSize, sidebarVisible, tocVisible, toggleTheme }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>('system')
  const fontSize = ref(16)
  const sidebarVisible = ref(true)
  const tocVisible = ref(true)

  function toggleTheme() {
    const cycle: Theme[] = ['light', 'dark', 'system']
    const idx = cycle.indexOf(theme.value)
    theme.value = cycle[(idx + 1) % cycle.length]
  }

  return { theme, fontSize, sidebarVisible, tocVisible, toggleTheme }
})

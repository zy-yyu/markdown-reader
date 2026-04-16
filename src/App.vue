<template>
  <div class="app-shell" :data-theme="effectiveTheme">
    <Toolbar :is-edit-mode="isEditMode" @toggle-edit="toggleEdit" />
    <div class="app-body">
      <Sidebar v-if="settings.sidebarVisible" />
      <RenderArea ref="renderAreaRef" @toc="tocItems = $event" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TocItem } from './lib/toc'
import { useSettingsStore } from './stores/settingsStore'
import Toolbar from './components/Toolbar.vue'
import Sidebar from './components/Sidebar.vue'
import RenderArea from './components/RenderArea.vue'

const settings = useSettingsStore()
const isEditMode = ref(false)
const renderAreaRef = ref<InstanceType<typeof RenderArea> | null>(null)
const tocItems = ref<TocItem[]>([])

const effectiveTheme = computed(() => {
  if (settings.theme !== 'system') return settings.theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
})

function toggleEdit() {
  isEditMode.value = !isEditMode.value
}

watch(() => settings.fontSize, (size) => {
  document.documentElement.style.setProperty('--font-size', `${size}px`)
}, { immediate: true })
</script>

<style>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>

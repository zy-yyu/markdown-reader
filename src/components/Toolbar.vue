<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button @click="openFolder" title="Open Folder">Folder</button>
      <button @click="openFile" title="Open File">File</button>
    </div>
    <div class="toolbar-center">
      <span class="app-title">{{ title }}</span>
      <span v-if="fileStore.isDirty" class="dirty-indicator" title="Unsaved changes">●</span>
    </div>
    <div class="toolbar-right">
      <button @click="toggleEdit" :class="{ active: isEditMode }">
        {{ isEditMode ? 'Read' : 'Edit' }}
      </button>
      <button @click="settings.toggleTheme" title="Toggle Theme">{{ themeLabel }}</button>
      <button @click="decreaseFontSize" title="Decrease font size">A-</button>
      <button @click="increaseFontSize" title="Increase font size">A+</button>
      <button @click="settings.sidebarVisible = !settings.sidebarVisible" title="Toggle Sidebar">Sidebar</button>
      <button @click="settings.tocVisible = !settings.tocVisible" title="Toggle TOC">TOC</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { useFileStore, type FileEntry } from '../stores/fileStore'
import { useSettingsStore } from '../stores/settingsStore'

const props = defineProps<{ isEditMode: boolean }>()
const emit = defineEmits<{ (e: 'toggleEdit'): void }>()

const fileStore = useFileStore()
const settings = useSettingsStore()

const title = computed(() => {
  if (!fileStore.currentFilePath) return 'Markdown Reader'
  const parts = fileStore.currentFilePath.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1]
})

const themeLabel = computed(() => {
  if (settings.theme === 'light') return 'Light'
  if (settings.theme === 'dark') return 'Dark'
  return 'System'
})

function decreaseFontSize() {
  settings.fontSize = Math.max(12, settings.fontSize - 1)
}

function increaseFontSize() {
  settings.fontSize = Math.min(24, settings.fontSize + 1)
}

async function openFolder() {
  const selected = await open({ directory: true, multiple: false })
  if (!selected) return
  const path = typeof selected === 'string' ? selected : selected[0]
  try {
    const tree = await invoke<FileEntry[]>('scan_dir', { path })
    fileStore.fileTree = tree
    fileStore.searchQuery = ''
  } catch (e) {
    alert(`Could not open folder: ${e}`)
  }
}

async function openFile() {
  const selected = await open({ filters: [{ name: 'Markdown', extensions: ['md'] }], multiple: false })
  if (!selected) return
  const path = typeof selected === 'string' ? selected : selected[0]
  try {
    const content = await invoke<string>('read_file', { path })
    fileStore.setCurrentFile(path, content)
    fileStore.addRecentFile(path)
    fileStore.fileTree = []
  } catch (e) {
    alert(`Could not open file: ${e}`)
  }
}

function toggleEdit() {
  emit('toggleEdit')
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  height: 40px;
  background: var(--color-bg-sidebar);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.toolbar-left, .toolbar-right {
  display: flex;
  gap: 0.25rem;
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.dirty-indicator { color: #f5a623; font-size: 1.2em; }

button {
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  color: var(--color-text);
  font-size: 0.8rem;
  white-space: nowrap;
}

button:hover { background: var(--color-bg-hover); border-color: var(--color-border); }
button.active { background: var(--color-bg-active); }
</style>

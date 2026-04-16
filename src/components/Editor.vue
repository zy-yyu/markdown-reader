<template>
  <div class="editor-container" ref="containerEl" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { invoke } from '@tauri-apps/api/core'
import { useFileStore } from '../stores/fileStore'
import { useSettingsStore } from '../stores/settingsStore'

const fileStore = useFileStore()
const settings = useSettingsStore()
const containerEl = ref<HTMLElement | null>(null)
let view: EditorView | null = null

async function saveFile() {
  if (!fileStore.currentFilePath) return
  const content = view?.state.doc.toString() ?? ''
  try {
    await invoke('write_file', { path: fileStore.currentFilePath, content })
    fileStore.setCurrentFile(fileStore.currentFilePath, content)
  } catch (e) {
    alert(`Save failed: ${e}`)
  }
}

onMounted(() => {
  if (!containerEl.value) return
  const isDark = settings.theme === 'dark' ||
    (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const extensions = [
    lineNumbers(),
    history(),
    markdown(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      { key: 'Ctrl-s', mac: 'Cmd-s', run: () => { saveFile(); return true } },
    ]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) fileStore.markDirty()
    }),
    EditorView.theme({ '&': { height: '100%', fontSize: `${settings.fontSize}px` } }),
    ...(isDark ? [oneDark] : []),
  ]

  view = new EditorView({
    state: EditorState.create({ doc: fileStore.currentContent, extensions }),
    parent: containerEl.value,
  })
})

onUnmounted(() => {
  view?.destroy()
  view = null
})

watch(() => fileStore.currentContent, (newContent) => {
  if (!view) return
  const current = view.state.doc.toString()
  if (current !== newContent) {
    view.dispatch({
      changes: { from: 0, to: current.length, insert: newContent },
    })
  }
})
</script>

<style scoped>
.editor-container {
  flex: 1;
  overflow: hidden;
  background: var(--color-bg);
}

.editor-container :deep(.cm-editor) {
  height: 100%;
}

.editor-container :deep(.cm-scroller) {
  overflow: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
</style>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FileEntry {
  name: string
  path: string
  is_dir: boolean
  children: FileEntry[]
}

export const useFileStore = defineStore('file', () => {
  const currentFilePath = ref('')
  const currentContent = ref('')
  const isDirty = ref(false)
  const fileTree = ref<FileEntry[]>([])
  const recentFiles = ref<string[]>([])
  const searchQuery = ref('')

  function setCurrentFile(path: string, content: string) {
    currentFilePath.value = path
    currentContent.value = content
    isDirty.value = false
  }

  function markDirty() {
    isDirty.value = true
  }

  function addRecentFile(path: string) {
    recentFiles.value = [path, ...recentFiles.value.filter(p => p !== path)].slice(0, 10)
  }

  const filteredTree = computed<FileEntry[]>(() => {
    if (!searchQuery.value) return fileTree.value
    const q = searchQuery.value.toLowerCase()
    function filterEntries(entries: FileEntry[]): FileEntry[] {
      return entries.flatMap(entry => {
        if (entry.is_dir) {
          const children = filterEntries(entry.children ?? [])
          return children.length ? [{ ...entry, children }] : []
        }
        return entry.name.toLowerCase().includes(q) ? [entry] : []
      })
    }
    return filterEntries(fileTree.value)
  })

  return {
    currentFilePath, currentContent, isDirty,
    fileTree, recentFiles, searchQuery, filteredTree,
    setCurrentFile, markDirty, addRecentFile,
  }
})

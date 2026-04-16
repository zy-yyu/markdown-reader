import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFileStore } from '../../src/stores/fileStore'

describe('fileStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with no current file', () => {
    const store = useFileStore()
    expect(store.currentFilePath).toBe('')
    expect(store.currentContent).toBe('')
  })

  it('setCurrentFile updates path and content', () => {
    const store = useFileStore()
    store.setCurrentFile('/path/to/file.md', '# Hello')
    expect(store.currentFilePath).toBe('/path/to/file.md')
    expect(store.currentContent).toBe('# Hello')
  })

  it('markDirty sets isDirty true', () => {
    const store = useFileStore()
    store.setCurrentFile('/path/to/file.md', '# Hello')
    expect(store.isDirty).toBe(false)
    store.markDirty()
    expect(store.isDirty).toBe(true)
  })

  it('setCurrentFile resets isDirty', () => {
    const store = useFileStore()
    store.setCurrentFile('/a.md', '# A')
    store.markDirty()
    store.setCurrentFile('/b.md', '# B')
    expect(store.isDirty).toBe(false)
  })

  it('addRecentFile prepends to recentFiles', () => {
    const store = useFileStore()
    store.addRecentFile('/a.md')
    store.addRecentFile('/b.md')
    expect(store.recentFiles[0]).toBe('/b.md')
    expect(store.recentFiles[1]).toBe('/a.md')
  })

  it('addRecentFile deduplicates', () => {
    const store = useFileStore()
    store.addRecentFile('/a.md')
    store.addRecentFile('/b.md')
    store.addRecentFile('/a.md')
    expect(store.recentFiles.length).toBe(2)
    expect(store.recentFiles[0]).toBe('/a.md')
  })

  it('addRecentFile keeps max 10 entries', () => {
    const store = useFileStore()
    for (let i = 0; i < 12; i++) store.addRecentFile(`/${i}.md`)
    expect(store.recentFiles.length).toBe(10)
  })

  it('searchQuery filters fileTree by name', () => {
    const store = useFileStore()
    store.fileTree = [
      { name: 'alpha.md', path: '/alpha.md', is_dir: false, children: [] },
      { name: 'beta.md', path: '/beta.md', is_dir: false, children: [] },
    ]
    store.searchQuery = 'alp'
    expect(store.filteredTree.length).toBe(1)
    expect(store.filteredTree[0].name).toBe('alpha.md')
  })
})

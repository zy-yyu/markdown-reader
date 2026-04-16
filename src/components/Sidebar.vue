<template>
  <aside class="sidebar">
    <div class="sidebar-search">
      <input
        v-model="fileStore.searchQuery"
        placeholder="Search files..."
        class="search-input"
      />
    </div>

    <div v-if="fileStore.fileTree.length > 0" class="file-tree">
      <TreeNode
        v-for="entry in fileStore.filteredTree"
        :key="entry.path"
        :entry="entry"
        @select="selectFile"
      />
    </div>

    <div v-else-if="fileStore.recentFiles.length > 0" class="recent-files">
      <div class="section-label">Recent Files</div>
      <button
        v-for="path in fileStore.recentFiles"
        :key="path"
        class="file-item"
        :class="{ active: fileStore.currentFilePath === path }"
        @click="selectFile(path)"
        :title="path"
      >
        {{ fileName(path) }}
      </button>
    </div>

    <div v-else class="empty-hint">
      Open a folder or file to get started.
    </div>
  </aside>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { defineComponent, ref, h } from 'vue'
import { useFileStore, type FileEntry } from '../stores/fileStore'

const fileStore = useFileStore()

function fileName(path: string): string {
  return path.replace(/\\/g, '/').split('/').pop() || path
}

async function selectFile(path: string) {
  try {
    const content = await invoke<string>('read_file', { path })
    fileStore.setCurrentFile(path, content)
    fileStore.addRecentFile(path)
  } catch (e) {
    fileStore.setCurrentFile(path, `> **Error reading file:** ${e}`)
  }
}

const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    entry: { type: Object as () => FileEntry, required: true },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const open = ref(true)
    return () => {
      if (props.entry.is_dir) {
        return h('div', { class: 'tree-dir' }, [
          h('button', {
            class: 'dir-item',
            onClick: () => { open.value = !open.value },
          }, `${open.value ? '▾' : '▸'} ${props.entry.name}`),
          open.value
            ? h('div', { class: 'tree-children' },
                (props.entry.children ?? []).map(child =>
                  h(TreeNode, { key: child.path, entry: child, onSelect: (p: string) => emit('select', p) })
                )
              )
            : null,
        ])
      }
      return h('button', {
        class: ['file-item', fileStore.currentFilePath === props.entry.path ? 'active' : ''],
        title: props.entry.path,
        onClick: () => emit('select', props.entry.path),
      }, props.entry.name)
    }
  },
})
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--color-bg-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-search {
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  width: 100%;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.85rem;
  outline: none;
}

.search-input:focus { border-color: var(--color-link); }

.file-tree, .recent-files {
  flex: 1;
  overflow-y: auto;
  padding: 0.25rem 0;
}

.section-label {
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.file-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.3rem 0.75rem;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-item:hover { background: var(--color-bg-hover); }
.file-item.active { background: var(--color-bg-active); }

.dir-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.3rem 0.5rem;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dir-item:hover { background: var(--color-bg-hover); }

.tree-children { padding-left: 1rem; }

.empty-hint {
  padding: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-align: center;
}
</style>

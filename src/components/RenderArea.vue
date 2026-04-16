<template>
  <main class="render-area" ref="scrollEl">
    <div
      v-if="fileStore.currentContent"
      class="markdown-body"
      v-html="renderedHtml"
      @click="handleClick"
    />
    <div v-else class="render-placeholder">
      <p>Open a Markdown file to start reading.</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { openUrl } from '@tauri-apps/plugin-opener'
import { useFileStore } from '../stores/fileStore'
import { renderMarkdown } from '../lib/markdown'
import { extractToc } from '../lib/toc'

const fileStore = useFileStore()
const scrollEl = ref<HTMLElement | null>(null)

const renderedHtml = computed(() => {
  if (!fileStore.currentContent) return ''
  return addHeadingIds(renderMarkdown(fileStore.currentContent))
})

function addHeadingIds(html: string): string {
  const counters: Record<string, number> = {}
  return html.replace(/<h([1-6])>([\s\S]*?)<\/h[1-6]>/gi, (_, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim()
    const base = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    counters[base] = (counters[base] || 0) + 1
    const id = counters[base] > 1 ? `${base}-${counters[base]}` : base
    return `<h${level} id="${id}">${inner}</h${level}>`
  })
}

const emit = defineEmits<{ (e: 'toc', items: ReturnType<typeof extractToc>): void }>()

watch(renderedHtml, (html) => {
  emit('toc', extractToc(html))
}, { immediate: true })

async function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const anchor = target.closest('a')
  if (!anchor) return
  const href = anchor.getAttribute('href')
  if (!href) return
  if (href.startsWith('http://') || href.startsWith('https://')) {
    e.preventDefault()
    await openUrl(href)
  }
}

watch(() => fileStore.currentFilePath, () => {
  scrollEl.value?.scrollTo(0, 0)
})

defineExpose({ scrollEl })
</script>

<style scoped>
.render-area {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg);
}

.render-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  font-size: 1rem;
}
</style>

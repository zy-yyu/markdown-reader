<template>
  <aside class="toc-panel">
    <div class="toc-header">Contents</div>
    <nav v-if="items.length > 0" class="toc-nav">
      <a
        v-for="item in items"
        :key="item.id"
        :href="`#${item.id}`"
        class="toc-item"
        :class="[`toc-h${item.level}`, { active: item.id === activeId }]"
        @click.prevent="scrollTo(item.id)"
      >
        {{ item.text }}
      </a>
    </nav>
    <div v-else class="toc-empty">No headings</div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { TocItem } from '../lib/toc'

const props = defineProps<{
  items: TocItem[]
  scrollEl: HTMLElement | null
}>()

const activeId = ref('')

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el && props.scrollEl) {
    props.scrollEl.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
  }
}

let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()
  if (!props.scrollEl) return
  const headings = Array.from(props.scrollEl.querySelectorAll('h1,h2,h3,h4,h5,h6'))
  if (!headings.length) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    { root: props.scrollEl, rootMargin: '0px 0px -80% 0px', threshold: 0 }
  )
  headings.forEach(h => observer!.observe(h))
}

onMounted(() => setupObserver())
onUnmounted(() => observer?.disconnect())

watch(() => props.items, () => {
  setTimeout(setupObserver, 100)
})
</script>

<style scoped>
.toc-panel {
  width: var(--toc-width);
  min-width: var(--toc-width);
  background: var(--color-bg-sidebar);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toc-header {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}

.toc-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.toc-item {
  display: block;
  padding: 0.2rem 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 2px solid transparent;
  transition: color 0.1s, border-color 0.1s;
}

.toc-item:hover { color: var(--color-text); }
.toc-item.active { color: var(--color-link); border-left-color: var(--color-link); }

.toc-h1 { padding-left: 0.75rem; }
.toc-h2 { padding-left: 1.25rem; }
.toc-h3 { padding-left: 1.75rem; }
.toc-h4 { padding-left: 2.25rem; }

.toc-empty {
  padding: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: center;
}
</style>

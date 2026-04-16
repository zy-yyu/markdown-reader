import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import katex from 'katex'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="language-${lang} hljs">${hljs.highlight(code, { language: lang }).value}</code></pre>`
      } catch {}
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`
  },
})

// Inline math: $...$
md.use((instance: any) => {
  instance.core.ruler.push('inline_math', (state: any) => {
    for (const token of state.tokens) {
      if (token.type !== 'inline' || !token.children) continue
      const newChildren: any[] = []
      for (const child of token.children) {
        if (child.type !== 'text') { newChildren.push(child); continue }
        const parts = child.content.split(/\$([^$]+)\$/)
        if (parts.length === 1) { newChildren.push(child); continue }
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) {
            if (parts[i]) {
              const t = new state.Token('text', '', 0)
              t.content = parts[i]
              newChildren.push(t)
            }
          } else {
            const t = new state.Token('html_inline', '', 0)
            try { t.content = katex.renderToString(parts[i], { throwOnError: false }) }
            catch { t.content = parts[i] }
            newChildren.push(t)
          }
        }
      }
      token.children = newChildren
    }
  })
})

// Block math: $$...$$
md.use((instance: any) => {
  instance.block.ruler.before('fence', 'block_math', (state: any, start: number, end: number, silent: boolean) => {
    let pos = state.bMarks[start] + state.tShift[start]
    if (state.src.slice(pos, pos + 2) !== '$$') return false
    if (silent) return true
    let nextLine = start + 1
    while (nextLine < end) {
      pos = state.bMarks[nextLine] + state.tShift[nextLine]
      if (state.src.slice(pos, pos + 2) === '$$') break
      nextLine++
    }
    const math = state.getLines(start + 1, nextLine, 0, true)
    const token = state.push('html_block', '', 0)
    try { token.content = `<div class="math-block">${katex.renderToString(math, { throwOnError: false, displayMode: true })}</div>` }
    catch { token.content = `<div class="math-block">${math}</div>` }
    state.line = nextLine + 1
    return true
  })
})

export function renderMarkdown(content: string): string {
  return md.render(content)
}

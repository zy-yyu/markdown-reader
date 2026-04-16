import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../../src/lib/markdown'

describe('renderMarkdown', () => {
  it('renders a heading', () => {
    const html = renderMarkdown('# Hello')
    expect(html).toContain('<h1')
    expect(html).toContain('Hello')
  })

  it('renders bold text', () => {
    const html = renderMarkdown('**bold**')
    expect(html).toContain('<strong>')
  })

  it('renders a code block with language class', () => {
    const html = renderMarkdown('```js\nconsole.log("hi")\n```')
    expect(html).toContain('language-js')
  })

  it('renders inline code', () => {
    const html = renderMarkdown('use `foo()` here')
    expect(html).toContain('<code>')
  })

  it('renders a table', () => {
    const html = renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<td>')
  })

  it('renders inline math with KaTeX', () => {
    const html = renderMarkdown('Use $x^2$ here')
    expect(html).toContain('katex')
  })

  it('renders block math with KaTeX', () => {
    const html = renderMarkdown('$$\nx^2\n$$')
    expect(html).toContain('katex')
  })

  it('does not throw on empty string', () => {
    expect(() => renderMarkdown('')).not.toThrow()
  })
})

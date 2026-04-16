import { describe, it, expect } from 'vitest'
import { extractToc } from '../../src/lib/toc'

describe('extractToc', () => {
  it('returns empty array for no headings', () => {
    expect(extractToc('<p>no headings</p>')).toEqual([])
  })

  it('extracts h1', () => {
    const toc = extractToc('<h1 id="hello">Hello</h1>')
    expect(toc).toEqual([{ id: 'hello', text: 'Hello', level: 1 }])
  })

  it('extracts h1, h2, h3', () => {
    const html = '<h1 id="a">A</h1><h2 id="b">B</h2><h3 id="c">C</h3>'
    const toc = extractToc(html)
    expect(toc.length).toBe(3)
    expect(toc[0]).toEqual({ id: 'a', text: 'A', level: 1 })
    expect(toc[1]).toEqual({ id: 'b', text: 'B', level: 2 })
    expect(toc[2]).toEqual({ id: 'c', text: 'C', level: 3 })
  })

  it('strips inner HTML from heading text', () => {
    const toc = extractToc('<h2 id="x"><code>foo</code> bar</h2>')
    expect(toc[0].text).toBe('foo bar')
  })
})

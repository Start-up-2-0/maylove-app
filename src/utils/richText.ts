/**
 * Utilitários para o conteúdo rich-text (mensagem principal e de encerramento).
 * O conteúdo é editado num editor WYSIWYG e persistido como HTML. Aqui garantimos
 * que apenas um subconjunto seguro de tags/atributos seja renderizado.
 */

const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'DIV',
  'SPAN',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'S',
  'STRIKE',
  'UL',
  'OL',
  'LI',
  'A',
  'BLOCKQUOTE',
])

/** Detecta se a string contém marcação HTML (e não é apenas texto puro). */
export function containsHtml(value?: string | null): boolean {
  if (!value) return false
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function cleanNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeText(node.textContent || '')
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const el = node as Element
  const tag = el.tagName
  const inner = Array.from(el.childNodes).map(cleanNode).join('')

  if (!ALLOWED_TAGS.has(tag)) {
    // Tag não permitida: mantém apenas o conteúdo interno (unwrap).
    return inner
  }
  if (tag === 'BR') return '<br>'
  if (tag === 'A') {
    const href = el.getAttribute('href') || ''
    if (/^(https?:|mailto:|\/)/i.test(href)) {
      return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
    }
    return inner
  }
  const t = tag.toLowerCase()
  return `<${t}>${inner}</${t}>`
}

/** Sanitiza HTML mantendo apenas formatação básica e links seguros. */
export function sanitizeHtml(value?: string | null): string {
  if (!value) return ''
  if (typeof document === 'undefined') return value
  const doc = new DOMParser().parseFromString(value, 'text/html')
  return Array.from(doc.body.childNodes).map(cleanNode).join('')
}

/** Converte texto puro (com quebras de linha) em HTML seguro. */
export function plainToHtml(value?: string | null): string {
  if (!value) return ''
  return escapeText(value).replace(/\r?\n/g, '<br>')
}

/** Retorna HTML pronto para exibição, seja a origem HTML ou texto puro. */
export function toDisplayHtml(value?: string | null): string {
  if (!value) return ''
  return containsHtml(value) ? sanitizeHtml(value) : plainToHtml(value)
}

/** Extrai apenas o texto (sem tags) — útil para prévias curtas. */
export function htmlToPlain(value?: string | null): string {
  if (!value) return ''
  if (!containsHtml(value)) return value
  if (typeof document === 'undefined') return value.replace(/<[^>]+>/g, '')
  const doc = new DOMParser().parseFromString(value, 'text/html')
  return (doc.body.textContent || '').trim()
}

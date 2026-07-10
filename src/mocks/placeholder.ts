const PALETTE = ['#e11d7a', '#1d4ed8', '#f59e0b', '#0ea5e9', '#10b981', '#dc2626']

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * Gera uma imagem placeholder deterministica (data URL SVG) para as fotos mockadas,
 * ja que o arquivo real do upload nao chega ao MSW pelo fluxo atual.
 */
export function placeholderImage(seed: string, label = ''): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  const color = PALETTE[hash % PALETTE.length]
  const alt = PALETTE[(hash + 3) % PALETTE.length]
  const text = (label || seed).slice(0, 18)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${alt}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="400" cy="330" r="150" fill="rgba(255,255,255,0.25)"/>
  <text x="400" y="620" font-family="sans-serif" font-size="48" fill="rgba(255,255,255,0.95)" text-anchor="middle">${text}</text>
</svg>`

  return encodeSvg(svg)
}

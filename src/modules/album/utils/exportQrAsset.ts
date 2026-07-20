export interface QrExportLayout {
  url: string
  /** Título principal (ex.: nome do homenageado). */
  headline?: string
  /** Linha secundária (ex.: datas de vida). */
  subtitle?: string
  /** Rodapé curto abaixo do QR. */
  caption?: string
  /** Cor do QR em hex sem # (default preto). */
  qrColor?: string
}

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/'

/** URL da API pública de QR (alta resolução para gravação). */
export function qrCodeImageUrl(value: string, sizePx: number, color = '000000'): string {
  const data = encodeURIComponent(value)
  const hex = color.replace('#', '')
  return `${QR_API}?size=${sizePx}x${sizePx}&margin=16&color=${hex}&data=${data}`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Não foi possível carregar a imagem do QR Code.'))
    img.src = src
  })
}

function triggerDownload(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(href), 4000)
}

function slugifyFilename(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 48)
}

function exportFilename(layout: QrExportLayout, ext: string): string {
  const base = slugifyFilename(layout.headline || 'memorial') || 'memorial'
  return `maylove-qr-${base}.${ext}`
}

/** Composita QR + textos em canvas (2400px — ideal para gravação a laser). */
export async function renderQrExportCanvas(layout: QrExportLayout): Promise<HTMLCanvasElement> {
  const size = 2400
  const padding = 180
  const qrSize = layout.headline || layout.subtitle ? 1680 : 1900
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível neste navegador.')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  let cursorY = padding

  if (layout.headline?.trim()) {
    ctx.fillStyle = '#1c1814'
    ctx.font = '600 96px "Cormorant Garamond", Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(layout.headline.trim(), size / 2, cursorY, size - padding * 2)
    cursorY += 120
  }

  if (layout.subtitle?.trim()) {
    ctx.fillStyle = '#6e655c'
    ctx.font = '400 52px "Hanken Grotesk", system-ui, sans-serif'
    ctx.fillText(layout.subtitle.trim(), size / 2, cursorY, size - padding * 2)
    cursorY += 88
  }

  const qrY = layout.headline || layout.subtitle ? cursorY + 40 : (size - qrSize) / 2
  const qrX = (size - qrSize) / 2

  const qrImg = await loadImage(qrCodeImageUrl(layout.url, 1000, layout.qrColor ?? '1c1814'))
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

  const caption = layout.caption?.trim() || 'Escaneie para ver o memorial'
  ctx.fillStyle = '#8a7a72'
  ctx.font = '400 44px "Hanken Grotesk", system-ui, sans-serif'
  ctx.fillText(caption, size / 2, qrY + qrSize + 56, size - padding * 2)

  ctx.fillStyle = '#c9a86a'
  ctx.font = '600 36px "Hanken Grotesk", system-ui, sans-serif'
  ctx.fillText('MayLov', size / 2, size - padding - 20)

  return canvas
}

export async function downloadQrPng(layout: QrExportLayout): Promise<void> {
  try {
    const canvas = await renderQrExportCanvas(layout)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Falha ao gerar PNG.'))),
        'image/png',
        1,
      )
    })
    triggerDownload(blob, exportFilename(layout, 'png'))
  } catch {
    const response = await fetch(qrCodeImageUrl(layout.url, 1000, layout.qrColor ?? '1c1814'))
    const blob = await response.blob()
    triggerDownload(blob, exportFilename(layout, 'png'))
  }
}

/** PDF A6 (105×148 mm) com QR centralizado — pronto para impressão/gravação. */
export async function downloadQrPdf(layout: QrExportLayout): Promise<void> {
  const canvas = await renderQrExportCanvas(layout)
  const jpegBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Falha ao gerar JPEG.'))),
      'image/jpeg',
      0.94,
    )
  })
  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer())

  const pageW = 298.0
  const pageH = 420.0
  const margin = 24
  const contentW = pageW - margin * 2
  const imgW = contentW
  const imgH = contentW
  const imgX = margin
  const imgY = margin + (pageH - margin * 2 - imgH) / 2

  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const offsets: number[] = [0]
  let length = 0

  const pushText = (text: string) => {
    const bytes = enc.encode(text)
    parts.push(bytes)
    length += bytes.length
  }

  const beginObject = () => {
    offsets.push(length)
  }

  pushText('%PDF-1.4\n')

  beginObject()
  pushText('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')

  beginObject()
  pushText('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')

  beginObject()
  pushText(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
  )

  beginObject()
  pushText(
    `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
  )
  parts.push(jpegBytes)
  length += jpegBytes.length
  pushText('\nendstream\nendobj\n')

  beginObject()
  pushText(
    `<< /Length 44 >> stream\nq ${imgW} 0 0 ${imgH} ${imgX} ${imgY} cm /Im1 Do Q\nendstream\nendobj\n`,
  )

  const xrefStart = length
  pushText(`xref\n0 ${offsets.length}\n`)
  pushText('0000000000 65535 f \n')
  for (let i = 1; i < offsets.length; i += 1) {
    pushText(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`)
  }
  pushText(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`)

  const pdfBytes = concatBytes(...parts)
  triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), exportFilename(layout, 'pdf'))
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

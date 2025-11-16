import { COMERCIO } from "@/config/commerce"

export function buildClienteURL(cid: string, token: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/${COMERCIO.slug}/c?cid=${cid}&t=${token}`
  }
  return `/${COMERCIO.slug}/c?cid=${cid}&t=${token}`
}

export function descargarQRPNG(canvasId: string, filename = "mi-qr.png"): void {
  const canvas = document.querySelector(`#${canvasId} canvas`) as HTMLCanvasElement
  if (!canvas) {
    console.error("Canvas no encontrado")
    return
  }

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

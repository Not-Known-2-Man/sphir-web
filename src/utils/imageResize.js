export const MAX_IMAGE_SIDE = 1200
export const JPEG_QUALITY   = 0.82
export const IMAGE_TYPES    = ['image/jpeg', 'image/png', 'image/webp']

// Pure: target size so the longest side is at most `max`; never upscales.
export function fitSize(width, height, max = MAX_IMAGE_SIDE) {
  if (!(width > 0) || !(height > 0)) throw new Error('Invalid image size')
  const scale = Math.min(1, max / Math.max(width, height))
  return {
    width:  Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

// Browser: File/Blob -> JPEG data URL, longest side <= 1200 px.
export async function resizeToJpegDataUrl(file) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Only JPEG, PNG or WebP images are supported')
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Could not read this image'))
      i.src = url
    })
    const { width, height } = fitSize(img.naturalWidth, img.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'            // JPEG has no alpha: flatten transparency on white
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(url)
  }
}

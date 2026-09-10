/** Resize camera originals locally before upload; never change the original file. */
export async function preparePhoto(file: File): Promise<File> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image conversion unavailable')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image conversion failed')), 'image/jpeg', 0.86)
    })
    if (blob.size > 10 * 1024 * 1024) throw new Error('Image is still too large')
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' })
  } catch {
    // Some browsers cannot decode HEIC. Never silently send an unreadable image.
    if (/^image\/(jpeg|png|webp)$/.test(file.type) && file.size <= 10 * 1024 * 1024) return file
    throw new Error('This photo couldn’t be prepared. Try a JPG, PNG or a screenshot. You can also add photos later.')
  } finally { URL.revokeObjectURL(url) }
}

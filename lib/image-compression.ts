/**
 * Client-side image compression utility
 * Optimizes images for web upload while preserving quality
 */

export interface CompressionSettings {
  quality: number
  maxWidth: number
}

/**
 * Determines optimal compression settings based on file size
 */
export function getOptimalCompressionSettings(fileSize: number): CompressionSettings {
  // Files < 500KB: Skip compression (already optimized)
  if (fileSize < 500 * 1024) {
    return { quality: 0.95, maxWidth: 1600 }
  }
  
  // Files 500KB-1MB: Minimal compression
  if (fileSize < 1024 * 1024) {
    return { quality: 0.95, maxWidth: 1400 }
  }
  
  // Files 1-3MB: Gentle compression
  if (fileSize < 3 * 1024 * 1024) {
    return { quality: 0.9, maxWidth: 1400 }
  }
  
  // Files 3-8MB: Recommended compression (balances quality and size)
  if (fileSize < 8 * 1024 * 1024) {
    return { quality: 0.85, maxWidth: 1200 }
  }
  
  // Files > 8MB: More aggressive compression
  return { quality: 0.8, maxWidth: 1200 }
}

/**
 * Checks if an image should be compressed based on size and dimensions
 */
export async function shouldCompress(file: File): Promise<boolean> {
  // Skip compression for very small files
  if (file.size < 500 * 1024) {
    return false
  }
  
  // Check image dimensions to avoid over-compressing already small images
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const isAlreadySmall = img.width <= 1200 && img.height <= 1200
      resolve(!isAlreadySmall)
    }
    img.onerror = () => resolve(true) // Compress if we can't read dimensions
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Compresses an image file using Canvas API
 * @param file - Original image file
 * @param maxWidth - Maximum width for compressed image (optional)
 * @param quality - Compression quality 0-1 (optional)
 * @returns Promise<File> - Compressed image file
 */
export async function compressImage(
  file: File, 
  maxWidth?: number, 
  quality?: number
): Promise<File> {
  // Get optimal settings if not provided
  const settings = getOptimalCompressionSettings(file.size)
  const finalMaxWidth = maxWidth || settings.maxWidth
  const finalQuality = quality || settings.quality

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      try {
        // Calculate new dimensions while preserving aspect ratio
        let { width, height } = img
        
        // Only resize if image is larger than maxWidth
        if (width > finalMaxWidth) {
          height = (height * finalMaxWidth) / width
          width = finalMaxWidth
        }
        
        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new File object with original name but compressed data
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          finalQuality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Invalid image file'))
    }

    // Load image
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Compresses an image with timeout and fallback
 * @param file - Original image file
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns Promise<File> - Compressed image or original file if compression fails
 */
export async function compressImageWithTimeout(
  file: File,
  timeout: number = 10000
): Promise<File> {
  try {
    // Check if compression is needed
    const needsCompression = await shouldCompress(file)
    if (!needsCompression) {
      return file
    }

    // Attempt compression with timeout
    const compressionPromise = compressImage(file)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Compression timeout')), timeout)
    })

    return await Promise.race([compressionPromise, timeoutPromise])
  } catch (error) {
    console.warn('Image compression failed, using original file:', error)
    return file // Fallback to original file
  }
}

/**
 * Gets file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Calculates compression ratio
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
  return ((originalSize - compressedSize) / originalSize) * 100
}

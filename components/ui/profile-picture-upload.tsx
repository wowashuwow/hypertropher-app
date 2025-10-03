"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null
  onImageChange: (imageUrl: string | null) => void
  onUploadStart?: () => void
  onUploadComplete?: () => void
  onUploadError?: (error: string) => void
  disabled?: boolean
  className?: string
}

export function ProfilePictureUpload({
  currentImageUrl,
  onImageChange,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  disabled = false,
  className
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return "Please select an image file"
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return "File size must be less than 5MB"
    }

    // Check image dimensions (will be validated after load)
    return null
  }

  const resizeImage = (file: File, maxWidth: number = 400, maxHeight: number = 400): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and resize image
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(resizedFile)
            } else {
              reject(new Error('Failed to resize image'))
            }
          },
          'image/jpeg',
          0.9
        )
      }

      img.onerror = () => reject(new Error('Invalid image file'))
      img.src = URL.createObjectURL(file)
    })
  }

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`
    const filePath = `${fileName}`

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`/api/upload-profile-picture`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Upload failed')
    }

    const { url } = await response.json()
    return url
  }

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      onUploadError?.(validationError)
      toast.error(validationError)
      return
    }

    setIsUploading(true)
    onUploadStart?.()

    try {
      // Create preview
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // Resize image
      const resizedFile = await resizeImage(file)

      // Upload to Supabase
      const imageUrl = await uploadToSupabase(resizedFile)

      // Update parent component
      onImageChange(imageUrl)
      onUploadComplete?.()
      toast.success("Profile picture updated successfully!")

      // Clean up preview URL
      URL.revokeObjectURL(preview)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      onUploadError?.(errorMessage)
      toast.error(errorMessage)
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || isUploading) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [disabled, isUploading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.success("Profile picture removed")
  }

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* Profile Picture Display */}
        <div className="relative">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-border"
              />
              {!disabled && (
                <button
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                  aria-label="Remove profile picture"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-4 border-border">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div
          className={cn(
            "w-full max-w-sm border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            dragActive && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "opacity-50 cursor-not-allowed",
            !dragActive && !disabled && !isUploading && "border-border hover:border-primary/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
            aria-label="Upload profile picture"
          />

          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {previewUrl ? "Change picture" : "Upload profile picture"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max 5MB, JPG/PNG/GIF
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upload Button Alternative */}
        {!disabled && !isUploading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="w-full max-w-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            {previewUrl ? "Change Picture" : "Upload Picture"}
          </Button>
        )}
      </div>
    </div>
  )
}

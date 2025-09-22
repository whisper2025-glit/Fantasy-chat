"use client"

import type React from "react"

import { useRef } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageChange: (file: File, preview: string) => void
  previewUrl: string | null
  aspectRatio?: string
  label: string
  description?: string
  className?: string
  isAvatar?: boolean
}

export default function ImageUpload({
  onImageChange,
  previewUrl,
  aspectRatio = "aspect-[3/4]",
  label,
  description,
  className = "",
  isAvatar = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.")
      return
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === "string") {
        onImageChange(file, result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      className={cn(
        `${aspectRatio} bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border border-gray-200 hover:border-blue-600 transition-colors group overflow-hidden`,
        className,
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      {previewUrl ? (
        <div className="relative w-full h-full">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt={label}
            className={cn("w-full h-full object-cover", isAvatar ? "rounded-full" : "")}
            onError={(e) => {
              console.error("Image failed to load:", previewUrl)
              e.currentTarget.src = "/placeholder.svg?height=400&width=300"
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
              <p className="text-[0.75rem]">Change {label}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center group-hover:scale-105 transition-transform">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-[0.75rem] text-gray-500">{label}</span>
          {description && <p className="text-[0.75rem] text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
    </div>
  )
}

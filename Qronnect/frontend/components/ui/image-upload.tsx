'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    onRemove?: () => void
    type: 'logo' | 'favicon' | 'og_image' | 'hero_image' | 'hero_bg' | 'servicios_bg' | 'beneficios_bg' | 'testimonios_bg' | 'cta_final_bg'
    disabled?: boolean
    label?: string
    description?: string
    className?: string
    aspectRatio?: 'square' | 'video' | 'auto'
}

// Inner component to handle image errors safely
const ImagePreviewWithFallback = ({ src }: { src: string }) => {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-red-50 text-red-500 p-4 rounded-md text-center">
                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-xs font-bold">Error de Carga</p>
                <p className="text-[10px] mt-1 text-muted-foreground leading-tight">La imagen se subió pero no es accesible.</p>
                <p className="text-[10px] mt-2 font-medium bg-red-100 px-2 py-1 rounded">
                    Verifica que el bucket &apos;branding&apos; en Supabase sea PÚBLICO.
                </p>
            </div>
        )
    }

    return (
        <Image
            src={src}
            alt="Preview"
            fill
            className="object-contain rounded-md"
            onError={() => setError(true)}
        />
    )
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    type,
    disabled,
    label = 'Subir imagen',
    description,
    className = '',
    aspectRatio = 'auto',
}: ImageUploadProps) {
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
            const token = localStorage.getItem("admin_token")

            const host = window.location.host
            const domain = host.split(":")[0].split(".")[0]

            const response = await fetch(`${API_URL}/api/config/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-Tenant-Domain': domain === "localhost" ? "visionplus" : domain,
                },
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Error al subir imagen')
            }

            const data = await response.json()
            onChange(data.url)
            toast({
                title: 'Imagen subida correctamente',
                description: 'La imagen se ha guardado exitosamente.',
            })
        } catch (error) {
            console.error('Upload error:', error)
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo subir la imagen. Intenta con un archivo más pequeño.',
            })
        } finally {
            setLoading(false)
            // Reset input functionality
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemove = () => {
        if (onRemove) {
            onRemove()
        } else {
            onChange('')
        }
    }

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case 'square': return 'aspect-square'
            case 'video': return 'aspect-video'
            default: return ''
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col gap-2">
                {label && <label className="text-sm font-medium">{label}</label>}
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>

            <div className={`
        relative border-2 border-dashed rounded-lg p-4 transition-colors
        ${!value ? 'hover:bg-gray-50/50' : ''}
        ${getAspectRatioClass()}
        flex flex-col items-center justify-center gap-2
        min-h-[160px]
      `}>
                {loading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-sm">Subiendo...</span>
                    </div>
                ) : value && value.trim() !== '' ? (
                    <div className="relative w-full h-full flex items-center justify-center min-h-[200px]">
                        <div className="relative w-full h-full">
                            <ImagePreviewWithFallback src={value} />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleRemove}
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="absolute bottom-2 right-2 z-10">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled}
                            >
                                Cambiar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-8">
                        <div className="bg-gray-100 p-4 rounded-full">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Seleccionar imagen
                            </Button>
                            <p className="mt-2 text-xs">
                                PNG, JPG, WebP hasta 2MB (5MB para fondos)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleUpload}
                disabled={loading || disabled}
            />
        </div>
    )
}

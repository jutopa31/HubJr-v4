import { useRef, useState } from 'react'
import { ImageIcon, Upload, Trash2, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryImage {
  id: string
  thumbnailUrl: string
  fullUrl: string
  storagePath: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  onUpload?: (files: FileList) => Promise<void>
  onDelete?: (id: string, storagePath: string) => Promise<void>
  isEditable?: boolean
  isUploading?: boolean
  uploadProgress?: { uploaded: number; total: number }
}

export function ImageGallery({
  images,
  onUpload,
  onDelete,
  isEditable,
  isUploading,
  uploadProgress,
}: ImageGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0 && onUpload) {
      onUpload(e.target.files)
      e.target.value = ''
    }
  }

  async function handleDelete(img: GalleryImage) {
    if (!onDelete) return
    setDeletingId(img.id)
    try {
      await onDelete(img.id, img.storagePath)
    } finally {
      setDeletingId(null)
    }
  }

  function prevImage() {
    if (lightbox === null) return
    setLightbox((lightbox - 1 + images.length) % images.length)
  }

  function nextImage() {
    if (lightbox === null) return
    setLightbox((lightbox + 1) % images.length)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Upload bar */}
      {isEditable && (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--tealdim)', color: 'var(--teal)', border: '1px solid rgba(58,115,255,0.20)' }}
          >
            <Upload size={13} />
            Subir imágenes
          </button>
          {isUploading && uploadProgress && (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%`, background: 'var(--teal)' }}
                />
              </div>
              <span className="text-[11px] font-medium flex-shrink-0" style={{ color: 'var(--t2)' }}>
                {uploadProgress.uploaded}/{uploadProgress.total}
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Grid */}
      {images.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl"
          style={{ background: 'var(--bg2)', border: '1px dashed var(--border)' }}
        >
          <ImageIcon size={24} style={{ color: 'var(--t3)' }} />
          <span className="text-[12px]" style={{ color: 'var(--t3)' }}>Sin imágenes</span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square" style={{ background: 'var(--bg3)' }}>
              {img.thumbnailUrl ? (
                <img src={img.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={20} style={{ color: 'var(--t3)' }} />
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(10,15,40,0.55)' }}>
                <button
                  onClick={() => setLightbox(idx)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <ZoomIn size={13} />
                </button>
                {isEditable && onDelete && (
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={deletingId === img.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 disabled:opacity-50"
                    style={{ background: 'rgba(244,63,94,0.4)' }}
                  >
                    {deletingId === img.id
                      ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                      : <Trash2 size={12} />
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
          style={{ background: 'rgba(5,8,20,0.92)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.10)' }}
            onClick={() => setLightbox(null)}
          >
            <X size={16} />
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.10)' }}
                onClick={e => { e.stopPropagation(); prevImage() }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="absolute right-4 w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.10)' }}
                onClick={e => { e.stopPropagation(); nextImage() }}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          <img
            src={images[lightbox].fullUrl || images[lightbox].thumbnailUrl}
            alt=""
            className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-4 text-white/50 text-[11px]">
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}

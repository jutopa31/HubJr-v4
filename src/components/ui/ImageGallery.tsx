import { useRef, useState, useEffect, useCallback } from 'react'
import { ImageIcon, Upload, Trash2, ZoomIn, X, ChevronLeft, ChevronRight, Camera, Clipboard, Video, Play } from 'lucide-react'

interface GalleryItem {
  id: string
  thumbnailUrl: string
  fullUrl: string
  storagePath: string
  isVideo?: boolean
}

interface ImageGalleryProps {
  images: GalleryItem[]
  onUpload?: (files: File[]) => Promise<void>
  onDelete?: (id: string, storagePath: string) => Promise<void>
  isEditable?: boolean
  isUploading?: boolean
  uploadProgress?: { uploaded: number; total: number }
}

const ACCEPTED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ACCEPTED_VIDEO = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']
const ACCEPTED_ALL = [...ACCEPTED_IMAGE, ...ACCEPTED_VIDEO]
const MAX_SIZE_MB = 50

function isVideoFile(file: File) {
  return file.type.startsWith('video/')
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|m4v)$/i.test(url)
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
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const [lightbox, setLightbox] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pasteToast, setPasteToast] = useState(false)

  // ── Clipboard paste ──────────────────────────────────────────────────────
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!isEditable || !onUpload) return
    const files: File[] = []
    const items = e.clipboardData?.items ?? []
    for (const item of Array.from(items)) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file && ACCEPTED_ALL.includes(file.type)) {
          if (file.size > MAX_SIZE_MB * 1024 * 1024) continue
          files.push(file)
        }
      }
    }
    if (files.length > 0) {
      setPasteToast(true)
      setTimeout(() => setPasteToast(false), 2000)
      onUpload(files)
    }
  }, [isEditable, onUpload])

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  // ── Keyboard navigation for lightbox ────────────────────────────────────
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (lightbox === null) return
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') setLightbox(i => i !== null ? (i - 1 + images.length) % images.length : null)
      if (e.key === 'ArrowRight') setLightbox(i => i !== null ? (i + 1) % images.length : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, images.length])

  // ── Drag & drop ──────────────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (!isEditable || !onUpload) return
    const files = Array.from(e.dataTransfer.files).filter(f =>
      ACCEPTED_ALL.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024
    )
    if (files.length > 0) onUpload(files)
  }

  // ── File input handlers ──────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter(f =>
      ACCEPTED_ALL.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024
    )
    if (files.length > 0 && onUpload) onUpload(files)
    e.target.value = ''
  }

  async function handleDelete(item: GalleryItem) {
    if (!onDelete) return
    setDeletingId(item.id)
    try { await onDelete(item.id, item.storagePath) }
    finally { setDeletingId(null) }
  }

  const currentItem = lightbox !== null ? images[lightbox] : null
  const currentIsVideo = currentItem
    ? (currentItem.isVideo || isVideoUrl(currentItem.fullUrl || currentItem.thumbnailUrl))
    : false

  return (
    <div
      ref={dropZoneRef}
      className="flex flex-col gap-3 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl pointer-events-none"
          style={{ background: 'rgba(58,115,255,0.10)', border: '2px dashed var(--teal)' }}
        >
          <span className="text-[13px] font-semibold" style={{ color: 'var(--teal)' }}>
            Soltar para subir
          </span>
        </div>
      )}

      {/* Paste toast */}
      {pasteToast && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white animate-fadeIn"
          style={{ background: 'var(--teal)', zIndex: 20 }}
        >
          Imagen pegada desde portapapeles
        </div>
      )}

      {/* Upload toolbar */}
      {isEditable && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Archivos (imagen + video) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--tealdim)', color: 'var(--teal)', border: '1px solid rgba(58,115,255,0.20)' }}
          >
            <Upload size={13} />
            Subir archivo
          </button>

          {/* Cámara (mobile) */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--indigodim)', color: 'var(--indigo)', border: '1px solid rgba(99,102,241,0.20)' }}
          >
            <Camera size={13} />
            Cámara
          </button>

          {/* Video */}
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--amberdim)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.20)' }}
          >
            <Video size={13} />
            Video
          </button>

          {/* Paste hint */}
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px]" style={{ color: 'var(--t3)', border: '1px dashed var(--border)' }}>
            <Clipboard size={11} />
            Ctrl+V para pegar
          </div>

          {/* Progress bar */}
          {isUploading && uploadProgress && (
            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
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

          {/* Hidden inputs */}
          <input ref={fileInputRef} type="file" accept={ACCEPTED_ALL.join(',')} multiple className="hidden" onChange={handleFileChange} />
          <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" multiple className="hidden" onChange={handleFileChange} />
          <input ref={videoInputRef} type="file" accept={ACCEPTED_VIDEO.join(',')} multiple className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {/* Drop zone hint when empty */}
      {images.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-12 rounded-xl transition-all"
          style={{
            background: isDragging ? 'rgba(58,115,255,0.06)' : 'var(--bg2)',
            border: `1px dashed ${isDragging ? 'var(--teal)' : 'var(--border)'}`,
          }}
        >
          <ImageIcon size={24} style={{ color: 'var(--t3)' }} />
          <span className="text-[12px]" style={{ color: 'var(--t3)' }}>
            Sin archivos — arrastrá, pegá o usá los botones de arriba
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {images.map((item, idx) => {
            const isVid = item.isVideo || isVideoUrl(item.thumbnailUrl || item.fullUrl)
            return (
              <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square" style={{ background: 'var(--bg3)' }}>
                {isVid ? (
                  <>
                    <video src={item.thumbnailUrl || item.fullUrl} className="w-full h-full object-cover" muted preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(10,15,40,0.65)' }}>
                        <Play size={14} className="text-white ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={20} style={{ color: 'var(--t3)' }} />
                  </div>
                )}

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(10,15,40,0.55)' }}
                >
                  <button
                    onClick={() => setLightbox(idx)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    {isVid ? <Play size={13} /> : <ZoomIn size={13} />}
                  </button>
                  {isEditable && onDelete && (
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 disabled:opacity-50"
                      style={{ background: 'rgba(244,63,94,0.4)' }}
                    >
                      {deletingId === item.id
                        ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                        : <Trash2 size={12} />
                      }
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && currentItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
          style={{ background: 'rgba(5,8,20,0.94)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}
            onClick={() => setLightbox(null)}
          >
            <X size={16} />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}
                onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? (i - 1 + images.length) % images.length : null) }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="absolute right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}
                onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? (i + 1) % images.length : null) }}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {currentIsVideo ? (
            <video
              src={currentItem.fullUrl || currentItem.thumbnailUrl}
              controls
              autoPlay
              className="max-h-[85vh] max-w-[85vw] rounded-xl"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <img
              src={currentItem.fullUrl || currentItem.thumbnailUrl}
              alt=""
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          )}

          <div className="absolute bottom-4 text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}

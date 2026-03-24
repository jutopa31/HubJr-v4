import { supabase } from './supabase'

const BUCKET = 'ward-images'

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, 'n')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '')
}

function buildPath(patientId: string, fileName: string): string {
  return `patients/${patientId}/${Date.now()}-${sanitizeFilename(fileName)}`
}

export interface UploadedImage {
  path: string
  fullUrl: string
}

export async function uploadImageToStorage(file: File, patientId: string): Promise<UploadedImage> {
  if (!supabase) throw new Error('Supabase no disponible')
  if (file.size > 10 * 1024 * 1024) throw new Error('Imagen demasiado grande (máx 10 MB)')

  const path = buildPath(patientId, file.name)
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg' })
  if (uploadError) throw uploadError

  let fullUrl = ''
  try {
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60)
    fullUrl = signed?.signedUrl ?? ''
  } catch {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
    fullUrl = pub?.publicUrl ?? ''
  }

  return { path, fullUrl }
}

export async function uploadMultipleImagesToStorage(
  files: FileList | File[],
  patientId: string
): Promise<UploadedImage[]> {
  if (!supabase) throw new Error('Supabase no disponible')
  const arr = Array.from(files)
  if (arr.length === 0) return []
  return Promise.all(arr.map(f => uploadImageToStorage(f, patientId)))
}

export async function deleteImageFromStorage(path: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

export async function refreshSignedUrl(path: string): Promise<string> {
  if (!supabase) return ''
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60)
  return data?.signedUrl ?? ''
}

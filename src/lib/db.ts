import { supabase, IS_MOCK } from './supabase'
import { RESIDENTS, PATIENTS, TASKS, EVENTS, READINGS } from '../data/mock'
import type { Patient, PatientChart, PatientImage, ChartSectionKey, Task, CalEvent, Reading } from '../types'

// Build a mapping from profile UUID → resident numeric ID using email matching
function buildResidentIdMap(profiles: { id: string; email?: string; full_name?: string }[]): Map<string, number> {
  const map = new Map<string, number>()
  let nextId = RESIDENTS.length + 1
  for (const p of profiles) {
    const resident = p.email ? RESIDENTS.find(r => r.email === p.email) : undefined
    if (resident) {
      map.set(p.id, resident.id)
    } else {
      map.set(p.id, nextId++)
    }
  }
  return map
}

// Profiles
export async function getProfiles() {
  if (IS_MOCK) return RESIDENTS
  const { data, error } = await supabase!.from('profiles').select('*')
  if (error) throw error
  return data ?? []
}

export async function getMyProfile(userId: string) {
  if (IS_MOCK) return null
  const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

// Patients with assignments and evolutions
export async function getPatients(): Promise<Patient[]> {
  if (IS_MOCK) return PATIENTS

  const [patientsRes, assignmentsRes, evolutionsRes, profilesRes] = await Promise.all([
    supabase!.from('patients').select('*'),
    supabase!.from('patient_assignments').select('*'),
    supabase!.from('evolutions').select('*').order('date', { ascending: true }),
    supabase!.from('profiles').select('id, email, full_name'),
  ])

  if (patientsRes.error) throw patientsRes.error

  const profiles = profilesRes.data ?? []
  const idMap = buildResidentIdMap(profiles)

  const patients = patientsRes.data ?? []
  const assignments = assignmentsRes.data ?? []
  const evolutions = evolutionsRes.data ?? []

  return patients.map((p: Record<string, unknown>) => ({
    id: String(p.id),
    age: Number(p.age),
    sex: (p.sex as 'M' | 'F') ?? 'M',
    sector: String(p.sector ?? ''),
    status: String(p.status ?? 'internado') as Patient['status'],
    diagnosis: String(p.diagnosis ?? ''),
    assignedTo: assignments
      .filter((a: Record<string, unknown>) => a.patient_id === p.id)
      .map((a: Record<string, unknown>) => idMap.get(String(a.profile_id)) ?? 0)
      .filter(Boolean),
    evolutions: evolutions
      .filter((e: Record<string, unknown>) => e.patient_id === p.id)
      .map((e: Record<string, unknown>) => ({
        date: String(e.date ?? ''),
        author: idMap.get(String(e.author_id)) ?? 0,
        text: String(e.text ?? ''),
      })),
  }))
}

// Tasks with assigned profile info
export async function getTasks(): Promise<Task[]> {
  if (IS_MOCK) return TASKS

  const [tasksRes, profilesRes] = await Promise.all([
    supabase!.from('tasks').select('*'),
    supabase!.from('profiles').select('id, email, full_name'),
  ])

  if (tasksRes.error) throw tasksRes.error

  const profiles = profilesRes.data ?? []
  const idMap = buildResidentIdMap(profiles)

  const tasks = tasksRes.data ?? []
  if (tasks.length === 0) return TASKS
  return tasks.map((t: Record<string, unknown>, idx: number) => ({
    id: typeof t.id === 'number' ? t.id : idx + 1,
    title: String(t.title ?? ''),
    assignedTo: idMap.get(String(t.assigned_to)) ?? 0,
    status: String(t.status ?? 'pendiente') as Task['status'],
    priority: String(t.priority ?? 'media') as Task['priority'],
    due: String(t.due ?? ''),
    type: String(t.type ?? 'clinica') as Task['type'],
  }))
}

// Events
export async function getEvents(): Promise<CalEvent[]> {
  if (IS_MOCK) return EVENTS

  const [eventsRes, profilesRes] = await Promise.all([
    supabase!.from('events').select('*').order('date', { ascending: true }),
    supabase!.from('profiles').select('id, email, full_name'),
  ])

  if (eventsRes.error) throw eventsRes.error

  const profiles = profilesRes.data ?? []
  const idMap = buildResidentIdMap(profiles)

  const events = eventsRes.data ?? []
  return events.map((e: Record<string, unknown>, idx: number) => ({
    id: typeof e.id === 'number' ? e.id : idx + 1,
    title: String(e.title ?? ''),
    date: String(e.date ?? ''),
    time: String(e.time ?? ''),
    type: String(e.type ?? 'ateneo') as CalEvent['type'],
    loc: String(e.loc ?? e.location ?? ''),
    presenter: e.presenter_id ? (idMap.get(String(e.presenter_id)) ?? null) : null,
    desc: String(e.desc ?? e.description ?? ''),
  }))
}

// Readings with assignments
export async function getReadings(): Promise<Reading[]> {
  if (IS_MOCK) return READINGS

  const [readingsRes, assignmentsRes, profilesRes] = await Promise.all([
    supabase!.from('readings').select('*'),
    supabase!.from('reading_assignments').select('*'),
    supabase!.from('profiles').select('id, email, full_name'),
  ])

  if (readingsRes.error) throw readingsRes.error

  const profiles = profilesRes.data ?? []
  const idMap = buildResidentIdMap(profiles)

  const readings = readingsRes.data ?? []
  const assignments = assignmentsRes.data ?? []

  return readings.map((r: Record<string, unknown>, idx: number) => ({
    id: typeof r.id === 'number' ? r.id : idx + 1,
    title: String(r.title ?? ''),
    journal: String(r.journal ?? ''),
    type: String(r.type ?? 'articulo') as Reading['type'],
    mandatory: Boolean(r.mandatory),
    assignedTo: assignments
      .filter((a: Record<string, unknown>) => a.reading_id === r.id)
      .map((a: Record<string, unknown>) => idMap.get(String(a.profile_id)) ?? 0)
      .filter(Boolean),
  }))
}

// Mutations

export async function createTask(data: Omit<Task, 'id'>, userId: string): Promise<void> {
  if (IS_MOCK) return
  const { error } = await supabase!.from('tasks').insert({
    title: data.title,
    assigned_to: userId,
    status: data.status,
    priority: data.priority,
    due: data.due,
    type: data.type,
  })
  if (error) throw error
}

export async function updateTaskStatus(id: number, status: Task['status']): Promise<void> {
  if (IS_MOCK) return
  const { error } = await supabase!.from('tasks').update({ status }).eq('id', id)
  if (error) throw error
}

export async function addEvolution(patientId: string, text: string, authorId: string): Promise<void> {
  if (IS_MOCK) return
  const { error } = await supabase!.from('evolutions').insert({
    patient_id: patientId,
    text,
    author_id: authorId,
    date: new Date().toISOString().slice(0, 10),
  })
  if (error) throw error
}

// ── Patient Chart ──────────────────────────────────────────────────────────

export async function getPatientChart(patientId: string): Promise<PatientChart | null> {
  if (IS_MOCK) {
    return PATIENTS.find(p => p.id === patientId)?.chart ?? null
  }
  const { data, error } = await supabase!
    .from('patient_charts')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    patientId: data.patient_id,
    antecedentes: data.antecedentes ?? '',
    motivoConsulta: data.motivo_consulta ?? '',
    examenFisico: data.examen_fisico ?? '',
    estudiosComplementarios: data.estudios_complementarios ?? '',
    diagnostico: data.diagnostico ?? '',
    plan: data.plan ?? '',
    pendientes: data.pendientes ?? '',
    updatedAt: data.updated_at ?? '',
    updatedBy: 0,
  }
}

export async function upsertPatientChart(
  patientId: string,
  data: Partial<Record<ChartSectionKey, string>>,
  _authorId: string
): Promise<void> {
  if (IS_MOCK) return
  const payload: Record<string, string> = { patient_id: patientId }
  if (data.antecedentes !== undefined)            payload.antecedentes = data.antecedentes
  if (data.motivoConsulta !== undefined)          payload.motivo_consulta = data.motivoConsulta
  if (data.examenFisico !== undefined)            payload.examen_fisico = data.examenFisico
  if (data.estudiosComplementarios !== undefined) payload.estudios_complementarios = data.estudiosComplementarios
  if (data.diagnostico !== undefined)             payload.diagnostico = data.diagnostico
  if (data.plan !== undefined)                    payload.plan = data.plan
  if (data.pendientes !== undefined)              payload.pendientes = data.pendientes
  const { error } = await supabase!
    .from('patient_charts')
    .upsert(payload, { onConflict: 'patient_id' })
  if (error) throw error
}

// ── Patient Images ──────────────────────────────────────────────────────────

export async function getPatientImages(patientId: string): Promise<PatientImage[]> {
  if (IS_MOCK) {
    return PATIENTS.find(p => p.id === patientId)?.images ?? []
  }
  const { data, error } = await supabase!
    .from('patient_images')
    .select('*')
    .eq('patient_id', patientId)
    .order('uploaded_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    patientId: String(r.patient_id),
    thumbnailUrl: String(r.thumbnail_url ?? ''),
    fullUrl: String(r.full_url ?? ''),
    storagePath: String(r.storage_path ?? ''),
    uploadedAt: String(r.uploaded_at ?? ''),
    uploadedBy: 0,
  }))
}

export async function addPatientImage(
  patientId: string,
  thumbnailUrl: string,
  fullUrl: string,
  storagePath: string,
  authorId: string
): Promise<PatientImage> {
  if (IS_MOCK) {
    return {
      id: `mock-${Date.now()}`,
      patientId,
      thumbnailUrl,
      fullUrl,
      storagePath,
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: 0,
    }
  }
  const { data, error } = await supabase!
    .from('patient_images')
    .insert({ patient_id: patientId, thumbnail_url: thumbnailUrl, full_url: fullUrl, storage_path: storagePath, uploaded_by: authorId })
    .select()
    .single()
  if (error) throw error
  return {
    id: String(data.id),
    patientId: String(data.patient_id),
    thumbnailUrl: String(data.thumbnail_url),
    fullUrl: String(data.full_url),
    storagePath: String(data.storage_path),
    uploadedAt: String(data.uploaded_at),
    uploadedBy: 0,
  }
}

export async function deletePatientImage(imageId: string, _storagePath: string): Promise<void> {
  if (IS_MOCK) return
  const { error } = await supabase!.from('patient_images').delete().eq('id', imageId)
  if (error) throw error
}

export async function createEvent(data: Omit<CalEvent, 'id'>, userId: string): Promise<void> {
  if (IS_MOCK) return
  const { error } = await supabase!.from('events').insert({
    title: data.title,
    date: data.date,
    time: data.time,
    type: data.type,
    loc: data.loc,
    presenter_id: data.presenter ?? null,
    desc: data.desc,
    created_by: userId,
  })
  if (error) throw error
}

import { supabase, IS_MOCK } from './supabase'
import { RESIDENTS, PATIENTS, TASKS, EVENTS, READINGS } from '../data/mock'
import type { Patient, Task, CalEvent, Reading } from '../types'

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

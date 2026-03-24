export type Role = 'jefe' | 'residente'
export type PatientStatus = 'internado' | 'ambulatorio' | 'guardia' | 'alta'
export type TaskStatus = 'pendiente' | 'en_curso' | 'completada'
export type TaskPriority = 'alta' | 'media' | 'baja'
export type TaskType = 'clinica' | 'academica' | 'presentacion' | 'clase' | 'admin'
export type EventType = 'ateneo' | 'clase' | 'guardia' | 'presentacion'
export type ReadingType = 'guia' | 'articulo' | 'revision'

export interface AppUser {
  id: string
  email: string
  name: string
  role: Role
  residentId?: number
}

export interface Resident {
  id: number
  name: string
  full: string
  initial: string
  color: string
  bg: string
  email: string
}

export interface Evolution {
  date: string
  author: number
  text: string
}

export interface Patient {
  id: string
  age: number
  sex: 'M' | 'F'
  sector: string
  status: PatientStatus
  diagnosis: string
  assignedTo: number[]
  evolutions: Evolution[]
}

export interface Task {
  id: number
  title: string
  assignedTo: number
  status: TaskStatus
  priority: TaskPriority
  due: string
  type: TaskType
}

export interface CalEvent {
  id: number
  title: string
  date: string
  time: string
  type: EventType
  loc: string
  presenter: number | null
  desc: string
}

export interface Reading {
  id: number
  title: string
  journal: string
  type: ReadingType
  assignedTo: number[]
  mandatory: boolean
}

export type Section = 'dashboard' | 'pacientes' | 'tareas' | 'calendario' | 'academia'

export type ResidentEstado = 'disponible' | 'rotando' | 'licencia'
export type LicenciaType = 'vacaciones' | 'medica' | 'congreso' | 'otra'

export interface Licencia {
  id: number
  residentId: number
  from: string
  to: string
  type: LicenciaType
}

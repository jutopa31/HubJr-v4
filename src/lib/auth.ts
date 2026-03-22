import { supabase, IS_MOCK } from './supabase'
import type { AppUser, Role } from '../types'
import { RESIDENTS } from '../data/mock'

function mockLoginFn(email: string, _password: string): AppUser | null {
  const isJefe = email.toLowerCase().includes('jefe') || email === 'jefe@residencia.com'
  if (isJefe) {
    return { id: 'jefe-1', email, name: 'Dr. Jutopa', role: 'jefe' as Role }
  }
  const resident = RESIDENTS.find(r => r.email === email)
  if (resident) {
    return { id: `res-${resident.id}`, email, name: resident.full, role: 'residente' as Role, residentId: resident.id }
  }
  // For demo: any email works as residente
  const namePart = email.split('@')[0]
  return { id: `res-demo`, email, name: namePart, role: 'residente' as Role }
}

export async function login(email: string, password: string): Promise<AppUser> {
  if (IS_MOCK) {
    const user = mockLoginFn(email, password)
    if (!user) throw new Error('Credenciales inválidas')
    return user
  }

  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
  if (error) throw error

  const { data: profile } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  // Try to match email to a resident for residentId
  const resident = RESIDENTS.find(r => r.email === email)

  return {
    id: data.user.id,
    email: data.user.email!,
    name: profile?.full_name ?? email,
    role: (profile?.role ?? 'residente') as Role,
    residentId: resident?.id,
  }
}

export async function logout(): Promise<void> {
  if (!IS_MOCK) await supabase!.auth.signOut()
}

export async function getSession(): Promise<AppUser | null> {
  if (IS_MOCK) return null
  const { data: { session } } = await supabase!.auth.getSession()
  if (!session) return null

  const { data: profile } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const resident = RESIDENTS.find(r => r.email === session.user.email)

  return {
    id: session.user.id,
    email: session.user.email!,
    name: profile?.full_name ?? session.user.email!,
    role: (profile?.role ?? 'residente') as Role,
    residentId: resident?.id,
  }
}

// Keep the old export so any remaining callers don't break during transition
export const mockLogin = (email: string, password: string) => mockLoginFn(email, password)

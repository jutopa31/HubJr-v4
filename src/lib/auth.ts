import type { AppUser, Role } from '../types'
import { RESIDENTS } from '../data/mock'

// Mock auth — replace with Supabase auth when configured
export function mockLogin(email: string, _password: string): AppUser | null {
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

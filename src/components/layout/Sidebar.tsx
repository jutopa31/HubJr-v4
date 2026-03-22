import { LayoutDashboard, Users, CheckSquare, Calendar, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Section, AppUser } from '../../types'
import { PATIENTS, TASKS, READINGS } from '../../data/mock'

interface SidebarProps {
  section: Section
  onNavigate: (s: Section) => void
  user: AppUser
}

const activePatients = PATIENTS.filter(p => p.status === 'internado' || p.status === 'guardia').length
const pendingTasks = TASKS.filter(t => t.status === 'pendiente').length
const mandatoryReadings = READINGS.filter(r => r.mandatory).length

const navItems: { id: Section; label: string; icon: LucideIcon; badge?: { count: number; variant: 'teal' | 'red' | 'amber' } }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pacientes', label: 'Pacientes', icon: Users, badge: { count: activePatients, variant: 'teal' } },
  { id: 'tareas', label: 'Tareas', icon: CheckSquare, badge: { count: pendingTasks, variant: 'red' } },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'academia', label: 'Academia', icon: BookOpen, badge: { count: mandatoryReadings, variant: 'amber' } },
]

const badgeVariantStyle: Record<string, string> = {
  teal: 'bg-[var(--tealdim)] text-teal',
  red: 'bg-[var(--reddim)] text-red',
  amber: 'bg-[var(--amberdim)] text-amber',
}

export function Sidebar({ section, onNavigate, user }: SidebarProps) {
  return (
    <aside
      className="flex flex-col flex-shrink-0 relative z-10"
      style={{ width: 224, background: 'var(--bg1)', boxShadow: '2px 0 20px rgba(30,50,120,0.07)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3A73FF 0%, #6EA4FF 100%)', boxShadow: '0 4px 12px rgba(58,115,255,0.30)' }}
          >
            <span className="font-syne font-black text-white text-[13px] tracking-tight">H</span>
          </div>
          <div>
            <div className="font-syne font-extrabold text-t1 text-[14px] leading-tight">HubJr</div>
            <div className="text-t3 text-[9.5px] leading-tight font-medium tracking-wide uppercase">Residencia · v4</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        <div className="text-[9px] font-bold text-t3 uppercase tracking-widest px-2 mb-2">Menú</div>
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = section === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                isActive ? '' : 'text-t2 hover:text-t1'
              }`}
              style={isActive
                ? { background: 'linear-gradient(135deg, rgba(58,115,255,0.12) 0%, rgba(110,164,255,0.08) 100%)', color: 'var(--teal)', boxShadow: 'inset 0 0 0 1px rgba(58,115,255,0.20)' }
                : {}}
            >
              <Icon size={15} style={{ color: isActive ? 'var(--teal)' : 'var(--t3)' }} />
              <span className={`text-[13px] flex-1 ${isActive ? 'font-bold font-syne' : 'font-medium'}`}>{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeVariantStyle[item.badge.variant]}`}>
                  {item.badge.count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User card */}
      <div className="p-3 mt-auto">
        <div
          className="p-3 rounded-2xl flex items-center gap-3"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-syne font-black text-[11px]"
            style={{
              background: user.role === 'jefe'
                ? 'linear-gradient(135deg, #3A73FF, #6EA4FF)'
                : 'linear-gradient(135deg, #6366F1, #A5B4FC)',
              color: '#fff',
              boxShadow: user.role === 'jefe' ? '0 2px 8px rgba(58,115,255,0.30)' : '0 2px 8px rgba(99,102,241,0.30)',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-t1 text-[11.5px] font-semibold truncate">{user.name}</div>
            <div className="text-[9.5px] font-medium" style={{ color: user.role === 'jefe' ? 'var(--teal)' : 'var(--indigo)' }}>
              {user.role === 'jefe' ? '★ Jefatura' : 'Residente'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

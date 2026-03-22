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
      style={{ width: 220, background: 'var(--bg1)', borderRight: '1px solid var(--border)' }}
    >
      {/* Teal gradient accent line at top */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: 2, background: 'linear-gradient(90deg, var(--teal) 0%, transparent 100%)' }}
      />

      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--tealdim)', border: '1px solid var(--borderact)' }}
          >
            <span className="font-syne font-bold text-teal text-sm">H</span>
          </div>
          <div>
            <div className="font-syne font-bold text-t1 text-[13px] leading-tight">HubJr V4</div>
            <div className="text-t3 text-[9px] leading-tight font-mono">Neurología</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = section === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group ${
                isActive
                  ? 'text-teal'
                  : 'text-t2 hover:text-t1 hover:bg-bg2'
              }`}
              style={isActive ? { background: 'var(--tealdim)', border: '1px solid var(--borderact)' } : { border: '1px solid transparent' }}
            >
              <Icon size={15} className={isActive ? 'text-teal' : 'text-t3 group-hover:text-t2'} />
              <span className={`text-[12.5px] font-medium flex-1 ${isActive ? 'font-syne' : ''}`}>{item.label}</span>
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
          className="p-3 rounded-lg"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: user.role === 'jefe' ? 'var(--tealdim)' : 'var(--indigodim)',
                color: user.role === 'jefe' ? 'var(--teal)' : 'var(--indigo)',
              }}
            >
              <span className="font-syne font-bold text-[11px]">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-t1 text-[11px] font-medium truncate">{user.name}</div>
              <div className={`text-[9px] font-medium ${user.role === 'jefe' ? 'text-teal' : 'text-indigo'}`}>
                {user.role === 'jefe' ? 'Jefatura' : 'Residente'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

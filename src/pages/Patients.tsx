import { useState } from 'react'
import type { AppUser, Patient, PatientStatus } from '../types'
import { PATIENTS, RESIDENTS } from '../data/mock'
import { Avatar } from '../components/ui/Avatar'
import { statusBadge } from '../components/ui/Badge'
import { Search, X, User, ChevronRight, Clock } from 'lucide-react'

interface PatientsProps {
  user: AppUser
}

const STATUS_FILTERS: { value: PatientStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'internado', label: 'Internados' },
  { value: 'ambulatorio', label: 'Ambulatorio' },
  { value: 'guardia', label: 'Guardia' },
  { value: 'alta', label: 'Alta' },
]

function PatientModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const assignees = RESIDENTS.filter(r => patient.assignedTo.includes(r.id))
  const sortedEvolutions = [...patient.evolutions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-end animate-fadeIn"
      style={{ background: 'rgba(7,8,13,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="h-full w-full max-w-[480px] overflow-y-auto animate-slideUp flex flex-col"
        style={{ background: 'var(--bg1)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sticky top-0" style={{ background: 'var(--bg1)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="font-mono text-teal text-[11px] mb-1">{patient.id}</div>
            <h2 className="font-syne font-bold text-t1 text-[16px] leading-tight">{patient.diagnosis}</h2>
            <div className="flex items-center gap-2 mt-2">
              {statusBadge(patient.status)}
              <span className="text-t3 text-[11px] font-medium">{patient.age} años · {patient.sex === 'M' ? 'Masculino' : 'Femenino'}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-t3 hover:text-t1 transition-colors p-1 rounded-lg hover:bg-bg3">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Info */}
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="text-t2 text-[11px] mb-2 font-medium uppercase tracking-wider">Información</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-t2 text-[11px]">Sector</div>
                <div className="text-t1 text-[12px] mt-0.5">{patient.sector}</div>
              </div>
              <div>
                <div className="text-t2 text-[11px]">Estado</div>
                <div className="mt-0.5">{statusBadge(patient.status)}</div>
              </div>
            </div>
          </div>

          {/* Assigned */}
          <div>
            <div className="text-t2 text-[11px] mb-2 font-medium uppercase tracking-wider">Equipo asignado</div>
            <div className="flex flex-wrap gap-2">
              {assignees.map(res => (
                <div key={res.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <Avatar resident={res} size="sm" />
                  <span className="text-t1 text-[11px]">{res.full}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evolutions */}
          <div>
            <div className="text-t2 text-[11px] mb-3 font-medium uppercase tracking-wider">
              Evoluciones ({patient.evolutions.length})
            </div>
            <div className="flex flex-col gap-3">
              {sortedEvolutions.map((ev, i) => {
                const author = RESIDENTS.find(r => r.id === ev.author)
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {author && <Avatar resident={author} size="sm" />}
                      {i < sortedEvolutions.length - 1 && (
                        <div className="flex-1 w-px mt-1" style={{ background: 'var(--border)' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        {author && <span className="text-[11px] font-medium" style={{ color: author.color }}>{author.full}</span>}
                        <div className="flex items-center gap-1 text-t3 text-[11px] font-medium">
                          <Clock size={9} />
                          {ev.date}
                        </div>
                      </div>
                      <p className="text-t2 text-[12px] leading-relaxed">{ev.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Patients({ user: _user }: PatientsProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all')
  const [selected, setSelected] = useState<Patient | null>(null)

  const filtered = PATIENTS.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchSearch = !search || p.diagnosis.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.sector.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 relative z-10">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por diagnóstico, ID, sector..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-[12px] text-t1 placeholder-t3 outline-none"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
          />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={statusFilter === f.value
                ? { background: 'var(--tealdim)', color: 'var(--teal)', border: '1px solid var(--borderact)' }
                : { background: 'var(--bg1)', color: 'var(--t2)', border: '1px solid var(--border)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patient grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(patient => {
          const assignees = RESIDENTS.filter(r => patient.assignedTo.includes(r.id))
          const lastEv = patient.evolutions[patient.evolutions.length - 1]
          return (
            <button
              key={patient.id}
              onClick={() => setSelected(patient)}
              className="text-left p-4 rounded-xl transition-all hover:border-[var(--borderact)] group"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono text-teal text-[11px] mb-1">{patient.id}</div>
                  <div className="font-syne font-semibold text-t1 text-[13px] leading-tight pr-2">{patient.diagnosis}</div>
                </div>
                <ChevronRight size={14} className="text-t3 group-hover:text-t2 flex-shrink-0 mt-0.5 transition-colors" />
              </div>

              <div className="flex items-center gap-2 mb-3">
                {statusBadge(patient.status)}
                <span className="text-t3 text-[11px] font-medium">{patient.age} años · {patient.sex === 'M' ? 'M' : 'F'}</span>
              </div>

              <div className="flex items-center gap-1.5 mb-3 text-t3 text-[11px] font-medium">
                <User size={10} />
                {patient.sector}
              </div>

              {lastEv && (
                <p className="text-t3 text-[11px] leading-relaxed line-clamp-2 mb-3 border-t pt-2.5" style={{ borderColor: 'var(--border)' }}>
                  {lastEv.text}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-auto">
                {assignees.map(res => (
                  <Avatar key={res.id} resident={res} size="sm" />
                ))}
                <span className="text-t2 text-[11px] ml-1">{assignees.map(r => r.name).join(', ')}</span>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-t3 text-[12px]">
          Sin resultados para la búsqueda actual.
        </div>
      )}

      {selected && <PatientModal patient={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

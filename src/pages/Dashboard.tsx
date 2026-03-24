import { useState } from 'react'
import type { AppUser, ResidentEstado } from '../types'
import { PATIENTS, TASKS, EVENTS, RESIDENTS, LICENCIAS } from '../data/mock'
import { Avatar } from '../components/ui/Avatar'
import { statusBadge, typeBadge } from '../components/ui/Badge'

interface DashboardProps {
  user: AppUser
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_NAMES_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const RESIDENCY_SCHEDULE: Record<number, { label: string; time?: string }> = {
  1: { label: 'Ateneo', time: '07:45' },
  2: { label: 'Trabajos científicos' },
  3: { label: 'Clases curso superior' },
  4: { label: 'Ateneo interhospitalario' },
  5: { label: 'Presentación de casos' },
}

const ESTADO_CYCLE: ResidentEstado[] = ['disponible', 'rotando', 'licencia']
const ESTADO_LABEL: Record<ResidentEstado, string> = {
  disponible: 'Disponible',
  rotando: 'Rotando',
  licencia: 'Licencia',
}
const ESTADO_STYLE: Record<ResidentEstado, { bg: string; color: string }> = {
  disponible: { bg: 'var(--tealdim)', color: 'var(--teal)' },
  rotando:    { bg: 'var(--indigodim)', color: 'var(--indigo)' },
  licencia:   { bg: 'var(--reddim)', color: 'var(--red)' },
}

const LICENCIA_COLOR: Record<string, string> = {
  vacaciones: 'var(--teal)',
  medica: 'var(--red)',
  congreso: 'var(--indigo)',
  otra: 'var(--amber)',
}

function getWeekDays(today: Date) {
  const days = []
  const mon = new Date(today)
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay()
  mon.setDate(today.getDate() + diff)
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    days.push(d)
  }
  return days
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: (Date | null)[] = []
  // pad start
  let startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  for (let i = 0; i < startPad; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function isInRange(date: string, from: string, to: string) {
  return date >= from && date <= to
}

const eventTypeColor: Record<string, string> = {
  ateneo: 'var(--teal)',
  clase: 'var(--indigo)',
  guardia: 'var(--amber)',
  presentacion: 'var(--red)',
}

export function Dashboard({ user: _user }: DashboardProps) {
  const today = new Date('2026-03-22')
  const weekDays = getWeekDays(today)

  const [estados, setEstados] = useState<Record<number, ResidentEstado>>(
    () => Object.fromEntries(RESIDENTS.map(r => [r.id, 'disponible' as ResidentEstado]))
  )
  const [selectedResident, setSelectedResident] = useState<number | null>(null)
  const [calMonth, setCalMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const pendingTasks = TASKS.filter(t => t.status === 'pendiente')
  const inProgressTasks = TASKS.filter(t => t.status === 'en_curso')
  const upcomingEvents = EVENTS.filter(e => e.date >= '2026-03-22').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6)
  const activeTasks = [...inProgressTasks, ...pendingTasks].slice(0, 8)

  const monthDays = getMonthDays(calMonth.year, calMonth.month)

  function cycleEstado(id: number) {
    setEstados(prev => {
      const cur = prev[id]
      const next = ESTADO_CYCLE[(ESTADO_CYCLE.indexOf(cur) + 1) % ESTADO_CYCLE.length]
      return { ...prev, [id]: next }
    })
  }

  function prevMonth() {
    setCalMonth(p => {
      const m = p.month === 0 ? 11 : p.month - 1
      const y = p.month === 0 ? p.year - 1 : p.year
      return { year: y, month: m }
    })
  }
  function nextMonth() {
    setCalMonth(p => {
      const m = p.month === 11 ? 0 : p.month + 1
      const y = p.month === 11 ? p.year + 1 : p.year
      return { year: y, month: m }
    })
  }

  const selectedResidentData = selectedResident ? RESIDENTS.find(r => r.id === selectedResident) : null
  const selectedTasks = selectedResident
    ? TASKS.filter(t => t.assignedTo === selectedResident && t.status !== 'completada')
    : []

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 relative z-10">
      {/* Week strip + residency schedule */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-syne font-semibold text-t1 text-[13px]">
            {MONTH_NAMES[today.getMonth()]} {today.getFullYear()}
          </span>
          <span className="text-t2 text-[11px]">Semana actual</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => {
            const iso = isoDate(day)
            const isToday = iso === '2026-03-22'
            const dayEvents = EVENTS.filter(e => e.date === iso)
            const schedule = RESIDENCY_SCHEDULE[day.getDay()]
            const isWeekend = day.getDay() === 0 || day.getDay() === 6
            return (
              <div key={iso} className="flex flex-col items-center gap-1">
                <span className="text-t2 text-[11px] font-medium">{DAY_NAMES[day.getDay()]}</span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-medium transition-all"
                  style={isToday
                    ? { background: 'var(--teal)', color: 'var(--bg0)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }
                    : { color: 'var(--t2)' }
                  }
                >
                  {day.getDate()}
                </div>
                <div className="flex gap-0.5 flex-wrap justify-center" style={{ minHeight: 6 }}>
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} className="w-1.5 h-1.5 rounded-full" style={{ background: eventTypeColor[ev.type] }} title={ev.title} />
                  ))}
                </div>
                {!isWeekend && schedule && (
                  <div className="text-center mt-0.5 px-0.5">
                    <div className="text-[10px] leading-tight font-medium" style={{ color: 'var(--teal)' }}>{schedule.label}</div>
                    {schedule.time && <div className="text-[9px] leading-tight" style={{ color: 'var(--t3)' }}>{schedule.time}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main grid: tasks + events */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active tasks */}
        <div className="rounded-xl p-4 flex flex-col" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-syne font-semibold text-t1 text-[13px]">Tareas pendientes</span>
            <span className="text-t2 text-[11px] font-medium">{activeTasks.length} tareas</span>
          </div>
          <div className="flex flex-col gap-2">
            {activeTasks.map(task => {
              const res = RESIDENTS.find(r => r.id === task.assignedTo)
              return (
                <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg2)' }}>
                  {res && <Avatar resident={res} size="sm" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-t1 text-[11.5px] truncate">{task.title}</div>
                    <div className="text-t3 text-[11px] mt-0.5 font-medium">{task.due}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {typeBadge(task.type)}
                    {statusBadge(task.status)}
                  </div>
                </div>
              )
            })}
            {activeTasks.length === 0 && (
              <div className="text-t3 text-[12px] text-center py-6">Sin tareas pendientes</div>
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="rounded-xl p-4 flex flex-col" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-syne font-semibold text-t1 text-[13px]">Próximos eventos</span>
            <span className="text-t2 text-[11px] font-medium">{upcomingEvents.length} eventos</span>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingEvents.map(ev => {
              const presenter = ev.presenter ? RESIDENTS.find(r => r.id === ev.presenter) : null
              return (
                <div key={ev.id} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg2)' }}>
                  <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ background: eventTypeColor[ev.type] }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-t1 text-[11.5px] truncate">{ev.title}</div>
                    <div className="text-t3 text-[11px] mt-0.5 font-medium">{ev.date} · {ev.time} · {ev.loc}</div>
                  </div>
                  {presenter && <Avatar resident={presenter} size="sm" />}
                </div>
              )
            })}
            {upcomingEvents.length === 0 && (
              <div className="text-t3 text-[12px] text-center py-6">Sin eventos próximos</div>
            )}
          </div>
        </div>
      </div>

      {/* Team section */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-syne font-semibold text-t1 text-[13px]">Estado del equipo</span>
          <span className="text-t3 text-[10px]">Clic en residente para ver tareas · Clic en estado para cambiar</span>
        </div>

        {/* Resident cards */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {RESIDENTS.map(res => {
            const estado = estados[res.id]
            const style = ESTADO_STYLE[estado]
            const myTasks = TASKS.filter(t => t.assignedTo === res.id && t.status !== 'completada')
            const isSelected = selectedResident === res.id
            return (
              <div
                key={res.id}
                className="flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-all"
                style={{
                  background: isSelected ? 'var(--bg0)' : 'var(--bg2)',
                  border: isSelected ? '1px solid var(--teal)' : '1px solid transparent',
                }}
                onClick={() => setSelectedResident(isSelected ? null : res.id)}
              >
                <Avatar resident={res} size="lg" />
                <div className="text-t1 text-[11px] font-medium text-center">{res.name}</div>
                {/* Estado badge - click stops propagation to toggle estado */}
                <button
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all"
                  style={{ background: style.bg, color: style.color }}
                  onClick={e => { e.stopPropagation(); cycleEstado(res.id) }}
                  title="Clic para cambiar estado"
                >
                  {ESTADO_LABEL[estado]}
                </button>
                {myTasks.length > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--amberdim)', color: 'var(--amber)' }}>
                    {myTasks.length} tarea{myTasks.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Expanded task list for selected resident */}
        {selectedResidentData && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Avatar resident={selectedResidentData} size="sm" />
              <span className="font-syne font-semibold text-t1 text-[12px]">{selectedResidentData.full} — tareas pendientes</span>
            </div>
            {selectedTasks.length === 0 ? (
              <div className="text-t3 text-[11px] py-2">Sin tareas pendientes</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {selectedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg1)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-t1 text-[11px] truncate">{task.title}</div>
                      <div className="text-t3 text-[10px] mt-0.5">Vence {task.due}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {typeBadge(task.type)}
                      {statusBadge(task.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Licencias calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-syne font-semibold text-t1 text-[12px]">
              Disponibilidad — {MONTH_NAMES[calMonth.month]} {calMonth.year}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="w-6 h-6 rounded flex items-center justify-center text-t2 hover:text-t1 transition-colors text-[13px]"
                style={{ background: 'var(--bg2)' }}
                onClick={prevMonth}
              >‹</button>
              <button
                className="w-6 h-6 rounded flex items-center justify-center text-t2 hover:text-t1 transition-colors text-[13px]"
                style={{ background: 'var(--bg2)' }}
                onClick={nextMonth}
              >›</button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-3 mb-3 flex-wrap">
            {RESIDENTS.map(res => (
              <div key={res.id} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: res.color }} />
                <span className="text-t3 text-[10px]">{res.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 ml-2 pl-2" style={{ borderLeft: '1px solid var(--border)' }}>
              <span className="text-t3 text-[10px]">Tipo:</span>
              {(['vacaciones','medica','congreso','otra'] as const).map(t => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${LICENCIA_COLOR[t]}22`, color: LICENCIA_COLOR[t] }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {/* Day headers */}
            {['L','M','X','J','V','S','D'].map(d => (
              <div key={d} className="text-center text-t3 text-[10px] font-medium pb-1">{d}</div>
            ))}
            {/* Calendar days */}
            {monthDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const iso = isoDate(day)
              const isTodayDay = iso === '2026-03-22'
              const licenciasHoy = LICENCIAS.filter(l => isInRange(iso, l.from, l.to))
              const isWeekend = day.getDay() === 0 || day.getDay() === 6
              return (
                <div
                  key={iso}
                  className="flex flex-col items-center p-1 rounded-md"
                  style={{
                    background: isTodayDay ? 'var(--tealdim)' : isWeekend ? 'transparent' : 'var(--bg2)',
                    minHeight: 40,
                  }}
                >
                  <span
                    className="text-[10px] font-medium mb-0.5"
                    style={{ color: isTodayDay ? 'var(--teal)' : isWeekend ? 'var(--t3)' : 'var(--t2)' }}
                  >
                    {day.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {licenciasHoy.map(lic => {
                      const res = RESIDENTS.find(r => r.id === lic.residentId)
                      return res ? (
                        <div
                          key={lic.id}
                          className="w-2 h-2 rounded-full"
                          style={{ background: res.color, opacity: 0.85 }}
                          title={`${res.name} — ${lic.type}`}
                        />
                      ) : null
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Licencias list for this month */}
          {LICENCIAS.filter(l => {
            const m = `${calMonth.year}-${String(calMonth.month + 1).padStart(2,'0')}`
            return l.from.startsWith(m) || l.to.startsWith(m)
          }).length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              {LICENCIAS.filter(l => {
                const m = `${calMonth.year}-${String(calMonth.month + 1).padStart(2,'0')}`
                return l.from.startsWith(m) || l.to.startsWith(m)
              }).map(lic => {
                const res = RESIDENTS.find(r => r.id === lic.residentId)
                return res ? (
                  <div key={lic.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg2)' }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: res.color }} />
                    <span className="text-t1 text-[11px] font-medium">{res.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${LICENCIA_COLOR[lic.type]}22`, color: LICENCIA_COLOR[lic.type] }}>{lic.type}</span>
                    <span className="text-t3 text-[10px] ml-auto">{lic.from === lic.to ? lic.from : `${lic.from} → ${lic.to}`}</span>
                  </div>
                ) : null
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { AppUser } from '../types'
import { EVENTS, RESIDENTS } from '../data/mock'
import { Avatar } from '../components/ui/Avatar'
import { typeBadge } from '../components/ui/Badge'
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react'

interface CalendarProps {
  user: AppUser
}

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const eventTypeColor: Record<string, string> = {
  ateneo: 'var(--teal)',
  clase: 'var(--indigo)',
  guardia: 'var(--amber)',
  presentacion: 'var(--red)',
}

const LEGEND = [
  { type: 'ateneo', label: 'Ateneo' },
  { type: 'clase', label: 'Clase' },
  { type: 'guardia', label: 'Guardia' },
  { type: 'presentacion', label: 'Presentación' },
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function Calendar({ user: _user }: CalendarProps) {
  const [viewYear, setViewYear] = useState(2026)
  const [viewMonth, setViewMonth] = useState(2) // March = 2

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const today = '2026-03-22'

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const upcomingEvents = EVENTS
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex-1 overflow-hidden flex gap-0 relative z-10">
      {/* Main calendar */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {/* Month header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-t2 hover:text-t1 hover:bg-bg2 transition-all" style={{ border: '1px solid var(--border)' }}>
              <ChevronLeft size={14} />
            </button>
            <h2 className="font-syne font-bold text-t1 text-[16px]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-t2 hover:text-t1 hover:bg-bg2 transition-all" style={{ border: '1px solid var(--border)' }}>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3">
            {LEGEND.map(l => (
              <div key={l.type} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: eventTypeColor[l.type] }} />
                <span className="text-t3 text-[10px]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          {/* Day headers */}
          <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)' }}>
            {DAY_NAMES.map(d => (
              <div key={d} className="py-2 text-center text-t3 text-[10px] font-medium">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-20 p-1.5" style={{ borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const isoDate = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`
              const isToday = isoDate === today
              const dayEvents = EVENTS.filter(e => e.date === isoDate)
              const col = (firstDay + i) % 7

              return (
                <div
                  key={day}
                  className="h-20 p-1.5 flex flex-col"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    borderRight: col < 6 ? '1px solid var(--border)' : 'none',
                    background: isToday ? 'var(--tealdim)' : undefined,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-medium mb-1 self-start"
                    style={isToday
                      ? { background: 'var(--teal)', color: 'var(--bg0)', fontFamily: 'Syne', fontWeight: 700 }
                      : { color: 'var(--t2)' }
                    }
                  >
                    {day}
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className="text-[9px] px-1 py-0.5 rounded truncate leading-tight"
                        style={{ background: `${eventTypeColor[ev.type]}22`, color: eventTypeColor[ev.type] }}
                        title={ev.title}
                      >
                        {ev.time} {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-t3">+{dayEvents.length - 2} más</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Upcoming sidebar */}
      <div className="w-72 flex-shrink-0 overflow-y-auto p-4 flex flex-col gap-3" style={{ borderLeft: '1px solid var(--border)' }}>
        <h3 className="font-syne font-semibold text-t1 text-[13px] px-1">Próximos eventos</h3>
        {upcomingEvents.map(ev => {
          const presenter = ev.presenter ? RESIDENTS.find(r => r.id === ev.presenter) : null
          return (
            <div key={ev.id} className="p-3 rounded-xl flex flex-col gap-2" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <div className="flex items-start gap-2">
                <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ background: eventTypeColor[ev.type] }} />
                <div className="flex-1">
                  <div className="text-t1 text-[12px] font-medium leading-tight">{ev.title}</div>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {typeBadge(ev.type)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-t3 text-[10px]">
                <div className="flex items-center gap-1">
                  <Clock size={9} />
                  {ev.date} · {ev.time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={9} />
                  {ev.loc}
                </div>
              </div>
              {presenter && (
                <div className="flex items-center gap-1.5 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                  <Avatar resident={presenter} size="sm" />
                  <span className="text-t2 text-[10px]">{presenter.full}</span>
                </div>
              )}
              {ev.desc && <p className="text-t3 text-[10.5px] leading-relaxed">{ev.desc}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

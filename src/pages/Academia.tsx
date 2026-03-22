import { useState } from 'react'
import type { AppUser } from '../types'
import { READINGS, EVENTS, RESIDENTS } from '../data/mock'
import { Avatar } from '../components/ui/Avatar'
import { Badge, typeBadge } from '../components/ui/Badge'
import { BookOpen, Clock, MapPin, Star } from 'lucide-react'

interface AcademiaProps {
  user: AppUser
}

type Tab = 'lecturas' | 'ateneos' | 'presentaciones'

const eventTypeColor: Record<string, string> = {
  ateneo: 'var(--teal)',
  clase: 'var(--indigo)',
  guardia: 'var(--amber)',
  presentacion: 'var(--red)',
}

const readingTypeVariant: Record<string, 'teal' | 'indigo' | 'amber'> = {
  guia: 'teal',
  articulo: 'indigo',
  revision: 'amber',
}

const readingTypeLabel: Record<string, string> = {
  guia: 'Guía',
  articulo: 'Artículo',
  revision: 'Revisión',
}

export function Academia({ user: _user }: AcademiaProps) {
  const [tab, setTab] = useState<Tab>('lecturas')

  const ateneos = EVENTS.filter(e => e.type === 'ateneo' || e.type === 'clase')
  const presentations = EVENTS.filter(e => e.type === 'presentacion')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'lecturas', label: 'Lecturas' },
    { id: 'ateneos', label: 'Ateneos y Clases' },
    { id: 'presentaciones', label: 'Presentaciones' },
  ]

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6 gap-4 relative z-10">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={tab === t.id
              ? { background: 'var(--tealdim)', color: 'var(--teal)', border: '1px solid var(--borderact)' }
              : { color: 'var(--t2)', border: '1px solid transparent' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'lecturas' && (
          <div className="flex flex-col gap-3">
            {READINGS.map(reading => {
              const assignees = RESIDENTS.filter(r => reading.assignedTo.includes(r.id))
              return (
                <div key={reading.id} className="p-4 rounded-xl" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--indigodim)' }}>
                      <BookOpen size={16} style={{ color: 'var(--indigo)' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-syne font-semibold text-t1 text-[13px] leading-tight mb-1">{reading.title}</h3>
                          <p className="text-t2 text-[11px]">{reading.journal}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {reading.mandatory && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: 'var(--amberdim)', color: 'var(--amber)' }}>
                              <Star size={8} />
                              Obligatorio
                            </div>
                          )}
                          <Badge variant={readingTypeVariant[reading.type]}>
                            {readingTypeLabel[reading.type]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-1">
                          {assignees.map(res => (
                            <Avatar key={res.id} resident={res} size="sm" />
                          ))}
                        </div>
                        <span className="text-t3 text-[10px]">{assignees.map(r => r.name).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'ateneos' && (
          <div className="flex flex-col gap-3">
            {ateneos.map(ev => {
              const presenter = ev.presenter ? RESIDENTS.find(r => r.id === ev.presenter) : null
              return (
                <div key={ev.id} className="p-4 rounded-xl" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: eventTypeColor[ev.type] }} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-syne font-semibold text-t1 text-[13px] leading-tight">{ev.title}</h3>
                          {ev.desc && <p className="text-t2 text-[11px] mt-1">{ev.desc}</p>}
                        </div>
                        {typeBadge(ev.type)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-t3 text-[10px]">
                        <div className="flex items-center gap-1">
                          <Clock size={9} />
                          {ev.date} · {ev.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={9} />
                          {ev.loc}
                        </div>
                        {presenter && (
                          <div className="flex items-center gap-1.5">
                            <Avatar resident={presenter} size="sm" />
                            <span>{presenter.full}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {ateneos.length === 0 && (
              <div className="text-t3 text-[12px] text-center py-8">Sin ateneos programados.</div>
            )}
          </div>
        )}

        {tab === 'presentaciones' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <h3 className="font-syne font-semibold text-t1 text-[13px] mb-3">Presentaciones programadas</h3>
              <div className="flex flex-col gap-3">
                {presentations.map(ev => {
                  const presenter = ev.presenter ? RESIDENTS.find(r => r.id === ev.presenter) : null
                  return (
                    <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bg2)' }}>
                      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: eventTypeColor[ev.type] }} />
                      <div className="flex-1">
                        <div className="text-t1 text-[12px] font-medium mb-1">{ev.title}</div>
                        <p className="text-t2 text-[11px] mb-2">{ev.desc}</p>
                        <div className="flex flex-wrap items-center gap-3 text-t3 text-[10px]">
                          <div className="flex items-center gap-1">
                            <Clock size={9} />
                            {ev.date} · {ev.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={9} />
                            {ev.loc}
                          </div>
                          {presenter && (
                            <div className="flex items-center gap-1.5">
                              <Avatar resident={presenter} size="sm" />
                              <span>{presenter.full}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {presentations.length === 0 && (
                  <p className="text-t3 text-[11px]">Sin presentaciones programadas.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <h3 className="font-syne font-semibold text-t1 text-[13px] mb-3">Trabajos en preparación</h3>
              <div className="flex flex-col gap-3">
                {RESIDENTS.filter(r => [1,3,5].includes(r.id)).map(res => (
                  <div key={res.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg2)' }}>
                    <Avatar resident={res} size="md" />
                    <div>
                      <div className="text-t1 text-[12px] font-medium">{res.full}</div>
                      <div className="text-t3 text-[10px] mt-0.5">Trabajo de investigación en curso</div>
                    </div>
                    <div className="ml-auto">
                      <Badge variant="indigo">En progreso</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

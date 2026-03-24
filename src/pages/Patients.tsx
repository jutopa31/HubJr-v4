import { useState, useEffect, useRef } from 'react'
import type { AppUser, Patient, PatientStatus, PatientChart, PatientImage, ChartSectionKey } from '../types'
import { PATIENTS, RESIDENTS } from '../data/mock'
import { Avatar } from '../components/ui/Avatar'
import { statusBadge } from '../components/ui/Badge'
import { ChartSection } from '../components/patients/ChartSection'
import { ImageGallery } from '../components/ui/ImageGallery'
import { Search, X, User, ChevronRight, Clock, AlertTriangle, Send } from 'lucide-react'
import { IS_MOCK } from '../lib/supabase'
import {
  getPatientChart,
  upsertPatientChart,
  getPatientImages,
  addPatientImage,
  deletePatientImage,
  addEvolution,
} from '../lib/db'
import { uploadMultipleImagesToStorage, deleteImageFromStorage } from '../lib/storageService'

interface PatientsProps {
  user: AppUser
  showToast: (msg: string) => void
}

const STATUS_FILTERS: { value: PatientStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'internado', label: 'Internados' },
  { value: 'ambulatorio', label: 'Ambulatorio' },
  { value: 'guardia', label: 'Guardia' },
  { value: 'alta', label: 'Alta' },
]

const CHART_SECTIONS: { key: ChartSectionKey; label: string }[] = [
  { key: 'antecedentes',            label: 'Antecedentes' },
  { key: 'motivoConsulta',          label: 'Motivo de Consulta' },
  { key: 'examenFisico',            label: 'Examen Físico' },
  { key: 'estudiosComplementarios', label: 'Estudios Complementarios' },
  { key: 'diagnostico',             label: 'Diagnóstico' },
  { key: 'plan',                    label: 'Plan' },
  { key: 'pendientes',              label: 'Pendientes' },
]

const EMPTY_CHART: Omit<PatientChart, 'patientId' | 'updatedAt' | 'updatedBy'> = {
  antecedentes: '',
  motivoConsulta: '',
  examenFisico: '',
  estudiosComplementarios: '',
  diagnostico: '',
  plan: '',
  pendientes: '',
}

type ModalTab = 'chart' | 'evolutions' | 'images'

function PatientModal({
  patient,
  user,
  onClose,
  showToast,
}: {
  patient: Patient
  user: AppUser
  onClose: () => void
  showToast: (msg: string) => void
}) {
  const assignees = RESIDENTS.filter(r => patient.assignedTo.includes(r.id))
  const [evolutions, setEvolutions] = useState([...patient.evolutions].sort((a, b) => b.date.localeCompare(a.date)))

  const [tab, setTab] = useState<ModalTab>('chart')
  const [chart, setChart] = useState<PatientChart | null | undefined>(undefined)
  const [images, setImages] = useState<PatientImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ uploaded: 0, total: 0 })

  const [evoText, setEvoText] = useState('')
  const [addingEvo, setAddingEvo] = useState(false)
  const evoRef = useRef<HTMLTextAreaElement>(null)

  const isMandatory = patient.status === 'internado' || patient.status === 'guardia'

  useEffect(() => {
    Promise.all([
      getPatientChart(patient.id),
      getPatientImages(patient.id),
    ]).then(([chartData, imagesData]) => {
      setChart(chartData)
      setImages(imagesData)
    }).catch(() => {
      setChart(null)
      setImages([])
    })
  }, [patient.id])

  async function handleSaveSection(key: ChartSectionKey, value: string) {
    await upsertPatientChart(patient.id, { [key]: value }, user.id)
    setChart(prev => {
      const base = prev ?? { patientId: patient.id, ...EMPTY_CHART, updatedAt: '', updatedBy: 0 }
      return { ...base, [key]: value, updatedAt: new Date().toISOString().slice(0, 10) }
    })
  }

  async function handleAddEvolution() {
    if (!evoText.trim()) return
    setAddingEvo(true)
    try {
      await addEvolution(patient.id, evoText.trim(), user.id)
      const today = new Date().toISOString().slice(0, 10)
      const newEvo = { date: today, author: user.residentId ?? 0, text: evoText.trim() }
      setEvolutions(prev => [newEvo, ...prev])
      setEvoText('')
      showToast('Evolución agregada')
    } catch {
      showToast('Error al guardar evolución')
    } finally {
      setAddingEvo(false)
    }
  }

  async function handleImageUpload(files: FileList) {
    if (IS_MOCK) { showToast('Carga de imágenes no disponible en modo demo'); return }
    const arr = Array.from(files)
    setIsUploading(true)
    setUploadProgress({ uploaded: 0, total: arr.length })
    try {
      const uploads = await uploadMultipleImagesToStorage(arr, patient.id)
      const newImages: PatientImage[] = []
      for (let i = 0; i < uploads.length; i++) {
        const { path, fullUrl } = uploads[i]
        const img = await addPatientImage(patient.id, fullUrl, fullUrl, path, user.id)
        newImages.push(img)
        setUploadProgress({ uploaded: i + 1, total: arr.length })
      }
      setImages(prev => [...prev, ...newImages])
      showToast(`${arr.length} imagen${arr.length > 1 ? 'es' : ''} subida${arr.length > 1 ? 's' : ''}`)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error al subir imágenes')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleImageDelete(imageId: string, storagePath: string) {
    if (!IS_MOCK) await deleteImageFromStorage(storagePath)
    await deletePatientImage(imageId, storagePath)
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const hasEmptyMandatorySections = isMandatory && chart !== undefined &&
    CHART_SECTIONS.some(s => !(chart?.[s.key] ?? '').trim())

  const tabs: { id: ModalTab; label: string }[] = [
    { id: 'chart', label: 'Historia Clínica' },
    { id: 'evolutions', label: `Evoluciones (${evolutions.length})` },
    { id: 'images', label: `Imágenes (${images.length})` },
  ]

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-end animate-fadeIn"
      style={{ background: 'rgba(7,8,13,0.65)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="h-full overflow-y-auto flex flex-col animate-slideUp"
        style={{
          width: 'min(720px, calc(100vw - 240px))',
          background: 'var(--bg1)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 40px rgba(30,50,120,0.12)',
        }}
      >
        {/* Sticky header */}
        <div
          className="flex items-start justify-between p-5 sticky top-0 z-10"
          style={{ background: 'var(--bg1)', borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <div className="font-mono text-[11px] mb-1" style={{ color: 'var(--teal)' }}>{patient.id}</div>
            <h2 className="font-syne font-bold text-[16px] leading-tight" style={{ color: 'var(--t1)' }}>
              {patient.diagnosis}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {statusBadge(patient.status)}
              <span className="text-[11px] font-medium" style={{ color: 'var(--t3)' }}>
                {patient.age} años · {patient.sex === 'M' ? 'Masculino' : 'Femenino'} · {patient.sector}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {assignees.map(res => <Avatar key={res.id} resident={res} size="sm" />)}
              <span className="text-[11px]" style={{ color: 'var(--t2)' }}>
                {assignees.map(r => r.name).join(', ')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-bg3 flex-shrink-0"
            style={{ color: 'var(--t3)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Warning banner */}
        {hasEmptyMandatorySections && (
          <div
            className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium"
            style={{ background: 'var(--amberdim)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--amber)' }}
          >
            <AlertTriangle size={13} />
            Historia clínica incompleta — paciente {patient.status}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0.5 px-5 pt-4 pb-0 flex-shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3.5 py-2 rounded-t-xl text-[12px] font-medium transition-all"
              style={tab === t.id
                ? { background: 'var(--tealdim)', color: 'var(--teal)', borderBottom: '2px solid var(--teal)' }
                : { color: 'var(--t2)', borderBottom: '2px solid transparent' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Tab content */}
        <div className="flex-1 p-5">

          {/* Historia Clínica */}
          {tab === 'chart' && (
            <div className="flex flex-col gap-2.5">
              {chart === undefined
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg2)' }} />
                  ))
                : CHART_SECTIONS.map(({ key, label }) => (
                    <ChartSection
                      key={key}
                      label={label}
                      value={chart?.[key] ?? ''}
                      isEditable={true}
                      isMandatory={isMandatory}
                      onSave={val => handleSaveSection(key, val)}
                    />
                  ))
              }
            </div>
          )}

          {/* Evoluciones */}
          {tab === 'evolutions' && (
            <div className="flex flex-col gap-4">
              <div
                className="p-3.5 rounded-xl flex flex-col gap-2.5"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
              >
                <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--t2)' }}>
                  Nueva evolución
                </span>
                <textarea
                  ref={evoRef}
                  value={evoText}
                  onChange={e => setEvoText(e.target.value)}
                  rows={3}
                  placeholder="Escribir evolución clínica..."
                  className="w-full text-[12px] leading-relaxed rounded-lg px-3 py-2 resize-none outline-none transition-all"
                  style={{
                    background: 'var(--bg1)',
                    border: '1px solid var(--border)',
                    color: 'var(--t1)',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--borderact)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddEvolution}
                    disabled={!evoText.trim() || addingEvo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                    style={{ background: 'var(--teal)' }}
                  >
                    {addingEvo
                      ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                      : <Send size={11} />
                    }
                    {addingEvo ? 'Guardando...' : 'Agregar'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {evolutions.length === 0 ? (
                  <p className="text-[12px] text-center py-6" style={{ color: 'var(--t3)' }}>
                    Sin evoluciones registradas.
                  </p>
                ) : evolutions.map((ev, i) => {
                  const author = RESIDENTS.find(r => r.id === ev.author)
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {author && <Avatar resident={author} size="sm" />}
                        {i < evolutions.length - 1 && (
                          <div className="flex-1 w-px mt-1" style={{ background: 'var(--border)' }} />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {author && (
                            <span className="text-[11px] font-semibold" style={{ color: author.color }}>
                              {author.full}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--t3)' }}>
                            <Clock size={9} />
                            {ev.date}
                          </div>
                        </div>
                        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--t2)' }}>{ev.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Imágenes */}
          {tab === 'images' && (
            <ImageGallery
              images={images.map(img => ({
                id: img.id,
                thumbnailUrl: img.thumbnailUrl,
                fullUrl: img.fullUrl,
                storagePath: img.storagePath,
              }))}
              onUpload={handleImageUpload}
              onDelete={handleImageDelete}
              isEditable={true}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function Patients({ user, showToast }: PatientsProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all')
  const [selected, setSelected] = useState<Patient | null>(null)

  const filtered = PATIENTS.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchSearch = !search ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.sector.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 relative z-10">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por diagnóstico, ID, sector..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-[12px] outline-none"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)', color: 'var(--t1)' }}
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
          const chartIncomplete = patient.status === 'internado' && patient.chart &&
            CHART_SECTIONS.some(s => !(patient.chart?.[s.key] ?? '').trim())

          return (
            <button
              key={patient.id}
              onClick={() => setSelected(patient)}
              className="text-left p-4 rounded-xl transition-all hover:border-[var(--borderact)] group"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono text-[11px] mb-1" style={{ color: 'var(--teal)' }}>{patient.id}</div>
                  <div className="font-syne font-semibold text-[13px] leading-tight pr-2" style={{ color: 'var(--t1)' }}>
                    {patient.diagnosis}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                  {chartIncomplete && (
                    <AlertTriangle size={13} style={{ color: 'var(--amber)' }} title="Historia incompleta" />
                  )}
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--t3)' }} />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {statusBadge(patient.status)}
                <span className="text-[11px] font-medium" style={{ color: 'var(--t3)' }}>
                  {patient.age} años · {patient.sex === 'M' ? 'M' : 'F'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-3 text-[11px] font-medium" style={{ color: 'var(--t3)' }}>
                <User size={10} />
                {patient.sector}
              </div>

              {lastEv && (
                <p className="text-[11px] leading-relaxed line-clamp-2 mb-3 border-t pt-2.5" style={{ borderColor: 'var(--border)', color: 'var(--t3)' }}>
                  {lastEv.text}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-auto">
                {assignees.map(res => (
                  <Avatar key={res.id} resident={res} size="sm" />
                ))}
                <span className="text-[11px] ml-1" style={{ color: 'var(--t2)' }}>
                  {assignees.map(r => r.name).join(', ')}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-[12px]" style={{ color: 'var(--t3)' }}>
          Sin resultados para la búsqueda actual.
        </div>
      )}

      {selected && (
        <PatientModal
          patient={selected}
          user={user}
          onClose={() => setSelected(null)}
          showToast={showToast}
        />
      )}
    </div>
  )
}

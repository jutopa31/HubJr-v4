import { useState, useRef, useEffect } from 'react'
import { Pencil, Check, X, AlertCircle } from 'lucide-react'

interface ChartSectionProps {
  label: string
  value: string
  isEditable: boolean
  isMandatory?: boolean
  onSave: (value: string) => Promise<void>
}

export function ChartSection({ label, value, isEditable, isMandatory, onSave }: ChartSectionProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      autoResize(textareaRef.current)
    }
  }, [editing])

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  function handleEdit() {
    setDraft(value)
    setError('')
    setEditing(true)
  }

  function handleCancel() {
    setDraft(value)
    setError('')
    setEditing(false)
  }

  async function handleSave() {
    if (draft === value) { setEditing(false); return }
    setSaving(true)
    setError('')
    try {
      await onSave(draft)
      setEditing(false)
    } catch {
      setError('Error al guardar. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const isEmpty = !value.trim()

  return (
    <div
      className="rounded-xl p-3.5 flex flex-col gap-2"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--t2)' }}>
            {label}
          </span>
          {isMandatory && isEmpty && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--amberdim)', color: 'var(--amber)' }}
            >
              <AlertCircle size={9} />
              Sin completar
            </span>
          )}
        </div>
        {isEditable && !editing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all hover:opacity-80 active:scale-95"
            style={{ color: 'var(--t2)', border: '1px solid var(--border)', background: 'var(--bg1)' }}
          >
            <Pencil size={10} />
            Editar
          </button>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => { setDraft(e.target.value); autoResize(e.target) }}
            rows={3}
            className="w-full text-[12px] leading-relaxed rounded-lg px-3 py-2 resize-none outline-none transition-all"
            style={{
              background: 'var(--bg1)',
              border: '1px solid var(--borderact)',
              color: 'var(--t1)',
              fontFamily: 'inherit',
              boxShadow: '0 0 0 3px rgba(58,115,255,0.08)',
            }}
            placeholder={`Escribir ${label.toLowerCase()}...`}
          />
          {error && (
            <p className="text-[11px] font-medium" style={{ color: 'var(--red)' }}>{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: saving ? 'var(--t3)' : 'var(--teal)' }}
            >
              {saving ? (
                <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={11} />
              )}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-all hover:opacity-80 active:scale-95 disabled:opacity-50"
              style={{ color: 'var(--t2)', border: '1px solid var(--border)', background: 'var(--bg1)' }}
            >
              <X size={11} />
              Cancelar
            </button>
          </div>
        </div>
      ) : isEmpty ? (
        <p className="text-[12px] italic" style={{ color: 'var(--t3)' }}>
          Sin datos
        </p>
      ) : (
        <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--t1)' }}>
          {value}
        </p>
      )}
    </div>
  )
}

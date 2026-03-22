import { useState } from 'react'
import type { AppUser } from '../types'
import { login } from '../lib/auth'
import { IS_MOCK } from '../lib/supabase'
import { Brain, Lock, Mail, AlertCircle } from 'lucide-react'

interface LoginProps {
  onLogin: (user: AppUser) => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Ingresá un email'); return }
    setLoading(true)
    try {
      const user = await login(email, password)
      onLogin(user)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg0)' }}>
      {/* Warm background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(58,115,255,0.10) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)'
        }} />
      </div>

      <div className="relative w-full max-w-[400px] mx-4 animate-slideUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-5"
            style={{
              background: 'linear-gradient(135deg, #3A73FF 0%, #6EA4FF 100%)',
              boxShadow: '0 8px 32px rgba(58,115,255,0.30)'
            }}>
            <Brain size={30} color="white" />
          </div>
          <h1 className="font-syne font-black text-t1 text-3xl leading-tight tracking-tight">HubJr</h1>
          <p className="text-t2 text-[13px] mt-1.5 font-medium">Residencia de Neurología</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-7" style={{ background: 'var(--bg1)', boxShadow: 'var(--shadow-lg)' }}>
          <h2 className="font-syne font-bold text-t1 text-[16px] mb-6">Bienvenido 👋</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-t2 text-[11.5px] mb-2 font-semibold">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-[13px] outline-none transition-all"
                  style={{ background: 'var(--bg2)', border: '1.5px solid var(--border)', color: 'var(--t1)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--borderact)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-t2 text-[11.5px] mb-2 font-semibold">Contraseña</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-[13px] outline-none transition-all"
                  style={{ background: 'var(--bg2)', border: '1.5px solid var(--border)', color: 'var(--t1)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--borderact)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-[12px] font-medium"
                style={{ background: 'var(--reddim)', color: 'var(--red)' }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-syne font-bold text-[14px] text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-1"
              style={{
                background: 'linear-gradient(135deg, #3A73FF 0%, #6EA4FF 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(58,115,255,0.35)'
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </form>
        </div>

        {!IS_MOCK && (
          <div className="mt-4 p-3.5 rounded-2xl text-[11px] text-t2 text-center font-medium"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
            <span className="font-mono" style={{ color: 'var(--teal)' }}>jefe@residencia.com</span>
            {' · '}
            <span className="font-mono text-t3">HubJr2026</span>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { AppUser } from '../types'
import { mockLogin } from '../lib/auth'
import { Brain, Lock, Mail, AlertCircle } from 'lucide-react'

interface LoginProps {
  onLogin: (user: AppUser) => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Ingresá un email'); return }
    setLoading(true)
    setTimeout(() => {
      const user = mockLogin(email, password)
      if (user) {
        onLogin(user)
      } else {
        setError('Credenciales inválidas')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'var(--bg0)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 20%, rgba(5,217,164,0.06) 0%, transparent 60%)'
      }} />

      <div className="relative w-full max-w-[380px] mx-4 animate-slideUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'var(--tealdim)', border: '1px solid var(--borderact)' }}>
            <Brain size={26} className="text-teal" />
          </div>
          <h1 className="font-syne font-bold text-t1 text-2xl leading-tight">HubJr V4</h1>
          <p className="text-t2 text-[12px] mt-1">Jefatura de Residentes de Neurología</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <h2 className="font-syne font-semibold text-t1 text-[15px] mb-5">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-t2 text-[11px] mb-1.5 font-medium">Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[12.5px] text-t1 placeholder-t3 outline-none transition-all"
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--borderact)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-t2 text-[11px] mb-1.5 font-medium">Contraseña</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[12.5px] text-t1 placeholder-t3 outline-none transition-all"
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--borderact)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11.5px]"
                style={{ background: 'var(--reddim)', color: 'var(--red)' }}>
                <AlertCircle size={13} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-syne font-semibold text-[13px] text-bg0 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-1"
              style={{ background: 'var(--teal)' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Demo info */}
        <div className="mt-4 p-3 rounded-xl text-[10.5px] text-t2 text-center"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <span className="text-t3">Modo demo — </span>
          Usá <span className="font-mono text-teal">jefe@residencia.com</span> para acceso de jefatura,
          o cualquier email para entrar como residente.
        </div>
      </div>
    </div>
  )
}

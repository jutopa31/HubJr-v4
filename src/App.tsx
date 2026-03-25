import { useState, useEffect } from 'react'
import type { AppUser, Section } from './types'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Patients } from './pages/Patients'
import { Tasks } from './pages/Tasks'
import { Calendar } from './pages/Calendar'
import { Academia } from './pages/Academia'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { Toast } from './components/ui/Toast'
import { getSession, logout as authLogout } from './lib/auth'

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [section, setSection] = useState<Section>('dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    getSession()
      .then(u => { if (u) setUser(u) })
      .catch(() => {})
      .finally(() => setSessionLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
  }

  async function handleLogout() {
    await authLogout()
    setUser(null)
    setSection('dashboard')
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg0)' }}>
        <div className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--teal)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  function renderPage() {
    switch (section) {
      case 'dashboard':
        return <Dashboard user={user!} />
      case 'pacientes':
        return <Patients user={user!} showToast={showToast} />
      case 'tareas':
        return <Tasks user={user!} showToast={showToast} />
      case 'calendario':
        return <Calendar user={user!} />
      case 'academia':
        return <Academia user={user!} />
    }
  }

  return (
    <div className="flex h-full relative">
      <Sidebar section={section} onNavigate={setSection} user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          section={section}
          user={user}
          onAction={() => showToast('Función disponible próximamente')}
          onLogout={handleLogout}
        />
        {renderPage()}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

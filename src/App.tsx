import { useState } from 'react'
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

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [section, setSection] = useState<Section>('dashboard')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  function renderPage() {
    switch (section) {
      case 'dashboard':
        return <Dashboard user={user!} />
      case 'pacientes':
        return <Patients user={user!} />
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
        />
        {renderPage()}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

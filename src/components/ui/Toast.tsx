import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fadeUp flex items-center gap-2 px-4 py-3 rounded-xl text-[12.5px] text-t1"
      style={{ background: 'var(--bg2)', border: '1px solid var(--borderact)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
      <CheckCircle size={15} className="text-teal flex-shrink-0" />
      {message}
    </div>
  )
}

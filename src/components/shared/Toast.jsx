import { useApp } from '../../context/AppContext.jsx'
import { CheckCircle } from 'lucide-react'

export default function Toast() {
  const { toast } = useApp()
  return (
    <div className={`toast${toast.visible ? ' show' : ''}`}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckCircle size={15} />
        {toast.message}
      </span>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface InvoiceToastProps {
  message: string
  onClose: () => void
}

export default function InvoiceToast({ message, onClose }: InvoiceToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed top-5 right-1/2 translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl"
      style={{
        backgroundColor: '#27AE60',
        minWidth: 280,
        maxWidth: 360,
        animation: 'slideDown 0.3s ease',
      }}
    >
      <button onClick={onClose} aria-label="بستن" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <X size={16} />
      </button>
      <p className="flex-1 text-sm font-semibold text-right" style={{ color: '#FFFFFF', direction: 'rtl' }}>
        {message}
      </p>
      <CheckCircle size={22} style={{ color: '#FFFFFF', flexShrink: 0 }} />
      <style>{`
        @keyframes slideDown {
          from { transform: translateX(50%) translateY(-20px); opacity: 0; }
          to   { transform: translateX(50%) translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

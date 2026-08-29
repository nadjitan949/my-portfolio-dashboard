// NotificationProvider.tsx
import { useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { 
  NotificationContext, 
  type Toast, 
  type ToastType, 
  type ConfirmDialog 
} from './NotificationContext'

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirms, setConfirms] = useState<ConfirmDialog[]>([])

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, title, message, duration }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, options?: Partial<Omit<ConfirmDialog, 'id' | 'title' | 'message' | 'onConfirm'>>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2)
    setConfirms(prev => [...prev, {
      id, title, message,
      confirmText: options?.confirmText || 'Confirmer',
      cancelText: options?.cancelText || 'Annuler',
      type: options?.type || 'danger',
      onConfirm: () => { onConfirm(); setConfirms(p => p.filter(c => c.id !== id)) },
      onCancel: options?.onCancel
    }])
  }, [])

  const removeConfirm = useCallback((id: string) => {
    setConfirms(prev => prev.filter(c => c.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ toasts, confirms, addToast, removeToast, showConfirm, removeConfirm }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmContainer confirms={confirms} removeConfirm={removeConfirm} />
    </NotificationContext.Provider>
  )
}

// Les composants ToastContainer, ToastItem et ConfirmContainer restent dans ce fichier
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle size={20} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={20} className="text-red-500 shrink-0" />,
    warning: <AlertTriangle size={20} className="text-amber-500 shrink-0" />,
    info: <Info size={20} className="text-blue-500 shrink-0" />
  }
  const borders = { 
    success: 'border-l-emerald-500', 
    error: 'border-l-red-500', 
    warning: 'border-l-amber-500', 
    info: 'border-l-blue-500' 
  }
  
  return (
    <div className={`animate-slide-right bg-white rounded-xl shadow-2xl border border-gray-100 border-l-4 ${borders[toast.type]} p-4 flex items-start gap-3`}>
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        {toast.message && <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}

function ConfirmContainer({ confirms, removeConfirm }: { confirms: ConfirmDialog[]; removeConfirm: (id: string) => void }) {
  return (
    <>
      {confirms.map(c => (
        <div key={c.id} className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => { c.onCancel?.(); removeConfirm(c.id) }} 
          />
          <div className="animate-scale-in relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{c.title}</h3>
            <p className="text-sm text-gray-600 mb-6">{c.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { c.onCancel?.(); removeConfirm(c.id) }} 
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                {c.cancelText}
              </button>
              <button 
                onClick={c.onConfirm} 
                className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${
                  c.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 
                  c.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 
                  'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {c.confirmText}
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
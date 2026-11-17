import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let toastId = 0

/** How long an Undo toast stays up before the action is final. */
export const UNDO_MS = 6000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((type, message, { duration = 4000, action } = {}) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, type, message, action }])
    setTimeout(() => remove(id), duration)
    return id
  }, [remove])

  const toast = {
    success: (msg) => add('success', msg),
    error: (msg) => add('error', msg),
    info: (msg) => add('info', msg),
    /** Toast with an Undo button; `onUndo` runs if it's clicked before `duration` ms. */
    undo: (msg, onUndo, duration = UNDO_MS) => add('info', msg, { duration, action: { label: 'Undo', onClick: onUndo } }),
  }

  const icons = { success: CheckCircle, error: XCircle, info: Info }
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = icons[t.type]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl ${colors[t.type]}`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{t.message}</span>
                {t.action && (
                  <button onClick={() => { remove(t.id); t.action.onClick() }}
                    className="flex-shrink-0 px-3 py-1 rounded-lg bg-white/70 text-sm font-bold text-primary hover:bg-white transition-colors">
                    {t.action.label}
                  </button>
                )}
                <button onClick={() => remove(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

import { useCallback, useEffect, useRef } from 'react'
import { useToast, UNDO_MS } from '../components/Toast'

/**
 * Run a destructive action with an Undo window.
 *
 *   apply()   — update the UI right away (e.g. hide the row)
 *   revert()  — put it back (on Undo, or if commit fails)
 *   commit()  — the real API call; runs once the Undo window ends
 *
 * Pending commits are sent when the page unmounts, so leaving the page doesn't
 * cancel them. If the tab is closed first, nothing is sent: the item survives,
 * which is the safe way to fail.
 */
export function useDeferredAction() {
  const toast = useToast()
  const pending = useRef(new Map())

  useEffect(() => () => {
    for (const run of pending.current.values()) run()
  }, [])

  return useCallback(({ message, apply, revert, commit, errorMessage = 'Something went wrong' }) => {
    const key = Symbol()
    let timer

    const run = () => {
      clearTimeout(timer)
      pending.current.delete(key)
      commit().catch(err => {
        revert()
        toast.error(err?.message || errorMessage)
      })
    }

    apply()
    pending.current.set(key, run)
    timer = setTimeout(run, UNDO_MS)
    toast.undo(message, () => {
      clearTimeout(timer)
      pending.current.delete(key)
      revert()
    })
  }, [toast])
}

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldOff, Eye, Download, Clock, Timer, History, RefreshCw } from 'lucide-react'
import { getAccessActivity } from '../../services/sharingService'

const ACTIONS = {
  granted: { label: 'Access granted', icon: ShieldCheck, tint: 'bg-emerald-50 text-emerald-600' },
  revoked: { label: 'Access revoked', icon: ShieldOff, tint: 'bg-red-50 text-accent-red' },
  viewed: { label: 'Viewed', icon: Eye, tint: 'bg-primary-tint text-primary' },
  downloaded: { label: 'Downloaded', icon: Download, tint: 'bg-violet-50 text-accent-violet' },
  expired: { label: 'Access expired', icon: Clock, tint: 'bg-amber-50 text-amber-600' },
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'granted', label: 'Granted' },
  { key: 'revoked', label: 'Revoked' },
  { key: 'expired', label: 'Expired' },
  { key: 'viewed', label: 'Viewed' },
]

const DATE_FORMAT = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, '0')}s`
}

function doctorLabel(name) {
  return name ? `Dr. ${name.replace(/^Dr\.?\s*/i, '')}` : 'a doctor'
}

/** Every grant, revoke, expiry and doctor view across the patient's records. */
export default function ActivityPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  function load() {
    setRefreshing(true)
    setError(null)
    getAccessActivity()
      .then(setItems)
      .catch(err => setError(err.message || 'Could not load your access log'))
      .finally(() => setRefreshing(false))
  }

  useEffect(load, [])

  const shown = useMemo(
    () => (items || []).filter(i => filter === 'all' || i.action === filter),
    [items, filter]
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-txt-primary">Access Log</h1>
          <p className="text-sm text-txt-secondary mt-1 flex items-center gap-1.5">
            <History size={12} className="text-primary" /> Who got access to your records, when it ended, and who viewed them
          </p>
        </div>
        <button onClick={load} disabled={refreshing} aria-label="Refresh"
          className="w-10 h-10 rounded-xl bg-surface text-txt-secondary flex items-center justify-center hover:bg-primary-tint hover:text-primary transition-all duration-300">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`tab flex-shrink-0 text-xs ${filter === f.key ? 'active' : ''}`}>
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-accent-red text-center py-12">{error}</p>
      ) : items === null ? (
        <div className="min-h-[40vh] flex items-center justify-center"><div className="spinner" /></div>
      ) : shown.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 rounded-3xl bg-primary-tint text-primary flex items-center justify-center mx-auto mb-4">
            <History size={28} />
          </div>
          <h3 className="text-lg font-bold text-txt-primary">No activity yet</h3>
          <p className="text-sm text-txt-secondary mt-2">When you share or revoke a record, or a doctor views one, it shows up here.</p>
        </motion.div>
      ) : (
        <ol className="space-y-3">
          {shown.map((e, i) => {
            const cfg = ACTIONS[e.action] || ACTIONS.granted
            const Icon = cfg.icon
            return (
              <motion.li key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.03 } }}
                className="card flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.tint}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-txt-primary">
                    {cfg.label}
                    <span className="font-normal text-txt-secondary">
                      {e.action === 'viewed' || e.action === 'downloaded' ? ' by ' : ' for '}
                      {doctorLabel(e.doctorName)}
                    </span>
                  </p>
                  <p className="text-xs text-txt-secondary mt-0.5 truncate">
                    {e.recordTitle}
                    {e.recordCategory && <span className="badge badge-gray text-[10px] ml-2">{e.recordCategory}</span>}
                  </p>
                  {e.action === 'granted' && (
                    <p className="text-[11px] text-txt-secondary mt-0.5">
                      {e.expiresAt ? `Until ${new Date(e.expiresAt).toLocaleString('en-IN', DATE_FORMAT)}` : 'No expiry'}
                    </p>
                  )}
                  {e.action === 'viewed' && typeof e.viewSeconds === 'number' && (
                    <p className="text-[11px] text-txt-secondary mt-0.5 flex items-center gap-1">
                      <Timer size={11} /> Looked at it for {formatDuration(e.viewSeconds)}
                      {e.viewOngoing && <span className="ml-1 inline-flex items-center gap-1 font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> viewing now</span>}
                    </p>
                  )}
                  <p className="text-[11px] text-txt-tertiary mt-0.5">
                    {new Date(e.at).toLocaleString('en-IN', DATE_FORMAT)}
                    {e.action === 'expired' && ' · ended automatically, as set when shared'}
                  </p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

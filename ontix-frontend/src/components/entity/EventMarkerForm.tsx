import { useState } from 'react'
import type { EventMarker } from '../../hooks/useEventMarkers'

interface EventMarkerFormProps {
  xDates: string[]
  markers: EventMarker[]
  onAdd: (date: string, label: string) => void
  onRemove: (id: string) => void
}

export function EventMarkerForm({ xDates, markers, onAdd, onRemove }: EventMarkerFormProps) {
  const [date, setDate] = useState('')
  const [label, setLabel] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !label.trim()) return
    onAdd(date, label.trim())
    setLabel('')
    setDate('')
  }

  return (
    <div className="mt-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <select
          value={date}
          onChange={e => setDate(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select week...</option>
          {xDates.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Event label"
          maxLength={30}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!date || !label.trim()}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">flag</span>
          Mark
        </button>
      </form>

      {markers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {markers.map(m => (
            <span key={m.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
              <span className="text-amber-500 text-[10px]">{m.date}</span>
              {m.label}
              <button
                onClick={() => onRemove(m.id)}
                className="text-amber-400 hover:text-amber-700 transition-colors ml-0.5"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

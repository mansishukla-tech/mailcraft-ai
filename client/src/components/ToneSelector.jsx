import { TONES } from '../constants'

export default function ToneSelector({ tone, onChange, label = 'Tone' }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {TONES.map((t) => {
          const active = t === tone
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              className={[
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-transparent bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800',
              ].join(' ')}
            >
              {t}
            </button>
          )
        })}
      </div>
    </div>
  )
} 
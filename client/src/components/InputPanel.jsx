import { Loader2, Sparkles } from 'lucide-react'
import ToneSelector from './ToneSelector'

const COPY = {
  email: {
    inputLabel: 'Key points — what should this email say?',
    placeholder:
      'e.g. Ask my manager for two days off next week for a family event. Mention I will finish the report before leaving.',
  },
  letter: {
    inputLabel: 'Key points — what should this letter say?',
    placeholder:
      'e.g. Formally resign from my position, last day in three weeks, thank the team.',
  },
  rewrite: {
    inputLabel: 'Text to rewrite',
    placeholder: 'Paste the text you want rephrased...',
  },
  grammar: {
    inputLabel: 'Text to correct',
    placeholder: 'Paste the text you want checked for grammar and spelling...',
  },
  tone: {
    inputLabel: 'Text to adjust',
    placeholder: 'Paste the text whose tone you want to change...',
  },
}

export default function InputPanel({
  mode,
  form,
  setForm,
  onGenerate,
  isLoading,
  error,
}) {
  const copy = COPY[mode]
  const needsRecipient = mode === 'email' || mode === 'letter'
  const needsLetterType = mode === 'letter'
  const needsTone = mode === 'email' || mode === 'tone'
  const canSubmit = form.inputText.trim().length > 0 && !isLoading

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (canSubmit) onGenerate()
      }}
      className="flex h-full animate-fadeUp flex-col gap-6 rounded-[28px] border border-white/10 bg-white/90 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(59,130,246,0.18)] sm:p-8"
    >
      {needsLetterType && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Letter type
          </label>

          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            {['formal', 'informal'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    letterType: t,
                  }))
                }
                className={[
                  'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                  form.letterType === t
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {needsRecipient && (
        <div>
          <label
            htmlFor="recipient"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Recipient / context{' '}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>

          <input
            id="recipient"
            type="text"
            value={form.recipient}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                recipient: e.target.value,
              }))
            }
            placeholder="e.g. My manager, Priya"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-300 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-100"
          />
        </div>
      )}

      {needsTone && (
        <ToneSelector
          tone={form.tone}
          onChange={(t) =>
            setForm((f) => ({
              ...f,
              tone: t,
            }))
          }
        />
      )}

      <div className="flex flex-1 flex-col">
        <label
          htmlFor="inputText"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          {copy.inputLabel}
        </label>

        <textarea
          id="inputText"
          value={form.inputText}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              inputText: e.target.value,
            }))
          }
          placeholder={copy.placeholder}
          maxLength={4000}
          className="min-h-[200px] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 transition-all duration-300 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />

        <div className="mt-2 text-right text-xs text-slate-400">
          {form.inputText.length} / 4000
        </div>
      </div>

      {error && (
        <p
          className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(59,130,246,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Drafting...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate
          </>
        )}
      </button>
    </form>
  )
} 
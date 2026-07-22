import { useState } from 'react'
import { Copy, Check, RotateCw, FileText } from 'lucide-react'

export default function OutputPanel({
  output,
  isLoading,
  hasGenerated,
  onRegenerate,
  canRegenerate,
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!output) return

    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex h-full animate-fadeUp flex-col gap-5 rounded-[28px] border border-white/10 bg-white/90 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(59,130,246,0.18)] sm:p-8">

      <div className="mb-2 flex items-center justify-between">

        <h2 className="text-xl font-bold text-slate-800">
          Draft
        </h2>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={onRegenerate}
            disabled={!canRegenerate || isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Regenerate
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="flex items-center gap-2">
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}

              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>

        </div>

      </div>

      <div
        className={[
          'min-h-[240px] flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white px-5 py-5 transition-all duration-300',
         isLoading
  ? 'ring-4 ring-cyan-300 border-cyan-400 shadow-[0_0_45px_rgba(34,211,238,.35)]'
  : '',
        ].join(' ')}
      >

        {!hasGenerated && !isLoading && (

          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg">

              <FileText className="h-8 w-8 text-white" />

            </div>

            <h3 className="text-lg font-semibold text-slate-700">
              Ready to Generate
            </h3>

            <p className="mt-2 max-w-xs text-sm">
              Your AI-generated draft will appear here beautifully formatted.
            </p>

          </div>

        )}

        {(hasGenerated || isLoading) && (

          <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
            {output}

            {isLoading && (
              <span className="ml-1 inline-block h-5 w-1.5 animate-pulse rounded bg-cyan-500 align-text-bottom" />
            )}

          </pre>

        )}

      </div>

    </div>
  )
} 
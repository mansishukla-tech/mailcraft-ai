/**
 * Streams a generation request to the backend and invokes onChunk(text)
 * for every piece of text as it arrives, giving a real-time typing effect.
 */
export async function streamGenerate({ mode, tone, letterType, recipient, inputText, signal, onChunk }) {
  const res = await fetch('https://mailcraft-ai-production-ab56.up.railway.app/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, tone, letterType, recipient, inputText }),
    signal,
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(errBody.error || `Request failed with status ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}

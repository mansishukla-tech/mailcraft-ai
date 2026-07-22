const GEMINI_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * Calls the Google Gemini API with streaming enabled and forwards the
 * generated text to the given Express response as raw text chunks, as they
 * arrive. This gives the frontend a real-time, token-by-token stream.
 */
export async function streamCompletion({ system, user, res }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw Object.assign(new Error('Server is missing GEMINI_API_KEY.'), { statusCode: 500 })
  }

  const model = process.env.LLM_MODEL || 'gemini-flash-latest'
  const url = `${GEMINI_URL_BASE}/${model}:streamGenerateContent?alt=sse`

  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
    }),
  })

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => '')
    throw Object.assign(
      new Error(`LLM provider error (${upstream.status}): ${errText.slice(0, 300)}`),
      { statusCode: 502 }
    )
  }

  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (!payload) continue

      let event
      try {
        event = JSON.parse(payload)
      } catch {
        continue
      }

      const text = event?.candidates?.[0]?.content?.parts?.[0]?.text
      if (typeof text === 'string') {
        res.write(text)
      }

      if (event?.promptFeedback?.blockReason) {
        res.write(`\n\n[Blocked by provider: ${event.promptFeedback.blockReason}]`)
      }
    }
  }
} 
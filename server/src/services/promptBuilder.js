const TONE_GUIDE = {
  Formal: 'formal and respectful, avoiding contractions and casual language',
  Friendly: 'warm, friendly, and personable, while still clear and respectful',
  Professional: 'polished, confident, and businesslike, suitable for a workplace audience',
  Polite: 'courteous, considerate, and diplomatically worded',
}

function toneInstruction(tone) {
  const guide = TONE_GUIDE[tone] || TONE_GUIDE.Professional
  return `Write in a tone that is ${guide}.`
}

/**
 * Builds a { system, user } prompt pair for the Anthropic Messages API
 * based on the feature (mode) selected in the UI.
 */
export function buildPrompt({ mode, tone, letterType, recipient, inputText }) {
  const trimmedInput = (inputText || '').trim()

  switch (mode) {
    case 'email': {
      const system = [
        'You are an expert professional writing assistant embedded in an app called MailCraft AI.',
        'You write clear, well-structured emails ready to send with minimal edits.',
        'Always start with a subject line on the first line formatted as "Subject: ...", then a blank line, then the email body with a greeting and a sign-off placeholder like "[Your name]".',
        'Do not add explanations, notes, or commentary outside the email itself.',
        toneInstruction(tone),
      ].join(' ')

      const user = [
        recipient ? `Recipient / context: ${recipient}` : null,
        `Key points to include:\n${trimmedInput}`,
      ]
        .filter(Boolean)
        .join('\n\n')

      return { system, user }
    }

    case 'letter': {
      const isInformal = letterType === 'informal'
      const system = [
        'You are an expert professional writing assistant embedded in an app called MailCraft AI.',
        `Write a well-structured ${isInformal ? 'informal, personal' : 'formal'} letter ready to send with minimal edits.`,
        'Include an appropriate greeting and closing with a sign-off placeholder like "[Your name]".',
        isInformal
          ? 'Keep the language natural and personable, as if writing to someone you know well.'
          : 'Keep the language formal, precise, and courteous, suitable for official or professional correspondence.',
        'Do not add explanations, notes, or commentary outside the letter itself.',
      ].join(' ')

      const user = [
        recipient ? `Recipient / context: ${recipient}` : null,
        `Key points to include:\n${trimmedInput}`,
      ]
        .filter(Boolean)
        .join('\n\n')

      return { system, user }
    }

    case 'rewrite': {
      const system = [
        'You are an expert professional writing assistant embedded in an app called MailCraft AI.',
        'Rewrite the text the user provides so it reads more clearly and naturally, while keeping the original meaning, facts, and intent completely intact.',
        'Return only the rewritten text, with no explanations, notes, or commentary.',
      ].join(' ')
      const user = `Rewrite the following text:\n\n${trimmedInput}`
      return { system, user }
    }

    case 'grammar': {
      const system = [
        'You are an expert proofreader embedded in an app called MailCraft AI.',
        'Correct all spelling, grammar, and punctuation errors in the text the user provides.',
        'Preserve the original meaning, tone, and style as closely as possible. Only fix errors, do not rewrite for style.',
        'Return only the corrected text, with no explanations, notes, or commentary.',
      ].join(' ')
      const user = `Correct the grammar in the following text:\n\n${trimmedInput}`
      return { system, user }
    }

    case 'tone': {
      const system = [
        'You are an expert professional writing assistant embedded in an app called MailCraft AI.',
        'Rewrite the text the user provides so it matches the requested tone, while keeping the original meaning and key details intact.',
        toneInstruction(tone),
        'Return only the rewritten text, with no explanations, notes, or commentary.',
      ].join(' ')
      const user = `Rewrite the following text:\n\n${trimmedInput}`
      return { system, user }
    }

    default:
      throw Object.assign(new Error(`Unknown mode "${mode}"`), { statusCode: 400 })
  }
}

export type TextCase = 'normal' | 'lower' | 'upper'

// Match the pronoun "I" (and its contractions: I'm, I've, I'll, I'd, I'm, etc.)
// as a standalone word. Uses \b word boundaries.
const I_PRONOUN_RE = /\bi(?='(m|ve|ll|d|s))?\b/g

/**
 * Apply the selected case transformation to display text.
 * - `normal`: returned unchanged
 * - `lower`: lowercased, but the pronoun "I" and its contractions stay uppercase
 * - `upper`: uppercased
 */
export function applyTextCase(text: string | null | undefined, mode: TextCase): string {
	if (!text) return ''
	if (mode === 'upper') return text.toUpperCase()
	if (mode === 'lower') {
		// Lowercase everything, then re-capitalize standalone "i" → "I"
		// (and its contractions like i'm → I'm).
		return text.toLowerCase().replace(I_PRONOUN_RE, 'I')
	}
	return text
}

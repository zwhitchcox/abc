export function isServerAiEnabled() {
	return (
		process.env.NODE_ENV !== 'production' ||
		process.env.ALLOW_SERVER_AI_GENERATION === 'true'
	)
}

export function serverAiDisabledMessage() {
	return 'Server-side AI generation is disabled. Generate assets locally and sync processed files to the server.'
}

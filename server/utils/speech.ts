import { Transform } from 'node:stream'
import { SpeechClient } from '@google-cloud/speech'

const client = new SpeechClient()

export function createSpeechToTextStream(audioStream: NodeJS.ReadableStream) {
	const config = {
		encoding: 'WEBM_OPUS' as const,
		sampleRateHertz: 48000,
		languageCode: 'en-US',
		streaming: true,
		speechContexts: [
			{
				phrases: ['duh', 'guh'],
				boost: 20,
			},
		],
		maxAlternatives: 5,
	}

	const request = {
		config,
		interimResults: true,
	}

	// Create a recognize stream
	const recognizeStream = client
		.streamingRecognize(request)
		.on('error', console.error)

	// Create a transform stream that will output the transcribed text
	const textStream = new Transform({
		objectMode: true,
		transform(chunk, encoding, callback) {
			const transcripts = chunk.results.map(
				(result: { alternatives: { transcript: string }[] }) =>
					result.alternatives[0]?.transcript,
			)
			console.log({ transcripts })
			const phoneticMatch = transcripts.find(
				(t: string) => t === 'duh' || t === 'guh',
			)
			const letter = phoneticMatch
				? phoneticMatch.replace('duh', 'D').replace('guh', 'G')
				: transcripts[0]?.toUpperCase()
			if (chunk.results[0]?.isFinal) {
				this.push(letter)
			}
			callback()
		},
	})

	audioStream.pipe(recognizeStream).pipe(textStream)

	return textStream
}

import { useEffect, useState } from 'react'
import { useSocket } from '#app/utils/socket.tsx'

export default function SpeechRecognition() {
	const socket = useSocket()
	const [isRecording, setIsRecording] = useState(false)
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
	const [transcript, setTranscript] = useState('')

	useEffect(() => {
		if (!socket) return

		socket.on('transcript', (data) => {
			console.log('transcript', data)
			setTranscript(data)
		})

		return () => {
			socket.off('transcript')
		}
	}, [socket])

	const startRecording = async () => {
		if (!socket) return
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			const recorder = new MediaRecorder(stream)
			setMediaRecorder(recorder)

			recorder.ondataavailable = (event) => {
				if (socket && event.data.size > 0) {
					socket.emit('audio-data', event.data)
				}
			}

			socket.emit('start-recording')
			recorder.start(100) // Collect data every 100ms
			setIsRecording(true)
		} catch (err) {
			console.error('Error accessing microphone:', err)
		}
	}

	const stopRecording = () => {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop()
			mediaRecorder.stream.getTracks().forEach((track) => track.stop())
			socket?.emit('stop-recording')
			setIsRecording(false)
		}
	}

	return (
		<div
			style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}
			className="flex flex-col items-center justify-center gap-4"
		>
			{socket ? (
				<button
					onClick={isRecording ? stopRecording : startRecording}
					className={`rounded-md p-2 text-white ${
						isRecording ? 'bg-red-500' : 'bg-blue-500'
					}`}
				>
					{isRecording ? 'Stop Recording' : 'Start Recording'}
				</button>
			) : (
				<p>Connecting to server...</p>
			)}
			{transcript && (
				<div className="max-w-lg rounded-lg bg-gray-100 p-4">
					<p>{transcript}</p>
				</div>
			)}
		</div>
	)
}

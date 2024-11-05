// app/routes/index.tsx

import { useEffect, useState } from 'react'

export default function Index() {
	const [currentLetter, setCurrentLetter] = useState<string>('')

	const showRandomLetter = () => {
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		const randomLetter = letters[Math.floor(Math.random() * letters.length)]!
		setCurrentLetter(randomLetter)
	}

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === ' ') {
				// Show a random letter when space is pressed
				showRandomLetter()
			} else if (/^[a-zA-Z]$/.test(event.key)) {
				// Display the pressed letter
				setCurrentLetter(event.key.toUpperCase())
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		// Clean up the event listener when the component unmounts
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	return (
		<div
			onClick={showRandomLetter}
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
				padding: '20px',
				boxSizing: 'border-box',
				userSelect: 'none', // Prevents text selection on tap
				touchAction: 'manipulation', // Improves touch responsiveness
			}}
		>
			<span
				style={{
					fontSize: '80vh',
					lineHeight: '1',
				}}
			>
				{currentLetter}
			</span>
		</div>
	)
}

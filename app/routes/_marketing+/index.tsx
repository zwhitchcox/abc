import { useEffect, useState, useCallback } from 'react'
import { Button } from '#app/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { Checkbox } from '#app/components/ui/checkbox'

const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const allNumbers = '0123456789'.split('')
const allCharacters = [...allLetters, ...allNumbers]

const vowels = ['A', 'E', 'I', 'O', 'U']
const consonants = allLetters.filter((letter) => !vowels.includes(letter))

const wideCharacters = ['W', 'M', 'w', 'm']

const letterWords: Record<string, string[]> = {
	A: ['hey', 'ay', 'eh'],
	B: ['bee', 'beat', 'be'],
	C: ['see', 'sea'],
	D: ['dee'],
	E: ['eat'],
	F: ['ef'],
	G: ['gee'],
	H: ['age', 'ache'],
	I: ['eye', 'aye', 'hi'],
	J: ['jay'],
	K: ['kay'],
	L: ['el'],
	M: ['em', 'in'],
	N: ['en', 'in'],
	O: ['oh', 'owe'],
	P: ['pea', 'pee'],
	Q: ['queue', 'cute'],
	R: ['are', 'our'],
	S: ['es'],
	T: ['tea', 'tee'],
	U: ['you'],
	V: ['vee'],
	W: ['double you', 'tell you'],
	X: ['ex'],
	Y: ['why'],
	Z: ['zee', 'zed'],
}

const playAudioForLetter = (letter: string) => {
	const audio = new Audio(`/letters/${letter.toLowerCase()}.wav`)
	void audio.play()
}

export default function Index() {
	const [enabledCharacters, setEnabledCharacters] = useState<{
		[key: string]: boolean
	} | null>(null)
	const [currentCharacter, setCurrentCharacter] = useState<string>('')
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [isUpperCase, setIsUpperCase] = useState<boolean>(false)
	const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false)
	const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false)

	const getEnabledCharacters = useCallback(() => {
		if (!enabledCharacters) return []
		return allCharacters.filter((char) => enabledCharacters[char])
	}, [enabledCharacters])

	const showRandomCharacter = useCallback(() => {
		if (isModalOpen) return
		const chars = getEnabledCharacters()
		if (chars.length === 0) {
			setCurrentCharacter('')
			return
		}
		let randomChar = chars[Math.floor(Math.random() * chars.length)] || ''
		if (!isUpperCase) {
			randomChar = randomChar.toLowerCase()
		}
		setCurrentCharacter(randomChar)
		if (isSoundEnabled) {
			playAudioForLetter(randomChar)
		}
	}, [getEnabledCharacters, isModalOpen, isUpperCase, isSoundEnabled])

	// Initialize speech recognition
	useEffect(() => {
		let ignore = false
		if (typeof window !== 'undefined' && isSpeechEnabled) {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition
			if (SpeechRecognition) {
				const recognition = new SpeechRecognition()
				recognition.continuous = true
				recognition.interimResults = true

				recognition.onresult = (event) => {
					if (ignore) return
					const last = event.results.length - 1
					const transcript = event.results[last]?.[0]?.transcript
						.toLowerCase()
						.trim()
					console.log('Speech detected:', transcript)

					if (!currentCharacter) return

					const currentUpperChar = currentCharacter.toUpperCase()
					const matchingWords = letterWords[currentUpperChar] || []

					// Check if the transcript matches the current character or any of its word equivalents
					if (
						transcript === currentCharacter.toLowerCase() ||
						transcript === currentUpperChar.toLowerCase() ||
						matchingWords.some((word) =>
							transcript?.includes(word.toLowerCase()),
						) ||
						transcript?.match(
							new RegExp(`(^|\\s)${currentCharacter.toLowerCase()}(\\s|$)`),
						)
					) {
						// console.log('Correct letter detected!')
						showRandomCharacter()
					}
				}

				recognition.onerror = (event) => {
					console.error('Speech recognition error:', event.error)
				}

				recognition.start()

				return () => {
					recognition.stop()
					ignore = true
				}
			}
		}
	}, [currentCharacter, showRandomCharacter, isSpeechEnabled])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedEnabledCharacters = localStorage.getItem('enabledCharacters')
			const savedCase = localStorage.getItem('isUpperCase')
			const savedSound = localStorage.getItem('isSoundEnabled')
			const savedSpeech = localStorage.getItem('isSpeechEnabled')

			if (savedEnabledCharacters) {
				const parsedEnabledCharacters = JSON.parse(savedEnabledCharacters) as {
					[key: string]: boolean
				}
				setEnabledCharacters(parsedEnabledCharacters)
			} else {
				const initialCharacters: { [key: string]: boolean } = {}
				allLetters.forEach((char) => {
					initialCharacters[char] = true
				})
				allNumbers.forEach((char) => {
					initialCharacters[char] = false
				})
				setEnabledCharacters(initialCharacters)
			}

			if (savedCase) {
				setIsUpperCase(JSON.parse(savedCase ?? 'false') as boolean)
			}

			if (savedSound) {
				setIsSoundEnabled(JSON.parse(savedSound ?? 'false') as boolean)
			}

			if (savedSpeech) {
				setIsSpeechEnabled(JSON.parse(savedSpeech ?? 'false') as boolean)
			}
		}
	}, [])

	useEffect(() => {
		if (typeof window !== 'undefined' && enabledCharacters) {
			localStorage.setItem(
				'enabledCharacters',
				JSON.stringify(enabledCharacters),
			)
		}
	}, [enabledCharacters])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('isUpperCase', JSON.stringify(isUpperCase))
		}
	}, [isUpperCase])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('isSoundEnabled', JSON.stringify(isSoundEnabled))
		}
	}, [isSoundEnabled])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('isSpeechEnabled', JSON.stringify(isSpeechEnabled))
		}
	}, [isSpeechEnabled])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Escape' && isModalOpen) {
				setIsModalOpen(false)
				return
			}
			if (!enabledCharacters || isModalOpen) return
			if (event.key === ' ') {
				event.preventDefault() // Prevent scrolling when space is pressed
				showRandomCharacter()
			} else if (/^[a-zA-Z0-9]$/.test(event.key)) {
				let key = event.key.toUpperCase()
				if (enabledCharacters[key]) {
					if (!isUpperCase) {
						key = key.toLowerCase()
					}
					setCurrentCharacter(key)
					if (isSoundEnabled) {
						playAudioForLetter(key)
					}
				}
			}
		},
		[
			showRandomCharacter,
			enabledCharacters,
			isModalOpen,
			isUpperCase,
			isSoundEnabled,
		],
	)

	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeyDown)

			// Clean up the event listener when the component unmounts
			return () => {
				window.removeEventListener('keydown', handleKeyDown)
			}
		}
	}, [handleKeyDown])

	// Function to toggle the modal
	const toggleModal = () => {
		setIsModalOpen((prev) => !prev)
	}

	// While loading settings, don't render the main content to avoid hydration mismatch
	if (enabledCharacters === null) {
		return null // Or a loading indicator if you prefer
	}

	return (
		<div className="relative box-border h-screen touch-manipulation select-none">
			{/* Button to open the modal */}
			<Button
				onClick={toggleModal}
				className="absolute right-5 top-5 z-10 px-4 py-2 text-lg"
			>
				Options
			</Button>

			{/* Modal */}
			{isModalOpen && (
				<div
					onClick={toggleModal}
					className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50"
				>
					<Card
						onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking inside
						className="max-h-[90vh] max-w-3xl overflow-y-auto"
					>
						<CardHeader className="flex items-center justify-between">
							<CardTitle>Options</CardTitle>
							<Button onClick={toggleModal} variant="ghost">
								Close
							</Button>
						</CardHeader>
						<CardContent>
							<OptionsComponent
								enabledCharacters={enabledCharacters}
								setEnabledCharacters={setEnabledCharacters}
								isUpperCase={isUpperCase}
								setIsUpperCase={setIsUpperCase}
								isSoundEnabled={isSoundEnabled}
								setIsSoundEnabled={setIsSoundEnabled}
								isSpeechEnabled={isSpeechEnabled}
								setIsSpeechEnabled={setIsSpeechEnabled}
							/>
						</CardContent>
					</Card>
				</div>
			)}
			<div
				onClick={showRandomCharacter}
				className="flex h-full items-center justify-center"
			>
				<span
					style={{
						fontSize: wideCharacters.includes(currentCharacter)
							? '60vh'
							: '80vh',
						lineHeight: '1',
					}}
				>
					{currentCharacter}
				</span>
			</div>
		</div>
	)
}

function OptionsComponent({
	enabledCharacters,
	setEnabledCharacters,
	isUpperCase,
	setIsUpperCase,
	isSoundEnabled,
	setIsSoundEnabled,
	isSpeechEnabled,
	setIsSpeechEnabled,
}: {
	enabledCharacters: { [key: string]: boolean }
	setEnabledCharacters: React.Dispatch<
		React.SetStateAction<{ [key: string]: boolean } | null>
	>
	isUpperCase: boolean
	setIsUpperCase: React.Dispatch<React.SetStateAction<boolean>>
	isSoundEnabled: boolean
	setIsSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>
	isSpeechEnabled: boolean
	setIsSpeechEnabled: React.Dispatch<React.SetStateAction<boolean>>
}) {
	const selectAllCharacters = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		allCharacters.forEach((char) => {
			updatedCharacters[char] = true
		})
		setEnabledCharacters(updatedCharacters)
	}, [setEnabledCharacters])

	const deselectAllCharacters = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		allCharacters.forEach((char) => {
			updatedCharacters[char] = false
		})
		setEnabledCharacters(updatedCharacters)
	}, [setEnabledCharacters])

	const selectAllLetters = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		allLetters.forEach((char) => {
			updatedCharacters[char] = true
		})
		allNumbers.forEach((char) => {
			updatedCharacters[char] = false
		})
		setEnabledCharacters(updatedCharacters)
	}, [setEnabledCharacters])

	const selectVowels = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		vowels.forEach((char) => {
			updatedCharacters[char] = true
		})
		consonants.forEach((char) => {
			updatedCharacters[char] = false
		})
		allNumbers.forEach((char) => {
			updatedCharacters[char] = false
		})
		setEnabledCharacters(updatedCharacters)
	}, [setEnabledCharacters])

	const selectConsonants = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		consonants.forEach((char) => {
			updatedCharacters[char] = true
		})
		vowels.forEach((char) => {
			updatedCharacters[char] = false
		})
		allNumbers.forEach((char) => {
			updatedCharacters[char] = false
		})
		setEnabledCharacters(updatedCharacters)
	}, [setEnabledCharacters])

	const selectAllNumbers = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		allLetters.forEach((char) => {
			updatedCharacters[char] = false
		})
		allNumbers.forEach((char) => {
			updatedCharacters[char] = true
		})
		setEnabledCharacters(updatedCharacters)
	}, [setEnabledCharacters])

	const toggleCharacter = useCallback(
		(char: string) => {
			setEnabledCharacters((prev) => {
				if (!prev) return prev
				return {
					...prev,
					[char]: !prev[char],
				}
			})
		},
		[setEnabledCharacters],
	)

	return (
		<div className="min-w-[300px]">
			{/* Case Toggle */}
			<div className="mb-4 space-y-2">
				<label className="flex items-center space-x-2">
					<Checkbox
						checked={isUpperCase}
						onCheckedChange={() => setIsUpperCase((prev) => !prev)}
					/>
					<span>Uppercase Output</span>
				</label>
				<label className="flex items-center space-x-2">
					<Checkbox
						checked={isSoundEnabled}
						onCheckedChange={() => setIsSoundEnabled((prev) => !prev)}
					/>
					<span>Enable Sound</span>
				</label>
				<label className="flex items-center space-x-2">
					<Checkbox
						checked={isSpeechEnabled}
						onCheckedChange={() => setIsSpeechEnabled((prev) => !prev)}
					/>
					<span>Enable Speech Recognition</span>
				</label>
			</div>

			<div className="mb-4 flex flex-wrap gap-2">
				<Button onClick={selectAllLetters}>Letters</Button>
				<Button onClick={selectVowels}>Vowels</Button>
				<Button onClick={selectConsonants}>Consonants</Button>
				<Button onClick={selectAllNumbers}>Numbers</Button>
				<Button onClick={selectAllCharacters}>All</Button>
				<Button onClick={deselectAllCharacters}>Deselect All</Button>
			</div>
			<div className="flex flex-wrap gap-2">
				{allCharacters.map((char) => (
					<label key={char} className="flex items-center space-x-1">
						<Checkbox
							checked={enabledCharacters[char]}
							onCheckedChange={() => toggleCharacter(char)}
						/>
						<span>{char}</span>
					</label>
				))}
			</div>
		</div>
	)
}

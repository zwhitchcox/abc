// app/routes/index.tsx

import { useEffect, useState, useCallback } from 'react'
import { Button } from '#app/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { Checkbox } from '#app/components/ui/checkbox'

// Define all characters (letters and numbers) outside the component
const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const allNumbers = '0123456789'.split('')
const allCharacters = [...allLetters, ...allNumbers]

const vowels = ['A', 'E', 'I', 'O', 'U']
const consonants = allLetters.filter((letter) => !vowels.includes(letter))

// Define wide characters that need a smaller font size
const wideCharacters = ['W', 'M']

export default function Index() {
	// Initialize state
	const [enabledCharacters, setEnabledCharacters] = useState<{
		[key: string]: boolean
	} | null>(null)
	const [currentCharacter, setCurrentCharacter] = useState<string>('')
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

	// Load settings from localStorage on client-side
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedEnabledCharacters = localStorage.getItem('enabledCharacters')

			if (savedEnabledCharacters) {
				// Cast the parsed JSON to the expected type
				const parsedEnabledCharacters = JSON.parse(savedEnabledCharacters) as {
					[key: string]: boolean
				}
				setEnabledCharacters(parsedEnabledCharacters)
			} else {
				// Initialize letters as enabled, numbers as disabled
				const initialCharacters: { [key: string]: boolean } = {}
				allLetters.forEach((char) => {
					initialCharacters[char] = true
				})
				allNumbers.forEach((char) => {
					initialCharacters[char] = false
				})
				setEnabledCharacters(initialCharacters)
			}
		}
	}, [])

	// Save settings to localStorage whenever they change
	useEffect(() => {
		if (typeof window !== 'undefined' && enabledCharacters) {
			localStorage.setItem(
				'enabledCharacters',
				JSON.stringify(enabledCharacters),
			)
		}
	}, [enabledCharacters])

	// Function to get enabled characters
	const getEnabledCharacters = useCallback(() => {
		if (!enabledCharacters) return []
		return allCharacters.filter((char) => enabledCharacters[char])
	}, [enabledCharacters])

	const showRandomCharacter = useCallback(() => {
		if (isModalOpen) return // Do not change character when modal is open
		const chars = getEnabledCharacters()
		if (chars.length === 0) {
			setCurrentCharacter('')
			return
		}
		const randomChar = chars[Math.floor(Math.random() * chars.length)] || ''
		setCurrentCharacter(randomChar)
	}, [getEnabledCharacters, isModalOpen])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Escape' && isModalOpen) {
				// Close the modal when Escape is pressed
				setIsModalOpen(false)
				return
			}
			if (!enabledCharacters || isModalOpen) return
			if (event.key === ' ') {
				event.preventDefault() // Prevent scrolling when space is pressed
				showRandomCharacter()
			} else if (/^[a-zA-Z0-9]$/.test(event.key)) {
				const key = event.key.toUpperCase()
				if (enabledCharacters[key]) {
					setCurrentCharacter(key)
				}
			}
		},
		[showRandomCharacter, enabledCharacters, isModalOpen],
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
							/>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Display Area */}
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

// OptionsComponent

function OptionsComponent({
	enabledCharacters,
	setEnabledCharacters,
}: {
	enabledCharacters: { [key: string]: boolean }
	setEnabledCharacters: React.Dispatch<
		React.SetStateAction<{ [key: string]: boolean } | null>
	>
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
			{/* Options Bar */}
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

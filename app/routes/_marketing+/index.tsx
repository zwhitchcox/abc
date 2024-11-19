import { useEffect, useState, useCallback, useRef } from 'react'
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

type Options = {
	enabledCharacters: { [key: string]: boolean } | null
	isUpperCase: boolean
	isSoundEnabled: boolean
}

export default function Index() {
	const [options, setOptions] = useState<Options>({
		enabledCharacters: null,
		isUpperCase: false,
		isSoundEnabled: false,
	})
	const [currentCharacter, setCurrentCharacter] = useState<string>('')
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const audioRef = useRef<HTMLAudioElement | null>(null)

	const playAudioForLetter = useCallback((letter: string) => {
		if (audioRef.current) {
			audioRef.current.src = `/letters/${letter.toLowerCase()}.wav`
			return audioRef.current.play()
		}
		return Promise.resolve()
	}, [])

	const isAudioPlaying = useCallback(() => {
		return audioRef.current && !audioRef.current.paused
	}, [])

	const showRandomCharacter = useCallback(() => {
		if (isModalOpen || isAudioPlaying()) return
		const chars = options.enabledCharacters
			? allCharacters.filter((char) => options.enabledCharacters![char])
			: allCharacters
		if (chars.length === 0) {
			setCurrentCharacter('')
			return
		}
		let randomChar = chars[Math.floor(Math.random() * chars.length)] || ''
		if (!options.isUpperCase) {
			randomChar = randomChar.toLowerCase()
		}
		setCurrentCharacter(randomChar)
		if (options.isSoundEnabled) {
			void playAudioForLetter(randomChar)
		}
	}, [
		options.enabledCharacters,
		isModalOpen,
		options.isUpperCase,
		options.isSoundEnabled,
		playAudioForLetter,
		isAudioPlaying,
	])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			audioRef.current = new Audio()
		}
	}, [])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedOptions = localStorage.getItem('options')
			if (savedOptions) {
				setOptions(JSON.parse(savedOptions) as Options)
			} else {
				const initialCharacters: { [key: string]: boolean } = {}
				allLetters.forEach((char) => {
					initialCharacters[char] = true
				})
				allNumbers.forEach((char) => {
					initialCharacters[char] = false
				})
				setOptions((prev) => ({
					...prev,
					enabledCharacters: initialCharacters,
				}))
			}
		}
	}, [])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('options', JSON.stringify(options))
		}
	}, [options])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Escape' && isModalOpen) {
				setIsModalOpen(false)
				return
			}
			if (!options.enabledCharacters || isModalOpen || isAudioPlaying()) return
			if (event.key === ' ') {
				event.preventDefault()
				showRandomCharacter()
			} else if (/^[a-zA-Z0-9]$/.test(event.key)) {
				let key = event.key.toUpperCase()
				if (options.enabledCharacters[key]) {
					if (!options.isUpperCase) {
						key = key.toLowerCase()
					}
					setCurrentCharacter(key)
					if (options.isSoundEnabled) {
						void playAudioForLetter(key)
					}
				}
			}
		},
		[
			showRandomCharacter,
			options.enabledCharacters,
			isModalOpen,
			options.isUpperCase,
			options.isSoundEnabled,
			playAudioForLetter,
			isAudioPlaying,
		],
	)

	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeyDown)
			return () => window.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleKeyDown])

	const toggleModal = () => setIsModalOpen((prev) => !prev)

	if (options.enabledCharacters === null) return null

	return (
		<div className="relative box-border h-screen touch-manipulation select-none">
			<Button
				onClick={toggleModal}
				className="absolute right-5 top-5 z-10 px-4 py-2 text-lg"
			>
				Options
			</Button>

			{isModalOpen && (
				<div
					onClick={toggleModal}
					className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50"
				>
					<Card
						onClick={(e) => e.stopPropagation()}
						className="max-h-[90vh] max-w-3xl overflow-y-auto"
					>
						<CardHeader className="flex items-center justify-between">
							<CardTitle>Options</CardTitle>
							<Button onClick={toggleModal} variant="ghost">
								Close
							</Button>
						</CardHeader>
						<CardContent>
							<OptionsComponent options={options} setOptions={setOptions} />
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
	options,
	setOptions,
}: {
	options: Options
	setOptions: React.Dispatch<React.SetStateAction<Options>>
}) {
	const selectAllCharacters = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		allCharacters.forEach((char) => {
			updatedCharacters[char] = true
		})
		setOptions((prev) => ({
			...prev,
			enabledCharacters: updatedCharacters,
		}))
	}, [setOptions])

	const deselectAllCharacters = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		allCharacters.forEach((char) => {
			updatedCharacters[char] = false
		})
		setOptions((prev) => ({
			...prev,
			enabledCharacters: updatedCharacters,
		}))
	}, [setOptions])

	const selectAllLetters = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		allLetters.forEach((char) => {
			updatedCharacters[char] = true
		})
		allNumbers.forEach((char) => {
			updatedCharacters[char] = false
		})
		setOptions((prev) => ({
			...prev,
			enabledCharacters: updatedCharacters,
		}))
	}, [setOptions])

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
		setOptions((prev) => ({
			...prev,
			enabledCharacters: updatedCharacters,
		}))
	}, [setOptions])

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
		setOptions((prev) => ({
			...prev,
			enabledCharacters: updatedCharacters,
		}))
	}, [setOptions])

	const selectAllNumbers = useCallback(() => {
		const updatedCharacters: { [key: string]: boolean } = {}
		allLetters.forEach((char) => {
			updatedCharacters[char] = false
		})
		allNumbers.forEach((char) => {
			updatedCharacters[char] = true
		})
		setOptions((prev) => ({
			...prev,
			enabledCharacters: updatedCharacters,
		}))
	}, [setOptions])

	const toggleCharacter = useCallback(
		(char: string) => {
			setOptions((prev) => {
				if (!prev.enabledCharacters) return prev
				return {
					...prev,
					enabledCharacters: {
						...prev.enabledCharacters,
						[char]: !prev.enabledCharacters[char],
					},
				}
			})
		},
		[setOptions],
	)

	return (
		<div className="min-w-[300px]">
			<div className="mb-4 space-y-2">
				<label className="flex items-center space-x-2">
					<Checkbox
						checked={options.isUpperCase}
						onCheckedChange={() =>
							setOptions((prev) => ({
								...prev,
								isUpperCase: !prev.isUpperCase,
							}))
						}
					/>
					<span>Uppercase Output</span>
				</label>
				<label className="flex items-center space-x-2">
					<Checkbox
						checked={options.isSoundEnabled}
						onCheckedChange={() =>
							setOptions((prev) => ({
								...prev,
								isSoundEnabled: !prev.isSoundEnabled,
							}))
						}
					/>
					<span>Enable Sound</span>
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
							checked={options.enabledCharacters?.[char]}
							onCheckedChange={() => toggleCharacter(char)}
						/>
						<span>{char}</span>
					</label>
				))}
			</div>
		</div>
	)
}

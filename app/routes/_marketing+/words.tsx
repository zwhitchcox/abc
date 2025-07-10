import { useEffect, useRef, useState, useCallback } from 'react'

type Difficulty = 'easy' | 'medium' | 'hard'
type Category =
	| 'animals'
	| 'dinosaurs'
	| 'shapes'
	| 'fruits'
	| 'vehicles'
	| 'household'
	| 'colors'

// Large word list example:
type WordItem = {
	word: string
	categories: Category[]
	difficulty: Difficulty
	sound?: string // optional custom sound path
}

const wordList: WordItem[] = [
	// Easy Animals
	{
		word: 'cat',
		categories: ['animals'],
		difficulty: 'easy',
		sound: '/sounds/cat.wav',
	},
	{
		word: 'dog',
		categories: ['animals'],
		difficulty: 'easy',
		sound: '/sounds/dog.wav',
	},
	{ word: 'cow', categories: ['animals'], difficulty: 'easy' },
	{ word: 'pig', categories: ['animals'], difficulty: 'easy' },
	{ word: 'ant', categories: ['animals'], difficulty: 'easy' },
	// Medium Animals
	{ word: 'tiger', categories: ['animals'], difficulty: 'medium' },
	{ word: 'giraffe', categories: ['animals'], difficulty: 'medium' },
	{ word: 'elephant', categories: ['animals'], difficulty: 'medium' },
	{ word: 'kangaroo', categories: ['animals'], difficulty: 'medium' },
	// Hard Animals
	{ word: 'hippopotamus', categories: ['animals'], difficulty: 'hard' },
	{ word: 'chimpanzee', categories: ['animals'], difficulty: 'hard' },
	{ word: 'rhinoceros', categories: ['animals'], difficulty: 'hard' },

	// Dinosaurs
	{ word: 'rex', categories: ['dinosaurs'], difficulty: 'easy' },
	{ word: 'trike', categories: ['dinosaurs'], difficulty: 'easy' },
	{ word: 'saurus', categories: ['dinosaurs'], difficulty: 'medium' },
	{ word: 'velociraptor', categories: ['dinosaurs'], difficulty: 'hard' },
	{ word: 'brachiosaurus', categories: ['dinosaurs'], difficulty: 'hard' },
	{ word: 'stegosaurus', categories: ['dinosaurs'], difficulty: 'medium' },

	// Shapes (mostly easy or medium)
	{ word: 'circle', categories: ['shapes'], difficulty: 'easy' },
	{ word: 'square', categories: ['shapes'], difficulty: 'easy' },
	{ word: 'triangle', categories: ['shapes'], difficulty: 'easy' },
	{ word: 'hexagon', categories: ['shapes'], difficulty: 'medium' },
	{ word: 'octagon', categories: ['shapes'], difficulty: 'medium' },

	// Fruits
	{ word: 'apple', categories: ['fruits'], difficulty: 'easy' },
	{ word: 'pear', categories: ['fruits'], difficulty: 'easy' },
	{ word: 'orange', categories: ['fruits'], difficulty: 'medium' },
	{ word: 'banana', categories: ['fruits'], difficulty: 'medium' },
	{ word: 'watermelon', categories: ['fruits'], difficulty: 'hard' },
	{ word: 'pomegranate', categories: ['fruits'], difficulty: 'hard' },

	// Vehicles
	{ word: 'car', categories: ['vehicles'], difficulty: 'easy' },
	{ word: 'bus', categories: ['vehicles'], difficulty: 'easy' },
	{ word: 'train', categories: ['vehicles'], difficulty: 'medium' },
	{ word: 'airplane', categories: ['vehicles'], difficulty: 'medium' },
	{ word: 'motorcycle', categories: ['vehicles'], difficulty: 'hard' },
	{ word: 'helicopter', categories: ['vehicles'], difficulty: 'hard' },

	// Household
	{ word: 'bed', categories: ['household'], difficulty: 'easy' },
	{ word: 'chair', categories: ['household'], difficulty: 'easy' },
	{ word: 'window', categories: ['household'], difficulty: 'medium' },
	{ word: 'refrigerator', categories: ['household'], difficulty: 'hard' },
	{ word: 'television', categories: ['household'], difficulty: 'medium' },

	// Colors
	{ word: 'red', categories: ['colors'], difficulty: 'easy' },
	{ word: 'blue', categories: ['colors'], difficulty: 'easy' },
	{ word: 'green', categories: ['colors'], difficulty: 'easy' },
	{ word: 'purple', categories: ['colors'], difficulty: 'medium' },
	{ word: 'turquoise', categories: ['colors'], difficulty: 'hard' },
	{ word: 'magenta', categories: ['colors'], difficulty: 'hard' },
]

export default function ReadingGame() {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [listening, setListening] = useState(false)
	const [recognizedText, setRecognizedText] = useState('')
	const [isCorrect, setIsCorrect] = useState(false)
	const recognitionRef = useRef<SpeechRecognition | null>(null)
	const audioRef = useRef<HTMLAudioElement | null>(null)

	const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
	const [selectedDifficulty, setSelectedDifficulty] = useState<
		Difficulty | 'all'
	>('all')

	// Filter words based on user’s selection
	const filteredWords = wordList.filter((w) => {
		const difficultyMatch =
			selectedDifficulty === 'all' || w.difficulty === selectedDifficulty
		const categoryMatch =
			selectedCategories.length === 0 ||
			w.categories.some((c) => selectedCategories.includes(c))
		return difficultyMatch && categoryMatch
	})

	const currentWord =
		filteredWords.length > 0
			? filteredWords[currentIndex % filteredWords.length]
			: null

	const initSpeechRecognition = useCallback(() => {
		const SpeechRecognition =
			window.SpeechRecognition || (window as any).webkitSpeechRecognition
		if (!SpeechRecognition) return null
		const recognition = new SpeechRecognition()
		recognition.continuous = false
		recognition.interimResults = false
		recognition.lang = 'en-US'
		return recognition
	}, [])

	useEffect(() => {
		recognitionRef.current = initSpeechRecognition()
		if (typeof window !== 'undefined') {
			audioRef.current = new Audio()
		}
	}, [initSpeechRecognition])

	const playWordAudio = useCallback(async () => {
		if (!currentWord) return
		if (audioRef.current && currentWord.sound) {
			audioRef.current.src = currentWord.sound
			await audioRef.current.play().catch(() => {})
		} else {
			// No custom sound, use Text-to-Speech as a fallback
			const utter = new SpeechSynthesisUtterance(currentWord.word)
			speechSynthesis.speak(utter)
		}
	}, [currentWord])

	useEffect(() => {
		void playWordAudio()
	}, [currentIndex, playWordAudio])

	const startListening = useCallback(() => {
		if (!recognitionRef.current || !currentWord) return
		setRecognizedText('')
		setListening(true)
		setIsCorrect(false)
		recognitionRef.current.start()
	}, [currentWord])

	const stopListening = useCallback(() => {
		if (!recognitionRef.current) return
		setListening(false)
		recognitionRef.current.stop()
	}, [])

	useEffect(() => {
		if (!recognitionRef.current) return

		recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
			const transcript = event.results[0]?.[0]?.transcript
				?.trim()
				?.toLowerCase()
			setRecognizedText(transcript!)
			if (currentWord && transcript === currentWord.word.toLowerCase()) {
				setIsCorrect(true)
				setTimeout(() => {
					setCurrentIndex((prev) => prev + 1)
					setRecognizedText('')
					setIsCorrect(false)
					void playWordAudio()
				}, 1500)
			} else {
				// If incorrect, try again
				setTimeout(() => startListening(), 1000)
			}
		}

		recognitionRef.current.onerror = () => {
			setListening(false)
		}
	}, [currentWord, startListening, playWordAudio])

	useEffect(() => {
		if (currentWord && recognitionRef.current) {
			startListening()
		}
	}, [currentIndex, currentWord, startListening])

	const allCategories: Category[] = [
		'animals',
		'dinosaurs',
		'shapes',
		'fruits',
		'vehicles',
		'household',
		'colors',
	]

	return (
		<div className="flex min-h-screen flex-col items-center justify-center space-y-8 p-4">
			<div className="flex flex-col items-center space-y-4">
				<h1 className="text-2xl font-bold">Reading Game</h1>
				<div className="flex flex-wrap justify-center gap-2">
					<label>
						Difficulty:
						<select
							className="ml-2 border p-1"
							value={selectedDifficulty}
							onChange={(e) =>
								setSelectedDifficulty(e.target.value as Difficulty | 'all')
							}
						>
							<option value="all">All</option>
							<option value="easy">Easy</option>
							<option value="medium">Medium</option>
							<option value="hard">Hard</option>
						</select>
					</label>
					<div className="flex flex-wrap items-center gap-2">
						{allCategories.map((cat) => (
							<label key={cat} className="flex items-center space-x-1">
								<input
									type="checkbox"
									checked={selectedCategories.includes(cat)}
									onChange={() => {
										setSelectedCategories((prev) =>
											prev.includes(cat)
												? prev.filter((c) => c !== cat)
												: [...prev, cat],
										)
									}}
								/>
								<span>{cat}</span>
							</label>
						))}
					</div>
				</div>
				{filteredWords.length === 0 && (
					<div className="text-red-500">
						No words match your filters. Please adjust categories/difficulty.
					</div>
				)}
			</div>
			{currentWord && (
				<div className="flex flex-col items-center">
					<h2 className="text-4xl font-bold">{currentWord.word}</h2>
					{isCorrect ? (
						<div className="mt-4 text-2xl text-green-600">Correct! 🎉</div>
					) : (
						<div className="mt-4 text-gray-500">
							{listening ? 'Say the word...' : 'Click to listen again'}
						</div>
					)}
					{!listening && filteredWords.length > 0 && (
						<button
							onClick={startListening}
							className="mt-4 bg-blue-500 px-4 py-2 text-white"
						>
							Listen Again
						</button>
					)}
					{recognizedText && !isCorrect && (
						<div className="mt-2 text-red-500">You said: {recognizedText}</div>
					)}
				</div>
			)}
		</div>
	)
}

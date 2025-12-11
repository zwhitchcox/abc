import { Link } from '@remix-run/react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { Icon } from '#app/components/ui/icon.tsx'

const games = [
	{
		title: 'Flashcards',
		description: 'Learn with real photos of animals, nature, and more',
		path: '/flashcards',
		icon: 'camera',
		color: 'from-amber-400 to-orange-500',
		features: ['Real images', 'Name reveal', 'Spacebar navigation'],
	},
	{
		title: 'Story Time',
		description: 'Listen to read-aloud picture books',
		path: '/stories',
		icon: 'play',
		color: 'from-orange-500 to-red-500',
		features: ['Audio narration', 'Page turning', 'Classic stories'],
	},
	{
		title: 'Picture Books',
		description: 'Read your favorite books online',
		path: '/pdf-stories',
		icon: 'book-open',
		color: 'from-purple-500 to-indigo-500',
		features: ['Interactive reading', 'Zoom support', 'Progress tracking'],
	},
	{
		title: 'ABC Learning',
		description: 'Master the alphabet and numbers',
		path: '/abc',
		icon: 'pencil-1',
		color: 'from-blue-400 to-cyan-500',
		features: ['Letters A-Z', 'Numbers 0-9', 'Sound support'],
	},
	{
		title: 'Word Reading',
		description: 'Practice reading with voice recognition',
		path: '/words',
		icon: 'microphone',
		color: 'from-emerald-400 to-green-500',
		features: ['Speech recognition', 'Difficulty levels', 'Categories'],
	},
	{
		title: 'Colors',
		description: 'Explore the rainbow of colors',
		path: '/colors',
		icon: 'sun',
		color: 'from-pink-400 to-rose-500',
		features: ['21 colors', 'Interactive display', 'Name learning'],
	},
]

export default function Index() {
	return (
		<div className="min-h-screen bg-stone-50 dark:bg-stone-950">
			<div className="container mx-auto px-4 py-12">
				<div className="text-center mb-16 space-y-4">
					<div className="inline-block p-4 rounded-full bg-white dark:bg-stone-900 shadow-xl mb-6">
						<Icon name="rocket" className="w-16 h-16 text-orange-500" />
					</div>
					<h1 className="text-5xl font-black tracking-tight text-stone-900 dark:text-stone-100">
						Zephyr Learning
					</h1>
					<p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
						Interactive educational adventures for young minds. Explore, read, and learn through play.
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
					{games.map((game) => (
						<Link
							key={game.path}
							to={game.path}
							className="group relative block h-full"
						>
							<div className="absolute -inset-0.5 bg-gradient-to-r opacity-75 blur transition duration-500 group-hover:opacity-100 rounded-2xl"
								style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
							>
								<div className={`w-full h-full bg-gradient-to-r ${game.color} opacity-20`} />
							</div>

							<Card className="relative h-full bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 transition-all duration-300 hover:-translate-y-1">
								<CardHeader>
									<div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
										<Icon name={game.icon as any} className="w-6 h-6" />
									</div>
									<CardTitle className="text-2xl font-bold">{game.title}</CardTitle>
									<CardDescription className="text-base text-stone-600 dark:text-stone-400">
										{game.description}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{game.features.map((feature, index) => (
											<li key={index} className="flex items-center text-sm text-stone-500 dark:text-stone-500">
												<Icon name="check" className="w-4 h-4 mr-2 text-green-500" />
												{feature}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>

				<div className="mt-20 text-center">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-stone-900 shadow-sm border border-stone-200 dark:border-stone-800 text-sm text-stone-500 dark:text-stone-400">
						<Icon name="laptop" className="w-4 h-4" />
						<span>Press <kbd className="font-mono font-bold mx-1">Space</kbd> in games for random actions</span>
					</div>
				</div>
			</div>
		</div>
	)
}

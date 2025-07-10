import { Link } from '@remix-run/react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'

const games = [
	{
		title: 'ABC Learning',
		description: 'Learn letters and numbers with interactive display',
		path: '/abc',
		features: ['Letters A-Z', 'Numbers 0-9', 'Word building mode', 'Sound support'],
	},
	{
		title: 'Word Reading',
		description: 'Practice reading simple words with speech recognition',
		path: '/words',
		features: ['Simple words', 'Speech recognition', 'Different difficulty levels', 'Categories'],
	},
	{
		title: 'Colors',
		description: 'Learn colors with visual display and names',
		path: '/colors',
		features: ['140+ web colors', 'Color names', 'Full screen display', 'Smart text contrast'],
	},
]

export default function Index() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold mb-4">Zephyr Learning Games</h1>
				<p className="text-lg text-muted-foreground">
					Interactive educational games for young learners
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
				{games.map((game) => (
					<Link
						key={game.path}
						to={game.path}
						className="block transition-transform hover:scale-[1.02]"
					>
						<Card className="h-full hover:shadow-lg transition-shadow">
							<CardHeader>
								<CardTitle className="text-2xl">{game.title}</CardTitle>
								<CardDescription className="text-base">
									{game.description}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="list-disc list-inside space-y-1">
									{game.features.map((feature, index) => (
										<li key={index} className="text-sm text-muted-foreground">
											{feature}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			<div className="text-center mt-12">
				<p className="text-sm text-muted-foreground">
					Press the spacebar in games for random selection
				</p>
			</div>
		</div>
	)
}
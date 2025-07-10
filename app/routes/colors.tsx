import { useState, useEffect, useCallback } from 'react'
import { Button } from '#app/components/ui/button'
import { Checkbox } from '#app/components/ui/checkbox'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'

const colors = [
	// Reds
	{ name: 'Red', hex: '#FF0000' },
	{ name: 'Dark Red', hex: '#8B0000' },
	{ name: 'Fire Brick', hex: '#B22222' },
	{ name: 'Crimson', hex: '#DC143C' },
	{ name: 'Indian Red', hex: '#CD5C5C' },
	{ name: 'Light Coral', hex: '#F08080' },
	{ name: 'Salmon', hex: '#FA8072' },
	{ name: 'Dark Salmon', hex: '#E9967A' },
	{ name: 'Light Salmon', hex: '#FFA07A' },
	
	// Oranges
	{ name: 'Orange', hex: '#FFA500' },
	{ name: 'Dark Orange', hex: '#FF8C00' },
	{ name: 'Orange Red', hex: '#FF4500' },
	{ name: 'Tomato', hex: '#FF6347' },
	{ name: 'Coral', hex: '#FF7F50' },
	
	// Yellows
	{ name: 'Yellow', hex: '#FFFF00' },
	{ name: 'Gold', hex: '#FFD700' },
	{ name: 'Light Yellow', hex: '#FFFFE0' },
	{ name: 'Lemon Chiffon', hex: '#FFFACD' },
	{ name: 'Light Goldenrod Yellow', hex: '#FAFAD2' },
	{ name: 'Papaya Whip', hex: '#FFEFD5' },
	{ name: 'Moccasin', hex: '#FFE4B5' },
	{ name: 'Peach Puff', hex: '#FFDAB9' },
	{ name: 'Pale Goldenrod', hex: '#EEE8AA' },
	{ name: 'Khaki', hex: '#F0E68C' },
	{ name: 'Dark Khaki', hex: '#BDB76B' },
	
	// Greens
	{ name: 'Green', hex: '#008000' },
	{ name: 'Lime', hex: '#00FF00' },
	{ name: 'Dark Green', hex: '#006400' },
	{ name: 'Forest Green', hex: '#228B22' },
	{ name: 'Sea Green', hex: '#2E8B57' },
	{ name: 'Medium Sea Green', hex: '#3CB371' },
	{ name: 'Spring Green', hex: '#00FF7F' },
	{ name: 'Medium Spring Green', hex: '#00FA9A' },
	{ name: 'Light Green', hex: '#90EE90' },
	{ name: 'Pale Green', hex: '#98FB98' },
	{ name: 'Dark Sea Green', hex: '#8FBC8F' },
	{ name: 'Lime Green', hex: '#32CD32' },
	{ name: 'Lawn Green', hex: '#7CFC00' },
	{ name: 'Chartreuse', hex: '#7FFF00' },
	{ name: 'Green Yellow', hex: '#ADFF2F' },
	{ name: 'Yellow Green', hex: '#9ACD32' },
	{ name: 'Olive', hex: '#808000' },
	{ name: 'Olive Drab', hex: '#6B8E23' },
	
	// Blues
	{ name: 'Blue', hex: '#0000FF' },
	{ name: 'Navy', hex: '#000080' },
	{ name: 'Dark Blue', hex: '#00008B' },
	{ name: 'Medium Blue', hex: '#0000CD' },
	{ name: 'Midnight Blue', hex: '#191970' },
	{ name: 'Royal Blue', hex: '#4169E1' },
	{ name: 'Dodger Blue', hex: '#1E90FF' },
	{ name: 'Deep Sky Blue', hex: '#00BFFF' },
	{ name: 'Sky Blue', hex: '#87CEEB' },
	{ name: 'Light Sky Blue', hex: '#87CEFA' },
	{ name: 'Light Blue', hex: '#ADD8E6' },
	{ name: 'Powder Blue', hex: '#B0E0E6' },
	{ name: 'Cyan', hex: '#00FFFF' },
	{ name: 'Aqua', hex: '#00FFFF' },
	{ name: 'Dark Cyan', hex: '#008B8B' },
	{ name: 'Teal', hex: '#008080' },
	{ name: 'Dark Turquoise', hex: '#00CED1' },
	{ name: 'Medium Turquoise', hex: '#48D1CC' },
	{ name: 'Turquoise', hex: '#40E0D0' },
	{ name: 'Aquamarine', hex: '#7FFFD4' },
	{ name: 'Medium Aquamarine', hex: '#66CDAA' },
	{ name: 'Cadet Blue', hex: '#5F9EA0' },
	{ name: 'Steel Blue', hex: '#4682B4' },
	{ name: 'Light Steel Blue', hex: '#B0C4DE' },
	{ name: 'Light Cyan', hex: '#E0FFFF' },
	{ name: 'Pale Turquoise', hex: '#AFEEEE' },
	{ name: 'Alice Blue', hex: '#F0F8FF' },
	{ name: 'Azure', hex: '#F0FFFF' },
	
	// Purples
	{ name: 'Purple', hex: '#800080' },
	{ name: 'Indigo', hex: '#4B0082' },
	{ name: 'Dark Violet', hex: '#9400D3' },
	{ name: 'Dark Orchid', hex: '#9932CC' },
	{ name: 'Dark Magenta', hex: '#8B008B' },
	{ name: 'Magenta', hex: '#FF00FF' },
	{ name: 'Fuchsia', hex: '#FF00FF' },
	{ name: 'Violet', hex: '#EE82EE' },
	{ name: 'Plum', hex: '#DDA0DD' },
	{ name: 'Orchid', hex: '#DA70D6' },
	{ name: 'Medium Orchid', hex: '#BA55D3' },
	{ name: 'Blue Violet', hex: '#8A2BE2' },
	{ name: 'Medium Purple', hex: '#9370DB' },
	{ name: 'Slate Blue', hex: '#6A5ACD' },
	{ name: 'Medium Slate Blue', hex: '#7B68EE' },
	{ name: 'Rebecca Purple', hex: '#663399' },
	{ name: 'Thistle', hex: '#D8BFD8' },
	{ name: 'Lavender', hex: '#E6E6FA' },
	
	// Pinks
	{ name: 'Pink', hex: '#FFC0CB' },
	{ name: 'Light Pink', hex: '#FFB6C1' },
	{ name: 'Hot Pink', hex: '#FF69B4' },
	{ name: 'Deep Pink', hex: '#FF1493' },
	{ name: 'Pale Violet Red', hex: '#DB7093' },
	{ name: 'Medium Violet Red', hex: '#C71585' },
	
	// Browns
	{ name: 'Brown', hex: '#A52A2A' },
	{ name: 'Saddle Brown', hex: '#8B4513' },
	{ name: 'Sienna', hex: '#A0522D' },
	{ name: 'Chocolate', hex: '#D2691E' },
	{ name: 'Peru', hex: '#CD853F' },
	{ name: 'Sandy Brown', hex: '#F4A460' },
	{ name: 'Burly Wood', hex: '#DEB887' },
	{ name: 'Tan', hex: '#D2B48C' },
	{ name: 'Rosy Brown', hex: '#BC8F8F' },
	{ name: 'Goldenrod', hex: '#DAA520' },
	{ name: 'Dark Goldenrod', hex: '#B8860B' },
	{ name: 'Beige', hex: '#F5F5DC' },
	{ name: 'Wheat', hex: '#F5DEB3' },
	{ name: 'Bisque', hex: '#FFE4C4' },
	{ name: 'Blanched Almond', hex: '#FFEBCD' },
	{ name: 'Cornsilk', hex: '#FFF8DC' },
	{ name: 'Maroon', hex: '#800000' },
	
	// Grays
	{ name: 'Black', hex: '#000000' },
	{ name: 'White', hex: '#FFFFFF' },
	{ name: 'Gray', hex: '#808080' },
	{ name: 'Dark Gray', hex: '#A9A9A9' },
	{ name: 'Dim Gray', hex: '#696969' },
	{ name: 'Light Gray', hex: '#D3D3D3' },
	{ name: 'Gainsboro', hex: '#DCDCDC' },
	{ name: 'White Smoke', hex: '#F5F5F5' },
	{ name: 'Silver', hex: '#C0C0C0' },
	{ name: 'Dark Slate Gray', hex: '#2F4F4F' },
	{ name: 'Light Slate Gray', hex: '#778899' },
	{ name: 'Slate Gray', hex: '#708090' },
	
	// Off-whites
	{ name: 'Snow', hex: '#FFFAFA' },
	{ name: 'Honeydew', hex: '#F0FFF0' },
	{ name: 'Mint Cream', hex: '#F5FFFA' },
	{ name: 'Ivory', hex: '#FFFFF0' },
	{ name: 'Floral White', hex: '#FFFAF0' },
	{ name: 'Ghost White', hex: '#F8F8FF' },
	{ name: 'Antique White', hex: '#FAEBD7' },
	{ name: 'Linen', hex: '#FAF0E6' },
	{ name: 'Old Lace', hex: '#FDF5E6' },
	{ name: 'Seashell', hex: '#FFF5EE' },
	{ name: 'Lavender Blush', hex: '#FFF0F5' },
	{ name: 'Misty Rose', hex: '#FFE4E1' },
	{ name: 'Navajowhite', hex: '#FFDEAD' },
]

type Options = {
	showColorName: boolean
}

// Calculate luminance to determine if text should be light or dark
function getLuminance(hex: string): number {
	const rgb = parseInt(hex.slice(1), 16)
	const r = (rgb >> 16) & 0xff
	const g = (rgb >> 8) & 0xff
	const b = (rgb >> 0) & 0xff
	
	// Calculate relative luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
	return luminance
}

export default function Colors() {
	const [options, setOptions] = useState<Options>({
		showColorName: true,
	})
	const [currentColor, setCurrentColor] = useState<typeof colors[0] | null>(null)
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

	const showRandomColor = useCallback(() => {
		if (isModalOpen) return
		const randomColor = colors[Math.floor(Math.random() * colors.length)]
		setCurrentColor(randomColor || null)
	}, [isModalOpen])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedOptions = localStorage.getItem('colorOptions')
			if (savedOptions) {
				setOptions(JSON.parse(savedOptions) as Options)
			}
		}
	}, [])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('colorOptions', JSON.stringify(options))
		}
	}, [options])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Escape' && isModalOpen) {
				setIsModalOpen(false)
				return
			}
			if (isModalOpen) return
			if (event.key === ' ') {
				event.preventDefault()
				showRandomColor()
			}
		},
		[showRandomColor, isModalOpen],
	)

	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeyDown)
			return () => window.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleKeyDown])

	const toggleModal = () => setIsModalOpen((prev) => !prev)

	return (
		<div 
			className="relative box-border h-full touch-manipulation select-none transition-colors duration-300"
			style={{ backgroundColor: currentColor?.hex || '#FFFFFF' }}
		>
			<Button
				onClick={toggleModal}
				className="absolute right-5 top-5 z-10 px-4 py-2 text-lg"
			>
				Options
			</Button>

			{isModalOpen && (
				<div
					onClick={toggleModal}
					className="fixed inset-0 z-20 flex items-center justify-center bg-black/50"
				>
					<Card
						onClick={(e) => e.stopPropagation()}
						className="max-h-[90vh] max-w-md overflow-y-auto"
					>
						<CardHeader className="flex items-center justify-between">
							<CardTitle>Options</CardTitle>
							<Button onClick={toggleModal} variant="ghost">
								Close
							</Button>
						</CardHeader>
						<CardContent>
							<label className="flex items-center space-x-2">
								<Checkbox
									checked={options.showColorName}
									onCheckedChange={(checked) =>
										setOptions((prev) => ({
											...prev,
											showColorName: checked as boolean,
										}))
									}
								/>
								<span>Show color name</span>
							</label>
						</CardContent>
					</Card>
				</div>
			)}
			
			<div
				onClick={showRandomColor}
				className="flex h-full items-center justify-center"
			>
				{currentColor && options.showColorName && (
					<div 
						className="text-8xl font-bold"
						style={{
							color: getLuminance(currentColor.hex) < 0.5 ? '#FFFFFF' : '#000000',
							textShadow: getLuminance(currentColor.hex) < 0.5
								? '2px 2px 8px rgba(0,0,0,0.5)'
								: '2px 2px 8px rgba(255,255,255,0.5)',
						}}
					>
						{currentColor.name}
					</div>
				)}
				{!currentColor && (
					<div className="text-4xl font-medium text-gray-600">
						Press space or click to see a color
					</div>
				)}
			</div>
		</div>
	)
}
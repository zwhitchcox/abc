// fetch is globally available in Node 18+ and Remix
export async function findCoverImage(query: string): Promise<{ contentType: string, blob: Buffer } | null> {
	try {
		const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1`
		const response = await fetch(searchUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			}
		})
		const html = await response.text()

		// Extract image URL from Bing's "murl" (Media URL) in the HTML
		// Bing stores image metadata in m="{...}" attributes
		const match = html.match(/m="{[^"]*?murl":"([^"]+?)"/)

		if (match && match[1]) {
			const imageUrl = match[1]
			console.log(`Found image for "${query}": ${imageUrl}`)

			const imageResponse = await fetch(imageUrl)
			if (!imageResponse.ok) throw new Error(`Failed to download image: ${imageResponse.statusText}`)

			const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
			const arrayBuffer = await imageResponse.arrayBuffer()
			const blob = Buffer.from(arrayBuffer)

			return { contentType, blob }
		}

		console.log(`No image found for "${query}"`)
		return null
	} catch (error) {
		console.error('Error searching/downloading cover image:', error)
		return null
	}
}


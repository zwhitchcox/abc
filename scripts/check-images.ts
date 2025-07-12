import fs from 'fs'
import path from 'path'

interface Topic {
  name: string
  items: string[]
}

interface Config {
  topics: Topic[]
  imagesPerItem?: number
}

function checkImages() {
  // Read configuration
  const configPath = path.join(process.cwd(), 'scripts', 'image-config.json')
  if (!fs.existsSync(configPath)) {
    console.error('Configuration file not found: scripts/image-config.json')
    process.exit(1)
  }
  
  const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  const config: Config = configData as Config
  const imagesPerItem = config.imagesPerItem || 3
  const imagesBaseDir = path.join(process.cwd(), 'images')
  
  let totalNeeded = 0
  let totalDownloaded = 0
  
  console.log('📸 Image Download Status')
  console.log('========================\n')
  
  for (const topic of config.topics) {
    const topicDir = path.join(imagesBaseDir, topic.name.toLowerCase().replace(/\s+/g, '-'))
    
    console.log(`📁 ${topic.name}`)
    
    if (!fs.existsSync(topicDir)) {
      console.log('  ❌ Directory not created yet')
      totalNeeded += topic.items.length * imagesPerItem
      continue
    }
    
    let topicComplete = 0
    let topicMissing = 0
    
    for (const item of topic.items) {
      const itemDir = path.join(topicDir, item.toLowerCase().replace(/\s+/g, '-'))
      
      if (!fs.existsSync(itemDir)) {
        console.log(`  ⚠️  ${item}: No images (need ${imagesPerItem})`)
        topicMissing += imagesPerItem
      } else {
        const images = fs.readdirSync(itemDir)
          .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        
        if (images.length >= imagesPerItem) {
          topicComplete += images.length
        } else {
          const needed = imagesPerItem - images.length
          console.log(`  ⚠️  ${item}: ${images.length}/${imagesPerItem} images (need ${needed} more)`)
          topicComplete += images.length
          topicMissing += needed
        }
      }
    }
    
    totalDownloaded += topicComplete
    totalNeeded += topicComplete + topicMissing
    
    console.log(`  ✅ Complete: ${topicComplete} images`)
    console.log(`  ❌ Missing: ${topicMissing} images`)
    console.log('')
  }
  
  console.log('📊 Overall Summary')
  console.log('==================')
  console.log(`Total images needed: ${totalNeeded}`)
  console.log(`Total downloaded: ${totalDownloaded}`)
  console.log(`Total missing: ${totalNeeded - totalDownloaded}`)
  console.log(`Progress: ${Math.round((totalDownloaded / totalNeeded) * 100)}%`)
  
  if (totalDownloaded < totalNeeded) {
    console.log('\n💡 Run ./scripts/download-images.sh to download missing images')
  } else {
    console.log('\n✅ All images downloaded!')
  }
}

// Run the check
checkImages()
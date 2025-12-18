import { PrismaClient } from '@prisma/client'
import fs from 'fs-extra'
import path from 'path'

const prisma = new PrismaClient()

async function seed() {
    const configPath = path.join(process.cwd(), 'scripts', 'image-config.json')
    if (!fs.existsSync(configPath)) {
        console.log('No image-config.json found, skipping seed')
        return
    }

    const config = await fs.readJSON(configPath)

    for (const topic of config.topics) {
        console.log(`Seeding topic: ${topic.name}`)
        const createdTopic = await prisma.flashcardTopic.upsert({
            where: { name: topic.name },
            update: {},
            create: {
                name: topic.name,
                slug: topic.name.toLowerCase().replace(/\s+/g, '-')
            }
        })

        for (const item of topic.items) {
            await prisma.flashcardItem.upsert({
                where: {
                    topicId_slug: {
                        topicId: createdTopic.id,
                        slug: item.toLowerCase().replace(/\s+/g, '-')
                    }
                },
                update: {},
                create: {
                    name: item,
                    slug: item.toLowerCase().replace(/\s+/g, '-'),
                    topicId: createdTopic.id
                }
            })
        }
    }
    console.log('Seeding complete')
}

seed()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })






import { createRouter } from 'remix/fetch-router'
import { asyncContext } from 'remix/async-context-middleware'
import { logger } from 'remix/logger-middleware'
import fs from 'node:fs/promises'
import path from 'node:path'

import { assets } from './assets.ts'
import { auth } from './controllers/auth.tsx'
import { home } from './controllers/home.tsx'
import storyApp, { logoutAction } from './controllers/story-app/controller.tsx'
import { loadAuth } from './middleware/auth.ts'
import { routes } from './routes.ts'

const middleware = []

if (process.env.NODE_ENV === 'development') {
  middleware.push(logger())
}

middleware.push(asyncContext())
middleware.push(loadAuth())

export const router = createRouter({ middleware })

router.get(routes.assets, async ({ request }) => {
  let response = await assets.fetch(request)
  return response ?? new Response('Not Found', { status: 404 })
})

async function stylePreviewResponse(request: Request) {
  let requestedPath = decodeURIComponent(new URL(request.url).pathname.replace(/^\/style-previews\//, ''))
  if (!/^[a-z-]+\.png$/.test(requestedPath)) {
    return new Response('Not Found', { status: 404 })
  }

  try {
    let file = await fs.readFile(path.join(process.cwd(), 'app', 'assets', 'style-previews', requestedPath))
    return new Response(new Uint8Array(file), {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'image/png',
      },
    })
  } catch {
    return new Response('Not Found', { status: 404 })
  }
}

router.get(routes.stylePreviewCozyWatercolor, ({ request }) => stylePreviewResponse(request))
router.get(routes.stylePreviewBrightCartoon, ({ request }) => stylePreviewResponse(request))
router.get(routes.stylePreviewColoredPencil, ({ request }) => stylePreviewResponse(request))
router.get(routes.stylePreviewPaperCutout, ({ request }) => stylePreviewResponse(request))

router.map(routes.home, home)
router.map(routes.auth, auth)
router.map(routes.storyApp, storyApp)
router.post(routes.logout, logoutAction)

import type { Controller } from 'remix/fetch-router'
import { redirect } from 'remix/response/redirect'

import { findOrCreateAccount } from '../data/story-store.server.ts'
import { parentAuthCookie } from '../middleware/auth.ts'
import type { routes } from '../routes.ts'
import { Layout } from '../ui/layout.tsx'
import { render } from '../utils/render.tsx'

export const auth = {
  actions: {
    index({ request }) {
      return render(
        <Layout title="Sign in">
          <section className="card" style="max-width: 520px; margin: 0 auto;">
            <h1>Sign in</h1>
            <p className="muted">
              Use an email address to create a parent workspace. This is the auth seam for the
              commercial app; production can replace it with OAuth or email verification without
              changing the story routes.
            </p>
            <form method="POST" action="/auth" className="stack">
              <label className="field">
                Parent email
                <input name="email" type="email" required placeholder="parent@example.com" />
              </label>
              <button className="button primary" type="submit">
                Continue
              </button>
            </form>
          </section>
        </Layout>,
        request,
      )
    },
    async action({ request }) {
      let formData = await request.formData()
      let email = String(formData.get('email') ?? '').trim().toLowerCase()
      if (!email.includes('@')) {
        return render(
          <Layout title="Sign in">
            <section className="card" style="max-width: 520px; margin: 0 auto;">
              <h1>Sign in</h1>
              <p className="muted">Enter a valid email address.</p>
              <form method="POST" action="/auth" className="stack">
                <label className="field">
                  Parent email
                  <input name="email" type="email" required defaultValue={email} />
                </label>
                <button className="button primary" type="submit">
                  Continue
                </button>
              </form>
            </section>
          </Layout>,
          request,
          { status: 400 },
        )
      }
      let account = await findOrCreateAccount({ email })
      return redirect('/story-app', {
        headers: {
          'Set-Cookie': await parentAuthCookie.serialize(account.id),
        },
      })
    },
  },
} satisfies Controller<typeof routes.auth>

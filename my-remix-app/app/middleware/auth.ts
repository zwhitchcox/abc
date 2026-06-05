import { getContext } from 'remix/async-context-middleware'
import { Auth, auth, requireAuth as requireAuthenticated } from 'remix/auth-middleware'
import type { AuthScheme, AuthState } from 'remix/auth-middleware'
import { createCookie } from 'remix/cookie'
import { redirect } from 'remix/response/redirect'

import { findOrCreateAccount } from '../data/story-store.server.ts'
import { routes } from '../routes.ts'

export type ParentIdentity = {
  accountId: string
  email: string
}

export const parentAuthCookie = createCookie('story_app_session', {
  httpOnly: true,
  sameSite: 'Lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
})

const authCookieScheme: AuthScheme<ParentIdentity> = {
  name: 'story-app-cookie',
  async authenticate(context) {
    let accountId = await parentAuthCookie.parse(context.headers.get('cookie'))
    if (typeof accountId !== 'string' || !accountId) return
    let account = await findOrCreateAccount({ id: accountId })
    return {
      status: 'success',
      identity: { accountId: account.id, email: account.email },
    }
  },
}

export function loadAuth() {
  return auth({ schemes: [authCookieScheme] })
}

export function getParentIdentity() {
  let authState = getContext().get(Auth) as AuthState<ParentIdentity>
  return authState.ok ? authState.identity : null
}

export function requireParentIdentity() {
  let identity = getParentIdentity()
  if (!identity) throw redirect(routes.auth.index.href())
  return identity
}

export const requireAuth = requireAuthenticated<ParentIdentity>({
  onFailure() {
    return redirect(routes.auth.index.href())
  },
})

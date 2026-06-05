import type { RemixNode } from 'remix/ui'

import { routes } from '../routes.ts'
import { Document } from './document.tsx'

export interface LayoutProps {
  children?: RemixNode
  title?: string
  active?: 'dashboard' | 'words' | 'series' | 'library' | 'new' | 'billing'
  accountEmail?: string
  usage?: {
    usedCents: number
    availableCents: number
    includedCents: number
    status: string
  }
}

function credits(cents: number) {
  let amount = Math.max(0, Math.round(cents))
  return `${amount.toLocaleString()} credit${amount === 1 ? '' : 's'}`
}

export function Layout() {
  return ({ title, active, accountEmail, usage, children }: LayoutProps) => (
    <Document title={title}>
      <div className="shell">
        <header className="topbar">
          <div className="topbar-inner">
            <div>
              <a href={routes.storyApp.index.href()} className="brand">
                Story App
              </a>
              <div className="muted">Parent-guided books from known words.</div>
            </div>
            <nav className="nav">
              <a
                className={active === 'dashboard' ? 'active' : ''}
                href={routes.storyApp.index.href()}
              >
                Dashboard
              </a>
              <a
                className={active === 'words' ? 'active' : ''}
                href={routes.storyApp.words.index.href()}
              >
                Words
              </a>
              <a
                className={active === 'series' ? 'active' : ''}
                href={routes.storyApp.series.index.href()}
              >
                Series
              </a>
              <a
                className={active === 'library' ? 'active' : ''}
                href={routes.storyApp.library.index.href()}
              >
                Library
              </a>
              <a
                className={active === 'new' ? 'active' : ''}
                href={routes.storyApp.newStory.index.href()}
              >
                New story
              </a>
              <a
                className={active === 'billing' ? 'active' : ''}
                href={routes.storyApp.billing.index.href()}
              >
                Billing
              </a>
              {accountEmail ? (
                <form method="POST" action={routes.logout.href()}>
                  <button type="submit">Logout</button>
                </form>
              ) : (
                <a href={routes.auth.index.href()}>Login</a>
              )}
            </nav>
          </div>
          {usage ? (
            <div className="metric-row">
              <span>Account: {accountEmail}</span>
              <span>Subscription: {usage.status}</span>
              <span>Used: {credits(usage.usedCents)}</span>
              <span>Available: {credits(usage.availableCents)}</span>
              <span>Included: {credits(usage.includedCents)}</span>
            </div>
          ) : null}
        </header>
        <main className="content">{children}</main>
      </div>
    </Document>
  )
}

import type { RemixNode } from 'remix/ui'

import { routes } from '../routes.ts'

export interface DocumentProps {
  children?: RemixNode
  title?: string
}

const DEFAULT_TITLE = 'Story App'

export function Document() {
  return ({ title = DEFAULT_TITLE, children }: DocumentProps) => (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <title>{title}</title>
        <style>{GLOBAL_CSS}</style>
      </head>
      <body>
        {children}
        <script type="module" src={routes.assets.href({ path: 'app/assets/entry.ts' })}></script>
      </body>
    </html>
  )
}

const GLOBAL_CSS = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    color: #0f172a;
    background: #f8fafc;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  a { color: inherit; }
  input, textarea, select, button {
    font: inherit;
  }
  .shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .topbar {
    border-bottom: 1px solid #e2e8f0;
    background: #ffffff;
  }
  .topbar-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  .brand {
    font-size: 20px;
    font-weight: 800;
    text-decoration: none;
  }
  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .nav a, .nav button, .button {
    border: 0;
    border-radius: 8px;
    padding: 9px 12px;
    background: #e2e8f0;
    color: #334155;
    text-decoration: none;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }
  .nav a.active, .button.primary {
    background: #0f172a;
    color: white;
  }
  .content {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    padding: 28px 24px 56px;
  }
  .grid {
    display: grid;
    gap: 20px;
  }
  .grid.two {
    grid-template-columns: minmax(0, 1fr) 320px;
  }
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    padding: 22px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  }
  .muted { color: #64748b; }
  .metric-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 10px 24px;
    border-top: 1px solid #e2e8f0;
    background: #f1f5f9;
    color: #475569;
    font-size: 14px;
  }
  .field {
    display: grid;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
  }
  .field input, .field textarea, .field select {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px 12px;
    font-weight: 400;
    background: white;
  }
  .stack { display: grid; gap: 14px; }
  .list { display: grid; gap: 10px; }
  .list-item {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 14px;
    border-radius: 8px;
    background: #f8fafc;
    text-decoration: none;
  }
  .toolbar {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }
  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .chat-card {
    display: grid;
    gap: 16px;
  }
  .chat-thread {
    display: grid;
    gap: 10px;
    max-height: 420px;
    overflow: auto;
    padding: 4px;
  }
  .chat-message {
    display: flex;
  }
  .chat-message span {
    max-width: 78%;
    border-radius: 8px;
    padding: 11px 13px;
    line-height: 1.45;
    font-size: 14px;
  }
  .chat-message.assistant {
    justify-content: flex-start;
  }
  .chat-message.assistant span {
    background: #eef2ff;
    color: #1e1b4b;
  }
  .chat-message.user {
    justify-content: flex-end;
  }
  .chat-message.user span {
    background: #0f172a;
    color: #ffffff;
  }
  .chat-box {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 10px;
    align-items: end;
  }
  .chat-box textarea {
    width: 100%;
    min-height: 84px;
    resize: vertical;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px 12px;
    background: #ffffff;
  }
  .dictation-controls {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    justify-self: start;
    min-height: 42px;
  }
  .dictation-button {
    display: inline-grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 999px;
    background: #0f172a;
    color: #ffffff;
    cursor: pointer;
  }
  .dictation-button svg {
    width: 21px;
    height: 21px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .dictation-button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
  .dictation-button.listening {
    background: #be123c;
  }
  .dictation-button.transcribing {
    background: #0f172a;
    opacity: 1;
  }
  .dictation-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.34);
    border-top-color: #ffffff;
    border-radius: 999px;
    animation: spin 760ms linear infinite;
  }
  .dictation-waveform {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 104px;
    height: 42px;
    padding: 0 10px;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    background: #ffffff;
  }
  .dictation-waveform[hidden] {
    display: none;
  }
  .dictation-waveform span {
    width: 3px;
    height: 24px;
    border-radius: 999px;
    background: #0f172a;
    transform-origin: center;
    transition: transform 80ms linear;
  }
  .dictation-waveform.active span {
    background: #be123c;
  }
  .dictation-status {
    max-width: 180px;
    color: #be123c;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.25;
  }
  .style-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 12px;
  }
  .style-option {
    display: grid;
    gap: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px;
    background: #ffffff;
  }
  .style-preview {
    min-height: 82px;
    border-radius: 8px;
    border: 1px solid rgba(15, 23, 42, 0.12);
  }
  .art-style-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .art-style-carousel {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: x mandatory;
    scrollbar-color: #94a3b8 #e2e8f0;
    padding: 4px 84px 16px 4px;
    margin: 0 -4px;
  }
  .art-style-carousel .art-style-choice {
    flex: 0 0 clamp(380px, 54%, 640px);
    min-width: 0;
    scroll-snap-align: start;
  }
  .art-style-carousel .art-style-card {
    padding: 14px;
    padding-top: 42px;
  }
  .art-style-carousel .art-style-image {
    aspect-ratio: 3 / 2;
  }
  .art-style-carousel strong {
    font-size: 20px;
  }
  .art-style-card {
    display: grid;
    gap: 10px;
    align-content: start;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px;
    background: #ffffff;
  }
  .art-style-card p {
    margin: 4px 0 0;
    font-size: 14px;
  }
  .art-style-image {
    width: 100%;
    aspect-ratio: 5 / 3;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: #f8fafc;
  }
  .art-style-choice {
    position: relative;
    display: grid;
    cursor: pointer;
  }
  .art-style-choice input {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 1;
    width: 18px;
    height: 18px;
    accent-color: #0f172a;
  }
  .art-style-choice .art-style-card {
    height: 100%;
    padding-top: 38px;
    transition: border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
  }
  .art-style-carousel .art-style-choice .art-style-card {
    padding: 14px;
    padding-top: 42px;
  }
  .art-style-choice:hover .art-style-card,
  .art-style-choice:focus-within .art-style-card {
    border-color: #94a3b8;
  }
  .art-style-choice:has(input:checked) .art-style-card {
    border-color: #0f172a;
    box-shadow: 0 0 0 2px #0f172a;
  }
  .style-selection-card {
    display: grid;
    gap: 18px;
  }
  .description-editor {
    border-top: 1px solid #e2e8f0;
    padding-top: 16px;
  }
  .description-editor > summary {
    cursor: pointer;
    font-weight: 800;
  }
  .description-editor form {
    margin-top: 14px;
  }
  .generation-loading {
    display: grid;
    gap: 18px;
    max-width: 760px;
  }
  .loading-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .spinner {
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    border-radius: 999px;
    border: 4px solid #cbd5e1;
    border-top-color: #0f172a;
    animation: spin 860ms linear infinite;
  }
  .status-card.warning {
    border-color: #f59e0b;
    background: #fffbeb;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .check-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
  }
  .check-card {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
    font-weight: 600;
  }
  .ai-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 170px;
    gap: 16px;
    align-items: end;
    padding: 16px;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    background: #f0f9ff;
  }
  .grid.two-wide {
    grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
    align-items: start;
  }
  .disclosure {
    display: grid;
    gap: 16px;
  }
  .disclosure > summary {
    cursor: pointer;
    font-size: 18px;
    font-weight: 800;
  }
  .disclosure > summary::marker {
    color: #2563eb;
  }
  .character-grid {
    display: grid;
    gap: 12px;
  }
  .character-panel {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
    overflow: hidden;
  }
  .character-panel > summary {
    cursor: pointer;
    list-style-position: outside;
    padding: 12px 14px;
  }
  .character-detail {
    display: grid;
    grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
    gap: 16px;
    padding: 0 14px 14px 36px;
  }
  .character-preview {
    display: grid;
    grid-template-columns: 84px minmax(0, 1fr);
    gap: 14px;
    align-items: center;
  }
  .character-image,
  .character-avatar {
    width: 84px;
    aspect-ratio: 1;
    border-radius: 8px;
    border: 1px solid rgba(15, 23, 42, 0.14);
    overflow: hidden;
  }
  .character-image {
    object-fit: cover;
    background: #f8fafc;
  }
  .character-large-image {
    width: 100%;
    max-width: 260px;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid rgba(15, 23, 42, 0.14);
    background: #f8fafc;
  }
  .character-avatar {
    display: grid;
    place-items: center;
    color: #ffffff;
    font-size: 26px;
    font-weight: 900;
    text-shadow: 0 1px 2px rgba(15, 23, 42, 0.28);
  }
  .character-copy {
    min-width: 0;
    display: grid;
    gap: 4px;
    font-size: 14px;
  }
  .pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
  .pill {
    border-radius: 999px;
    padding: 3px 8px;
    background: #e0f2fe;
    color: #075985;
    font-size: 12px;
    font-weight: 800;
  }
  .page-editor {
    display: grid;
    gap: 10px;
    padding: 14px;
    border-radius: 8px;
    background: #f8fafc;
  }
  .page-editor textarea {
    min-height: 82px;
  }
  .status {
    display: inline-flex;
    border-radius: 999px;
    padding: 3px 9px;
    background: #dcfce7;
    color: #166534;
    font-size: 12px;
    font-weight: 800;
  }
  @media (max-width: 760px) {
    .topbar-inner { align-items: flex-start; flex-direction: column; }
    .grid.two { grid-template-columns: 1fr; }
    .grid.two-wide { grid-template-columns: 1fr; }
    .art-style-carousel { padding-right: 54px; }
    .art-style-carousel .art-style-choice { flex-basis: 82%; }
    .chat-box { grid-template-columns: 1fr; }
    .chat-message span { max-width: 92%; }
    .ai-panel { grid-template-columns: 1fr; }
    .character-detail { grid-template-columns: 1fr; padding-left: 14px; }
    .character-preview { grid-template-columns: 64px minmax(0, 1fr); }
    .character-image, .character-avatar { width: 64px; }
    .content { padding: 20px 16px 44px; }
  }
`

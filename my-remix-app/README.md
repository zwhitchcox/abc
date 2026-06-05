# Story App

A Remix 3 beta project for a subscription story-generation product. Parents can chat to create story series, refine reusable characters, pick style presets with previews, manage child word lists, edit drafts, and track generation budget before server-side image/text workers spend API cost.

## App Shape

- `app/controllers/auth.tsx` owns parent email sign-in.
- `app/controllers/story-app/controller.tsx` owns dashboard, word lists, chat-first series creation/editing, library, draft stories, editable story detail, billing placeholder, and logout.
- `app/controllers/story-app/series-chat.server.ts` maps series chat messages to local tool calls.
- `app/data/story-store.server.ts` is the file-backed data layer for styles, characters, series, stories, usage, and words.
- `app/middleware/auth.ts` owns cookie auth and request identity.
- `app/routes.ts` defines the route contract.
- `app/router.ts` wires routes to handlers.
- `app/ui/` holds the shared document and layout wrappers.

## Configuration

- `PORT` defaults to `6969`.
- `STORY_APP_MONTHLY_PRICE_CENTS` defaults to `2000`.
- `STORY_APP_INCLUDED_COST_CENTS` defaults to `1000`.
- `STORY_APP_IMAGE_COST_CENTS` defaults to `12`.
- `STORY_APP_TEXT_COST_CENTS` defaults to `10`.
- `OPENAI_API_KEY` enables AI-assisted character drafting and character preview generation.
- `OPENAI_CHARACTER_TEXT_MODEL` defaults to `gpt-5.5`.
- `OPENAI_CHARACTER_IMAGE_MODEL` defaults to `gpt-image-2`.
- `OPENAI_CHARACTER_IMAGE_SIZE` is optional and is passed through when set.

Stripe and OpenAI generation are intentionally represented as server-side integration points in this scaffold. Add real credentials only through environment variables or a secrets manager.

## Commands

```sh
pnpm install
pnpm run start
pnpm test
pnpm run typecheck
```

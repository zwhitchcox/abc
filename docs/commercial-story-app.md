# Commercial Story App Scaffold

This repo now has a contained Remix route namespace at `/story-app` for a
subscription product where parents manage child word lists and create generated
picture-book drafts.

## Product Rules

- Monthly price default: `$20`.
- Included generation budget default: `$10` estimated provider cost.
- Remaining planned margin default: `$10`.
- Extra usage should be sold as credits before generation can continue.

The defaults are env-configurable:

- `STORY_APP_MONTHLY_PRICE_CENTS`
- `STORY_APP_INCLUDED_COST_CENTS`
- `STORY_APP_IMAGE_COST_CENTS`
- `STORY_APP_TEXT_COST_CENTS`

## Remix Shape

- `/story-app` uses an authenticated route layout loader for account usage.
- `/story-app/words` manages child profiles and known words with Remix actions.
- `/story-app/new` creates a draft story and reserves estimated generation cost.
- `/story-app/stories/:storyId` shows the draft pages and image prompts.
- `/story-app/billing` creates a Stripe Checkout session once Stripe env is set.
- `/resources/stripe.story-app.webhook` is the Stripe webhook seam.

## Server Boundaries

OpenAI and Stripe must remain server-only. Browser actions create drafts and
submit forms to Remix actions; generation workers should call OpenAI from server
utilities after quota checks.

## Next Implementation Steps

1. Add Stripe signature verification and subscription status updates.
2. Add extra-credit checkout and ledger writes.
3. Add a background job table/worker for image generation.
4. Store generated images in S3/R2 or another durable file store.
5. Add a read-only published story viewer for generated books.

# trackerjam-web

## Local Development


### Supabase
You can use Supabase local tools or set up your own Postgres database

[Pre-requisites & configuration](https://supabase.com/docs/guides/cli/local-development) (setup once)

Start Supabase locally:
```
cd <project-dir>
supabase start
```

Stop or restart:
```
supabase stop
```

### Stripe Debugging

Configure once:
1. Install stripe cli via `brew install stripe/stripe-cli/stripe`
2. Run `stripe login` and follow the instructions

Everyday usage:
1. Run `stripe listen --forward-to localhost:3000/api/stripe/webhook` to forward events to your local server
2. Make sure to copy the webhook signing secret from the CLI command into your `.env` file as `STRIPE_WEBHOOK_SECRET`
3. Run `stripe trigger customer.subscription.created` to trigger a test event
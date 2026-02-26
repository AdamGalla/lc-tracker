# LeetCode Progress Tracker

A simple UI for tracking LeetCode progress with your friends.

## Stack

- React + TypeScript + Vite
- LeetCode GraphQL API

## Note

The GraphQL queries used to fetch data from LeetCode were adapted from [alfa-leetcode-api](https://github.com/alfaarghya/alfa-leetcode-api).

## Usage

Add your LeetCode usernames to track the progress.

## Self-Hosting

You can fork this repo and deploy your own instance for free using [Vercel](https://vercel.com).

1. [Fork this repository](https://github.com/AdamGalla/lc-tracker/fork)
2. Import the forked repo in the [Vercel dashboard](https://vercel.com/new)
3. Add the `ALLOWED_ORIGINS` environment variable in your Vercel project settings (see below)
4. Deploy — Vercel will automatically detect the Vite frontend and the `api/` serverless function

The `api/leetcode.ts` function uses `@vercel/node` and is designed to work out of the box with Vercel's serverless functions. It handles the LeetCode GraphQL requests server-side to avoid CORS issues in the browser.

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins for CORS | `https://your-deployment.vercel.app` |

If `ALLOWED_ORIGINS` is not set, the API will default to allowing `http://localhost:3000` and `http://localhost:8080` (for local development).

### Other Providers

The API function is **Vercel-specific** and uses `@vercel/node` types. Deploying to other providers (e.g. Netlify, Cloudflare Pages) would require adapting the handler to their respective serverless function formats.

## Responsiveness

Not optimized for mobile.

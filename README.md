# nextjs-base

A starter project with **Next.js**, **Tailwind CSS** and **shadcn/ui** already set up.
Every shadcn/ui component is already in `components/ui/`, so you can start building right away.

## Versions

| Package | Version |
| --- | --- |
| Next.js | 16.4.2 |
| React / React DOM | 19.3.1 |
| Tailwind CSS | 4.3.3 |
| shadcn (CLI) | 4.22.1 |
| TypeScript | 5.9.3 |

The components use the `base-nova` style, built on [Base UI](https://base-ui.com) (`@base-ui/react` 1.9.0).

## Requirements

- **Node.js 20.9 or newer** (Next.js 16 needs it). This project was built with Node 25.8.1 and npm 11.11.0.
- npm (comes with Node.js) and git.

Check your versions:

```bash
node -v
npm -v
```

## Getting started

```bash
git clone <repo-url> nextjs-base
cd nextjs-base
npm install
npm run dev
```

Open http://localhost:3000. You should see a card with an input and a **Say hello** button that opens a dialog.

Press `d` to switch between light and dark mode.

## Where things are

- `app/page.tsx` — the demo page. Edit it and the browser updates by itself.
- `app/layout.tsx` — the layout around every page (fonts, theme).
- `app/globals.css` — Tailwind CSS and the theme colours.
- `components/ui/` — the shadcn/ui components. They are your own code: open them and change them.
- `lib/utils.ts` — the `cn()` helper for joining class names.

## Using a component

Import it from `@/components/ui/...`:

```tsx
import { Button } from "@/components/ui/button"

export default function Page() {
  return <Button variant="outline">Click me</Button>
}
```

Browse all components and their examples at https://ui.shadcn.com/docs/components.

## Adding a component

All components are already installed. If shadcn/ui releases a new one, or you deleted one and want it back, run:

```bash
npx shadcn@latest add <component-name>
```

For example `npx shadcn@latest add calendar`. The file appears in `components/ui/`.
To replace a file you already have with a fresh copy, add `--overwrite`.

## Other commands

```bash
npm run build      # production build
npm run start      # run the production build
npm run lint       # check the code with ESLint
npm run typecheck  # check the TypeScript types
```

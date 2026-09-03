@AGENTS.md

## Product notes for this repo

Independent-clothing-brand discovery marketplace. Full decisions live in the user's memory file `brand-discovery-site`; the design brief is in `docs/claude-design-prompt.md`.

Key constraints:
- Not social-media first. The feed is secondary. Brand pages must not look like social profiles.
- Brand ("business") accounts go through a detailed onboarding; those fields are the source of truth for filters and AI natural-language search.
- Design language: rounded (12/20/32px + pills), cream `#F5F0E8`, pastel accents (lavender, lime, coral, teal), glass only on floating chrome. Tokens in `src/app/globals.css`.
- Stack: Next.js App Router, TypeScript, Tailwind v4, pnpm, deploy on Vercel.

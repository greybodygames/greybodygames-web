# Greybody Games Web Agent Instructions

This file is the shared operating context for agents working in this repository. Keep it current when project structure, design direction, build commands, or important conventions change.

## Working Style

- Be detail-oriented and conservative with changes. Preserve the existing visual language unless the task explicitly calls for a redesign.
- Read the surrounding files before editing. This is a small frontend project, so most changes should fit the existing `index.html`, `src/main.ts`, and `src/styles/home/*` structure.
- Prefer focused, high-signal refactors over broad rewrites. Improve naming, duplication, and boundaries when they are directly relevant to the requested work.
- Do not overwrite unrelated user changes. Check git status before and after meaningful edits.
- Update this `AGENTS.md` when a change introduces a new major convention, command, dependency, asset workflow, or design principle.

## Project Snapshot

- Static portfolio site for Greybody Games.
- Stack: Vite, TypeScript, Tailwind CSS v4, Motion, modular CSS, and canvas-based interactive effects.
- Hosting: GitHub Pages, built and deployed from GitHub Actions.
- Entry points:
  - `index.html` owns the page markup and semantic content.
  - `src/main.ts` owns interactive behavior, canvas rendering, pointer/device parallax, and motion handling.
  - `src/style.css` imports Tailwind and the home style modules.
- Public brand assets live in `public/`.
- Local font assets live in `src/assets/fonts/`.
- `AgentNotes/website-concept.png` is a visual concept reference. Consult it before changing the core look and feel.

## Design Direction

- The site should feel like a sharp, high-contrast game studio identity piece: monochrome, technical, cinematic, precise, and minimal.
- Keep the first viewport focused on the Greybody Games identity system, wordmark, orbit treatment, annotations, and social/work links.
- The current visual system relies on black/near-black backgrounds, white/gray typography, thin technical lines, circular markers, skewed uppercase display text, and restrained motion.
- Avoid generic SaaS, landing-page, or card-heavy patterns. The page should not drift into decorative gradients, soft blobs, stock imagery, or marketing-template composition.
- Preserve responsive composition. Desktop can be poster-like and spatial; tablet/mobile should become readable, stacked, and scrollable without losing the identity-stage impact.

## Frontend Conventions

- Keep TypeScript browser code in `src/main.ts` unless the file becomes difficult to reason about. Extract helpers only when there is clear reuse or complexity reduction.
- Use typed DOM queries and guard nullable elements before use.
- Keep deterministic visual effects deterministic. Seeded randomness is used intentionally for stable starfield and connector behavior.
- Respect `prefers-reduced-motion`. New animation or parallax work must degrade cleanly when reduced motion is enabled.
- Canvas code should account for device pixel ratio and resize behavior, as the existing starfield, orbit, and connector canvases do.
- Prefer CSS and native browser APIs for simple interactions. Use Motion where spring values or animation behavior benefit from it.

## Styling Conventions

- `src/styles/home/theme.css` defines fonts and core theme tokens.
- `src/styles/home/base.css`, `components.css`, `poster.css`, `identity.css`, and `responsive.css` split styling by responsibility. Put new rules in the closest matching module.
- Tailwind utilities are used through CSS `@apply`; keep that pattern consistent instead of mixing large inline class rewrites into `index.html`.
- Maintain the existing typography system: Chakra Petch for UI/body text and GreyBody Display for brand display usage.
- Keep letter spacing, uppercase treatments, line weights, and border opacity consistent with existing components.
- Test mobile breakpoints when changing layout. Current key breakpoints include `980px` and `620px`.

## Verification

Run the narrowest useful checks for the change:

- `npm run format:check` for formatting-only verification.
- `npm run build` for TypeScript and production build verification.
- `npm run dev` when visual or interaction changes need browser inspection.

Pull requests run `.github/workflows/ci.yml`. Pushes to `main` run `.github/workflows/deploy-pages.yml`, which repeats the formatting and build checks before deploying `dist/` to the `github-pages` environment.

For visual changes, inspect at least desktop and mobile widths. Check that:

- Text does not overlap or overflow.
- Canvas effects render non-blank.
- The identity stage remains correctly framed.
- Reduced-motion behavior remains usable.
- Links and pointer interactions are still reachable.

Update these docs whenever necessary.

# Landing page (as-built)

**Source of truth for live UI:** `components/landing-page.tsx`  
**Spec archive:** `Docs/landing-page-spec-final.yaml`

## Routes

| URL | Purpose |
|-----|---------|
| `/` | Marketing page (`LandingRedirect` → `LandingPage` when logged out). Local `className="dark"` wrapper is now redundant — app is globally dark (Stage 13). |
| `/app` | Discover feed (was root `/` before Stage 12) |
| `/?preview=landing` | Preview landing while logged in (local QA) |

## Redirects (`components/landing-redirect.tsx`)

| Session | `/` behavior |
|---------|----------------|
| Logged out | Show landing |
| Logged in, no city | → `/complete-profile` |
| Logged in, profile complete | → `/app` |

## CTAs

- Primary: Request invite → LinkedIn (`INVITE_LINKEDIN_URL` in `lib/constants.ts`)
- Secondary: Already have an invite code? → `/signup`
- Tertiary: Browse dishes → `/app`

## Sections (as-built June 2026)

| Section | Notes |
|---------|-------|
| Hero | "INVITE ONLY" label, h1, subtext, LinkedIn CTA, secondary links |
| Pain grid | "Sound familiar?" — 4 cards |
| Value columns | Search / No scams / Help others — 3 columns |
| Who gets in | "Selective on purpose." — 3 criteria cards + invite trust card |
| Final CTA | LinkedIn template + CTA |
| Hypertrophy definition | Full-width, bottom of page. "HYPERTROPHY." in large bold display, pronunciation in mono, clinical definition. Added June 2026. |

## Hero copy (user-edited May 2026)

- **H1:** Discover high-protein dishes your city's lifters trust.
- **Subhead:** Hypertropher is a community-built database of the best high-protein dishes available in your city.

Other sections follow `landing-page-spec-final.yaml` (pain grid, value columns, who gets in, final CTA + LinkedIn message template).

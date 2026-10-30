# PRODUCT.md

## Product Overview
**Campus Arena** is the official university esports tournament, live bracket, community, and competitive ranking platform exclusively for **Tecsup** students (`@tecsup.edu.pe`).

## Target Audience
- **Tecsup Students & Competitors:** Students across Lima, Arequipa, and Trujillo campuses competing solo or in squads (2v2, 3v3, 4v4, 5v5) in Clash Royale, Brawl Stars, Dota 2, Valorant, Mobile Legends, Counter-Strike 2, and Left 4 Dead 2.
- **Student Organizers (`ORGANIZER`) & Administrators (`ADMIN`):** Campus committees managing brackets, validating Yape/Plin vouchers, and broadcasting live matches.

## Primary Jobs to Be Done
1. **Frictionless Tournament Registration:** Register solo or with an institutional squad using `@tecsup.edu.pe` accounts, upload Yape/Plin payment vouchers, or confirm via structured WhatsApp message (`994 058 442`).
2. **Real-Time Bracket & Match Tracking:** Follow live tournament progression, brackets, and stream embeds with sub-200ms updates.
3. **Institutional Ranking & Identity:** Build a verified campus esports profile, earn medals, and represent academic departments on the Tecsup leaderboard.

## Key Surfaces
- **Landing & Active Cups (`/`):** Hero showcase, live stats, and `AppleMediaCarousel` gallery.
- **Tournaments & Registration Wizard (`/tournaments`, `/tournaments/[slug]`):** Interactive brackets, squad rosters, and 4-step registration modal.
- **Live Arena (`/live`), Community (`/community`), & Ranking (`/ranking`):** Real-time broadcasts, social feed, and campus standings.
- **Organizer Dashboard (`/dashboard/organizer`):** Tournament creation, bracket generation, and atomic payment approval.

## Evidence on Hand
- Production monorepo (`apps/web` Next.js 16 + `apps/api` NestJS 11 + Prisma/Supabase).
- Verified institutional authentication flow (`@tecsup.edu.pe`) and local Yape/Plin payment workflow.

## Product Principles
1. **Clarity & Sub-200ms Speed First:** Every interaction must be immediate, tactile, and accessible (WCAG 2.2 AA).
2. **No Mandatory External Game Accounts:** Institutional `@tecsup.edu.pe` identity is sufficient to compete.
3. **Mobile-First Ergonomics:** Zero horizontal scroll, constrained modals (`max-h-[90vh]`), and 44x44px minimum touch targets.

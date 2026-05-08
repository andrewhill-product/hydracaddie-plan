# CLAUDE.md

This file gives Claude Code the context it needs to help build the Hydracaddie Hydration Plan tool. Claude reads this first at the start of every session. Keep it up to date.

## Project overview

**Name:** Hydracaddie Hydration Plan tool

**Purpose:** A personalised round hydration plan calculator for golfers. Users answer 7 questions about their round, body, climate and sweat rate. The tool calculates the fluid needs for their round using a golf-calibrated baseline derived from on-course sweat rate research (O'Donnell et al. 2024) and the ACSM hydration framework (Sawka et al. 2007). The tool then captures their email and shows a personalised checkpoint timeline (Pre-round, Front 9, Back 9, Post-round).

**Primary user:** Amateur golfers in the UK, typically discovered via Hydracaddie's Instagram and TikTok channels.

**Primary goal (v1):** Drive email signups. The hydration plan is the value exchange. Email signups feed Hydracaddie's marketing.

**Primary goal (v2):** Convert existing email signups into first-time buyers.

**About Hydracaddie:** UK golf electrolytes startup (Shopify store), launched September 2025, founded by Harrison and Ross. One hero SKU: Forest Fruits electrolyte sachets, £28 per bag, £6.99 for a sample. Brand promise: "Fuel Your Swing". Channels: Instagram, TikTok, blog.

**Marketing stat (corrected):** "Mild dehydration can cut your shot distance by around 11% and nearly double how far you miss by." Sourced from Smith et al. (2012). The original stat used on the homepage ("93% of accuracy and 12% of distance") is misleading and is on the v2 list to fix.

## Who is building this

**Andy Hill**, Senior Product Manager at Ocado Technology. No prior coding experience. This is a learning project as much as a deliverable. When writing code, Claude Code must:

- Explain what it is doing and why, in plain English, at a level a PM with no coding background can follow
- After each meaningful change, stop and suggest Andy runs the dev server or inspects the diff before moving on
- Never assume knowledge of frameworks, package managers, or syntax. Define each concept the first time it appears
- Teach git workflow alongside the code (when to commit, what to commit, how to undo)
- Invite Andy to ask "why did you do that?" if a decision is non-obvious, rather than silently moving on

This is explicitly **learn by doing**. Slower than optimal is fine, as long as Andy understands every line by the end of each session.

## Workflow

- Architectural decisions are made in chat with Opus before any code is written.
- This file is the source of truth for those decisions.
- Claude Code's job is execution, not design. If a task requires picking between architectural options, stop and surface the decision rather than choosing.
- Reminder: open a NEW terminal for git commands. The first terminal runs `npm run dev` and silently swallows them.

## Scalability default

Prefer lookup tables and config objects over hardcoded logic. When a new option is added in future (a new hole count, a new climate band, a new weight bucket), the change should require adding one line to a data table, not editing logic or conditionals. If a value appears more than once or drives branching behaviour, it belongs in a lookup table. Hardcoded values are only acceptable where the value is guaranteed never to change.

Do not sacrifice clarity for scalability: if a lookup table makes something harder to read, document it clearly with a comment.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode off for v1, will tighten in v2)
- **Styling:** Tailwind CSS (utility classes only, no custom CSS unless unavoidable). Tailwind refactor from inline styles is on the v2 list.
- **Deployment:** Vercel, default `*.vercel.app` URL for v1
- **Email capture (v1):** Formspree, form ID `mlgzbrqr`
- **Email capture (v2):** Migrating to Klaviyo to feed Hydracaddie's Shopify CRM directly
- **No backend logic, no database in v1.** The calculator runs entirely client-side.

## Quiz questions (locked, design v5, matches live code)

**Q1. How many holes are you playing?**
- 9 holes / 18 holes
- Stored as `'9' | '18'`

**Q2. Walking or in a buggy?**
- Walking / Buggy (custom golf buggy icon, not a car emoji)
- Stored as `'walking' | 'buggy'`

**Q3. How long does your round usually take?**
- Around 3 hours / Around 4 hours / 5 hours or more / Not sure
- Stored as `'3h' | '4h' | '5h+' | 'not-sure'`
- "Not sure" defaults: 9 holes = 120 min, 18 holes = 240 min

**Q4. What's the weather like when you usually play?**
- 0-10°C / 11-15°C / 16-20°C / 21-25°C / 26°C+
- Stored as `'0-10' | '11-15' | '16-20' | '21-25' | '26+'`

**Q5. How much do you typically sweat on the course?**
- Barely break a sweat / I'll need a shower after / Damp shirt by the back nine / Soaked through, often
- Stored as `'low' | 'shower' | 'medium' | 'high'`

**Q6. Roughly what do you weigh?**
- 60kg or below / 60-70kg / 70-80kg / 80-90kg / 90-100kg / Over 100kg
- kg/lbs toggle (cosmetic only, same bucket keys stored)
- Stored as `'under60' | '60-70' | '70-80' | '80-90' | '90-100' | 'over100'`

**Q7. What's your handicap?**
- Range slider (-10 to 30) plus "I don't have one yet" button
- Stored as `'under10' | '10-18' | '19-28' | '28+' | 'none'`
- **Important:** Handicap is collected for personalisation and CRM segmentation only. It does NOT affect the hydration calculation.

## Calculator engine source of truth

The hydration calculator is anchored on:
- ACSM position stand on exercise and fluid replacement (Sawka et al., 2007) for the general framework.
- O'Donnell et al. 2024 (*Sports Medicine*) for the golf-specific evidence base.

Base rate: 2.8ml per kg body weight per hour for a typical walking golfer in mild conditions, dropping to 1.6ml per kg per hour for buggy use. These are calibrated against measured golf-specific sweat rates (Thompsett et al. 2022, cited in O'Donnell 2024), not extrapolated from general fitness equations like the Galpin equation.

Do not reframe the engine as "Galpin x discount" in code or copy. The Galpin equation is for intense exercise; golf is low-to-moderate intensity and warrants its own baseline.

The "one sachet per round" position is a brand position decoupled from the fluid recommendation. The calc outputs ml of fluid; the sachet recommendation is hardcoded copy. Do not generate a sachet count from the fluid number.

### The formula

```
const BASELINE_ML_PER_KG_PER_HOUR = { walking: 2.8, buggy: 1.6 };

hours = durationMins / 60
weightKg = WEIGHT_MIDPOINTS[answers.weight]
baseline = BASELINE_ML_PER_KG_PER_HOUR[answers.mode]
fluidMl = weightKg x baseline x hours x CLIMATE_MULT[answers.climate] x SWEAT_MULT[answers.sweat]
totalFluidMl = roundToNearest50(fluidMl)
```

### Weight bucket midpoints

| Bucket   | Midpoint used |
|----------|---------------|
| under60  | 55kg          |
| 60-70    | 65kg          |
| 70-80    | 75kg          |
| 80-90    | 85kg          |
| 90-100   | 95kg          |
| over100  | 105kg         |

### Duration mapping

| Answer             | Minutes |
|--------------------|---------|
| 3h                 | 180     |
| 4h                 | 240     |
| 5h+                | 300     |
| not-sure (9 holes) | 120     |
| not-sure (18 holes)| 240     |

### Climate multipliers

| Band    | Multiplier |
|---------|------------|
| 0-10°C  | 0.85       |
| 11-15°C | 1.0        |
| 16-20°C | 1.2        |
| 21-25°C | 1.4        |
| 26°C+   | 2.0        |

Calibrated against measured sweat rate variation across temperature ranges. Cool conditions reduce sweat losses; hot conditions roughly double them vs mild.

### Sweat rate multipliers

| Option                        | Key    | Multiplier |
|-------------------------------|--------|------------|
| Barely break a sweat          | low    | 0.85       |
| I'll need a shower after      | shower | 0.95       |
| Damp shirt by the back nine   | medium | 1.0        |
| Soaked through, often         | high   | 1.25       |

### Worked example (sanity check)

85kg golfer, walking, 18 holes, 4 hours, 21-25°C, medium sweat:
- weightKg = 85
- baseline = 2.8 (walking)
- hours = 4
- climate mult = 1.4
- sweat mult = 1.0
- fluidMl = 85 x 2.8 x 4 x 1.4 x 1.0 = 1,332.8ml
- totalFluidMl rounded to nearest 50 = **1,350ml**

### Post-round 150% rule

Both 9-hole and 18-hole timelines apply ACSM's full-rehydration guidance:

```
postRoundMl = roundToNearest50(totalFluidMl x 1.5)
```

### Electrolyte loss values (computed but currently hidden in UI)

Calculated from `totalFluidMl` for potential future surfacing:
- Sodium: 500 to 2000mg per litre of fluid lost
- Potassium: 100 to 500mg per litre of fluid lost

The electrolyte card was removed from the UI in May 2026 to keep the results page focused.

## Sachet positioning rules

**One sachet per round is the brand position.** Do not display a "sachets recommended" card. Do not vary the sachet count. Do not generate a sachet count from the fluid number. The hydration plan is the calc output, the sachet is the answer.

The sachet recommendation appears as hardcoded copy in the Pre-round checkpoint ("Mix one sachet in 500ml water"), never derived from the calc.

## Results page checkpoint timeline (locked, matches live code)

### 18-hole round (4 checkpoints, dynamic from `buildCheckpoints18(totalFluidMl)`)

```
front9Ml = roundToNearest50(totalFluidMl / 2)
back9Ml = totalFluidMl - front9Ml
postRoundMl = roundToNearest50(totalFluidMl x 1.5)
```

| Checkpoint       | Subtitle          | Action                              | Body |
|------------------|-------------------|-------------------------------------|------|
| Pre-round        | Before the first tee | Mix one sachet in 500ml water    | "Start sipping 2 hours before your tee time, not on the first tee. Drink half your sachet in the build-up to your round and save the rest for the front nine. Getting ahead of your fluid needs before hole one is the easiest win in golf hydration." |
| Front 9          | Holes 1 to 9      | Aim for **{front9Ml}ml** by the turn | "Sip your sachet every 2-3 holes, topping up with plain water as needed. Steady sipping beats big gulps for absorption." |
| Back 9           | Holes 10 to 18    | Top up with **{back9Ml}ml** of plain water | "Sip every 2-3 holes. The electrolytes from your sachet will keep working through the back nine." |
| Post-round       | After the 18th    | **{postRoundMl}ml** plain water in the clubhouse | "Sports science recommends replacing 150% of fluid lost after exercise to fully rehydrate. Based on your estimated sweat loss of {totalFluidMl}ml, aim for {postRoundMl}ml before you head home." |

### 9-hole round (3 checkpoints, dynamic from `buildCheckpoints9(totalFluidMl)`)

| Checkpoint  | Subtitle          | Action              | Body |
|-------------|-------------------|---------------------|------|
| Pre-round   | Before the first tee | Mix one sachet in 500ml water | "Start sipping 2 hours before your tee time. Drink half your sachet in the build-up and save the rest for the course." |
| Mid-round   | Around hole 5     | Sip every 2-3 holes | "Sip the rest of your sachet through the round." |
| Post-round  | After the 9th     | **{postRoundMl}ml** plain water in the clubhouse | "Sports science recommends replacing 150% of fluid lost after exercise to fully rehydrate. Based on your estimated sweat loss of {totalFluidMl}ml, aim for {postRoundMl}ml before you head home." |

## "How we calculated this" expandable (locked copy)

Three paragraphs:

> Your plan is built on hydration guidelines from the American College of Sports Medicine, calibrated against the latest golf-specific evidence base (O'Donnell et al., 2024, *Sports Medicine*).

> The base recommendation is roughly 2.8ml of fluid per kilogram of body weight per hour for a typical golfer walking the course in mild conditions, derived from on-course sweat rate measurements. We then adjust for your weather, your sweat rate, and whether you walk or take a buggy.

> The 150% post-round rule for replacing lost fluid is from ACSM guidance for full rehydration after exercise.

### Citations shown to user

Two-citation block in small/lower-opacity style:

- Sawka et al. (2007), American College of Sports Medicine position stand on exercise and fluid replacement.
  https://pubmed.ncbi.nlm.nih.gov/17277604/
- O'Donnell et al. (2024), Nutrition and Golf Performance: A Systematic Scoping Review. *Sports Medicine*.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC11608286/

### Disclaimer (unchanged, hardcoded)

> This estimate is guidance. Please consult with a healthcare professional for personalised advice.

## Homepage hero stat (v2 fix pending)

The current live homepage carries the misleading stat: "Dehydration causes golfers to lose 93% of their accuracy and 12% of their distance." Approved replacement copy:

> Mild dehydration can cut your shot distance by around 11% and nearly double how far you miss by.

Source: Smith et al. (2012), *Journal of Strength and Conditioning Research*.
https://pubmed.ncbi.nlm.nih.gov/22190159/

Citation should display in small/lower-opacity style under the stat. Always pair dehydration claims with "mild" or equivalent qualifier; the underlying study is on mild dehydration only.

This homepage update is a separate Claude Code session, scheduled as part of v2 work.

## Coding conventions

### Language and copy

- All user-facing copy in British English (colour, optimise, centred, favourite, etc.)
- **No em dashes or en dashes anywhere in code, comments or UI copy.** Use commas, colons, parentheses, or full stops instead. Hard rule.
- Metric units primary, imperial toggle for weight (kg primary, lbs secondary)
- Tone: friendly, direct, golf-native, not corporate, not preachy. Short sentences.

### File and folder structure

- Components in `/app/components/` with PascalCase filenames (e.g. `Results.tsx`)
- Pure logic functions in `/lib/` with camelCase filenames (e.g. `calculateHydrationPlan.ts`)
- Types in `/lib/types.ts`
- Brand colours, spacing tokens in `tailwind.config.ts`

### Component patterns

- Functional components only, no class components
- Hooks for state (`useState`, `useReducer`)
- No external state management libraries in v1 (no Zustand, Redux, Jotai, etc.)
- One component per file
- Keep components small and focused

### What to avoid

- Do not introduce new dependencies unless absolutely necessary. Ask Andy first.
- Do not enable TypeScript strict mode in v1.
- Do not write custom CSS files. Tailwind utilities only.
- Do not call the project "the app". It is "the tool" or "the Hydration Plan".
- Do not invent brand colours or fonts. Use the confirmed ones from the Claude Design prototype.
- Do not use em or en dashes. Hard rule.
- Do not display a "sachets recommended" card. One sachet per round, full stop.
- Do not anchor the calc engine on Galpin in code or copy. Use the ACSM + O'Donnell framing throughout.

## Known inputs pending from Ross

- [x] Brand colours and typography (captured via Claude Design prototype)
- [x] Logo file (SVG)
- [x] Confirmed product URL for the Forest Fruits sachets (with UTM tags)
- [ ] Sachet composition data from Ross (mg of Na, K, Mg per sachet) -- needed to verify "one sachet covers a typical round" claim
- [x] Email platform decision (Formspree v1, Klaviyo v2)
- [x] Privacy Policy URL
- [x] Terms of Service URL
- [x] Final social-proof number for landing hero (currently hardcoded "150+", on v2 list to make dynamic)
- [ ] DNS access for subdomain (needed for v2 only)

## Decision log

Locked decisions so we do not re-litigate them:

1. **Next.js 14 App Router** over Pages Router (modern default, simpler folder structure)
2. **TypeScript** over plain JavaScript. Strict mode off for v1
3. **Tailwind CSS** over CSS Modules or styled-components. Inline styles in v1 are a known debt; refactor in v2
4. **Vercel default URL for v1**, embed into hydracaddie.com via iframe in v2
5. **Email capture is in v1.** Required to see results, single GDPR tickbox, no skip option
6. **British English** everywhere, no em or en dashes
7. **One sachet per round is the brand position.** No sachet count card, no dosing logic
8. **Calc engine anchored on ACSM + O'Donnell 2024**, not Galpin. Galpin framing is misleading because golf is low-to-moderate intensity, not the intense exercise context Galpin was derived for.
9. **Client-side calc only in v1.** No server, no database, no external API calls beyond email handoff
10. **9 or 18 holes only.** 27 and 36 hole options removed from quiz
11. **Handicap (Q7) is data-only.** Captured for CRM segmentation, does not affect calc
12. **Checkpoint timeline is the hero element of the results page.** Designed to be screenshot-worthy and shareable on Instagram and TikTok
13. **Scalability by default.** Lookup tables over hardcoded logic. New options require one line added to config, not edits to branching logic.
14. **5-band climate scale** (0-10 / 11-15 / 16-20 / 21-25 / 26+), not the original 4-band (Cool/Mild/Warm/Hot). Bands recalibrated May 2026 to expand cold and hot ends (0.85 / 1.0 / 1.2 / 1.4 / 2.0).
15. **4-option sweat scale** (low / shower / medium / high), not the original 3-option. Added "I'll need a shower after" as a mid-low band in May 2026.
16. **Post-round 150% rule** applied for both 9-hole and 18-hole rounds, derived from ACSM full-rehydration guidance.
17. **Citations on plan page** are Sawka 2007 + O'Donnell 2024. Fallowfield 1996 (Galpin source) was removed in May 2026.

## Current state

**v1 Status:** Shipped. Live at https://hydracaddie-plan.vercel.app/

**v2 in flight (priority order):**

1. Science copy fix on homepage hero (replacing the misleading 93%/12% stat)
2. Klaviyo migration (replacing Formspree, urgent because Formspree free tier nearly maxed)
3. Klaviyo welcome flow (drives conversion of existing list to first purchase)
4. Analytics: GA4, Meta Pixel, cookie banner
5. Tailwind refactor (replace inline styles)
6. iframe embed into hydracaddie.com via Shopify
7. Slider UX improvement on Q7 (mobile)
8. Live signup count (replace hardcoded "150+")

## How to work with this codebase

### Running locally

```
npm run dev  # starts the dev server at localhost:3000
```

### Committing

After each working change, Andy should:

```
git add .
git commit -m "short description of what changed"
git push
```

Suggest the short description.

**Reminder:** open a NEW terminal for git commands. The `npm run dev` terminal silently swallows them.

Claude Code should suggest commit messages when appropriate.

### Deploying

Vercel auto-deploys every push to `main`. No manual deploy step.

## v2 next steps detail

This expands on the v2 priority list in "Current state". Each item captures the goal, the agreed approach, any locked or pending architectural decisions, and dependencies on other items. Items follow the priority order in "Current state".

Use this section to brief future Opus chat sessions and Claude Code sessions. Anything marked "decisions pending" needs an Opus chat session before code is written.

### Calc engine refresh (immediate, in flight, not in the priority list)

**Status:** Specced. Three Claude Code prompts ready to execute.

**Goal:** Bring the calc engine into alignment with the ACSM + O'Donnell framing locked in this CLAUDE.md. Engine reframe (rename Galpin-anchored constants), climate band recalibration (expand cold and hot ends), 9-hole post-round personalisation, citation switch, "How we calculated this" copy update.

**Decisions locked:** walking baseline 2.8 ml/kg/hour, buggy 1.6 ml/kg/hour, climate multipliers 0.85/1.0/1.2/1.4/2.0, citations Sawka 2007 + O'Donnell 2024.

**Sequencing:** Complete before any v2 backlog item. Once shipped, Item 1 (homepage hero stat fix) can follow in the same week.

### Item 1: Homepage hero stat fix

**Status:** Copy locked, ready for Claude Code session.

**Goal:** Replace the misleading "93% accuracy / 12% distance" stat with the corrected Smith et al. 2012 framing. See "Homepage hero stat (v2 fix pending)" section for exact copy.

**Architectural decisions:** None. Pure copy change. Add citation in small/lower-opacity style under the stat.

**Sequencing:** Single 1-session job. Run immediately after the calc engine refresh ships.

### Item 2: Klaviyo migration (urgent)

**Status:** Step zero pending. Confirm Klaviyo is connected to the Shopify store. Ross or Harrison can check via Shopify admin, Apps section.

**Goal:** Replace Formspree (free tier near cap, blocking new signups soon) with Klaviyo for email capture. Klaviyo's native Shopify connector then auto-creates a Shopify customer record from each new email.

**Approach:** Client-side Klaviyo track and identify API replaces the current Formspree form POST. Quiz answers passed as Klaviyo profile properties so future flows can segment on them.

**Architectural decisions pending (need Opus chat session before Claude Code):**

- Profile property schema. Which quiz answers become Klaviyo profile properties (durable user attributes) vs metric event metadata (one-time event data). This shapes future segmentation. Annoying to retrofit.
- Cutover strategy. Hard cut Formspree to Klaviyo, or dual-write for one week as a safety net.
- Error handling. Current Formspree fails silently. Klaviyo failure should at minimum log to console. Decide whether to surface to user.
- Sub-decision: Ross's idea of tagging Shopify customers who complete the quiz. This is configured in Klaviyo's flow builder using the native Shopify connector, no separate code. Tag name like `did_hydration_quiz`, optionally with quiz-derived tags too (e.g. `high_sweat_segment`). Does not need a separate Claude Code session, just Klaviyo UI work.

**Dependencies:** Klaviyo confirmed connected, or set up if not (free tier covers up to 250 contacts).

### Item 3: Klaviyo welcome flow

**Status:** Pending. No code work, entirely in Klaviyo UI.

**Goal:** Convert the existing email list to first-time buyers. This is the actual conversion lever for v2, not the embed.

**Approach:** 3 to 5 email welcome sequence triggered by quiz signup, with copy personalised using the quiz answers (sweat tier, walking vs buggy, weight bracket). Final email contains a discounted first-order CTA.

**Architectural decisions pending (Opus chat session):**

- Flow shape. Number of emails, gap between them, branching by segment.
- Offer mechanics. Percentage discount, bundle, free sample, or other.
- Trigger logic. Quiz completion vs email submission (subtly different in Klaviyo terms).

**Dependencies:** Item 2 (Klaviyo migration) must be live first.

### Item 4: Analytics (GA4, Meta Pixel, cookie banner)

**Status:** Pending.

**Goal:** Track funnel conversion from quiz start to email submission to Shopify purchase. Free tier coverage only for v2.

**Approach:** GA4 for analytics, Meta Pixel for ad attribution, cookie consent banner for GDPR compliance. All free.

**Architectural decisions pending (Opus chat session):**

- Event structure. Which quiz steps fire events (quiz_started, quiz_step_n_completed, email_submitted, plan_viewed, cta_clicked).
- Consent banner placement. Lives on Vercel side (current quiz domain) or Shopify side (post-embed).
- GTM vs direct script tags. GTM gives flexibility but adds complexity for a learner. Direct snippets are simpler.

**Dependencies:** Ideally done before Item 6 (iframe embed) so analytics work consistently across the embed boundary.

### Item 5: Tailwind refactor

**Status:** Pending.

**Goal:** Replace inline styles in the codebase with Tailwind utility classes. Pure technical debt cleanup. Tailwind is already installed but unused.

**Approach:** Incremental component-by-component conversion. Visual regression check (manually click through quiz) before and after each component.

**Architectural decisions pending:**

- Big bang vs incremental. Incremental recommended for safety with a learner.
- Whether to extract shared design tokens to `tailwind.config.ts` first, or convert inline first and refactor tokens after. Likely tokens first.

**Dependencies:** Do before Item 6 (iframe embed) so embedded styles are clean from day one.

### Item 6: Shopify iframe embed (marquee v2 item)

**Status:** Pending.

**Goal:** Tool lives at `hydracaddie.com/pages/hydration-plan`, embedded as an iframe pointing at the Vercel-hosted Next.js app. Visually, looks like a part of the Shopify site.

**Approaches considered and rejected:**

- Full Liquid port (rewrite the React quiz state machine into Liquid plus Alpine.js). Too much for a learner with no Shopify dev experience. Estimated 4-week stretch project. Rejected.
- Stay on Vercel forever, link only from Shopify. Rejected because Ross's stated goal is to embed.

**Approach decided:** iframe at `hydracaddie.com/pages/hydration-plan`. Parent Shopify page hosts the iframe. postMessage protocol for height auto-sizing on mobile.

**Architectural decisions pending (Opus chat session):**

- Exact URL path on hydracaddie.com. `pages/hydration-plan` is the placeholder.
- Mobile height handling. postMessage handler in the parent. Child sends height on every render and on window resize.
- Visual seams. Matching fonts, background colour, and edge-to-edge layout to make the iframe disappear visually.
- Cross-domain analytics. GA4 cross-domain tracking config so the funnel reads as one journey, not two.
- SEO. The embedded page needs minimal SEO since it is a conversion surface, not a discovery surface. The parent Shopify page should have basic meta description and Open Graph tags.
- Who has Shopify admin access. Andy or Ross or Harrison. Decide before the session.

**Dependencies:** Items 2 and 3 (Klaviyo migration and welcome flow) live first, so the email pipeline already works regardless of where the UI lives. Items 4 and 5 (analytics and Tailwind) strongly recommended before this.

### Item 7: Slider UX improvement (Q7)

**Status:** Pending. Small.

**Goal:** The handicap range slider on Q7 is fiddly on mobile. Improve touch target size and live value display.

**Approach options:**

- Larger touch hit area on the slider thumb.
- Snap-to-value behaviour (handicap is bucketed anyway).
- Replace slider with a numeric input plus + and - buttons.

**Architectural decisions:** Design call, can be made in a Claude Code session if the right approach becomes obvious during build.

**Dependencies:** None.

### Item 8: Live signup count

**Status:** Pending. Small.

**Goal:** Replace the hardcoded "150+" social proof on the homepage with a real number that reflects actual signups.

**Approach options:**

- Klaviyo API call on page load. Introduces latency and an API key concern client-side.
- Static value updated weekly via a script or manual paste. Simpler.

**Architectural decisions pending:**

- Live count vs periodic update. Periodic update probably fine for v2, simpler. Live count is "nice to have", not "needs".
- If live: API key handling. Server-side rendering vs client-side.

**Dependencies:** Item 2 (Klaviyo) live so there is a count to pull.

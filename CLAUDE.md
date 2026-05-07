CLAUDE.md
This file gives Claude Code the context it needs to help build the Hydracaddie Hydration Plan tool. Claude reads this first at the start of every session. Keep it up to date.
Project overview
Name: Hydracaddie Hydration Plan tool

Purpose: A personalised round hydration plan calculator for golfers. Users answer 7 questions about their round, body, climate and sweat rate. The tool calculates the fluid and electrolyte needs for their round using a golf-adjusted Galpin Equation, captures their email, then shows a personalised checkpoint timeline (Pre-round, Front 9, Back 9, Post-round).

Primary user: Amateur golfers in the UK, typically discovered via Hydracaddie's Instagram and TikTok channels.

Primary goal (v1): Drive email signups. The hydration plan is the value exchange. Email signups feed Hydracaddie's marketing.

About Hydracaddie: UK golf electrolytes startup (Shopify store), launched September 2025, founded by Harrison and Ross. One hero SKU: Forest Fruits electrolyte sachets, £28 per bag, £6.99 for a sample. Brand promise: "Fuel Your Swing". Channels: Instagram, TikTok, blog. Key stat they use in marketing: dehydration costs golfers 93% of accuracy and 12% of distance.
Who is building this
Andy Hill, Senior Product Manager at Ocado Technology. No prior coding experience. This is a learning project as much as a deliverable. When writing code, Claude Code must:

Explain what it is doing and why, in plain English, at a level a PM with no coding background can follow
After each meaningful change, stop and suggest Andy runs the dev server or inspects the diff before moving on
Never assume knowledge of frameworks, package managers, or syntax. Define each concept the first time it appears
Teach git workflow alongside the code (when to commit, what to commit, how to undo)
Invite Andy to ask "why did you do that?" if a decision is non-obvious, rather than silently moving on

This is explicitly learn by doing. Slower than optimal is fine, as long as Andy understands every line by the end of each session.

### Scalability default

Prefer lookup tables and config objects over hardcoded logic. When a new option
is added in future (a new hole count, a new climate band, a new weight bucket),
the change should require adding one line to a data table, not editing logic or
conditionals. If a value appears more than once or drives branching behaviour,
it belongs in a lookup table. Hardcoded values are only acceptable where the
value is guaranteed never to change (e.g. the Galpin base rate of 2ml per kg).


Stack
Framework: Next.js 14 (App Router)
Language: TypeScript (strict mode off for v1, we will tighten later)
Styling: Tailwind CSS (utility classes only, no custom CSS unless unavoidable)
Deployment: Vercel, default *.vercel.app URL for v1
Email capture destination: TBC. Likely a third-party form service (Formspree, Klaviyo embed, ConvertKit, etc.) or a simple Vercel serverless route that forwards to one. No own database in v1.
No backend logic, no external APIs in v1 beyond the email handoff above. The calculator runs entirely client-side.
v1 scope
Single-page web tool with four sections:

Landing hero: headline "Your personal round hydration plan", one-sentence subhead, primary "Start your plan" button, social proof line ("Used by 2,400 golfers" placeholder), short "why hydration matters" line at the bottom of the green hero box.
Stepper quiz, 7 steps, one question per screen (see "Quiz questions" below). Progress indicator "X of 7" at the top of each step. Smooth transitions.
Email capture screen. Single email input, one required GDPR-compliant tickbox, links to Privacy Policy and Terms of Service. "Send me my plan" button disabled until tickbox is ticked and a valid email is entered. No skip option.
Results page. Two cards (Total fluid for your round, Electrolytes you'll lose). Below the cards, a checkpoint timeline titled "Your optimal plan" with stages Pre-round, Front 9, Back 9, Post-round (4 stages for 18 holes, collapses to 3 stages for 9 holes). Each checkpoint has a small icon. Below the timeline, an expandable "How we calculated this" section. Primary CTA at the bottom: "Get your sachets" linking to the Hydracaddie product page with UTM tags.

Explicitly out of scope for v1:

Custom domain like plan.hydracaddie.com (v2)
Shopify integration beyond the outbound product link with UTM tags (v2)
Analytics, Meta Pixel, cookie consent (v2)
Saving user quiz answers anywhere (the calc is stateless, only the email is captured)
Unit tests (we will add Vitest in v2)
Mobile native, PWA features, offline support
Multi-language (English only, British spelling)
Quiz questions (locked, design v4)
Q1. How many holes are you playing? 9 holes / 18 holes Q2. Walking or in a buggy? Walking / Buggy. Use a custom golf buggy icon for the Buggy option, not a car emoji. Q3. How long does your round usually take? Around 3 hours / Around 4 hours / 5 hours or more / Not sure (we'll use the average for the round length you picked) Q4. What's the weather like when you usually play? Cool (under 15C) / Mild (15-22C) / Warm (22-28C) / Hot (28C+) Q5. How much do you typically sweat on the course? Barely break a sweat / Damp shirt by the back nine / Soaked through, often Q6. Roughly what do you weigh? 60kg or below / 60-70kg / 70-80kg / 80-90kg / 90-100kg / Over 100kg (with kg/lbs toggle) Q7. What's your handicap? Under 10 / 10-18 / 19-28 / 28+ / I don't have one yet

Important: Handicap (Q7) is collected for personalisation and customer insight only. It does not affect the hydration calculation.
Business rules (the calc logic)
Status: numbers below are placeholders pending Ross confirmation on sachet composition. They are honest defaults derived from Galpin's published formula plus golf-specific adjustments. Treat them as tunable.
Galpin base formula
2ml of fluid per kg of body weight per 15 minutes of activity
Round duration
Use the user's answer to Q3. If they pick "Not sure", default to:

9 holes: 2 hours
18 holes: 4 hours
Weight bucket midpoints (use as the input to the formula)
60kg or below: 55kg
60-70kg: 65kg
70-80kg: 75kg
80-90kg: 85kg
90-100kg: 95kg
Over 100kg: 105kg
Golf intensity multiplier
Galpin's formula is calibrated for running. Golf is lower intensity. Apply a multiplier:

Walking: 0.35 (roughly 35% of running intensity)
Buggy: 0.20 (mostly standing, lower sweat rate)
Climate multiplier
Cool (under 15C): 1.0
Mild (15-22C): 1.1
Warm (22-28C): 1.4
Hot (28C+): 1.7
Sweat rate self-report
Barely break a sweat: 0.85
Damp shirt by the back nine: 1.0
Soaked through, often: 1.25
Sachet recommendation
One sachet per round is the brand position. Do not display a "sachets recommended" card. Do not vary the sachet count. The hydration plan is the output, the sachet is the answer, full stop.
Worked example (for reference, not for hard-coded output)
85kg golfer (midpoint of the 80-90kg bucket), walking 18 holes over 4 hours on a warm UK day, damp shirt sweat:

Base Galpin: 85kg x 2ml x 4 blocks/hr x 4hr = 2,720ml
Golf walking 0.35: 896ml
Warm 1.4: 1,254ml
Sweat 1.0 (damp shirt): 1,254ml
Round to nearest 50ml for display: ~1,250ml

This matches the worked-example copy in the "How we calculated this" expandable on the results page.
Electrolyte loss display (informational only)
Using Galpin's sweat loss ranges per litre of sweat:

Sodium: 500 to 2000mg
Potassium: 100 to 500mg
Chloride: 500 to 3000mg
Calcium: 0 to 100mg
Magnesium: 0 to 100mg

For v1, display sodium and potassium only on the results card. Avoid overwhelming the user.
Results page checkpoint timeline (locked copy, design v4)
18-hole round (4 checkpoints)
Pre-round (before tee): "Mix one sachet in 500ml water. Drink half before you head out, save the rest for the front nine. Pre-hydrating primes your electrolyte levels and stops the back-nine fade before it starts."
Front 9 (holes 1-9): "Sip every 2-3 holes. Aim to finish the rest of your sachet by the turn. Steady sipping beats big gulps for absorption."
Back 9 (holes 10-18): "Top up with plain water. Sip every 2-3 holes again. The electrolytes from your sachet will keep working through the back nine."
Post-round (after 18th): "500ml plain water in the clubhouse. Replaces what you've lost and helps recovery for tomorrow."
9-hole round (3 checkpoints)
Pre-round: "Mix one sachet in 500ml water. Drink half before you tee off."
Mid-round (around hole 5): "Sip the rest of your sachet through the round, every 2-3 holes."
Post-round: "250-500ml plain water in the clubhouse to recover."

Each checkpoint has a small icon (golf flag, tee, halfway house, clubhouse) for visual interest.
"How we calculated this" expandable (locked copy, design v4)
"We use the Galpin equation, a sports-science formula for fluid intake during activity, then adjust it for the conditions of a round of golf."
"The base formula is: 2ml of fluid per kg of body weight, every 15 minutes of activity."
"From there we apply three adjustments based on your answers:"
"Mode of play: walking burns more energy than riding in a buggy."
"Climate: hotter conditions raise sweat rate."
"Self-reported sweat rate: a personal multiplier on top of the climate adjustment."
"Worked example: an 85kg golfer (in the 80-90kg bucket) walking 18 holes over 4 hours on a warm UK day with damp shirt sweat needs around 1,350ml of fluid across the round."
"Galpin's formula was originally calibrated for running. We apply a golf-specific intensity multiplier to account for the lower energy demand of a round."
"Want to read the science? See Fallowfield et al. (1996), 'Effect of water ingestion on endurance capacity during prolonged running', Journal of Sports Sciences, 14(6), 497-502. https://www.tandfonline.com/doi/abs/10.1080/02640419608727736"
Coding conventions
Language and copy
All user-facing copy in British English (colour, optimise, centred, favourite, etc.)
No em dashes or en dashes anywhere in code, comments or UI copy. Use commas, colons, parentheses, or full stops instead. This is a hard rule
Metric units primary, imperial toggle for weight (kg primary, lbs secondary)
Tone: friendly, direct, golf-native, not corporate, not preachy. Short sentences
File and folder structure
Components in /app/components/ with PascalCase filenames (e.g. QuizStep.tsx)
Pure logic functions in /lib/ with camelCase filenames (e.g. calculateHydrationPlan.ts)
Types in /lib/types.ts
Brand colours, spacing tokens in tailwind.config.ts
Component patterns
Functional components only, no class components
Hooks for state (useState, useReducer)
No external state management libraries in v1 (no Zustand, Redux, Jotai, etc.)
One component per file
Keep components small and focused
What to avoid
Do not introduce new dependencies unless absolutely necessary. Ask Andy first
Do not enable TypeScript strict mode in v1
Do not write custom CSS files. Tailwind utilities only
Do not call the project "the app". It is "the tool" or "the Hydration Plan"
Do not invent brand colours or fonts. Use the confirmed ones from the Claude Design prototype
Do not use em or en dashes. Hard rule
Do not display a "sachets recommended" card. One sachet per round, full stop
Known inputs pending from Ross
Claude should flag a reminder at session start if these are still placeholders:

Brand colours and typography (captured via Claude Design prototype, will lift from there)
Logo file (SVG preferred, PNG acceptable)
Confirmed product URL for the Forest Fruits sachets (for the "Get your sachets" CTA)
Sachet composition photo from Ross (mg of Na, K, Mg per sachet)
Email platform decision (Formspree, Klaviyo, ConvertKit, etc.) needed for v1, blocks email capture screen
Privacy Policy URL (referenced on email capture tickbox)
Terms of Service URL (referenced on email capture tickbox)
Final social-proof number for landing hero ("Used by X golfers")
DNS access for subdomain (needed for v2 only)
Decision log
Locked decisions so we do not re-litigate them:

Next.js 14 App Router over Pages Router (modern default, simpler folder structure for Andy to learn)
TypeScript over plain JavaScript (catches errors, teaches better habits). Strict mode off for v1
Tailwind CSS over CSS Modules or styled-components (fastest to iterate, Claude Code is strong at it)
Vercel default URL for v1, custom subdomain deferred to v2
Email capture is in v1. Required to see results, single GDPR tickbox, no skip option. Email destination platform still TBC
British English everywhere, no em or en dashes anywhere
One sachet per round is the brand position. No sachet count card, no 1-to-3 dosing logic
Golf intensity multiplier is applied. The tool is honest that Galpin was designed for running, not golf
Client-side calc only in v1. No server, no database, no external API calls beyond the email handoff
9 or 18 holes only. 27 and 36 hole options removed from the quiz
Handicap (Q7) is data-only. Captured for customer insight, does not affect the calc
Checkpoint timeline is the hero element of the results page. Designed to be screenshot-worthy and shareable on Instagram and TikTok
13. Scalability by default.
14. v1 uses inline styles, not Tailwind utilities. Sessions 1 to 3 silently bypassed the original Tailwind-only convention. Refactor to Tailwind is deferred to v2. Brand colours live in the local G const in app/page.tsx and app/components/QuizStepper.tsx.
15. Brand greens in use: #1A7A3C (primary), #155F2E (dark), #2A9B52 (mid), #EAF4EE (light tint). Update tailwind.config.ts to match in v2 refactor.
16. Worked example uses bucket midpoint, not raw user weight. 85kg is the midpoint of the 80-90kg bucket and produces 1,350ml.
17. Post-round rehydration uses the 150% rule (1.5x sweat loss), confirmed by golf-specific sports science literature (O'Donnell et al., 2024; ACSM, 2007).
18. OPEN QUESTION for Ross: the walking intensity multiplier (0.35) may be too aggressive. Golf-specific research (O'Donnell et al., 2024) recommends 150ml per 15 minutes on-course regardless of body weight, which for a 4-hour round implies 2,400ml before climate and sweat adjustments. Our Galpin-adjusted figure for a typical walking golfer is approximately 1,350ml. The gap suggests our multiplier could be revised upward. Do not change the multiplier without Ross sign-off. The value lives in INTENSITY in lib/calculateHydrationPlan.ts.

Golf hydration research references
The following peer-reviewed sources were reviewed in session 7 (May 2026) and inform the calc logic and checkpoint copy. Use these as the reference baseline when Ross reviews the multipliers.

On-course hydration
- O'Donnell, A., Murray, A., Nguyen, A., Salmon, T., Taylor, S., Morton, J. P., & Close, G. L. (2024). Nutrition and Golf Performance: A Systematic Scoping Review. Sports Medicine, 1-15.
  Key finding: 150ml per 15 minutes on-course; keep fluid loss below 1% of body weight.
- O'Donnell, A., Dunne, D., Close, G. L. (2023). Nutrition, Hydration and Golf. Aspetar Sports Medicine Journal. 12. https://journal.aspetar.com/en/archive/volume-12-targeted-topic-sports-medicine-in-golf/nutrition-hydration-and-golf
- Berlin, N., Cooke, M. B., & Belski, R. (2023). Nutritional considerations for elite golf: A narrative review. Nutrients, 15(19), 4116.
- Smith, M. F., Newell, A. J., & Baker, M. R. (2012). Effect of acute mild dehydration on cognitive-motor performance in golf. Journal of Strength and Conditioning Research, 26(11), 3075-3080.
- Stevenson, W., Zabinsky, J. S., & Hedrick, V. E. (2019). Effects of Dehydration on Cognitive and Physical Performance in Female Golfers: A Randomized Crossover Pilot Study. J, 2(4), 496-507.

Post-round rehydration
- American College of Sports Medicine (2007). Exercise and fluid replacement. Med Sci Sports Exerc, 39(2), 377-90.
  Key finding: replace 1.5x fluid lost post-exercise. Confirms our 150% post-round rule.
- Maughan, R. J., et al. (2016). A randomized trial to assess the potential of different beverages to affect hydration status: development of a beverage hydration index. American Journal of Clinical Nutrition, 103(3).

Electrolytes and cognitive performance
- Stevenson, E. J., Hayes, P. R., & Allison, S. J. (2009). The effect of a carbohydrate-caffeine sports drink on simulated golf performance. Applied physiology, nutrition, and metabolism, 34(4), 681-688.
- Thompsett, D. J., Vento, K.A., Der Ananian, C., Hondula, D., Wardenaar, F. C. (2022). The effects of three different types of macronutrient feedings on golf performance and levels of fatigue and alertness. Nutrition and Health, 28(4), 509-14.
- Riebl, S. K., & Davy, B. M. (2013). The Hydration Equation: Update on Water Balance and Cognitive Performance. ACSM's health and fitness journal, 17(6), 21-28.
- Savoie, F. A., et al. (2015). Effect of Hypohydration on Muscle Endurance, Strength, Anaerobic Power and Capacity and Vertical Jumping Ability: A Meta-Analysis. Sports Medicine, 45(8), 1207-1227.

Hydration monitoring
- Gunawan, A., Brandon, D., Puspa, V., & Wiweko, B. (2018). Development of Urine Hydration System Based on Urine Color and Support Vector Machine. Procedia Computer Science, 135, 481-489.
- Magee, P. J., Gallagher, A. M., & McCormack, J. M. (2017). High prevalence of dehydration and inadequate nutritional knowledge among university and club level athletes. Int J Sport Nutr Exerc Metab, 27(2), 158-68.

Warm-up and performance context
- Goswami, C. L., Shepherd, A. J., Langdown, B. L., Knight, J. M., & Maguire, A. J. (2025). Acute Effects of Different Warm-Up Protocols on Junior Golfers' Drive Performance. International Journal of Strength and Conditioning, 5(1). https://doi.org/10.47206/ijsc.v5i1.343

Current state
Status: v1 shipped, 4 May 2026. Full flow live on Vercel: landing, 7-step quiz, email capture (Formspree), results page with checkpoint timeline and UTM CTA. Privacy Policy and Terms of Service links live. Back button working across all screens.

Outstanding placeholders for v2:
- Social proof number (currently hardcoded 2,400+) — confirm with Ross
- Sachet composition (real Na/K/Mg mg per sachet) — confirm with Ross
- Slider UX improvement on mobile
- Custom domain (plan.hydracaddie.com)
- Analytics (Meta Pixel, Google Analytics, cookie consent)
- Social media engagement dashboard (separate mini project)
How to work with this codebase
Running locally
npm run dev # starts the dev server at localhost:3000
Committing
After each working change, Andy should:

git add .

git commit -m "short description of what changed"

git push

Claude Code should suggest commit messages when appropriate.
Deploying
Vercel auto-deploys every push to main once the GitHub repo is connected to Vercel. No manual deploy step once set up.


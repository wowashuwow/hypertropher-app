# Hypertropher — Product Context for GTM

**Last updated:** June 2026
**Status:** App is live. GTM plan in progress.

---

## The Problem

Dedicated gym-goers who rely on outside food face a broken discovery experience:

- Dishes described as "high-protein" on delivery apps are often carb-heavy. There is no way to know until you order and eat.
- Finding good options involves expensive trial and error.
- Meal fatigue sets in from cycling through the same few "safe" dishes.
- When someone finds a great high-protein option, whether online or offline, that knowledge stays with them. There is no easy way to share it with their gym friends.

---

## The Product

**Hypertropher** is a community-built database of high-protein dishes, scoped to your city.

**How it works:**
1. You find a high-protein dish at a restaurant or on a food delivery app (Swiggy/Zomato if in India).
2. You log it: dish name, restaurant, price, protein source (chicken, paneer, eggs, etc.), and ratings for Taste, Protein Content, and Overall Satisfaction. Photo is optional.
3. Your invited friends in the same city see it on the feed and can filter by protein source or sort by price.
4. They can save dishes to a wishlist and navigate directly to the restaurant (there is a navigate using Google Maps button on each dish card) or copy the name of the dish and the restaurant for easily pasting in delivery apps.

**Key design decisions:**
- Invite-only. You need a valid invite code to sign up. On sign up, every user gets 3 codes of their own to share.
- Photos for dishes are not compulsory. You can log a dish from memory with zero friction. Having a decent number of trusted dishes on the app is priority number one.
- Ratings are: Protein Content, Taste, and Overall Satisfaction, each having a base rating of "assured", and "Overloaded", "Exceptional", and "Daily Fuel" ratings respectively, to mark outstanding dishes.
- The feed is city-scoped. Every dish shown is available where you are.
- The app is free.

**Additional product details:**
- Non-authenticated users can browse the feed without signing up. The landing page links directly to it ("Browse dishes →"). Anyone can see the database before requesting an invite. This is a deliberate low-friction discovery path.
- There is a live /guide page at hypertropher.com/guide that explains how the app works. It covers the city filter, the rating system, how to add dishes, and how to use the wishlist. Linked from the Account page after sign-up.
- Contributors have profile pictures visible on dish cards. This reinforces the trust mechanic: you can see a real person behind every dish entry.

**Live URL:** hypertropher.com
**Tech:** Next.js, Supabase, hosted on Vercel. Mobile-first, dark theme.

---

## Target User (Partially Defined — Needs Refinement in GTM Session)

**What we know:**
- Gym-goer with a consistent training routine.
- Dependent on outside food for most meals (cannot or does not cook regularly).
- Cares about protein intake, not just calories.
- Has been burned by misleading "high-protein" claims on delivery apps or menus.
- Lives in a city with food delivery apps. The app supports 50+ countries: India (Swiggy, Zomato), USA (Uber Eats, DoorDash, Grubhub, Postmates), UK (Uber Eats, Just Eat, Deliveroo), Canada, Australia, most of Europe, Southeast Asia (Grab, Foodpanda, Deliveroo), Latin America (Rappi, iFood, PedidosYa), and the Middle East (Noon, Careem, Talabat). The product is globally scoped by design.
- Founder is based in Pune, India. Geographic scope of GTM is not yet decided.

**What is TBD:**
- Age range and income level.
- Which gyms, fitness communities, or online groups they belong to.
- What kind of lifestyle they follow.
- What beliefs they have regarding fitness, food, and protein intake.
- Whether the primary user is the one who logs dishes or the one who discovers them.
- How to find and reach them beyond personal networks.

---

## Positioning and Messaging

**One-line description:** A community-built database of high-protein dishes your city's lifters actually trust.

**What makes it different from delivery apps (Zomato, Swiggy, Uber Eats, etc.):**
- Delivery apps show you what restaurants want to sell. Hypertropher shows you what other gym-goers have verified.
- Ratings are specific to what a lifter cares about. Protein content is rated explicitly.
- The source is traceable. You can see who added each dish and trust them because they were invited by someone you know.

**Key messages from the landing page (verified directly from code):**

H1: "Find trusted high protein meals in your city."

Subhead: "Hypertropher is a community-built database of the best high protein meals available in your city - in restaurants and on food delivery apps."

Tagline below hero: "For lifters who depend on outside food, by lifters who depend on outside food."

Pain grid headline: "Sound familiar?" with four pain cards:
- "Leaving gains on the table" — training hard but protein goals suffer outside the gym.
- "Money down the drain" — you order something marked high-protein, it arrives 75% pasta.
- "The same dish, everyday" — getting scammed enough times has taught you to stop exploring.
- "Your findings die with you" — you found the best grilled chicken ever, but nobody else knows about it.

Goal statement: "Wherever we are in the world, we lifters should always know what to eat. For every budget."

Value columns (four):
- "No more wasted workouts" — when you know it's high protein before you order, you know you're making gains.
- "No more scams" — each dish was added by someone who also lifts regularly and depends on outside food, so they know the stakes.
- "Eat something new" — filter by city, protein type, price, and choose based on taste, protein content, and satisfaction ratings.
- "Help others find the good stuff" — add dishes from any restaurant or delivery app. Photos not compulsory. Add from memory, right now.

Invite section: "Selective on purpose." with three entry criteria:
- "You lift consistently. Not occasionally."
- "You depend on outside food for most meals."
- "You'll add dishes. Not just scroll."
And the note: "The founder approves every member personally."

Trust mechanic copy: "You decide who else joins. Every member gets 3 invite codes. Pass them only to people who meet the same bar."

Final CTA section headline: "Be the first in your city." with the sub-copy: "Message the founder on LinkedIn. The template below is all you need."

LinkedIn invite message template (shown on landing page): "I lift regularly, depend on outside food, and I'll contribute." This is the exact message the landing page tells visitors to send. It is the primary acquisition copy.

Brand closing section: A large typographic section displaying "Hypertrophy." with its pronunciation and clinical definition: "The enlargement of skeletal muscle fibers through mechanical tension, metabolic stress, and muscle damage. Requires consistent training and adequate protein intake to sustain." This is a brand statement, not a product section.

---

## Brand Voice

Derived directly from the landing page copy. Important for Claude to match when writing LinkedIn posts, messaging, or any content.

- **Direct and assertive.** "You'll add dishes. Not just scroll." Not "we encourage contribution."
- **Fitness-native.** Uses "lifters", "gains", "protein goals", "hypertrophy". Not "health-conscious consumers."
- **Inclusive of the founder.** Uses "we lifters" — Ashutosh is part of the community he is building for.
- **Anti-marketing.** "No more scams." The product is positioned against the misleading language of restaurants and delivery apps.
- **Slightly exclusionary by design.** The selectivity is a feature, not a limitation. The copy leans into it.
- **No fluff.** Sentences are short. Pain is stated plainly. No hedging.

---

## Onboarding Experience (What New Users See First)

A four-step tour appears on first login. The steps tell you what the product considers important enough to explain upfront:

1. City filter: "You're seeing dishes from [your city]. To switch cities, go to Account Settings."
2. Rating system: Protein (Overloaded / Assured), Taste (Exceptional / Assured), Overall (Daily Fuel / Assured). Note: 🔥 = exceptional, ✅ = solid and reliable.
3. Contribution prompt: "Add dishes. Don't just browse. No photo needed. Add dishes you've already eaten, straight from memory. Takes 2 minutes."
4. Invite codes: "You have 3 invite codes. Use them on people who train seriously, eat out often, and will actually contribute. A bad invite lowers the bar for everyone."

The final onboarding step is the community standard in plain language. "A bad invite lowers the bar for everyone." This defines what kind of community this is meant to be.

---

## Empty State

When a city has no dishes yet, logged-in users see: "Try adjusting your filters or be the first to add a dish!"
Logged-out users see: "Contribute to Hypertropher."

This matters for GTM: if Ashutosh invites someone to a city with zero dishes, this is what they land on. The seeding strategy needs to account for this.

---

## Confirmed Channels

**LinkedIn (confirmed):**
Ashutosh wants to post on LinkedIn for two distinct angles:
1. Builder angle: showing what it looks like to build a real product with AI.
2. Founder/product angle: sharing Hypertropher as a solution for gym-goers.

The landing page "Request Invite" CTA currently points to a LinkedIn message template.

**Everything else is TBD.** No channel decisions have been made beyond LinkedIn.

---

## What a GTM Plan Needs (Framework for Brainstorm)

The following are the standard components of a GTM plan. Items marked as known are drawn from product documentation. Items marked as TBD need to be decided.

| Component | Status | Notes |
|---|---|---|
| Product definition | Known | See above |
| Problem statement | Known | See above |
| Positioning and messaging | Partially known | Landing page copy exists. Needs ICP refinement. |
| Ideal Customer Profile (ICP) | TBD | Partially defined above. Needs specifics. |
| Market sizing (TAM / SAM / SOM) | TBD | Gym-goers dependent on outside food. Size depends on geographic scope decision. |
| Competitive landscape | TBD | Who else is solving this? What do gym-goers use today? |
| Channel strategy | Partially known | LinkedIn confirmed. Rest is TBD. |
| Content strategy | TBD | What to post, how often, which formats, which platforms. |
| Community entry points | TBD | Which gyms, subreddits, WhatsApp groups, Instagram pages to target. |
| Seeding strategy | TBD | How to build the dish database before enough users exist to do it organically. |
| Launch sequencing | TBD | What happens first, second, third. |
| Success metrics (30/60/90 days) | Partially known | North Star is contribution rate. Specifics TBD. |
| Pricing model | Known | Free. No paid tier. |

---

## North Star Metric (from PRD)

**Contribution rate:** The percentage of active users who have added at least one dish.

This is the metric that determines whether the product is alive. A user who only browses without contributing does not grow the database.

Secondary metrics: total dishes added per month, DAU/MAU ratio.

---

## Roadmap (from hypertropher.com/roadmap — publicly accessible)

The roadmap page is live and public. It is a GTM asset: anyone considering joining can read it. It is also the clearest statement of the product vision.

Roadmap headline: "Where this is going." with the sub-copy: "Every invite is a deliberate choice. Here's where we're taking the product as those choices compound."

**Now (Live):** City-based feed, three ratings per dish, dish contribution, optional photos, invite-only access (3 codes per member).

**Soon:**
- **Tried it? Say so.:** Mark dishes you've actually eaten and trust. Shows on the card: "Ashutosh trusts this" or "Ashutosh's friend Rohan trusts this" depending on your filter.
- **Filter by your circle:** Filter the feed by who added or trusted a dish: direct friends, or expand to friends-of-friends.

**Later:**
- **Contributor profiles:** Every member gets a public profile showing their contributed and recommended dishes. A shareable link.
- **Dishes to avoid:** A companion list for dishes that are misleadingly labeled or consistently disappointing.

**Why only 3 invite codes (from roadmap):** "3 keeps it accountable. If you could invite 20 people, you'd invite people you sort of know. 3 means you only use a code on someone you'd genuinely vouch for."

**Roadmap CTA:** "The network is only as good as its early members."

**GTM implication:** The product trajectory is a trust-graph social feed, not just a database. Every feature on the roadmap deepens the social layer: from city-wide to friends-only to friends-of-friends. This shapes how the product should be positioned and what kind of early users actually matter.

---

## What Is Not Decided Yet

- Geographic scope: Pune only, all of India, a specific country, or global from day one. The product supports 50+ countries already. This is a strategic GTM decision, not a product constraint.
- Which communities or platforms to approach first.
- What the LinkedIn content calendar looks like.
- Whether there is a "seeding sprint" before inviting others (Ashutosh adds 50+ dishes himself first).
- What the 30-day success criterion is.
- Whether there is a "gym partnership" or "fitness influencer" angle.
- Whether the app ever goes fully public (non-invite) and when.

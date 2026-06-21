"use client"

import Link from "next/link"
import { MapPin, Star, PlusCircle, Users } from "lucide-react"
import { ROUTES } from "@/lib/constants"

function RatingPill({ label, emoji, level }: { label: string; emoji: string; level: "high" | "solid" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
      level === "high"
        ? "bg-primary/15 text-primary"
        : "bg-muted text-muted-foreground"
    }`}>
      {emoji} {label}
    </span>
  )
}

export function GuidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={ROUTES.app}
            className="font-extrabold uppercase tracking-tight text-foreground text-xl"
          >
            HYPERTROPHER
          </Link>
          <Link href={ROUTES.app} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            ← Back to feed
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-16">

        {/* Header */}
        <div>
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary mb-4">
            HOW IT WORKS
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            The guide.
          </h1>
          <p className="text-lg text-foreground/75 leading-relaxed">
            Everything you need to know to get the most out of Hypertropher.
          </p>
        </div>

        {/* Section 1: City filter */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={22} className="text-primary flex-shrink-0" />
            <h2 className="text-xl font-bold text-foreground">Your city filter</h2>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card space-y-4">
            <p className="text-foreground/75 leading-relaxed">
              When logged in, you only see dishes from the city in your profile. To see another city&apos;s dishes, update it in{" "}
              <Link href="/account" className="text-primary hover:text-primary/80 underline-offset-2 underline">
                Account Settings
              </Link>
              . The feed updates immediately.
            </p>
            <p className="text-sm text-muted-foreground">
              Browsing logged out? Use the city selector in the feed. You won&apos;t be able to add dishes or bookmark.
            </p>
          </div>
        </section>

        {/* Section 2: Ratings */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Star size={22} className="text-primary flex-shrink-0" />
            <h2 className="text-xl font-bold text-foreground">Ratings explained</h2>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card space-y-6">
            <div className="border border-primary/30 bg-primary/5 rounded-lg px-4 py-3 mb-5">
              <p className="text-sm font-semibold text-foreground mb-1">The bar is already high.</p>
              <p className="text-sm text-foreground/75">Only add dishes that are genuinely good. If you would not recommend it to a friend who trains, do not add it. Within that already-high bar, use the ratings to mark anything exceptional.</p>
            </div>

            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {[
                { dim: "Protein", highLabel: "Overloaded", highEmoji: "🔥", highDesc: "exceptional protein for this dish type", solidLabel: "Assured", solidEmoji: "✅", solidDesc: "great protein content, reliably good" },
                { dim: "Taste", highLabel: "Exceptional", highEmoji: "🔥", highDesc: "outstanding, memorable", solidLabel: "Assured", solidEmoji: "✅", solidDesc: "great taste, consistently good" },
                { dim: "Overall", highLabel: "Daily Fuel", highEmoji: "🔥", highDesc: "exceptional, you would make this a regular staple", solidLabel: "Assured", solidEmoji: "✅", solidDesc: "great overall, worth coming back to" },
              ].map(({ dim, highLabel, highEmoji, highDesc, solidLabel, solidEmoji, solidDesc }) => (
                <div key={dim} className="p-4 bg-card">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">{dim}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <RatingPill label={highLabel} emoji={highEmoji} level="high" />
                      <p className="text-xs text-foreground/60 mt-1">{highDesc}</p>
                    </div>
                    <div>
                      <RatingPill label={solidLabel} emoji={solidEmoji} level="solid" />
                      <p className="text-xs text-foreground/60 mt-1">{solidDesc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground pt-3">
              Not sure if a dish is good enough to add? If you have to wonder, it probably is not.
            </p>
          </div>
        </section>

        {/* Section 3: Contributing */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <PlusCircle size={22} className="text-primary flex-shrink-0" />
            <h2 className="text-xl font-bold text-foreground">Contributing</h2>
          </div>
          <div className="border border-border rounded-lg divide-y divide-border bg-card">
            <div className="p-5 space-y-1">
              <p className="text-sm font-semibold text-foreground">What to add</p>
              <p className="text-sm text-foreground/75">Any dish you&apos;ve actually eaten and can rate honestly. Photo optional. The list matters more than the image.</p>
            </div>
            <div className="p-5 space-y-1">
              <p className="text-sm font-semibold text-foreground">In-store vs online</p>
              <p className="text-sm text-foreground/75">Google Maps restaurants are tagged In-Store automatically. Cloud kitchens use manual entry. Tap &ldquo;Can&apos;t find it? Add as cloud kitchen.&rdquo;</p>
            </div>
            <div className="p-5 space-y-1">
              <p className="text-sm font-semibold text-foreground">Delivery apps</p>
              <p className="text-sm text-foreground/75">Auto-applied based on your city. If an app is not available at a restaurant, tap Report on the dish card. Two reports removes it.</p>
            </div>
            <div className="p-5 space-y-1">
              <p className="text-sm font-semibold text-foreground">Dishes to avoid</p>
              <p className="text-sm text-foreground/75">Coming soon. We will add the ability to flag dishes that are misleadingly labeled or consistently disappointing, so the community knows what to skip too.</p>
            </div>
            <div className="p-5">
              <Link href="/add-dish" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium">
                <PlusCircle size={15} />
                Go to Add Dish
              </Link>
            </div>
          </div>
        </section>

        {/* Section 4: Invites */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Users size={22} className="text-primary flex-shrink-0" />
            <h2 className="text-xl font-bold text-foreground">Your 3 invite codes</h2>
          </div>
          <div className="border border-border rounded-lg divide-y divide-border bg-card">
            <div className="p-5 space-y-1">
              <p className="text-sm font-semibold text-foreground">Who to invite</p>
              <p className="text-sm text-foreground/75">People who train seriously, eat out often, and will add dishes. Not just browse. If you&apos;re not sure, don&apos;t.</p>
            </div>
            <div className="p-5 space-y-1">
              <p className="text-sm font-semibold text-foreground">Why it matters</p>
              <p className="text-sm text-foreground/75">The people you bring in bring in their own 3. One bad invite brings in more like them. One good invite makes the whole network better.</p>
            </div>
            <div className="p-5">
              <Link href="/account" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium">
                <Users size={15} />
                View your invite codes
              </Link>
            </div>
          </div>
        </section>

        {/* App screenshots */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Quick visual tour</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "The feed", file: "feed.png" },
              { label: "A dish card", file: "dish-card.png" },
              { label: "Adding a dish", file: "add-dish.png" },
              { label: "Your invite codes", file: "account.png" },
            ].map(({ label, file }) => (
              <div key={file} className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="aspect-[9/16] sm:aspect-[9/14] relative bg-muted flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/screenshots/${file}`}
                    alt={label}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                      if (placeholder) placeholder.style.display = "flex"
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-muted-foreground text-sm">
                    Screenshot coming soon
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground px-3 py-2 border-t border-border">{label}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Banknote,
  Repeat2,
  Dumbbell,
  EyeOff,
  Compass,
  ShieldCheck,
  Users,
  Target,
  UtensilsCrossed,
  PenLine,
} from "lucide-react"
import { ROUTES, INVITE_LINKEDIN_URL } from "@/lib/constants"

export function LandingPage() {
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > window.innerHeight)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={ROUTES.landing}
            className="font-extrabold uppercase tracking-tight text-foreground text-xl"
          >
            HYPERTROPHER
          </Link>
          <Link
            href={ROUTES.app}
            className="text-base text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse dishes
          </Link>
        </div>
      </header>

      <main className="pb-24 md:pb-0">
        <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center min-h-[85vh] bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(255,51,51,0.12),transparent)]">
          <div className="animate-in fade-in duration-500 motion-reduce:animate-none flex flex-col items-center">
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary mb-6">
              INVITE ONLY
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-tight mb-6 max-w-3xl mx-auto">
              Find{" "}
              <span className="text-emerald-400">trusted</span>
              {" "}high protein meals in your city.
            </h1>
            <p className="text-lg sm:text-xl text-foreground/75 max-w-xl mx-auto mb-10 leading-relaxed">
              Hypertropher is a community-built database of the best high protein meals available in your city - in restaurants and on food delivery apps.
            </p>
            <Button
              asChild
              className="bg-primary text-white font-semibold px-8 py-3 rounded-md text-base hover:bg-primary/90 transition-colors"
            >
              <a
                href={INVITE_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Request an Invite
              </a>
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">
              Opens LinkedIn in a new tab. Send Ashutosh a message.
            </p>
            <div className="mt-6 flex items-center justify-center gap-5 text-sm">
              <Link
                href={ROUTES.signup}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Already have an invite code?
              </Link>
              <Link
                href={ROUTES.app}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse dishes →
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-6 border-b border-border">
          <p className="text-base text-muted-foreground text-center max-w-xl mx-auto">
            For lifters who depend on outside food, by lifters who depend on outside food.
          </p>
        </section>

        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              Sound familiar?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card border-l-2 border-primary rounded-md p-5">
                <Dumbbell size={22} className="text-primary mb-3" aria-hidden />
                <p className="text-base font-bold text-foreground mb-2">
                  Leaving gains on the table
                </p>
                <p className="text-base text-foreground/75 leading-relaxed">
                  You're training hard, but if you can't hit your protein goals outside the gym, you're leaving results on the table.
                </p>
              </div>

              <div className="bg-card border-l-2 border-primary rounded-md p-5">
                <Banknote size={22} className="text-primary mb-3" aria-hidden />
                <p className="text-base font-bold text-foreground mb-2">
                  Money down the drain
                </p>
                <p className="text-base text-foreground/75 leading-relaxed">
                  You order something marked high-protein. It arrives 75% pasta.
                </p>
              </div>

              <div className="bg-card border-l-2 border-primary rounded-md p-5">
                <Repeat2 size={22} className="text-primary mb-3" aria-hidden />
                <p className="text-base font-bold text-foreground mb-2">
                  The same dish, everyday
                </p>
                <p className="text-base text-foreground/75 leading-relaxed">
                  Getting scammed enough times has taught you to stop exploring. So you eat the same thing every single day.
                </p>
              </div>

              <div className="bg-card border-l-2 border-primary rounded-md p-5">
                <EyeOff size={22} className="text-primary mb-3" aria-hidden />
                <p className="text-base font-bold text-foreground mb-2">
                  Your findings die with you
                </p>
                <p className="text-base text-foreground/75 leading-relaxed">
                  You found the best grilled chicken ever. Took you three
                  bad orders to get there, but nobody else knows about it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 border-t border-border">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl sm:text-3xl font-bold text-foreground leading-snug">
              Wherever we are in the world, we lifters should always know what to eat.
              For every budget.
            </p>
          </div>
        </section>

        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Target size={28} className="text-primary mb-4" aria-hidden />
              <p className="text-lg font-bold text-foreground mb-2">
                No more wasted workouts
              </p>
              <p className="text-base text-foreground/75 leading-relaxed">
                When you know it's high protein before you order, you know you're making gains.
              </p>
            </div>

            <div>
              <ShieldCheck size={28} className="text-primary mb-4" aria-hidden />
              <p className="text-lg font-bold text-foreground mb-2">No more scams</p>
              <p className="text-base text-foreground/75 leading-relaxed">
                Each dish was added by someone who also lifts regularly
                and depends on outside food, so they know the stakes.
              </p>
            </div>

            <div>
              <Compass size={28} className="text-primary mb-4" aria-hidden />
              <p className="text-lg font-bold text-foreground mb-2">
                Eat something new
              </p>
              <p className="text-base text-foreground/75 leading-relaxed">
                Filter by city, protein type, price, and choose based on taste, protein content, and satisfaction ratings.
              </p>
            </div>

            <div>
              <Users size={28} className="text-primary mb-4" aria-hidden />
              <p className="text-lg font-bold text-foreground mb-2">
                Help others find the good stuff
              </p>
              <p className="text-base text-foreground/75 leading-relaxed">
                Add dishes from any restaurant or delivery app. Photos not compulsory. Add from memory, right now.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Selective on purpose.
            </h2>
            <p className="text-lg text-foreground/75 max-w-xl mx-auto mb-12">
              Hypertropher is invite-only. The founder approves every member
              personally. Three things get you in.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Dumbbell size={28} className="text-primary mx-auto mb-3" aria-hidden />
                <p className="text-base font-bold text-foreground leading-snug">
                  You lift consistently. Not occasionally.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <UtensilsCrossed
                  size={28}
                  className="text-primary mx-auto mb-3"
                  aria-hidden
                />
                <p className="text-base font-bold text-foreground leading-snug">
                  You depend on outside food for most meals.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <PenLine size={28} className="text-primary mx-auto mb-3" aria-hidden />
                <p className="text-base font-bold text-foreground leading-snug">
                  You&apos;ll add dishes. Not just scroll.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 max-w-sm mx-auto text-center">
              <p className="text-xl font-bold text-foreground mb-3">
                You decide who else joins.
              </p>
              <p className="text-base text-foreground/75">
                Every member gets 3 invite codes. Pass them only to people who
                meet the same bar.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 border-t border-border text-center">
          <span className="block text-sm font-semibold uppercase tracking-widest text-primary mb-4">
            READY TO JOIN
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Be the first in your city.
          </h2>
          <p className="text-lg text-foreground/75 max-w-sm mx-auto mb-8">
            Message the founder on LinkedIn. The template below is all you need.
          </p>

          <div className="bg-card border border-border rounded-md px-5 py-4 max-w-sm mx-auto mb-10 text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
              What to say
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              &ldquo;I lift regularly, depend on outside food, and I&apos;ll
              contribute.&rdquo;
            </p>
          </div>

          <Button
            asChild
            className="bg-primary text-white font-semibold px-8 py-3 rounded-md text-base hover:bg-primary/90 transition-colors"
          >
            <a
              href={INVITE_LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Request an Invite
            </a>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground block">
            Opens LinkedIn in a new tab. Send Ashutosh a message.
          </p>
          <p className="mt-5 text-sm text-foreground/60 max-w-xs mx-auto">
            Already eaten somewhere great? Add it right now from memory. Photos are optional. Don&apos;t put off joining because of this.
          </p>
          <div className="mt-6 flex items-center justify-center gap-5 text-sm">
            <Link
              href={ROUTES.signup}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Already have an invite code?
            </Link>
            <Link
              href={ROUTES.app}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse dishes →
            </Link>
          </div>
        </section>

        <section className="px-6 py-24 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-foreground uppercase mb-8 break-words">
              Hypertrophy.
            </h2>
            <p className="text-base text-muted-foreground font-mono mb-6">
              /ˌhaɪpərˈtrōfē/ &nbsp; noun
            </p>
            <p className="text-xl sm:text-2xl text-foreground/75 leading-relaxed max-w-2xl">
              The enlargement of skeletal muscle fibers through mechanical tension, metabolic stress, and muscle damage. Requires consistent training and adequate protein intake to sustain.
            </p>
          </div>
        </section>
      </main>

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-border md:hidden transition-opacity duration-300 ${
          showSticky ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showSticky}
      >
        <Button
          asChild
          className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-md text-sm text-center hover:bg-primary/90 transition-colors"
        >
          <a
            href={INVITE_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Request an Invite
          </a>
        </Button>
        <Link
          href={ROUTES.app}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Browse dishes
        </Link>
      </div>
    </div>
  )
}

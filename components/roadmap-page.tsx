"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, GitBranch, Shield, ArrowRight, CheckCircle2, Clock } from "lucide-react"
import { ROUTES, INVITE_LINKEDIN_URL } from "@/lib/constants"

export function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={ROUTES.landing}
            className="font-extrabold uppercase tracking-tight text-foreground text-xl"
          >
            HYPERTROPHER
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href={ROUTES.app} className="text-muted-foreground hover:text-foreground transition-colors">
              Browse dishes
            </Link>
            <Link href={ROUTES.about} className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-16">
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary mb-4">
            ROADMAP
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6">
            Where this is going.
          </h1>
          <p className="text-lg text-foreground/75 leading-relaxed">
            Every invite is a deliberate choice. Here&apos;s where we&apos;re taking the product as those choices compound.
          </p>
        </div>

        {/* Now */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
            <h2 className="text-base font-bold text-foreground uppercase tracking-wide">Now</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">Live</span>
          </div>
          <div className="border border-border rounded-lg divide-y divide-border bg-card">
            {[
              { title: "City-based feed", desc: "You see dishes from your city only. Switch anytime from Account Settings." },
              { title: "Three ratings per dish", desc: "Protein, taste, and overall satisfaction. Two clear levels each. No star scores." },
              { title: "Contribute dishes", desc: "Add from any restaurant or delivery app. Google Maps for in-store, manual entry for cloud kitchens." },
              { title: "Photos optional", desc: "You don't need a photo to add a dish. Add from memory, right now. Building the list matters more than having perfect images for every entry." },
              { title: "Invite-only access", desc: "3 codes per member. You vouch for who you bring in." },
            ].map(({ title, desc }) => (
              <div key={title} className="px-5 py-4">
                <p className="font-semibold text-foreground text-sm mb-0.5">{title}</p>
                <p className="text-sm text-foreground/75">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Soon */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={18} className="text-muted-foreground flex-shrink-0" />
            <h2 className="text-base font-bold text-foreground uppercase tracking-wide">Soon</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Coming next</span>
          </div>
          <div className="border border-border rounded-lg divide-y divide-border bg-card">
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <Users size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm mb-0.5">Friends-only mode</p>
                  <p className="text-sm text-foreground/75">Filter the feed to show only dishes added by your direct connections. Smaller circle, higher trust.</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <GitBranch size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm mb-0.5">Friends-of-friends discovery</p>
                  <p className="text-sm text-foreground/75">See dishes from people your friends vouched for. One step beyond your direct connections. Still trusted, wider reach.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Later */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={18} className="text-muted-foreground/50 flex-shrink-0" />
            <h2 className="text-base font-bold text-foreground uppercase tracking-wide">Later</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Planned</span>
          </div>
          <div className="border border-border rounded-lg divide-y divide-border bg-card">
            <div className="px-5 py-4">
              <p className="font-semibold text-foreground text-sm mb-0.5">Social proof from real relationships</p>
              <p className="text-sm text-foreground/75">&ldquo;3 of your friends added this dish&rdquo; means something when you actually know those 3 people. Dish cards will show who in your network has tried it and how they rated it.</p>
            </div>
            <div className="px-5 py-4">
              <p className="font-semibold text-foreground text-sm mb-0.5">Dishes to avoid</p>
              <p className="text-sm text-foreground/75">Right now we only curate great dishes. We will add a companion list for dishes that are misleadingly labeled or consistently disappointing. Know what to order and what to skip.</p>
            </div>
          </div>
        </section>

        {/* Why 3 invites */}
        <section className="mb-16">
          <div className="border-l-2 border-primary pl-5">
            <Shield size={18} className="text-primary mb-2" />
            <h2 className="text-sm font-bold text-foreground mb-2">Why only 3 invites?</h2>
            <p className="text-sm text-foreground/75 leading-relaxed">
              3 keeps it accountable. If you could invite 20 people, you&apos;d invite people you sort of know. 3 means you only use a code on someone you&apos;d genuinely vouch for.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border pt-10 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Get in early.</h2>
          <p className="text-foreground/75 mb-8 max-w-xs mx-auto text-sm">
            The network is only as good as its early members. Request an invite or share your code with someone who belongs here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="bg-primary text-white font-semibold px-8 py-3 rounded-md hover:bg-primary/90 transition-colors">
              <a href={INVITE_LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                Request an Invite
              </a>
            </Button>
            <Link href={ROUTES.app} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Browse dishes →
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}

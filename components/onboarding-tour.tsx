"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, MapPin, Star, PlusCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ROUTES } from "@/lib/constants"

const TOUR_KEY = "ht_tour_done"

interface Step {
  icon: React.ReactNode
  title: string
  body: React.ReactNode
}

interface OnboardingTourProps {
  city?: string
}

export function OnboardingTour({ city = "your city" }: OnboardingTourProps) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      if (!localStorage.getItem(TOUR_KEY)) {
        setVisible(true)
      }
    } catch {
      // localStorage unavailable, skip tour silently
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(TOUR_KEY, "1")
    } catch {
      // ignore
    }
    setVisible(false)
  }

  const steps: Step[] = [
    {
      icon: <MapPin size={28} className="text-primary" />,
      title: "You're seeing dishes from " + city,
      body: (
        <p className="text-foreground/75 leading-relaxed text-sm">
          You only see dishes from your city. To switch cities, go to{" "}
          <Link href="/account" onClick={dismiss} className="text-primary underline underline-offset-2">
            Account Settings
          </Link>
          .
        </p>
      ),
    },
    {
      icon: <Star size={28} className="text-primary" />,
      title: "Three ratings per dish",
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between border border-border rounded-md px-3 py-2 bg-background">
            <span className="font-medium text-foreground">Protein</span>
            <span className="text-foreground/75">Overloaded 🔥 &nbsp;/&nbsp; Assured ✅</span>
          </div>
          <div className="flex items-center justify-between border border-border rounded-md px-3 py-2 bg-background">
            <span className="font-medium text-foreground">Taste</span>
            <span className="text-foreground/75">Exceptional 🔥 &nbsp;/&nbsp; Assured ✅</span>
          </div>
          <div className="flex items-center justify-between border border-border rounded-md px-3 py-2 bg-background">
            <span className="font-medium text-foreground">Overall</span>
            <span className="text-foreground/75">Daily Fuel 🔥 &nbsp;/&nbsp; Assured ✅</span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">🔥 = exceptional &nbsp;·&nbsp; ✅ = solid and reliable</p>
        </div>
      ),
    },
    {
      icon: <PlusCircle size={28} className="text-primary" />,
      title: "Add dishes. Don't just browse.",
      body: (
        <p className="text-foreground/75 leading-relaxed text-sm">
          When you eat something worth sharing, add it. Takes 2 minutes and saves the next person from ordering blind.
          Tap <span className="font-semibold text-foreground">+ Add Dish</span> in the header.
        </p>
      ),
    },
    {
      icon: <Users size={28} className="text-primary" />,
      title: "You have 3 invite codes",
      body: (
        <p className="text-foreground/75 leading-relaxed text-sm">
          Use them on people who train seriously, eat out often, and will actually contribute.
          A bad invite lowers the bar for everyone.{" "}
          <Link href={ROUTES.guide} onClick={dismiss} className="text-primary underline underline-offset-2">
            Read the full guide →
          </Link>
        </p>
      ),
    },
  ]

  if (!visible) return null

  const current = steps[step]
  const isLast = step === steps.length - 1
  const isFirst = step === 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          {/* Step dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-5 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
            aria-label="Close tour"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 min-h-[200px]">
          <div className="mb-4">{current.icon}</div>
          <h2 className="text-lg font-bold text-foreground mb-3">{current.title}</h2>
          {current.body}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-5 gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(s => s - 1)}
            disabled={isFirst}
            className="text-muted-foreground"
          >
            <ChevronLeft size={16} />
            Back
          </Button>

          {isLast ? (
            <Button size="sm" onClick={dismiss} className="flex-1">
              Done
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep(s => s + 1)} className="flex-1">
              Next
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

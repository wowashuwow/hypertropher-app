"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bookmark, PlusCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Discover",
    },
    {
      href: "/add-dish",
      icon: PlusCircle,
      label: "Add Dish",
    },
    {
      href: "/my-wishlist",
      icon: Bookmark,
      label: "My Wishlist",
    },
    {
      href: "/my-dishes",
      icon: User,
      label: "My Dishes",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border lg:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-4 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

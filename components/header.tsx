"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  isLoggedIn?: boolean
}

export function Header({ isLoggedIn = false }: HeaderProps) {
  return (
    <header className="w-full py-4 px-6 border-b border-border bg-card">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/App Name */}
        <Link href="/" className="text-3xl sm:text-2xl font-extrabold text-foreground uppercase">
          HYPERTROPHER
        </Link>

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/" className="text-primary hover:text-primary/80 font-medium">
              Discover
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/my-wishlist" className="text-primary hover:text-primary/80 font-medium">
                  My Wishlist
                </Link>
                <Link href="/my-dishes" className="text-primary hover:text-primary/80 font-medium">
                  My Dishes
                </Link>
                <Link href="/add-dish">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Add Dish
                  </Button>
                </Link>
              </>
            )}
          </div>
          {isLoggedIn ? (
            <Link href="/account">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button size="sm">Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

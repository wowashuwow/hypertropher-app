"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useGooglePlaces, CityResult } from "@/lib/hooks/use-google-places"

interface CitySearchInputProps {
  value: string
  onChange: (city: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CitySearchInput({
  value,
  onChange,
  placeholder = "Search for a city...",
  disabled = false,
  className
}: CitySearchInputProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<CityResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [selected, setSelected] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { searchCities } = useGooglePlaces({})

  // Handle search with debouncing
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      setSelected(false)
      return
    }

    // Don't re-open dropdown if a city was just selected
    if (selected) {
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await searchCities(query)
        setSuggestions(results)
        setIsOpen(results.length > 0 && hasUserInteracted)
      } catch (error) {
        console.error('Error searching cities:', error)
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query, hasUserInteracted, selected]) // Added selected to dependencies

  // Sync internal query state with external value prop
  useEffect(() => {
    if (value !== query) {
      setQuery(value)
    }
  }, [value]) // Only depend on value to prevent infinite loops

  const handleCitySelect = (city: CityResult) => {
    setQuery(city.city_country) // Store city, country format
    onChange(city.city_country)
    setIsOpen(false)
    setSelected(true) // Mark that a city was just selected
    setSuggestions([]) // Clear suggestions to prevent re-opening
    setHasUserInteracted(false) // Reset interaction state
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setHasUserInteracted(true) // Mark as user interaction
    setSelected(false) // Reset selected state when user starts typing
    
    // Don't update parent state on input changes - only on valid selection
    // Clearing input by backspace should not trigger backend update
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10"
          onFocus={() => {
            // Select all text when input is focused for easy replacement
            inputRef.current?.select()
            
            if (suggestions.length > 0 && hasUserInteracted) {
              setIsOpen(true)
            }
          }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((city, index) => (
            <button
              key={city.place_id}
              type="button"
              onClick={() => handleCitySelect(city)}
              className="w-full px-4 py-3 text-left hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{city.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {city.city_country}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

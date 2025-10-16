"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface InlineCitySelectorProps {
  selectedCity: string
  onCityChange: (city: string) => void
  cities: Array<{ city: string; dishCount: number }>
  onBeFirstClick: () => void
  className?: string
}

export function InlineCitySelector({
  selectedCity,
  onCityChange,
  cities,
  onBeFirstClick,
  className
}: InlineCitySelectorProps) {
  const selectedCityData = cities.find(c => c.city === selectedCity)
  const dishCount = selectedCityData?.dishCount || 0

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2", className)}>
      <span className="text-xl text-muted-foreground">Discover high-protein meals in </span>
      <Select value={selectedCity} onValueChange={onCityChange}>
        <SelectTrigger className="inline-flex h-auto px-3 py-2 sm:py-1.5 text-lg sm:text-xl font-medium text-foreground bg-card border border-border rounded-lg shadow-sm hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-0 w-full sm:w-auto">
          <SelectValue>
            <div className="flex items-center gap-3">
              <span className="text-lg sm:text-xl font-medium">{selectedCity}</span>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md whitespace-nowrap">
                {dishCount} dishes
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-80">
          {cities.map((city) => (
            <SelectItem key={city.city} value={city.city} className="cursor-pointer">
              <div className="flex items-center gap-3 w-full">
                <span className="font-medium">{city.city}</span>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {city.dishCount} dishes
                </span>
              </div>
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem 
            value="be-first" 
            className="cursor-pointer text-primary font-medium hover:bg-primary/10"
            onSelect={onBeFirstClick}
          >
            Can't find your city?
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

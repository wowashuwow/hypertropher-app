"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { getDeliveryAppLogo } from "@/lib/delivery-apps"

interface DeliveryAppPillsProps {
  availableApps: string[]
  selectedApps: string[]
  onSelectionChange: (selectedApps: string[]) => void
  disabled?: boolean
  className?: string
}

export function DeliveryAppPills({
  availableApps,
  selectedApps,
  onSelectionChange,
  disabled = false,
  className
}: DeliveryAppPillsProps) {
  const handleAppToggle = (app: string) => {
    if (disabled) return
    
    const newSelection = selectedApps.includes(app)
      ? selectedApps.filter(selected => selected !== app)
      : [...selectedApps, app]
    
    onSelectionChange(newSelection)
  }

  if (!availableApps.length) {
    return (
      <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted">
        No delivery apps available for this location
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {availableApps.map((app) => (
        <Button
          key={app}
          type="button"
          variant={selectedApps.includes(app) ? "default" : "outline"}
          size="sm"
          onClick={() => handleAppToggle(app)}
          disabled={disabled}
          className="flex-1 min-w-fit text-xs sm:text-sm flex items-center gap-2"
        >
          <img 
            src={getDeliveryAppLogo(app)} 
            alt={`${app} logo`}
            className="w-4 h-4"
          />
          {app}
        </Button>
      ))}
    </div>
  )
}

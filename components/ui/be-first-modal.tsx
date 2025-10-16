"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, BicepsFlexed, BookHeart, Handshake, HandHelping } from "lucide-react"

interface BeFirstModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCity: string
}

export function BeFirstModal({ isOpen, onClose, selectedCity }: BeFirstModalProps) {
  const handleRequestInvite = () => {
    onClose()
    window.location.href = '/signup'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            It starts with you!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Help us build <em>the ultimate</em> list of high-protein dishes available in your city.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <BicepsFlexed className="h-4 w-4 text-primary" />
              Be a hero!
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <BookHeart className="h-4 w-4 text-muted-foreground" />
                Build your own "High-Protein Diary"
              </li>
              <li className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-muted-foreground" />
                Share it with your friends and the world
              </li>
              <li className="flex items-center gap-2">
                <HandHelping className="h-4 w-4 text-muted-foreground" />
                Help people like you save time and money
              </li>
            </ul>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={handleRequestInvite} className="flex-1">
              Request Invite Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

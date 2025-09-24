"use client"

import { useState } from "react"
import { Search, Upload } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddDishPage() {
  const [sourceType, setSourceType] = useState<"In-Restaurant" | "Online">("In-Restaurant")
  const [deliveryApp, setDeliveryApp] = useState("")
  const [dishLink, setDishLink] = useState("")
  const [restaurant, setRestaurant] = useState("")
  const [dishName, setDishName] = useState("")
  const [proteinSource, setProteinSource] = useState<
    "Chicken" | "Fish" | "Paneer" | "Tofu" | "Eggs" | "Mutton" | "Other" | ""
  >("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [taste, setTaste] = useState<"🤤 Amazing" | "👍 Great" | "">("")
  const [protein, setProtein] = useState<"💪 Overloaded" | "👍 Great" | "">("")
  const [price, setPrice] = useState("")
  const [comment, setComment] = useState("")
  const [satisfaction, setSatisfaction] = useState<"🤩 Would Eat Everyday" | "👍 Great" | "">("")
  const [isLoading, setIsLoading] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Submitting dish:", {
      sourceType,
      restaurant: sourceType === "In-Restaurant" ? restaurant : undefined,
      deliveryApp: sourceType === "Online" ? deliveryApp : undefined,
      dishLink: sourceType === "Online" ? dishLink : undefined,
      dishName,
      proteinSource,
      photo: photo?.name,
      taste,
      protein,
      price,
      comment,
      satisfaction,
    })

    setIsLoading(false)

    // Reset form
    setSourceType("In-Restaurant")
    setDeliveryApp("")
    setDishLink("")
    setRestaurant("")
    setDishName("")
    setProteinSource("")
    setPhoto(null)
    setTaste("")
    setProtein("")
    setPrice("")
    setComment("")
    setSatisfaction("")
  }

  const ButtonGroup = ({
    options,
    value,
    onChange,
    name,
  }: {
    options: string[]
    value: string
    onChange: (value: string) => void
    name: string
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant={value === option ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option)}
          className="flex-1 min-w-0 text-xs sm:text-sm whitespace-nowrap"
        >
          {option}
        </Button>
      ))}
    </div>
  )

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8 px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add a Dish You Found</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Source Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={sourceType === "In-Restaurant" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType("In-Restaurant")}
                    className="flex-1"
                  >
                    In-Restaurant
                  </Button>
                  <Button
                    type="button"
                    variant={sourceType === "Online" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType("Online")}
                    className="flex-1"
                  >
                    Online
                  </Button>
                </div>
              </div>

              {sourceType === "In-Restaurant" ? (
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Restaurant</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="restaurant"
                      type="text"
                      placeholder="Search for Restaurant"
                      value={restaurant}
                      onChange={(e) => setRestaurant(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryApp">Delivery App</Label>
                    <Select value={deliveryApp} onValueChange={setDeliveryApp} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery app" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Swiggy">Swiggy</SelectItem>
                        <SelectItem value="Zomato">Zomato</SelectItem>
                        <SelectItem value="Uber Eats">Uber Eats</SelectItem>
                        <SelectItem value="DoorDash">DoorDash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dishLink">Paste Link to Dish</Label>
                    <Input
                      id="dishLink"
                      type="url"
                      placeholder="https://..."
                      value={dishLink}
                      onChange={(e) => setDishLink(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="dishName">Dish Name</Label>
                <Input
                  id="dishName"
                  type="text"
                  placeholder="Enter dish name"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Protein Source *</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "🐔 Chicken", value: "Chicken" },
                    { label: "🐟 Fish", value: "Fish" },
                    { label: "🧀 Paneer", value: "Paneer" },
                    { label: "🥩 Tofu", value: "Tofu" },
                    { label: "🥚 Eggs", value: "Eggs" },
                    { label: "🐑 Mutton", value: "Mutton" },
                    { label: "🍽️ Other", value: "Other" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={proteinSource === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProteinSource(option.value as typeof proteinSource)}
                      className="flex-1 min-w-fit text-xs sm:text-sm"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <label htmlFor="photo" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{photo ? photo.name : "Click to upload photo"}</p>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Taste</Label>
                  <ButtonGroup
                    options={["🤤 Amazing", "👍 Great"]}
                    value={taste}
                    onChange={(value) => setTaste(value as typeof taste)}
                    name="taste"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Protein Content</Label>
                  <ButtonGroup
                    options={["💪 Overloaded", "👍 Great"]}
                    value={protein}
                    onChange={(value) => setProtein(value as typeof protein)}
                    name="protein"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="text"
                    placeholder="Enter exact price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Overall Satisfaction</Label>
                  <ButtonGroup
                    options={["🤩 Would Eat Everyday", "👍 Great"]}
                    value={satisfaction}
                    onChange={(value) => setSatisfaction(value as typeof satisfaction)}
                    name="satisfaction"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Comments (Optional)</Label>
                  <textarea
                    id="comment"
                    placeholder="e.g., A bit spicy, but great portion size!"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !proteinSource || !price}>
                {isLoading ? "Submitting..." : "Submit Dish"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

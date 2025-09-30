import { MainLayout } from "@/components/main-layout"

export default function Loading() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8 px-6">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading dish...</p>
        </div>
      </div>
    </MainLayout>
  )
}

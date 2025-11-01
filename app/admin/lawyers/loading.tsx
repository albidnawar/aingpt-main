import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LawyersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 bg-muted rounded-lg w-48 animate-pulse" />
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

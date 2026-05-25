import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function WordOfDaySkeleton({ hero }: { hero?: boolean } = {}) {
  if (hero) {
    return (
      <div>
        <Skeleton className="h-20 sm:h-28 lg:h-36 w-48 sm:w-80 mb-4" />
        <Skeleton className="h-7 w-44 mb-4" />
        <Skeleton className="h-4 w-full max-w-md mb-2" />
        <Skeleton className="h-4 w-3/4 max-w-md mb-6" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  return (
    <Card className="glass rounded-2xl border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="border-t border-border pt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}

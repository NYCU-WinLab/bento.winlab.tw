import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function UserProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-20" />
      </CardContent>
    </Card>
  )
}


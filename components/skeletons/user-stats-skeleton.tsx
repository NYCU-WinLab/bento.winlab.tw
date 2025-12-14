import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function UserStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>個人統計</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">參與訂單數</p>
            <Skeleton className="h-8 w-16" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">總計消費</p>
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">最常吃的品項</h3>
            <ul className="space-y-1">
              {[1, 2, 3].map((i) => (
                <li key={i} className="text-sm">
                  <Skeleton className="h-4 w-48" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">最常吃的店</h3>
            <ul className="space-y-1">
              {[1, 2, 3].map((i) => (
                <li key={i} className="text-sm">
                  <Skeleton className="h-4 w-48" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


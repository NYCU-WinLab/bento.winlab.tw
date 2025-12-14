import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

export function OrderDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">總覽</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">品項總計</p>
            <Skeleton className="h-8 w-12" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">金額總計</p>
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">訂單項目</h2>
          <Skeleton className="h-10 w-24" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>品項</TableHead>
              <TableHead>不醬</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


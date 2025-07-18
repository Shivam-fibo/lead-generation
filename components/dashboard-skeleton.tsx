import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[300px] mt-4" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[120px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-[150px] mb-2" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[150px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-[150px] mb-2" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

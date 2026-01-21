import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function MyTeamSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-6 space-y-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* --- HEADER SKELETON --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/50">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Icon placeholder */}
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                {/* Title */}
                <Skeleton className="h-8 w-40" />
                {/* Subtitle */}
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
          {/* Team count badge */}
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>

        {/* --- TEAM CARDS SKELETON --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="overflow-hidden border-l-4 border-l-blue-500/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    {/* Team name */}
                    <Skeleton className="h-6 w-3/4" />
                    {/* Team code */}
                    <Skeleton className="h-4 w-20" />
                  </div>
                  {/* Leader badge */}
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Role badge */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="text-center p-2 bg-muted/30 rounded-lg"
                    >
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  ))}
                </div>

                {/* Leader info */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>

                {/* View details button */}
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

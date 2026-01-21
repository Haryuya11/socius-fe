import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UrgentTasksSkeleton() {
  return (
    <Card className="shadow-sm flex flex-col border-border/60 h-full">
      <CardHeader>
        <Skeleton className="h-6 w-[120px] mb-2" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent className="flex-1 pb-2 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 border rounded-lg bg-card"
          >
            <div className="space-y-2 w-full">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
        ))}
      </CardContent>
      <div className="p-4 pt-2 border-t">
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  );
}

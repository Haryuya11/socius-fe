import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { shimmer } from "@/lib/skeleton";
import { cn } from "@/lib/utils";

export function EmployeeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 border-border/50">
          <div className="flex gap-3 mb-4">
            <Skeleton className={cn("h-14 w-14 rounded-full", shimmer)} />
            <div className="flex-1 space-y-2">
              <Skeleton className={cn("h-4 w-3/4", shimmer)} />
              <Skeleton className={cn("h-3 w-1/2", shimmer)} />
              <Skeleton className={cn("h-5 w-16 rounded-full", shimmer)} />
            </div>
          </div>

          <Skeleton className={cn("h-4 w-24 mb-2", shimmer)} />
          <Skeleton className={cn("h-6 w-32 mb-4", shimmer)} />

          <Skeleton className={cn("h-8 w-full", shimmer)} />
        </Card>
      ))}
    </div>
  );
}

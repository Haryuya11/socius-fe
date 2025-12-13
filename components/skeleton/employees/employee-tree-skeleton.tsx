import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { shimmer } from "@/lib/skeleton";
import { cn } from "@/lib/utils";

export function EmployeeTreeSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6 border-l-4 border-l-primary/30">
          <div className="flex gap-4 mb-6">
            <Skeleton className={cn("h-16 w-16 rounded-full", shimmer)} />
            <div className="flex-1 space-y-2">
              <Skeleton className={cn("h-5 w-48", shimmer)} />
              <Skeleton className={cn("h-4 w-64", shimmer)} />
              <Skeleton className={cn("h-4 w-32", shimmer)} />
            </div>
          </div>

          <div className="space-y-3 pl-6 border-l border-primary/20">
            <Skeleton className={cn("h-10 w-3/4", shimmer)} />
            <Skeleton className={cn("h-10 w-2/3", shimmer)} />
          </div>
        </Card>
      ))}
    </div>
  );
}

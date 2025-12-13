import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { shimmer } from "@/lib/skeleton";
import { cn } from "@/lib/utils";

export function EmployeesToolbarSkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1">
            <Skeleton className={cn("h-10 w-full sm:w-64", shimmer)} />
            <Skeleton className={cn("h-10 w-24", shimmer)} />
          </div>
          <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className={cn("h-8 w-8 rounded-md", shimmer)} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

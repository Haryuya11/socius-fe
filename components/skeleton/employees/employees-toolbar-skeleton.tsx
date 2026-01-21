import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EmployeesToolbarSkeleton() {
  return (
    <Card className="shadow-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            {/* Search Input */}
            <Skeleton className="h-10 w-full sm:w-64" />
            {/* Filter Button */}
            <Skeleton className="h-10 w-24" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

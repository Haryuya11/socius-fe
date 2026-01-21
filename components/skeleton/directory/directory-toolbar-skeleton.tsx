import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function DirectoryToolbarSkeleton() {
  return (
    <Card className="shadow-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <Skeleton className="h-10 w-full sm:max-w-xs" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

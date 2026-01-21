import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function DirectoryTableSkeleton() {
  return (
    <Card className="shadow-sm border-border/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b bg-muted/30 p-4">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

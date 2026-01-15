import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamTreeSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6 border-l-4 border-l-primary/20">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="pl-6 space-y-2 border-l border-border/50">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

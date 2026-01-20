import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DepartmentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Card key={i} className="flex flex-col border-border/60">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-6 w-3/4 mt-3" />
          </CardHeader>
          <CardContent className="space-y-2.5 flex-1">
            <Skeleton className="h-8 w-full rounded-md" />
          </CardContent>
          <CardFooter className="pt-2">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

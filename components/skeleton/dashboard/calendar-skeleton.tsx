import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CalendarSkeleton() {
  return (
    <Card className="w-full h-fit shadow-sm border-border/60 flex flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-[150px]" />
      </CardHeader>
      <CardContent className="px-4 pb-2 flex justify-center">
        <div className="border-b border-border/50 pb-4 w-full flex justify-center">
          <Skeleton className="h-[300px] w-[300px] rounded-md" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 px-4 pt-4 pb-4 bg-muted/10 flex-1">
        <div className="flex w-full justify-between">
          <Skeleton className="h-5 w-[150px]" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-2 w-full">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}

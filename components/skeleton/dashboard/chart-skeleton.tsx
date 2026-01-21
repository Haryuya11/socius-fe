import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskOverviewChartSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-[150px]" />
      </CardHeader>
      <CardContent className="pl-2">
        <Skeleton className="h-[350px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

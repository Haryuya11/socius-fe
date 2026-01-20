import { Skeleton } from "@/components/ui/skeleton";

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <Skeleton className="h-9 w-[200px] mb-2" />
        <Skeleton className="h-5 w-[250px]" />
      </div>
    </div>
  );
}

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { shimmer } from "@/lib/skeleton";
import { cn } from "@/lib/utils";

export function EmployeeTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card className="border-border/50 overflow-hidden">
      <Table>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className={cn("h-10 w-10 rounded-full", shimmer)} />
                  <div className="space-y-1">
                    <Skeleton className={cn("h-4 w-40", shimmer)} />
                    <Skeleton className={cn("h-3 w-32", shimmer)} />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className={cn("h-6 w-24 rounded-full", shimmer)} />
              </TableCell>
              <TableCell>
                <Skeleton className={cn("h-6 w-40", shimmer)} />
              </TableCell>
              <TableCell>
                <Skeleton className={cn("h-6 w-48", shimmer)} />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className={cn("h-8 w-8 ml-auto", shimmer)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

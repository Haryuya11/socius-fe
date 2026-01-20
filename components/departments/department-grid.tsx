import { useRouter } from "next/navigation";
import { Building2, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { Department } from "@/types/department";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentDialog } from "./department-dialog";

interface Props {
  data: Department[];
  isLoading: boolean;
  onDelete: (code: string) => void;
  onSuccess: () => void;
}

export function DepartmentGrid({
  data,
  isLoading,
  onDelete,
  onSuccess,
}: Props) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Không tìm thấy phòng ban nào.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map((dept) => (
        <Card
          key={dept.departmentCode}
          className="group hover:shadow-lg transition-all duration-300 border-indigo-100/50 hover:border-indigo-300"
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Building2 className="h-5 w-5" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/departments/${dept.departmentCode}`)
                    }
                  >
                    Xem chi tiết
                  </DropdownMenuItem>
                  <DepartmentDialog initialData={dept} onSuccess={onSuccess}>
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent w-full">
                      <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </div>
                  </DepartmentDialog>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(dept.departmentCode)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Vô hiệu hóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardTitle
              className="text-lg font-bold line-clamp-1"
              title={dept.departmentName}
            >
              {dept.departmentName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground bg-muted/30 p-2 rounded-md font-mono">
              <span className="font-semibold mr-2">CODE:</span>{" "}
              {dept.departmentCode}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              variant="outline"
              className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => router.push(`/departments/${dept.departmentCode}`)}
            >
              <Users className="mr-2 h-4 w-4" /> Quản lý nhân sự
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

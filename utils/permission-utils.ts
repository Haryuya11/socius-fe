// utils/permission-utils.ts
import { Permission } from "@/types/permission";
import {
  Eye,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  FileText,
  Settings,
} from "lucide-react";

export const groupPermissionsByResource = (permissions: Permission[]) => {
  return permissions.reduce(
    (acc, curr) => {
      const resource =
        curr.resource || curr.permissionCode.split(".")[0] || "Other";
      const key = resource.toUpperCase();

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(curr);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );
};

export const getActionConfig = (action: string) => {
  const lowerAction = action.toLowerCase();

  if (lowerAction.includes("create") || lowerAction.includes("add")) {
    return {
      color:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
      icon: Plus,
      label: "Thêm/Tạo",
    };
  }
  if (lowerAction.includes("update") || lowerAction.includes("edit")) {
    return {
      color:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      icon: Pencil,
      label: "Sửa",
    };
  }
  if (lowerAction.includes("delete") || lowerAction.includes("remove")) {
    return {
      color:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
      icon: Trash2,
      label: "Xóa",
    };
  }
  if (lowerAction.includes("view") || lowerAction.includes("read")) {
    return {
      color:
        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      icon: Eye,
      label: "Xem",
    };
  }
  if (lowerAction.includes("approve")) {
    return {
      color:
        "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
      icon: CheckCircle2,
      label: "Duyệt",
    };
  }

  return {
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Settings,
    label: action,
  };
};

export const getResourceIcon = (resource: string) => {
  return FileText;
};

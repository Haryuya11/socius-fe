// components/ui/pagination-control.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl"; // Ví dụ dùng next-intl

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading,
}: PaginationControlProps) {
  const t = useTranslations("Common.pagination");

  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalItems);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {t("page")} <strong className="text-foreground">{currentPage}</strong>{" "}
        {t("of")} <strong className="text-foreground">{totalPages}</strong>
        <span className="hidden sm:inline">
          {" "}
          · {t("showing")}{" "}
          <strong className="text-foreground">
            {totalItems > 0 ? `${startItem}-${endItem}` : "0"}
          </strong>{" "}
          {t("of")} <strong className="text-foreground">{totalItems}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          className="h-9 gap-1 border-border/50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t("previous")}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
          className="h-9 gap-1 border-border/50"
        >
          <span className="hidden sm:inline">{t("next")}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

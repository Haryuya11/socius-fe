import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Hiệu ứng ánh sáng chạy qua (Shimmer effect)
const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent overflow-hidden relative";

export function ProfilePageSkeleton() {
  return (
    <div className="flex min-h-screen relative items-start bg-background animate-in fade-in-0">
      {/* 1. SIDEBAR SKELETON */}
      <aside className="w-64 border-r border-border/40 bg-card/30 backdrop-blur-sm p-8 hidden lg:block sticky top-16 h-content-screen">
        <div className="mb-12">
          <Skeleton className={cn("h-8 w-3/4 mb-2", shimmer)} />
          <Skeleton className={cn("h-4 w-1/2", shimmer)} />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className={cn("h-10 w-full rounded-lg", shimmer)}
            />
          ))}
        </div>
      </aside>

      {/* 2. MAIN CONTENT SKELETON */}
      <div className="flex-1 pb-32">
        {/* HEADER SECTION */}
        <div className="relative border-b border-border/40 bg-muted/5">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
            <div className="flex justify-between mb-10">
              <Skeleton className={cn("h-9 w-24 rounded-full", shimmer)} />
              <div className="flex gap-2">
                <Skeleton className={cn("h-9 w-24 rounded-full", shimmer)} />
                <Skeleton className={cn("h-9 w-28 rounded-full", shimmer)} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar */}
              <Skeleton
                className={cn(
                  "h-32 w-32 rounded-full border-4 border-background shadow-xl",
                  shimmer
                )}
              />

              {/* Info */}
              <div className="flex-1 w-full">
                <div className="flex gap-3 mb-4 items-center">
                  <Skeleton className={cn("h-10 w-64", shimmer)} />
                  <Skeleton className={cn("h-6 w-24 rounded-full", shimmer)} />
                </div>

                <div className="flex gap-6 mb-6">
                  <Skeleton className={cn("h-4 w-32", shimmer)} />
                  <Skeleton className={cn("h-4 w-40", shimmer)} />
                  <Skeleton className={cn("h-4 w-24", shimmer)} />
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="border border-border/40 bg-card/50 rounded-xl px-5 py-3 w-36"
                    >
                      <Skeleton className={cn("h-3 w-20 mb-2", shimmer)} />
                      <Skeleton className={cn("h-7 w-16", shimmer)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT SECTIONS */}
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 space-y-12">
          {/* DETAILS GRID */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className={cn("h-10 w-10 rounded-lg", shimmer)} />
              <Skeleton className={cn("h-8 w-48", shimmer)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="border-border/40 bg-card/50 p-6 space-y-4"
                >
                  <div className="flex gap-3 mb-2">
                    <Skeleton className={cn("h-10 w-10 rounded-lg", shimmer)} />
                    <div className="space-y-2">
                      <Skeleton className={cn("h-4 w-32", shimmer)} />
                      <Skeleton className={cn("h-3 w-40", shimmer)} />
                    </div>
                  </div>
                  <Skeleton className={cn("h-10 w-full rounded-md", shimmer)} />
                </Card>
              ))}
            </div>
          </div>

          {/* ORGANIZATION GRID */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className={cn("h-10 w-10 rounded-lg", shimmer)} />
              <Skeleton className={cn("h-8 w-48", shimmer)} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card
                  key={i}
                  className="border-border/40 bg-card/50 p-6 space-y-5"
                >
                  <div className="flex justify-between">
                    <Skeleton className={cn("h-6 w-40", shimmer)} />
                    <Skeleton
                      className={cn("h-6 w-10 rounded-full", shimmer)}
                    />
                  </div>
                  <Skeleton className={cn("h-24 w-full rounded-xl", shimmer)} />
                  <Skeleton className={cn("h-24 w-full rounded-xl", shimmer)} />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

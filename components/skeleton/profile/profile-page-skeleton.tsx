import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen relative items-start bg-background animate-in fade-in-0">
      {/* 1. SIDEBAR SKELETON */}
      <aside className="w-64 border-r border-border/40 bg-card/30 backdrop-blur-sm p-8 hidden lg:block sticky top-16 h-[calc(100vh-4rem)]">
        <div className="mb-10">
          <Skeleton className="h-8 w-24 mb-6 rounded-full bg-muted/50" />
          <Skeleton className="h-8 w-3/4 mb-2 bg-muted/60" />
          <Skeleton className="h-4 w-1/2 bg-muted/40" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg bg-muted/40" />
          ))}
        </div>
      </aside>

      {/* 2. MAIN CONTENT SKELETON */}
      <div className="flex-1 pb-32">
        {/* HEADER SECTION */}
        <div className="relative border-b border-border/40 bg-linear-to-br from-primary/5 via-primary/0 to-background py-12">
          <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
            <div className="flex justify-end mb-8 gap-2">
              <Skeleton className="h-9 w-24 rounded-full bg-muted/40" />
              <Skeleton className="h-9 w-9 rounded-full bg-muted/40" />
            </div>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar */}
              <div className="relative">
                <Skeleton className="h-32 w-32 rounded-full border-4 border-background shadow-xl bg-muted/60" />
              </div>

              {/* Info */}
              <div className="flex-1 w-full">
                <div className="flex gap-3 mb-4 items-center">
                  <Skeleton className="h-10 w-64 bg-muted/60" />
                  <Skeleton className="h-6 w-24 rounded-full bg-muted/40" />
                </div>

                <div className="flex gap-6 mb-6">
                  <Skeleton className="h-4 w-32 bg-muted/40" />
                  <Skeleton className="h-4 w-40 bg-muted/40" />
                </div>

                {/* Stats Cards */}
                <div className="flex gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="border border-border/40 bg-card/30 backdrop-blur-sm rounded-xl px-5 py-3 w-32"
                    >
                      <Skeleton className="h-3 w-16 mb-2 bg-muted/40" />
                      <Skeleton className="h-6 w-20 bg-muted/60" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT SECTIONS */}
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12 space-y-12">
          {/* Section 1 */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 bg-muted/50" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="border-border/40 bg-card/50 p-6 space-y-4"
                >
                  <div className="flex gap-3 mb-2">
                    <Skeleton className="h-10 w-10 rounded-lg bg-muted/50" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-muted/50" />
                      <Skeleton className="h-3 w-32 bg-muted/30" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded-md bg-muted/20" />
                </Card>
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 bg-muted/50" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card
                  key={i}
                  className="border-border/40 bg-card/50 p-6 space-y-5"
                >
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32 bg-muted/50" />
                    <Skeleton className="h-6 w-8 rounded-full bg-muted/40" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-xl bg-muted/30" />
                    <Skeleton className="h-16 w-full rounded-xl bg-muted/30" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

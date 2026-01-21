import { cn } from "@/lib/utils";

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[600px] aspect-16/10 rounded-xl border border-border/50 bg-background/40 backdrop-blur-md shadow-2xl overflow-hidden",
        "transform perspective-distant -rotate-y-12 rotate-x-[5deg] hover:rotate-y-[-5deg] hover:rotate-x-2 transition-all duration-700 ease-out",
        className
      )}
    >
      {/* Layout giả lập Dashboard */}
      <div className="flex h-full">
        {/* Sidebar giả */}
        <div className="w-16 h-full border-r border-border/50 bg-muted/30 flex flex-col items-center py-4 gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20" />
          <div className="w-6 h-6 rounded bg-muted-foreground/20 mt-4" />
          <div className="w-6 h-6 rounded bg-muted-foreground/20" />
          <div className="w-6 h-6 rounded bg-muted-foreground/20" />
        </div>

        {/* Content bên phải */}
        <div className="flex-1 flex flex-col">
          {/* Header giả */}
          <div className="h-12 border-b border-border/50 bg-background/20 w-full flex items-center px-4 gap-2">
            <div className="w-24 h-3 rounded-full bg-muted-foreground/20" />
            <div className="ml-auto w-8 h-8 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Body chính */}
          <div className="p-4 grid grid-cols-3 gap-4 h-full">
            {/* Chart to */}
            <div className="col-span-2 rounded-lg border border-border/30 bg-background/30 p-3">
              <div className="w-20 h-3 rounded bg-muted-foreground/20 mb-2" />
              <div className="w-full h-24 rounded bg-linear-to-r from-primary/10 to-primary/5 mt-auto align-bottom" />
            </div>
            {/* Chart nhỏ */}
            <div className="col-span-1 rounded-lg border border-border/30 bg-background/30 p-3">
              <div className="w-10 h-3 rounded bg-muted-foreground/20 mb-2" />
              <div className="flex items-end h-24 gap-1 justify-around">
                <div className="w-2 h-10 bg-chart-1/40 rounded-t" />
                <div className="w-2 h-16 bg-chart-1/40 rounded-t" />
                <div className="w-2 h-8 bg-chart-1/40 rounded-t" />
              </div>
            </div>
            {/* List items dưới cùng */}
            <div className="col-span-3 rounded-lg border border-border/30 bg-background/30 p-3 flex flex-col gap-2">
              <div className="w-full h-8 rounded bg-muted/40" />
              <div className="w-full h-8 rounded bg-muted/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Hiệu ứng bóng sáng (Glare effect) */}
      <div className="absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

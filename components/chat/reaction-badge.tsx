"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ReactionBadgeProps {
  reactionCounts: Record<string, number>;
  isMe: boolean;
}

export const ReactionBadge = ({ reactionCounts, isMe }: ReactionBadgeProps) => {
  const sortedReactions = Object.entries(reactionCounts).sort(
    (a, b) => b[1] - a[1],
  );

  if (sortedReactions.length === 0) return null;

  const MAX_VISIBLE_REACTIONS = 3;
  const visibleReactions = sortedReactions.slice(0, MAX_VISIBLE_REACTIONS);
  const remainingCount = sortedReactions.length - MAX_VISIBLE_REACTIONS;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "absolute -bottom-3 flex items-center gap-1 bg-background border border-border rounded-full px-1.5 py-0.5 shadow-md text-[10px] z-20 select-none cursor-pointer hover:bg-muted transition-colors",
              isMe ? "right-0" : "left-0",
            )}
          >
            {visibleReactions.map(([icon, count]) => (
              <span key={icon} className="flex items-center">
                {icon}{" "}
                <span className="text-muted-foreground font-medium ml-0.5">
                  {count > 1 ? count : ""}
                </span>
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="bg-muted-foreground/10 px-1 rounded-sm font-semibold text-muted-foreground ml-0.5">
                +{remainingCount}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="flex gap-2 p-2 bg-popover text-popover-foreground border shadow-lg rounded-lg z-50 flex-wrap max-w-[200px] justify-center"
        >
          {sortedReactions.map(([icon, count]) => (
            <div key={icon} className="flex flex-col items-center min-w-5">
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
                {count}
              </span>
            </div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

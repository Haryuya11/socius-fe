"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl"; // Import i18n
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  CheckSquare,
  Calendar,
  MessageSquare,
  Bell,
  BookUser,
  FileText,
  Settings,
  Briefcase, // Icon thêm cho Employees
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavClick?: () => void;
  isCollapsed?: boolean;
}

export default function SidebarNav({
  className,
  onNavClick,
  isCollapsed = false,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const navItems = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: Home,
    },
    // Nếu bạn muốn link đến trang employees vừa làm:
    {
      title: t("employees"),
      href: "/employees",
      icon: Users,
    },
    {
      title: t("my_team"),
      href: "/teams",
      icon: Briefcase,
    },
    {
      title: t("my_tasks"),
      href: "/tasks",
      icon: CheckSquare,
    },
    {
      title: t("calendar"),
      href: "/calendar",
      icon: Calendar,
    },
    {
      title: t("messages"),
      href: "/chat",
      icon: MessageSquare,
    },
    {
      title: t("notifications"),
      href: "/notifications",
      icon: Bell,
    },
    {
      title: t("directory"),
      href: "/directory",
      icon: BookUser,
    },
    {
      title: t("documents"),
      href: "/documents",
      icon: FileText,
    },
    {
      title: t("settings"),
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <nav
      className={cn(
        "flex flex-col gap-2 p-2 transition-all duration-300",
        className
      )}
      {...props}
    >
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "group flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 outline-none ring-sidebar-ring focus-visible:ring-2",
                  // Layout handling
                  isCollapsed ? "justify-center px-2" : "justify-start px-3",
                  // Colors handling
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                {/* Icon Wrapper */}
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center transition-colors duration-200",
                    isCollapsed ? "mr-0" : "mr-3",
                    // Active state: Icon có màu primary (xanh/cam tùy theme)
                    isActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", isActive && "fill-current/10")}
                  />
                </span>

                {/* Text Label */}
                <span
                  className={cn(
                    "whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out",
                    isCollapsed
                      ? "w-0 opacity-0 translate-x-[-10px] hidden"
                      : "w-auto opacity-100 translate-x-0 block"
                  )}
                >
                  {item.title}
                </span>

                {/* Optional: Active Indicator (dấu chấm nhỏ bên phải) */}
                {isActive && !isCollapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-in fade-in zoom-in" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

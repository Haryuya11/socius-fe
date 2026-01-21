"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { SystemRole } from "@/types/roles";
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
  Briefcase,
  Building2,
  Waypoints,
  FileTerminal,
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavClick?: () => void;
  isCollapsed?: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: SystemRole[];
}

export default function SidebarNav({
  className,
  onNavClick,
  isCollapsed = false,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const { hasRole } = useAuth(); // Chỉ cần hasRole để check hiển thị

  // 1. Menu cho User (General)
  const mainNavItems: NavItem[] = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: Home,
    },
    {
      title: t("tasks"),
      href: "/tasks",
      icon: CheckSquare,
    },
    {
      title: t("my_department"), // Phòng ban của user
      href: "/my-department",
      icon: Building2,
    },
    {
      title: t("my_team"), // Team của chính user đó
      href: "/my-teams",
      icon: Briefcase,
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
  ];

  const adminNavItems: NavItem[] = [
    {
      title: t("employees"),
      href: "/employees",
      icon: Users,
      roles: ["SYS_ADMIN"],
    },
    {
      title: t("departments"),
      href: "/departments",
      icon: Building2,
      roles: ["SYS_ADMIN"],
    },
    {
      title: t("teams"),
      href: "/teams",
      icon: Waypoints,
      roles: ["SYS_ADMIN"],
    },
    {
      title: "roles",
      href: "/roles",
      icon: FileTerminal,
      roles: ["SYS_ADMIN"],
    },
    {
      title: t("settings"),
      href: "/settings",
      icon: Settings,
      roles: ["SYS_ADMIN"],
    },
  ];

  // Hàm render (giữ nguyên logic cũ)
  const renderNavItem = (item: NavItem) => {
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
            isCollapsed ? "justify-center px-2" : "justify-start px-3",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
          )}
          title={isCollapsed ? item.title : undefined}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center transition-colors duration-200",
              isCollapsed ? "mr-0" : "mr-3",
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground group-hover:text-sidebar-foreground",
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "fill-current/10")} />
          </span>

          <span
            className={cn(
              "whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out",
              isCollapsed
                ? "w-0 opacity-0 -translate-x-2.5 hidden"
                : "w-auto opacity-100 translate-x-0 block",
            )}
          >
            {item.title}
          </span>

          {isActive && !isCollapsed && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-in fade-in zoom-in" />
          )}
        </Link>
      </li>
    );
  };

  return (
    <nav
      className={cn(
        "flex flex-col gap-2 p-2 transition-all duration-300 h-full overflow-y-auto",
        className,
      )}
      {...props}
    >
      {/* General Section */}
      <ul className="space-y-1">
        {mainNavItems.map((item) => renderNavItem(item))}
      </ul>

      {/* Admin Section */}
      {hasRole("SYS_ADMIN") && (
        <>
          {!isCollapsed && (
            <div className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider flex items-center">
              <span className="flex-1 border-t border-border/50 mr-2"></span>
              <span>{t("admin_panel")}</span>
              <span className="flex-1 border-t border-border/50 ml-2"></span>
            </div>
          )}
          {isCollapsed && (
            <div className="my-2 border-t border-border/50 mx-2" />
          )}

          <ul className="space-y-1">
            {adminNavItems.map((item) => renderNavItem(item))}
          </ul>
        </>
      )}

      {/* Bottom Section (Notifications, etc.) */}
      <div className="mt-auto pt-4 border-t border-border/30">
        <ul className="space-y-1">
          {renderNavItem({
            title: t("notifications"),
            href: "/notifications",
            icon: Bell,
          })}
        </ul>
      </div>
    </nav>
  );
}

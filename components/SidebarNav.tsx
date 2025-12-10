"use client";

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
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

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



  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    { title: "My Team", href: "/teams", icon: <Users className="h-5 w-5" /> },
    {
      title: "My Tasks",
      href: "/tasks",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/chat",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Notifications",
      href: "/my-notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: "Directory",
      href: "/directory",
      icon: <BookUser className="h-5 w-5" />,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
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

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center rounded-md py-2 text-sm font-medium transition-all duration-200",
                  // Xử lý layout flex dựa trên collapsed state
                  isCollapsed
                    ? "justify-center px-2"
                    : "justify-start px-3 gap-3",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={isCollapsed ? item.title : undefined} // Tooltip native khi thu nhỏ
              >
                <span className="shrink-0">{item.icon}</span>

                {/* Xử lý ẩn hiện text mượt mà hơn */}
                <span
                  className={cn(
                    "whitespace-nowrap overflow-hidden transition-all duration-300",
                    isCollapsed
                      ? "w-0 opacity-0 hidden"
                      : "w-auto opacity-100 block"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

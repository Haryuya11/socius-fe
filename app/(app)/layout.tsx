"use client";

import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  useEffect(() => {
    // check if the window width is greater than or equal to 768px
    const handleResize = () => {
      setIsSidebarActive(window.innerWidth >= 768);
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex flex-1 pt-16">
        <aside
          className={cn(
            "no-scrollbar hidden md:block border-r bg-background fixed left-0 top-16",
            "overflow-y-auto z-40 h-[calc(100vh-4rem)]",
            "transition-all duration-300 ease-in-out",

            isSidebarActive && isHovered ? "w-64" : "w-16"
          )}
          onMouseEnter={() => isSidebarActive && setIsHovered(true)}
          onMouseLeave={() => isSidebarActive && setIsHovered(false)}
        >
          <SidebarNav isCollapsed={!isHovered} />
        </aside>

        <main
          className={cn(
            "flex-1 w-full transition-all duration-300 ease-in-out",
            isSidebarActive && isHovered ? "md:ml-64" : "md:ml-16"
          )}
        >
          <div className="max-w-[1920px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

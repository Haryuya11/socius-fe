"use client";

import {
  Mail,
  Briefcase,
  Users,
  DollarSign,
  Shield,
  Building2,
  Trophy,
  CheckCircle2,
  Crown,
  Star,
  Lock,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { getAvatarInfo } from "@/utils/avatar-utils";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

import { ProfilePageSkeleton } from "@/components/skeleton/profile/profile-page-skeleton";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { AvatarUploadDialog } from "@/components/profile/avatar-upload-dialog";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  const navItems = useMemo(
    () => [
      { id: "overview", label: t("nav.overview") },
      { id: "details", label: t("nav.details") },
      { id: "organization", label: t("nav.organization") },
    ],
    [t]
  );

  useEffect(() => {
    if (!user) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      }
    );

    const timer = setTimeout(() => {
      navItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) observer.observe(element);
      });
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [navItems, user]); 

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  if (!user) {
    return <ProfilePageSkeleton />;
  }

  const { fullName, initials, avatarUrl } = getAvatarInfo(user);

  const formattedSalary = new Intl.NumberFormat("vi", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(user.salary || 0);

  return (
    <main className="min-h-screen bg-background animate-in fade-in-0 duration-500">
      <div className="flex min-h-screen relative items-start">
        {/* --- SIDEBAR --- */}
        <aside className="w-64 border-r border-border/40 bg-card/30 backdrop-blur-sm p-8 hidden lg:block sticky top-16 h-content-screen overflow-y-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {fullName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("employee_profile")}
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={cn(
                  "block px-4 py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer text-sm",
                  activeSection === item.id
                    ? "bg-primary/10 text-primary font-medium border-l-2 border-primary translate-x-1"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 pb-32">
          {/* HEADER SECTION */}
          <div
            id="overview"
            className="relative bg-linear-to-br from-primary/10 via-primary/5 to-background border-b border-border/40 scroll-mt-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
            <div className="relative max-w-6xl mx-auto px-6 lg:px-12 py-12">
              <div className="flex items-start justify-between mb-8">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => history.back()}
                >
                  ← {t("back")}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-transparent border-border/50 hover:bg-muted/50"
                  >
                    {t("export")}
                  </Button>
                  <ChangePasswordDialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-transparent border-border/50 hover:bg-muted/50 gap-2"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      {t("change_password.button_label")}
                    </Button>
                  </ChangePasswordDialog>
                  <Button size="sm" className="rounded-full">
                    {t("edit_profile")}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Profile Avatar */}
                <div className="relative">
                  {/* 2. Bọc Avatar trong Dialog */}
                  <AvatarUploadDialog currentAvatarUrl={avatarUrl || ""}>
                    {/* 3. Thêm class 'group' và 'cursor-pointer' để xử lý hover */}
                    <div className="relative group cursor-pointer">
                      <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-105">
                        <AvatarImage
                          src={avatarUrl || "/placeholder.svg"}
                          alt={fullName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-linear-to-br from-primary to-primary/70 text-primary-foreground text-4xl font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* 4. Lớp phủ (Overlay) hiện ra khi Hover */}
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-4 border-transparent">
                        <Camera className="h-8 w-8 text-white drop-shadow-md" />
                      </div>

                      {/* Nút nhỏ hiển thị icon edit ở góc (luôn hiện hoặc tùy chọn) */}
                      <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-background shadow-sm translate-x-1 translate-y-1 group-hover:scale-110 transition-transform">
                        <Camera className="h-4 w-4" />
                      </div>
                    </div>
                  </AvatarUploadDialog>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h1 className="text-4xl font-bold text-foreground">
                      {fullName}
                    </h1>
                    <Badge className="bg-primary/15 text-primary border border-primary/30 px-3 py-1">
                      <Shield className="h-3.5 w-3.5 mr-1.5" />
                      {user.systemRole}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.userId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm">
                        {user.departments[0]?.departmentName ||
                          t("org.no_dept")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {user.teams.length}{" "}
                        {user.teams.length === 1
                          ? t("stats.teams")
                          : t("stats.teams")}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl px-5 py-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("stats.annual_salary")}
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {formattedSalary}
                      </div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl px-5 py-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("stats.departments")}
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {user.departments.length}
                      </div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl px-5 py-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("stats.teams")}
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {user.teams.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS & ORGANIZATION CONTENT */}
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
            {/* --- DETAILS SECTION --- */}
            <section id="details" className="mb-12 scroll-mt-10">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                {t("details.title")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {t("details.client_id")}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t("details.unique_identifier")}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-mono text-foreground bg-muted/50 px-4 py-3 rounded-lg border border-border/40 break-all">
                      {user.clientId}
                    </p>
                  </div>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-linear-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {t("details.system_role")}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t("details.access_level")}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/15 text-primary border border-primary/30 px-4 py-2 text-sm">
                      {user.systemRole}
                    </Badge>
                  </div>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-linear-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-green-500 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {t("details.email")}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t("details.primary_contact")}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{user.userId}</p>
                  </div>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-linear-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {t("details.compensation")}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t("details.base_salary")}
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {formattedSalary}
                    </p>
                  </div>
                </Card>
              </div>
            </section>

            {/* --- ORGANIZATION SECTION --- */}
            <section id="organization" className="mb-12 scroll-mt-10">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                {t("org.title")}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* --- DEPARTMENTS CARD --- */}
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {t("org.departments")}
                      </h3>
                      <Badge variant="secondary" className="rounded-full px-3">
                        {user.departments.length}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {user.departments && user.departments.length > 0 ? (
                        user.departments.map((dept) => (
                          <div
                            key={dept.departmentCode}
                            className={cn(
                              "group p-4 rounded-xl border transition-all duration-300",
                              dept.isPrimary
                                ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                                : "border-border/40 bg-muted/30 hover:bg-muted/50 hover:border-primary/30"
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                                  {dept.departmentName}
                                  {dept.isPrimary && (
                                    <Star className="h-3.5 w-3.5 text-green-600 fill-green-600 dark:text-green-400 dark:fill-green-400" />
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {dept.roleName}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0 border-border"
                              >
                                {dept.departmentCode}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                              {dept.isPrimary ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs gap-1 pl-1
                                    bg-green-100 text-green-700 border-green-200 
                                    dark:bg-green-500/20 dark:text-green-300 dark:border-green-800"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t("org.primary_dept")}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                  {t("org.member")}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">
                            {t("org.no_dept")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* --- TEAMS CARD --- */}
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {t("org.teams")}
                      </h3>
                      <Badge variant="secondary" className="rounded-full px-3">
                        {user.teams.length}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {user.teams && user.teams.length > 0 ? (
                        user.teams.map((team) => (
                          <div
                            key={team.teamCode}
                            className={cn(
                              "group p-4 rounded-xl border transition-all duration-300",
                              team.isLeader
                                ? "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10"
                                : "border-border/40 bg-muted/30 hover:bg-muted/50 hover:border-primary/30"
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                                  {team.teamName}
                                  {team.isLeader && (
                                    <Crown className="h-3.5 w-3.5 text-orange-500 fill-orange-500 dark:text-orange-400 dark:fill-orange-400" />
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {team.roleName}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0 border-border"
                              >
                                {team.teamCode}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                              {team.isLeader ? (
                                <Badge
                                  className="text-xs gap-1 pl-1 shadow-none
                                    bg-orange-100 text-orange-700 border-orange-200 
                                    dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-800"
                                >
                                  <Crown className="h-3 w-3" />
                                  {t("org.team_leader")}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                                  {t("org.active_member")}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">
                            {t("org.no_team")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

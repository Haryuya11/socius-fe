"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mail,
  Briefcase,
  Users,
  Shield,
  Building2,
  Trophy,
  CheckCircle2,
  Crown,
  Star,
  ArrowLeft,
  AlertCircle,
  User,
  MessageSquareText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { employeeService } from "@/services/employee-service";
import { Employee } from "@/types/employee";
import { ProfileSkeleton } from "@/components/skeleton/profile/profile-page-skeleton";
import { getAvatarInfo } from "@/utils/avatar-utils";
import { getFullImageUrl } from "@/utils/image-utils";
import { ROLE_LABELS, RoleCode } from "@/types/roles";
import { chatService } from "@/services/chat-service";
import { useChatStore } from "@/stores/use-chat-store";
import { MessageType } from "@/types/chat";

export default function DirectoryDetailPage() {
  const t = useTranslations("Directory");
  const tChat = useTranslations("Chat");
  const params = useParams();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [chatLoading, setChatLoading] = useState(false);
  const { addConversationToStore } = useChatStore();

  const navItems = useMemo(
    () => [
      { id: "overview", label: t("detail.sections.overview") },
      { id: "contact", label: t("detail.sections.contact") },
      { id: "organization", label: t("detail.sections.organization") },
    ],
    [t],
  );

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!params.id) return;
      try {
        setLoading(true);
        const res = await employeeService.fetchEmployees({
          page: 1,
          size: 1,
          condition: { clientId: params.id as string },
        });
        if (res.data.length > 0) {
          setEmployee(res.data[0]);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeDetails();
  }, [params.id]);

  useEffect(() => {
    if (!employee) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
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
  }, [navItems, employee]);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
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

  const handleStartChat = async () => {
    if (!employee) return;
    try {
      setChatLoading(true);

      const conversation = await chatService.createDirectConversation(
        employee.clientId,
      );

      if (conversation && conversation.conversationId) {
        addConversationToStore({
          conversationId: conversation.conversationId,
          type: conversation.type,
          name: conversation.name || "Cuộc trò chuyện",
          avatarUrl: conversation.avatarUrl,
          createdBy: conversation.createdBy,
          lastMessageId: conversation.lastMessageId,
          lastMessageAt: conversation.lastMessageAt,
          createdAt: conversation.createdAt,
          lastMessageContent: "",
          lastMessageType: MessageType.TEXT,
          lastSenderId: "",
          unreadCount: 0,
        });

        router.push(`/chat/${conversation.conversationId}`);
      } else {
        toast.error(tChat("create_failed"));
      }
    } catch (error) {
      console.error(error);
      toast.error(tChat("connect_failed"));
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">{t("detail.error.title")}</h2>
        <p className="text-muted-foreground">{t("detail.error.description")}</p>
        <Button onClick={() => router.back()} variant="outline">
          {t("detail.back")}
        </Button>
      </div>
    );
  }

  const { fullName, initials, avatarUrl } = getAvatarInfo(employee);
  const displayAvatarUrl = getFullImageUrl(avatarUrl);
  const departments = employee.departments || [];
  const teams = employee.teams || [];
  const primaryDept = departments.find((d) => d.isPrimary);

  return (
    <main className="min-h-screen bg-background animate-in fade-in-0 duration-500">
      <div className="flex min-h-screen relative items-start">
        {/* --- SIDEBAR --- */}
        <aside className="w-64 border-r border-border/40 bg-card/30 backdrop-blur-sm p-8 hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="mb-10">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 mb-6 text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/directory")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("detail.back")}
            </Button>

            <h2 className="text-xl font-bold text-foreground mb-1 line-clamp-1">
              {fullName}
            </h2>
            <p className="text-xs text-muted-foreground break-all">
              {employee.userId}
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={cn(
                  "block px-4 py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer text-sm font-medium",
                  activeSection === item.id
                    ? "bg-primary/10 text-primary border-l-2 border-primary translate-x-1"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent",
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
            className="relative bg-linear-to-br from-primary/10 via-primary/5 to-background border-b border-border/40 scroll-mt-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary),0.05),transparent_50%)]"></div>
            <div className="relative max-w-5xl mx-auto px-6 lg:px-12 py-12">
              {/* Header Actions */}
              <div className="flex items-start justify-between mb-8 lg:justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden rounded-full"
                  onClick={() => router.push("/directory")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("detail.back")}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-background/50 border-border/50 hover:bg-background"
                  onClick={handleStartChat}
                  disabled={chatLoading}
                >
                  {chatLoading ? (
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  ) : (
                    <MessageSquareText className="h-3.5 w-3.5 mr-2" />
                  )}
                  {t("chat")}
                </Button>
              </div>

              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Avatar */}
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                    <AvatarImage
                      src={displayAvatarUrl}
                      alt={fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-linear-to-br from-primary to-primary/70 text-primary-foreground text-4xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-background"
                    title={t("detail.active_status")}
                  ></div>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h1 className="text-4xl font-bold text-foreground">
                      {fullName}
                    </h1>
                    <Badge className="bg-primary/15 text-primary border border-primary/30 px-3 py-1">
                      <Shield className="h-3.5 w-3.5 mr-1.5" />
                      {ROLE_LABELS[employee.systemRole as RoleCode] ||
                        employee.systemRole}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{employee.userId}</span>
                    </div>
                    {primaryDept && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span className="text-sm">
                          {primaryDept.departmentName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl px-5 py-3 hover:border-primary/20 transition-colors">
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("detail.departments")}
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {departments.length}
                      </div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl px-5 py-3 hover:border-primary/20 transition-colors">
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("detail.teams")}
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {teams.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
            {/* CONTACT DETAILS */}
            <section id="contact" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                {t("detail.sections.contact")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-linear-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {t("detail.fields.email")}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t("detail.descriptions.primary_contact")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-foreground">
                        {employee.userId}
                      </p>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    </div>
                  </div>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-linear-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {t("detail.fields.role")}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t("detail.descriptions.access_level")}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/15 text-primary border border-primary/30 px-4 py-2 text-sm">
                      {ROLE_LABELS[employee.systemRole as RoleCode] ||
                        employee.systemRole}
                    </Badge>
                  </div>
                </Card>
              </div>
            </section>

            {/* ORGANIZATION SECTION */}
            <section id="organization" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                {t("detail.sections.organization")}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Departments List */}
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {t("detail.departments")}
                      </h3>
                      <Badge variant="secondary" className="rounded-full px-3">
                        {departments.length}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {departments.length > 0 ? (
                        departments.map((dept) => (
                          <div
                            key={dept.departmentCode}
                            className={cn(
                              "group p-4 rounded-xl border transition-all duration-300",
                              dept.isPrimary
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-border/40 bg-muted/30",
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-foreground flex items-center gap-2">
                                  {dept.departmentName}
                                  {dept.isPrimary && (
                                    <Star className="h-3.5 w-3.5 text-green-600 fill-green-600" />
                                  )}
                                </p>
                                {dept.roleCode && (
                                  <p className="text-sm text-muted-foreground">
                                    {ROLE_LABELS[dept.roleCode as RoleCode] ||
                                      dept.roleCode}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {dept.departmentCode}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {t("detail.no_departments")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Teams List */}
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {t("detail.teams")}
                      </h3>
                      <Badge variant="secondary" className="rounded-full px-3">
                        {teams.length}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {teams.length > 0 ? (
                        teams.map((team) => (
                          <div
                            key={team.teamCode}
                            className={cn(
                              "group p-4 rounded-xl border transition-all duration-300",
                              team.isLeader
                                ? "border-orange-500/30 bg-orange-500/5"
                                : "border-border/40 bg-muted/30",
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-foreground flex items-center gap-2">
                                  {team.teamName}
                                  {team.isLeader && (
                                    <Crown className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                                  )}
                                </p>
                                {team.roleCode && (
                                  <p className="text-sm text-muted-foreground">
                                    {ROLE_LABELS[team.roleCode as RoleCode] ||
                                      team.roleCode}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {team.teamCode}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {t("detail.no_teams")}
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

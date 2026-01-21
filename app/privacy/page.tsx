"use client";

import { useTranslations } from "next-intl";

import {
  Shield,
  Lock,
  Users,
  FileText,
  Clock,
  Mail,
  Bell,
  Eye,
  User,
  Briefcase,
  Building2,
  DollarSign,
  Settings,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Edit3,
  Trash2,
  Ban,
} from "lucide-react";

import { SociusLogo } from "@/components/ui/logo";
import { Card } from "@/components/ui/card";

import { useState, useEffect } from "react";

export default function PrivacyPage() {
  const t = useTranslations("Privacy");
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", label: t("intro.title"), icon: Shield },
    { id: "collection", label: t("collection.title"), icon: FileText },
    { id: "usage", label: t("usage.title"), icon: Users },
    { id: "protection", label: t("protection.title"), icon: Lock },
    { id: "sharing", label: t("sharing.title"), icon: Eye },
    { id: "rights", label: t("rights.title"), icon: Bell },
    { id: "retention", label: t("retention.title"), icon: Clock },
    { id: "contact", label: t("contact.title"), icon: Mail },
  ];

  useEffect(() => {
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
        threshold: 0.3,
      }
    );

    const sectionIds = [
      "intro",
      "collection",
      "usage",
      "protection",
      "sharing",
      "rights",
      "retention",
      "contact",
    ];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="border-b bg-muted/30">
        <div className="w-full px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-3xl flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              {t("last_updated")}: {t("date")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="w-full px-4 py-12 md:px-8">
        <div className="mx-auto flex max-w-7xl gap-8 lg:gap-12 justify-center">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:w-64 xl:w-72 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="mb-4 px-4 text-sm font-semibold text-foreground">
                {t("title")}
              </p>
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                    activeSection === id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <main className="w-full max-w-3xl">
            <div className="space-y-8">
              {/* Introduction */}
              <Card id="intro" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("intro.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("intro.content")}
                </p>
              </Card>

              {/* Information We Collect */}
              <Card id="collection" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("collection.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                  {t("collection.intro")}
                </p>
                <div className="space-y-3">
                  {[
                    { key: "personal", Icon: User },
                    { key: "employment", Icon: Briefcase },
                    { key: "organization", Icon: Building2 },
                    { key: "compensation", Icon: DollarSign },
                    { key: "system", Icon: Settings },
                  ].map(({ key, Icon: ItemIcon }) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <ItemIcon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                        {t(`collection.items.${key}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* How We Use Information */}
              <Card id="usage" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("usage.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                  {t("usage.intro")}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "management", Icon: BarChart3 },
                    { key: "communication", Icon: MessageSquare },
                    { key: "compensation", Icon: DollarSign },
                    { key: "analytics", Icon: TrendingUp },
                    { key: "security", Icon: Lock },
                  ].map(({ key, Icon: ItemIcon }) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-lg border bg-card p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <ItemIcon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground text-justify">
                        {t(`usage.items.${key}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Data Protection */}
              <Card id="protection" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("protection.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("protection.content")}
                </p>
              </Card>

              {/* Data Sharing */}
              <Card id="sharing" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("sharing.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                  {t("sharing.intro")}
                </p>
                <ul className="space-y-3">
                  {["authorized", "legal", "consent"].map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-muted-foreground text-justify">
                        {t(`sharing.items.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Your Rights */}
              <Card id="rights" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("rights.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                  {t("rights.intro")}
                </p>
                <div className="space-y-3">
                  {[
                    { key: "access", Icon: Eye },
                    { key: "correction", Icon: Edit3 },
                    { key: "deletion", Icon: Trash2 },
                    { key: "objection", Icon: Ban },
                  ].map(({ key, Icon: ItemIcon }) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <ItemIcon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground text-justify">
                        {t(`rights.items.${key}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Data Retention */}
              <Card id="retention" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("retention.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("retention.content")}
                </p>
              </Card>

              {/* Contact */}
              <Card id="contact" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("contact.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("contact.content")}
                </p>
              </Card>

              {/* Updates - Last Section */}
              <div className="rounded-lg border-2 border-dashed border-border p-6 text-justify">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="font-semibold text-foreground">
                    {t("updates.title")}:
                  </strong>{" "}
                  {t("updates.content")}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="w-full flex flex-col items-center justify-center gap-4 py-8 text-center text-sm text-muted-foreground md:py-12 px-4 md:px-8">
          <SociusLogo variant="icon" className="h-8 w-8 opacity-50" />
          <p>&copy; 2026 Socius. {t("footer")}</p>
        </div>
      </footer>
    </>
  );
}

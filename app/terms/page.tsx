"use client";

import { useTranslations } from "next-intl";

import {
  FileText,
  CheckCircle2,
  UserCheck,
  Monitor,
  Database,
  AlertTriangle,
  Copyright,
  ShieldAlert,
  XCircle,
  RefreshCw,
  Mail,
  Lock,
} from "lucide-react";

import { SociusLogo } from "@/components/ui/logo";
import { Card } from "@/components/ui/card";

import { useState, useEffect } from "react";

export default function TermsPage() {
  const t = useTranslations("Terms");
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", label: t("intro.title"), icon: FileText },
    { id: "acceptance", label: t("acceptance.title"), icon: CheckCircle2 },
    { id: "accounts", label: t("accounts.title"), icon: UserCheck },
    { id: "usage", label: t("usage.title"), icon: Monitor },
    { id: "data", label: t("data.title"), icon: Database },
    { id: "prohibited", label: t("prohibited.title"), icon: AlertTriangle },
    { id: "intellectual", label: t("intellectual.title"), icon: Copyright },
    { id: "liability", label: t("liability.title"), icon: ShieldAlert },
    { id: "termination", label: t("termination.title"), icon: XCircle },
    { id: "changes", label: t("changes.title"), icon: RefreshCw },
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
      "acceptance",
      "accounts",
      "usage",
      "data",
      "prohibited",
      "intellectual",
      "liability",
      "termination",
      "changes",
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
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("intro.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("intro.content")}
                </p>
              </Card>

              {/* Acceptance of Terms */}
              <Card id="acceptance" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("acceptance.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("acceptance.content")}
                </p>
              </Card>

              {/* User Accounts */}
              <Card id="accounts" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("accounts.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                  {t("accounts.intro")}
                </p>
                <div className="space-y-3">
                  {[
                    { key: "authentication", Icon: Lock },
                    { key: "security", Icon: ShieldAlert },
                    { key: "responsibility", Icon: UserCheck },
                  ].map(({ key, Icon: ItemIcon }) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <ItemIcon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                        {t(`accounts.items.${key}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* System Usage */}
              <Card id="usage" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("usage.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                  {t("usage.intro")}
                </p>
                <ul className="space-y-3">
                  {["purpose", "compliance", "professional"].map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-muted-foreground text-justify">
                        {t(`usage.items.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Data Responsibilities */}
              <Card id="data" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("data.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("data.content")}
                </p>
              </Card>

              {/* Prohibited Activities */}
              <Card id="prohibited" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("prohibited.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
                  {t("prohibited.intro")}
                </p>
                <div className="space-y-3">
                  {["unauthorized", "misuse", "interference", "violation"].map(
                    (key) => (
                      <div
                        key={key}
                        className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                          <XCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                          {t(`prohibited.items.${key}`)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </Card>

              {/* Intellectual Property */}
              <Card id="intellectual" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Copyright className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("intellectual.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("intellectual.content")}
                </p>
              </Card>

              {/* Limitation of Liability */}
              <Card id="liability" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("liability.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("liability.content")}
                </p>
              </Card>

              {/* Termination */}
              <Card id="termination" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <XCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("termination.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("termination.content")}
                </p>
              </Card>

              {/* Changes to Terms */}
              <Card id="changes" className="p-6 md:p-8 scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <RefreshCw className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("changes.title")}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {t("changes.content")}
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

              {/* Governing Law */}
              <div className="rounded-lg border-2 border-dashed border-border p-6 text-justify">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="font-semibold text-foreground">
                    {t("governing.title")}:
                  </strong>{" "}
                  {t("governing.content")}
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

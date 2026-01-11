import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "Metadata.terms",
  });

  const tGlobal = await getTranslations({
    locale: params.locale,
    namespace: "Metadata.default",
  });

  return {
    title: `${t("title")} | ${tGlobal("site_name")}`,
    description: t("description"),
  };
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { LayoutProps } from "@/types/common";

export async function generateMetadata({
  params: { locale },
}: Omit<LayoutProps, "children">) {
  const t = await getTranslations({ locale, namespace: "Metadata.auth" });

  const tGlobal = await getTranslations({
    locale,
    namespace: "Metadata.default",
  });

  return {
    title: `${t("title")} | ${tGlobal("site_name")}`,
    description: t("description"),
  };
}

export default function AuthenticationLayout({ children }: LayoutProps) {
  return <>{children}</>;
}


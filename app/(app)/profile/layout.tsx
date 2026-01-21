import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "Metadata.profile",
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

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

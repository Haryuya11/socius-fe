import { getTranslations } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Omit<Props, "children">) {
  const t = await getTranslations({ locale, namespace: "Metadata.profile" });

  const tGlobal = await getTranslations({
    locale,
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

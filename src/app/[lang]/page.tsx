import { notFound } from "next/navigation";
import EmpireAtlasApp from "@/components/EmpireAtlasApp";
import type { Language } from "@/types/i18n";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }];
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;

  if (lang !== "en" && lang !== "ar") {
    notFound();
  }

  return <EmpireAtlasApp routeLang={lang as Language} />;
}

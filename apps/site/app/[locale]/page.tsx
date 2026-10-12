import HomeJsonLd from "@/components/seo/HomeJsonLd";
import ImmersiveExperience from "@/components/experience/ImmersiveExperience";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <><HomeJsonLd locale={locale}/><ImmersiveExperience/></>;
}

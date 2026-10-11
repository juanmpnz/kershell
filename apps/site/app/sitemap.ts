import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.heykershell.com";
  const localizedHomepages = {
    en: `${baseUrl}/en`,
    es: `${baseUrl}/es`,
  };

  return [
    {
      url: localizedHomepages.en,
      alternates: { languages: localizedHomepages },
      priority: 1,
    },
    {
      url: localizedHomepages.es,
      alternates: { languages: localizedHomepages },
      priority: 1,
    },
    {
      url: `${baseUrl}/es/desarrollo-software-a-medida-barcelona`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/es/desarrollo-saas-y-plataformas-internas`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/privacy`,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/es/privacy`,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/en/terms`,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/es/terms`,
      priority: 0.3,
    },
  ];
}

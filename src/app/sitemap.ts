import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { seoLandingPages } from "@/lib/seoLandingPages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dentjob2804.co.kr";
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("job_posts")
    .select("id, updated_at, region, job_type")
    .eq("status", "approved")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .or(`recruit_end_date.is.null,recruit_end_date.gte.${new Date().toISOString().slice(0, 10)}`)
    .limit(1000);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/jobs`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/jobs?category=lab`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/seekers`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const jobRoutes: MetadataRoute.Sitemap = (jobs || []).map((j) => ({
    url: `${base}/jobs/${j.id}`,
    lastModified: j.updated_at,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // 실제 활성 공고가 있는 지역·직무 조합만 색인합니다.
  const seoRoutes: MetadataRoute.Sitemap = seoLandingPages
    .filter((page) => (jobs || []).some((job) => page.regions.includes(job.region) && page.jobTypes.includes(job.job_type)))
    .map((page) => ({
      url: `${base}/jobs/seo/${page.slug}`,
      changeFrequency: "hourly",
      priority: 0.8,
    }));

  return [...staticRoutes, ...seoRoutes, ...jobRoutes];
}

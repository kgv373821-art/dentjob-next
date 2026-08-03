import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dentjob.example.com";
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("job_posts")
    .select("id, updated_at")
    .eq("status", "approved")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
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

  return [...staticRoutes, ...jobRoutes];
}

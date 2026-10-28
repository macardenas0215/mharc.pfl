import "server-only";
import { connection } from "next/server";
import { createClient } from "@sanity/client";
import {
  profile,
  projects,
  skills,
  type Profile,
  type Project,
  type Skill,
} from "@/data/portfolio";
export async function getContent(): Promise<{
  profile: Profile;
  projects: Project[];
  skills: Skill[];
}> {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
    return { profile, projects, skills };
  await connection();
  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2026-10-01",
      useCdn: true,
      token: process.env.SANITY_API_READ_TOKEN,
      timeout: 5000,
    });
    const c = await client.fetch<{
      profile: Partial<Profile> | null;
      projects: Project[];
      skills: Skill[];
    }>(
      `{"profile":*[_type=="profile"][0]{name,shortName,location,phone,showPhone,email,github,linkedin,introduction,about,titles,"portrait":portrait.asset->url},"projects":*[_type=="project"]|order(order asc){"id":_id,title,category,description,features,technologies,status,demoUrl,sourceUrl,"image":image.asset->url},"skills":*[_type=="skill"]|order(order asc){name,category}}`,
    );
    return {
      profile: {
        ...profile,
        ...Object.fromEntries(
          Object.entries(c.profile || {}).filter(([, v]) => v !== null),
        ),
      },
      projects: c.projects.length ? c.projects : projects,
      skills: c.skills.length ? c.skills : skills,
    };
  } catch {
    return { profile, projects, skills };
  }
}

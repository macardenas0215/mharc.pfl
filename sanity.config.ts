import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schema";
export default defineConfig({
  name: "portfolio",
  title: "Mharc · Portfolio Studio",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "missing-project-id",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});

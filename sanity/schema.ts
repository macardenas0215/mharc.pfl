import { defineField, defineType } from "sanity";
const text = (name: string, required = false) =>
  defineField({
    name,
    type: "string",
    validation: (r) => (required ? r.required() : r),
  });
const list = (name: string) =>
  defineField({ name, type: "array", of: [{ type: "string" }] });
export const schemaTypes = [
  defineType({
    name: "project",
    title: "Projects",
    type: "document",
    fields: [
      text("title", true),
      text("category", true),
      defineField({
        name: "description",
        type: "text",
        validation: (r) => r.required(),
      }),
      text("status", true),
      list("features"),
      list("technologies"),
      defineField({ name: "image", type: "image", options: { hotspot: true } }),
      defineField({ name: "demoUrl", type: "url" }),
      defineField({ name: "sourceUrl", type: "url" }),
      defineField({ name: "order", type: "number", initialValue: 0 }),
    ],
  }),
  defineType({
    name: "skill",
    title: "Skills",
    type: "document",
    fields: [
      text("name", true),
      defineField({
        name: "category",
        type: "string",
        options: {
          list: ["Frontend", "Backend", "Database", "Tools", "UI/UX & Systems"],
        },
        validation: (r) => r.required(),
      }),
      defineField({ name: "order", type: "number", initialValue: 0 }),
    ],
  }),
  defineType({
    name: "profile",
    title: "Profile (create one document)",
    type: "document",
    fields: [
      text("name", true),
      text("shortName", true),
      text("location"),
      text("phone"),
      defineField({ name: "showPhone", type: "boolean", initialValue: true }),
      text("email"),
      defineField({ name: "github", type: "url" }),
      defineField({ name: "linkedin", type: "url" }),
      defineField({
        name: "portrait",
        type: "image",
        options: { hotspot: true },
      }),
      list("titles"),
      defineField({ name: "introduction", type: "text" }),
      defineField({ name: "about", type: "text" }),
    ],
  }),
];

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  technologies: string[];
  status: string;
  image?: string;
  demoUrl?: string;
  sourceUrl?: string;
};
export type Skill = { name: string; category: string };
export const profile = {
  name: "Mharc Angelo S. Cardenas",
  shortName: "Mharc",
  location: "Caloocan City, Metro Manila, Philippines",
  phone: "09070568360",
  showPhone: true,
  email: "",
  facebook: "https://www.facebook.com/m.a.cardenas0215",
  instagram: "https://www.instagram.com/mhrcnglcrdns/",
  github: "",
  linkedin: "",
  portrait: "/images/mharc-profile.jpg",
  titles: [
    "Aspiring IT Professional",
    "Full-Stack Developer",
    "IT Systems Enthusiast",
  ],
  introduction:
    "I’m an Information Technology student who enjoys turning everyday challenges into useful, user-friendly systems. I’m exploring the space where thoughtful design meets practical development.",
  about:
    "From a clear interface to a well-organized database, I care about how all the pieces work together. My interests include full-stack development, database management, business systems, system analysis, and the details that make an application easier to use.",
};
export type Profile = typeof profile;
export const projects: Project[] = [
  {
    id: "kiosk",
    title: "Sales & Inventory Management System",
    category: "Web-based kiosk · Business systems",
    description:
      "A web-based kiosk system designed to simplify customer ordering, support product inventory management, and help businesses monitor sales and transactions.",
    status: "Completion unverified",
    features: [
      "Digital product menu",
      "Shopping cart & order management",
      "Inventory tracking",
      "Sales reports & receipt generation",
      "Payment option management",
    ],
    technologies: ["PHP", "MySQL", "JavaScript"],
  },
  {
    id: "enrollment",
    title:
      "A Development of an Automated Enrollment System with Predictive Analytics",
    category: "Education · Information management",
    description:
      "An enrollment management system designed to simplify student registration, organize academic records, and support more efficient subject selection and scheduling.",
    status: "Completion unverified",
    demoUrl: "https://www.grc-enrollment.tech/",
    image: "/images/enrollment-homepage-v3.png",
    features: [
      "Student registration & enrollment",
      "Subject & student information management",
      "Class schedules & enrollment tracking",
      "Administrative dashboard",
      "Schedule recommendations & predictive analytics",
    ],
    technologies: ["Next.js", "TypeScript", "Supabase"],
  },
];
export const categories = [
  "All skills",
  "Frontend",
  "Backend",
  "Database",
  "Tools",
  "UI/UX & Systems",
];
export const skills: Skill[] = [
  ...[
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
  ].map((name) => ({ name, category: "Frontend" })),
  ...["PHP", "API development"].map((name) => ({ name, category: "Backend" })),
  ...["MySQL", "Supabase"].map((name) => ({ name, category: "Database" })),
  ...["Git", "GitHub", "Visual Studio Code"].map((name) => ({
    name,
    category: "Tools",
  })),
  ...["Interface design", "System analysis"].map((name) => ({
    name,
    category: "UI/UX & Systems",
  })),
];
export function safeUrl(value?: string) {
  if (!value) return undefined;
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}

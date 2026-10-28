"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  Code2,
  Database,
  Braces,
  Layers3,
  Terminal,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  GraduationCap,
  ShoppingBag,
  Check,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import {
  categories,
  safeUrl,
  type Profile,
  type Project,
  type Skill,
} from "@/data/portfolio";
import ContactForm from "./contact-form";
const ParticleField = dynamic(() => import("./particles"), { ssr: false });
const links = [
  ["home", "Home"],
  ["about", "About me"],
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["contact", "Contact"],
];
function FacebookMark({ size = 20 }: { size?: number }) {
  return (
    <Image
      src="/images/facebook-icon.svg"
      alt=""
      width={size}
      height={size}
      className="social-image"
      aria-hidden="true"
    />
  );
}
function InstagramMark({ size = 16 }: { size?: number }) {
  return (
    <Image
      src="/images/instagram-icon.png"
      alt=""
      width={size}
      height={size}
      className="social-image"
      aria-hidden="true"
    />
  );
}
function ProjectPreview({ project }: { project: Project }) {
  if (project.image)
    return (
      <div className="project-image">
        <Image
          src={project.image}
          alt={`${project.title} screenshot`}
          fill
          sizes="(max-width:760px) 100vw, 50vw"
          unoptimized
        />
      </div>
    );
  const kiosk = project.id === "kiosk";
  return (
    <div
      className={`project-preview ${kiosk ? "kiosk" : "enrollment"}`}
      aria-label="Illustrative interface placeholder, not an actual project screenshot"
    >
      <div className="mini-window">
        <div className="window-bar">
          <span />
          <span />
          <span />
          <small>{kiosk ? "KIOSK / workspace" : "CAMPUS / workspace"}</small>
        </div>
        <div className="mini-app">
          <div className="mini-sidebar">
            {kiosk ? <ShoppingBag size={18} /> : <GraduationCap size={18} />}
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="mini-main">
            <div className="mini-top">
              <b>{kiosk ? "Sales overview" : "Enrollment overview"}</b>
              <span>Overview</span>
            </div>
            <div className="mini-stats">
              {["Overview", "Activity", "Records"].map((v) => (
                <div key={v}>
                  <small>{v}</small>
                  <strong>—</strong>
                  <i />
                </div>
              ))}
            </div>
            <div className="mini-chart">
              <span>
                {kiosk ? "Transaction activity" : "Enrollment activity"}
              </span>
              <div>
                {[35, 55, 42, 72, 60, 85, 67, 93, 76, 100, 83, 112].map(
                  (h, i) => (
                    <i key={i} style={{ height: h }} />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="preview-caption">
        INTERFACE CONCEPT · SCREENSHOT PLACEHOLDER
      </span>
    </div>
  );
}
export default function Portfolio({
  profile,
  projects,
  skills,
}: {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
}) {
  const root = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const [menu, setMenu] = useState(false),
    [active, setActive] = useState("home"),
    [filter, setFilter] = useState("All skills"),
    [selected, setSelected] = useState<Project | null>(null),
    [title, setTitle] = useState(0),
    [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved !== "light" && saved !== "dark") return;
    const frame = requestAnimationFrame(() => setTheme(saved));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-20% 0px -55% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((s) => observer.observe(s));
    const timer = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? undefined
      : setInterval(
          () => setTitle((t) => (t + 1) % Math.max(profile.titles.length, 1)),
          3500,
        );
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [profile.titles.length]);
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          const media = gsap.matchMedia();
          media.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from(".hero-copy > *", {
              y: 26,
              opacity: 0,
              stagger: 0.1,
              duration: 0.85,
              ease: "power3.out",
            });
            gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
              gsap.from(el, {
                y: 32,
                opacity: 0,
                duration: 0.7,
                scrollTrigger: { trigger: el, start: "top 92%", once: true },
              }),
            );
            const cleanups = gsap.utils
              .toArray<HTMLElement>(".project-card")
              .map((card) => {
                const arrow = card.querySelector(".preview-arrow");
                const enter = () => {
                  gsap.to(arrow, { rotate: 8, scale: 1.12, duration: 0.25 });
                };
                const leave = () => {
                  gsap.to(arrow, { rotate: 0, scale: 1, duration: 0.25 });
                };
                card.addEventListener("pointerenter", enter);
                card.addEventListener("pointerleave", leave);
                return () => {
                  card.removeEventListener("pointerenter", enter);
                  card.removeEventListener("pointerleave", leave);
                };
              });
            return () => cleanups.forEach((cleanup) => cleanup());
          });
        }, root);
        cleanup = () => context.revert();
      },
    );
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
  useEffect(() => {
    if (selected) {
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);
  function close() {
    dialog.current?.close();
    setSelected(null);
  }
  const facebookUrl = safeUrl(profile.facebook);
  const socials = [
    { url: profile.facebook, label: "Facebook", Icon: FacebookMark },
    { url: profile.instagram, label: "Instagram", Icon: InstagramMark },
    { url: profile.github, label: "GitHub", Icon: Code2 },
    { url: profile.linkedin, label: "LinkedIn", Icon: Layers3 },
  ].filter((s) => safeUrl(s.url));
  return (
    <div ref={root}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="nav-shell">
        <nav className="navigation container" aria-label="Main navigation">
          <a href="#home" className="brand" onClick={() => setMenu(false)}>
            <span className="brand-mark">
              m<span>.</span>
            </span>
            <span>
              {profile.shortName.toLowerCase()}
              <span className="brand-dot">.</span>dev
            </span>
          </a>
          <button
            className="menu-toggle icon-button"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="nav-links"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <div id="nav-links" className={`nav-links ${menu ? "open" : ""}`}>
            {links.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                onClick={() => setMenu(false)}
              >
                {label}
              </a>
            ))}
          </div>
          <a href="#contact" className="nav-cta">
            Let’s talk <ArrowUpRight size={15} />
          </a>
          <button
            className="theme-toggle icon-button"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-pressed={theme === "dark"}
            onClick={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </nav>
      </header>
      <main id="main">
        <div className="zodiac-backdrop" aria-hidden="true">
          <div className="zodiac-backdrop-ring zodiac-backdrop-ring-outer" />
          <div className="zodiac-backdrop-ring zodiac-backdrop-ring-inner" />
          <div className="zodiac-backdrop-core">
            <span>✦</span>
          </div>
        </div>
        <section id="home" className="hero container">
          <ParticleField />
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> CURIOUS MIND. PURPOSEFUL CODE.
            </div>
            <h1>
              Hi, I’m
              <br />
              <span>{profile.name.split(" ").slice(0, 2).join(" ")}</span>
              <br />
              {profile.name.split(" ").slice(2).join(" ")}
              <span className="accent">.</span>
            </h1>
            <div className="role-line">
              <span />
              {profile.titles[title] || "Aspiring IT Professional"}
            </div>
            <p>
              I turn ideas into thoughtful digital experiences.
              <br className="desktop-break" /> Building useful systems. Learning
              with every line.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#projects">
                View my projects <ArrowUpRight size={18} />
              </a>
              <a className="button secondary" href="#contact">
                Contact me <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-location">
              <MapPin size={14} />
              {profile.location}
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Decorative developer profile illustration"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <svg className="orbit-svg" viewBox="0 0 500 500" aria-hidden="true">
              <path
                d="M30 270 Q250 -30 475 250 M70 390 Q260 110 465 355"
                fill="none"
                stroke="currentColor"
                strokeDasharray="4 10"
              />
            </svg>
            <div className="floating-tag tag-react">
              <Braces size={20} />
              <span>React & Next.js</span>
            </div>
            <div className="floating-tag tag-data">
              <Database size={19} />
              <span>Ideas → systems</span>
            </div>
            <a
              className="portrait-link"
              href={facebookUrl || "#contact"}
              target={facebookUrl ? "_blank" : undefined}
              rel={facebookUrl ? "noopener noreferrer" : undefined}
              aria-label="Open Mharc Angelo Cardenas on Facebook"
            >
              <div className="portrait-card">
                <div className="portrait-top">
                  <span>
                    <i /> developer.profile
                  </span>
                  <Code2 size={17} />
                </div>
                <div className="portrait-body">
                  {profile.portrait ? (
                    <Image
                      src={profile.portrait}
                      alt={profile.name}
                      width={300}
                      height={300}
                      priority
                    />
                  ) : (
                    <div className="monogram">
                      <span>MC</span>
                      <Code2 className="monogram-code" size={90} />
                    </div>
                  )}
                  <span className="portrait-label">
                    DESIGN. DEVELOP. IMPROVE.
                  </span>
                </div>
                <div className="portrait-bottom">
                  <div>
                    <strong>{profile.name}</strong>
                    <span>Always a work in progress.</span>
                  </div>
                  <span className="code-badge">&lt;/&gt;</span>
                </div>
              </div>
            </a>
            <div className="code-note">
              <span>const</span> mindset = <b>&quot;keep building&quot;</b>;
              <br />
              <span>while</span> (curious) &#123; <i>learn();</i> &#125;
            </div>
            <span className="art-star">✳</span>
          </div>
          <div className="hero-bottom">
            <a href="#about">
              <span className="scroll-pill">
                <ArrowDown size={15} />
              </span>
              SCROLL TO EXPLORE
            </a>
            <span>
              BASED IN THE PHILIPPINES <span className="tiny-star">✦</span>{" "}
              BUILDING FOR PEOPLE
            </span>
          </div>
        </section>
        <div className="tech-ribbon">
          <div className="container">
            <span>THOUGHTFULLY BUILT WITH</span>
            {["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"].map(
              (name, i) => (
                <span key={name}>
                  {i === 0 ? <Layers3 /> : i === 4 ? <Database /> : <Code2 />}
                  {name}
                </span>
              ),
            )}
          </div>
        </div>
        <section id="about" className="section container">
          <div className="section-label reveal">
            01 / THE PERSON BEHIND THE CODE
          </div>
          <div className="about-grid">
            <div className="reveal">
              <h2>
                A curious mind.
                <br />A builder <span>at heart.</span>
              </h2>
              <div className="about-visual">
                <div className="about-visual-grid" />
                <Code2 size={58} />
                <span>
                  Turning “what if” into
                  <br />
                  <strong>“here’s how.”</strong>
                </span>
                <small>LEARN → BUILD → REFINE</small>
              </div>
            </div>
            <div className="about-copy reveal">
              <span className="overline">A LITTLE ABOUT ME</span>
              <h3>
                Technology is most meaningful
                <br />
                when it makes life simpler.
              </h3>
              <p>{profile.introduction}</p>
              <p>{profile.about}</p>
              <div className="values">
                <div>
                  <Terminal size={20} />
                  <strong>Practical problem-solving</strong>
                  <span>Useful solutions to real needs.</span>
                </div>
                <div>
                  <Sparkles size={20} />
                  <strong>Thoughtful experiences</strong>
                  <span>Clarity, usability, and a little delight.</span>
                </div>
              </div>
              <a className="text-link" href="#contact">
                Let’s build something meaningful <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </section>
        <section id="skills" className="section skills-section">
          <div className="container">
            <div className="section-label reveal">
              02 / MY DEVELOPER TOOLKIT
            </div>
            <div className="section-heading reveal">
              <h2>
                The tools behind
                <br />
                <span>the ideas.</span>
              </h2>
              <p>
                A growing toolkit for bringing interfaces, data,
                <br />
                and systems together. Always learning.
              </p>
            </div>
            <div className="filters" aria-label="Filter skills">
              {categories.map((c) => (
                <button
                  key={c}
                  aria-pressed={filter === c}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="skills-grid">
              {skills
                .filter((s) => filter === "All skills" || s.category === filter)
                .map((s, i) => (
                  <div className="skill-card" key={s.name}>
                    <span className={`skill-icon color-${i % 4}`}>
                      {s.category === "Database" ? (
                        <Database />
                      ) : s.category === "Tools" ? (
                        <Terminal />
                      ) : s.category === "UI/UX & Systems" ? (
                        <Layers3 />
                      ) : (
                        <Braces />
                      )}
                    </span>
                    <div>
                      <strong>{s.name}</strong>
                      <small>{s.category}</small>
                    </div>
                    <ArrowUpRight size={15} />
                  </div>
                ))}
            </div>
            <p className="section-note">
              A learning-focused toolkit, not a claim of expert-level
              proficiency.
            </p>
          </div>
        </section>
        <section id="projects" className="section container">
          <div className="section-label reveal">03 / SELECTED WORK</div>
          <div className="section-heading reveal">
            <h2>
              Ideas made
              <br />
              <span>into systems.</span>
            </h2>
            <p>
              Exploring real-world challenges through
              <br />
              purposeful design and development.
            </p>
          </div>
          <div className="projects-grid">
            {projects.map((p, i) => (
              <article key={p.id} className="project-card reveal">
                <button
                  className="preview-button"
                  onClick={() => setSelected(p)}
                  aria-label={`View ${p.title}`}
                >
                  <ProjectPreview project={p} />
                  <span className="preview-arrow">
                    <ArrowUpRight />
                  </span>
                </button>
                <div className="project-content">
                  <div className="project-meta">
                    <span>
                      0{i + 1} / {p.category}
                    </span>
                    <Code2 size={16} />
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="badges">
                    {p.technologies?.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="project-actions">
                    <button
                      className="text-link"
                      onClick={() => setSelected(p)}
                    >
                      View details <ArrowUpRight size={17} />
                    </button>
                    {safeUrl(p.demoUrl) && (
                      <a
                        href={safeUrl(p.demoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live demo <ArrowUpRight size={14} />
                      </a>
                    )}
                    {safeUrl(p.sourceUrl) && (
                      <a
                        href={safeUrl(p.sourceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Code2 size={14} /> Source code
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="contact" className="section contact-section">
          <div className="container">
            <div className="section-label reveal">04 / LET’S CONNECT</div>
            <div className="contact-grid">
              <div className="reveal">
                <h2>
                  Good things start
                  <br />
                  with <span>a conversation.</span>
                </h2>
                <p>
                  Have a project in mind, an opportunity to share,
                  <br />
                  or just want to say hello? I’d love to hear from you.
                </p>
                <div className="contact-details">
                  <div>
                    <MapPin />
                    <span>
                      <small>BASED IN</small>
                      {profile.location}
                    </span>
                  </div>
                  {profile.showPhone && profile.phone && (
                    <a href={`tel:${profile.phone}`}>
                      <Phone />
                      <span>
                        <small>GIVE ME A CALL</small>
                        {profile.phone}
                      </span>
                    </a>
                  )}
                  {profile.email && (
                    <a href={`mailto:${profile.email}`}>
                      <Mail />
                      <span>
                        <small>EMAIL ME</small>
                        {profile.email}
                      </span>
                    </a>
                  )}
                </div>
                <div className="socials">
                  {socials.map(({ url, label, Icon }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="reveal">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="container footer">
        <div>
          <a className="brand" href="#home">
            <span className="brand-mark">
              m<span>.</span>
            </span>
            <span>{profile.name}</span>
          </a>
          <p>Thoughtful code. Meaningful experiences.</p>
        </div>
        <div className="footer-right">
          <div>
            {links.slice(1).map(([id, label]) => (
              <a href={`#${id}`} key={id}>
                {label}
              </a>
            ))}
            <a href="#home" className="icon-button" aria-label="Back to top">
              <ArrowUp size={18} />
            </a>
          </div>
          <small>
            © {new Date().getFullYear()} {profile.name}. Built with purpose.
          </small>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="project-dialog"
        onCancel={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        aria-labelledby="project-title"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <button
              autoFocus
              className="dialog-close icon-button"
              onClick={close}
              aria-label="Close project details"
            >
              <X />
            </button>
            <ProjectPreview project={selected} />
            <div className="dialog-content">
              <span className="overline">{selected.category}</span>
              <h2 id="project-title">{selected.title}</h2>
              <p>{selected.description}</p>
              <div className="status-label">
                {selected.status || "Completion unverified"}
              </div>
              <h3>Scope & planned capabilities</h3>
              <p className="section-note">
                These are project goals, not verified completed features.
              </p>
              <ul>
                {selected.features?.map((f) => (
                  <li key={f}>
                    <Check size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="badges">
                {selected.technologies?.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              {safeUrl(selected.demoUrl) && (
                <a
                  className="button secondary"
                  href={safeUrl(selected.demoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live demo <ArrowUpRight size={17} />
                </a>
              )}
              {safeUrl(selected.sourceUrl) && (
                <a
                  className="button secondary"
                  href={safeUrl(selected.sourceUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source code <Code2 size={17} />
                </a>
              )}
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}

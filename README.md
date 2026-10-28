# Mharc · Developer Portfolio

A responsive Next.js App Router portfolio with TypeScript, Tailwind CSS, GSAP/ScrollTrigger, tsParticles, Lucide icons, Sanity content, and a Supabase contact inbox. No paid account is required to view the local portfolio.

## 1. Start here

Open a terminal in **portfolio-site**, not its parent folder:

```powershell
cd "C:\Users\mharc\OneDrive\Desktop\My Portfolio\portfolio-site"
npm install
npm run dev
```

Open the Local URL printed in the terminal (normally http://localhost:3000). To stop the server, press Ctrl+C. If port 3000 is already occupied, use the port printed by Next.js. Use Node.js 22.12+ (or the newer version required by installed Sanity) and npm.

```powershell
npm run lint
npm run typecheck
npm run build
npm start
```

`npm start` serves a completed production build. Do not run it while the development server is using the same port. The supplied Next.js project uses its existing Next.js 16.4.3/React 19.3 configuration; installed package versions are recorded in the lockfile.

## 2. Change your content

Edit [data/portfolio.ts](./data/portfolio.ts). It contains your name, introduction, location, phone, titles, projects, and skills. Set `showPhone: false` to hide the phone. Blank email/social fields are intentionally hidden. No residential address is included. Technology badges are editable suggestions, not verified implementations or proficiency claims.

For each project, edit `description`, `features`, `technologies`, and `status`. Current features are labeled planned/unverified. Verify them before describing anything as completed. Add real HTTPS `demoUrl` and `sourceUrl` values to display their buttons; otherwise the buttons stay hidden. External URLs are checked for HTTP(S) schemes.

### Add real screenshots or a portrait

1. Create `public/images` and put your image there, for example `kiosk.webp`.
2. Set the project's `image` to `/images/kiosk.webp`.
3. Set the profile's `portrait` to `/images/profile.webp` for your headshot.
4. Prefer compressed WebP/AVIF images. Screenshots should be approximately 1400×850; portraits should be square. Next Image handles responsive image delivery.

Until configured, the site shows a monogram and clearly labeled, CSS-built illustrative interface concepts. These are not actual application screenshots. Sanity's image CDN is allowed by the Next.js image configuration; add a narrow remote pattern if you choose another image provider.

## 3. Environment variables

Copy [.env.example](./.env.example) to `.env.local`, then fill in only the services you want to use. Restart the dev server after editing environment variables. `.env.local` is ignored by Git.

- `NEXT_PUBLIC_*` values are public browser configuration. Never put service keys or private read tokens there.
- `SUPABASE_SERVICE_ROLE_KEY`, `CONTACT_RATE_LIMIT_SECRET`, and `SANITY_API_READ_TOKEN` stay server-side.
- Never paste secrets into your portfolio content or commit them to Git.

## 4. Sanity content editing

The site reads published project, skill, and profile documents through the official `@sanity/client`, server-side. Missing credentials, unavailable CMS, or empty collections use local editable content. Profile non-null fields override local values. Create just one Profile document. Changes are fetched when the page is requested (the Sanity CDN may take a short time to update).

1. Create a project and dataset at https://www.sanity.io/manage.
2. Put the project ID and dataset into `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` in `.env.local`.
3. For a private dataset, create a read-only token and set `SANITY_API_READ_TOKEN` in `.env.local`.
4. For the standalone Studio CLI, create a separate ignored `.env` with `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` from the example. The Sanity CLI uses these `SANITY_STUDIO_*` variables.
5. Run `npm run studio` and open http://localhost:3333. Authenticate with your own Sanity account. Add `http://localhost:3333` as an allowed CORS origin in Sanity if prompted.
6. Create and publish content using the Projects, Skills, and Profile schemas. Upload images, set display order, and add verified links.

Schemas: [sanity/schema.ts](./sanity/schema.ts). Studio configuration: [sanity.config.ts](./sanity.config.ts). The Studio runs separately to keep the public site's bundle lightweight. `npm run studio:build` builds the Studio when credentials are configured; use Sanity's CLI hosting instructions if you want a hosted Studio. Do not commit Studio build output.

Official reference: [Sanity JavaScript client](https://www.sanity.io/docs/apis-and-sdks/js-client-getting-started).

## 5. Supabase: working contact messages

Without Supabase, form validation works, but sending returns a truthful unavailable message; no fake success and no messages saved locally.

1. Create a Supabase project at https://supabase.com/dashboard.
2. In SQL Editor, run [supabase/setup.sql](./supabase/setup.sql).
3. Copy the project URL and public anon/publishable-compatible client key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Set `SUPABASE_SERVICE_ROLE_KEY` to the server service-role key. This key must never be public.
5. Generate a long random value for `CONTACT_RATE_LIMIT_SECRET`. For example, run `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` locally and paste the output directly into your environment file.
6. Restart Next.js and send a message. Confirm the record exists in `contact_messages`. A success response only occurs after insertion succeeds.

### Gmail notifications

The contact form saves messages to the private Supabase inbox. To also receive each message in Gmail, create a Resend account and verify a sending domain (or use the Resend test sender while developing), then add these server-only variables to `.env.local` and your production host:

```text
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=mharcangelo03@gmail.com
CONTACT_FROM_EMAIL=Portfolio <hello@your-verified-domain.com>
```

The visitor's email is used as `Reply-To`, so you can reply directly from Gmail. Never expose `RESEND_API_KEY` with a `NEXT_PUBLIC_` prefix or commit it to Git. Restart the dev server after changing environment variables.

### Private admin inbox

1. Create your administrator user in Supabase **Authentication → Users**, with your own email and strong password. Disable public signup unless you explicitly need it. There is no public signup screen or hardcoded admin password.
2. Copy that user's UUID. In the SQL Editor run:

```sql
insert into public.portfolio_admins(user_id) values ('YOUR-AUTH-USER-UUID');
```

3. Open `/admin` and sign in. You can see the latest 100 messages and mark them read/unread. New messages refresh through a Supabase real-time subscription; realtime uses the same RLS permissions.
4. A signed-in user without membership cannot read messages. Anonymous database reads and direct inserts are not granted. Authenticated admins can update only `read_status`, not message contents. Manage older messages in the Supabase dashboard if needed.

The admin UI is client-side, but its actual security is enforced at the database. No inbox data is embedded in the public page. Sessions use Supabase's browser session management; sign out on shared devices.

### Contact protection and production hosting

The server validates field sizes, email, content type, origin, honeypot, and a 20 KB request limit. It uses an atomic PostgreSQL rate-limit function: five valid submission attempts per hashed IP per 15 minutes, shared across application instances. Only the service role may call the function. Raw IP addresses are not stored. Expired rate-limit rows are removed as new requests arrive.

On Vercel, IP identification uses the platform-controlled `x-vercel-forwarded-for` header. On another host, set `TRUSTED_IP_HEADER` to a header your trusted ingress **overwrites**, and ensure users cannot bypass that proxy. Missing production IP identification fails closed. Add your hosting provider's WAF/rate-limit rules to reduce abusive traffic before it reaches your server/database. No external anti-bot account is required for the built-in honeypot.

Verify RLS before launch: anonymous SELECT/INSERT should fail; an ordinary signed-in account should see no messages; only the admin should read and change read status. Run a configured end-to-end check for sending, persistence, rate limiting, realtime, and sign-out. These account-dependent checks cannot be verified without your credentials.

Official references: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes).

## 6. Deploy to Vercel

1. Push this project to a GitHub repository you own. Keep `.env.local` and `.env` out of it.
2. Import that repository into Vercel. If the repository contains the parent folder, set **Root Directory** to `portfolio-site`; if this folder is the repository root, leave it at the root.
3. Use the detected Next.js preset, `npm run build`, and standard Next.js output settings. Use Node.js 22.12+ or a compatible newer LTS.
4. Add the required environment variables in Vercel's project settings for Production (and Preview if desired).
5. Deploy, then test the contact form and `/admin` with the configured database. Add the final site URL to your Supabase Auth URL settings. The password login here does not use an email redirect, but future recovery flows will need allowed redirect URLs.
6. If using a hosted Studio, allow its actual origin in Sanity CORS settings. This website's Sanity reads happen server-side.

Deployment is not performed automatically: this brief targets your existing local Next.js project and asks for Vercel instructions. No external hosting account was invented or created.

## 6a. Help Google find the portfolio

The site includes a descriptive title and description, canonical URL, `Person` and `WebSite` structured data, a generated `/sitemap.xml`, and `/robots.txt` that allows the public portfolio while excluding the admin/API routes. Set `NEXT_PUBLIC_SITE_URL` to the final public HTTPS URL before deployment so these URLs are correct.

To make the site searchable:

1. Deploy it to a public URL such as a Vercel domain or a custom domain. `localhost` can only be viewed on your computer and cannot be indexed.
2. Open [Google Search Console](https://search.google.com/search-console) and verify ownership of the deployed domain.
3. Submit `https://your-domain.com/sitemap.xml` in Search Console.
4. Use URL Inspection for the homepage and request indexing.
5. Add the portfolio URL to your public profiles, resume, school/community profiles, or other legitimate pages. Crawlable links help Google discover a new site.

Google controls the final result title and timing; search visibility is not guaranteed and may take days or weeks after crawling. Search for the exact phrase `"Mharc Angelo S. Cardenas"` after deployment. Keep your public content accurate and avoid adding repeated keyword text just to influence rankings.

## 7. Project map

- [app/page.tsx](./app/page.tsx): server-side content loading.
- [components/portfolio.tsx](./components/portfolio.tsx): navigation, sections, skill filters, project dialogs, animation lifecycle.
- [components/particles.tsx](./components/particles.tsx): lazy-loaded lightweight canvas effect.
- [components/contact-form.tsx](./components/contact-form.tsx): accessible form, validation, sending states.
- [app/globals.css](./app/globals.css): responsive theme, layout, component styling, reduced motion.
- [data/portfolio.ts](./data/portfolio.ts): local content, contact visibility, project data.
- [lib/content.ts](./lib/content.ts): optional server-only CMS integration.
- [app/api/contact/route.ts](./app/api/contact/route.ts): secure server submission endpoint.
- [components/admin-inbox.tsx](./components/admin-inbox.tsx): login and authorized real-time inbox.
- [supabase/setup.sql](./supabase/setup.sql): database schema, permissions, RLS, rate limiter.
- [app/layout.tsx](./app/layout.tsx) and [app/opengraph-image.tsx](./app/opengraph-image.tsx): SEO and generated sharing image.

## 8. Accessibility and performance

### Browser checks

Run `npm run build`, then `npm start -- --port 3100` in one terminal and `npm run test:e2e` in another. The checks use installed Microsoft Edge by default. Set `PLAYWRIGHT_CHANNEL=chrome` if you prefer Chrome, or configure the channel in [playwright.config.ts](./playwright.config.ts) for your environment. Tests cover navigation, responsive overflow, project dialogs, filtering, contact validation/failure states, and admin isolation without credentials. They expect services to be unconfigured; use a dedicated local test environment. Credential-dependent persistence and RLS checks still need your own Supabase account.

Sanity's transitive CLI packages use narrowly scoped overrides for patched js-yaml, smol-toml, undici, and uuid versions. The installed dependency audit is clean. React/React DOM were patched to 19.3.1 to satisfy the Studio peer requirement.

For deployment, set `NEXT_PUBLIC_SITE_URL` to your final HTTPS site URL; local setup uses localhost. Vercel's production hostname is used automatically if no explicit site URL is set.

Keyboard-visible focus, skip link, semantic sections, labeled form controls, native modal focus containment/Escape handling, mobile navigation, and reduced-motion support are included. Particles are skipped on small screens, reduced-motion preferences, and low-core devices; they run at 30 FPS, pause outside the viewport/background tab, and load separately. GSAP effects clean up on unmount. No remote font download is necessary to build.

## Troubleshooting

- **Missing script: dev**: run commands from this folder, not `My Portfolio`.
- **Contact unavailable**: check Supabase variables, rate-limit secret, SQL setup, and production trusted proxy header. No success is shown unless storage succeeds.
- **No inbox permission**: add the correct Auth UUID to `portfolio_admins` using SQL Editor, then sign out/in.
- **CMS changes absent**: publish documents and verify project/dataset/token. Empty collections intentionally fall back to local entries.
- **Port occupied**: stop your existing dev process with Ctrl+C or use the alternate port printed by Next.js.

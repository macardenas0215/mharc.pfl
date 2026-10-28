import { test, expect } from "@playwright/test";
test("portfolio filtering and accessible project dialog", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Mharc Angelo",
  );
  await expect(page.locator("#hero-particles canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "Database", exact: true }).click();
  await expect(page.locator(".skill-card")).toHaveCount(2);
  await expect(page.locator(".skill-card").first()).toContainText("MySQL");
  await page
    .getByRole("button", { name: "View details", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(
    "not verified completed features",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const liveDemo = page.getByRole("link", { name: "Live demo", exact: true });
  await expect(liveDemo).toHaveCount(1);
  await expect(liveDemo).toHaveAttribute(
    "href",
    "https://www.grc-enrollment.tech/",
  );
  expect(errors).toEqual([]);
});
test("mobile navigation and layout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .locator("#nav-links")
    .getByRole("link", { name: "Projects", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(page).toHaveURL(/#projects$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/");
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
test("unconfigured contact never claims success", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Full name", { exact: true }).fill("Test Visitor");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("visitor@example.com");
  await page.getByLabel("Subject", { exact: true }).fill("Portfolio inquiry");
  await page
    .getByLabel("Message", { exact: true })
    .fill("I would like to discuss a potential project.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("not saved");
});
test("contact API rejects invalid inputs, origins and oversized bodies", async ({
  request,
}) => {
  expect(
    (await request.post("/api/contact", { data: { full_name: "a" } })).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/contact", {
        headers: { origin: "https://untrusted.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/contact", {
        data: { message: "x".repeat(21000) },
      })
    ).status(),
  ).toBe(413);
  expect(
    (
      await request.post("/api/contact", {
        data: {
          full_name: "Test User",
          email: "test@example.com",
          subject: "Hello",
          message: "This is a valid test message.",
          website: "spam",
        },
      })
    ).status(),
  ).toBe(400);
});
test("admin does not expose inbox when unconfigured", async ({ page }) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Private inbox." }),
  ).toBeVisible();
  await expect(
    page.getByText("Connect Supabase", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".message-card")).toHaveCount(0);
});
test("reduced-motion desktop renders without canvas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#hero-particles canvas")).toHaveCount(0);
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
});
test("tablet layout stays inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/tablet.png", fullPage: true });
});

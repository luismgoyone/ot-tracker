import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const VIEWPORT = { width: 1280, height: 800 };
const DIR = 'test-results/demo';
const OUT = `${DIR}/ot-tracker`;

/** The dashboard is ready once the stats and all four cards have data. */
async function waitForDashboard(page: Page) {
  await expect(page.getByText('Approved OT Hours', { exact: true })).toBeVisible();
  for (const title of ['Monthly Approved OT', 'Approved OT Hours by Department', 'Daily Approved OT', 'Top OT Users']) {
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  await expect(page.locator('.recharts-wrapper')).toHaveCount(3);
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

/**
 * A ~15s admin tour for the portfolio site: dashboard → OT Management → approve a pending
 * request. Writes `ot-tracker.webm` plus `ot-tracker.json` (seconds of lead-in to trim).
 */
test('record the OT Tracker demo', async ({ browser, page }) => {
  // Off camera: sign in as the admin and keep the persisted session (localStorage).
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('admin@company.com');
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await waitForDashboard(page);
  const storageState = await page.context().storageState();

  await mkdir(DIR, { recursive: true });
  const rec = await browser.newContext({
    viewport: VIEWPORT,
    storageState,
    recordVideo: { dir: DIR, size: VIEWPORT },
  });
  const started = Date.now();
  const p = await rec.newPage();
  const pause = (ms: number) => p.waitForTimeout(ms);

  await p.goto('/dashboard');
  await waitForDashboard(p);
  const leadIn = (Date.now() - started) / 1000;
  await pause(3000);

  await p.mouse.move(640, 500);
  await p.mouse.wheel(0, 420);
  await pause(2400);

  await p.getByRole('button', { name: 'OT Management' }).click();
  await expect(p).toHaveURL(/\/ot-management$/);
  await expect(p.getByRole('row')).not.toHaveCount(0);
  await pause(1400);

  await p.getByRole('tab', { name: 'Pending' }).click();
  await pause(900);
  await p.getByRole('textbox', { name: 'Search OT records' }).click();
  await p.keyboard.type('david', { delay: 110 });
  const row = p.getByRole('row').filter({ hasText: 'David Lee' }).filter({ hasText: 'Load testing' });
  await expect(row).toHaveCount(1);
  await expect(p.getByRole('row').filter({ hasText: 'David Lee' })).toHaveCount(3);
  await pause(1000);

  await row.getByRole('button', { name: 'View details' }).click();
  const dialog = p.getByRole('dialog', { name: 'OT Record Details' });
  await expect(dialog).toBeVisible();
  await pause(2000);

  await dialog.getByRole('button', { name: 'Approve' }).click();
  await expect(dialog).toBeHidden();
  await expect(row).toHaveCount(0);
  await expect(p.getByRole('row').filter({ hasText: 'David Lee' })).toHaveCount(2);
  await pause(2200);

  const video = p.video()!;
  await rec.close();
  await video.saveAs(`${OUT}.webm`);
  await video.delete();
  await writeFile(`${OUT}.json`, JSON.stringify({ leadIn }, null, 2));
});

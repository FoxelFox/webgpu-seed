import { test, expect } from "@playwright/test";
import { collectConsole } from "./console-collector";

/**
 * Smoke test: start the app, take a screenshot, log every console
 * warning/error (plus uncaught exceptions and failed requests), deduplicated.
 *
 * Any single unique warning/error fails the test. Set FAIL_ON_CONSOLE=0 to
 * log them without failing.
 */

// how long to keep the page alive after load so per-frame errors show up
const SETTLE_MS = 1500;

test("boot", async ({ page }, testInfo) => {
	const consoleLog = collectConsole(page);

	await page.goto("/", { waitUntil: "load" });
	await page.waitForTimeout(SETTLE_MS);

	const webgpu = await page.evaluate(() => ({
		navigatorGpu: typeof navigator.gpu !== "undefined",
		fallbackShown: document.body.innerText.includes("No GPU available"),
	}));

	const shotPath = testInfo.outputPath("screenshot.png");
	await page.screenshot({ path: shotPath });
	await testInfo.attach("screenshot", { path: shotPath, contentType: "image/png" });

	const unique = consoleLog.entries();
	const lines = [
		`webgpu: navigator.gpu=${webgpu.navigatorGpu} fallback=${webgpu.fallbackShown}`,
		`${unique.length} unique / ${consoleLog.total()} total warnings+errors`,
		...consoleLog.lines(),
	];

	console.log(lines.join("\n"));
	await testInfo.attach("console.log", {
		body: lines.join("\n") + "\n",
		contentType: "text/plain",
	});

	const failOnConsole = process.env.FAIL_ON_CONSOLE !== "0";
	if (failOnConsole) {
		expect(
			unique,
			`${unique.length} console warning(s)/error(s) while booting\n${consoleLog.lines().join("\n")}`,
		).toHaveLength(0);
	}
});

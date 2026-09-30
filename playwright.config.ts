import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);
const baseURL = `http://127.0.0.1:${port}`;

// Playwright's bundled headless chromium exposes no WebGPU adapter ("No available
// adapters."), so use the installed Chrome channel by default.
// Set PLAYWRIGHT_CHANNEL="" to fall back to bundled chromium (app renders the
// "No GPU available" fallback page instead).
const channel = process.env.PLAYWRIGHT_CHANNEL ?? "chrome";

export default defineConfig({
	testDir: "./tests",
	timeout: 30_000,
	outputDir: "./test-results",
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL,
		headless: true,
		viewport: { width: 1280, height: 720 },
		screenshot: "off",
		trace: "off",
		video: "off",
		launchOptions: {
			args: ["--enable-unsafe-swiftshader"],
		},
		...(channel ? { channel } : {}),
	},
	webServer: {
		command: "bun run dev && bun run serve",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
});

import type { Page } from "@playwright/test";

export type ConsoleEntry = {
	type: string;
	text: string;
	location?: string;
	count: number;
};

/**
 * Collapse the parts of a message that vary between identical repeats
 * (addresses, ids, frame counters, timestamps) so per-frame spam dedupes
 * down to a single line with a count.
 */
function signature(entry: { type: string; text: string; location?: string }) {
	const text = entry.text
		.replace(/\s+/g, " ")
		.replace(/0x[0-9a-f]+/gi, "#")
		.replace(/\b\d+\b/g, "#")
		.trim();

	return `${entry.type}|${text}|${entry.location ?? ""}`;
}

function locationOf(loc?: { url?: string; lineNumber?: number; columnNumber?: number }) {
	if (!loc?.url) return undefined;
	return `${loc.url}:${loc.lineNumber ?? 0}:${loc.columnNumber ?? 0}`;
}

function firstFrame(stack?: string) {
	return stack?.split("\n").find((line) => line.trim().startsWith("at "))?.trim();
}

/**
 * Listens to console warnings/errors, uncaught exceptions and failed requests
 * on a page, deduplicating repeats. Call before page.goto().
 */
export function collectConsole(page: Page) {
	const entries = new Map<string, ConsoleEntry>();

	const record = (type: string, text: string, location?: string) => {
		const clean = text.replace(/\s+/g, " ").trim();
		if (!clean) return;

		const key = signature({ type, text: clean, location });
		const existing = entries.get(key);

		if (existing) existing.count += 1;
		else entries.set(key, { type, text: clean, location, count: 1 });
	};

	page.on("console", (msg) => {
		const type = msg.type();
		if (type !== "warning" && type !== "error") return;
		record(type, msg.text(), locationOf(msg.location()));
	});

	page.on("pageerror", (err) => record("pageerror", err.message, firstFrame(err.stack)));

	page.on("requestfailed", (req) =>
		record("requestfailed", `${req.method()} ${req.url()} ${req.failure()?.errorText ?? "failed"}`),
	);

	return {
		entries: (): ConsoleEntry[] => [...entries.values()],
		total: () => [...entries.values()].reduce((sum, e) => sum + e.count, 0),
		lines: () =>
			[...entries.values()].map(
				(e) =>
					`[${e.count}x] ${e.type}: ${e.text}${e.location ? `\n        at ${e.location}` : ""}`,
			),
	};
}

const port = Number(process.env.PORT ?? 3000);
const root = "./dist";

const types: Record<string, string> = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".wgsl": "text/plain; charset=utf-8",
	".wasm": "application/wasm",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".webp": "image/webp",
};

const server = Bun.serve({
	port,
	async fetch(req) {
		let path = decodeURIComponent(new URL(req.url).pathname);
		if (path === "/") path = "/index.html";

		// strip any ../ segments so we never read outside ./dist
		const safe = path.replace(/(\.\.(\/|\\|$))+/g, "");
		// browsers probe for this on their own; not an app resource
		if (path === "/favicon.ico") return new Response(null, { status: 204 });

		const file = Bun.file(`${root}${safe}`);

		if (!(await file.exists())) {
			return new Response(`404 ${path}`, { status: 404 });
		}

		return new Response(file, {
			headers: {
				"content-type":
					types[path.slice(path.lastIndexOf("."))] ??
					"application/octet-stream",
				"cache-control": "no-store",
			},
		});
	},
});

console.log(`serving ${root} at http://localhost:${server.port}`);

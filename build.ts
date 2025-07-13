import { wgsl } from './wgsl-plugin';

const minify = process.argv.includes('--minify');

const result = await Bun.build({
  entrypoints: ['./src/index.html'],
  outdir: './dist',
  plugins: [
    wgsl({ minify })
  ],
  target: 'browser',
  minify: minify,
  naming: {
    chunk: '[name].[ext]'
  }
});

if (!result.success) {
  console.error("Build failed!");
  for (const message of result.logs) {
    console.error(message);
  }
}
import { GPUContext } from "./gpu";
import { Paint } from "./pipeline/paint";
import { ContextUniform } from "./data/context";

export const gpu = new GPUContext();
await gpu.init();

export const device = gpu.device;
export const context = gpu.context;
export const canvas = gpu.canvas;
export const mouse = gpu.mouse;
export const time = gpu.time;
export const contextUniform = new ContextUniform();

const uniforms = [contextUniform];
const pipelines = [new Paint()];

loop();

// this has to be set after first render loop due to safari bug
document
	.getElementsByTagName("canvas")[0]
	.setAttribute("style", "position: fixed;");

function loop() {
	gpu.update();

	for (const uniform of uniforms) {
		uniform.update();
	}

	for (const pipeline of pipelines) {
		pipeline.render();
	}
	requestAnimationFrame(loop);
}

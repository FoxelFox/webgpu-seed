import { GPUContext } from "./gpu";
import { Post } from "./pipeline/post";

export const gpu = new GPUContext();
await gpu.init();

export const device = gpu.device;
export const context = gpu.context;
export const canvas = gpu.canvas;
export const mouse = gpu.mouse;

const pipelines = [new Post()];

loop();

function loop() {
  for(const pipeline of pipelines) {
    pipeline.render();
  }
  requestAnimationFrame(loop);
}
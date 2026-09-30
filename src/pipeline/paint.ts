import { context, device, contextUniform } from "../index";
import shader from "./paint.wgsl" with { type: "text" };

export class Paint {
	pipeline: GPURenderPipeline;
	uniformBindGroup: GPUBindGroup;

	constructor() {
		const module = device.createShaderModule({ code: shader });

		this.pipeline = device.createRenderPipeline({
			layout: "auto",
			vertex: { module, entryPoint: "main_vs" },
			fragment: {
				module,
				entryPoint: "main_fs",
				targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
			},
			primitive: { topology: "triangle-list" },
		});

		this.uniformBindGroup = device.createBindGroup({
			layout: this.pipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: contextUniform.uniformBuffer } },
			],
		});
	}

	render() {
		device.queue.writeBuffer(
			contextUniform.uniformBuffer,
			0,
			contextUniform.uniformArray,
		);

		const encoder = device.createCommandEncoder();
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					// same color as BACKGROUND_COLOR in pipeline/color.wgsl
					clearValue: { r: 0.125, g: 0.125, b: 0.125, a: 1 },
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});

		pass.setPipeline(this.pipeline);
		pass.setBindGroup(0, this.uniformBindGroup);
		pass.draw(6);
		pass.end();

		device.queue.submit([encoder.finish()]);
	}
}

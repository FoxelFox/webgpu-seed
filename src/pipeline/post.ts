import { device, context, canvas, mouse, time } from "../index";
import shader from "./post.wgsl" with {type: "text"};

export class Post {
  pipeline: GPURenderPipeline;

  uniformArray: Float32Array = new Float32Array(8);
  uniformBuffer: GPUBuffer;
  uniformBindGroup: GPUBindGroup;

  frameBuffers: GPUTexture[] = [];
  frameBufferBindgroups: GPUBindGroup[] = [];
  sampler: GPUSampler;

  frame = 0;

  constructor() {
    this.pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({
          code: shader
        }),
        entryPoint: 'main_vs',
      },
      fragment: {
        module: device.createShaderModule({
          code: shader
        }),
        entryPoint: 'main_fs',
        targets: [
          { format: 'bgra8unorm' },
          { format: 'bgra8unorm' }
        ]
      },
      primitive: {
        topology: 'triangle-list'
      }
    });

    this.uniformBuffer = device.createBuffer({
      size: this.uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.uniformBindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: { buffer: this.uniformBuffer }
      }]
    });


    this.resizeFrameBuffer();
  }

  render() {
    if (this.frameBuffers[0].width !== canvas.width || this.frameBuffers[0].height !== canvas.height) {
      this.resizeFrameBuffer();
    }

    // update uniform
    this.uniformArray[0] = canvas.width;
    this.uniformArray[1] = canvas.height;
    this.uniformArray[2] = mouse.ax;
    this.uniformArray[3] = mouse.ay;
    this.uniformArray[4] = mouse.rx;
    this.uniformArray[5] = mouse.ry;
    this.uniformArray[6] = time.now;
    this.uniformArray[7] = time.delta;

    device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformArray);

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 }
      }, {
        view: this.frameBuffers[(this.frame + 1) % 2].createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 }
      }]
    });
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.uniformBindGroup);
    passEncoder.setBindGroup(1, this.frameBufferBindgroups[this.frame % 2]);
    passEncoder.draw(6);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    this.frame++
  }

  resizeFrameBuffer() {
    if (this.frameBuffers.length) {
      this.frameBuffers[0].destroy();
      this.frameBuffers[1].destroy();

      this.frameBuffers.length = 0;
      this.frameBufferBindgroups.length = 0;
    }

    for (let i = 0; i < 2; i++) {
      this.frameBuffers.push(device.createTexture({
        size: { width: canvas.width, height: canvas.height },
        format: navigator.gpu.getPreferredCanvasFormat(),
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
      }));
    }

    if(!this.sampler) {
      this.sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear'
      });
    }

    this.frameBufferBindgroups.push(device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(1),
      entries: [
        {binding: 0, resource: this.frameBuffers[0].createView()},
        {binding: 1, resource: this.sampler}
      ]
    }));
    
    this.frameBufferBindgroups.push(device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(1),
      entries: [
        {binding: 0, resource: this.frameBuffers[1].createView()},
        {binding: 1, resource: this.sampler}
      ]
    }));
  }
}
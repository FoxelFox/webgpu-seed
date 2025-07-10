import { device, context, canvas, mouse } from "../index";
import shader from "./post.wgsl" with {type: "text"};

export class Post {
  pipeline: GPURenderPipeline;

  uniformArray: Float32Array = new Float32Array(6);
  uniformBuffer: GPUBuffer;
  uniformBindGroup: GPUBindGroup;


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
        targets: [{
          format: 'bgra8unorm'
        }]
      },
      primitive: {
        topology: 'triangle-list'
      }
    });
  
    this.uniformBuffer = device.createBuffer({
      size: this.uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
  }

  render() {
    // update uniform
    this.uniformArray[0] = canvas.width;
    this.uniformArray[1] = canvas.height;
    this.uniformArray[2] = mouse.ax;
    this.uniformArray[3] = mouse.ay;
    this.uniformArray[4] = mouse.rx;
    this.uniformArray[5] = mouse.ry;

    device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformArray);



    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 }
      }]
    });
    passEncoder.setPipeline(this.pipeline);
    passEncoder.draw(6);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
  }
}
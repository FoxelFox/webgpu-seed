
export class GPUContext {
  device: GPUDevice;
  context: GPUCanvasContext;
  canvas: HTMLCanvasElement;
  mouse: {
    ax: number
    ay: number
    rx: number
    ry: number
  }

  constructor() {
    this.canvas = document.getElementsByTagName('canvas')[0];
    this.setCanvasSize();
    this.mouse = {ax: this.canvas.width / 2, ay: this.canvas.height / 2, rx: 0, ry: 0};

    window.addEventListener("resize", this.setCanvasSize);
    window.addEventListener("mousemove", this.setCanvasSize);
  }

  async init() {
    try {
      if (navigator.gpu) {
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
        this.device = await adapter.requestDevice();
      }
    } finally {
      if (!this.device) {
        document.body.innerHTML = '' +
          '<div style="padding: 0 16px">' +
          '<h1>No GPU available 😔</h1>' +
          '<p>You need a WebGPU compatible browser</p>' +
          '<a style="color: brown" href="https://caniuse.com/webgpu">https://caniuse.com/webgpu</a>' +
          '</div> ';
      }
    }
    this.context = this.canvas.getContext('webgpu');
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: presentationFormat,
      alphaMode: 'premultiplied'
    });
  }

  setCanvasSize = () => {
    this.canvas.width = window.innerWidth * devicePixelRatio;
    this.canvas.height = window.innerHeight * devicePixelRatio;
  }

  setHandleMouseMove = (ev: MouseEvent) => {
    this.mouse.ax = ev.clientX;
    this.mouse.ay = ev.clientY;
    this.mouse.rx = ev.clientX - window.innerWidth / 2;
    this.mouse.ry = window.innerHeight / 2 - ev.clientY;
  }
}
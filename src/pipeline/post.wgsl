#import "hsl_to_rgb.wgsl"
#import "../data/context.wgsl"

@group(0) @binding(0) var <uniform> context: Context;
@group(1) @binding(0) var prevFrameTexture: texture_2d<f32>;
@group(1) @binding(1) var smpler: sampler;

@vertex
fn main_vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  let c = context;
  const pos = array(
    vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
    vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
  );
  return vec4(pos[i], 0.0, 1.0);
}

struct FragmentOutput {
  @location(0) colorForCanvas: vec4<f32>,
  @location(1) colorForTexture: vec4<f32>,
};

@fragment
fn main_fs(@builtin(position) pos: vec4<f32>) -> FragmentOutput {

  var p = (pos.xy / context.resolution - 0.5) * 2.0;
  var ar = context.resolution.x / context.resolution.y;
  p.x *= ar;

  let speed = 2.0 * sin(context.time) % 1;
  let radius = 0.25 + sin(context.time) * 0.25 ;
  let circle_pos = vec2(cos(context.time * speed), sin(context.time * speed)) * radius;

  var d = distance(p, circle_pos * ar);
  if (d < 0.05) {
    d = 1.0;
  } else {
    d = 0.0;
  }

  var color = vec4(hsl_to_rgb((context.time * 160)  % 360, 1.0, 0.5), d);

  let zoom = 1.005;
  let uv = (pos.xy / context.resolution);
  let centered_uv = (uv - 0.5) / zoom + 0.5;

  var last = textureSample(prevFrameTexture, smpler, centered_uv);

  var output: FragmentOutput;
  output.colorForTexture = mix(last, color, d);
  output.colorForCanvas = mix(last, color, d);
  return output;
}



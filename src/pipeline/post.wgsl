struct Context {
  resolution: vec2<f32>,
  mouse_abs: vec2<f32>,
  mouse_rel: vec2<f32>,
  time: f32,
  delta: f32,
}

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
  // Correct for the aspect ratio
  var ar = context.resolution.x / context.resolution.y;
  p.x *= ar;

  var mouse = context.mouse_rel;
  mouse.y /= ar;

  var d = distance(p, mouse * ar);
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


fn hsl_to_rgb(hue: f32, saturation: f32, lightness: f32) -> vec3<f32> {
  let c = (1.0 - abs(2.0 * lightness - 1.0)) * saturation;
  let h = hue / 60.0;
  let x = c * (1.0 - abs(h % 2.0 - 1.0));
  var r: f32;
  var g: f32;
  var b: f32;

  if (h < 1.0) {
    r = c;
    g = x;
    b = 0.0;
  } else if (h < 2.0) {
    r = x;
    g = c;
    b = 0.0;
  } else if (h < 3.0) {
    r = 0.0;
    g = c;
    b = x;
  } else if (h < 4.0) {
    r = 0.0;
    g = x;
    b = c;
  } else if (h < 5.0) {
    r = x;
    g = 0.0;
    b = c;
  } else {
    r = c;
    g = 0.0;
    b = x;
  }

  let m = lightness - c / 2.0;
  return vec3<f32>(r + m, g + m, b + m);
}
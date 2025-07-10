struct Context {
  resolution: vec2<f32>,
  mouse_abs: vec2<f32>,
  mouse_rel: vec2<f32>,
  time: f32,
  delta: f32,
}

@group(0) @binding(0)  var <uniform> context: Context;

@vertex
fn main_vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  let c = context;
  const pos = array(
    vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
    vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
  );
  return vec4(pos[i], 0.0, 1.0);
}

@fragment
fn main_fs(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
  let p = pos.xy / context.resolution - 0.5;
  let s = vec2(sin(p.x * p.y *128.0 + context.time), cos(p.x * p.y*128.0 + context.time));

  return vec4(s.x, s.y, abs(p.x) + abs(p.y), 1.0);
}
struct Context {
  resolution: vec2<f32>,
  mouse: {
    absolute: vec2<f32>,
    relative: vec2<f32>,
  },
  time: f32,
  delta: f32,
}

@binding(0) @group(0) var <uniform> context: Context;

@vertex
fn main_vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  const pos = array(
    vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
    vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
  );
  return vec4(pos[i], 0.0, 1.0);
}

@fragment
fn main_fs(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
  return vec4(pos.x / 1024, pos.y  / 1024, 0.0, 1.0);
}
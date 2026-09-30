#import "color.wgsl"
#import "../data/context.wgsl"

@group(0) @binding(0) var<uniform> context: Context;

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
  // both in centered, aspect-corrected space so the brush is a circle
  let aspect = context.resolution.x / context.resolution.y;
  var uv = pos.xy / context.resolution * 2.0 - 1.0;
  uv.x *= aspect;

  var brush = context.mouse_rel;
  brush.x *= aspect;

  if (distance(uv, brush) < 0.1) {
    return PAINT_COLOR;
  }

  return BACKGROUND_COLOR;
}

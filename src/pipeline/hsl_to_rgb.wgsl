/**
 * hue: 1-360
 * saturation: 0-1
 * lightness: 0-1
 */
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
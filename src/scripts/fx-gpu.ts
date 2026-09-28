// The window's ray marcher on the GPU (WebGL2). Every character cell is sampled SX×SY times; each cell comes
// back as two coverage masks (the raised mark, the whole solid) and a brightness, so the CPU only picks glyphs.
// Returns null wherever WebGL2 can't be had; the engine then marches the same cells itself.

export const SX = 3, SY = 5;
export type MarchParams = {
  cols: number; rows: number; cw: number; ch: number; scale: number;
  rot: Float32Array; dir: number[]; light: number[]; // rot: view → object, column-major
  a: number; b: number; m: number; plate: [boolean, boolean]; // logo indices, morph from a to b
};

const VS = `#version 300 es
void main() { vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float; precision highp int;
uniform sampler2D F; uniform float N, K, R, scale, morph;
uniform vec2 grid, cell; uniform mat3 rot; uniform vec3 dir, light;
uniform int la, lb; uniform bvec2 plate;
out uvec4 o;
float field(int k, bool solid, vec2 p) { // stored distances, extended past the tile by the distance to it
  vec2 u = vec2(p.x + 1.0, 1.0 - p.y) * 0.5 * (N - 1.0), c = clamp(u, 0.0, N - 1.0);
  vec4 t = texture(F, (vec2(float(k) * N, 0.0) + c + 0.5) / vec2(N * K, N));
  return ((solid ? t.g : t.r) - 0.5) * 2.0 * R + length(u - c) / (N * 0.5);
}
float extrude(float d, float z, float h) { float w = abs(z) - h; return min(max(d, w), 0.0) + length(max(vec2(d, w), 0.0)); }
vec2 logo(int k, bool pl, vec3 p) {
  float a = extrude(field(k, false, p.xy), p.z, 0.15) - 0.01;
  if (!pl) return vec2(a, 0.0);
  float b = extrude(field(k, true, p.xy), p.z, 0.07) - 0.01;
  return a < b ? vec2(a, 0.0) : vec2(b, 1.0);
}
vec2 map(vec3 p) {
  vec2 b = logo(lb, plate.y, p);
  if (morph >= 1.0) return b;
  vec2 a = logo(la, plate.x, p);
  return vec2(mix(a.x, b.x, morph), morph < 0.5 ? a.y : b.y);
}
void main() {
  ivec2 cc = ivec2(gl_FragCoord.xy); // column, and row from the top
  uint mark = 0u, solid = 0u; float lum = 0.0; int hits = 0;
  for (int j = 0; j < ${SY}; j++) for (int i = 0; i < ${SX}; i++) {
    vec2 px = (vec2(cc) + (vec2(i, j) + 0.5) / vec2(${SX}, ${SY})) * cell - grid * cell * 0.5;
    vec2 v = vec2(px.x, -px.y) / scale;
    if (dot(v, v) > 2.3) continue;
    vec3 ro = rot * vec3(v, 2.0);
    float t = 0.5;
    for (int k = 0; k < 64 && t < 3.5; k++) {
      vec3 p = ro + dir * t; vec2 d = map(p);
      if (d.x < 0.006) {
        const float e = 0.012;
        float a = map(p + vec3(e, -e, -e)).x, b = map(p + vec3(-e, -e, e)).x, q = map(p + vec3(-e, e, -e)).x, w = map(p + vec3(e, e, e)).x;
        vec3 n = normalize(vec3(a - b - q + w, -a - b + q + w, -a + b - q + w));
        float diff = max(0.0, dot(n, light)), rim = pow(1.0 - abs(dot(n, dir)), 3.0);
        uint bit = 1u << uint(j * ${SX} + i);
        solid |= bit; if (d.y == 0.0) mark |= bit;
        lum += clamp(0.25 + diff * 0.75 + rim * 0.2, 0.0, 1.0); hits++;
        break;
      }
      t += d.x * 0.8;
    }
  }
  o = uvec4(mark, solid, uint((hits > 0 ? lum / float(hits) : 0.0) * 65535.0), 0u);
}`;

export function createMarcher(sprite: { w: number; h: number; d: Uint8ClampedArray }, count: number, range: number) {
  if (typeof OffscreenCanvas === 'undefined') return null;
  const gl = new OffscreenCanvas(1, 1).getContext('webgl2', { antialias: false, depth: false, stencil: false, alpha: false });
  if (!gl) return null;
  const shader = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const loc = new Map<string, WebGLUniformLocation | null>();
  const u = (n: string) => { if (!loc.has(n)) loc.set(n, gl.getUniformLocation(prog, n)); return loc.get(n)!; };
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, sprite.w, sprite.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, sprite.d);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u('F'), 0); gl.uniform1f(u('N'), sprite.h); gl.uniform1f(u('K'), count); gl.uniform1f(u('R'), range);
  const fb = gl.createFramebuffer(), target = gl.createTexture(), pbo = gl.createBuffer();
  let size = '', lost = false, fence: WebGLSync | null = null;
  (gl.canvas as OffscreenCanvas).addEventListener('webglcontextlost', () => { lost = true; });

  return {
    get ok() { return !lost; },
    /** Fills `out` with one uvec4 per cell (mark bits, solid bits, brightness × 65535) from the last finished
     *  march, and starts the next one. The GPU is never waited on: results arrive a frame late. */
    march(p: MarchParams, out: Uint32Array) {
      if (fence) {
        if (gl.clientWaitSync(fence, 0, 0) === gl.TIMEOUT_EXPIRED) return;
        gl.deleteSync(fence); fence = null;
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
        if (`${p.cols}x${p.rows}` === size) gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, out, 0, p.cols * p.rows * 4); // else: a march for the old size
      }
      if (`${p.cols}x${p.rows}` !== size) {
        size = `${p.cols}x${p.rows}`;
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, target);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, p.cols, p.rows, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
        gl.activeTexture(gl.TEXTURE0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { lost = true; return; }
        gl.viewport(0, 0, p.cols, p.rows);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
        gl.bufferData(gl.PIXEL_PACK_BUFFER, p.cols * p.rows * 16, gl.STREAM_READ);
      }
      gl.uniform2f(u('grid'), p.cols, p.rows); gl.uniform2f(u('cell'), p.cw, p.ch); gl.uniform1f(u('scale'), p.scale);
      gl.uniformMatrix3fv(u('rot'), false, p.rot); gl.uniform3fv(u('dir'), p.dir); gl.uniform3fv(u('light'), p.light);
      gl.uniform1i(u('la'), p.a); gl.uniform1i(u('lb'), p.b); gl.uniform1f(u('morph'), p.m); gl.uniform2i(u('plate'), +p.plate[0], +p.plate[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
      gl.readPixels(0, 0, p.cols, p.rows, gl.RGBA_INTEGER, gl.UNSIGNED_INT, 0);
      fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0); gl.flush();
    },
  };
}

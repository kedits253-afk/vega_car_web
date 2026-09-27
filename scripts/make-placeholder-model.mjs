// scripts/make-placeholder-model.mjs
// Generates a minimal placeholder "car" GLB (no external deps) so the site renders something
// before the real Vega EVX model is licensed/created. Run: node scripts/make-placeholder-model.mjs
// Writes public/models/vega-evx.glb (+ .low.glb). For production, replace with a real
// Draco-compressed model per README → Asset pipeline.
import fs from 'node:fs';
import path from 'node:path';

function buildCarGlb(scale = 1) {
  const pos = new Float32Array([
    // body slab (8 verts)
    -1.9*scale,0.2*scale,-0.85*scale,  1.9*scale,0.2*scale,-0.85*scale,  1.9*scale,0.2*scale,0.85*scale, -1.9*scale,0.2*scale,0.85*scale,
    -1.9*scale,0.75*scale,-0.85*scale, 1.9*scale,0.75*scale,-0.85*scale, 1.9*scale,0.75*scale,0.85*scale, -1.9*scale,0.75*scale,0.85*scale,
    // cabin slab (4 verts)
    -0.9*scale,0.75*scale,-0.75*scale, 0.7*scale,0.75*scale,-0.75*scale, 0.7*scale,1.25*scale,0.6*scale, -0.9*scale,1.25*scale,0.6*scale,
  ]);
  const idx = new Uint16Array([
    0,1,2, 2,3,0, 4,6,5, 6,4,7, 0,4,5, 5,1,0, 2,6,7, 7,3,2, 1,5,6, 6,2,1, 0,3,7, 7,4,0, 8,9,10, 10,11,8,
  ]);
  const bin = Buffer.alloc(pos.byteLength + idx.byteLength);
  Buffer.from(pos.buffer).copy(bin, 0);
  Buffer.from(idx.buffer).copy(bin, pos.byteLength);

  const gltf = {
    asset: { version: '2.0', generator: 'vega-evx-placeholder' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'VegaEVX_Placeholder' }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.05, 0.55, 0.85, 1], metallicFactor: 0.6, roughnessFactor: 0.35 } }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: pos.length / 3, type: 'VEC3',
        min: [-1.9*scale, 0.2*scale, -0.85*scale], max: [1.9*scale, 1.25*scale, 0.85*scale] },
      { bufferView: 1, componentType: 5123, count: idx.length, type: 'SCALAR' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: pos.byteLength, target: 34962 },
      { buffer: 0, byteOffset: pos.byteLength, byteLength: idx.byteLength, target: 34963 },
    ],
    buffers: [{ byteLength: bin.length }],
  };
  return toGlb(gltf, bin);
}

function toGlb(json, bin) {
  const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  const binPad = (4 - (bin.length % 4)) % 4;
  const total = 12 + 8 + jsonBuf.length + jsonPad + 8 + bin.length + binPad;
  const out = Buffer.alloc(total);
  let o = 0;
  out.writeUInt32LE(0x46546c67, o); o += 4;   // magic 'glTF'
  out.writeUInt32LE(2, o); o += 4;            // version
  out.writeUInt32LE(total, o); o += 4;        // length
  out.writeUInt32LE(jsonBuf.length + jsonPad, o); o += 4;
  out.writeUInt32LE(0x4e4f534a, o); o += 4;   // 'JSON'
  jsonBuf.copy(out, o); o += jsonBuf.length;
  out.fill(0x20, o, o + jsonPad); o += jsonPad;
  out.writeUInt32LE(bin.length + binPad, o); o += 4;
  out.writeUInt32LE(0x004e4942, o); o += 4;   // 'BIN\0'
  bin.copy(out, o); o += bin.length;
  out.fill(0, o, o + binPad);
  return out;
}

const dir = path.resolve('public/models');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'vega-evx.glb'), buildCarGlb(1));
fs.writeFileSync(path.join(dir, 'vega-evx.low.glb'), buildCarGlb(0.9));
console.log('✔ Placeholder models written to public/models/ (replace with real vega-evx.glb before launch).');

// Utilidades para construir geometría, texturas y materiales sin ficheros externos.
const B = window.BABYLON;

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createHelpers(scene) {
  const MB = B.MeshBuilder;
  const V3 = B.Vector3;

  function dtex(w, h, draw) {
    const t = new B.DynamicTexture('t' + Math.random(), { width: w, height: h }, scene, true);
    const c = t.getContext();
    draw(c, w, h);
    t.update();
    return t;
  }

  function noiseTex(size, base, amp, extra) {
    return dtex(size, size, (c, w, h) => {
      const img = c.createImageData(w, h);
      for (let i = 0; i < w * h; i++) {
        const v = clamp(base + (Math.random() - 0.5) * amp, 0, 255);
        img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * w, y = Math.random() * h, r = 8 + Math.random() * 34;
        const g = c.createRadialGradient(x, y, 0, x, y, r), l = Math.random() < 0.5 ? 255 : 0;
        g.addColorStop(0, 'rgba(' + l + ',' + l + ',' + l + ',.09)');
        g.addColorStop(1, 'rgba(' + l + ',' + l + ',' + l + ',0)');
        c.fillStyle = g;
        c.fillRect(x - r, y - r, r * 2, r * 2);
      }
      if (extra) extra(c, w, h);
    });
  }

  function mat(hex, opts = {}) {
    const m = new B.StandardMaterial('m' + Math.random(), scene);
    m.diffuseColor = B.Color3.FromHexString(hex);
    const s = opts.spec === undefined ? 0.05 : opts.spec;
    m.specularColor = new B.Color3(s, s, s);
    m.specularPower = opts.power || 24;
    if (opts.emissive) m.emissiveColor = B.Color3.FromHexString(opts.emissive);
    if (opts.noLight) m.disableLighting = true;
    m.backFaceCulling = opts.cull === undefined ? true : opts.cull;
    m.maxSimultaneousLights = 6;
    return m;
  }

  function texMat(tex, opts) {
    const m = mat('#ffffff', opts);
    m.diffuseTexture = tex;
    return m;
  }

  function box(w, h, d, x, y, z, m, parent) {
    const b = MB.CreateBox('b', { width: w, height: h, depth: d }, scene);
    b.position.set(x, y, z); b.material = m; if (parent) b.parent = parent;
    return b;
  }

  function cyl(dt, db, h, x, y, z, m, parent, tess) {
    const c = MB.CreateCylinder('c', { diameterTop: dt, diameterBottom: db, height: h, tessellation: tess || 16 }, scene);
    c.position.set(x, y, z); c.material = m; if (parent) c.parent = parent;
    return c;
  }

  function sphere(d, x, y, z, m, parent, sx, sy, sz) {
    const s = MB.CreateSphere('s', { diameter: d, segments: 12 }, scene);
    s.position.set(x, y, z); s.material = m;
    if (sx) s.scaling.set(sx, sy, sz);
    if (parent) s.parent = parent;
    return s;
  }

  function capsule(r, h, x, y, z, m, parent) {
    const c = MB.CreateCapsule('cap', { radius: r, height: h, tessellation: 14, subdivisions: 2 }, scene);
    c.position.set(x, y, z); c.material = m; if (parent) c.parent = parent;
    return c;
  }

  // Cápsula entre dos puntos (para brazos, bastones...).
  function limb(a, b, r, m, parent) {
    const d = b.subtract(a), len = d.length();
    const holder = new B.TransformNode('limb', scene);
    holder.parent = parent; holder.position.copyFrom(a);
    const up = Math.abs(d.y / len) > 0.95 ? V3.Forward() : V3.Up();
    holder.rotationQuaternion = B.Quaternion.FromLookDirectionLH(d.normalize(), up);
    const c = MB.CreateCapsule('limbc', { radius: r, height: len + 2 * r, tessellation: 12, subdivisions: 2 }, scene);
    c.rotation.x = Math.PI / 2; c.position.z = len / 2; c.parent = holder; c.material = m;
    return c;
  }

  return { scene, MB, V3, dtex, noiseTex, mat, texMat, box, cyl, sphere, capsule, limb };
}

// Carga un modelo de assets/models/ (la ruta es relativa a index.html).
export function loadModel(scene, file) {
  return B.SceneLoader.ImportMeshAsync('', 'assets/models/', file, scene);
}

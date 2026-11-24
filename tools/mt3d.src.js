/* 26 明台產險年度贈禮：信封／筆記本／三角桌曆 3D（three.js）
   單位：公分。地面 y=0，鏡頭看向 -z。 */
import * as THREE from '../node_modules/three/build/three.module.js' /* build: tools/build-mt3d.sh */;

const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;

export function init(R) {
  const base = R.getAttribute('data-base');
  const names = JSON.parse(R.getAttribute('data-names'));
  const st = R.querySelector('.mt-stage');
  const canvas = document.createElement('canvas');
  canvas.className = 'mt-canvas';
  st.appendChild(canvas);

  /* ---------- renderer / scene ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1.6, 1, 600);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d9d9, 1.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.9);
  sun.position.set(-28, 62, 48);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -40, near: 10, far: 200 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.7);
  fill.position.set(40, 20, 30);
  scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.ShadowMaterial({ opacity: .17 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  /* ---------- textures ---------- */
  const loader = new THREE.TextureLoader();
  const cache = {};
  function tex(name, cb) {
    if (cache[name]) { if (cb) cache[name].then(cb); return cache[name]; }
    cache[name] = new Promise(res => loader.load(base + name + '.webp', t => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; res(t); redraw();
    }, undefined, () => res(null)));
    if (cb) cache[name].then(cb);
    return cache[name];
  }
  function canvasTex(w, h, paint, srgb) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    paint(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  }
  // 紙紋（bump）
  const grain = canvasTex(256, 256, (g, w, h) => {
    const d = g.createImageData(w, h);
    for (let i = 0; i < d.data.length; i += 4) { const v = 118 + Math.random() * 20; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0);
  });
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(8, 8);
  // 紙張側邊（一張張的紙）
  function stripes(dir) {
    const t = canvasTex(dir ? 4 : 256, dir ? 256 : 4, (g, w, h) => {
      g.fillStyle = '#f8f8f6'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#d9d9d6';
      for (let i = 0; i < 256; i += 4) dir ? g.fillRect(0, i, w, 1) : g.fillRect(i, 0, 1, h);
    }, true);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  const paper = (color, map, extra) => new THREE.MeshStandardMaterial(Object.assign({
    color: color === undefined ? 0xffffff : color, map: map || null, roughness: .88, metalness: 0,
    bumpMap: grain, bumpScale: .35
  }, extra || {}));

  /* ---------- helpers ---------- */
  const box = (w, h, d, mats) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
    m.castShadow = true; m.receiveShadow = true; return m;
  };
  function clipY(pts, y0, y1) {
    function clip(p, keep, cut) {
      const out = [];
      for (let i = 0; i < p.length; i++) {
        const a = p[i], b = p[(i + 1) % p.length], ka = keep(a), kb = keep(b);
        if (ka) out.push(a);
        if (ka !== kb) { const t = (cut - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * t, cut]); }
      }
      return out;
    }
    return clip(clip(pts, p => p[1] >= y0, y0), p => p[1] <= y1, y1);
  }
  function shapeMesh(pts, yoff, W, H, mat) {
    const s = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1] - yoff)));
    const g = new THREE.ShapeGeometry(s);
    const uv = g.attributes.uv, pos = g.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + W / 2) / W, (pos.getY(i) + yoff) / H);
    const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
  }

  /* =====================================================
     信封 23 × 23.5 cm，厚 2.6 cm（裝得下筆記本＋桌曆）
     ===================================================== */
  const EW = 23, EH = 23.5, ED = 1.3, FH = 4.25, PT = .05;
  const env = new THREE.Group(); scene.add(env);
  const envIn = paper(0xE6DDCF), envEdge = paper(0xEFE8DC);
  const envFrontM = paper(), envBackM = paper(), flapM = paper(), flapIn = paper(0xF3EEE5, null, { side: THREE.FrontSide });
  tex('web-env-front', t => { envFrontM.map = t; envFrontM.needsUpdate = true; });
  tex('web-env-back', t => { envBackM.map = t; envBackM.needsUpdate = true; });
  tex('web-env-flap', t => { flapM.map = t; flapM.needsUpdate = true; });
  const ef = box(EW, EH, PT, [envEdge, envEdge, envEdge, envEdge, envFrontM, envIn]); ef.position.set(0, EH / 2, ED / 2 - PT / 2); env.add(ef);
  const eb = box(EW, EH, PT, [envEdge, envEdge, envEdge, envEdge, envIn, envBackM]); eb.position.set(0, EH / 2, -ED / 2 + PT / 2); env.add(eb);
  [-1, 1].forEach(s => { const g = box(PT, EH - .02, ED - PT * 2, [envEdge, envEdge, envEdge, envEdge, envEdge, envEdge]); g.position.set(s * (EW / 2 - PT / 2), EH / 2, 0); env.add(g); });
  const ebot = box(EW, PT, ED, envEdge); ebot.position.set(0, PT / 2, 0); env.add(ebot);
  // 信封舌：接在正面上緣，蓋住頂部後折到背面（跟印刷檔一致）
  const flapPts = [[0, 100], [8.7, 25], [12, 4], [14.5, 0], [85.5, 0], [88, 4], [91.3, 25], [100, 100]].map(p => [EW * p[0] / 100 - EW / 2, FH * (1 - p[1] / 100)]);
  const fp1 = new THREE.Group(); fp1.position.set(0, EH, ED / 2); env.add(fp1);
  const fp2 = new THREE.Group(); fp2.position.set(0, ED, 0); fp1.add(fp2);
  [[fp1, 0, ED], [fp2, ED, FH]].forEach(([grp, y0, y1]) => {
    const pts = clipY(flapPts, y0, y1);
    const o = shapeMesh(pts, y0, EW, FH, flapM); o.position.z = .012; grp.add(o);
    const i = shapeMesh(pts, y0, EW, FH, flapIn); i.rotation.y = Math.PI; i.position.z = -.012; grp.add(i);
  });

  /* =====================================================
     筆記本 16 × 21 cm，厚 1.7 cm（硬殼、書背、局部上光）
     ===================================================== */
  const BW = 16, BH = 21, T = 1.7, CB = .2, NP = 17, PW = BW - .35, PH = BH - .5, pt = (T - 2 * CB) / NP;
  const nbRoot = new THREE.Group(); scene.add(nbRoot);
  const nbBody = new THREE.Group(); nbRoot.add(nbBody);
  const coverEdge = paper(0xD9C9B2), endpaper = paper(0xFBFBFA);
  const nbFrontM = paper(0xffffff, null, { roughness: 1, bumpScale: .25 }), nbBackM = paper(0xffffff, null, { roughness: 1, bumpScale: .25 }), spineM = paper();
  // 上光：用光澤遮罩做 roughnessMap（亮面＝低粗糙度）
  function glossRough(name, mat) {
    const img = new Image(); img.onload = () => {
      const t = canvasTex(img.width, img.height, (g, w, h) => {
        g.fillStyle = '#e0e0e0'; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'source-over';
        const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; const g2 = c2.getContext('2d');
        g2.drawImage(img, 0, 0, w, h); g2.globalCompositeOperation = 'source-in'; g2.fillStyle = '#2a2a2a'; g2.fillRect(0, 0, w, h);
        g.drawImage(c2, 0, 0);
      });
      mat.roughnessMap = t; mat.metalness = 0; mat.needsUpdate = true; redraw();
    };
    img.src = base + name + '.png';
  }
  tex('web-nb-front', t => { nbFrontM.map = t; nbFrontM.needsUpdate = true; });
  tex('web-nb-back', t => { nbBackM.map = t; nbBackM.needsUpdate = true; });
  tex('web-nb-spine', t => { spineM.map = t; spineM.needsUpdate = true; });
  glossRough('web-nb-gloss-front', nbFrontM); glossRough('web-nb-gloss-back', nbBackM);
  const backBoard = box(BW, BH, CB, [coverEdge, coverEdge, coverEdge, coverEdge, endpaper, nbBackM]);
  backBoard.position.set(BW / 2, BH / 2, CB / 2); nbBody.add(backBoard);
  const spine = box(CB, BH, T, [endpaper, spineM, coverEdge, coverEdge, coverEdge, coverEdge]);
  spine.position.set(-CB / 2, BH / 2, T / 2); nbBody.add(spine);
  const coverPivot = new THREE.Group(); coverPivot.position.set(0, 0, T - CB); nbBody.add(coverPivot);
  const cover = box(BW, BH, CB, [coverEdge, coverEdge, coverEdge, coverEdge, nbFrontM, endpaper]);
  cover.position.set(BW / 2, BH / 2, CB / 2); coverPivot.add(cover);
  // 內頁疊（左右兩疊，高度隨翻頁改變）
  function stack(side) {
    const sX = stripes(false), sY = stripes(true), top = paper();
    const mats = [paper(0xffffff, sY), paper(0xffffff, sY), paper(0xffffff, sX), paper(0xffffff, sX), top, paper()];
    const m = box(PW, PH, 1, mats); m.userData = { top, side, sX, sY }; nbBody.add(m); return m;
  }
  const stR = stack(1), stL = stack(-1);
  function setStack(m, h, zBase) {
    m.visible = h > .001; m.scale.z = Math.max(h, .001);
    m.position.set(m.userData.side * (.1 + PW / 2), BH / 2, zBase + h / 2);
    const n = Math.max(1, Math.round(h / pt));
    m.userData.sY.repeat.set(1, 1); m.userData.sX.repeat.set(1, 1);
    m.userData.sY.repeat.x = n / 64; m.userData.sX.repeat.y = n / 64;
  }
  // 翻頁中的那一張（可彎曲）
  const SEG = 36;
  function bendSheet(w, h, frontMat, backMat) {
    const g = new THREE.PlaneGeometry(w, h, SEG, 1); g.translate(w / 2, 0, 0);
    const f = new THREE.Mesh(g, frontMat), b = new THREE.Mesh(g, backMat);
    f.castShadow = b.castShadow = true;
    const grp = new THREE.Group(); grp.add(f, b); grp.visible = false;
    grp.userData = { g, w, base: g.attributes.position.array.slice() };
    return grp;
  }
  const nbFlipF = paper(), nbFlipB = paper(0xffffff, null, { side: THREE.BackSide });
  const nbSheet = bendSheet(PW, PH, nbFlipF, nbFlipB); nbBody.add(nbSheet);
  // 依角度 φ（0＝右、π＝左）彎曲；k＝紙張落後的程度
  function bendNb(phi, z0, z1) {
    const u = nbSheet.userData, pos = u.g.attributes.position, n = SEG + 1, ds = u.w / SEG, k = .9 * Math.sin(phi);
    let x = .1, z = 0; const xs = [x], zs = [z];
    for (let i = 1; i < n; i++) { const a = Math.min(Math.PI, Math.max(0, phi - k * (i / SEG))); x += Math.cos(a) * ds; z += Math.sin(a) * ds; xs.push(x); zs.push(z); }
    const zb = lerp(z0, z1, phi / Math.PI);
    for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) { const idx = r * n + i; pos.setX(idx, xs[i]); pos.setZ(idx, zs[i] + zb + .015); }
    pos.needsUpdate = true; u.g.computeVertexNormals();
    nbSheet.position.set(0, BH / 2, 0);
  }

  /* =====================================================
     三角桌曆 20.5 × 19 cm，桌檯 20.5 ＋ 7 ＋ 20.5 cm
     ===================================================== */
  const CW = 20.5, CL = 20.5, CPH = 19, NS = names.cal.length, spt = .028, BT = .22;
  const cal = new THREE.Group(); scene.add(cal);
  const navy = paper(0x221D6A, null, { roughness: .8 }), navyIn = paper(0x1A1656);
  const apex = new THREE.Group(); cal.add(apex);
  const pvF = new THREE.Group(), pvB = new THREE.Group(); apex.add(pvF, pvB);
  const panF = box(CW, CL, BT, [navy, navy, navy, navy, navy, navyIn]); panF.position.set(0, -CL / 2, BT / 2); pvF.add(panF);
  const panB = box(CW, CL, BT, [navy, navy, navy, navy, navyIn, navy]); panB.position.set(0, -CL / 2, -BT / 2); pvB.add(panB);
  const baseB = box(CW, BT, 1, navy); cal.add(baseB);
  // 金屬雙線圈
  const ringGeo = new THREE.TorusGeometry(.42, .045, 8, 24);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x2c2d33, metalness: .85, roughness: .32 });
  const NR = 34, rings = new THREE.InstancedMesh(ringGeo, ringMat, NR * 2); rings.castShadow = true;
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < NR; i++) for (let j = 0; j < 2; j++) { const x = -CW / 2 + .5 + i * (CW - 1) / (NR - 1) + (j ? .14 : 0); m.compose(new THREE.Vector3(x, -.15, 0), q, s); rings.setMatrixAt(i * 2 + j, m); } }
  apex.add(rings);
  // 紙疊：前面（目前頁）、背面（翻過去的）
  function cstack(pv, sign) {
    const sX = stripes(false), sY = stripes(true), top = paper();
    const mats = [paper(0xffffff, sY), paper(0xffffff, sY), paper(0xffffff, sX), paper(0xffffff, sX)];
    if (sign > 0) mats.push(top, paper()); else mats.push(paper(), paper(0xF5F5F3));
    const m = box(CW, CPH, 1, mats); m.userData = { top, sign, sX, sY }; pv.add(m); return m;
  }
  const csF = cstack(pvF, 1), csB = cstack(pvB, -1);
  function setC(m, h) {
    m.visible = h > .001; m.scale.z = Math.max(h, .001);
    m.position.set(0, -.75 - CPH / 2, m.userData.sign * (BT + h / 2));
    const n = Math.max(1, Math.round(h / spt)); m.userData.sY.repeat.x = n / 64; m.userData.sX.repeat.y = n / 64;
  }
  const calFlipF = paper(), calFlipB = paper(0xF5F5F3, null, { side: THREE.BackSide });
  const calSheet = (() => {
    const g = new THREE.PlaneGeometry(CW, CPH, 1, SEG); g.translate(0, -CPH / 2, 0);
    const f = new THREE.Mesh(g, calFlipF), b = new THREE.Mesh(g, calFlipB); f.castShadow = b.castShadow = true;
    const grp = new THREE.Group(); grp.add(f, b); grp.visible = false; grp.userData = { g }; apex.add(grp); return grp;
  })();
  // φ：0＝掛在前面、1＝翻到背面（越過頂端）
  function bendCal(phi, th, dF, dB) {
    const g = calSheet.userData.g, pos = g.attributes.position, ds = CPH / SEG, a0 = -th - phi * (2 * Math.PI - 2 * th), k = .7 * Math.sin(Math.PI * phi);
    let y = -.75, z = 0; const ys = [], zs = [];
    for (let i = 0; i <= SEG; i++) {
      if (i) { const a = a0 + k * (i / SEG); y += -Math.cos(a) * ds; z += -Math.sin(a) * ds; }
      ys.push(y); zs.push(z);
    }
    const lift = lerp(dF, -dB, phi);
    // PlaneGeometry 頂點：每列 2 個（左右），由上而下
    for (let i = 0; i <= SEG; i++) for (let c = 0; c < 2; c++) {
      const idx = i * 2 + c, a = a0 + k * (i / SEG);
      pos.setY(idx, ys[i] - Math.sin(a) * lift * 0 ); pos.setZ(idx, zs[i]);
      // 往外推離紙疊
      pos.setY(idx, pos.getY(idx) + Math.sin(a) * 0);
    }
    pos.needsUpdate = true; g.computeVertexNormals();
    // 以法線方向偏移，避免穿進紙疊
    const nx = new THREE.Vector3(0, Math.sin(a0) * -1, Math.cos(a0));
    calSheet.position.copy(nx.multiplyScalar(lift));
  }

  /* ---------- 狀態 ---------- */
  const S = {
    env: { x: 0, y: 0, z: 0, ry: -.5, flap: 0 },       // flap 0＝蓋上、1＝打開
    nb: { x: 0, y: 1, z: .12, ry: 0, rx: 0, open: 0, v: 0, sz: .45 },
    cal: { x: 0, y: .6, z: -.3, ry: 0, th: .015, v: 0, sz: .25 },
    cam: { d: 80, ty: 11, ry: 0, h: .2 }
  };
  let ni = 0, ci = 0, focus = '', phase = 'closed', flipN = null, flipC = null;

  /* ---------- 頁面材質 ---------- */
  const nbPage = i => i < 0 || i > 33 ? null : 'web-nb-p' + String(i).padStart(2, '0');
  function setMap(mat, name) {
    if (!name) { mat.map = null; mat.needsUpdate = true; return; }
    tex(name, t => { if (mat.userData.want === name) { mat.map = t; mat.needsUpdate = true; redraw(); } });
    mat.userData.want = name;
  }
  function nbSpread() { // ni：已翻過的內頁數
    setMap(stL.userData.top, ni > 0 ? nbPage(2 * ni - 1) : null);
    setMap(stR.userData.top, ni < NP ? nbPage(2 * ni) : null);
    for (let k = Math.max(0, 2 * ni - 3); k <= Math.min(33, 2 * ni + 2); k++) tex(nbPage(k));
  }
  const calPage = i => 'web-cal-' + String(i).padStart(2, '0');
  function calFront() { setMap(csF.userData.top, calPage(ci)); for (let k = ci; k <= Math.min(NS - 1, ci + 2); k++) tex(calPage(k)); }

  /* ---------- 組合（每一格畫面） ---------- */
  function apply() {
    const e = S.env;
    env.position.set(e.x, e.y, e.z); env.rotation.y = e.ry;
    const f = e.flap; // 先掀 fp2 再掀 fp1
    fp1.rotation.x = -Math.PI / 2 * (1 - Math.min(1, f * 2 - 1 < 0 ? 0 : f * 2 - 1));
    fp2.rotation.x = -Math.PI / 2 * (1 - Math.min(1, f * 2));
    fp1.rotation.x = f < .5 ? -Math.PI / 2 : -Math.PI / 2 * (1 - (f - .5) * 2);
    fp2.rotation.x = f < .5 ? -Math.PI / 2 * (1 - f * 2) : 0;

    const n = S.nb, o = n.open;
    nbRoot.visible = !!n.v; nbRoot.position.set(n.x, n.y, n.z); nbRoot.rotation.set(n.rx, n.ry, 0, 'YXZ'); nbRoot.scale.set(1, 1, n.sz);
    nbBody.position.set(lerp(-BW / 2, 0, o), 0, -T / 2 * (1 - o));
    coverPivot.rotation.y = -Math.PI * Math.min(1, o * 1.0);
    coverPivot.position.z = lerp(T - CB, 0, o);
    spine.scale.z = lerp(1, .12, o); spine.position.z = lerp(T / 2, T * .06, o); spine.position.x = -CB / 2;
    let iR = NP - ni, iL = ni;
    if (flipN) { if (flipN.dir > 0) iR -= 1; else iL -= 1; }
    setStack(stR, iR * pt, CB);
    setStack(stL, o > .5 ? iL * pt : 0, CB * o);
    if (flipN) { nbSheet.visible = true; const p = flipN.dir > 0 ? flipN.p : 1 - flipN.p; bendNb(Math.PI * p, CB + iR * pt, CB + iL * pt); }
    else nbSheet.visible = false;

    const c = S.cal, th = c.th, apexY = CL * Math.cos(th) + BT * .5;
    cal.visible = !!c.v; cal.position.set(c.x, c.y, c.z); cal.rotation.y = c.ry; cal.scale.set(1, 1, c.sz);
    apex.position.set(0, apexY, 0); pvF.rotation.x = -th; pvB.rotation.x = th;
    baseB.scale.z = Math.max(.01, 2 * CL * Math.sin(th) - BT); baseB.position.set(0, BT / 2, 0);
    let cF = NS - ci, cB = ci;
    if (flipC) { if (flipC.dir > 0) cF -= 1; else cB -= 1; }
    setC(csF, cF * spt); setC(csB, cB * spt);
    if (flipC) { calSheet.visible = true; const p = flipC.dir > 0 ? flipC.p : 1 - flipC.p; bendCal(p, th, BT + cF * spt + .02, BT + cB * spt + .02); }
    else calSheet.visible = false;

    // 鏡頭
    const asp = st.clientWidth / Math.max(1, st.clientHeight);
    camera.aspect = asp; camera.updateProjectionMatrix();
    const cm = S.cam, ry = cm.ry;
    camera.position.set(Math.sin(ry) * cm.d, cm.ty + cm.d * cm.h, Math.cos(ry) * cm.d);
    camera.lookAt(0, cm.ty, 0);
  }
  let rq = 0;
  function redraw() { if (!rq) rq = requestAnimationFrame(() => { rq = 0; apply(); renderer.render(scene, camera); }); }

  /* ---------- 動畫 ---------- */
  let tw = [], raf = 0;
  function tick(now) {
    const live = [], dones = [];
    tw.forEach(t => {
      if (now < t.t0) { live.push(t); return; }
      if (t.a === null) t.a = t.o[t.k];
      const q = t.d ? Math.min(1, (now - t.t0) / t.d) : 1;
      t.o[t.k] = t.a + (t.b - t.a) * (t.lin ? q : ease(q));
      if (q < 1) live.push(t); else if (t.done) dones.push(t.done);
    });
    tw = live; dones.forEach(f => f()); apply(); renderer.render(scene, camera);
    raf = tw.length ? requestAnimationFrame(tick) : 0;
  }
  function go(o, props, d, delay, done, lin) {
    const ks = Object.keys(props), now = performance.now();
    ks.forEach((k, i) => tw.push({ o, k, a: null, b: props[k], d: RM ? 0 : d, t0: now + (RM ? 0 : delay || 0), done: i === ks.length - 1 ? done : null, lin }));
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function fit(w, h) { // 需要看到的寬高（cm）→ 鏡頭距離
    const asp = st.clientWidth / Math.max(1, st.clientHeight), vf = Math.tan(THREE.MathUtils.degToRad(15));
    return Math.max(h / 2 / vf, w / 2 / (vf * asp)) * 1.02;
  }
  const away = 90;
  function L(name) {
    return {
      closed: { env: { x: 0, y: 0, z: 0, ry: -.5 }, cam: { d: fit(30, 30), ty: 11.5, ry: 0, h: .2 } },
      front: { env: { x: 0, y: 0, z: 0, ry: 0 }, cam: { d: fit(34, 54), ty: 20, ry: 0, h: .2 } },
      all: { env: { x: 0, y: 0, z: -14, ry: 0 }, nb: { x: -18, y: 0, z: 5, ry: .5, rx: 0, sz: 1 }, cal: { x: 17.5, y: 0, z: 3, ry: -.5, sz: 1 }, cam: { d: fit(66, 30), ty: 11, ry: 0, h: .2 } },
      nb: { nb: { x: 0, y: 0, z: 0, ry: -.3, rx: 0 }, env: { x: -away, z: -20, ry: 0 }, cal: { x: away, z: -20, ry: 0 }, cam: { d: fit(26, 25), ty: 10.5, ry: 0, h: 0 } },
      nbopen: { nb: { x: 0, y: 0, z: 0, ry: 0, rx: 0 }, cam: { d: fit(36, 25), ty: 10.5, ry: 0, h: 0 } },
      cal: { cal: { x: 0, y: 0, z: 0, ry: -.5 }, env: { x: -away, z: -20, ry: 0 }, nb: { x: away, z: -20, ry: 0, rx: 0 }, cam: { d: fit(32, 28), ty: 10, ry: 0, h: .2 } },
      env: { env: { x: 0, y: 0, z: 0, ry: -.5 }, nb: { x: -away, z: -20, ry: 0, rx: 0 }, cal: { x: away, z: -20, ry: 0 }, cam: { d: fit(30, 30), ty: 11.5, ry: 0, h: .2 } }
    }[name];
  }
  function layout(name, d, delay, done) {
    const l = L(name), ks = Object.keys(l);
    ks.forEach((k, i) => go(S[k], l[k], d, delay, i === ks.length - 1 ? done : null));
  }

  /* ---------- UI ---------- */
  const pg = R.querySelector('.mt-pg'), bPrev = R.querySelector('[data-mt-prev]'), bNext = R.querySelector('[data-mt-next]');
  function setPhase(p) { phase = p; R.setAttribute('data-phase', p); }
  function label() {
    if (focus === 'nb') { const nm = S.nb.open < .5 && ni === 0 ? '封面' : names.nb[Math.min(ni + 1, names.nb.length - 1)]; pg.textContent = nm; bPrev.disabled = S.nb.open < .5; bNext.disabled = ni >= NP; }
    else if (focus === 'cal') { pg.textContent = names.cal[ci] + '　' + (ci + 1) + ' / ' + NS; bPrev.disabled = ci === 0; bNext.disabled = ci >= NS - 1; }
  }
  function pressTabs() { R.querySelectorAll('[data-mt-focus]').forEach(b => b.setAttribute('aria-pressed', b.getAttribute('data-mt-focus') === focus ? 'true' : 'false')); }
  function closeBook(cb) {
    if (S.nb.open < .01 && ni === 0) { cb && cb(); return; }
    const back = () => go(S.nb, { open: 0 }, 900, 0, cb);
    if (ni > 0) { ni = 0; nbSpread(); back(); } else back();
  }
  function setFocus(f) {
    if (phase !== 'open' || f === focus) return;
    const was = focus; focus = f; R.setAttribute('data-focus', f); pressTabs();
    if (was === 'nb' && f !== 'nb' && S.nb.open > .01) closeBook();
    layout(f || 'all', 1000); label();
    if (f === 'cal') calFront();
  }
  function nbNext(dir) {
    if (flipN || phase !== 'open') return;
    if (dir > 0 && S.nb.open < .5) { nbSpread(); go(S.nb, { open: 1 }, 1100); layout('nbopen', 1000); setTimeout(label, 10); return; }
    if (dir < 0 && ni === 0) { go(S.nb, { open: 0 }, 1000); layout('nb', 1000); setTimeout(label, 10); return; }
    if ((dir > 0 && ni >= NP) || (dir < 0 && ni <= 0)) return;
    const from = ni, to = ni + dir;
    // 翻頁的那張：正面＝原本右頁、背面＝新的左頁
    if (dir > 0) { setMap(nbFlipF, nbPage(2 * from)); setMap(nbFlipB, nbPage(2 * to - 1)); ni = to; setMap(stR.userData.top, ni < NP ? nbPage(2 * ni) : null); }
    else { setMap(nbFlipF, nbPage(2 * to)); setMap(nbFlipB, nbPage(2 * from - 1)); ni = to; setMap(stL.userData.top, ni > 0 ? nbPage(2 * ni - 1) : null); }
    flipN = { dir, p: 0 }; label();
    go(flipN, { p: 1 }, 950, 0, () => { flipN = null; nbSpread(); apply(); redraw(); });
  }
  function calNext(dir) {
    if (flipC || phase !== 'open') return;
    if ((dir > 0 && ci >= NS - 1) || (dir < 0 && ci <= 0)) return;
    const from = ci, to = ci + dir;
    if (dir > 0) { setMap(calFlipF, calPage(from)); ci = to; setMap(csF.userData.top, calPage(ci)); }
    else { setMap(calFlipF, calPage(to)); ci = to; }
    flipC = { dir, p: 0 }; label();
    for (let k = ci; k <= Math.min(NS - 1, ci + 2); k++) tex(calPage(k));
    go(flipC, { p: 1 }, 1000, 0, () => { flipC = null; calFront(); apply(); redraw(); });
  }
  function open() {
    if (phase !== 'closed') return; setPhase('busy');
    tex(calPage(0)); calFront(); nbSpread();
    layout('front', 700);
    go(S.env, { flap: 1 }, 900, 650);
    S.nb.x = 0; S.nb.y = 1; S.nb.z = .12; S.nb.ry = 0; S.nb.rx = 0; S.nb.open = 0; S.nb.sz = .45;
    S.cal.x = 0; S.cal.y = .6; S.cal.z = -.3; S.cal.ry = 0; S.cal.th = .015; S.cal.sz = .25;
    setTimeout(() => { S.nb.v = 1; S.cal.v = 1; }, RM ? 0 : 1500);
    go(S.cal, { y: 24 }, 1100, 1550); go(S.nb, { y: 25 }, 1100, 1750);
    layout('all', 1300, 2950); go(S.cal, { th: THREE.MathUtils.degToRad(9.83) }, 1000, 3150, () => {
      setPhase('open'); focus = ''; R.setAttribute('data-focus', ''); pressTabs();
    });
  }
  function close() {
    if (phase !== 'open') return; setPhase('busy');
    const run = () => {
      focus = ''; R.setAttribute('data-focus', ''); pressTabs();
      ci = 0; calFront();
      layout('front', 1000);
      go(S.cal, { th: .015 }, 800);
      go(S.nb, { x: 0, y: 25, z: .12, ry: 0, rx: 0, sz: .45 }, 1000); go(S.cal, { x: 0, y: 24, z: -.3, ry: 0, sz: .25 }, 1000);
      go(S.nb, { y: 1 }, 900, 1100); go(S.cal, { y: .6 }, 900, 1250, () => {
        S.nb.v = 0; S.cal.v = 0;
        go(S.env, { flap: 0 }, 900, 0); layout('closed', 1000, 700, () => setPhase('closed'));
      });
    };
    closeBook(run);
  }
  R.querySelector('[data-mt-open]').addEventListener('click', open);
  R.querySelector('[data-mt-close]').addEventListener('click', close);
  R.querySelectorAll('[data-mt-focus]').forEach(b => b.addEventListener('click', () => setFocus(b.getAttribute('data-mt-focus'))));
  bPrev.addEventListener('click', () => focus === 'nb' ? nbNext(-1) : calNext(-1));
  bNext.addEventListener('click', () => focus === 'nb' ? nbNext(1) : calNext(1));

  /* ---------- 拖曳旋轉／點選 ---------- */
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
  function pick(e) {
    const r = canvas.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(v2, camera);
    const hit = ray.intersectObjects([env, nbRoot, cal], true)[0];
    if (!hit) return '';
    let o = hit.object; while (o && o !== env && o !== nbRoot && o !== cal) o = o.parent;
    return o === env ? 'env' : o === nbRoot ? 'nb' : o === cal ? 'cal' : '';
  }
  function target() { return phase === 'closed' ? S.env : focus === 'nb' ? S.nb : focus === 'cal' ? S.cal : focus === 'env' ? S.env : S.cam; }
  let drag = null;
  st.addEventListener('pointerdown', e => { e.preventDefault(); try { st.focus({ preventScroll: true }); } catch (_) {} if (phase === 'busy') return; drag = { x: e.clientX, y: e.clientY, m: false, id: e.pointerId, e }; });
  st.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.x;
    if (!drag.m && Math.abs(dx) + Math.abs(e.clientY - drag.y) > 6) { drag.m = true; st.classList.add('is-drag'); try { st.setPointerCapture(drag.id); } catch (_) {} }
    if (!drag.m) return;
    const o = target(); o.ry += dx * .012 * (o === S.cam ? -.5 : 1); drag.x = e.clientX; drag.y = e.clientY; redraw();
  });
  function up() {
    if (!drag) return; const d = drag; drag = null; st.classList.remove('is-drag'); if (d.m) return;
    if (phase === 'closed') { open(); return; } if (phase !== 'open') return;
    const k = pick(d.e);
    if (!focus && k) setFocus(k);
    else if (focus === 'nb' && k === 'nb') { if (ni >= NP) { closeBook(() => { layout('nb', 900); label(); }); } else nbNext(1); }
    else if (focus === 'cal' && k === 'cal') calNext(1);
    else if (focus && k && k !== focus) setFocus(k);
  }
  st.addEventListener('pointerup', up);
  st.addEventListener('pointercancel', () => { drag = null; st.classList.remove('is-drag'); });
  st.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && phase === 'closed') { e.preventDefault(); open(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault(); const dir = e.key === 'ArrowRight' ? 1 : -1;
      if (focus === 'nb') nbNext(dir); else if (focus === 'cal') calNext(dir); else { target().ry += dir * .35; redraw(); }
    }
  });

  /* ---------- 尺寸 ---------- */
  function size() {
    const w = st.clientWidth, h = st.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    const l = L(phase === 'closed' ? 'closed' : focus === 'nb' && S.nb.open > .5 ? 'nbopen' : focus || 'all');
    if (l.cam) S.cam.d = l.cam.d;
    redraw();
  }
  Object.assign(S.cam, L('closed').cam); Object.assign(S.env, L('closed').env);
  nbSpread();
  if ('ResizeObserver' in window) new ResizeObserver(size).observe(st); else addEventListener('resize', size);
  size();
  R.classList.add('is-3d');
}

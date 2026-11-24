/* 26 明台產險年度贈禮：信封／筆記本／三角桌曆 3D（three.js）
   單位：公分。地面 y=0，鏡頭看向 -z。 */
import * as THREE from '../node_modules/three/build/three.module.js' /* build: tools/build-mt3d.sh */;

const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
const slow = () => +((location.search.match(/mtslow=(\d+)/) || [])[1] || 1); // 測試用：放慢動畫
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
  sun.position.set(-30, 80, 35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 50, bottom: -50, near: 20, far: 220 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.7);
  fill.position.set(40, 20, 30);
  scene.add(fill);
  // 木紋桌面
  const deskM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .72, metalness: 0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), deskM);
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
  /* =====================================================
     信封 23 × 23.5 cm，厚 2.6 cm（裝得下筆記本＋桌曆）
     ===================================================== */
  const EW = 24.3, EH = 24.8, ED = .4, FH = 24.3 * 222 / 1200, PT = .03;
  const envRoot = new THREE.Group(), envTilt = new THREE.Group(), env = new THREE.Group(); scene.add(envRoot); envRoot.add(envTilt); envTilt.add(env);
  const envIn = paper(0xEDEDEA), envEdge = paper(0xF4F4F1);
  const envFrontM = paper(), envBackM = paper();
  tex('web-env-front', t => { envFrontM.map = t; envFrontM.needsUpdate = true; });
  tex('web-env-back', t => { envBackM.map = t; envBackM.needsUpdate = true; });
  const ef = box(EW, EH, PT, [envEdge, envEdge, envEdge, envEdge, envFrontM, envIn]); ef.position.set(0, EH / 2, ED / 2 - PT / 2); env.add(ef);
  const eb = box(EW, EH, PT, [envEdge, envEdge, envEdge, envEdge, envIn, envBackM]); eb.position.set(0, EH / 2, -ED / 2 + PT / 2); env.add(eb);
  [-1, 1].forEach(s => { const g = box(PT, EH - .02, ED - PT * 2, [envEdge, envEdge, envEdge, envEdge, envEdge, envEdge]); g.position.set(s * (EW / 2 - PT / 2), EH / 2, 0); env.add(g); });
  const ebot = box(EW, PT, ED, envEdge); ebot.position.set(0, PT / 2, 0); env.add(ebot);
  // 信封舌：接在正面上緣，蓋住頂部開口後折到背面（用你給的去背 PNG 當刀模形狀）
  const fp1 = new THREE.Group(); fp1.position.set(0, EH, ED / 2); env.add(fp1);
  const fp2 = new THREE.Group(); fp2.position.set(0, ED, 0); fp1.add(fp2);
  const flapOut = paper(0xffffff, null, { alphaTest: .5, side: THREE.FrontSide }), flapInM = paper(0xffffff, null, { alphaTest: .5, side: THREE.FrontSide });
  function pngTex(name, mat) { loader.load(base + name + '.png', t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; mat.map = t; mat.needsUpdate = true; redraw(); }); }
  pngTex('web-env-flap', flapOut); pngTex('web-env-flap-in', flapInM);
  function flapPlane(y0, y1, mat, back) {
    const g = new THREE.PlaneGeometry(EW, y1 - y0); g.translate(0, (y1 - y0) / 2, 0);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setY(i, (y0 + uv.getY(i) * (y1 - y0)) / FH);
    const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true;
    if (back) { m.rotation.y = Math.PI; m.position.z = -.008; } else m.position.z = .008;
    return m;
  }
  fp1.add(flapPlane(0, ED, flapOut), flapPlane(0, ED, flapInM, true));
  fp2.add(flapPlane(ED, FH, flapOut), flapPlane(ED, FH, flapInM, true));

  /* =====================================================
     筆記本 16 × 21 cm，厚 1.7 cm（硬殼、書背、局部上光）
     ===================================================== */
  const BW = 16, BH = 21, T = 1.7, CB = .2, NP = 17, PW = BW - .35, PH = BH - .5, pt = (T - 2 * CB) / NP;
  const nbRoot = new THREE.Group(), nbTilt = new THREE.Group(); scene.add(nbRoot); nbRoot.add(nbTilt);
  const nbBody = new THREE.Group(); nbTilt.add(nbBody);
  const coverEdge = paper(0xE6DFD3), endpaper = paper(0xFBFBFA);
  const nbFrontM = paper(0xffffff, null, { roughness: .78, bumpScale: .25 }), nbBackM = paper(0xffffff, null, { roughness: .78, bumpScale: .25 }), spineM = paper(0xffffff, null, { roughness: .78 });
  tex('web-nb-front', t => { nbFrontM.map = t; nbFrontM.needsUpdate = true; });
  tex('web-nb-back', t => { nbBackM.map = t; nbBackM.needsUpdate = true; });
  tex('web-nb-spine', t => { spineM.map = t; spineM.needsUpdate = true; });
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
    for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) { const idx = r * n + i; pos.setX(idx, xs[i]); pos.setZ(idx, zs[i] * .6 + zb + .015); }
    pos.needsUpdate = true; u.g.computeVertexNormals();
    nbSheet.position.set(0, BH / 2, 0);
  }

  /* =====================================================
     三角桌曆 20.5 × 19 cm，桌檯 20.5 ＋ 7 ＋ 20.5 cm
     ===================================================== */
  const CW = 20.5, CL = 20.5, CPH = 19, NS = names.cal.length, spt = .028, BT = .22;
  const calRoot = new THREE.Group(), calTilt = new THREE.Group(), cal = new THREE.Group(); scene.add(calRoot); calRoot.add(calTilt); calTilt.add(cal);
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
      ys.push(y); zs.push(z > 0 ? z * .6 : z);
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
  const LIE = -Math.PI / 2, TH = THREE.MathUtils.degToRad(9.83);
  const S = {
    env: { x: 0, y: 0, z: 12, ry: -.06, rx: LIE },
    nb: { x: 0, y: .12, z: 11, ry: -.06, rx: LIE, open: 0, v: 0, sz: .1 },
    cal: { x: 0, y: .05, z: 11, ry: -.06, rx: LIE, th: .004, v: 0, sz: .05 },
    cam: { tx: 0, ty: 0, tz: -2, d: 80, el: 1.05, az: 0 }
  };
  let ni = 0, ci = 0, focus = '', phase = 'closed', flipN = null, flipC = null;

  /* ---------- 頁面材質 ---------- */
  const nbPage = i => i < 0 || i > 33 ? null : 'web-nb-p' + String(i).padStart(2, '0');
  function setMap(mat, name) {
    if (!name) { mat.userData.want = null; mat.map = null; mat.needsUpdate = true; return; }
    mat.userData.want = name;
    tex(name, t => { if (mat.userData.want === name) { mat.map = t; mat.needsUpdate = true; redraw(); } });
  }
  const mirrors = {};
  function setMapMirror(mat, name) { // 翻到左邊那一面要左右鏡射，字才不會反
    mat.userData.want = name;
    tex(name, t => {
      if (mat.userData.want !== name) return;
      if (!mirrors[name]) { const m = t.clone(); m.wrapS = THREE.RepeatWrapping; m.repeat.x = -1; m.offset.x = 1; m.needsUpdate = true; mirrors[name] = m; }
      mat.map = mirrors[name]; mat.needsUpdate = true; redraw();
    });
  }
  function nbSpread() {
    setMap(stL.userData.top, ni > 0 ? nbPage(2 * ni - 1) : null);
    setMap(stR.userData.top, ni < NP ? nbPage(2 * ni) : null);
    for (let k = Math.max(0, 2 * ni - 3); k <= Math.min(33, 2 * ni + 2); k++) tex(nbPage(k));
  }
  const calPage = i => 'web-cal-' + String(i).padStart(2, '0');
  function calFront() { setMap(csF.userData.top, calPage(ci)); for (let k = ci; k <= Math.min(NS - 1, ci + 2); k++) tex(calPage(k)); }
  tex('web-desk', t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(400 / 44, 400 / 24); deskM.map = t; deskM.needsUpdate = true; });

  /* ---------- 組合（每一格畫面） ---------- */
  function apply() {
    const e = S.env;
    envRoot.position.set(e.x, e.y, e.z); envRoot.rotation.set(0, e.ry, 0);
    envTilt.position.set(0, 0, -ED / 2); envTilt.rotation.x = e.rx; env.position.set(0, 0, ED / 2);
    fp1.rotation.x = 0; fp2.rotation.x = 0; // 信封舌打開、平放在桌上

    const n = S.nb, o = n.open;
    nbRoot.visible = !!n.v; nbRoot.position.set(n.x, n.y, n.z); nbRoot.rotation.set(0, n.ry, 0);
    nbTilt.rotation.x = n.rx;
    nbBody.position.set(lerp(-BW / 2, 0, o), 0, 0); nbBody.scale.set(1, 1, n.sz);
    coverPivot.rotation.y = -Math.PI * o;
    coverPivot.position.z = lerp(T - CB, .03, o);
    spine.scale.z = lerp(1, .12, o); spine.position.z = lerp(T / 2, T * .06, o); spine.position.x = -CB / 2;
    let iR = NP - ni, iL = ni;
    if (flipN) { if (flipN.dir > 0) iR -= 1; else iL -= 1; }
    setStack(stR, iR * pt, CB);
    setStack(stL, o > .5 ? iL * pt : 0, CB * o);
    if (flipN) { nbSheet.visible = true; const p = flipN.dir > 0 ? flipN.p : 1 - flipN.p; bendNb(Math.PI * p, CB + iR * pt, CB + iL * pt); }
    else nbSheet.visible = false;
    R.toggleAttribute('data-nbopen', o > .01);

    const c = S.cal, th = c.th, apexY = CL * Math.cos(th) + BT * .5, back = CL * Math.sin(th);
    calRoot.visible = !!c.v; calRoot.position.set(c.x, c.y, c.z); calRoot.rotation.set(0, c.ry, 0);
    calTilt.position.set(0, 0, -back); calTilt.rotation.x = c.rx; cal.position.set(0, 0, back); cal.scale.set(1, 1, c.sz);
    apex.position.set(0, apexY, 0); pvF.rotation.x = -th; pvB.rotation.x = th;
    baseB.scale.z = Math.max(.01, 2 * back - BT); baseB.position.set(0, BT / 2, 0);
    let cF = NS - ci, cB = ci;
    if (flipC) { if (flipC.dir > 0) cF -= 1; else cB -= 1; }
    setC(csF, cF * spt); setC(csB, cB * spt);
    if (flipC) { calSheet.visible = true; const p = flipC.dir > 0 ? flipC.p : 1 - flipC.p; bendCal(p, th, BT + cF * spt + .02, BT + cB * spt + .02); }
    else calSheet.visible = false;

    const asp = st.clientWidth / Math.max(1, st.clientHeight);
    camera.aspect = asp; camera.updateProjectionMatrix();
    const cm = S.cam;
    camera.position.set(cm.tx + cm.d * Math.cos(cm.el) * Math.sin(cm.az), cm.ty + cm.d * Math.sin(cm.el), cm.tz + cm.d * Math.cos(cm.el) * Math.cos(cm.az));
    camera.lookAt(cm.tx, cm.ty, cm.tz);
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
      t.o[t.k] = t.a + (t.b - t.a) * ease(q);
      if (q < 1) live.push(t); else if (t.done) dones.push(t.done);
    });
    tw = live; dones.forEach(f => f()); apply(); renderer.render(scene, camera);
    raf = tw.length ? requestAnimationFrame(tick) : 0;
  }
  function go(o, props, d, delay, done) {
    const ks = Object.keys(props), now = performance.now();
    tw = tw.filter(t => !(t.o === o && ks.includes(t.k) && t.t0 <= now)); // 同一個值只留最新的動畫
    ks.forEach((k, i) => tw.push({ o, k, a: null, b: props[k], d: RM ? 0 : d * slow(), t0: now + (RM ? 0 : (delay || 0) * slow()), done: i === ks.length - 1 ? done : null }));
    if (!raf) raf = requestAnimationFrame(tick);
  }
  const vfov = Math.tan(THREE.MathUtils.degToRad(15));
  function fit(w, h) { const asp = st.clientWidth / Math.max(1, st.clientHeight); return Math.max(h / 2 / vfov, w / 2 / (vfov * asp)) * 1.04; }
  const narrow = () => st.clientWidth / Math.max(1, st.clientHeight) < 1;
  // 信封裡的位置（跟著信封的角度）
  function inEnv(dx, dz) { const e = S.env, c = Math.cos(e.ry), s = Math.sin(e.ry); return { x: e.x + dx * c + dz * s, z: e.z - dx * s + dz * c }; }
  function L(name) {
    const w = !narrow();
    const home = w
      ? { env: { x: -27, z: 15, ry: .16 }, nb: { x: 1, z: 12, ry: -.05 }, cal: { x: 26, z: 11, ry: .2 }, cam: { tx: 0, ty: 0, tz: 0, d: fit(86, 46), el: 1.0, az: 0 } }
      : { env: { x: -7, z: -3, ry: .1 }, nb: { x: 9, z: 2, ry: -.08 }, cal: { x: 0, z: 28, ry: .05 }, cam: { tx: 0, ty: 0, tz: 2, d: fit(46, 62), el: 1.15, az: 0 } };
    if (name === 'closed') return { env: { x: 0, z: 13, ry: -.06 }, cam: { tx: 0, ty: 0, tz: -2, d: fit(36, 36), el: 1.05, az: 0 } };
    if (name === 'all') return {
      env: Object.assign({ rx: LIE }, home.env), nb: Object.assign({ rx: LIE, open: 0, sz: 1, y: .04 }, home.nb),
      cal: Object.assign({ rx: LIE, th: .004, sz: 1, y: .02 }, home.cal), cam: home.cam
    };
    if (name === 'nb') { // 筆記本攤開時把旁邊的東西推開，不會壓到內頁
      const n = home.nb;
      return { nb: { x: n.x, z: n.z, ry: 0, open: 1 }, env: w ? { x: -36, z: 16, ry: .22 } : { x: -27, z: -4, ry: .1 }, cal: w ? { x: 34, z: 11, ry: .2 } : { x: 2, z: 33, ry: .05 },
        cam: { tx: n.x, ty: 0, tz: n.z - BH / 2, d: fit(36, 25), el: 1.32, az: 0 } };
    }
    if (name === 'cal') { const c = home.cal; return { cal: { x: c.x, z: c.z - 4, ry: 0, rx: 0, th: TH }, cam: { tx: c.x, ty: 10, tz: c.z - 4, d: fit(31, 27), el: .2, az: -.5 } }; }
  }
  function layout(name, d, delay, done) {
    const l = L(name), ks = Object.keys(l);
    ks.forEach((k, i) => go(S[k], l[k], d, delay, i === ks.length - 1 ? done : null));
  }

  /* ---------- UI ---------- */
  const pg = R.querySelector('.mt-pg'), bPrev = R.querySelector('[data-mt-prev]'), bNext = R.querySelector('[data-mt-next]');
  function setPhase(p) { phase = p; R.setAttribute('data-phase', p); }
  function label() {
    if (focus === 'nb') { pg.textContent = names.nb[Math.min(ni + 1, names.nb.length - 1)]; bPrev.disabled = ni <= 0; bNext.disabled = ni >= NP; }
    else if (focus === 'cal') { pg.textContent = names.cal[ci] + '　' + (ci + 1) + ' / ' + NS; bPrev.disabled = ci === 0; bNext.disabled = ci >= NS - 1; }
  }
  function pressTabs() { R.querySelectorAll('[data-mt-focus]').forEach(b => b.setAttribute('aria-pressed', b.getAttribute('data-mt-focus') === focus ? 'true' : 'false')); }
  function setFocus(f) {
    if (phase !== 'open' || f === focus) return;
    const was = focus; focus = f; R.setAttribute('data-focus', f); pressTabs();
    if (was === 'nb') { const back = ni; if (ni > 0) { ni = 0; nbSpread(); } go(S.nb, { open: 0, ry: L('all').nb.ry }, 900, back ? 200 : 0); const h = L('all'); go(S.env, h.env, 900, 300); if (f !== 'cal') go(S.cal, h.cal, 900, 300); }
    if (was === 'cal') { go(S.cal, { th: .004 }, 700); go(S.cal, { rx: LIE }, 900, 300); }
    if (f === 'nb') { nbSpread(); layout('nb', 1100, was === 'cal' ? 400 : 0); }
    else if (f === 'cal') { calFront(); layout('cal', 1100, was === 'nb' ? 300 : 0); }
    else go(S.cam, L('all').cam, 1000, was ? 250 : 0);
    label();
  }
  function nbNext(dir) {
    if (flipN || focus !== 'nb' || S.nb.open < .95) return;
    if ((dir > 0 && ni >= NP) || (dir < 0 && ni <= 0)) return;
    const from = ni, to = ni + dir;
    if (dir > 0) { setMap(nbFlipF, nbPage(2 * from)); setMapMirror(nbFlipB, nbPage(2 * to - 1)); ni = to; setMap(stR.userData.top, ni < NP ? nbPage(2 * ni) : null); }
    else { setMap(nbFlipF, nbPage(2 * to)); setMapMirror(nbFlipB, nbPage(2 * from - 1)); ni = to; setMap(stL.userData.top, ni > 0 ? nbPage(2 * ni - 1) : null); }
    flipN = { dir, p: 0 }; label();
    go(flipN, { p: 1 }, 900, 0, () => { flipN = null; nbSpread(); redraw(); });
  }
  function calNext(dir) {
    if (flipC || focus !== 'cal' || S.cal.th < TH * .9) return;
    if ((dir > 0 && ci >= NS - 1) || (dir < 0 && ci <= 0)) return;
    const from = ci, to = ci + dir;
    if (dir > 0) { setMap(calFlipF, calPage(from)); ci = to; setMap(csF.userData.top, calPage(ci)); }
    else { setMap(calFlipF, calPage(to)); ci = to; }
    flipC = { dir, p: 0 }; label();
    for (let k = ci; k <= Math.min(NS - 1, ci + 2); k++) tex(calPage(k));
    go(flipC, { p: 1 }, 1000, 0, () => { flipC = null; calFront(); redraw(); });
  }
  // 點信封：筆記本與桌曆從開口滑出來
  function open() {
    if (phase !== 'closed') return; setPhase('busy');
    calFront(); nbSpread();
    const e = S.env, a = inEnv(0, -1.5), b = inEnv(.6, -1.2);
    Object.assign(S.nb, { x: a.x, z: a.z, y: .14, ry: e.ry, rx: LIE, open: 0, sz: .1, v: 1 });
    Object.assign(S.cal, { x: b.x, z: b.z, y: .05, ry: e.ry, rx: LIE, th: .004, sz: .05, v: 1 });
    const out1 = inEnv(-3, -16), out2 = inEnv(5, -13);
    go(S.nb, { x: out1.x, z: out1.z, y: .5 }, 900, 100); go(S.cal, { x: out2.x, z: out2.z, y: .5 }, 900, 300);
    layout('all', 1300, 1150, () => { setPhase('open'); focus = ''; R.setAttribute('data-focus', ''); pressTabs(); });
  }
  function close() {
    if (phase !== 'open') return;
    const run = () => {
      setPhase('busy'); ci = 0; calFront(); ni = 0; nbSpread();
      go(S.env, L('closed').env, 1100); go(S.cam, L('closed').cam, 1200);
      const e = L('closed').env, c = Math.cos(e.ry), s = Math.sin(e.ry), at = (dx, dz) => ({ x: e.x + dx * c + dz * s, z: e.z - dx * s + dz * c });
      const o1 = at(-3, -16), o2 = at(5, -13), i1 = at(0, -1.5), i2 = at(.6, -1.2);
      go(S.nb, { x: o1.x, z: o1.z, y: .5, ry: e.ry, open: 0 }, 1000); go(S.cal, { x: o2.x, z: o2.z, y: .5, ry: e.ry, th: .004, rx: LIE }, 1000);
      go(S.nb, { x: i1.x, z: i1.z, y: .14, sz: .1 }, 900, 1050); go(S.cal, { x: i2.x, z: i2.z, y: .05, sz: .05 }, 900, 1150, () => {
        S.nb.v = 0; S.cal.v = 0; setPhase('closed'); redraw();
      });
    };
    if (focus) { setFocus(''); setTimeout(run, RM ? 0 : 1000 * slow()); } else run();
  }
  R.querySelector('[data-mt-open]').addEventListener('click', open);
  R.querySelector('[data-mt-close]').addEventListener('click', close);
  R.querySelectorAll('[data-mt-focus]').forEach(b => b.addEventListener('click', () => setFocus(b.getAttribute('data-mt-focus'))));
  bPrev.addEventListener('click', () => focus === 'nb' ? nbNext(-1) : calNext(-1));
  bNext.addEventListener('click', () => focus === 'nb' ? nbNext(1) : calNext(1));

  /* ---------- 拖曳轉視角／點選 ---------- */
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
  function pick(e) {
    const r = canvas.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(v2, camera);
    const hit = ray.intersectObjects([envRoot, nbRoot, calRoot, floor], true).find(h => h.object.visible !== false);
    if (!hit) return 'desk';
    let o = hit.object; while (o && o !== envRoot && o !== nbRoot && o !== calRoot) o = o.parent;
    return o === envRoot ? 'env' : o === nbRoot ? 'nb' : o === calRoot ? 'cal' : 'desk';
  }
  let drag = null;
  st.addEventListener('pointerdown', e => { e.preventDefault(); try { st.focus({ preventScroll: true }); } catch (_) {} if (phase === 'busy') return; drag = { x: e.clientX, y: e.clientY, m: false, id: e.pointerId, e }; });
  st.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.m && Math.abs(dx) + Math.abs(dy) > 6) { drag.m = true; st.classList.add('is-drag'); try { st.setPointerCapture(drag.id); } catch (_) {} }
    if (!drag.m) return;
    S.cam.az -= dx * .008; S.cam.el = Math.max(.12, Math.min(1.45, S.cam.el + dy * .006));
    drag.x = e.clientX; drag.y = e.clientY; redraw();
  });
  function up() {
    if (!drag) return; const d = drag; drag = null; st.classList.remove('is-drag'); if (d.m) return;
    const k = pick(d.e);
    if (phase === 'closed') { if (k === 'env') open(); return; }
    if (phase !== 'open') return;
    if (k === 'desk') { if (focus) setFocus(''); return; }
    if (k === 'env') { if (!focus) close(); else setFocus(''); return; }
    if (k !== focus) { setFocus(k); return; }
    if (k === 'nb') nbNext(ni >= NP ? -NP : 1);
    if (k === 'cal') calNext(ci >= NS - 1 ? -1 : 1);
  }
  st.addEventListener('pointerup', up);
  st.addEventListener('pointercancel', () => { drag = null; st.classList.remove('is-drag'); });
  st.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && phase === 'closed') { e.preventDefault(); open(); return; }
    if (e.key === 'Escape' && focus) { setFocus(''); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault(); const dir = e.key === 'ArrowRight' ? 1 : -1;
      if (focus === 'nb') nbNext(dir); else if (focus === 'cal') calNext(dir); else { S.cam.az -= dir * .25; redraw(); }
    }
  });

  /* ---------- 尺寸 ---------- */
  function size() {
    const w = st.clientWidth, h = st.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    const l = L(phase === 'closed' ? 'closed' : focus || 'all');
    if (l.cam) S.cam.d = l.cam.d;
    redraw();
  }
  Object.assign(S.cam, L('closed').cam); Object.assign(S.env, L('closed').env);
  nbSpread();
  if ('ResizeObserver' in window) new ResizeObserver(size).observe(st); else addEventListener('resize', size);
  size();
  R.classList.add('is-3d');
  R._mt = S; // 測試用
}

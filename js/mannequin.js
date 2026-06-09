// ============================================================================
//  mannequin.js — procedural 3D mannequin + wig (Three.js, no assets)
//  A matte grey bust with a per-style parametric hair mesh that drags to
//  rotate and recolours live. Falls back gracefully if WebGL is unavailable.
// ============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Smooth deterministic pseudo-noise in [-1, 1] for organic lumps.
function snoise(x, y, z) {
  return (
    Math.sin(x * 1.3 + y * 2.1) +
    Math.sin(y * 1.7 + z * 1.1) +
    Math.sin(z * 1.9 + x * 0.7) +
    0.5 * Math.sin(x * 3.3 + z * 2.7)
  ) / 3.5;
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

const HEAD_R = 0.95;
const HEAD_SCALE_Y = 1.12;
const HEAD_CY = 0.18;          // head centre height
const CURTAIN_TOP_Y = 0.22;    // where a hair "fall" begins

export class Mannequin {
  constructor(canvas, { onFirstInteract } = {}) {
    this.canvas = canvas;
    this.onFirstInteract = onFirstInteract;
    this.hairs = [];                       // active hair groups (for cross-fade)
    this.colorTarget = new THREE.Color('#13110f');
    this.visible = true;
    this.interacted = false;
    this._raf = null;
    this._lastT = 0;

    this._initRenderer();
    this._initScene();
    this._buildBust();
    this._observe();
    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);
  }

  _initRenderer() {
    const r = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
    });
    const mobile = matchMedia('(max-width: 860px)').matches;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.06;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = r;
    this._mobile = mobile;
  }

  _initScene() {
    this.scene = new THREE.Scene();

    const w = this.canvas.clientWidth || 600;
    const h = this.canvas.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
    this.camera.position.set(0, 0.25, 7.3);

    const ctrl = new OrbitControls(this.camera, this.canvas);
    ctrl.target.set(0, -0.25, 0);
    ctrl.enableZoom = false;
    ctrl.enablePan = false;
    ctrl.enableDamping = true;
    ctrl.dampingFactor = 0.08;
    ctrl.rotateSpeed = 0.85;          // responsive grab-and-spin
    ctrl.minPolarAngle = 0.82;        // wider tilt range for free manual dragging
    ctrl.maxPolarAngle = 2.12;
    ctrl.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    ctrl.autoRotateSpeed = 0.9;
    ctrl.addEventListener('start', () => this._firstInteract());
    this.controls = ctrl;
    this.renderer.setSize(w, h, false);

    // Lighting: warm key + coral editorial rim + blush ambient bounce
    this.scene.add(new THREE.HemisphereLight(0xfff0f3, 0x3a0e1c, 0.85));
    const key = new THREE.DirectionalLight(0xffe9d6, 1.15);
    key.position.set(-3.2, 4.2, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xe2553f, 0.75);
    rim.position.set(3.4, 1.2, -4);
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.22);
    fill.position.set(4, 1.5, 3);
    this.scene.add(fill);

    this._addContactShadow();
  }

  _addContactShadow() {
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = 128;
    const g = cnv.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, 'rgba(20,5,12,0.5)');
    grad.addColorStop(1, 'rgba(20,5,12,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cnv);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = -2.3;
    this.scene.add(m);
  }

  _bustMat() {
    return new THREE.MeshStandardMaterial({ color: 0xc9c3c2, roughness: 0.82, metalness: 0.02 });
  }

  _buildBust() {
    const g = new THREE.Group();
    const mat = this._bustMat();

    const head = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 48, 40), mat);
    head.scale.set(1, HEAD_SCALE_Y, 1);
    head.position.y = HEAD_CY;
    g.add(head);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 1.0, 32), mat);
    neck.position.y = -1.05;
    g.add(neck);

    // shoulders / bust — a flattened, widened sphere reads like a display bust
    const sh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 40, 28), mat);
    sh.scale.set(1.55, 0.52, 1.05);
    sh.position.y = -1.95;
    g.add(sh);

    this.scene.add(g);
    this.bust = g;
  }

  // ---- Hair construction ---------------------------------------------------
  _makeHairMaterial() {
    return new THREE.MeshStandardMaterial({
      color: this.colorTarget.clone(),
      roughness: 0.5, metalness: 0.04,
      side: THREE.DoubleSide, transparent: true, opacity: 0,
    });
  }

  _buildCap(style, mat) {
    const h = style.hair;
    const capR = (h.capRadius ?? 1.08) * HEAD_R;
    const capTheta = h.capTheta ?? 1.52;
    const vol = h.volume ?? 0.1;
    const geo = new THREE.SphereGeometry(capR, 56, 40, 0, Math.PI * 2, 0, capTheta);
    const p = geo.attributes.position;
    const v = new THREE.Vector3();
    const isAfro = h.shape === 'afro';
    const freq = isAfro ? 4.2 : 2.6;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = Math.abs(snoise(v.x * freq, v.y * freq, v.z * freq));
      const push = 1 + vol * (0.35 + 0.65 * n);
      v.multiplyScalar(push);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const cap = new THREE.Mesh(geo, mat);
    cap.scale.set(1, HEAD_SCALE_Y, 1);
    cap.position.y = HEAD_CY;
    return cap;
  }

  _buildCurtain(style, mat) {
    const h = style.hair;
    const length = h.length ?? 1.0;
    const flare = h.flare ?? 0.05;
    const wave = h.wave ?? 0.06;
    const gap = h.gap ?? 1.9;                 // front opening (radians)
    const rTop = HEAD_R * 0.98;
    const rBottom = rTop * (1 + flare);
    const geo = new THREE.CylinderGeometry(
      rTop, rBottom, length, 48, 28, true, gap / 2, Math.PI * 2 - gap
    );
    const p = geo.attributes.position;
    const v = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const halfH = length / 2;
    const waveCount = 3.2;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const hv = (halfH - v.y) / length;       // 0 at top → 1 at bottom
      dir.set(v.x, 0, v.z);
      const r = dir.length() || 1e-4;
      dir.multiplyScalar(1 / r);
      const theta = Math.atan2(v.x, v.z);
      const w = Math.sin(hv * Math.PI * waveCount + theta * 1.6) * wave * hv;
      const lump = snoise(v.x * 2.2, v.y * 2.0, v.z * 2.2) * 0.025;
      const off = w + lump;
      p.setXYZ(i, v.x + dir.x * off, v.y, v.z + dir.z * off);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.position.y = CURTAIN_TOP_Y - halfH;
    return m;
  }

  _buildHair(style) {
    const mat = this._makeHairMaterial();
    const root = new THREE.Group();
    root.add(this._buildCap(style, mat));
    if (style.hair.shape === 'bob' || style.hair.shape === 'long') {
      root.add(this._buildCurtain(style, mat));
    }
    this.scene.add(root);
    return { root, mat, dir: 1, op: 0 };
  }

  // ---- Public API ----------------------------------------------------------
  setStyle(style) {
    // Drop never-shown groups so rapid switching can't stack transparent meshes;
    // fade out whatever was actually visible.
    for (let i = this.hairs.length - 1; i >= 0; i--) {
      const e = this.hairs[i];
      if (e.dir > 0 && e.op < 0.05) {
        this.scene.remove(e.root);
        e.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
        e.mat.dispose();
        this.hairs.splice(i, 1);
      } else {
        e.dir = -1;
      }
    }
    this.hairs.push(this._buildHair(style));
  }

  setColor(hex) {
    this.colorTarget.set(hex);
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    // track DPR + the mobile cap across orientation / breakpoint changes
    const cap = matchMedia('(max-width: 860px)').matches ? 1.5 : 2;
    const ratio = Math.min(window.devicePixelRatio || 1, cap);
    if (this.renderer.getPixelRatio() !== ratio) this.renderer.setPixelRatio(ratio);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  _firstInteract() {
    if (this.interacted) return;
    this.interacted = true;
    this.controls.autoRotate = false;
    if (this.onFirstInteract) this.onFirstInteract();
  }

  _observe() {
    if ('ResizeObserver' in window) {
      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(this.canvas);
    } else {
      window.addEventListener('resize', () => this.resize());
    }
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver(
        (es) => { this.visible = es[0].isIntersecting; },
        { threshold: 0.05 }
      );
      this._io.observe(this.canvas);
    }
  }

  _loop(t) {
    this._raf = requestAnimationFrame(this._loop);
    const dt = Math.min((t - this._lastT) / 1000, 0.05) || 0.016;
    this._lastT = t;
    if (!this.visible) return;

    // cross-fade + recolour
    for (let i = this.hairs.length - 1; i >= 0; i--) {
      const e = this.hairs[i];
      e.op += e.dir * (dt / 0.32);
      e.op = Math.max(0, Math.min(1, e.op));
      e.mat.opacity = e.op;
      e.mat.color.lerp(this.colorTarget, 0.18);
      if (e.dir < 0 && e.op <= 0) {
        this.scene.remove(e.root);
        e.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
        e.mat.dispose();
        this.hairs.splice(i, 1);
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
    this._io?.disconnect();
    this.renderer.dispose();
  }
}

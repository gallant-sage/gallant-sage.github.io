/**
 * Reaction–Diffusion Cellular Automaton (Gray–Scott model)
 * -----------------------------------------------------------
 * This is the same class of local-update rule Alan Turing proposed
 * in 1952 to explain how uniform tissue develops pigment patterns —
 * the mathematics behind leopard spots, coral growth, and cell
 * division. It runs continuously in the background and responds to
 * clicks/taps by seeding new growth, in the same spirit as the
 * lab notebook it lives behind.
 */

class ReactionDiffusion {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    // Mitosis-style parameters: cells that grow and split.
    this.feed = 0.0367;
    this.kill = 0.0649;
    this.Du = 1.0;
    this.Dv = 0.5;
    this.stepsPerFrame = 10;

    this.simScale = window.innerWidth < 640 ? 10 : 8; // px per sim cell
    this.isPointerDown = false;
    this.colorRGB = [91, 58, 142]; // violet default
    this.frameCount = 0;

    this.init();
  }

  init() {
    this.resize();
    this.updateColors();

    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousedown', (e) => {
      this.isPointerDown = true;
      this.seedAt(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => { this.isPointerDown = false; });
    window.addEventListener('mousemove', (e) => {
      if (this.isPointerDown) this.seedAt(e.clientX, e.clientY);
    });
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) this.seedAt(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) this.seedAt(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // Ambient gentle reseeding so the pattern never fully stalls
    setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const avg = this.averageV();
      if (avg < 0.01 || avg > 0.55) this.reseed();
      else if (Math.random() < 0.5) {
        this.seedAtGrid(
          Math.floor(Math.random() * this.simW),
          Math.floor(Math.random() * this.simH)
        );
      }
    }, 6000);

    requestAnimationFrame(() => this.loop());
  }

  updateColors() {
    const isDark = document.documentElement.classList.contains('dark');
    this.colorRGB = isDark ? [209, 161, 63] : [91, 58, 142]; // gold : violet
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.simScale = w < 640 ? 10 : 8;
    this.simW = Math.ceil(w / this.simScale);
    this.simH = Math.ceil(h / this.simScale);

    const n = this.simW * this.simH;
    this.U = new Float32Array(n).fill(1);
    this.V = new Float32Array(n).fill(0);
    this.nextU = new Float32Array(n);
    this.nextV = new Float32Array(n);

    this.offCanvas = document.createElement('canvas');
    this.offCanvas.width = this.simW;
    this.offCanvas.height = this.simH;
    this.offCtx = this.offCanvas.getContext('2d');
    this.imageData = this.offCtx.createImageData(this.simW, this.simH);

    this.reseed();
  }

  idx(x, y) {
    const xi = (x + this.simW) % this.simW;
    const yi = (y + this.simH) % this.simH;
    return yi * this.simW + xi;
  }

  reseed() {
    this.U.fill(1);
    this.V.fill(0);
    const blobCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < blobCount; i++) {
      this.seedAtGrid(
        Math.floor(Math.random() * this.simW),
        Math.floor(Math.random() * this.simH)
      );
    }
  }

  seedAtGrid(cx, cy, radius = 4) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const i = this.idx(cx + dx, cy + dy);
          this.U[i] = 0.5;
          this.V[i] = 0.25;
        }
      }
    }
  }

  seedAt(clientX, clientY) {
    const cx = Math.floor(clientX / this.simScale);
    const cy = Math.floor(clientY / this.simScale);
    this.seedAtGrid(cx, cy, 3);
  }

  averageV() {
    let sum = 0;
    for (let i = 0; i < this.V.length; i++) sum += this.V[i];
    return sum / this.V.length;
  }

  laplacian(field, x, y) {
    const c = field[this.idx(x, y)];
    const n = field[this.idx(x, y - 1)];
    const s = field[this.idx(x, y + 1)];
    const e = field[this.idx(x + 1, y)];
    const w = field[this.idx(x - 1, y)];
    const ne = field[this.idx(x + 1, y - 1)];
    const nw = field[this.idx(x - 1, y - 1)];
    const se = field[this.idx(x + 1, y + 1)];
    const sw = field[this.idx(x - 1, y + 1)];
    return (
      n * 0.2 + s * 0.2 + e * 0.2 + w * 0.2 +
      ne * 0.05 + nw * 0.05 + se * 0.05 + sw * 0.05 -
      c
    );
  }

  step() {
    const { U, V, nextU, nextV, simW, simH, feed, kill, Du, Dv } = this;
    for (let y = 0; y < simH; y++) {
      for (let x = 0; x < simW; x++) {
        const i = this.idx(x, y);
        const u = U[i];
        const v = V[i];
        const uvv = u * v * v;
        const lapU = this.laplacian(U, x, y);
        const lapV = this.laplacian(V, x, y);
        nextU[i] = u + (Du * lapU - uvv + feed * (1 - u));
        nextV[i] = v + (Dv * lapV + uvv - (feed + kill) * v);
      }
    }
    this.U = nextU; this.nextU = U;
    this.V = nextV; this.nextV = V;
  }

  draw() {
    const data = this.imageData.data;
    const [r, g, b] = this.colorRGB;
    for (let i = 0; i < this.V.length; i++) {
      const v = Math.max(0, Math.min(1, this.V[i]));
      const alpha = Math.pow(v, 0.7) * 235;
      const o = i * 4;
      data[o] = r; data[o + 1] = g; data[o + 2] = b;
      data[o + 3] = alpha;
    }
    this.offCtx.putImageData(this.imageData, 0, 0);

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.offCanvas, 0, 0, this.canvas.width, this.canvas.height);
  }

  loop() {
    if (document.visibilityState === 'visible') {
      for (let i = 0; i < this.stepsPerFrame; i++) this.step();
      this.draw();
    }
    requestAnimationFrame(() => this.loop());
  }
}

let automataInstance = null;
window.addEventListener('DOMContentLoaded', () => {
  automataInstance = new ReactionDiffusion('automata-canvas');
  window.automataInstance = automataInstance;
});

// Lightweight particle FX engine — ported from the seed.
export class FXEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this._resize = this._resize.bind(this);
    this._tick = this._tick.bind(this);
    window.addEventListener("resize", this._resize);
    this._resize();
    requestAnimationFrame(this._tick);
  }

  _resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * ratio);
    this.canvas.height = Math.floor(this.height * ratio);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  burst(x, y, palette, count = 40, power = 8) {
    if (this.reduced) return;
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.random() * power;
      const size = 2 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2.5,
        life: 48 + Math.random() * 40,
        maxLife: 88,
        size,
        spin: (Math.random() - 0.5) * 0.24,
        rotation: Math.random() * Math.PI,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: Math.random() > 0.7 ? "rect" : "dot"
      });
    }
  }

  confetti(x, y, palette, count = 80) {
    if (this.reduced) return;
    for (let i = 0; i < count; i += 1) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 200,
        y: y - 20 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 5,
        vy: -2 - Math.random() * 4,
        life: 80 + Math.random() * 60,
        maxLife: 140,
        size: 3 + Math.random() * 4,
        spin: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: "rect"
      });
    }
  }

  _tick() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rotation += p.spin;
      p.life -= 1;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      const alpha = Math.max(p.life / p.maxLife, 0);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        this.ctx.fillRect(-p.size, -p.size * 0.45, p.size * 2, p.size * 0.9);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
    requestAnimationFrame(this._tick);
  }
}

export function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

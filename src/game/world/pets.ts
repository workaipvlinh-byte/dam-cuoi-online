// Chó mèo chạy quanh tiệc cho vui: chạy tới chỗ ngẫu nhiên, ngồi vẫy đuôi, thỉnh thoảng đuổi nhau.
import { insideTable, scaleAt, WANDER } from './layout';

interface Pet {
  kind: 'dog' | 'cat';
  body: string;
  patch: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  dir: 1 | -1;
  sitFor: number; // ms còn ngồi
  phase: number;
  chase: Pet | null;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function spot() {
  for (let i = 0; i < 10; i++) {
    const x = rnd(WANDER.x0, WANDER.x1);
    const y = rnd(WANDER.y0, WANDER.y1);
    if (!insideTable(x, y, 4)) return { x, y };
  }
  return { x: 540, y: 1300 };
}

const LOOKS: Array<[Pet['kind'], string, string]> = [
  ['dog', '#c98a4b', '#f3e2c7'], // vàng
  ['dog', '#f4f1ea', '#3a2a22'], // trắng đốm đen
  ['dog', '#3a2f2a', '#c98a4b'], // đen vện
  ['dog', '#e2b97a', '#fff7e8'], // golden
  ['cat', '#e8913a', '#fff3e0'], // mèo cam
  ['cat', '#8d8f99', '#e6e6ea'], // mèo xám
  ['cat', '#2b2b30', '#ffffff'], // mèo mun
  ['cat', '#f4f1ea', '#e8913a'], // tam thể
];

export class Pets {
  private list: Pet[] = LOOKS.map(([kind, body, patch]) => {
    const p = spot();
    return { kind, body, patch, x: p.x, y: p.y, tx: p.x, ty: p.y, dir: 1, sitFor: rnd(500, 4000), phase: rnd(0, 6), chase: null };
  });

  update(dt: number) {
    for (const p of this.list) {
      if (p.chase) {
        p.tx = p.chase.x - p.dir * 30;
        p.ty = p.chase.y;
      }
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const d = Math.hypot(dx, dy);
      if (p.sitFor > 0 && !p.chase) {
        p.sitFor -= dt * 1000;
        p.phase += dt * 6;
        continue;
      }
      const sp = (p.chase ? 190 : p.kind === 'cat' ? 120 : 150) * scaleAt(p.y) * dt;
      if (d <= sp || (p.chase && d < 36)) {
        p.chase = null;
        p.sitFor = rnd(1500, 5000);
        const n = spot();
        p.tx = n.x;
        p.ty = n.y;
        continue;
      }
      p.x += (dx / d) * sp;
      p.y += (dy / d) * sp;
      if (Math.abs(dx) > 2) p.dir = dx > 0 ? 1 : -1;
      p.phase += dt * 16;
      // chó thỉnh thoảng đuổi mèo
      if (p.kind === 'dog' && !p.chase && Math.random() < dt * 0.04) p.chase = this.list.filter((q) => q.kind === 'cat')[Math.floor(Math.random() * 4)];
    }
  }

  /** Trả về danh sách hàm vẽ theo y để xếp chung với người */
  drawables(ctx: CanvasRenderingContext2D) {
    return this.list.map((p) => ({ y: p.y, f: () => drawPet(ctx, p) }));
  }
}

function drawPet(ctx: CanvasRenderingContext2D, p: Pet) {
  const s = scaleAt(p.y) * (p.kind === 'dog' ? 1 : 0.85);
  const moving = p.sitFor <= 0 || !!p.chase;
  const bob = moving ? -Math.abs(Math.sin(p.phase)) * 3 * s : 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.dir * s, s);
  // bóng
  ctx.fillStyle = 'rgba(60,30,20,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(0, bob);
  // chân
  ctx.fillStyle = p.body;
  if (moving) {
    for (const [lx, ph] of [
      [-9, 0],
      [-4, Math.PI],
      [6, Math.PI],
      [11, 0],
    ]) {
      const lift = Math.max(0, Math.sin(p.phase + ph)) * 3;
      ctx.fillRect(lx - 2, -9 - lift, 4, 9);
    }
  } else {
    ctx.fillRect(4, -9, 4, 9);
    ctx.fillRect(9, -9, 4, 9);
  }
  // đuôi
  const wag = Math.sin(p.phase * (moving ? 1 : 2)) * 0.5;
  ctx.strokeStyle = p.body;
  ctx.lineCap = 'round';
  ctx.lineWidth = p.kind === 'cat' ? 3.5 : 4.5;
  ctx.beginPath();
  ctx.moveTo(-13, moving ? -14 : -8);
  if (p.kind === 'cat') ctx.quadraticCurveTo(-26, -16, -22 + wag * 6, -32);
  else ctx.quadraticCurveTo(-22, -20 + wag * 6, -24, -26 + wag * 8);
  ctx.stroke();
  // thân (ngồi thì dựng đứng hơn)
  ctx.fillStyle = p.body;
  ctx.beginPath();
  if (moving) ctx.ellipse(0, -15, 15, 8, 0, 0, Math.PI * 2);
  else ctx.ellipse(2, -13, 11, 10, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.patch;
  ctx.beginPath();
  ctx.ellipse(moving ? 4 : 5, moving ? -12 : -10, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // đầu
  const hx = moving ? 15 : 11;
  const hy = moving ? -22 : -27;
  ctx.fillStyle = p.body;
  ctx.beginPath();
  ctx.arc(hx, hy, 8.5, 0, Math.PI * 2);
  ctx.fill();
  if (p.kind === 'dog') {
    ctx.fillStyle = p.patch === '#3a2a22' ? '#3a2a22' : p.body === '#3a2f2a' ? '#2a211d' : '#9a6334';
    ctx.beginPath();
    ctx.ellipse(hx - 5, hy - 2, 3.2, 6.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.patch;
    ctx.beginPath();
    ctx.ellipse(hx + 6, hy + 2, 5, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b1d18';
    ctx.beginPath();
    ctx.arc(hx + 10, hy + 1, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = p.body;
    for (const ex of [-4, 4]) {
      ctx.beginPath();
      ctx.moveTo(hx + ex - 3.5, hy - 5);
      ctx.lineTo(hx + ex, hy - 13);
      ctx.lineTo(hx + ex + 3.5, hy - 5);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(hx + 6, hy + 2);
    ctx.lineTo(hx + 13, hy + 1);
    ctx.moveTo(hx + 6, hy + 3);
    ctx.lineTo(hx + 13, hy + 4);
    ctx.stroke();
  }
  ctx.fillStyle = '#2b1d18';
  ctx.beginPath();
  ctx.arc(hx + 3, hy - 1.5, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Vẽ nhân vật chibi bằng nét canvas (không dùng ảnh): đầu to, nhiều kiểu tóc, đồ đi đám cưới.
// Gốc toạ độ (x, y) là chỗ chân chạm đất, `s` là độ to theo xa gần.

export type Pose = 'stand' | 'walk' | 'sit' | 'cheer' | 'dance' | 'clap' | 'wave' | 'pose' | 'carry' | 'catch' | 'throw';
export type Facing = 'front' | 'back' | 'left' | 'right';
export type Outfit = 'aodai' | 'shirt' | 'dress' | 'bride' | 'groom';

export interface Look {
  skin: string;
  hair: string;
  style: number; // 0 ngắn, 1 dài, 2 búi, 3 đuôi ngựa, 4 bob, 5 hai búi
  outfit: Outfit;
  main: string;
  accent: string;
}

const SKINS = ['#f8dcc4', '#f3cfb3', '#eec4a2', '#f6d6bd', '#e9b994'];
const HAIRS = ['#2a201c', '#33251e', '#1f1a18', '#4a3326', '#3a2a22'];
// Màu đồ dịu, không chói: hồng phấn, xanh mint, vàng bơ, tím nhạt, xanh dương nhạt, kem, đào
const MAINS = ['#f2a7b8', '#9fd8c8', '#f6d58e', '#c6b3e6', '#9ec3ea', '#f0c9a0', '#f7b79b', '#b8d98f', '#e8a0c8', '#8fc7d8'];
const ACCENTS = ['#ffffff', '#fff3d6', '#fde2ea', '#e8f4ff'];

export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Cùng 1 username thì luôn ra cùng 1 ngoại hình */
export function lookFor(username: string): Look {
  const h = hash(username);
  const outfits: Outfit[] = ['aodai', 'shirt', 'dress', 'aodai', 'shirt'];
  return {
    skin: SKINS[h % SKINS.length],
    hair: HAIRS[(h >>> 3) % HAIRS.length],
    style: (h >>> 6) % 6,
    outfit: outfits[(h >>> 9) % outfits.length],
    main: MAINS[(h >>> 12) % MAINS.length],
    accent: ACCENTS[(h >>> 16) % ACCENTS.length],
  };
}

export const BRIDE_LOOK: Look = { skin: '#f8dcc4', hair: '#2a201c', style: 2, outfit: 'bride', main: '#fffaf5', accent: '#f5c6d3' };
export const GROOM_LOOK: Look = { skin: '#f0c9aa', hair: '#1f1a18', style: 0, outfit: 'groom', main: '#2f3d5c', accent: '#ffffff' };

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

export function drawChibi(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  look: Look,
  pose: Pose,
  t: number,
  facing: Facing,
  phase: number,
) {
  const u = s;
  const back = facing === 'back';
  const side = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
  const sit = pose === 'sit' || pose === 'cheer';

  // nhún người
  let bob = Math.sin(t * 2 + phase) * 0.5 * u;
  let sway = 0;
  if (pose === 'walk' || pose === 'carry') bob = -Math.abs(Math.sin(phase)) * 2.4 * u;
  if (pose === 'dance') {
    bob = -Math.abs(Math.sin(t * 9 + phase)) * 6 * u;
    sway = Math.sin(t * 4.5 + phase) * 3 * u;
  }
  if (pose === 'clap') bob = -Math.abs(Math.sin(t * 7 + phase)) * 1.5 * u;
  if (pose === 'catch') bob = -Math.abs(Math.sin(t * 6)) * 8 * u;

  // bóng
  ctx.fillStyle = 'rgba(60,30,20,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y, 13 * u, 4 * u, 0, 0, Math.PI * 2);
  ctx.fill();

  const cx = x + sway;
  const base = y + bob + (sit ? 7 * u : 0); // ngồi thì thấp xuống
  const hip = base - 11 * u;
  const sh = base - 31 * u;
  const hc = base - 46 * u;
  const o = look.outfit;
  const legCol = o === 'groom' ? '#26324c' : o === 'aodai' ? '#fbf7f0' : o === 'shirt' ? '#4b5568' : look.skin;
  const shoe = o === 'bride' ? '#f3e6dd' : '#3a2b25';

  // chân
  if (!sit && o !== 'bride') {
    const walking = pose === 'walk' || pose === 'carry';
    const lift = walking ? Math.sin(phase) * 3 * u : 0;
    for (const k of [-1, 1]) {
      const ly = base - (k < 0 ? Math.max(0, lift) : Math.max(0, -lift));
      ctx.fillStyle = legCol;
      ctx.fillRect(cx + k * 4 * u - 2.6 * u, hip, 5.2 * u, ly - hip);
      ctx.fillStyle = shoe;
      ctx.beginPath();
      ctx.ellipse(cx + k * 4 * u, ly, 3.4 * u, 2 * u, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // tóc dài / khăn voan phía sau
  if (look.outfit === 'bride') {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.moveTo(cx - 9 * u, hc - 10 * u);
    ctx.quadraticCurveTo(cx - 22 * u, sh + 10 * u, cx - 16 * u, hip + 4 * u);
    ctx.lineTo(cx + 16 * u, hip + 4 * u);
    ctx.quadraticCurveTo(cx + 22 * u, sh + 10 * u, cx + 9 * u, hc - 10 * u);
    ctx.fill();
  } else if (look.style === 1 && !back) {
    ctx.fillStyle = look.hair;
    roundRect(ctx, cx - 15 * u, hc - 4 * u, 30 * u, 26 * u, 8 * u);
    ctx.fill();
  }

  // thân
  const main = back ? shade(look.main, 0.92) : look.main;
  ctx.fillStyle = main;
  ctx.beginPath();
  if (o === 'bride') {
    ctx.moveTo(cx - 8 * u, sh);
    ctx.lineTo(cx + 8 * u, sh);
    ctx.quadraticCurveTo(cx + 10 * u, hip - 6 * u, cx + 19 * u, base);
    ctx.quadraticCurveTo(cx, base + 4 * u, cx - 19 * u, base);
    ctx.quadraticCurveTo(cx - 10 * u, hip - 6 * u, cx - 8 * u, sh);
  } else if (o === 'aodai') {
    ctx.moveTo(cx - 8.5 * u, sh);
    ctx.lineTo(cx + 8.5 * u, sh);
    ctx.lineTo(cx + 10 * u, base - 3 * u);
    ctx.lineTo(cx - 10 * u, base - 3 * u);
  } else if (o === 'dress') {
    ctx.moveTo(cx - 8 * u, sh);
    ctx.lineTo(cx + 8 * u, sh);
    ctx.lineTo(cx + 13 * u, hip + 4 * u);
    ctx.lineTo(cx - 13 * u, hip + 4 * u);
  } else {
    ctx.moveTo(cx - 9.5 * u, sh);
    ctx.lineTo(cx + 9.5 * u, sh);
    ctx.lineTo(cx + 10 * u, hip + 1 * u);
    ctx.lineTo(cx - 10 * u, hip + 1 * u);
  }
  ctx.closePath();
  ctx.fill();

  // chi tiết thân
  if (!back) {
    if (o === 'groom') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 4 * u, sh);
      ctx.lineTo(cx + 4 * u, sh);
      ctx.lineTo(cx, sh + 9 * u);
      ctx.fill();
      ctx.fillStyle = '#c8344a';
      ctx.beginPath();
      ctx.ellipse(cx - 2 * u, sh + 2 * u, 2 * u, 1.4 * u, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 2 * u, sh + 2 * u, 2 * u, 1.4 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5c6d3';
      ctx.beginPath();
      ctx.arc(cx - 6 * u, sh + 5 * u, 1.8 * u, 0, Math.PI * 2);
      ctx.fill();
    } else if (o === 'aodai') {
      ctx.strokeStyle = look.accent;
      ctx.lineWidth = 1.4 * u;
      ctx.beginPath();
      ctx.moveTo(cx - 3 * u, sh + 1 * u);
      ctx.quadraticCurveTo(cx + 2 * u, sh + 6 * u, cx + 7 * u, sh + 9 * u);
      ctx.stroke();
    } else if (o === 'bride') {
      ctx.fillStyle = 'rgba(245,198,211,0.9)';
      ctx.fillRect(cx - 8 * u, hip - 9 * u, 16 * u, 2.4 * u);
    } else {
      ctx.fillStyle = look.accent;
      ctx.beginPath();
      ctx.moveTo(cx - 4 * u, sh);
      ctx.lineTo(cx + 4 * u, sh);
      ctx.lineTo(cx, sh + 5 * u);
      ctx.fill();
    }
  }

  // tay
  const sl = { x: cx - 9 * u, y: sh + 3 * u };
  const sr = { x: cx + 9 * u, y: sh + 3 * u };
  let hl = { x: cx - 12 * u, y: hip - 1 * u };
  let hr = { x: cx + 12 * u, y: hip - 1 * u };
  const sw = pose === 'walk' ? Math.sin(phase) * 3 * u : 0;
  hl.y -= sw;
  hr.y += sw;
  let glass = false;
  let bouquet = o === 'bride' && pose !== 'throw';
  switch (pose) {
    case 'clap': {
      const c = Math.abs(Math.sin(t * 14 + phase)) * 3 * u;
      hl = { x: cx - c, y: sh + 10 * u };
      hr = { x: cx + c, y: sh + 10 * u };
      break;
    }
    case 'wave':
      hr = { x: cx + 15 * u + Math.sin(t * 10) * 3 * u, y: sh - 12 * u };
      break;
    case 'cheer': {
      const k = Math.sin(t * 6 + phase);
      hr = { x: cx + 10 * u + k * 2 * u, y: sh - 11 * u - Math.max(0, k) * 3 * u };
      hl = { x: cx - 8 * u, y: sh + 9 * u };
      glass = true;
      break;
    }
    case 'dance':
      hl = { x: cx - 15 * u, y: sh - 10 * u + Math.sin(t * 9 + phase) * 6 * u };
      hr = { x: cx + 15 * u, y: sh - 10 * u - Math.sin(t * 9 + phase) * 6 * u };
      break;
    case 'pose':
      hr = { x: cx + 14 * u, y: hc + 3 * u };
      break;
    case 'carry':
    case 'catch':
      hl = { x: cx - 9 * u, y: hc - 15 * u };
      hr = { x: cx + 9 * u, y: hc - 15 * u };
      break;
    case 'throw':
      hr = { x: cx + Math.cos(t * 5) * 6 * u, y: hc - 18 * u };
      hl = { x: cx - 10 * u, y: hc - 12 * u };
      break;
    case 'sit':
      hl = { x: cx - 8 * u, y: sh + 9 * u };
      hr = { x: cx + 8 * u, y: sh + 9 * u };
      break;
  }
  if (o === 'bride' && (pose === 'stand' || pose === 'walk' || pose === 'sit')) {
    hl = { x: cx - 3 * u, y: sh + 11 * u };
    hr = { x: cx + 3 * u, y: sh + 11 * u };
  }
  ctx.lineCap = 'round';
  ctx.strokeStyle = o === 'bride' ? look.skin : main;
  ctx.lineWidth = 5 * u;
  for (const [a, b] of [
    [sl, hl],
    [sr, hr],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.fillStyle = look.skin;
  for (const h of [hl, hr]) {
    ctx.beginPath();
    ctx.arc(h.x, h.y, 2.7 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  if (glass) {
    ctx.fillStyle = 'rgba(250,200,90,0.95)';
    ctx.fillRect(hr.x - 2 * u, hr.y - 8 * u, 4 * u, 6 * u);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(hr.x - 2 * u, hr.y - 9 * u, 4 * u, 1.6 * u);
  }
  if (bouquet && !back) drawBouquet(ctx, (hl.x + hr.x) / 2, (hl.y + hr.y) / 2, u);
  if (pose === 'pose' && !back) {
    ctx.strokeStyle = look.skin;
    ctx.lineWidth = 1.6 * u;
    ctx.beginPath();
    ctx.moveTo(hr.x, hr.y);
    ctx.lineTo(hr.x - 2 * u, hr.y - 5 * u);
    ctx.moveTo(hr.x, hr.y);
    ctx.lineTo(hr.x + 2 * u, hr.y - 5 * u);
    ctx.stroke();
  }

  // đầu
  ctx.fillStyle = look.skin;
  ctx.beginPath();
  ctx.arc(cx, hc, 15 * u, 0, Math.PI * 2);
  ctx.fill();
  drawHair(ctx, cx, hc, u, look, back, side);

  if (!back) {
    const ex = side * 4 * u;
    const blink = (t + phase * 3) % 4.2 < 0.12;
    ctx.fillStyle = '#2b1d18';
    for (const k of [-1, 1]) {
      if (side && k === -side) continue; // nghiêng thì khuất 1 mắt
      ctx.beginPath();
      if (blink) ctx.fillRect(cx + ex + k * 5 * u - 2 * u, hc + 1.5 * u, 4 * u, 0.9 * u);
      else ctx.ellipse(cx + ex + k * 5 * u, hc + 1.5 * u, 1.9 * u, 2.5 * u, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(240,120,130,0.35)';
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + ex + k * 8.5 * u, hc + 6 * u, 2.6 * u, 0, Math.PI * 2);
      ctx.fill();
    }
    const happy = pose === 'cheer' || pose === 'dance' || pose === 'clap' || pose === 'catch' || pose === 'pose' || pose === 'wave';
    ctx.fillStyle = '#b8505a';
    ctx.beginPath();
    if (happy) ctx.ellipse(cx + ex, hc + 7 * u, 2.4 * u, 1.9 * u, 0, 0, Math.PI * 2);
    else ctx.ellipse(cx + ex, hc + 7 * u, 1.6 * u, 0.8 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (pose === 'carry') drawTray(ctx, cx, hc - 21 * u, u);
}

function drawHair(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, look: Look, back: boolean, side: number) {
  ctx.fillStyle = look.hair;
  ctx.beginPath();
  if (back) {
    ctx.arc(x, y - 0.5 * u, 15.6 * u, 0, Math.PI * 2);
  } else {
    // mái trên đầu + tóc mái
    ctx.arc(x, y - 1 * u, 15.8 * u, Math.PI * 0.98, Math.PI * 2.02);
    ctx.quadraticCurveTo(x + 12 * u + side * 3 * u, y - 4 * u, x + side * 4 * u, y - 7 * u);
    ctx.quadraticCurveTo(x - 10 * u + side * 3 * u, y - 4 * u, x - 15.6 * u, y - 0.5 * u);
  }
  ctx.fill();
  const st = look.style;
  if (st === 4 && !back) {
    roundRect(ctx, x - 16 * u, y - 4 * u, 6 * u, 14 * u, 3 * u);
    ctx.fill();
    roundRect(ctx, x + 10 * u, y - 4 * u, 6 * u, 14 * u, 3 * u);
    ctx.fill();
  }
  if (st === 2) {
    ctx.beginPath();
    ctx.arc(x, y - 17 * u, 6.5 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  if (st === 5) {
    ctx.beginPath();
    ctx.arc(x - 12 * u, y - 12 * u, 5 * u, 0, Math.PI * 2);
    ctx.arc(x + 12 * u, y - 12 * u, 5 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  if (st === 3) {
    ctx.beginPath();
    ctx.ellipse(x + 15 * u, y + 2 * u, 4.5 * u, 10 * u, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  if (st === 1 && back) {
    roundRect(ctx, x - 15 * u, y, 30 * u, 22 * u, 8 * u);
    ctx.fill();
  }
  if (look.outfit === 'bride') {
    ctx.fillStyle = '#f5c6d3';
    for (const k of [-1, 0, 1]) {
      ctx.beginPath();
      ctx.arc(x + k * 5 * u, y - 15 * u + Math.abs(k) * 1.5 * u, 2.3 * u, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawBouquet(ctx: CanvasRenderingContext2D, x: number, y: number, u: number) {
  ctx.fillStyle = '#7fb069';
  ctx.beginPath();
  ctx.moveTo(x - 3 * u, y);
  ctx.lineTo(x + 3 * u, y);
  ctx.lineTo(x, y + 7 * u);
  ctx.fill();
  const cols = ['#f49ab2', '#ffffff', '#f7c3d0', '#f49ab2', '#ffd6e0'];
  cols.forEach((c, i) => {
    const a = (i / cols.length) * Math.PI * 2;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 3 * u, y - 2 * u + Math.sin(a) * 2.4 * u, 2.6 * u, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawTray(ctx: CanvasRenderingContext2D, x: number, y: number, u: number) {
  ctx.fillStyle = '#c98a3c';
  ctx.beginPath();
  ctx.ellipse(x, y, 19 * u, 6 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e6aa52';
  ctx.beginPath();
  ctx.ellipse(x, y - 1.2 * u, 17 * u, 4.8 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  const dishes = ['#ffffff', '#f3e0b5', '#ffffff', '#f9f3e3'];
  const food = ['#e4572e', '#7fb069', '#f2c14e', '#a0522d'];
  for (let i = 0; i < 4; i++) {
    const dx = (i - 1.5) * 8 * u;
    ctx.fillStyle = dishes[i];
    ctx.beginPath();
    ctx.ellipse(x + dx, y - 2.5 * u, 3.8 * u, 2 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = food[i];
    ctx.beginPath();
    ctx.ellipse(x + dx, y - 3.2 * u, 2.4 * u, 1.3 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

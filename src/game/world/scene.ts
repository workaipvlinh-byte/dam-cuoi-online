// Rạp cưới quê vẽ bằng canvas: nhà, rạp, sân khấu, sân gạch, bếp, cổng hoa, bàn tiệc.
// Phần tĩnh vẽ 1 lần vào ảnh nền; đèn nhấp nháy, bàn tiệc, cổng hoa vẽ mỗi khung hình.
import { drawTray, roundRect } from './chibi';
import { DANCE, H, STAGE, TABLE_RX, TABLE_RY, W, type Table } from './layout';

const VP = { x: 540, y: 160 }; // điểm tụ của sân gạch

const ROSES = ['#d62f45', '#e8466b', '#f49ab2', '#fff5f2', '#c2233a'];

/** Hoa hồng nhìn từ trên: các vòng cánh xoắn vào tâm */
export function drawRose(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,10,25,0.35)';
  ctx.lineWidth = Math.max(1, r * 0.14);
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 5; a += 0.3) {
    const rr = r * (1 - a / (Math.PI * 5.4));
    const px = x + Math.cos(a) * rr * 0.8;
    const py = y + Math.sin(a) * rr * 0.8;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number) {
  ctx.fillStyle = '#5f9a55';
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.45, a, 0, Math.PI * 2);
  ctx.fill();
}

/** Bụi hồng nhỏ: vài lá + 3-5 bông */
function roseBush(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, seed: number) {
  for (let i = 0; i < 4; i++) leaf(ctx, x + Math.cos(i * 1.7 + seed) * s * 1.1, y + Math.sin(i * 1.7 + seed) * s * 0.5, s * 0.7, i + seed);
  const n = 3 + (seed % 3);
  for (let i = 0; i < n; i++)
    drawRose(ctx, x + Math.cos(i * 2.3 + seed) * s * 0.8, y - s * 0.3 + Math.sin(i * 2.3 + seed) * s * 0.4, s * 0.55, ROSES[(seed + i) % ROSES.length]);
}

/** Hoa hồng trang trí khắp rạp (vẽ 1 lần vào nền) */
function paintRoses(ctx: CanvasRenderingContext2D) {
  // dọc hai mép thảm đỏ
  for (let k = 0, y = 880; y < 1660; k++, y += 70) {
    const t = (y - 860) / (H - 860);
    const s = 9 + t * 7;
    roseBush(ctx, 505 - 40 * t - s, y, s, k);
    roseBush(ctx, 575 + 40 * t + s, y, s, k + 3);
  }
  // mép trước sân khấu
  for (let x = 285, k = 0; x < 800; x += 38, k++) roseBush(ctx, x, 846, 10, k);
  // dây hồng trên vải rạp
  for (let x = 20, k = 0; x < W; x += 30, k++) drawRose(ctx, x, 292 + Math.sin(k) * 4, 9, ROSES[k % ROSES.length]);
  // hồng quấn cột rạp
  for (const x of [22, 1058]) for (let y = 360, k = 0; y < 1680; y += 70, k++) {
    leaf(ctx, x - 10, y + 6, 8, 0.6);
    drawRose(ctx, x, y, 10, ROSES[k % 3]);
  }
  // hai chậu hồng lớn hai bên sân khấu
  for (const x of [215, 865]) {
    ctx.fillStyle = '#b97e4c';
    ctx.fillRect(x - 26, 790, 52, 46);
    for (let i = 0; i < 9; i++) roseBush(ctx, x + Math.cos(i * 0.7) * 20, 770 - Math.sin(i * 1.3) * 22 - (i % 3) * 8, 11, i);
  }
}

export function paintBackground(ctx: CanvasRenderingContext2D) {
  // trời
  let g = ctx.createLinearGradient(0, 0, 0, 320);
  g.addColorStop(0, '#bfe3f4');
  g.addColorStop(1, '#fbefd9');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 340);

  // cây xa
  const greens = ['#8fbf73', '#7bb062', '#a3cc82', '#6fa457'];
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = greens[i % greens.length];
    const x = (i * 97) % (W + 80) - 40;
    ctx.beginPath();
    ctx.arc(x, 250 + ((i * 37) % 50), 55 + ((i * 13) % 30), 0, Math.PI * 2);
    ctx.fill();
  }

  // mái ngói + tường nhà vàng
  ctx.fillStyle = '#b4583e';
  ctx.beginPath();
  ctx.moveTo(-20, 330);
  ctx.lineTo(130, 230);
  ctx.lineTo(950, 230);
  ctx.lineTo(1100, 330);
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,30,20,0.25)';
  ctx.lineWidth = 2;
  for (let y = 245; y < 330; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#8f3f2c';
  ctx.fillRect(120, 222, 840, 12);
  g = ctx.createLinearGradient(0, 330, 0, 700);
  g.addColorStop(0, '#f3d89b');
  g.addColorStop(1, '#e9c886');
  ctx.fillStyle = g;
  ctx.fillRect(0, 330, W, 380);
  for (const x of [60, 905]) {
    ctx.fillStyle = '#5f8f6a';
    ctx.fillRect(x, 430, 115, 150);
    ctx.fillStyle = '#4c7656';
    ctx.fillRect(x + 55, 430, 5, 150);
    for (let y = 445; y < 580; y += 18) ctx.fillRect(x, y, 115, 3);
  }

  // sân gạch tàu
  g = ctx.createLinearGradient(0, 690, 0, H);
  g.addColorStop(0, '#d39377');
  g.addColorStop(1, '#c47658');
  ctx.fillStyle = g;
  ctx.fillRect(0, 690, W, H - 690);
  ctx.strokeStyle = 'rgba(120,55,35,0.22)';
  ctx.lineWidth = 2;
  for (let k = 0, y = 700; y < H; k++, y += 26 + k * 4.5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let i = -14; i <= 14; i++) {
    const xb = VP.x + i * 120;
    ctx.beginPath();
    ctx.moveTo(VP.x + (xb - VP.x) * ((690 - VP.y) / (H - VP.y)), 690);
    ctx.lineTo(xb, H);
    ctx.stroke();
  }

  // thảm đỏ lối giữa
  ctx.fillStyle = '#d4566b';
  ctx.beginPath();
  ctx.moveTo(505, 860);
  ctx.lineTo(575, 860);
  ctx.lineTo(615, H);
  ctx.lineTo(465, H);
  ctx.fill();
  ctx.strokeStyle = '#efc46a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(508, 860);
  ctx.lineTo(470, H);
  ctx.moveTo(572, 860);
  ctx.lineTo(610, H);
  ctx.stroke();

  // sàn nhảy bóng trước sân khấu
  ctx.save();
  ctx.beginPath();
  ctx.ellipse((DANCE.x0 + DANCE.x1) / 2, (DANCE.y0 + DANCE.y1) / 2 + 8, (DANCE.x1 - DANCE.x0) / 2 + 20, 70, 0, 0, Math.PI * 2);
  ctx.clip();
  for (let i = 0; i < 16; i++)
    for (let j = 0; j < 6; j++) {
      ctx.fillStyle = (i + j) % 2 ? 'rgba(255,240,245,0.55)' : 'rgba(240,200,215,0.55)';
      ctx.fillRect(DANCE.x0 - 30 + i * 36, DANCE.y0 - 60 + j * 34, 36, 34);
    }
  ctx.restore();

  // phông cưới
  roundRect(ctx, 315, 390, 450, 320, 24);
  ctx.fillStyle = '#fbe1e6';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#fffaf6';
  ctx.stroke();
  const flower = ['#f49ab2', '#ffffff', '#f7c3d0', '#ffd8b5', '#f49ab2'];
  for (let i = 0; i <= 30; i++) {
    const a = Math.PI + (i / 30) * Math.PI;
    const fx = 540 + Math.cos(a) * 225;
    const fy = 520 + Math.sin(a) * 140;
    ctx.fillStyle = flower[i % flower.length];
    ctx.beginPath();
    ctx.arc(fx, fy, 15 + (i % 3) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8cc084';
    ctx.beginPath();
    ctx.ellipse(fx + 12, fy + 10, 8, 4, a, 0, Math.PI * 2);
    ctx.fill();
  }
  // long phượng sum vầy: rồng bên trái, phượng bên phải, quay vào nhau
  drawDragon(ctx, 445, 488, 0.62, 1, 0);
  drawPhoenix(ctx, 640, 488, 0.62, -1, 0);
  heartShape(ctx, 540, 478, 22, '#d4566b');
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c48a2c';
  ctx.font = '700 84px "Dancing Script", cursive';
  ctx.fillText('Hạnh Phúc', 540, 612);
  ctx.font = '600 26px "Be Vietnam Pro", sans-serif';
  ctx.fillStyle = '#b86f7d';
  ctx.fillText('LONG PHƯỢNG SUM VẦY', 540, 656);

  // loa thùng hai bên
  for (const x of [255, 825]) {
    ctx.fillStyle = '#2b2b33';
    roundRect(ctx, x - 32, 600, 64, 120, 8);
    ctx.fill();
    ctx.fillStyle = '#4a4a55';
    for (const [yy, r] of [
      [630, 14],
      [682, 22],
    ]) {
      ctx.beginPath();
      ctx.arc(x, yy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // sân khấu
  ctx.fillStyle = '#d29a63';
  ctx.beginPath();
  ctx.moveTo(STAGE.x0 + 30, STAGE.top);
  ctx.lineTo(STAGE.x1 - 30, STAGE.top);
  ctx.lineTo(STAGE.x1, STAGE.front);
  ctx.lineTo(STAGE.x0, STAGE.front);
  ctx.fill();
  ctx.fillStyle = '#d4566b';
  ctx.beginPath();
  ctx.moveTo(380, STAGE.top);
  ctx.lineTo(700, STAGE.top);
  ctx.lineTo(720, STAGE.front);
  ctx.lineTo(360, STAGE.front);
  ctx.fill();
  ctx.fillStyle = '#9b6238';
  ctx.fillRect(STAGE.x0, STAGE.front, STAGE.x1 - STAGE.x0, 26);
  ctx.fillStyle = '#f2b8c6';
  for (let x = STAGE.x0; x < STAGE.x1; x += 30) {
    ctx.beginPath();
    ctx.arc(x + 15, STAGE.front + 2, 15, 0, Math.PI);
    ctx.fill();
  }
  // bậc lên sân khấu (bên phải)
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i % 2 ? '#b97e4c' : '#c98c58';
    ctx.fillRect(STAGE.x1 - 10 + i * 4, STAGE.front - 10 + i * 14, 80 - i * 6, 14);
  }

  // bếp bên trái
  ctx.fillStyle = '#e9c98f';
  ctx.fillRect(0, 760, 170, 280);
  ctx.fillStyle = '#9b4d36';
  ctx.beginPath();
  ctx.moveTo(-10, 770);
  ctx.lineTo(185, 770);
  ctx.lineTo(160, 735);
  ctx.lineTo(0, 735);
  ctx.fill();
  ctx.fillStyle = '#4a3428';
  roundRect(ctx, 30, 845, 120, 175, 10);
  ctx.fill();
  ctx.fillStyle = '#e8b04a';
  ctx.beginPath();
  ctx.arc(90, 975, 30, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#5a5a62';
  roundRect(ctx, 52, 960, 76, 40, 8);
  ctx.fill();
  for (let i = 0; i < 4; i++) drawTray(ctx, 90, 900 - i * 12, 1.25);
  ctx.font = '700 26px "Be Vietnam Pro", sans-serif';
  ctx.fillStyle = '#7a3b28';
  ctx.fillText('BẾP', 90, 818);

  // cột rạp hai bên quấn vải hồng
  for (const x of [22, 1058]) {
    ctx.fillStyle = '#fffaf4';
    ctx.fillRect(x - 9, 300, 18, 1420);
    ctx.strokeStyle = '#f2a7b8';
    ctx.lineWidth = 6;
    for (let y = 320; y < 1700; y += 70) {
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x + 9, y + 35);
      ctx.stroke();
    }
  }

  // vải rạp phía trên: từng múi rủ xuống, xen trắng hồng
  for (let i = 0; i < 12; i++) {
    const x0 = i * 90;
    ctx.fillStyle = i % 2 ? '#fde3ea' : '#fffaf5';
    ctx.beginPath();
    ctx.moveTo(x0, 300);
    ctx.quadraticCurveTo(x0 + 45, 395, x0 + 90, 300);
    ctx.lineTo(x0 + 90, 286);
    ctx.lineTo(x0, 286);
    ctx.fill();
  }
  ctx.fillStyle = '#f2a7b8';
  ctx.fillRect(0, 280, W, 10);
  paintRoses(ctx); // vẽ sau cùng để dây hồng nằm trên vải rạp
}

// Dây đèn bóng tròn trên rạp
const LIGHTS: { x: number; y: number; c: string }[] = [];
for (let r = 0; r < 2; r++)
  for (let i = 0; i <= 26; i++) {
    const x = (i / 26) * W;
    const y = 330 + r * 40 + Math.sin((i / 26) * Math.PI) * 38;
    LIGHTS.push({ x, y, c: ['#ffe08a', '#ffb3c6', '#fff4c2', '#b8e6ff'][(i + r) % 4] });
  }

export function drawLights(ctx: CanvasRenderingContext2D, t: number, party: boolean) {
  ctx.strokeStyle = 'rgba(90,70,60,0.5)';
  ctx.lineWidth = 2;
  for (let r = 0; r < 2; r++) {
    ctx.beginPath();
    LIGHTS.slice(r * 27, r * 27 + 27).forEach((l, i) => (i ? ctx.lineTo(l.x, l.y - 6) : ctx.moveTo(l.x, l.y - 6)));
    ctx.stroke();
  }
  LIGHTS.forEach((l, i) => {
    const on = 0.55 + 0.45 * Math.sin(t * (party ? 9 : 2.2) + i * 1.7);
    ctx.globalAlpha = 0.25 * on;
    ctx.fillStyle = l.c;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.6 + 0.4 * on;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

/** Ánh đèn sân khấu quét qua sàn nhảy khi có người quẩy */
export function drawDisco(ctx: CanvasRenderingContext2D, t: number, power: number) {
  if (power <= 0) return;
  const cols = ['255,120,170', '120,200,255', '255,220,110', '180,140,255'];
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const x = 540 + Math.sin(t * (0.9 + i * 0.3) + i) * 220;
    const y = 925 + Math.cos(t * 1.3 + i * 2) * 30;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 110);
    g.addColorStop(0, `rgba(${cols[i]},${0.35 * power})`);
    g.addColorStop(1, `rgba(${cols[i]},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - 110, y - 110, 220, 220);
  }
  ctx.globalCompositeOperation = 'source-over';
}

export function drawSteam(ctx: CanvasRenderingContext2D, t: number) {
  for (let i = 0; i < 4; i++) {
    const k = (t * 0.35 + i / 4) % 1;
    ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - k)})`;
    ctx.beginPath();
    ctx.arc(90 + Math.sin(t + i) * 10, 950 - k * 90, 10 + k * 16, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawTable(ctx: CanvasRenderingContext2D, tb: Table, glow: number) {
  const { x, y } = tb;
  // chân váy bàn
  ctx.fillStyle = '#f2b8c6';
  ctx.beginPath();
  ctx.ellipse(x, y + 16, TABLE_RX, TABLE_RY, 0, 0, Math.PI);
  ctx.lineTo(x - TABLE_RX, y);
  ctx.ellipse(x, y, TABLE_RX, TABLE_RY, 0, Math.PI, 0, true);
  ctx.fill();
  ctx.fillStyle = '#fffaf6';
  ctx.beginPath();
  ctx.ellipse(x, y, TABLE_RX, TABLE_RY, 0, 0, Math.PI * 2);
  ctx.fill();
  if (glow > 0) {
    ctx.fillStyle = `rgba(255,215,120,${0.45 * glow})`;
    ctx.beginPath();
    ctx.ellipse(x, y, TABLE_RX + 6, TABLE_RY + 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // ly nước + mâm
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    ctx.fillStyle = 'rgba(250,200,90,0.9)';
    ctx.fillRect(x + Math.cos(a) * 50 - 3, y + Math.sin(a) * 17 - 9, 6, 9);
  }
  // bình hồng giữa bàn
  ctx.fillStyle = 'rgba(200,230,255,0.85)';
  ctx.fillRect(x - 5, y - 16, 10, 12);
  drawRose(ctx, x - 5, y - 20, 6, '#d62f45');
  drawRose(ctx, x + 5, y - 21, 6, '#f49ab2');
  drawRose(ctx, x, y - 27, 6, '#e8466b');
  const spots = [-34, 34, 0];
  for (let i = 0; i < tb.food; i++) drawTray(ctx, x + spots[i], y + (i === 2 ? -10 : 2), 1.05);
}

/** Cổng hoa phía dưới, vẽ đè lên khách để khách đi xuyên qua cổng */
export function drawGate(ctx: CanvasRenderingContext2D) {
  for (const x of [415, 665]) {
    ctx.fillStyle = '#fffaf4';
    ctx.fillRect(x - 10, 1500, 20, 260);
    ctx.fillStyle = '#7fb069';
    for (let y = 1510; y < 1760; y += 26) {
      ctx.beginPath();
      ctx.ellipse(x + (y % 52 ? 9 : -9), y, 11, 6, y % 52 ? 0.6 : -0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const cols = ['#f49ab2', '#ffffff', '#f7c3d0', '#ffd8b5'];
  for (let i = 0; i <= 22; i++) {
    const a = Math.PI + (i / 22) * Math.PI;
    ctx.fillStyle = cols[i % 4];
    ctx.beginPath();
    ctx.arc(540 + Math.cos(a) * 125, 1510 + Math.sin(a) * 70, 17, 0, Math.PI * 2);
    ctx.fill();
  }
  roundRect(ctx, 440, 1404, 200, 54, 14);
  ctx.fillStyle = '#c2344d';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#efc46a';
  ctx.stroke();
  ctx.fillStyle = '#ffe7a8';
  ctx.font = '800 32px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VU QUY', 540, 1442);
  // rồng phượng hai bên biển cổng
  drawDragon(ctx, 385, 1428, 0.42, 1, 0);
  drawPhoenix(ctx, 698, 1428, 0.42, -1, 0);
}

function heartShape(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.4);
  ctx.bezierCurveTo(x - s, y - s * 0.3, x - s * 0.45, y - s, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 0.45, y - s, x + s, y - s * 0.3, x, y + s * 0.4);
  ctx.fill();
}

/** Rồng vàng cách điệu. dir 1 = đầu quay sang phải. t = thời gian (lượn mình khi bay) */
export function drawDragon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, dir: 1 | -1, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  // thân: chuỗi vảy tròn uốn sóng từ đuôi (trái) tới đầu (phải)
  const N = 22;
  for (let i = 0; i < N; i++) {
    const k = i / (N - 1);
    const bx = -150 + k * 230;
    const by = Math.sin(k * Math.PI * 2.2 + t * 4) * 26;
    const r = 7 + k * 13;
    ctx.fillStyle = i % 2 ? '#e8b23f' : '#d99a2b';
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
    // vây lưng
    if (i % 3 === 0) {
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(bx - r * 0.5, by - r * 0.7);
      ctx.lineTo(bx, by - r * 1.6);
      ctx.lineTo(bx + r * 0.5, by - r * 0.7);
      ctx.fill();
    }
  }
  const hy = Math.sin(Math.PI * 2.2 + t * 4) * 26;
  // đầu
  ctx.fillStyle = '#f0c04f';
  ctx.beginPath();
  ctx.ellipse(98, hy - 4, 30, 21, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(124, hy + 4, 18, 11, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(86, hy - 20);
  ctx.quadraticCurveTo(70, hy - 50, 50, hy - 48); // sừng
  ctx.moveTo(130, hy + 10);
  ctx.quadraticCurveTo(150, hy + 30, 170, hy + 20); // râu
  ctx.moveTo(128, hy - 2);
  ctx.quadraticCurveTo(152, hy - 22, 172, hy - 12);
  ctx.stroke();
  ctx.fillStyle = '#2b1d18';
  ctx.beginPath();
  ctx.arc(104, hy - 9, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // viên ngọc
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.arc(160, hy - 40, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,220,120,0.6)';
  ctx.beginPath();
  ctx.arc(160, hy - 40, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Phượng hồng vàng cách điệu. dir 1 = đầu quay sang phải */
export function drawPhoenix(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, dir: 1 | -1, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  // đuôi dài nhiều lông
  const tails = ['#f49ab2', '#e8b23f', '#d4566b', '#f6d58e', '#f7b79b'];
  tails.forEach((c, i) => {
    const sway = Math.sin(t * 3 + i) * 10;
    ctx.strokeStyle = c;
    ctx.lineWidth = 9 - i;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-60, 30 + i * 10, -120, -10 + i * 14 + sway, -175 + i * 6, 25 + i * 16 + sway);
    ctx.stroke();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(-175 + i * 6, 25 + i * 16 + sway, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  // cánh
  const flap = Math.sin(t * 6) * 0.25;
  ctx.fillStyle = '#f7c3d0';
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.quadraticCurveTo(-30, -80 - flap * 60, -95, -70 - flap * 50);
  ctx.quadraticCurveTo(-50, -30, -20, 12);
  ctx.fill();
  ctx.fillStyle = '#e8b23f';
  ctx.beginPath();
  ctx.moveTo(-10, -5);
  ctx.quadraticCurveTo(-35, -55 - flap * 40, -80, -60 - flap * 40);
  ctx.quadraticCurveTo(-45, -25, -18, 8);
  ctx.fill();
  // thân + cổ + đầu
  ctx.fillStyle = '#d4566b';
  ctx.beginPath();
  ctx.ellipse(10, 4, 34, 18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d4566b';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(30, -6);
  ctx.quadraticCurveTo(48, -30, 44, -52);
  ctx.stroke();
  ctx.fillStyle = '#e45f78';
  ctx.beginPath();
  ctx.arc(46, -56, 13, 0, Math.PI * 2);
  ctx.fill();
  // mào
  ctx.fillStyle = '#e8b23f';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(40 - i * 7, -74 + i * 2, 4, 10, -0.5 - i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#e8b23f';
  ctx.beginPath();
  ctx.moveTo(57, -58);
  ctx.lineTo(72, -52);
  ctx.lineTo(57, -50);
  ctx.fill();
  ctx.fillStyle = '#2b1d18';
  ctx.beginPath();
  ctx.arc(50, -59, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Cả rạp lên đèn: các vệt màu quét khắp sân */
export function drawPartyWash(ctx: CanvasRenderingContext2D, t: number) {
  const cols = ['255,120,170', '120,200,255', '255,220,110', '180,140,255', '140,255,190'];
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const x = 540 + Math.sin(t * (0.8 + i * 0.23) + i * 1.3) * 460;
    const y = 1150 + Math.cos(t * (1.1 + i * 0.17) + i) * 380;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 230);
    const a = 0.22 + 0.12 * Math.sin(t * 10 + i);
    g.addColorStop(0, `rgba(${cols[i % cols.length]},${a})`);
    g.addColorStop(1, `rgba(${cols[i % cols.length]},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - 230, y - 230, 460, 460);
  }
  ctx.globalCompositeOperation = 'source-over';
}

/** Xe hoa chạy ngang (quà to). k: 0..1 tiến độ */
export function drawWeddingCar(ctx: CanvasRenderingContext2D, k: number, t: number) {
  const x = -260 + k * (W + 520);
  const y = 1600;
  ctx.save();
  ctx.translate(x, y);
  // thân xe trắng
  ctx.fillStyle = 'rgba(60,30,20,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 52, 150, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffaf6';
  roundRect(ctx, -140, -10, 280, 60, 26);
  ctx.fill();
  roundRect(ctx, -80, -62, 150, 62, 28);
  ctx.fill();
  ctx.fillStyle = '#bfe3f4';
  roundRect(ctx, -66, -52, 58, 42, 10);
  ctx.fill();
  roundRect(ctx, 2, -52, 56, 42, 10);
  ctx.fill();
  for (const wx of [-85, 85]) {
    ctx.fillStyle = '#2b2b33';
    ctx.beginPath();
    ctx.arc(wx, 50, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9c9d1';
    ctx.save();
    ctx.translate(wx, 50);
    ctx.rotate(t * 12);
    ctx.fillRect(-12, -2, 24, 4);
    ctx.restore();
  }
  // hoa trên nắp capo + nơ
  const cols = ['#f49ab2', '#ffffff', '#f7c3d0', '#ffd8b5'];
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = cols[i % 4];
    ctx.beginPath();
    ctx.arc(70 + (i % 3) * 18, -6 - Math.floor(i / 3) * 12, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#d4566b';
  ctx.font = '800 26px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('XE HOA', -40, 30);
  ctx.restore();
}

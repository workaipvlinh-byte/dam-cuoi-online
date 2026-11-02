// Thế giới rạp cưới trên canvas: khách đi lại, bưng mâm, cụng ly, quẩy, xếp hàng chụp hình, bắt hoa, pháo giấy.
// Cô dâu chú rể đi chào từng bàn, có người chờ chụp hình thì về sân khấu.
// Không dùng React (vẽ 60 hình/giây). Game (useGame) ra lệnh qua các hàm public, nhận lại qua `events`.
import { BRIDE_LOOK, drawBouquet, drawChibi, GROOM_LOOK, hash, lookFor, roundRect, type Facing, type Look, type Pose } from './chibi';
import {
  BOUQUET,
  BRIDE,
  DANCE,
  GATE,
  GROOM,
  H,
  insideTable,
  KITCHEN,
  PHOTO_SPOT,
  QUEUE_SLOTS,
  scaleAt,
  SEAT_OFFSETS,
  SPECTATORS,
  STAGE_STEPS,
  TABLES,
  W,
  WANDER,
  type Table,
} from './layout';
import { drawDisco, drawDragon, drawGate, drawLights, drawPartyWash, drawPhoenix, drawSteam, drawTable, drawWeddingCar, paintBackground } from './scene';

type Step =
  | { k: 'walk'; x: number; y: number; run?: boolean }
  | { k: 'do'; pose: Pose; ms: number; face?: Facing; start?: () => void; end?: () => void }
  | { k: 'hold'; pose: Pose; face?: Facing; until: () => boolean; start?: () => void };

type Task = null | 'tray' | 'dzo' | 'dance' | 'queue' | 'photo' | 'bouquet' | 'idle-sit';

interface Guest {
  id: string;
  name: string;
  look: Look;
  x: number;
  y: number;
  plan: Step[];
  started: boolean; // bước đầu của plan đã chạy start()
  stepT: number;
  pose: Pose;
  facing: Facing;
  phase: number;
  task: Task;
  carrying: boolean;
  seat: { t: Table; i: number } | null;
  slot: number; // vị trí trong hàng chờ chụp hình, -1 = không xếp
  nameCv: HTMLCanvasElement | null; // khách đệm (npc) không có tên
  avatar: HTMLImageElement | null;
  bubble: { cv: HTMLCanvasElement; until: number } | null;
  lastActive: number;
  alpha: number;
  leaving: boolean;
  npc: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  c: string;
  life: number;
  max: number;
  kind: 'confetti' | 'spark' | 'heart' | 'text' | 'envelope' | 'gold';
  text?: string;
  size: number;
}

interface Balloon {
  x: number;
  y: number;
  c: string;
  sway: number;
}

export interface WorldEvents {
  trayDone?: (id: string) => void;
  photoStart?: (id: string) => void; // khách vừa đứng vào chỗ chụp
  caught?: (id: string) => void; // bắt được hoa
  queueChange?: (n: number) => void;
  coupleGreet?: (guestId: string) => void; // cô dâu chú rể vừa tới chào 1 khách thật
}

const MAX_GUESTS = 230;
const GUEST_CAP = 270; // vượt mức này thì khách mới vẫn vào, nhưng khách cũ bị mời về nhanh hơn
const EXTRAS = 110; // khách đệm cho rạp đông khi ít người xem; người thật vào thì khách đệm về bớt
const SPEED = 95;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pickOne = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

function makeGuest(id: string, look: Look, x: number, y: number, npc: boolean): Guest {
  return {
    id,
    name: '',
    look,
    x,
    y,
    plan: [],
    started: false,
    stepT: 0,
    pose: 'stand',
    facing: 'front',
    phase: (hash(id) % 628) / 100,
    task: null,
    carrying: false,
    seat: null,
    slot: -1,
    nameCv: null,
    avatar: null,
    bubble: null,
    lastActive: 0,
    alpha: 1,
    leaving: false,
    npc,
  };
}

class World {
  events: WorldEvents = {};
  private guests = new Map<string, Guest>();
  private queue: Guest[] = [];
  private photo: { g: Guest; released: boolean } | null = null;
  private bouquetState: { phase: 'gather' | 'fly' | 'done'; winner?: Guest; t: number; from: { x: number; y: number } } | null = null;
  private particles: Particle[] = [];
  private balloons: Balloon[] = [];
  private flash = 0;
  private partyUntil = 0;
  private danceAllUntil = 0;
  private coupleDanceUntil = 0;
  private carUntil = 0;
  private flyUntil = 0;
  private tableGlow = new Map<Table, number>();
  private bg: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private raf = 0;
  private last = 0;
  private t = 0;
  private eatTimer = 0;
  private extraSeq = 0;
  // đám đông đứng xem: chỉ đổi động tác, không đi lại
  private spectators = SPECTATORS.map((p, i) => {
    const g = makeGuest(`fan-${i}`, lookFor(`fan-${i}`), p.x, p.y, true);
    g.facing = p.back ? 'back' : 'front';
    return g;
  });

  // Cô dâu chú rể: đi chào bàn ('mingle') hoặc đứng sân khấu ('stage')
  private groom = makeGuest('__groom', GROOM_LOOK, GROOM.x, GROOM.y, true);
  private bride = makeGuest('__bride', BRIDE_LOOK, BRIDE.x, BRIDE.y, true);
  private coupleMode: 'stage' | 'mingle' | 'return' = 'stage';
  private coupleSince = Date.now();

  constructor() {
    TABLES.forEach((t, i) => (t.food = i % 3 === 0 ? 1 : 0));
    this.setCoupleNames('', '');
  }

  // ---------- gắn vào canvas ----------

  attach(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d');
    const paint = () => {
      const bg = document.createElement('canvas');
      bg.width = W;
      bg.height = H;
      paintBackground(bg.getContext('2d')!);
      this.bg = bg;
    };
    paint();
    // vẽ lại nền khi font chữ tải xong (chữ "Hạnh Phúc")
    document.fonts?.ready.then(paint).catch(() => {});
    if (!this.guests.size) this.fillExtras(true);
    this.last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  detach() {
    cancelAnimationFrame(this.raf);
    this.ctx = null;
  }

  // ---------- cô dâu chú rể ----------

  setCoupleNames(groom: string, bride: string) {
    this.groom.nameCv = nameTag(groom ? `Chú rể ${groom}` : 'Chú rể', null, '#2f3d5c');
    this.bride.nameCv = nameTag(bride ? `Cô dâu ${bride}` : 'Cô dâu', null, '#c2415d');
  }

  private coupleAtStage() {
    return (
      Math.hypot(this.groom.x - GROOM.x, this.groom.y - GROOM.y) < 4 && Math.hypot(this.bride.x - BRIDE.x, this.bride.y - BRIDE.y) < 4
    );
  }

  private coupleGoStage() {
    this.coupleMode = 'return';
    for (const [g, spot] of [
      [this.groom, GROOM],
      [this.bride, BRIDE],
    ] as const) {
      g.plan = [];
      if (g.y > STAGE_STEPS.y - 5) g.plan.push({ k: 'walk', x: STAGE_STEPS.x + (g === this.bride ? 30 : 0), y: STAGE_STEPS.y + 10, run: true });
      g.plan.push({ k: 'walk', x: spot.x, y: spot.y, run: true });
      g.started = false;
    }
  }

  private coupleGoMingle() {
    this.coupleMode = 'mingle';
    this.coupleSince = Date.now();
    // 2–3 bàn liền nhau, ưu tiên bàn có khách thật đang ngồi
    const real = [...this.guests.values()].filter((g) => !g.npc && g.seat).map((g) => g.seat!.t);
    const stops: Table[] = [];
    for (let i = 0; i < 3; i++) stops.push(real.length && Math.random() < 0.7 ? pickOne(real) : pickOne(TABLES));
    const gp: Step[] = [{ k: 'walk', x: STAGE_STEPS.x, y: STAGE_STEPS.y + 10 }];
    const bp: Step[] = [{ k: 'walk', x: STAGE_STEPS.x + 30, y: STAGE_STEPS.y + 10 }];
    for (const tb of stops) {
      const y = tb.y + 52;
      gp.push({ k: 'walk', x: tb.x - 24, y }, { k: 'do', pose: 'wave', ms: 3200, face: 'front' }, { k: 'do', pose: 'cheer', ms: 2200, face: 'back' });
      bp.push(
        { k: 'walk', x: tb.x + 24, y },
        {
          k: 'do',
          pose: 'wave',
          ms: 3200,
          face: 'front',
          start: () => {
            this.hearts(tb.x, y - 110, 5);
            this.tableGlow.set(tb, 1);
            const near = [...this.guests.values()].find((g) => !g.npc && g.seat?.t === tb);
            if (near) this.events.coupleGreet?.(near.id);
          },
        },
        { k: 'do', pose: 'clap', ms: 2200, face: 'back' },
      );
    }
    this.groom.plan = gp;
    this.bride.plan = bp;
    this.groom.started = this.bride.started = false;
  }

  private updateCouple(dt: number) {
    const needStage = !!this.photo || this.queue.length > 0 || !!this.bouquetState || Date.now() < this.coupleDanceUntil;
    if (this.coupleMode === 'mingle') {
      if (needStage || (!this.groom.plan.length && !this.bride.plan.length)) this.coupleGoStage();
    } else if (this.coupleMode === 'return') {
      if (!this.groom.plan.length && !this.bride.plan.length) {
        this.coupleMode = 'stage';
        this.coupleSince = Date.now();
      }
    } else if (!needStage && Date.now() - this.coupleSince > 25_000) this.coupleGoMingle();
    for (const g of [this.groom, this.bride]) {
      if (g.plan.length) this.stepGuest(g, dt);
      else {
        g.pose = 'stand';
        g.facing = 'front';
      }
    }
  }

  // ---------- khách ----------

  /** Có khách này chưa; chưa thì cho vào từ cổng */
  ensure(id: string, name: string, avatarUrl = '') {
    let g = this.guests.get(id);
    if (g) {
      g.lastActive = Date.now();
      if (g.name !== name) {
        g.name = name;
        g.nameCv = nameTag(name, g.avatar);
      }
      if (g.leaving) {
        g.leaving = false;
        g.alpha = 1;
        g.plan = [];
      }
    } else {
      if (this.guests.size >= MAX_GUESTS) this.evict();
      g = makeGuest(id, lookFor(id), GATE.x + rnd(-40, 40), GATE.y + rnd(0, 30), false);
      g.name = name;
      g.nameCv = nameTag(name, null);
      g.alpha = 0;
      g.facing = 'back';
      g.lastActive = Date.now();
      g.plan.push({ k: 'walk', x: GATE.x + rnd(-60, 60), y: rnd(1560, 1620) }, { k: 'do', pose: 'wave', ms: 1600, face: 'front' });
      this.guests.set(id, g);
      this.trimExtras();
    }
    if (avatarUrl && !g.avatar) {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      const guest = g;
      img.onload = () => {
        guest.avatar = img;
        guest.nameCv = nameTag(guest.name, img);
      };
      img.src = avatarUrl;
    }
    return g;
  }

  has(id: string) {
    return this.guests.has(id);
  }

  taskOf(id: string) {
    return this.guests.get(id)?.task ?? null;
  }

  countTask(task: Task) {
    let n = 0;
    for (const g of this.guests.values()) if (g.task === task) n++;
    return n;
  }

  inQueue(id: string) {
    const g = this.guests.get(id);
    return !!g && (g.task === 'queue' || g.task === 'photo');
  }

  get queueLength() {
    return this.queue.length + (this.photo ? 1 : 0);
  }

  get coupleMingling() {
    return this.coupleMode === 'mingle';
  }

  /** Số khách thật (không tính khách đệm) */
  get count() {
    let n = 0;
    for (const g of this.guests.values()) if (!g.npc) n++;
    return n;
  }

  /** Tên ngẫu nhiên vài khách thật đang có mặt (MC gọi tên) */
  someGuests(n: number) {
    return [...this.guests.values()].filter((g) => !g.npc && !g.leaving).sort(() => Math.random() - 0.5).slice(0, n).map((g) => g.id);
  }

  say(id: string, text: string, ms = 4500) {
    const g = this.guests.get(id);
    if (!g) return;
    g.bubble = { cv: bubble(text), until: Date.now() + ms };
  }

  private free(g: Guest) {
    g.seat = null;
    g.plan = [];
    g.started = false;
    g.task = null;
    g.carrying = false;
  }

  /** Bưng mâm: vào bếp lấy mâm, mang ra bàn còn trống */
  tray(id: string) {
    const g = this.guests.get(id);
    if (!g) return false;
    this.free(g);
    g.task = 'tray';
    const tb = [...TABLES].sort((a, b) => a.food - b.food || Math.hypot(a.x - KITCHEN.x, a.y - KITCHEN.y) - Math.hypot(b.x - KITCHEN.x, b.y - KITCHEN.y))[
      Math.floor(Math.random() * 4)
    ];
    const side = Math.random() < 0.5 ? -1 : 1;
    g.plan = [
      { k: 'walk', x: KITCHEN.x + rnd(-25, 30), y: KITCHEN.y + rnd(0, 25), run: true },
      { k: 'do', pose: 'stand', ms: 1300, face: 'back', end: () => (g.carrying = true) },
      { k: 'walk', x: tb.x + side * rnd(10, 40), y: tb.y + 42 },
      {
        k: 'do',
        pose: 'carry',
        ms: 700,
        face: 'back',
        end: () => {
          g.carrying = false;
          tb.food = Math.min(3, tb.food + 1);
          this.tableGlow.set(tb, 1);
          this.floatText(tb.x, tb.y - 40, '+1 mâm', '#c2410c');
          this.events.trayDone?.(g.id);
          g.task = null;
        },
      },
      { k: 'do', pose: 'wave', ms: 1200, face: 'front' },
    ];
    return true;
  }

  /** Cụng ly: tìm ghế trống (ưu tiên bàn có đồ ăn), ngồi nâng ly */
  dzo(id: string) {
    const g = this.guests.get(id);
    if (!g) return false;
    if (g.seat && g.task === 'idle-sit') {
      const seat = g.seat;
      g.plan = [];
      g.started = false;
      g.task = 'dzo';
      this.sitPlan(g, seat, true);
      return true;
    }
    const seat = this.freeSeat(true);
    if (!seat) return false;
    this.free(g);
    g.task = 'dzo';
    g.seat = seat;
    this.sitPlan(g, seat, true);
    return true;
  }

  private sitPlan(g: Guest, seat: { t: Table; i: number }, cheer: boolean, sitMs = rnd(12000, 22000)) {
    const o = SEAT_OFFSETS[seat.i];
    const p = { x: seat.t.x + o.dx, y: seat.t.y + o.dy };
    if (Math.hypot(g.x - p.x, g.y - p.y) > 4) g.plan.push({ k: 'walk', x: p.x, y: p.y });
    const face: Facing = o.back ? 'back' : 'front';
    if (cheer)
      g.plan.push({
        k: 'do',
        pose: 'cheer',
        ms: 5000,
        face,
        start: () => {
          this.tableGlow.set(seat.t, 1);
          this.floatText(p.x, p.y - 90, 'Dô!', '#be123c');
        },
      });
    g.plan.push({
      k: 'do',
      pose: 'sit',
      ms: sitMs,
      face,
      start: () => (g.task = cheer ? 'dzo' : 'idle-sit'),
      end: () => {
        g.seat = null;
        g.task = null;
      },
    });
  }

  private freeSeat(preferFood: boolean) {
    const taken = new Set<string>();
    for (const g of this.guests.values()) if (g.seat) taken.add(`${TABLES.indexOf(g.seat.t)}:${g.seat.i}`);
    const opts: { t: Table; i: number }[] = [];
    TABLES.forEach((t, ti) => SEAT_OFFSETS.forEach((_, i) => !taken.has(`${ti}:${i}`) && opts.push({ t, i })));
    if (!opts.length) return null;
    const withFood = opts.filter((o) => o.t.food > 0);
    return pickOne(preferFood && withFood.length ? withFood : opts);
  }

  /** Quẩy trên sàn nhảy */
  dance(id: string) {
    const g = this.guests.get(id);
    if (!g) return false;
    this.free(g);
    g.task = 'dance';
    g.plan = [
      { k: 'walk', x: rnd(DANCE.x0, DANCE.x1), y: rnd(DANCE.y0, DANCE.y1), run: true },
      {
        k: 'do',
        pose: 'dance',
        ms: rnd(9000, 13000),
        face: 'front',
        start: () => (this.partyUntil = Math.max(this.partyUntil, Date.now() + 10000)),
        end: () => (g.task = null),
      },
    ];
    return true;
  }

  /** Vào hàng chờ chụp hình */
  joinQueue(id: string) {
    const g = this.guests.get(id);
    if (!g || this.inQueue(id)) return false;
    this.free(g);
    g.task = 'queue';
    this.queue.push(g);
    this.restack();
    return true;
  }

  /** Game gọi khi MC đọc xong lời chúc: khách rời sân khấu, người sau lên */
  releasePhoto() {
    if (this.photo) this.photo.released = true;
  }

  private restack() {
    this.queue.forEach((g, i) => {
      const s = QUEUE_SLOTS[Math.min(i, QUEUE_SLOTS.length - 1)];
      if (g.slot !== i) {
        g.slot = i;
        g.plan = [{ k: 'walk', x: s.x + (i >= QUEUE_SLOTS.length ? rnd(-10, 10) : 0), y: s.y }, { k: 'hold', pose: 'stand', face: 'back', until: () => g.slot !== i }];
        g.started = false;
      }
    });
    this.events.queueChange?.(this.queueLength);
  }

  private servePhoto() {
    if (this.photo || !this.queue.length || !this.coupleAtStage()) return;
    const g = this.queue[0];
    const s = QUEUE_SLOTS[0];
    if (Math.hypot(g.x - s.x, g.y - s.y) > 6) return; // chờ đi tới đầu hàng
    this.queue.shift();
    g.slot = -1;
    g.task = 'photo';
    const ph = { g, released: false };
    this.photo = ph;
    g.plan = [
      { k: 'walk', x: STAGE_STEPS.x, y: STAGE_STEPS.y },
      { k: 'walk', x: PHOTO_SPOT.x, y: PHOTO_SPOT.y },
      {
        k: 'hold',
        pose: 'pose',
        face: 'front',
        start: () => {
          this.flash = 1;
          this.hearts(PHOTO_SPOT.x - 60, PHOTO_SPOT.y - 110, 10);
          this.events.photoStart?.(g.id);
        },
        until: () => ph.released,
      },
      { k: 'walk', x: STAGE_STEPS.x, y: STAGE_STEPS.y },
      { k: 'walk', x: rnd(WANDER.x0 + 300, WANDER.x1), y: rnd(1010, 1200) },
    ];
    g.started = false;
    this.restack();
  }

  // ---------- bắt hoa cưới ----------

  bouquetGather(ids: string[]) {
    this.bouquetState ??= { phase: 'gather', t: 0, from: { x: BRIDE.x, y: BRIDE.y - 60 } };
    for (const id of ids) {
      const g = this.guests.get(id);
      if (!g || this.inQueue(id)) continue;
      this.free(g);
      g.task = 'bouquet';
      g.plan = [
        { k: 'walk', x: rnd(BOUQUET.x0, BOUQUET.x1), y: rnd(BOUQUET.y0, BOUQUET.y1), run: true },
        { k: 'hold', pose: 'clap', face: 'back', until: () => !this.bouquetState },
      ];
    }
  }

  /** Cô dâu tung hoa về phía `winnerId`. Trả false nếu người đó không còn ở sân. */
  bouquetThrow(winnerId: string) {
    const w = this.guests.get(winnerId);
    if (!w || !this.bouquetState) {
      this.bouquetEnd();
      return false;
    }
    this.bouquetState.phase = 'fly';
    this.bouquetState.winner = w;
    this.bouquetState.t = 0;
    this.bouquetState.from = { x: this.bride.x, y: this.bride.y - 70 };
    w.plan = [{ k: 'hold', pose: 'catch', face: 'back', until: () => !this.bouquetState }];
    w.started = false;
    return true;
  }

  private bouquetEnd() {
    this.bouquetState = null;
    for (const g of this.guests.values())
      if (g.task === 'bouquet') {
        g.task = null;
        g.plan = [];
      }
  }

  // ---------- hiệu ứng ----------

  confetti(n: number) {
    const cols = ['#f49ab2', '#ffd166', '#9fd8c8', '#c6b3e6', '#ffffff', '#f7b79b'];
    for (let i = 0; i < n && this.particles.length < 800; i++) {
      const left = i % 2 === 0;
      this.particles.push({
        x: left ? 40 : W - 40,
        y: 900,
        vx: (left ? 1 : -1) * rnd(250, 650),
        vy: rnd(-1100, -600),
        rot: rnd(0, 6),
        vr: rnd(-8, 8),
        c: pickOne(cols),
        life: 0,
        max: rnd(3, 4.5),
        kind: 'confetti',
        size: rnd(7, 12),
      });
    }
  }

  /** Phong bì đỏ rơi khắp rạp */
  envelopes(n: number) {
    for (let i = 0; i < n && this.particles.length < 800; i++)
      this.particles.push({ x: rnd(40, W - 40), y: rnd(-300, 0), vx: 0, vy: rnd(160, 260), rot: rnd(-0.5, 0.5), vr: rnd(-1.5, 1.5), c: '#d62f45', life: 0, max: 7, kind: 'envelope', size: rnd(26, 36) });
  }

  /** Mưa kim tuyến vàng */
  goldRain(n: number) {
    for (let i = 0; i < n && this.particles.length < 900; i++)
      this.particles.push({ x: rnd(0, W), y: rnd(-500, 0), vx: rnd(-20, 20), vy: rnd(200, 360), rot: 0, vr: 0, c: pickOne(['#ffd166', '#f6c453', '#fff1b8']), life: 0, max: 6, kind: 'gold', size: rnd(3, 6) });
  }

  balloon(n: number) {
    const cols = ['#f49ab2', '#ffd166', '#9ec3ea', '#c6b3e6', '#ffffff', '#f7b79b'];
    for (let i = 0; i < n && this.balloons.length < 50; i++) this.balloons.push({ x: rnd(80, W - 80), y: H + rnd(0, 300), c: pickOne(cols), sway: rnd(0, 6) });
  }

  fireworks(n: number) {
    for (let k = 0; k < n; k++) {
      const x = rnd(150, W - 150);
      const y = rnd(80, 300);
      const c = pickOne(['#ffd166', '#f49ab2', '#9ec3ea', '#ffffff', '#b8f2a0']);
      setTimeout(() => {
        for (let i = 0; i < 60 && this.particles.length < 1000; i++) {
          const a = (i / 60) * Math.PI * 2;
          const sp = rnd(160, 320);
          this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: 0, vr: 0, c, life: 0, max: rnd(1.2, 1.8), kind: 'spark', size: rnd(3, 5) });
        }
      }, k * 350);
    }
  }

  hearts(x: number, y: number, n: number) {
    for (let i = 0; i < n && this.particles.length < 1000; i++)
      this.particles.push({ x: x + rnd(-40, 40), y, vx: rnd(-30, 30), vy: rnd(-120, -60), rot: 0, vr: 0, c: pickOne(['#f43f5e', '#f49ab2', '#fb7185']), life: 0, max: rnd(1.6, 2.6), kind: 'heart', size: rnd(14, 22) });
  }

  /** Xe hoa chạy ngang phía dưới */
  weddingCar() {
    this.carUntil = Date.now() + 6000;
  }

  /** Rồng phượng bay ngang trời */
  longPhuong() {
    this.flyUntil = Date.now() + 7000;
  }

  /** Cả rạp lên đèn, ai cũng nhảy tại chỗ (người đang ngồi thì nâng ly) */
  partyAll(ms: number) {
    this.danceAllUntil = Math.max(this.danceAllUntil, Date.now() + ms);
    this.partyUntil = Math.max(this.partyUntil, Date.now() + ms);
    TABLES.forEach((t) => this.tableGlow.set(t, 1));
  }

  /** Cô dâu chú rể nhảy trên sân khấu (quà to) */
  coupleDance(ms: number) {
    this.coupleDanceUntil = Math.max(this.coupleDanceUntil, Date.now() + ms);
    this.partyUntil = Math.max(this.partyUntil, Date.now() + ms);
  }

  floatText(x: number, y: number, text: string, c: string, size = 30) {
    this.particles.push({ x, y, vx: 0, vy: -45, rot: 0, vr: 0, c, life: 0, max: 1.8, kind: 'text', text, size });
  }

  reset() {
    this.guests.clear();
    this.queue = [];
    this.photo = null;
    this.bouquetState = null;
    this.particles = [];
    this.balloons = [];
    TABLES.forEach((t, i) => (t.food = i % 3 === 0 ? 1 : 0));
    this.fillExtras(true);
    this.events.queueChange?.(0);
  }

  // ---------- khách đệm ----------

  /** Thêm khách đệm cho rạp đông. `instant`: ngồi sẵn vào bàn (lúc mới mở) */
  private fillExtras(instant = false) {
    const want = Math.max(0, EXTRAS - this.count);
    let have = 0;
    for (const g of this.guests.values()) if (g.npc && !g.leaving) have++;
    for (let i = have; i < want; i++) {
      const id = `npc-${++this.extraSeq}`;
      const g = makeGuest(id, lookFor(id), GATE.x + rnd(-40, 40), GATE.y, true);
      this.guests.set(id, g);
      if (instant) {
        const seat = this.freeSeat(false);
        if (seat) {
          const o = SEAT_OFFSETS[seat.i];
          g.x = seat.t.x + o.dx;
          g.y = seat.t.y + o.dy;
          g.seat = seat;
          this.sitPlan(g, seat, false, rnd(5000, 40000));
          g.task = 'idle-sit';
        }
      }
    }
  }

  /** Người thật vào thì 1 khách đệm ra về */
  private trimExtras() {
    const npcs = [...this.guests.values()].filter((g) => g.npc && !g.leaving);
    if (npcs.length > Math.max(0, EXTRAS - this.count)) this.leave(npcs[0]);
  }

  // ---------- cập nhật ----------

  private evict() {
    // khách đệm về trước, rồi tới người lâu không tương tác và đang rảnh
    let old: Guest | null = null;
    for (const g of this.guests.values()) {
      if (g.leaving || g.task === 'queue' || g.task === 'photo') continue;
      if (g.npc) {
        old = g;
        break;
      }
      if (g.task && g.task !== 'idle-sit') continue;
      if (!old || g.lastActive < old.lastActive) old = g;
    }
    if (old) this.leave(old);
    else if (this.guests.size >= GUEST_CAP) {
      const first = [...this.guests.values()].find((g) => g.task !== 'photo' && g.task !== 'queue');
      if (first) this.guests.delete(first.id);
    }
  }

  private leave(g: Guest) {
    this.free(g);
    g.leaving = true;
    g.plan = [{ k: 'walk', x: GATE.x + rnd(-50, 50), y: H + 60 }];
  }

  private idle(g: Guest) {
    const r = Math.random();
    // khách đệm chủ yếu ngồi ăn cho rạp đông
    if (g.npc ? r < 0.6 : r >= 0.55 && r < 0.75) {
      const seat = this.freeSeat(true);
      if (seat) {
        g.seat = seat;
        this.sitPlan(g, seat, false, g.npc ? rnd(20000, 60000) : rnd(12000, 22000));
        g.task = 'idle-sit';
        g.started = false;
        return;
      }
    }
    if (r < 0.38) {
      let x = 0;
      let y = 0;
      for (let i = 0; i < 8; i++) {
        x = rnd(WANDER.x0, WANDER.x1);
        y = rnd(WANDER.y0, WANDER.y1);
        if (!insideTable(x, y)) break;
      }
      g.plan = [{ k: 'walk', x, y }, { k: 'do', pose: 'stand', ms: rnd(1500, 4000), face: Math.random() < 0.5 ? 'front' : 'back' }];
    } else if (r < 0.55) g.plan = [{ k: 'do', pose: 'clap', ms: rnd(1500, 3000), face: 'back' }];
    else if (r < 0.85) g.plan = [{ k: 'do', pose: 'wave', ms: 1800, face: 'front' }];
    else g.plan = [{ k: 'do', pose: 'stand', ms: rnd(2500, 5000), face: pickOne(['left', 'right', 'back'] as Facing[]) }];
    g.started = false;
  }

  /** Chạy 1 bước kế hoạch: đi tới điểm, hoặc làm động tác tới hết giờ / tới khi điều kiện đúng */
  private stepGuest(g: Guest, dt: number) {
    const st = g.plan[0];
    if (!g.started) {
      g.started = true;
      g.stepT = 0;
      if (st.k !== 'walk') st.start?.();
    }
    if (st.k === 'walk') {
      const dx = st.x - g.x;
      const dy = st.y - g.y;
      const d = Math.hypot(dx, dy);
      const sp = (st.run ? SPEED * 1.6 : SPEED) * scaleAt(g.y) * dt;
      g.pose = g.carrying ? 'carry' : 'walk';
      g.phase += dt * (st.run ? 14 : 10);
      if (Math.abs(dx) > Math.abs(dy) * 1.2) g.facing = dx > 0 ? 'right' : 'left';
      else g.facing = dy < 0 ? 'back' : 'front';
      if (d <= sp) {
        g.x = st.x;
        g.y = st.y;
        this.nextStep(g);
      } else {
        g.x += (dx / d) * sp;
        g.y += (dy / d) * sp;
      }
    } else {
      g.pose = st.pose;
      if (st.face) g.facing = st.face;
      g.stepT += dt * 1000;
      if (st.k === 'do' && g.stepT >= st.ms) {
        st.end?.();
        this.nextStep(g);
      } else if (st.k === 'hold' && st.until()) this.nextStep(g);
    }
  }

  private update(dt: number) {
    this.t += dt;
    const now = Date.now();
    const list = [...this.guests.values()];

    for (const g of list) {
      if (g.alpha < 1 && !g.leaving) g.alpha = Math.min(1, g.alpha + dt * 2);
      if (g.bubble && now > g.bubble.until) g.bubble = null;
      if (!g.plan.length) {
        if (g.leaving) {
          this.guests.delete(g.id);
          continue;
        }
        if (g.task === 'queue' || g.task === 'photo') continue;
        if (g.task === null || g.task === 'idle-sit') {
          g.task = null;
          this.idle(g);
        } else g.task = null;
        continue;
      }
      this.stepGuest(g, dt);
    }

    this.updateCouple(dt);
    for (const g of this.spectators) {
      g.stepT -= dt * 1000;
      if (g.stepT <= 0) {
        g.stepT = rnd(2000, 6000);
        g.pose = pickOne(['stand', 'clap', 'clap', 'wave', 'stand'] as Pose[]);
        g.facing = Math.random() < 0.8 ? 'back' : 'front';
      }
    }

    // ảnh xong: khách đi xuống thì mở lượt cho người sau
    if (this.photo && this.photo.released) {
      const g = this.photo.g;
      if (g.plan.length <= 2) {
        this.photo = null;
        g.task = null;
        this.events.queueChange?.(this.queueLength);
      }
    }
    this.servePhoto();

    // tách nhẹ những người đứng chồng lên nhau
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (a.seat || a.slot >= 0 || a.task === 'photo') continue;
      for (let j = 0; j < list.length; j++) {
        if (i === j) continue;
        const b = list[j];
        const dx = a.x - b.x;
        const dy = (a.y - b.y) * 1.6;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.01 && d2 < 900) {
          const d = Math.sqrt(d2);
          a.x += (dx / d) * 22 * dt;
          a.y += ((dy / d) * 22 * dt) / 1.6;
        }
      }
    }

    // bàn ăn dần hết mâm -> luôn có việc cho người bưng
    this.eatTimer += dt;
    if (this.eatTimer > 15) {
      this.eatTimer = 0;
      const eating = TABLES.filter((t) => t.food > 0);
      if (eating.length) pickOne(eating).food--;
      this.fillExtras();
    }
    for (const [tb, v] of this.tableGlow) {
      const nv = v - dt * 0.6;
      if (nv <= 0) this.tableGlow.delete(tb);
      else this.tableGlow.set(tb, nv);
    }

    // hiệu ứng
    this.flash = Math.max(0, this.flash - dt * 2.5);
    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.kind === 'confetti') {
        p.vy += 900 * dt;
        p.vx *= 1 - 1.6 * dt;
        p.vy = Math.min(p.vy, 140);
        p.x += Math.sin(p.life * 5 + p.rot) * 30 * dt;
      } else if (p.kind === 'envelope' || p.kind === 'gold') {
        p.x += Math.sin(p.life * 2 + p.size) * 40 * dt;
      } else if (p.kind === 'spark') {
        p.vy += 120 * dt;
        p.vx *= 1 - 1.4 * dt;
        p.vy *= 1 - 1.4 * dt;
      }
    }
    this.particles = this.particles.filter((p) => p.life < p.max && p.y < H + 60);
    for (const b of this.balloons) {
      b.y -= 120 * dt;
      b.x += Math.sin(this.t + b.sway) * 20 * dt;
    }
    this.balloons = this.balloons.filter((b) => b.y > -120);

    const bq = this.bouquetState;
    if (bq?.phase === 'fly') {
      bq.t += dt / 1.8;
      if (bq.t >= 1) {
        const w = bq.winner!;
        bq.phase = 'done';
        this.hearts(w.x, w.y - 100, 16);
        this.confetti(40);
        this.events.caught?.(w.id);
        setTimeout(() => this.bouquetState === bq && this.bouquetEnd(), 3000);
      }
    }
  }

  private nextStep(g: Guest) {
    g.plan.shift();
    g.started = false;
  }

  // ---------- vẽ ----------

  private draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = Date.now();
    const party = now < this.partyUntil;
    const danceAll = now < this.danceAllUntil;
    if (this.bg) ctx.drawImage(this.bg, 0, 0);
    else ctx.clearRect(0, 0, W, H);

    // rồng phượng bay ngang trời (quà rất to)
    if (now < this.flyUntil) {
      const k = 1 - (this.flyUntil - now) / 7000;
      drawDragon(ctx, -300 + k * (W + 600), 300 + Math.sin(k * 6) * 40, 1.1, 1, this.t);
      drawPhoenix(ctx, W + 300 - k * (W + 600), 200 + Math.cos(k * 6) * 40, 1.1, -1, this.t);
    }

    drawLights(ctx, this.t, party);
    drawSteam(ctx, this.t);
    drawDisco(ctx, this.t, party ? 1 : 0);

    // xếp theo chiều sâu: bàn, cô dâu chú rể, khách
    type D = { y: number; f: () => void };
    const ds: D[] = [];
    for (const tb of TABLES) ds.push({ y: tb.y, f: () => drawTable(ctx, tb, this.tableGlow.get(tb) ?? 0) });

    const bq = this.bouquetState;
    const onStage = this.coupleMode === 'stage';
    const coupleStill: Pose =
      now < this.coupleDanceUntil || danceAll ? 'dance' : this.photo && this.photo.g.pose === 'pose' ? 'pose' : Math.sin(this.t * 0.7) > 0.85 ? 'wave' : 'stand';
    const groomPose = onStage ? coupleStill : this.groom.pose;
    let bridePose = onStage ? coupleStill : this.bride.pose;
    let brideFace = this.bride.facing;
    if (bq && onStage) {
      brideFace = bq.phase !== 'done' ? 'back' : 'front';
      bridePose = bq.phase === 'fly' ? 'throw' : bq.phase === 'done' ? 'clap' : 'stand';
    }
    const coupleScale = (g: Guest) => scaleAt(g.y) * 1.25; // cô dâu chú rể to hơn khách cho nổi
    ds.push({ y: this.groom.y, f: () => this.drawPerson(ctx, this.groom, groomPose, this.groom.facing, coupleScale(this.groom), true) });
    ds.push({ y: this.bride.y, f: () => this.drawPerson(ctx, this.bride, bridePose, brideFace, coupleScale(this.bride), true) });

    for (const g of this.spectators) {
      const pose: Pose = danceAll || party ? 'dance' : g.pose;
      ds.push({ y: g.y, f: () => this.drawPerson(ctx, g, pose, g.facing, scaleAt(g.y), false) });
    }
    const crowd = this.count;
    for (const g of this.guests.values()) {
      let pose: Pose = g.pose;
      if (danceAll && g.task !== 'photo' && g.task !== 'tray') pose = g.seat ? 'cheer' : 'dance';
      const showName = !g.npc && (crowd < 70 || now - g.lastActive < 90_000 || g.task === 'photo' || g.task === 'queue');
      ds.push({ y: g.y, f: () => this.drawPerson(ctx, g, pose, g.facing, scaleAt(g.y), showName) });
    }
    ds.sort((a, b) => a.y - b.y);
    for (const d of ds) d.f();

    // bó hoa đang bay
    if (bq?.phase === 'fly' && bq.winner) {
      const k = bq.t;
      const tx = bq.winner.x;
      const ty = bq.winner.y - 90 * scaleAt(bq.winner.y);
      const x = bq.from.x + (tx - bq.from.x) * k;
      const y = bq.from.y + (ty - bq.from.y) * k - Math.sin(k * Math.PI) * 260;
      drawBouquet(ctx, x, y, 2.6);
    }

    drawGate(ctx);
    if (now < this.carUntil) drawWeddingCar(ctx, 1 - (this.carUntil - now) / 6000, this.t);
    if (danceAll) drawPartyWash(ctx, this.t);

    for (const b of this.balloons) {
      ctx.strokeStyle = 'rgba(120,100,100,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + 34);
      ctx.quadraticCurveTo(b.x + 8, b.y + 60, b.x, b.y + 90);
      ctx.stroke();
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, 26, 33, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(b.x - 9, b.y - 12, 6, 10, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const p of this.particles) {
      const fade = Math.min(1, (p.max - p.life) * 2);
      ctx.globalAlpha = fade;
      if (p.kind === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      } else if (p.kind === 'envelope') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
        ctx.fillStyle = '#f6c453';
        ctx.fillRect(-p.size * 0.18, -p.size * 0.18, p.size * 0.36, p.size * 0.36);
        ctx.restore();
      } else if (p.kind === 'spark' || p.kind === 'gold') {
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'heart') {
        heart(ctx, p.x, p.y, p.size, p.c);
      } else if (p.kind === 'text' && p.text) {
        ctx.font = `800 ${p.size}px "Be Vietnam Pro", sans-serif`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.c;
        ctx.fillText(p.text, p.x, p.y);
      }
    }
    ctx.globalAlpha = 1;

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flash * 0.85})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  private drawPerson(ctx: CanvasRenderingContext2D, g: Guest, pose: Pose, facing: Facing, s: number, showName: boolean) {
    ctx.globalAlpha = g.alpha;
    drawChibi(ctx, g.x, g.y, s, g.look, pose, this.t, facing, g.phase);
    // bảng tên cô dâu cao hơn chú rể một nấc để 2 bảng không đè nhau
    const top = g.y - 66 * s - (pose === 'carry' ? 16 * s : 0) - (g === this.bride ? 34 : 0);
    if (showName && g.nameCv) {
      const w = g.nameCv.width * 0.5;
      const h = g.nameCv.height * 0.5;
      ctx.drawImage(g.nameCv, g.x - w / 2, top - h, w, h);
    }
    if (g.bubble) {
      const bw = g.bubble.cv.width * 0.5;
      const bh = g.bubble.cv.height * 0.5;
      ctx.drawImage(g.bubble.cv, Math.max(4, Math.min(W - bw - 4, g.x - bw / 2)), top - bh - 40, bw, bh);
    }
    ctx.globalAlpha = 1;
  }
}

function heart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s, y - s * 0.3, x - s * 0.4, y - s, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.3, x, y + s * 0.35);
  ctx.fill();
}

// Bảng tên vẽ sẵn 1 lần (gấp đôi độ nét), có avatar tròn bên trái nếu có. Mỗi khung hình chỉ dán ảnh.
function nameTag(name: string, avatar: HTMLImageElement | null, color = '#7a2e43') {
  const short = name.length > 16 ? name.slice(0, 15) + '…' : name;
  const cv = document.createElement('canvas');
  const c = cv.getContext('2d')!;
  const font = '700 44px "Be Vietnam Pro", sans-serif';
  c.font = font;
  const av = avatar ? 60 : 0;
  const w = Math.ceil(c.measureText(short).width) + 40 + av;
  cv.width = w;
  cv.height = 68;
  c.font = font;
  roundRect(c, 2, 4, w - 4, 60, 30);
  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.fill();
  if (avatar) {
    c.save();
    c.beginPath();
    c.arc(34, 34, 26, 0, Math.PI * 2);
    c.clip();
    c.drawImage(avatar, 8, 8, 52, 52);
    c.restore();
  }
  c.fillStyle = color;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(short, av + (w - av) / 2, 36);
  return cv;
}

function bubble(text: string) {
  const t = text.length > 46 ? text.slice(0, 45) + '…' : text;
  const cv = document.createElement('canvas');
  const c = cv.getContext('2d')!;
  const font = '600 40px "Be Vietnam Pro", sans-serif';
  c.font = font;
  // ngắt tối đa 2 dòng, mỗi dòng ~520px
  const words = t.split(/\s+/);
  const lines: string[] = [''];
  for (const w of words) {
    const tryLine = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
    if (c.measureText(tryLine).width > 520 && lines[lines.length - 1]) {
      if (lines.length === 2) {
        lines[1] += '…';
        break;
      }
      lines.push(w);
    } else lines[lines.length - 1] = tryLine;
  }
  const w = Math.ceil(Math.max(...lines.map((l) => c.measureText(l).width))) + 48;
  const h = lines.length * 50 + 40;
  cv.width = w;
  cv.height = h + 16;
  c.font = font;
  roundRect(c, 2, 2, w - 4, h - 4, 26);
  c.fillStyle = '#ffffff';
  c.fill();
  c.strokeStyle = '#f2a7b8';
  c.lineWidth = 4;
  c.stroke();
  c.beginPath();
  c.moveTo(w / 2 - 14, h - 4);
  c.lineTo(w / 2, h + 14);
  c.lineTo(w / 2 + 14, h - 4);
  c.fillStyle = '#ffffff';
  c.fill();
  c.fillStyle = '#4a2a33';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  lines.forEach((l, i) => c.fillText(l, w / 2, 40 + i * 50));
  return cv;
}

export const world = new World();

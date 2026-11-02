// Luật chơi thuần (không React, không vẽ): đọc lệnh trong comment + tiến độ bưng mâm / chụp hình của từng người.
import { plain } from '../live/chatter';
import { containsBanned } from '../live/bannedWords';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export type Command = 'tray' | 'dzo' | 'dance' | 'photo' | 'bouquet' | null;

/** "Bưng Mâm!!" -> 'tray'. So không dấu, không hoa thường, bỏ khoảng trắng. */
export function parseCommand(comment: string): Command {
  const c = plain(comment).replace(/ /g, '');
  if (c.includes('bungmam') || c.includes('bemam')) return 'tray';
  if (c.includes('chuphinh') || c.includes('chupanh')) return 'photo';
  if (c.includes('bathoa')) return 'bouquet';
  if (c.includes('quay') && !/quay(lai|phim|video|clip)/.test(c)) return 'dance';
  // "dzô", "zô", "1 2 3 dzô" (không lấy "vô": người ta hay gõ "vô live")
  if (/ (dzo+|zo+) /.test(plain(comment)) || c.includes('123dzo')) return 'dzo';
  return null;
}

interface Progress {
  trays: number; // số mâm bưng từ lần chụp gần nhất
  photos: number; // đã chụp mấy lần
  lastPhotoAt: number;
}

export type PhotoCheck = { ok: true } | { ok: false; why: 'needTray'; left: number } | { ok: false; why: 'cooldown'; minutes: number };

/** Tiến độ từng người. Lần đầu cần `firstTrays` mâm, các lần sau `nextTrays` mâm, cách nhau `cooldownMs`. */
export class Guests {
  private p = new Map<string, Progress>();
  constructor(
    private firstTrays = 2,
    private nextTrays = 1,
    private cooldownMs = 5 * 60_000,
  ) {}

  private get(u: string) {
    let x = this.p.get(u);
    if (!x) this.p.set(u, (x = { trays: 0, photos: 0, lastPhotoAt: 0 }));
    return x;
  }

  need(u: string) {
    return this.get(u).photos ? this.nextTrays : this.firstTrays;
  }

  /** Bưng xong 1 mâm. Trả true nếu vừa đủ mâm để chụp hình. */
  addTray(u: string) {
    const x = this.get(u);
    x.trays++;
    return x.trays === this.need(u);
  }

  trays(u: string) {
    return this.get(u).trays;
  }

  canPhoto(u: string, now = Date.now()): PhotoCheck {
    const x = this.get(u);
    const left = this.need(u) - x.trays;
    if (left > 0) return { ok: false, why: 'needTray', left };
    const wait = x.lastPhotoAt + this.cooldownMs - now;
    if (x.photos && wait > 0) return { ok: false, why: 'cooldown', minutes: Math.ceil(wait / 60_000) };
    return { ok: true };
  }

  tookPhoto(u: string, now = Date.now()) {
    const x = this.get(u);
    x.trays = 0;
    x.photos++;
    x.lastPhotoAt = now;
  }

  reset() {
    this.p.clear();
  }

  save() {
    return JSON.stringify([...this.p].slice(-3000));
  }
  load(json: string | null) {
    try {
      if (json) this.p = new Map(JSON.parse(json));
    } catch {
      // dữ liệu hỏng thì bỏ
    }
  }
}

// Chữ hay gặp trong comment khen/chúc, gần như không phải tên người (so không dấu)
const NOT_NAME = new Set(
  'dep qua xinh ghe vui hay chuc mung troi live nha nhe oi the vay khong ko co chua roi di dzo zo cuoi tim yeu thich dang iu ok a ha hi hihi haha wow'.split(' '),
);

/** Comment trong lúc bầu -> tên ứng viên. "chú rể là anh Tuấn!!" -> "Tuấn". Không hợp lệ -> null */
export function pollCandidate(comment: string) {
  let t = comment
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  t = t.replace(/^(chú rể|chu re|cô dâu|co dau)\s*(là|la)?\s*/i, '').replace(/^(bầu|chọn|cho|bau|chon)\s+/i, '');
  t = t.replace(/^(anh|chị|chi|em|bạn|ban)\s+/i, '').trim();
  if (t.length < 2 || t.length > 20 || t.split(' ').length > 4 || containsBanned(t) || parseCommand(t)) return null;
  if (plain(t).trim().split(' ').some((w) => NOT_NAME.has(w))) return null;
  return t
    .split(' ')
    .map((w) => cap(w))
    .join(' ');
}


// ---------- Danh hiệu ----------

export type StatKey = 'coins' | 'zo' | 'tray' | 'dance' | 'chat';
export interface TitleConfig {
  leaders: { key: string; name: string }[];
  milestones: { key: string; min: number; name: string }[];
  minToLead: number;
  bouquet: string;
}
export interface Title {
  text: string;
  gold: boolean;
}

/** Đếm việc từng người làm, ai dẫn đầu mỗi việc thì lên chức. Hàm thuần, không vẽ. */
export class Titles {
  private stats = new Map<string, Record<StatKey, number>>();
  private leaders = new Map<string, { id: string; n: number }>();
  private bouquet = new Set<string>();
  constructor(private cfg: TitleConfig) {}

  /** Cộng điểm. `changed`: những người cần vẽ lại danh hiệu; `promoted`: ai vừa lên chức gì */
  add(id: string, key: StatKey, n = 1) {
    let st = this.stats.get(id);
    if (!st) this.stats.set(id, (st = { coins: 0, zo: 0, tray: 0, dance: 0, chat: 0 }));
    st[key] += n;
    const changed = [id];
    let promoted: { id: string; title: string } | null = null;
    const lead = this.leaders.get(key);
    if (lead?.id === id) lead.n = st[key];
    else if (st[key] >= this.cfg.minToLead && (!lead || st[key] > lead.n)) {
      if (lead) changed.push(lead.id);
      this.leaders.set(key, { id, n: st[key] });
      const name = this.cfg.leaders.find((l) => l.key === key)?.name;
      if (name) promoted = { id, title: name };
    }
    return { changed, promoted };
  }

  caught(id: string) {
    this.bouquet.add(id);
  }

  titleOf(id: string): Title | null {
    for (const l of this.cfg.leaders) if (this.leaders.get(l.key)?.id === id) return { text: l.name, gold: true };
    if (this.bouquet.has(id)) return { text: this.cfg.bouquet, gold: false };
    const st = this.stats.get(id);
    if (st) for (const m of this.cfg.milestones) if (st[m.key as StatKey] >= m.min) return { text: m.name, gold: false };
    return null;
  }

  reset() {
    this.stats.clear();
    this.leaders.clear();
    this.bouquet.clear();
  }
}

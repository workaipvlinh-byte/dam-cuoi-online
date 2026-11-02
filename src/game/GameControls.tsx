import { useEffect, useState, type ReactNode } from 'react';
import { emitTest, sendControl } from '../live/page';
import { GAME } from './config';
import { QUE } from './loiChuc';

// Nút giả lập riêng của game Đám Cưới (trang điều khiển). Dùng 40 khách cố định để bưng mâm rồi chụp hình được.
const NAMES = ['Lan Anh', 'Minh Tuấn', 'Bé Na 🌸', 'Hoàng Long', 'Thu Trang', 'Quốc Bảo', 'duyanh99', 'Ngọc Hân', 'Gia Huy', 'Khánh Linh', 'Mai Phương', 'Tuấn Kiệt', 'Hải Yến', 'Đức Anh', 'Phương Thảo', 'Bảo Ngọc', 'Trọng Nhân', 'Thanh Hà', 'Kim Chi', 'Văn Toàn'];
const POOL = Array.from({ length: 40 }, (_, i) => {
  const nickname = NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${i}` : '');
  return { nickname, username: `khach${i}` };
});
const CHATS = ['Chúc mừng hạnh phúc!', 'Cô dâu đẹp quá', 'Trăm năm hạnh phúc nha', 'mong năm sau tới lượt mình lấy chồng', 'Đám cưới vui quá trời', 'Chú rể đẹp trai ghê'];
const anyone = () => POOL[Math.floor(Math.random() * POOL.length)];
const chat = (who: (typeof POOL)[number], comment: string) => emitTest('chat', { ...who, comment });
const gift = (diamondCount: number, giftName: string) => emitTest('gift', { ...anyone(), giftName, giftId: 1, diamondCount, repeatCount: 1 });
const many = (n: number, f: (i: number) => void) => {
  for (let i = 0; i < n; i++) setTimeout(() => f(i), i * 200);
};

export function GameControls() {
  const [auto, setAuto] = useState(false);
  const [musicOn, setMusicOn] = useState(true); // trang stage mở lên là nhạc bật
  const [musicVol, setMusicVol] = useState(() => {
    try {
      return Number(localStorage.getItem('damcuoi-music-vol')) || 100;
    } catch {
      return 100;
    }
  });
  const changeVol = (v: number) => {
    setMusicVol(v);
    try {
      localStorage.setItem('damcuoi-music-vol', String(v));
    } catch {
      // bỏ qua
    }
    void sendControl('custom', `musicVol:${v}`);
  };

  // Live giả: mỗi 0,8 giây 1 khách làm 1 việc; ai bưng đủ 2 mâm thì đi chụp hình
  useEffect(() => {
    if (!auto) return;
    const trays = new Map<string, number>();
    const t = setInterval(() => {
      const w = anyone();
      const n = trays.get(w.username) ?? 0;
      const r = Math.random();
      if (n >= 2 && r < 0.5) {
        chat(w, 'chụp hình');
        trays.set(w.username, 0);
      } else if (r < 0.4) {
        chat(w, 'bưng mâm');
        trays.set(w.username, n + 1);
      } else if (r < 0.55) chat(w, 'zô');
      else if (r < 0.65) chat(w, 'quẩy');
      else if (r < 0.95) chat(w, CHATS[Math.floor(Math.random() * CHATS.length)]);
      else gift(1, 'Hoa hồng');
    }, 800);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <section className="space-y-2 rounded-2xl bg-slate-900 p-3 ring-1 ring-slate-800">
      <Row label="Điều khiển">
        <B onClick={() => void sendControl('custom', 'poll')}>💒 Bầu chú rể + cô dâu</B>
        <B onClick={() => void sendControl('custom', 'ceremony')}>🎤 Khai mạc lễ cưới</B>
        <B onClick={() => void sendControl('custom', 'bouquet')}>💐 Tung hoa ngay</B>
        <B onClick={() => void sendControl('custom', 'clearCouple')}>✖ Xoá tên cô dâu chú rể</B>
        <B
          on={musicOn}
          onClick={() => {
            const next = !musicOn;
            setMusicOn(next);
            void sendControl('custom', next ? 'music:on' : 'music:off');
          }}
        >
          {musicOn ? '🎵 Nhạc nền: BẬT' : '🔇 Nhạc nền: TẮT'}
        </B>
        <label className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs">
          Âm lượng nhạc
          <input type="range" min={0} max={200} step={10} value={musicVol} onChange={(e) => changeVol(Number(e.target.value))} className="w-24 accent-amber-500" />
          <b className="w-9 text-right">{musicVol}%</b>
        </label>
        <B onClick={() => testVoice()}>🔊 Thử giọng MC (trang này)</B>
      </Row>
      <Row label="Thử khách">
        <B onClick={() => setAuto((a) => !a)} on={auto}>
          {auto ? '⏸ Dừng live giả' : '▶ Live giả 40 khách'}
        </B>
        <B onClick={() => many(5, () => chat(anyone(), CHATS[Math.floor(Math.random() * CHATS.length)]))}>💬 5 chúc mừng</B>
        <B onClick={() => chat(anyone(), 'bưng mâm')}>🍲 Bưng mâm</B>
        <B
          onClick={() => {
            const w = anyone();
            chat(w, 'bưng mâm');
            setTimeout(() => chat(w, 'bưng mâm'), 3000);
            setTimeout(() => chat(w, 'chụp hình'), 36000);
          }}
        >
          📸 Bưng 2 mâm rồi chụp
        </B>
        <B onClick={() => many(10, () => chat(anyone(), 'zô'))}>🥂 10 zô</B>
        <B onClick={() => many(8, () => chat(anyone(), 'quẩy'))}>💃 8 quẩy</B>
        <B onClick={() => many(6, () => chat(anyone(), 'bắt hoa'))}>💐 6 bắt hoa</B>
        <B
          onClick={() => {
            const votes = ['Tuấn', 'Tuấn', 'anh Long', 'Tuấn', 'Long'];
            votes.forEach((v, i) => setTimeout(() => chat(POOL[i + 5], v), i * 700));
          }}
        >
          🗳 5 phiếu bầu giả
        </B>
      </Row>
      <Row label="Quà / tim">
        <B onClick={() => gift(1, 'Hoa hồng')}>🌹 1</B>
        <B onClick={() => gift(10, 'Kẹo')}>🎈 10</B>
        <B onClick={() => gift(30, 'Bánh donut')}>🧧 30</B>
        <B onClick={() => gift(99, 'Bắn tim')}>🎆 99</B>
        <B onClick={() => gift(299, 'Xe')}>🚗 299</B>
        <B onClick={() => gift(1000, 'Thiên hà')}>🐉 1000</B>
        <B onClick={() => gift(5000, 'Sư tử')}>💍 5000</B>
        <B onClick={() => emitTest('like', { ...anyone(), likeCount: 300 })}>❤️ 300 tim</B>
      </Row>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-20 flex-none text-xs font-semibold text-slate-400">{label}</span>
      {children}
    </div>
  );
}

// Nghe thử ngay ở trang điều khiển, không gửi sang stage (không thành 2 giọng trên live)
const SAMPLES = [
  GAME.boostLine,
  GAME.giftTiers[1].lines[0]('Hoàng Long'),
  GAME.giftTiers[4].lines[1]('Minh Tuấn'),
  GAME.photo('Ngọc Hân', QUE[1].loi, 'cô dâu Lan và chú rể Tuấn'),
  GAME.greetings[0]('bạn Lan Anh, bạn Minh Tuấn và bạn Thu Trang'),
];
let sample = 0;
async function testVoice() {
  // cùng cách đọc với stage: "|" tách đoạn, "^" hô to hơn
  for (const raw of SAMPLES[sample++ % SAMPLES.length].split('|')) {
    const t = raw.trim();
    const a = new Audio(`/api/tts?rate=1.1${t.startsWith('^') ? '&hype=1' : ''}&text=${encodeURIComponent(t.replace(/^\^+/, ''))}`);
    await new Promise<void>((r) => {
      a.onended = a.onerror = () => r();
      a.play().catch(() => r());
    });
  }
}

function B({ children, onClick, on }: { children: ReactNode; onClick: () => void; on?: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${on ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'}`}>
      {children}
    </button>
  );
}

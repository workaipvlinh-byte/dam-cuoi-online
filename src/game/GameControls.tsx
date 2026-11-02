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
      } else if (r < 0.55) chat(w, 'dzô');
      else if (r < 0.65) chat(w, 'quẩy');
      else if (r < 0.95) chat(w, CHATS[Math.floor(Math.random() * CHATS.length)]);
      else gift(1, 'Hoa hồng');
    }, 800);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <section className="rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800">
      <h2 className="mb-3 font-semibold">Giả lập Đám Cưới</h2>
      <div className="flex flex-wrap gap-2">
        <B onClick={() => setAuto((a) => !a)} on={auto}>
          {auto ? '⏸ Dừng live giả' : '▶ Live giả (40 khách tự chơi)'}
        </B>
        <B onClick={() => many(5, () => chat(anyone(), CHATS[Math.floor(Math.random() * CHATS.length)]))}>💬 5 khách chúc mừng</B>
        <B onClick={() => chat(anyone(), 'bưng mâm')}>🍲 1 người bưng mâm</B>
        <B
          onClick={() => {
            const w = anyone();
            chat(w, 'bưng mâm');
            setTimeout(() => chat(w, 'bưng mâm'), 16000);
            setTimeout(() => chat(w, 'chụp hình'), 32000);
          }}
        >
          📸 1 người bưng 2 mâm rồi chụp (~35s)
        </B>
        <B onClick={() => chat(anyone(), 'chụp hình')}>📸 Gõ chụp hình (chưa bưng)</B>
        <B onClick={() => many(10, () => chat(anyone(), 'dzô'))}>🥂 10 người dzô</B>
        <B onClick={() => many(8, () => chat(anyone(), 'quẩy'))}>💃 8 người quẩy</B>
        <B
          onClick={() => {
            void sendControl('custom', 'bouquet');
            many(6, () => setTimeout(() => chat(anyone(), 'bắt hoa'), 1500));
          }}
        >
          💐 Tung hoa ngay + 6 người bắt
        </B>
        <B onClick={() => gift(1, 'Hoa hồng')}>🌹 1 xu</B>
        <B onClick={() => gift(10, 'Kẹo')}>🎈 10 xu</B>
        <B onClick={() => gift(30, 'Bánh donut')}>🧧 30 xu (phong bì)</B>
        <B onClick={() => gift(99, 'Bắn tim')}>🎆 99 xu (pháo hoa)</B>
        <B onClick={() => gift(299, 'Xe')}>🚗 299 xu (xe hoa)</B>
        <B onClick={() => gift(1000, 'Thiên hà')}>🐉 1000 xu (long phượng)</B>
        <B onClick={() => gift(5000, 'Sư tử')}>💍 5000 xu (đại gia)</B>
        <B onClick={() => emitTest('like', { ...anyone(), likeCount: 300 })}>❤️ 300 tim (cả rạp quẩy)</B>
        <B
          onClick={() => {
            void sendControl('custom', 'poll');
            const votes = ['Tuấn', 'Tuấn', 'anh Long', 'Tuấn', 'Long'];
            votes.forEach((v, i) => setTimeout(() => chat(POOL[i + 5], v), 4000 + i * 900));
            ['Lan', 'chị Lan', 'Hà', 'Lan'].forEach((v, i) => setTimeout(() => chat(POOL[i + 12], v), 48_000 + i * 900));
          }}
        >
          💒 Bầu chú rể + cô dâu (có phiếu giả)
        </B>
        <B onClick={() => void sendControl('custom', 'ceremony')}>🎤 Khai mạc lễ cưới (MC đọc lời dẫn)</B>
        <B onClick={() => void sendControl('custom', 'clearCouple')}>✖ Xoá tên cô dâu chú rể</B>
        <B onClick={() => void sendControl('custom', 'music')}>🎵 Bật/tắt nhạc nền (trên stage)</B>
        <B onClick={() => testVoice()}>🔊 Thử giọng MC (chỉ trang này nghe)</B>
      </div>
      <p className="mt-2 text-xs text-slate-500">Bưng 2 mâm được chụp lần đầu, sau đó 1 mâm. Tung hoa tự chạy mỗi 10 phút. Số liệu ở src/game/config.ts.</p>
    </section>
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
  // cùng cách đọc với stage: "|" tách đoạn, "^" hô, "^^" hô kéo dài
  for (const raw of SAMPLES[sample++ % SAMPLES.length].split('|')) {
    const t = raw.trim();
    const a = new Audio(`/api/tts?rate=1.1${t.startsWith('^') ? '&hype=1' : ''}&text=${encodeURIComponent(t.replace(/^\^+/, ''))}`);
    if (t.startsWith('^^')) a.playbackRate = 0.6;
    await new Promise<void>((r) => {
      a.onended = a.onerror = () => r();
      a.play().catch(() => r());
    });
  }
}

function B({ children, onClick, on }: { children: ReactNode; onClick: () => void; on?: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-lg px-3 py-2 text-sm font-medium ${on ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'}`}>
      {children}
    </button>
  );
}

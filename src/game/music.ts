// Nhạc nền đám cưới, chỉ phát trên trang stage. MC nói thì nhạc tự nhỏ xuống (ducking) để giọng luôn to hơn nhạc.
import { IS_STAGE } from '../live/page';
import { voice } from '../live/voice';

const SRC = '/assets/audio/nhac-nen-dam-cuoi.m4a';
// File nhạc mix rất to (~-9 dB). MC nói gần như liên tục nên mức "đang nói" phải đủ nghe, không thì như tắt nhạc.
const LOUD = 0.55; // lúc MC im
const DUCK = 0.25; // lúc MC đang nói

const LEVEL_KEY = 'damcuoi-music-level';

class Music {
  private el: HTMLAudioElement | null = null;
  on = true;
  // hệ số âm lượng chỉnh ở trang điều khiển: 1 = mặc định, 0.5 = nửa, 2 = gấp đôi (tối đa tới 100% âm lượng)
  level = readLevel();

  start() {
    if (!IS_STAGE || this.el) return;
    const el = new Audio(SRC);
    el.loop = true;
    el.volume = 0;
    this.el = el;
    // bắt đầu ở chỗ ngẫu nhiên để mỗi buổi live nghe khác nhau
    el.addEventListener('loadedmetadata', () => (el.currentTime = Math.random() * Math.max(0, el.duration - 600)), { once: true });
    const tryPlay = () => this.on && el.paused && el.play().catch(() => {});
    tryPlay();
    // trình duyệt chặn tự phát thì thử lại định kỳ / khi có tương tác
    setInterval(tryPlay, 3000);
    window.addEventListener('pointerdown', tryPlay);
    // âm lượng trượt mượt về mức đích
    setInterval(() => {
      const target = !this.on ? 0 : Math.min(1, (voice.busy ? DUCK : LOUD) * this.level);
      el.volume = Math.max(0, Math.min(1, el.volume + (target - el.volume) * 0.35));
      if (!this.on && el.volume < 0.01) el.pause();
    }, 100);
  }

  setLevel(level: number) {
    this.level = Math.max(0, Math.min(2, level));
    try {
      localStorage.setItem(LEVEL_KEY, String(this.level));
    } catch {
      // bỏ qua
    }
  }

  set(on: boolean) {
    this.on = on;
    if (on) this.el?.play().catch(() => {});
  }

  /** Cho trang điều khiển hỏi: nhạc có đang phát thật không */
  get playing() {
    return !!this.el && !this.el.paused && this.el.volume > 0.01;
  }
}

function readLevel() {
  try {
    const v = Number(localStorage.getItem(LEVEL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 1;
  } catch {
    return 1;
  }
}

export const music = new Music();
// để kiểm tra trong DevTools: window.dcMusic.playing
(window as unknown as { dcMusic: Music }).dcMusic = music;

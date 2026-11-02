// Nhạc nền đám cưới, chỉ phát trên trang stage. MC nói thì nhạc tự nhỏ xuống (ducking) để giọng luôn to hơn nhạc.
import { IS_STAGE } from '../live/page';
import { voice } from '../live/voice';

const SRC = '/assets/audio/nhac-nen-dam-cuoi.m4a';
// File nhạc mix rất to (~-9 dB), giọng TTS nhỏ hơn nhiều: giữ nhạc ở mức này mới nghe rõ MC
const LOUD = 0.42; // lúc MC im
const DUCK = 0.12; // lúc MC đang nói

class Music {
  private el: HTMLAudioElement | null = null;
  on = true;

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
      const target = !this.on ? 0 : voice.busy ? DUCK : LOUD;
      el.volume = Math.max(0, Math.min(1, el.volume + (target - el.volume) * 0.35));
      if (!this.on && el.volume < 0.01) el.pause();
    }, 100);
  }

  toggle() {
    this.on = !this.on;
    if (this.on) this.el?.play().catch(() => {});
  }
}

export const music = new Music();

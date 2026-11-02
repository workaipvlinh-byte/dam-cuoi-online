import { IS_STAGE } from './page';
import { containsBanned } from './bannedWords';

/**
 * Hàng đợi giọng đọc. Chỉ phát trên trang stage.
 *   voice.say('Chào bạn A')            -> xếp cuối hàng
 *   voice.say('Cảm ơn quà', true)      -> ưu tiên, chen lên đầu (dùng cho quà)
 *   voice.say('Một, hai, ba | ^^Dô!')  -> "|" tách đoạn; "^" hô cao giọng, "^^" hô cao + kéo dài
 * Câu nào chờ quá lâu (mặc định 60 giây) thì bỏ, để không đọc chuyện đã cũ.
 */
interface Line {
  text: string;
  at: number;
  done?: () => void;
}

const MAX_WAIT_MS = 60_000;
const MAX_QUEUE = 30;

class Voice {
  private normal: Line[] = [];
  private priority: Line[] = [];
  private playing = false;
  private current: HTMLAudioElement | null = null;
  private lastSpokeAt = Date.now();
  rate = 1.1; // MC nói nhanh, tươi hơn giọng đọc chùa
  volume = 1;
  enabled = IS_STAGE;

  /** `done`: gọi khi câu đọc xong, bị bỏ, hoặc trang này không phát tiếng */
  say(text: string, priority = false, done?: () => void) {
    if (!this.enabled || !text.trim()) {
      if (done) setTimeout(done, 0);
      return;
    }
    const q = priority ? this.priority : this.normal;
    q.push({ text: text.trim(), at: Date.now(), done });
    if (q.length > MAX_QUEUE) q.shift()?.done?.();
    void this.next();
  }

  stop() {
    for (const l of [...this.normal, ...this.priority]) l.done?.();
    this.normal = [];
    this.priority = [];
    this.current?.pause();
    this.current = null;
    this.playing = false;
  }

  get busy() {
    return this.playing || this.normal.length + this.priority.length > 0;
  }

  /** Số câu thường đang chờ (không tính câu đang đọc) */
  get waiting() {
    return this.normal.length;
  }

  /** Số câu ưu tiên (quà) đang chờ */
  get waitingPriority() {
    return this.priority.length;
  }

  /** Giọng đã im bao lâu (0 khi đang đọc hoặc còn câu chờ) */
  quietForMs(now = Date.now()) {
    return this.busy ? 0 : now - this.lastSpokeAt;
  }

  private async next() {
    if (this.playing) return;
    const now = Date.now();
    let line: Line | undefined;
    while ((line = this.priority.shift() ?? this.normal.shift())) {
      if (now - line.at < MAX_WAIT_MS) break;
      line.done?.();
    }
    if (!line) return;
    this.playing = true;
    try {
      // "Một, hai, ba | ^^Dô!" -> đọc thường rồi hô. "^" = hô cao giọng, "^^" = hô cao + kéo dài
      for (const raw of line.text.split('|')) {
        const stretch = raw.trim().startsWith('^^');
        const hype = raw.trim().startsWith('^');
        const text = raw.trim().replace(/^\^+/, '');
        if (!text) continue;
        const audio = new Audio(`/api/tts?rate=${this.rate}${hype ? '&hype=1' : ''}&text=${encodeURIComponent(text)}`);
        audio.volume = this.volume;
        if (stretch) audio.playbackRate = 0.6; // trình duyệt giữ nguyên độ cao, chỉ kéo dài: "Dôôô"
        this.current = audio;
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
        });
        if (this.current !== audio) break; // stop() giữa chừng
      }
    } finally {
      line.done?.();
      this.current = null;
      this.playing = false;
      this.lastSpokeAt = Date.now();
      void this.next();
    }
  }
}

export const voice = new Voice();

export { speakableName } from './names';

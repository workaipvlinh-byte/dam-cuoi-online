import { useEffect, useRef, useState } from 'react';
import { useLiveEvents } from '../live/useLiveEvents';
import type { GiftEvent, LiveStatus } from '../live/types';
import { voice, speakableName } from '../live/voice';
import { containsBanned, maskBanned } from '../live/bannedWords';
import { NameBatcher } from '../live/scoreboard';
import { detectWish, GiftThanker, makePicker, OncePerPerson, RecentPeople, WishLimiter } from '../live/chatter';
import { IS_STAGE } from '../live/page';
import { GAME } from './config';
import { parseCommand, Guests } from './rules';
import { QUE, type Que } from './loiChuc';
import { world } from './world/world';

const pick = makePicker();
const SAVE_KEY = 'damcuoi-progress';

export interface PhotoCard {
  key: number;
  name: string;
  avatar: string;
  chuc: Que;
}

/** Mỗi việc chỉ cho phép 1 lần / `ms` (theo người, hoặc cả phòng nếu key cố định) */
function limiter(ms: number) {
  const last = new Map<string, number>();
  return (key: string, now = Date.now()) => {
    if (now - (last.get(key) ?? -Infinity) < ms) return false;
    last.set(key, now);
    return true;
  };
}

export function useGame() {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [channelName, setChannelName] = useState(GAME.defaultChannelName);
  const [queueLen, setQueueLen] = useState(0);
  const [card, setCard] = useState<PhotoCard | null>(null);
  const [lastGift, setLastGift] = useState<(GiftEvent & { coins: number }) | null>(null);
  const [likeProgress, setLikeProgress] = useState(0);
  const [bouquetUntil, setBouquetUntil] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const likeBase = useRef<number | null>(null);
  const avatars = useRef(new Map<string, string>());
  const names = useRef(new Map<string, string>());

  const [s] = useState(() => {
    const guests = new Guests(GAME.firstTrays, GAME.nextTrays, GAME.photoCooldownMs);
    if (IS_STAGE) guests.load(safeGet(SAVE_KEY));
    return {
      guests,
      greeter: new NameBatcher(
        GAME.greetEveryMs,
        GAME.namesPerGreeting,
        (n) => voice.say(pick(GAME.greetings)!(joinNames(n))),
        () => voice.waiting >= 2,
      ),
      gifts: new GiftThanker(GAME.giftThanksCooldownMs, GAME.giftBig),
      follows: new OncePerPerson(),
      wishes: new WishLimiter(GAME.wishPerUserMs, GAME.wishGlobalMs),
      recent: new RecentPeople(),
      nudgeUser: limiter(2 * 60_000),
      nudgeAll: limiter(20_000),
      party: limiter(3 * 60_000),
      bouquet: null as null | Set<string>,
      usedChuc: [] as number[],
      cardKey: 0,
    };
  });

  const safeName = (nickname: string, username: string) => (containsBanned(nickname) ? username : nickname);
  const spoken = (id: string) => speakableName(names.current.get(id) ?? id);

  // Lời chúc khi chụp hình: rút ngẫu nhiên, không lặp lại 30 câu gần nhất
  const nextChuc = () => {
    const pool = QUE.filter((q) => !s.usedChuc.includes(q.so));
    const q = pool[Math.floor(Math.random() * pool.length)];
    s.usedChuc.push(q.so);
    if (s.usedChuc.length > 30) s.usedChuc.shift();
    return q;
  };

  // Thế giới (canvas) báo ngược về: bưng mâm xong, tới lượt chụp, bắt được hoa
  useEffect(() => {
    world.events = {
      queueChange: setQueueLen,
      trayDone: (id) => {
        if (!s.guests.addTray(id)) return;
        world.say(id, GAME.bubble.unlocked, 6000);
        if (s.nudgeAll('unlock')) voice.say(GAME.unlocked(spoken(id)));
      },
      photoStart: (id) => {
        s.guests.tookPhoto(id);
        const chuc = nextChuc();
        const key = ++s.cardKey;
        setCard({ key, name: names.current.get(id) ?? id, avatar: avatars.current.get(id) ?? '', chuc });
        const shownAt = Date.now();
        let released = false;
        const release = () => {
          if (released) return;
          released = true;
          world.releasePhoto();
          setCard((c) => (c?.key === key ? null : c));
        };
        voice.say(GAME.photo(spoken(id), chuc.loi), false, () => setTimeout(release, Math.max(0, GAME.photoMinMs - (Date.now() - shownAt))));
        setTimeout(release, GAME.photoMaxMs);
      },
      caught: (id) => voice.say(GAME.bouquetCaught(spoken(id)), true),
    };
    return () => {
      world.events = {};
    };
  }, []);

  const startBouquet = () => {
    if (s.bouquet) return;
    s.bouquet = new Set();
    setBouquetUntil(Date.now() + GAME.bouquetWindowMs);
    voice.say(GAME.bouquetCall, true);
    setTimeout(() => {
      const ids = [...(s.bouquet ?? [])].filter((id) => world.has(id));
      s.bouquet = null;
      setBouquetUntil(0);
      if (!ids.length) return voice.say(GAME.bouquetNobody);
      voice.say(GAME.bouquetThrow, true);
      setTimeout(() => world.bouquetThrow(ids[Math.floor(Math.random() * ids.length)]), 2500);
    }, GAME.bouquetWindowMs);
  };

  useLiveEvents({
    onStatus: setStatus,

    onChat: (e) => {
      const id = e.username;
      const name = safeName(e.nickname, id);
      names.current.set(id, name);
      if (e.avatar) avatars.current.set(id, e.avatar);
      s.recent.note(id, speakableName(name));
      world.ensure(id, name);
      setGuestCount(world.count);

      const cmd = parseCommand(e.comment);
      const B = GAME.bubble;
      if (!cmd) {
        // comment thường: hiện bong bóng (đã che từ bậy), cầu chúc thì MC chúc lại. Không đọc nguyên văn comment.
        world.say(id, maskBanned(e.comment));
        const topic = containsBanned(e.comment) ? null : detectWish(e.comment);
        const reply = topic && pick(GAME.wishReplies[topic] ?? []);
        if (reply && s.wishes.allow(id)) voice.say(reply(speakableName(name)));
        return;
      }
      if (world.inQueue(id) && cmd !== 'bouquet') return world.say(id, B.inQueue);

      switch (cmd) {
        case 'tray':
          if (world.taskOf(id) === 'tray') return;
          world.tray(id);
          world.say(id, B.tray, 2500);
          return;
        case 'dzo':
          if (!world.dzo(id)) world.dance(id); // hết ghế thì ra quẩy
          return;
        case 'dance':
          world.dance(id);
          if (world.countTask('dance') >= 5 && s.party('all')) voice.say(GAME.partyLine);
          return;
        case 'photo': {
          const c = s.guests.canPhoto(id);
          if (!c.ok && c.why === 'needTray') {
            world.say(id, B.needTray(c.left), 5000);
            if (s.nudgeUser(id) && s.nudgeAll('need')) voice.say(GAME.needTray(speakableName(name), c.left));
            return;
          }
          if (!c.ok) return world.say(id, B.cooldown(c.minutes));
          if (world.queueLength >= GAME.maxQueue) {
            world.say(id, B.full);
            if (s.nudgeAll('full')) voice.say(GAME.queueFull);
            return;
          }
          world.joinQueue(id);
          world.say(id, B.queued, 3000);
          return;
        }
        case 'bouquet':
          if (!s.bouquet || world.inQueue(id)) return;
          s.bouquet.add(id);
          world.bouquetGather([id]);
          world.say(id, B.bouquet, 3000);
          return;
      }
    },

    onGift: (e) => {
      const id = e.username;
      const name = safeName(e.nickname, id);
      names.current.set(id, name);
      if (e.avatar) avatars.current.set(id, e.avatar);
      s.recent.note(id, speakableName(name));
      world.ensure(id, name);
      setGuestCount(world.count);
      const coins = e.diamondCount * e.repeatCount;
      setLastGift({ ...e, nickname: name, coins });

      // Hiệu ứng chung cho cả rạp, không đổi luật chơi
      if (coins >= GAME.giftHuge) {
        world.fireworks(10);
        world.coupleDance(15000);
        world.balloon(20);
        world.confetti(160);
      } else if (coins >= GAME.giftBig) {
        world.fireworks(4);
        world.coupleDance(8000);
        world.balloon(10);
        world.confetti(100);
      } else if (coins >= GAME.giftMid) {
        world.balloon(6);
        world.confetti(70);
      } else world.confetti(36);

      // MC cảm ơn quà trước mọi câu khác
      if (s.gifts.shouldThank(id, coins, voice.waitingPriority)) {
        const n = speakableName(name);
        voice.say(coins >= GAME.giftBig ? GAME.thankBigGift(n) : GAME.thankGift(n), true);
        const wish = pick(GAME.giftWishes);
        if (wish) voice.say(wish, true);
      }
    },

    onMember: (e) => {
      const n = speakableName(safeName(e.nickname, e.username));
      if (n !== 'bạn') s.greeter.add(e.username, n);
    },

    onFollow: (e) => {
      if (s.follows.first(e.username)) voice.say(GAME.thankFollow(speakableName(safeName(e.nickname, e.username))));
    },

    onLike: (e) => {
      if (likeBase.current === null) likeBase.current = e.totalLikes - e.likeCount;
      if (e.totalLikes - likeBase.current >= GAME.likesPerBoost) {
        likeBase.current += GAME.likesPerBoost;
        world.cheerAll();
        world.confetti(50);
        voice.say(GAME.boostLine);
      }
      setLikeProgress(Math.max(0, e.totalLikes - likeBase.current));
    },

    onControl: (c) => {
      if (c.action === 'setName' && c.text) setChannelName(c.text);
      if (c.action === 'custom' && c.text === 'bouquet') startBouquet();
      if (!IS_STAGE) return; // chỉ trang stage làm theo lệnh có tiếng, tránh 2 giọng
      if (c.action === 'speak' && c.text) voice.say(c.text, true);
      if (c.action === 'setRate' && c.text) voice.rate = Number(c.text) || 1;
      if (c.action === 'reset') {
        voice.stop();
        s.greeter.reset();
        s.gifts.reset();
        s.follows.reset();
        s.wishes.reset();
        s.recent.reset();
        s.guests.reset();
        world.reset();
        setCard(null);
        setGuestCount(0);
      }
    },
  });

  // Tung hoa định kỳ, nhắc chia sẻ, đọc khi im lâu, lưu tiến độ
  useEffect(() => {
    const timers: ReturnType<typeof setInterval>[] = [];
    timers.push(setInterval(() => world.count > 0 && startBouquet(), GAME.bouquetEveryMs));
    timers.push(setInterval(() => setGuestCount(world.count), 2000));
    if (IS_STAGE) {
      timers.push(setInterval(() => safeSet(SAVE_KEY, s.guests.save()), 10_000));
      timers.push(
        setInterval(() => {
          const n = s.recent.latest(3, GAME.shareReminderEveryMs);
          voice.say(n.length ? GAME.shareWithNames(joinNames(n)) : pick(GAME.shareLines)!);
        }, GAME.shareReminderEveryMs),
      );
      timers.push(
        setInterval(() => {
          if (voice.quietForMs() >= GAME.idleAfterMs) voice.say(pick(GAME.idleLines)!);
        }, 15_000),
      );
    }
    return () => timers.forEach(clearInterval);
  }, []);

  useEffect(() => {
    if (!lastGift) return;
    const t = setTimeout(() => setLastGift(null), 5000);
    return () => clearTimeout(t);
  }, [lastGift]);

  return { status, channelName, queueLen, card, lastGift, likeProgress, bouquetUntil, guestCount };
}

export type GameState = ReturnType<typeof useGame>;

function joinNames(list: string[]) {
  const sp = list.map((n) => (n === 'bạn' ? n : `bạn ${n}`));
  return sp.length > 1 ? `${sp.slice(0, -1).join(', ')} và ${sp[sp.length - 1]}` : sp[0] ?? '';
}

function safeGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    // bỏ qua
  }
}

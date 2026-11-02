import { useEffect, useRef, useState } from 'react';
import { useLiveEvents } from '../live/useLiveEvents';
import type { GiftEvent, LiveStatus } from '../live/types';
import { voice, speakableName } from '../live/voice';
import { containsBanned, maskBanned } from '../live/bannedWords';
import { NameBatcher } from '../live/scoreboard';
import { detectWish, GiftThanker, makePicker, OncePerPerson, plain, RecentPeople, WishLimiter } from '../live/chatter';
import { IS_STAGE } from '../live/page';
import { GAME } from './config';
import { parseCommand, pollCandidate, Guests } from './rules';
import { QUE, type Que } from './loiChuc';
import { world } from './world/world';
import { music } from './music';

const pick = makePicker();
const SAVE_KEY = 'damcuoi-progress';
const COUPLE_KEY = 'damcuoi-couple';

export interface PhotoCard {
  key: number;
  name: string;
  avatar: string;
  chuc: Que;
}

export interface PollView {
  role: 'groom' | 'bride';
  until: number;
  top: { name: string; count: number }[];
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

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function useGame() {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [channelName, setChannelName] = useState(GAME.defaultChannelName);
  const [queueLen, setQueueLen] = useState(0);
  const [card, setCard] = useState<PhotoCard | null>(null);
  const [lastGift, setLastGift] = useState<(GiftEvent & { coins: number }) | null>(null);
  const [likeProgress, setLikeProgress] = useState(0);
  const [bouquetUntil, setBouquetUntil] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [poll, setPoll] = useState<PollView | null>(null);
  const [couple, setCouple] = useState({ groom: '', bride: '' });
  const likeBase = useRef<number | null>(null);
  const avatars = useRef(new Map<string, string>());
  const names = useRef(new Map<string, string>());

  const [s] = useState(() => {
    const guests = new Guests(GAME.firstTrays, GAME.nextTrays, GAME.photoCooldownMs);
    if (IS_STAGE) guests.load(safeGet(SAVE_KEY));
    let saved = { groom: '', bride: '' };
    try {
      saved = { ...saved, ...JSON.parse(safeGet(COUPLE_KEY) || '{}') };
    } catch {
      // bỏ qua
    }
    return {
      guests,
      couple: saved,
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
      greetLimit: limiter(30_000),
      bouquet: null as null | Set<string>,
      poll: null as null | { role: 'groom' | 'bride'; votes: Map<string, { name: string; count: number }>; voted: Set<string>; until: number },
      polledOnce: false,
      usedChuc: [] as number[],
      cardKey: 0,
    };
  });

  const safeName = (nickname: string, username: string) => (containsBanned(nickname) ? username : nickname);
  const spoken = (id: string) => speakableName(names.current.get(id) ?? id);

  // "cô dâu Lan và chú rể Tuấn" / "cô dâu chú rể"
  const coupleText = () => {
    const g = s.couple.groom && speakableName(s.couple.groom);
    const b = s.couple.bride && speakableName(s.couple.bride);
    if (g && b) return `cô dâu ${b} và chú rể ${g}`;
    if (g) return `chú rể ${g} và cô dâu`;
    if (b) return `cô dâu ${b} và chú rể`;
    return 'cô dâu chú rể';
  };

  const applyCouple = (next: { groom: string; bride: string }) => {
    s.couple = next;
    setCouple(next);
    world.setCoupleNames(next.groom, next.bride);
    if (IS_STAGE) safeSet(COUPLE_KEY, JSON.stringify(next));
  };

  // Lời chúc khi chụp hình: rút ngẫu nhiên, không lặp lại 30 câu gần nhất
  const nextChuc = () => {
    const pool = QUE.filter((q) => !s.usedChuc.includes(q.so));
    const q = pool[Math.floor(Math.random() * pool.length)];
    s.usedChuc.push(q.so);
    if (s.usedChuc.length > 30) s.usedChuc.shift();
    return q;
  };

  // ---------- bầu chú rể rồi cô dâu ----------
  const startPoll = (role: 'groom' | 'bride') => {
    if (s.poll) return;
    const until = Date.now() + GAME.pollMs;
    s.poll = { role, votes: new Map(), voted: new Set(), until };
    s.polledOnce = true;
    setPoll({ role, until, top: [] });
    voice.say(GAME.pollAsk[role], true);
    setTimeout(() => endPoll(), GAME.pollMs);
  };

  const endPoll = () => {
    const p = s.poll;
    if (!p) return;
    s.poll = null;
    setPoll(null);
    const roleName = p.role === 'groom' ? 'chú rể' : 'cô dâu';
    const best = [...p.votes.values()].sort((a, b) => b.count - a.count)[0];
    if (best) {
      applyCouple({ ...s.couple, [p.role]: best.name });
      voice.say(GAME.pollWin(cap(roleName), speakableName(best.name)), true);
      world.confetti(80);
      world.coupleDance(5000);
    } else voice.say(GAME.pollNone(roleName));
    if (p.role === 'groom') setTimeout(() => startPoll('bride'), 5000);
  };

  // Thế giới (canvas) báo ngược về: bưng mâm xong, tới lượt chụp, bắt được hoa, cô dâu chú rể chào bàn
  useEffect(() => {
    music.start();
    world.setCoupleNames(s.couple.groom, s.couple.bride);
    setCouple(s.couple);
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
        voice.say(GAME.photo(spoken(id), chuc.loi, coupleText()), false, () =>
          setTimeout(release, Math.max(0, GAME.photoMinMs - (Date.now() - shownAt))),
        );
        setTimeout(release, GAME.photoMaxMs);
      },
      caught: (id) => voice.say(GAME.bouquetCaught(spoken(id)), true),
      coupleGreet: (id) => {
        if (s.greetLimit('all') && voice.waiting < 2) voice.say(GAME.coupleGreet(cap(coupleText()), spoken(id)));
      },
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

  const meet = (id: string, nickname: string, avatar: string) => {
    const name = safeName(nickname, id);
    names.current.set(id, name);
    if (avatar) avatars.current.set(id, avatar);
    s.recent.note(id, speakableName(name));
    world.ensure(id, name, avatar);
    setGuestCount(world.count);
    if (!s.polledOnce && !s.couple.groom && world.count >= GAME.pollAutoAtGuests) startPoll('groom');
    return name;
  };

  useLiveEvents({
    onStatus: setStatus,

    onChat: (e) => {
      const id = e.username;
      const name = meet(id, e.nickname, e.avatar);
      const cmd = parseCommand(e.comment);
      const B = GAME.bubble;

      // đang bầu tên: comment thường được tính là 1 phiếu (mỗi người 1 phiếu)
      if (!cmd && s.poll) {
        const cand = pollCandidate(e.comment);
        if (cand && !s.poll.voted.has(id)) {
          s.poll.voted.add(id);
          const key = plain(cand);
          const v = s.poll.votes.get(key) ?? { name: cand, count: 0 };
          v.count++;
          s.poll.votes.set(key, v);
          const top = [...s.poll.votes.values()].sort((a, b) => b.count - a.count).slice(0, 3);
          setPoll({ role: s.poll.role, until: s.poll.until, top });
          world.say(id, `Bầu ${cand}!`, 3000);
          return;
        }
      }

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
      const name = meet(id, e.nickname, e.avatar);
      const coins = e.diamondCount * e.repeatCount;
      setLastGift({ ...e, nickname: name, coins });

      // Hiệu ứng chung cho cả rạp theo cấp quà, không đổi luật chơi
      const tier = GAME.giftTiers.find((t) => coins >= t.min) ?? GAME.giftTiers[GAME.giftTiers.length - 1];
      for (const fx of tier.fx) {
        if (fx === 'confetti') world.confetti(40);
        if (fx === 'balloon') world.balloon(coins >= 99 ? 14 : 8);
        if (fx === 'envelopes') world.envelopes(coins >= 299 ? 70 : 40);
        if (fx === 'fireworks') world.fireworks(coins >= 999 ? 10 : 4);
        if (fx === 'couple') world.coupleDance(coins >= 999 ? 15000 : 8000);
        if (fx === 'car') world.weddingCar();
        if (fx === 'longphuong') world.longPhuong();
        if (fx === 'gold') world.goldRain(coins >= 4999 ? 400 : 220);
        if (fx === 'party') world.partyAll(coins >= 4999 ? 20000 : 12000);
      }

      // MC hô cảm ơn quà trước mọi câu khác
      if (s.gifts.shouldThank(id, coins, voice.waitingPriority)) voice.say(pick(tier.lines)!(speakableName(name)), true);
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
        world.partyAll(10000);
        world.confetti(60);
        voice.say(GAME.boostLine, true);
      }
      setLikeProgress(Math.max(0, e.totalLikes - likeBase.current));
    },

    onControl: (c) => {
      if (c.action === 'setName' && c.text) setChannelName(c.text);
      if (c.action === 'custom' && c.text === 'bouquet') startBouquet();
      if (c.action === 'custom' && c.text === 'poll') startPoll('groom');
      if (c.action === 'custom' && c.text === 'clearCouple') applyCouple({ groom: '', bride: '' });
      if (!IS_STAGE) return; // chỉ trang stage làm theo lệnh có tiếng, tránh 2 giọng
      if (c.action === 'speak' && c.text) voice.say(c.text, true);
      if (c.action === 'custom' && c.text === 'music') music.toggle();
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

  // MC rảnh là nói: gọi tên khách, kể rạp đang vui cỡ nào, hỏi khán giả
  const chatterLine = (): string | null => {
    const C = GAME.chatter;
    const ct = coupleText();
    const opts: (() => string | null)[] = [
      () => {
        const id = world.someGuests(1)[0];
        if (!id || world.inQueue(id)) return null;
        const c = s.guests.canPhoto(id);
        return c.ok ? C.callPhoto(spoken(id)) : c.why === 'needTray' ? C.callTray(spoken(id), ct) : null;
      },
      () => (world.count >= 3 ? C.crowd(world.count) : null),
      () => (world.countTask('dance') >= 2 ? C.dancing(world.countTask('dance')) : null),
      () => (world.coupleMingling ? C.mingle(cap(ct)) : null),
      () => (world.queueLength >= 2 ? C.queue(world.queueLength) : null),
      () => pick(C.questions) ?? null,
      () => pick(C.questions) ?? null,
    ];
    for (let i = 0; i < 5; i++) {
      const line = opts[Math.floor(Math.random() * opts.length)]();
      if (line) return line;
    }
    return null;
  };

  // Tung hoa định kỳ, MC nói liên tục, nhắc chia sẻ, lưu tiến độ
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
          if (s.poll || voice.quietForMs() < GAME.chatterQuietMs) return;
          const line = chatterLine();
          if (line) voice.say(line);
        }, 2000),
      );
    }
    return () => timers.forEach(clearInterval);
  }, []);

  useEffect(() => {
    if (!lastGift) return;
    const t = setTimeout(() => setLastGift(null), 5000);
    return () => clearTimeout(t);
  }, [lastGift]);

  return { status, channelName, queueLen, card, lastGift, likeProgress, bouquetUntil, guestCount, poll, couple };
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

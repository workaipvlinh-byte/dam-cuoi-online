import { useEffect, useRef, useState } from 'react';
import type { GameState } from './useGame';
import { GAME } from './config';
import { world } from './world/world';
import { H, W } from './world/layout';
import './stage.css';

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Màn hình live 1080x1920: rạp cưới (canvas) + bảng chữ phía trên */
export function GameStage({ game }: { game: GameState }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    world.attach(ref.current!);
    return () => world.detach();
  }, []);

  // đếm ngược bắt hoa
  const [, tick] = useState(0);
  useEffect(() => {
    if (!game.bouquetUntil) return;
    const t = setInterval(() => tick((x) => x + 1), 500);
    return () => clearInterval(t);
  }, [game.bouquetUntil]);
  const bouquetLeft = Math.max(0, Math.ceil((game.bouquetUntil - Date.now()) / 1000));
  const poll = game.poll;
  useEffect(() => {
    if (!poll) return;
    const t = setInterval(() => tick((x) => x + 1), 500);
    return () => clearInterval(t);
  }, [poll?.role]);

  const likePct = Math.min(100, (game.likeProgress / GAME.likesPerBoost) * 100);
  const c = game.card;

  return (
    <div className="dc-stage">
      <canvas ref={ref} width={W} height={H} className="dc-canvas" />

      <header className="dc-title">{GAME.title}</header>

      <div className="dc-bar">
        {c ? (
          <>
            <span className="dc-pill dc-pill-live">Đang chụp hình</span>
            {c.avatar ? <img className="dc-ava" src={c.avatar} referrerPolicy="no-referrer" /> : <span className="dc-ava dc-ava-empty">♥</span>}
            <div className="dc-who">
              <b>{cut(c.name, 16)}</b>
              <span>cùng cô dâu chú rể</span>
            </div>
          </>
        ) : (
          <>
            <span className="dc-pill">Chụp hình</span>
            <div className="dc-who">
              <b>Gõ CHỤP HÌNH</b>
              <span>bưng đủ {GAME.firstTrays} mâm là được lên</span>
            </div>
          </>
        )}
        <div className="dc-side">
          <div className="dc-queue">
            📸 <b>{game.queueLen}</b> người chờ
          </div>
          <div className="dc-like">
            <span>🥂 Nâng ly</span>
            <div className="dc-like-bar">
              <div style={{ width: `${likePct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <aside className="dc-guide">
        <div className="dc-guide-h">Cách tham gia</div>
        <div className="dc-guide-i">
          <i>💬</i>Chat để chúc mừng
        </div>
        <div className="dc-guide-i">
          <i>🍲</i>Gõ <b>BƯNG MÂM</b>
        </div>
        <div className="dc-guide-i">
          <i>📸</i>Gõ <b>CHỤP HÌNH</b>
        </div>
        <div className="dc-guide-i">
          <i>🥂</i>Gõ <b>DZÔ</b>
        </div>
        <div className="dc-guide-i">
          <i>💃</i>Gõ <b>QUẨY</b>
        </div>
      </aside>

      {c && (
        <div key={c.key} className="dc-card">
          <div className="dc-card-photo">
            <span className="dc-card-tag">Ảnh cưới</span>
            <b>{cut(c.name, 18)}</b>
          </div>
          <div className="dc-card-ten">{c.chuc.ten}</div>
          <p className="dc-card-loi">{c.chuc.loi}</p>
          <p className="dc-card-khuyen">{c.chuc.khuyen}</p>
        </div>
      )}

      {poll && (
        <div className="dc-poll">
          <div className="dc-poll-h">
            Bầu <b>{poll.role === 'groom' ? 'CHÚ RỂ' : 'CÔ DÂU'}</b> · comment tên · {Math.max(0, Math.ceil((poll.until - Date.now()) / 1000))}s
          </div>
          {poll.top.map((v, i) => (
            <div key={v.name} className="dc-poll-row">
              {['🥇', '🥈', '🥉'][i]} {cut(v.name, 16)} <b>{v.count}</b>
            </div>
          ))}
        </div>
      )}

      {game.bouquetUntil > 0 && (
        <div className="dc-bouquet">
          💐 Gõ <b>BẮT HOA</b> · còn {bouquetLeft}s
        </div>
      )}

      {game.lastGift && (
        <div key={game.lastGift.timestamp} className={`dc-gift ${game.lastGift.coins >= GAME.giftBig ? 'dc-gift-big' : ''}`}>
          <b>{cut(game.lastGift.nickname, 18)}</b> gửi quà mừng cưới 🎁
        </div>
      )}
    </div>
  );
}

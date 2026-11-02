// Tự kiểm tra luật chơi: npx tsx src/game/rules.check.ts
import assert from 'node:assert';
import { Guests, parseCommand, pollCandidate, Titles } from './rules';

assert.equal(parseCommand('Bưng Mâm!!'), 'tray');
assert.equal(parseCommand('bung mam'), 'tray');
assert.equal(parseCommand('CHỤP HÌNH'), 'photo');
assert.equal(parseCommand('1 2 3 dzô'), 'dzo');
assert.equal(parseCommand('zô zô'), 'dzo');
assert.equal(parseCommand('vô live nè'), null);
assert.equal(parseCommand('quẩy lên'), 'dance');
assert.equal(parseCommand('quay lại đây'), null);
assert.equal(parseCommand('bắt hoa'), 'bouquet');
assert.equal(parseCommand('chúc mừng hạnh phúc'), null);

const g = new Guests(2, 1, 60_000);
assert.deepEqual(g.canPhoto('a'), { ok: false, why: 'needTray', left: 2 });
assert.equal(g.addTray('a'), false);
assert.equal(g.addTray('a'), true);
assert.deepEqual(g.canPhoto('a'), { ok: true });
g.tookPhoto('a', 1000);
assert.deepEqual(g.canPhoto('a', 2000), { ok: false, why: 'needTray', left: 1 });
g.addTray('a');
assert.deepEqual(g.canPhoto('a', 2000), { ok: false, why: 'cooldown', minutes: 1 });
assert.deepEqual(g.canPhoto('a', 62_000), { ok: true });
const copy = new Guests(2, 1, 60_000);
copy.load(g.save());
assert.deepEqual(copy.canPhoto('a', 62_000), { ok: true });
assert.equal(pollCandidate('chú rể là anh Tuấn!!'), 'Tuấn');
assert.equal(pollCandidate('Lan'), 'Lan');
assert.equal(pollCandidate('bầu chị ngọc hân'), 'Ngọc Hân');
assert.equal(pollCandidate('bưng mâm'), null);
assert.equal(pollCandidate('x'), null);
assert.equal(pollCandidate('một câu rất dài không phải là tên người đâu nha'), null);
assert.equal(pollCandidate('Cô dâu đẹp quá'), null);
assert.equal(pollCandidate('xinh ghê'), null);
assert.equal(pollCandidate('chúc mừng'), null);
assert.equal(pollCandidate('có'), null);
assert.equal(pollCandidate('Hồng Phúc'), 'Hồng Phúc');
const T = new Titles({
  leaders: [
    { key: 'coins', name: 'VIP' },
    { key: 'zo', name: 'Tiếp rượu' },
  ],
  milestones: [{ key: 'zo', min: 1, name: 'Nhậu' }],
  minToLead: 2,
  bouquet: 'Bắt hoa',
});
assert.equal(T.add('a', 'zo').promoted, null); // 1 lần chưa đủ lên chức
assert.deepEqual(T.titleOf('a'), { text: 'Nhậu', gold: false });
assert.deepEqual(T.add('a', 'zo').promoted, { id: 'a', title: 'Tiếp rượu' });
T.add('b', 'zo');
T.add('b', 'zo'); // bằng a: chưa vượt
assert.deepEqual(T.titleOf('a'), { text: 'Tiếp rượu', gold: true });
const r = T.add('b', 'zo'); // b vượt a
assert.deepEqual(r.promoted, { id: 'b', title: 'Tiếp rượu' });
assert.ok(r.changed.includes('a'));
assert.deepEqual(T.titleOf('a'), { text: 'Nhậu', gold: false });
T.caught('c');
assert.deepEqual(T.titleOf('c'), { text: 'Bắt hoa', gold: false });
console.log('rules ok');

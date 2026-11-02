// Tự kiểm tra luật chơi: npx tsx src/game/rules.check.ts
import assert from 'node:assert';
import { Guests, parseCommand } from './rules';

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
console.log('rules ok');

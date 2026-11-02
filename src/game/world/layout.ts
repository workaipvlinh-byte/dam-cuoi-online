// Toạ độ trên khung 1080x1920. Đổi ảnh nền thì đo lại ở đây.
export const W = 1080;
export const H = 1920;

/** Gần camera (y lớn) thì to hơn: 1.15 ở mép sân khấu, ~1.7 ở cổng (điện thoại xem thu nhỏ 1/3 nên không được quá bé) */
export const scaleAt = (y: number) => 1.15 + Math.max(0, Math.min(1, (y - 800) / 860)) * 0.55;

// Sân khấu: mặt sàn từ y 700 tới mép trước y 840
export const STAGE = { x0: 270, x1: 810, top: 690, front: 840 };
export const GROOM = { x: 495, y: 812 };
export const BRIDE = { x: 585, y: 812 };
export const PHOTO_SPOT = { x: 668, y: 818 };
export const STAGE_STEPS = { x: 840, y: 860 };

// Sàn nhảy trước sân khấu
export const DANCE = { x0: 300, x1: 780, y0: 875, y1: 975 };

// Chỗ đứng chờ bắt hoa
export const BOUQUET = { x0: 330, x1: 750, y0: 880, y1: 960 };

// Cửa bếp bên trái: chỗ nhận mâm
export const KITCHEN = { x: 175, y: 1015 };

// Bàn tiệc: 2 cột trái, 1 cột phải, lối đi giữa
export interface Table {
  x: number;
  y: number;
  food: number; // số mâm đang có trên bàn (0..3)
}
export const TABLE_RX = 64;
export const TABLE_RY = 26;
export const TABLES: Table[] = [];
// 4 hàng đủ 5 bàn + 1 hàng cuối 3 bàn (chừa 2 cột cổng hoa) = 23 bàn
for (const y of [1080, 1205, 1330, 1455]) for (const x of [165, 300, 435, 655, 785]) TABLES.push({ x, y, food: 0 });
for (const x of [165, 300, 785]) TABLES.push({ x, y: 1580, food: 0 });

// 8 ghế quanh bàn: 3 sau lưng (khuất sau bàn), 3 phía trước (quay lưng ra camera), 2 hai đầu
export const SEAT_OFFSETS = [
  { dx: -72, dy: 2, back: false },
  { dx: 72, dy: 2, back: false },
  { dx: -42, dy: -24, back: false },
  { dx: 0, dy: -29, back: false },
  { dx: 42, dy: -24, back: false },
  { dx: -42, dy: 27, back: true },
  { dx: 0, dy: 32, back: true },
  { dx: 42, dy: 27, back: true },
];

// Hàng chờ chụp hình: đi từ chân bậc lên sân khấu xuống dọc mép phải, 2 cột
export const QUEUE_SLOTS: { x: number; y: number }[] = [];
// mép phải bị bản mobile cắt ~100px nên hàng chờ nằm trong x 880–945
for (let i = 0; i < 11; i++) QUEUE_SLOTS.push({ x: 880, y: 905 + i * 44 });
for (let i = 0; i < 11; i++) QUEUE_SLOTS.push({ x: 945, y: 905 + i * 44 });

// Cổng hoa: khách xuất hiện dưới cổng rồi đi lên
export const GATE = { x: 540, y: 1700 };

// Vùng đi dạo
export const WANDER = { x0: 70, x1: 860, y0: 1010, y1: 1640 };

export function insideTable(x: number, y: number, pad = 18) {
  return TABLES.some((t) => ((x - t.x) / (TABLE_RX + pad)) ** 2 + ((y - t.y) / (TABLE_RY + pad + 10)) ** 2 < 1);
}

// Đám đông đứng xem (không đi lại): hai bên sàn nhảy và dải sát mép dưới
export const SPECTATORS: { x: number; y: number; back: boolean }[] = [];
for (let r = 0; r < 3; r++)
  for (let i = 0; i < 4; i++) {
    SPECTATORS.push({ x: 262 + i * 26 + (r % 2) * 13, y: 885 + r * 38, back: true });
    SPECTATORS.push({ x: 770 + i * 30 + (r % 2) * 15, y: 885 + r * 38, back: true });
  }
for (let i = 0; i < 9; i++) SPECTATORS.push({ x: 60 + i * 38, y: 1690 + (i % 2) * 22, back: true });
for (let i = 0; i < 7; i++) SPECTATORS.push({ x: 700 + i * 38, y: 1690 + (i % 2) * 22, back: true });

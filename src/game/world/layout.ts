// Toạ độ trên khung 1080x1920. Đổi ảnh nền thì đo lại ở đây.
export const W = 1080;
export const H = 1920;

/** Gần camera (y lớn) thì to hơn: 1.3 ở mép sân khấu, ~1.9 ở cổng (điện thoại xem thu nhỏ 1/3 nên phải to) */
export const scaleAt = (y: number) => 1.3 + Math.max(0, Math.min(1, (y - 800) / 860)) * 0.6;

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
export const KITCHEN = { x: 112, y: 1010 };

// Bàn tiệc: 2 cột trái, 1 cột phải, lối đi giữa
export interface Table {
  x: number;
  y: number;
  food: number; // số mâm đang có trên bàn (0..3)
}
export const TABLE_RX = 82;
export const TABLE_RY = 32;
export const TABLES: Table[] = [];
for (const y of [1080, 1265, 1450]) for (const x of [205, 395, 700]) TABLES.push({ x, y, food: 0 });

// 6 ghế quanh bàn: 3 sau lưng (khuất sau bàn), 3 phía trước (quay lưng ra camera)
export const SEAT_OFFSETS = [
  { dx: -54, dy: -30, back: false },
  { dx: 0, dy: -36, back: false },
  { dx: 54, dy: -30, back: false },
  { dx: -54, dy: 34, back: true },
  { dx: 0, dy: 40, back: true },
  { dx: 54, dy: 34, back: true },
];

// Hàng chờ chụp hình: đi từ chân bậc lên sân khấu xuống dọc mép phải, 2 cột
export const QUEUE_SLOTS: { x: number; y: number }[] = [];
for (let i = 0; i < 11; i++) QUEUE_SLOTS.push({ x: 905, y: 905 + i * 44 });
for (let i = 0; i < 11; i++) QUEUE_SLOTS.push({ x: 995, y: 905 + i * 44 });

// Cổng hoa: khách xuất hiện dưới cổng rồi đi lên
export const GATE = { x: 540, y: 1700 };

// Vùng đi dạo
export const WANDER = { x0: 70, x1: 840, y0: 1000, y1: 1620 };

export function insideTable(x: number, y: number, pad = 18) {
  return TABLES.some((t) => ((x - t.x) / (TABLE_RX + pad)) ** 2 + ((y - t.y) / (TABLE_RY + pad + 10)) ** 2 < 1);
}

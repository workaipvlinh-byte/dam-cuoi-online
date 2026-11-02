// =====================================================
//  CẤU HÌNH GAME ĐÁM CƯỚI - phần lớn thay đổi nhỏ chỉ cần sửa file này
//  Câu đọc: `name` = tên người xem (đã làm sạch)
//  Giọng là MC đám cưới: tươi, nhanh, có cảm thán. Không đọc tên quà tiếng Anh.
// =====================================================

import type { WishTopic } from '../live/chatter';

export const GAME = {
  title: 'Đám Cưới Online',
  defaultChannelName: 'nhà mình',

  // ---------- Bưng mâm / chụp hình ----------
  firstTrays: 2, // lần đầu bưng 2 mâm mới được chụp
  nextTrays: 1, // các lần sau 1 mâm
  photoCooldownMs: 5 * 60_000, // chụp xong chờ 5 phút mới chụp tiếp
  maxQueue: 20, // hàng chụp hình tối đa
  photoMinMs: 9_000, // ảnh hiện ít nhất 9 giây
  photoMaxMs: 40_000,

  // ---------- Tim ----------
  likesPerBoost: 300, // đủ tim thì cả rạp nâng ly

  // ---------- Tung hoa cưới ----------
  bouquetEveryMs: 10 * 60_000,
  bouquetWindowMs: 30_000, // thời gian gõ BẮT HOA

  // ---------- Quà (xu của 1 lần tặng) ----------
  giftMid: 30,
  giftBig: 99,
  giftHuge: 999,

  // ---------- Câu MC ----------
  greetEveryMs: 6000,
  namesPerGreeting: 3,
  greetings: [
    (names: string) => `Xin chào ${names}! Mời vào rạp, cỗ đang dọn, nhạc đang lên rồi!`,
    (names: string) => `A, ${names} tới rồi kìa! Vào ngồi chơi, ăn cỗ cho vui nha!`,
    (names: string) => `Rạp cưới chào ${names}! Ai chưa có chỗ thì gõ dzô để ngồi vào bàn nha!`,
  ],

  giftThanksCooldownMs: 30_000,
  thankGift: (name: string) => `Cảm ơn bạn ${name} đã gửi quà mừng cô dâu chú rể!`,
  thankBigGift: (name: string) => `Trời ơi, bạn ${name} chơi lớn quá! Cả rạp cho một tràng pháo tay nào!`,
  giftWishes: [
    'Chúc bạn tiền vô như nước, tình duyên phơi phới!',
    'Chúc bạn sớm tới lượt mình lên xe hoa nha!',
    'Chúc cả nhà bạn mạnh khỏe, làm ăn phát đạt!',
    'Chúc bạn năm nay ăn nên làm ra, chuyện gì cũng suôn sẻ!',
    'Chúc bạn hạnh phúc như cô dâu chú rể hôm nay!',
  ],

  thankFollow: (name: string) => `Cảm ơn bạn ${name} đã theo dõi kênh! Lần sau có đám cưới nhớ ghé nữa nha!`,

  photo: (name: string, loi: string) => `Xin mời bạn ${name} lên chụp hình cùng cô dâu chú rể! Cô dâu chú rể chúc bạn: ${loi}`,
  unlocked: (name: string) => `Bạn ${name} bưng đủ mâm rồi! Gõ chụp hình để lên sân khấu nha!`,
  needTray: (name: string, left: number) => `Bạn ${name} ơi, bưng thêm ${left} mâm nữa là được lên chụp hình với cô dâu chú rể nha!`,
  queueFull: 'Hàng chụp hình đang dài quá trời, mọi người bưng mâm, cụng ly chờ chút nha!',
  partyLine: 'Sàn nhảy nóng quá rồi! Ai chưa quẩy thì gõ quẩy vô luôn nha!',
  boostLine: 'Đủ tim rồi! Cả rạp nâng ly nào! Một, hai, ba, dzô!',

  bouquetCall: 'Sắp tung hoa cưới rồi! Ai muốn bắt hoa thì gõ bắt hoa, nhanh lên nào!',
  bouquetThrow: 'Cô dâu quay lưng rồi, chuẩn bị nha! Một, hai, ba!',
  bouquetCaught: (name: string) => `Bạn ${name} bắt được hoa cưới rồi! Chúc bạn sớm có tin vui nha!`,
  bouquetNobody: 'Chưa ai gõ bắt hoa hết, lát nữa cô dâu tung lại nha!',

  // Bong bóng trên đầu nhân vật (chữ, không đọc)
  bubble: {
    needTray: (left: number) => `Bưng thêm ${left} mâm nữa nha`,
    cooldown: (m: number) => `Chờ ${m} phút nữa chụp tiếp nha`,
    queued: 'Xếp hàng chụp hình nè!',
    inQueue: 'Đang xếp hàng rồi nè',
    full: 'Hàng đông quá, chờ chút nha',
    tray: 'Để em bưng cho!',
    unlocked: 'Đủ mâm rồi! Gõ CHỤP HÌNH',
    bouquet: 'Cho em bắt hoa với!',
  },

  // ---------- Comment cầu chúc ----------
  wishPerUserMs: 10 * 60_000,
  wishGlobalMs: 20_000,
  wishReplies: {
    exam: [(name: string) => `Chúc bạn ${name} thi đâu đậu đó, điểm cao chót vót luôn!`],
    health: [(name: string) => `Chúc bạn ${name} với cả nhà khỏe re, ăn ngon ngủ kỹ!`],
    love: [
      (name: string) => `Chúc bạn ${name} sớm có người thương, năm sau tới lượt rạp cưới nhà bạn nha!`,
      (name: string) => `Chúc bạn ${name} thương ai người đó thương lại, sớm cưới luôn!`,
    ],
    family: [(name: string) => `Chúc nhà bạn ${name} lúc nào cũng êm ấm, rộn tiếng cười!`],
    work: [(name: string) => `Chúc bạn ${name} công việc thuận buồm xuôi gió, sếp thương, lương tăng!`],
    wealth: [(name: string) => `Chúc bạn ${name} làm ăn phát tài, tiền vô đầy túi!`],
    peace: [(name: string) => `Chúc bạn ${name} đi đâu cũng bình an, gặp toàn chuyện vui!`],
  } as Record<WishTopic, ((name: string) => string)[]>,

  // ---------- Nhắc chia sẻ ----------
  shareReminderEveryMs: 5 * 60_000,
  shareWithNames: (names: string) => `Cảm ơn ${names} đã tới chung vui! Mọi người bấm chia sẻ live, rủ bạn bè vô ăn cưới nha!`,
  shareLines: ['Đám cưới càng đông càng vui! Mọi người bấm chia sẻ live rủ bạn bè vô nha!'],

  // ---------- Live im quá lâu ----------
  idleAfterMs: 60_000,
  idleLines: [
    'Ai mới vào thì gõ bưng mâm để phụ dọn cỗ nha, đủ hai mâm là được lên chụp hình với cô dâu chú rể!',
    'Gõ dzô để ngồi vào bàn nâng ly, gõ quẩy để ra sàn nhảy nha!',
    'Cô dâu hôm nay xinh quá trời! Mọi người thả tim cho cô dâu chú rể đi nào!',
    'Bàn nào hết cỗ rồi kìa! Ai gõ bưng mâm phụ một tay nào!',
  ],
};

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

  // ---------- Quà ----------
  giftBig: 99, // từ mức này: luôn cảm ơn (kể cả combo), banner to

  // ---------- Câu MC ----------
  greetEveryMs: 6000,
  namesPerGreeting: 3,
  greetings: [
    (names: string) => `Xin chào ${names}! Mời vào rạp, cỗ đang dọn, nhạc đang lên rồi!`,
    (names: string) => `A, ${names} tới rồi kìa! Vào ngồi chơi, ăn cỗ cho vui nha!`,
    (names: string) => `Rạp cưới chào ${names}! Ai chưa có chỗ thì gõ dzô để ngồi vào bàn nha!`,
  ],

  giftThanksCooldownMs: 30_000,

  // ---------- Quà theo cấp (xu của 1 lần tặng) ----------
  // fx: confetti, balloon, envelopes (phong bì rơi), fireworks, couple (cô dâu chú rể nhảy),
  //     car (xe hoa), longphuong (rồng phượng bay), gold (mưa kim tuyến), party (cả rạp lên đèn nhảy)
  // Câu hô: "|" tách đoạn, "^" hô cao giọng, "^^" hô cao + kéo dài.
  giftTiers: [
    {
      min: 4999,
      fx: ['longphuong', 'car', 'fireworks', 'gold', 'envelopes', 'party', 'couple'],
      lines: [(n: string) => `^^Trời ơi tin được không! | Bạn ${n} là đại gia của đám cưới hôm nay! Ban nhạc nổi nhạc lên, cả rạp đứng dậy nào! | ^^Hoan hô!`],
    },
    {
      min: 999,
      fx: ['longphuong', 'fireworks', 'gold', 'party', 'couple'],
      lines: [
        (n: string) => `^^Ối dồi ôi! | Long phượng sum vầy! Bạn ${n} làm cả rạp sáng rực luôn! | ^^Đỉnh của chóp!`,
        (n: string) => `^^Trời đất quỷ thần ơi! | Bạn ${n} vừa làm cô dâu chú rể khóc vì cảm động luôn rồi! | ^^Hoan hô!`,
      ],
    },
    {
      min: 299,
      fx: ['car', 'fireworks', 'envelopes', 'couple'],
      lines: [
        (n: string) => `^Ối giời ơi! | Xe hoa của bạn ${n} tới rồi kìa! Khách VIP của rạp hôm nay đây rồi! | ^^Quá đỉnh!`,
        (n: string) => `Bạn ${n} ơi, tháng này ăn mì tôm cũng đáng nha! Cô dâu chú rể cảm ơn bạn nhiều lắm! | ^^Hoan hô!`,
      ],
    },
    {
      min: 99,
      fx: ['fireworks', 'balloon', 'couple'],
      lines: [
        (n: string) => `^Trời đất ơi! | Bạn ${n} chơi lớn quá! Cả rạp cho một tràng pháo tay nào! | ^^Hoan hô!`,
        (n: string) => `Ví của bạn ${n} vừa mỏng đi một chút, mà tình cảm thì dày lên rồi! | ^Cảm ơn bạn!`,
      ],
    },
    {
      min: 30,
      fx: ['envelopes', 'balloon'],
      lines: [
        (n: string) => `^Ối dồi ôi! | Phong bì của bạn ${n} dày quá trời! Cô dâu chú rể cười tít mắt luôn!`,
        (n: string) => `Bạn ${n} gửi quà mà không hỏi ý vợ đúng không? Cảm ơn bạn nha! | ^Quá chất!`,
      ],
    },
    {
      min: 10,
      fx: ['balloon', 'confetti'],
      lines: [
        (n: string) => `^Ồ ô! | Bạn ${n} gửi quà mừng cô dâu chú rể! Cả rạp vỗ tay nào!`,
        (n: string) => `Bạn ${n} ra tay rồi! Bóng bay lên, nhạc lên nào! | ^Hoan hô!`,
      ],
    },
    {
      min: 1,
      fx: ['confetti'],
      lines: [
        (n: string) => `Cảm ơn bạn ${n} nha! | ^Quà nhỏ mà có võ!`,
        (n: string) => `Bạn ${n} gửi quà mừng nè! Cô dâu chú rể ghi sổ rồi nha!`,
        (n: string) => `Ui, bạn ${n} mừng cưới kìa! Cảm ơn bạn nhiều nha!`,
      ],
    },
  ],

  thankFollow: (name: string) => `Cảm ơn bạn ${name} đã theo dõi kênh! Lần sau có đám cưới nhớ ghé nữa nha!`,

  // `couple` = "cô dâu Lan và chú rể Tuấn" (chưa bầu tên thì "cô dâu chú rể")
  photo: (name: string, loi: string, couple: string) => `Xin mời bạn ${name} lên chụp hình cùng ${couple}! | ^Cười lên nào! | Chúc bạn: ${loi}`,
  unlocked: (name: string) => `Bạn ${name} bưng đủ mâm rồi! Gõ chụp hình để lên sân khấu nha!`,
  needTray: (name: string, left: number) => `Bạn ${name} ơi, bưng thêm ${left} mâm nữa là được lên chụp hình với cô dâu chú rể nha!`,
  queueFull: 'Hàng chụp hình đang dài quá trời, mọi người bưng mâm, cụng ly chờ chút nha!',
  partyLine: 'Sàn nhảy nóng quá rồi! Ai chưa quẩy thì gõ quẩy vô luôn nha! | ^Quẩy lên!',
  boostLine: 'Đủ tim rồi! Cả rạp lên đèn, đứng dậy quẩy nào! Một, hai, ba | ^^Dô!',
  coupleGreet: (couple: string, name: string) => `${couple} tới chào bạn ${name} nè! Nâng ly nào! | ^^Dô!`,

  bouquetCall: 'Sắp tung hoa cưới rồi! Ai muốn bắt hoa thì gõ bắt hoa, nhanh lên nào!',
  bouquetThrow: 'Cô dâu quay lưng rồi, chuẩn bị nha! Một, hai, ba!',
  bouquetCaught: (name: string) => `Bạn ${name} bắt được hoa cưới rồi! | ^^Hoan hô! | Chúc bạn sớm có tin vui nha!`,
  bouquetNobody: 'Chưa ai gõ bắt hoa hết, lát nữa cô dâu tung lại nha!',

  // ---------- Bầu tên chú rể, cô dâu từ comment ----------
  pollMs: 35_000,
  pollAutoAtGuests: 5, // đủ 5 khách mà chưa có tên thì tự bầu
  pollAsk: {
    groom: 'Mọi người ơi, đám cưới hôm nay chưa có chú rể! Muốn ai làm chú rể thì comment tên người đó vào nha!',
    bride: 'Giờ tới cô dâu! Muốn ai làm cô dâu thì comment tên vào nha, nhanh tay lên!',
  },
  pollWin: (role: string, name: string) => `Chốt rồi! ${role} hôm nay là ${name}! | ^^Hoan hô!`,
  pollNone: (role: string) => `Chưa ai bầu ${role} hết, thôi giữ bí mật nha!`,

  // ---------- MC nói liên tục khi rảnh ----------
  chatterQuietMs: 4000, // giọng im 4 giây là MC nói tiếp
  chatter: {
    callTray: (n: string, couple: string) => `Bạn ${n} ơi, gõ bưng mâm phụ một tay đi, đủ hai mâm là được lên chụp hình với ${couple}!`,
    callPhoto: (n: string) => `Bạn ${n} bưng đủ mâm rồi kìa! Gõ chụp hình đi, sân khấu đang chờ!`,
    crowd: (k: number) => `Rạp đang có ${k} khách rồi đó! Ai mới vào thì comment một câu là có chỗ ngồi liền!`,
    dancing: (k: number) => `${k} người đang quẩy trên sàn kìa! Ai chưa quẩy thì gõ quẩy vô đi! | ^Quẩy lên!`,
    mingle: (couple: string) => `${couple} đang đi chào từng bàn kìa! Bàn nào chưa được chào thì gõ dô cho rộn lên!`,
    queue: (k: number) => `Hàng chụp hình đang có ${k} người, ai muốn lên thì bưng mâm rồi gõ chụp hình nha!`,
    questions: [
      'Mọi người đang xem ở tỉnh nào đó? Comment quê mình cho MC biết với!',
      'Ai có người yêu rồi comment chữ có, chưa có thì comment chữ chưa nha!',
      'Đi ăn cưới mà chưa bỏ phong bì thì thả tim bù cho cô dâu chú rể nha!',
      'Món nào ngon nhất đám cưới quê? Comment cho MC thèm chơi!',
      'Ai cưới rồi thì comment năm cưới cho MC xem nào!',
      'Bàn nào hết cỗ rồi kìa! Ai gõ bưng mâm phụ một tay nào!',
      'Thả tim cho đủ ba trăm, cả rạp lên đèn quẩy luôn nha!',
      'Cô dâu hôm nay xinh quá trời! Mọi người thả tim cho cô dâu chú rể đi nào!',
      'Gõ dô để ngồi vào bàn nâng ly, gõ quẩy để ra sàn nhảy nha!',
    ],
  },

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

};

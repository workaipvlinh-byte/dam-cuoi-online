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
  // Người lướt vào live: MC đọc tên + mời vào ăn cưới (gom tối đa 3 tên mỗi câu)
  greetings: [
    (names: string) => `Ơ kìa, ${names} vừa ghé ngang! Vào ăn cưới luôn đi, comment một câu là có ghế ngồi liền!`,
    (names: string) => `${names} ơi, đừng lướt qua nha! Nhà có đám cưới, mời vào ăn cỗ, cụng ly cho vui!`,
    (names: string) => `Chào ${names}! Rạp cưới còn ghế trống nè, vào comment một câu là thành khách mời liền!`,
    (names: string) => `A, ${names} tới đúng lúc cỗ vừa dọn ra! Vào ngồi đi, gõ dô là có ly liền!`,
    (names: string) => `Ui, ${names} đi ngang đám cưới mà không vô là tiếc lắm đó! Comment một câu vào rạp liền nha!`,
    (names: string) => `Mời ${names} vào ăn cưới! Bưng hai mâm là được lên chụp hình với cô dâu chú rể luôn!`,
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

  // ---------- Khai mạc lễ cưới (lời dẫn của chủ kênh) ----------
  // Chạy sau khi bầu xong tên, hoặc bấm nút ở trang điều khiển. Tới câu cuối thì cô dâu chú rể đi thảm đỏ lên sân khấu.
  ceremony: {
    // Lời mở đầu: 2 bản, mỗi lần khai mạc đổi bản. Sau đó là intro (đi thảm đỏ), trao nhẫn, cảm ơn, mời tiệc.
    openings: [
      (groom: string, bride: string) => [
        'Kính thưa toàn thể các cụ, các ông, các bà, cô dì chú bác, anh chị em hai bên nội ngoại, cùng toàn thể bạn bè thân thiết của cô dâu và chú rể!',
        'Lời đầu tiên, cho phép MC thay mặt hai bên gia đình gửi đến toàn thể quý vị lời chào trân trọng nhất, cùng lời chúc sức khỏe và hạnh phúc!',
        `Kính thưa quý vị, trai khôn dựng vợ, gái lớn gả chồng. Sau thời gian tìm hiểu, thương yêu và gắn bó, hôm nay ngày lành tháng tốt, hai bên gia đình chính thức tổ chức lễ thành hôn cho hai bạn ${groom} và ${bride}.`,
        'Để có ngày vui trọn vẹn hôm nay, chúng ta không thể quên công ơn sinh thành, dưỡng dục của các bậc làm cha làm mẹ. Xin trân trọng gửi lời cảm ơn tới ông bà thân sinh hai bên nhà trai và nhà gái!',
      ],
      (groom: string, bride: string) => [
        `Vâng, rất hân hoan chào đón toàn thể quý vị quan khách, cùng quan viên hai họ đã có mặt trong buổi lễ thành hôn của chú rể ${groom} và cô dâu ${bride}!`,
        'Lời nói đầu tiên, cho phép MC thay mặt những người thực hiện chương trình gửi đến quý vị lời chúc sức khỏe, lời chào thân thương và trân trọng nhất!',
        'Quý vị thân mến! Từ ngàn xưa đến bây giờ và mãi mãi sau này, tình yêu luôn là một câu chuyện dài, nhiều biến cố, đầy cảm xúc và vô số màu sắc.',
        'Khi hai trái tim đã hòa chung một nhịp đập, cặp đôi nào cũng muốn về chung một mái ấm, như chim cùng một cánh, như cây cùng một cành. Và cặp đôi trẻ của chúng ta cũng không ngoại lệ.',
        'Kính thưa quan viên hai họ, kính thưa quý vị quan khách! Yêu nhau chẳng quản xa gần, cầu không tay vịn cũng lần mà sang. Yêu nhau chẳng quản lầm than, mấy sông cũng lội, mấy ngàn cũng qua. Yêu nhau chẳng ngại đường xa, đá vàng cũng quyết, phong ba cũng liều.',
        'Vâng, thưa quý vị! Yêu và được yêu là niềm hạnh phúc lớn lao nhất trong cuộc đời mỗi con người, là món quà quý giá mà cuộc sống ban tặng cho chúng ta.',
        `Sau thời gian quen biết và tìm hiểu, cô dâu ${bride} và chú rể ${groom} đã cùng nhau tìm được bến bờ hạnh phúc, và đám cưới hôm nay chính là minh chứng cho tình yêu đó.`,
      ],
    ],
    intro: (groom: string, bride: string) =>
      `Và ngay sau đây, xin một tràng pháo tay thật nồng nhiệt để chào đón nhân vật chính được mong chờ nhất hôm nay: chú rể ${groom} và cô dâu ${bride}! | ^^Hoan hô!`,
    ring: 'Chiếc nhẫn cưới không chỉ là một tín vật đơn thuần. Nó là vòng tròn của sự vĩnh cửu, không có điểm đầu cũng chẳng có điểm kết thúc, tượng trưng cho tình yêu bền chặt mà hai bạn dành cho nhau.',
    ringGive: 'Xin mời cô dâu và chú rể trao cho nhau tín vật yêu thương này! | ^^Hoan hô!',
    thanks: 'Thay mặt gia đình hai bên, xin chân thành cảm ơn sự hiện diện, những món quà và những lời chúc tốt đẹp mà quý vị đã dành cho đôi uyên ương.',
    invite: 'Xin kính chúc toàn thể quý vị khách quý có một bữa tiệc thật ngon miệng và ấm cúng. Xin trân trọng kính mời! | ^^Dô!',
  },

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
    // Bộ câu kéo comment: hỏi nhanh, chọn số, hô theo
    hype: [
      'Ai thấy cô dâu xinh comment số một, ai thấy chú rể đẹp trai comment số hai! Xem bên nào thắng nào!',
      'Cả rạp comment chữ dô cho MC nghe coi! Một, hai, ba | ^^Dô!',
      'Ai đang ăn cơm mà vẫn xem live đám cưới thì comment chữ ăn nha, MC biết hết đó!',
      'Ai đi ăn cưới mà toàn ngồi bàn cuối gần bếp giống MC thì comment một nụ cười coi!',
      'Ai muốn năm nay lấy vợ lấy chồng comment chữ cưới! MC ghi tên, lần sau rạp này là của bạn!',
      'Hỏi nhanh đáp gọn: phong bì đám cưới bao nhiêu là vừa? Comment số cho MC xem nào!',
      'Ai đang xem một mình buồn quá thì vô rạp ngồi chung bàn với mọi người nè, comment một câu thôi!',
      'Bàn nào hô to nhất? Gõ dô liên tục cho MC thấy nào! | ^Dô! Dô! Dô!',
      'Ai từng đi đám cưới mà bị hỏi khi nào cưới thì comment chữ rồi nha, MC thương!',
      'Thả tim đi mọi người, đủ ba trăm tim là cả rạp lên đèn quẩy luôn!',
      'Ai thích nhạc đám cưới quê thì comment chữ thích nha!',
      'Cô dâu chú rể đang đi chào từng bàn, bàn nào muốn được ghé thì gõ dô thật nhiều vào!',
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

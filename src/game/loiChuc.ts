// 99 lời chúc cô dâu chú rể gửi khách lên chụp hình (lấy từ bộ 99 câu chủ kênh soạn, đã chỉnh cho gọn).
// `ten` in trên ảnh cưới, `loi` được MC đọc (~8 giây), `khuyen` hiện nhỏ dưới ảnh.
// Sửa câu nào thì sửa thẳng ở đây.

export type QueTopic = 'duyen' | 'tai' | 'khoe' | 'nha' | 'viec' | 'hoc' | 'an' | 'ban';

export const TOPIC_LABEL: Record<QueTopic, string> = {
  duyen: 'Tình duyên',
  tai: 'Tài lộc',
  khoe: 'Sức khỏe',
  nha: 'Gia đạo',
  viec: 'Công việc',
  hoc: 'Học hành',
  an: 'Bình an',
  ban: 'Bạn bè, quý nhân',
};

export interface Que {
  so: number;
  ten: string;
  chude: QueTopic;
  loi: string;
  khuyen: string;
}

const Q: Array<[string, QueTopic, string, string]> = [
  ['Lương Duyên Hội Ngộ', 'duyen', 'Mong bạn gặp được người chân thành, biết lắng nghe, cùng nhau giữ một tình yêu bình yên.', 'Muốn gặp người tử tế thì cứ sống tử tế trước đã.'],
  ['Tài Lộc Hanh Thông', 'tai', 'Mong bạn có thêm cơ hội tăng thu nhập, làm đâu thuận đó, cuộc sống ngày một đủ đầy.', 'Ghi lại thu chi một tháng, bạn sẽ thấy tiền đi đâu.'],
  ['Thân Tâm An Lạc', 'khoe', 'Mong bạn thân khỏe tâm an, sáng nào thức dậy cũng thấy vui.', 'Tối nay ngủ sớm hơn hôm qua nửa tiếng.'],
  ['Quý Nhân Tương Trợ', 'ban', 'Mong bạn gặp người đồng hành tử tế, sẵn lòng chỉ đường và cùng nhau tiến bộ.', 'Cần giúp thì cứ mở lời, người tốt quanh bạn nhiều hơn bạn nghĩ.'],
  ['Gia Đạo Bình An', 'nha', 'Mong nhà bạn luôn hòa thuận, mạnh khỏe, vui cùng vui, khó cùng đỡ.', 'Gọi về nhà một cuộc, hỏi han vài câu thôi cũng đủ.'],
  ['Khổ Tận Cam Lai', 'an', 'Qua những ngày gian nan, mong bạn thấy được thành quả từ sự kiên trì của mình.', 'Nhìn lại một năm trước, bạn đã đi được xa hơn mình tưởng.'],
  ['Tri Kỷ Tương Phùng', 'ban', 'Mong bạn có một người bạn để kể cả chuyện vui lẫn chuyện buồn mà không phải giấu.', 'Nhắn cho người bạn lâu rồi chưa hỏi thăm.'],
  ['Buôn May Bán Đắt', 'tai', 'Mong cửa hàng lúc nào cũng có khách, hàng ra đều tay, ngày nào bán cũng vui.', 'Giữ chữ tín với khách cũ, khách mới sẽ theo sau.'],
  ['Bình An Vô Sự', 'an', 'Mong những ngày tới nhẹ nhàng, lo âu vơi dần, cuộc sống thuận hòa.', 'Việc gì chưa tới thì để tới rồi tính, đừng lo trước quá nhiều.'],
  ['Duyên Đến Đúng Lúc', 'duyen', 'Đừng vội vì cô đơn. Mong bạn gặp đúng người khi cả hai đã sẵn sàng thương nhau.', 'Lo cho mình thật tốt trong lúc chờ.'],
  ['Tích Tiểu Thành Đại', 'tai', 'Đồng tiền để dành hôm nay là nền cho ngày mai. Mong bạn bền bỉ và sớm chạm mục tiêu.', 'Trích ra một khoản nhỏ ngay khi nhận lương, dù chỉ ít thôi.'],
  ['Công Danh Thuận Lợi', 'viec', 'Mong công việc tiến triển tốt, năng lực được ghi nhận, cố gắng sớm có quả ngọt.', 'Làm xong việc thì nói cho người cần biết, đừng chỉ làm âm thầm.'],
  ['Phụ Mẫu An Khang', 'nha', 'Mong cha mẹ luôn khỏe, bớt nhọc nhằn, có nhiều thời gian vui vầy bên con cháu.', 'Đưa cha mẹ đi khám sức khỏe định kỳ năm nay.'],
  ['Ánh Sáng Cuối Đường', 'an', 'Dù hiện tại còn mờ mịt, mong bạn đủ niềm tin và bình tĩnh để tìm ra lối đi.', 'Chia việc lớn thành từng bước nhỏ, làm bước đầu ngay hôm nay.'],
  ['Tình Yêu Bền Chặt', 'duyen', 'Mong hai bạn luôn trân trọng nhau, qua được những lần bất đồng và giữ được sự dịu dàng thuở đầu.', 'Giận thì nói ra nhẹ nhàng, đừng để bụng lâu.'],
  ['Tâm Tĩnh Trí Sáng', 'an', 'Lòng bình tĩnh thì việc gì cũng dễ thấy rõ. Mong bạn sáng suốt trước những lựa chọn lớn.', 'Việc quan trọng thì ngủ một đêm rồi hãy quyết.'],
  ['Lộc Đến Từ Tâm', 'tai', 'Mong những nỗ lực thật lòng của bạn được đền đáp, tiền bạc đến từ việc làm ngay thẳng.', 'Đồng tiền sạch thì giữ được lâu.'],
  ['Bằng Hữu Tâm Giao', 'ban', 'Mong những tình bạn đẹp được giữ gìn bằng sự tin tưởng và quan tâm lẫn nhau.', 'Bạn bè cũng cần được hỏi thăm, đừng chỉ tìm khi có việc.'],
  ['Sự Nghiệp Thăng Hoa', 'viec', 'Mong bạn có cơ hội thử sức với việc mới và tiến gần hơn tới ước mơ của mình.', 'Học thêm một kỹ năng nhỏ mỗi tháng.'],
  ['Gia Hòa Vạn Sự Hưng', 'nha', 'Mong cả nhà biết nhường nhịn, lắng nghe nhau để mái ấm lúc nào cũng có tiếng cười.', 'Ăn chung một bữa cơm, cất điện thoại đi.'],
  ['Đào Hoa Nở Rộ', 'duyen', 'Mong bạn tự tin, cởi mở hơn và có nhiều dịp gặp gỡ những người khiến mình rung động.', 'Nhận lời một buổi hẹn cà phê, biết đâu đấy.'],
  ['Vạn Sự Tùy Duyên', 'an', 'Mong bạn cố hết sức với điều mình làm được, bình thản với điều không làm được.', 'Viết ra điều mình kiểm soát được, còn lại thì buông.'],
  ['Tiền Vào Có Lối', 'tai', 'Mong thu nhập ngày càng ổn định, chi tiêu hợp lý và lúc nào cũng có khoản dự phòng.', 'Để dành đủ ba tháng chi tiêu rồi hãy tính chuyện đầu tư.'],
  ['Khỏe Mạnh Trường An', 'khoe', 'Mong bạn và gia đình luôn khỏe, ăn ngon ngủ yên, có thật nhiều ngày vui bên nhau.', 'Đi bộ hai mươi phút mỗi ngày.'],
  ['Khai Trương Hồng Phát', 'tai', 'Mong việc làm ăn mở đầu suôn sẻ, gặp đúng khách và gây dựng được uy tín lâu dài.', 'Làm nhỏ mà chắc trước, lớn dần sau.'],
  ['Gặp Người Tử Tế', 'ban', 'Mong trên đường bạn đi có thêm người tốt, giúp đỡ và động viên đúng lúc.', 'Cảm ơn người đã giúp mình, dù là việc nhỏ.'],
  ['Tình Cũ Khép Lại', 'duyen', 'Mong bạn bình thản bước qua chuyện cũ, giữ lại bài học và mở lòng với hạnh phúc mới.', 'Bớt xem lại tin nhắn cũ, lòng sẽ nhẹ dần.'],
  ['Con Ngoan Trò Giỏi', 'hoc', 'Mong các con chăm ngoan, ham học, lớn lên khỏe mạnh và giữ được lòng thương người.', 'Khen con vì cố gắng, đừng chỉ khen vì điểm.'],
  ['Tài Chính Vững Vàng', 'tai', 'Mong bạn gỡ dần áp lực tiền bạc, quản lý tốt chi tiêu và yên tâm hơn về sau.', 'Trả khoản nợ lãi cao trước.'],
  ['Tâm Nguyện Viên Thành', 'an', 'Mong điều tốt bạn ước từng bước thành thật, nhờ sự bền bỉ và việc làm đúng.', 'Viết điều ước ra giấy, kèm một việc làm được ngay tuần này.'],
  ['An Nhiên Tự Tại', 'an', 'Mong bạn biết buông điều không đổi được, giữ lại bình yên cho chính mình.', 'Tắt thông báo điện thoại một buổi tối.'],
  ['Thuận Buồm Xuôi Gió', 'viec', 'Mong kế hoạch đang làm tiến triển suôn sẻ, trở ngại được gỡ dần, mục tiêu thành hình.', 'Mỗi tối ghi ba việc cần làm cho ngày mai.'],
  ['Tâm Đầu Ý Hợp', 'duyen', 'Mong bạn tìm được người nói chuyện hợp, biết sẻ chia và tôn trọng cả chỗ khác nhau.', 'Hợp nhau không có nghĩa là giống nhau hết.'],
  ['Lộc Nhỏ Thành Lớn', 'tai', 'Đừng coi thường cơ hội nhỏ. Mong bạn biết nắm lấy và vun dần thành quả lớn.', 'Việc nhỏ làm cho đàng hoàng, người ta sẽ giao việc lớn.'],
  ['Sum Họp Đoàn Viên', 'nha', 'Mong người thân ở xa sớm có dịp về, cả nhà ngồi chung một mâm cơm ấm.', 'Hẹn trước một ngày về thăm nhà, ghi vào lịch luôn.'],
  ['Hóa Giải Bất Hòa', 'nha', 'Mong hiểu lầm được gỡ bằng một lần nói chuyện thật lòng, để không ai còn nặng lòng.', 'Mở lời trước không phải là thua.'],
  ['Trí Tuệ Khai Mở', 'hoc', 'Mong bạn học được nhiều điều mới, nảy thêm ý hay và tìm ra hướng tốt cho mình.', 'Đọc mười trang sách mỗi ngày.'],
  ['Chuyển Mình Đổi Mới', 'viec', 'Mong bạn đủ can đảm đổi điều chưa hợp, đón cơ hội mới và lớn lên mỗi ngày.', 'Thay đổi nhỏ trước, đừng đổi hết một lúc.'],
  ['Thi Cử Đỗ Đạt', 'hoc', 'Mong bạn ôn bài vào đầu, vào phòng thi bình tĩnh, làm bài đúng sức mình.', 'Đêm trước ngày thi thì ngủ đủ, đừng thức học dồn.'],
  ['Hữu Duyên Thiên Lý', 'duyen', 'Mong những lần gặp gỡ đưa bạn tới gần người thật lòng, dù đường còn xa.', 'Yêu xa cần hẹn gặp rõ ràng, đừng để mãi là "khi nào rảnh".'],
  ['Phú Quý Tri Túc', 'tai', 'Mong bạn kiếm được tiền, giữ được tiền và vẫn còn thời gian sống vui bên người thân.', 'Biết thế nào là đủ thì tiền mới làm mình vui.'],
  ['Hợp Tác Thuận Hòa', 'viec', 'Mong bạn gặp đối tác đáng tin, làm ăn minh bạch, cùng nhau làm nên việc bền.', 'Chuyện tiền bạc với ai cũng nên ghi giấy rõ ràng.'],
  ['Tổ Ấm Yên Vui', 'nha', 'Mong nhà bạn luôn là chỗ bình yên để về, nơi được thương và được là chính mình.', 'Dọn một góc nhà cho gọn, lòng cũng gọn theo.'],
  ['Tình Bạn Bền Lâu', 'ban', 'Mong những người bạn thật lòng vẫn ở bên nhau, dù thời gian và khoảng cách đổi thay.', 'Rủ bạn cũ một buổi cà phê cuối tuần.'],
  ['Dưỡng Tâm Dưỡng Thân', 'khoe', 'Mong bạn biết thương chính mình, nghỉ đúng lúc và dành thời gian cho điều làm mình vui.', 'Mệt thì nghỉ, nghỉ không phải là lười.'],
  ['Trọn Đời Chung Bước', 'duyen', 'Mong tình yêu của hai bạn lớn lên mỗi ngày, cùng gánh vác và nắm tay qua sóng gió.', 'Chia việc nhà cho đều, bớt được nửa số lần cãi nhau.'],
  ['Phúc Khí Đầy Nhà', 'nha', 'Mong niềm vui ghé nhà thường xuyên, gia đình ấm áp, việc làm thuận lợi, lòng thanh thản.', 'Mở cửa cho nhà thoáng, cười nhiều hơn một chút.'],
  ['Thu Chi Cân Đối', 'tai', 'Mong bạn sáng suốt khi tiêu tiền, tránh quyết định vội và sống ngày càng ổn định.', 'Món nào trên một triệu thì chờ ba ngày rồi hãy mua.'],
  ['Công Thành Danh Toại', 'viec', 'Mong những tháng ngày miệt mài của bạn được ghi nhận, thành công đến từ chính sức mình.', 'Giữ sức khỏe, đường còn dài.'],
  ['Vạn Sự Bình Yên', 'an', 'Mong bạn đi đâu cũng bình an, về nhà luôn có người chờ, ngày nào cũng có điều đáng quý.', 'Đi đường chậm một chút, về tới nhà là được.'],
  ['Nhân Duyên Tốt Đẹp', 'ban', 'Mong bạn có những mối quan hệ lành, nơi mọi người tôn trọng và giúp nhau tiến lên.', 'Ở gần người tích cực, mình cũng tích cực theo.'],
  ['Thương Người Thương Mình', 'duyen', 'Mong bạn được thương đúng cách, và nhớ rằng mình cũng xứng đáng được quan tâm thật lòng.', 'Thương người nhưng đừng quên thương mình.'],
  ['Của Cải Bền Lâu', 'tai', 'Mong thành quả lao động của bạn được giữ gìn, tích lũy vững chắc, sống yên tâm lâu dài.', 'Đừng bỏ hết trứng vào một giỏ.'],
  ['Vợ Chồng Đồng Lòng', 'nha', 'Mong hai vợ chồng luôn sẻ chia, cùng gánh vác và giữ gìn hạnh phúc gia đình.', 'Chuyện lớn trong nhà thì bàn với nhau trước khi quyết.'],
  ['Mọi Điều Như Ý', 'an', 'Mong dự định chính đáng của bạn tiến triển thuận lợi, khó khăn nào cũng để lại bài học quý.', 'Làm hết sức, phần còn lại để thời gian lo.'],
  ['Nghề Nghiệp Ổn Định', 'viec', 'Mong bạn tìm được việc hợp với mình, lương xứng đáng và chỗ làm giúp mình lớn lên.', 'Sửa lại hồ sơ xin việc, nộp thêm vài chỗ tuần này.'],
  ['Tâm Sáng Như Gương', 'an', 'Mong lòng bạn trong sáng, không để chuyện buồn nhỏ che mất niềm vui sống.', 'Chuyện nhỏ thì cho qua, giữ sức cho chuyện lớn.'],
  ['Hạnh Phúc Giản Đơn', 'an', 'Mong bạn thấy vui từ những điều nhỏ, một bữa cơm chung hay một người hay hỏi han mình.', 'Tối nay kể ra ba điều làm bạn vui trong ngày.'],
  ['Lộc Từ Chăm Chỉ', 'viec', 'Mong sự cần cù của bạn mở ra nhiều cơ hội, ngày làm nào cũng tiến gần mục tiêu hơn.', 'Chăm chỉ đúng việc quan trọng hơn chăm chỉ nhiều việc.'],
  ['Xa Tiểu Nhân, Gần Hiền Hữu', 'ban', 'Mong bạn nhận ra người thật lòng và biết giữ khoảng cách với những mối quan hệ làm mình tổn thương.', 'Ai hay nói xấu người khác với bạn thì cũng sẽ nói xấu bạn.'],
  ['Phúc Thọ An Khang', 'khoe', 'Mong ông bà, cha mẹ và người bạn thương luôn khỏe, sống vui và được chăm sóc đủ đầy.', 'Nhắc người lớn trong nhà uống thuốc, tái khám đúng hẹn.'],
  ['Thành Công Bền Vững', 'viec', 'Mong bạn không chỉ làm tốt mà còn giữ được uy tín, sức khỏe và niềm vui với nghề.', 'Đừng đánh đổi sức khỏe lấy deadline mãi.'],
  ['Duyên Lành Gõ Cửa', 'duyen', 'Mong những lần gặp gỡ sắp tới mang lại sự ấm áp và một mối quan hệ đẹp.', 'Ăn mặc gọn gàng, cười nhiều, duyên tự tới.'],
  ['Con Cháu Hiếu Thuận', 'nha', 'Mong các thế hệ trong nhà biết thương nhau, kính trên nhường dưới.', 'Con cái học hiếu thảo từ cách mình đối xử với ông bà.'],
  ['Vững Tâm Bền Chí', 'viec', 'Mong bạn không mất niềm tin trước thử thách, đi từng bước và tự hào về đường mình đã đi.', 'Ngã thì đứng dậy, đổi cách làm chứ đừng đổi mục tiêu.'],
  ['Vượt Qua Thiếu Thốn', 'tai', 'Nếu đang kẹt tiền, mong bạn sớm tìm ra hướng đi và có người giúp đúng lúc.', 'Cắt bớt khoản chưa cần, nói thật với người thân để cùng tính.'],
  ['Ngày Mới An Lành', 'an', 'Mong sáng mai thức dậy, bạn có thêm hy vọng, thêm sức khỏe và thêm một lý do để cười.', 'Uống một ly nước ngay khi thức dậy.'],
  ['Nghĩa Tình Sâu Đậm', 'ban', 'Mong bạn luôn có người sẻ chia lúc khó, và chính bạn cũng là chỗ dựa cho người khác.', 'Hỏi thăm một người đang gặp chuyện buồn.'],
  ['Thời Cơ Rộng Mở', 'viec', 'Mong bạn tỉnh táo nhận ra đúng thời điểm, dám làm và đủ kiên nhẫn chờ kết quả.', 'Chuẩn bị sẵn, cơ hội tới mới kịp nắm.'],
  ['Tình Thâm Nghĩa Trọng', 'duyen', 'Mong hai bạn giữ lời hứa, đối xử tử tế và nhớ vì sao mình đã chọn nhau.', 'Nói cảm ơn với người bên cạnh, cả khi chuyện nhỏ.'],
  ['Gia Đình Hưng Thịnh', 'nha', 'Mong ai trong nhà cũng có việc ổn định và cùng nhau vun đắp cuộc sống đủ đầy.', 'Cả nhà cùng bàn một kế hoạch tiết kiệm chung.'],
  ['Buông Bỏ Muộn Phiền', 'an', 'Mong bạn nhẹ lòng tha thứ cho chuyện cũ, để dành sức cho hôm nay.', 'Tha thứ là để mình nhẹ người, không phải để người kia thắng.'],
  ['Cơ Hội Sinh Tài', 'tai', 'Mong bạn gặp cơ hội hợp sức mình, biết tính rủi ro và chọn thật sáng suốt.', 'Lời mời làm giàu nhanh quá thì cẩn thận.'],
  ['Mẹ Tròn Con Vuông', 'nha', 'Mong mẹ khỏe con khỏe, ngày vượt cạn bình an, cả nhà đón thêm niềm vui mới.', 'Khám thai đúng hẹn và nghe theo bác sĩ.'],
  ['Vạn Sự Khởi Đầu', 'viec', 'Đường dài nào cũng bắt đầu từ bước nhỏ. Mong bạn đủ dũng khí bắt tay vào điều mình ấp ủ.', 'Bắt đầu hôm nay, chưa hoàn hảo cũng được.'],
  ['Một Lòng Chung Thủy', 'duyen', 'Mong tình yêu được nuôi bằng sự tin tưởng, thật thà và quan tâm mỗi ngày.', 'Đừng giấu nhau chuyện tiền bạc.'],
  ['Bạn Hiền Đồng Hành', 'ban', 'Mong bạn tìm được người cùng chí hướng, cùng học và khích lệ nhau theo đuổi ước mơ.', 'Tham gia một nhóm cùng sở thích.'],
  ['Tài Lộc Đủ Đầy', 'tai', 'Mong bạn đủ sức lo cho gia đình, làm điều mình mơ và giúp người khác khi có thể.', 'Có dư thì giúp người, giúp xong đừng kể.'],
  ['Hiếu Nghĩa Vẹn Toàn', 'nha', 'Mong bạn đủ sức khỏe, thời gian và điều kiện để chăm sóc những người đã thương mình.', 'Về thăm ông bà khi còn có thể.'],
  ['Thiện Tâm Sinh Phúc', 'an', 'Mong lòng tốt của bạn lan tới nhiều người, cuộc sống có thêm những kết nối đẹp.', 'Làm một việc tốt nhỏ hôm nay, không cần ai biết.'],
  ['Đi Xa Gặp May', 'viec', 'Mong bạn đi làm xa hay đi học xa đều thuận lợi, gặp người tốt và sớm ổn định.', 'Giữ giấy tờ cẩn thận, gọi về nhà đều đặn.'],
  ['Lao Động Sinh Phúc', 'viec', 'Mong ngày làm nào cũng có ý nghĩa, công sức được trân trọng và đổi lại cuộc sống tốt hơn.', 'Tìm một điều mình thích trong công việc hiện tại.'],
  ['An Cư Lạc Nghiệp', 'nha', 'Mong bạn sớm có chốn ở yên ổn, nhà cửa vững vàng, công việc theo đó mà thuận.', 'Mua nhà thì xem kỹ giấy tờ, đừng vay quá sức trả.'],
  ['Hòa Thuận Anh Em', 'nha', 'Mong anh chị em trong nhà luôn gắn bó, bỏ qua chuyện nhỏ và giúp nhau khi cần.', 'Chuyện tiền bạc trong nhà cũng nên rõ ràng.'],
  ['Vững Bước Làm Giàu', 'tai', 'Mong bạn kiên nhẫn làm giàu bằng sức mình, không vì lợi trước mắt mà mất bình yên.', 'Không vay tiền để chơi những thứ mình không hiểu.'],
  ['Trời Quang Mây Tạnh', 'an', 'Mong chuyện làm bạn lo sớm có cách giải, trả lại những ngày bình yên.', 'Kể chuyện đang lo với một người tin được.'],
  ['Thân An Gia Lạc', 'khoe', 'Mong sức khỏe luôn bên bạn, gia đình hòa thuận, bữa cơm nào cũng rộn tiếng cười.', 'Bớt đồ ngọt, thêm rau xanh.'],
  ['Hoa Nở Trong Tim', 'duyen', 'Mong lòng bạn luôn có chỗ cho hy vọng, dù đang yêu, đang một mình hay vừa qua tổn thương.', 'Một mình cũng là lúc để hiểu mình hơn.'],
  ['Tâm Thành Gặp Thiện', 'ban', 'Mong sự chân thành của bạn được trân trọng, những lần gặp gỡ mang lại niềm vui.', 'Giữ lời hứa, dù là hứa nhỏ.'],
  ['Hành Trình May Mắn', 'an', 'Mong chuyến đi nào cũng an toàn, gặp gỡ nào cũng có ý nghĩa.', 'Kiểm tra xe và đội mũ bảo hiểm trước khi đi.'],
  ['Phúc Lộc Song Toàn', 'tai', 'Mong bạn có tiền đủ dùng, lại có sức khỏe và tình thân để tận hưởng cuộc sống.', 'Tiền là để sống vui, đừng để nó làm mình mệt.'],
  ['Khó Khăn Hóa Giải', 'viec', 'Nếu công việc đang bế tắc, mong bạn sớm tìm ra cách, giữ vững tinh thần, đừng bỏ cuộc.', 'Hỏi người đi trước, đỡ mất cả tháng tự mò.'],
  ['Trả Nợ Nhẹ Lòng', 'tai', 'Mong bạn trả dần được nợ nần, mỗi tháng nhẹ hơn một chút, sớm ngủ ngon trở lại.', 'Liệt kê hết khoản nợ, trả từng khoản, không vay mới để trả cũ.'],
  ['Phúc Ấm Gia Đường', 'nha', 'Mong nhà bạn giữ được lòng tử tế, đoàn kết và truyền điều tốt cho con cháu sau này.', 'Kể cho con nghe chuyện ông bà ngày xưa.'],
  ['Ước Mơ Nảy Mầm', 'viec', 'Mong ý tưởng bạn ấp ủ có dịp bắt đầu, được chăm từng ngày và dần thành hiện thực.', 'Dành ba mươi phút mỗi ngày cho ước mơ của mình.'],
  ['Một Đời Thanh Thản', 'an', 'Mong bạn sống đúng với điều mình tin, bớt so sánh và biết đủ để thấy vui.', 'Bớt lướt mạng xem đời người khác.'],
  ['Mong Con Như Ý', 'nha', 'Mong vợ chồng nào đang chờ con sớm được như ý, nhà cửa thêm tiếng trẻ nhỏ.', 'Đi khám cả hai vợ chồng, giữ tinh thần thoải mái.'],
  ['Bình Minh Hy Vọng', 'an', 'Ngày mới nào cũng là dịp bắt đầu lại. Mong bạn đủ dũng khí bước tiếp và đón điều tốt.', 'Hôm qua dở thì hôm nay làm lại.'],
  ['Cửu Cửu Viên Mãn', 'an', 'Mong bạn thân tâm an lạc, gia đình hạnh phúc, tình duyên thuận hòa, công việc vững và cuộc sống đủ đầy.', 'Giữ những gì đang tốt, sửa dần những gì chưa.'],
];

export const QUE: Que[] = Q.map(([ten, chude, loi, khuyen], i) => ({ so: i + 1, ten, chude, loi, khuyen }));

export const QUE_COUNT = QUE.length;

/** Số quẻ trong 1 chủ đề, để rút ngẫu nhiên theo chủ đề */
export function queOfTopic(topic: QueTopic) {
  return QUE.filter((q) => q.chude === topic);
}

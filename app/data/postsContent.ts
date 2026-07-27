export type Author = {
  name: string;
  avatar: string;
  role: string;
};

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading-2"; text: string }
  | { type: "heading-3"; text: string }
  | { type: "blockquote"; text: string; author?: string }
  | { type: "image"; url: string; caption: string }
  | { type: "tip-box"; title: string; text: string }
  | { type: "list"; items: string[] };

export type DetailedPost = {
  id: number;
  category: string;
  title: string;
  date: string;
  readTime: string;
  author: Author;
  image: string;
  summary: string;
  blocks: ContentBlock[];
  relatedPackageSlug?: string;
  seoDescription: string;
};

export const detailedPosts: Record<number, DetailedPost> = {
  1: {
    id: 1,
    category: "Cẩm nang",
    title: "48 giờ ở Hội An: lịch trình chậm, ẩm thực địa phương và ánh sáng phố cổ",
    date: "18/05/2026",
    readTime: "6 phút đọc",
    author: {
      name: "Lê Minh Dương",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
      role: "Travel Writer & Photographer"
    },
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=85",
    summary: "Một hành trình gọn gàng, thong thả dành cho những ai muốn cảm nhận trọn vẹn Hội An bình yên qua những ngõ nhỏ, thưởng thức ẩm thực bản địa đích thực và ngắm nhìn đèn lồng lung linh khi đêm về.",
    relatedPackageSlug: "hoi-an-di-cham",
    seoDescription: "Khám phá lịch trình du lịch Hội An 48 giờ tự túc cực chi tiết. Gợi ý điểm ăn uống địa phương như Cao lầu, Bánh mì Phượng, cà phê muối và lịch trình đi thuyền sông Hoài yên bình.",
    blocks: [
      {
        type: "paragraph",
        text: "Hội An không phải là nơi để vội vã. Những mảng tường vàng rêu phong, mái ngói âm dương xám xịt và nhịp sống của người dân nơi đây đòi hỏi bạn phải đi chậm lại, lắng nghe và quan sát. Dưới đây là lịch trình được tinh chỉnh kỹ lưỡng cho 2 ngày trọn vẹn để bạn cảm nhận Hội An một cách tinh tế nhất."
      },
      {
        type: "heading-2",
        text: "Ngày 1: Nhịp thở Phố cổ & Ánh sáng sông Hoài"
      },
      {
        type: "paragraph",
        text: "Hãy bắt đầu buổi sáng lúc 6:30. Đây là thời điểm vàng khi phố cổ chưa lên đèn, chưa có khách du lịch và các cửa hàng còn đóng cửa. Chỉ có tiếng chổi quét lá tre khô trên nền gạch, sương sớm mờ ảo và những cụ già đi bộ tập thể dục. Dạo bước qua ngõ chùa Cầu trong tĩnh lặng sẽ mang lại một cảm giác hoàn toàn khác biệt."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80",
        caption: "Bình minh yên bình trên những con phố tường vàng đặc trưng của Hội An."
      },
      {
        type: "paragraph",
        text: "Sau khi đi bộ dạo mát, hãy ghé quán bánh mì Phượng nổi tiếng hoặc làm một tô Cao lầu nóng hổi tại chợ Hội An. Ẩm thực Hội An mang hương vị đậm đà nhờ nguồn nước giếng Bá Lễ cổ xưa, tạo nên sợi mì Cao lầu có độ dai dòn đặc trưng không nơi nào sao chép được."
      },
      {
        type: "blockquote",
        text: "Sợi mì Cao lầu màu vàng nhạt, dẻo thơm, ăn kèm thịt xá xíu thái mỏng, da heo chiên giòn và các loại rau thơm Trà Quế là tinh hoa ẩm thực kết tinh từ hàng trăm năm giao thương của đô thị cổ này.",
        author: "Chuyên gia ẩm thực Nguyễn Nhã"
      },
      {
        type: "heading-3",
        text: "Chiều và tối: Trải nghiệm chèo thuyền và ngắm đèn lồng"
      },
      {
        type: "paragraph",
        text: "Khoảng 16:30, khi nắng bắt đầu dịu và chuyển sang màu vàng hổ phách, hãy di chuyển ra bến sông Hoài. Thuê một chiếc thuyền gỗ nhỏ của người dân bản địa, thả trôi theo dòng nước ngắm hoàng hôn buông xuống những mái nhà cổ kính. Khi màn đêm buông xuống, phố cổ bắt đầu lên đèn, hàng trăm chiếc đèn lồng giấy đủ màu sắc tỏa sáng lung linh soi bóng xuống dòng sông."
      },
      {
        type: "tip-box",
        title: "Lời khuyên từ TimesGreen",
        text: "Đừng mua đèn hoa đăng bằng nhựa thả xuống sông để bảo vệ môi trường. Hãy chọn những chiếc đèn làm hoàn toàn bằng giấy thủ công tự phân hủy được bán bởi các cụ già bên sông."
      },
      {
        type: "heading-2",
        text: "Ngày 2: Làng gốm Thanh Hà & Cà phê muối tĩnh lặng"
      },
      {
        type: "paragraph",
        text: "Buổi sáng ngày thứ hai, bạn có thể thuê xe đạp đi dọc sông Thu Bồn hướng về làng gốm Thanh Hà. Làng nghề hơn 500 năm tuổi này vẫn giữ cách chuốt gốm thủ công bằng bàn xoay chân đạp độc đáo. Bạn có thể tự tay nhào đất và tạo hình một món đồ lưu niệm nhỏ cho riêng mình."
      },
      {
        type: "list",
        items: [
          "Ghé quán Cafe Mót uống nước thảo mộc sả chanh thơm mát.",
          "Thưởng thức Cà phê muối tại những góc quán nhỏ ẩn sâu trong ngõ hẹp đường Trần Phú.",
          "Tham quan Nhà cổ Tấn Ký và nghe kể chuyện về những mùa nước lũ lịch sử."
        ]
      },
      {
        type: "paragraph",
        text: "Hội An đi chậm sẽ giúp tâm hồn bạn được nạp lại năng lượng. Đừng cố gắng đi hết tất cả các điểm trên bản đồ, hãy dành thời gian ngồi yên ở một góc ban công gỗ, uống trà và nhìn dòng người chậm rãi đi qua dưới bóng mát của những giàn hoa giấy hồng rực."
      }
    ]
  },
  2: {
    id: 2,
    category: "Biển đảo",
    title: "Phú Yên sau mùa nắng: những điểm dừng chân đáng đi trước khi đông khách",
    date: "14/05/2026",
    readTime: "5 phút đọc",
    author: {
      name: "Trần Hoài Nam",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      role: "Adventure Blogger"
    },
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    summary: "Phú Yên luôn mang vẻ đẹp nguyên sơ, kỳ vĩ của những vách đá đen kịt bên bờ đại dương xanh ngắt. Đi du lịch Phú Yên vào mùa chuyển mát mang lại trải nghiệm bình yên lạ thường.",
    relatedPackageSlug: "phu-yen-tuoi-tre-bien-xanh",
    seoDescription: "Kinh nghiệm du lịch Phú Yên tự túc với các điểm đến nổi tiếng: Gành Đá Đĩa, Mũi Điện đón bình minh đầu tiên, Bãi Xép lãng mạn và thưởng thức mắt cá ngừ đại dương độc đáo.",
    blocks: [
      {
        type: "paragraph",
        text: "Nằm nép mình giữa hai trung tâm du lịch lớn là Quy Nhơn và Nha Trang, xứ nẫu Phú Yên vẫn giữ được vẻ hoang sơ, mộc mạc nguyên bản. Nơi đây có những bãi biển cát trắng mịn dài vô tận không một bóng người, và những ghềnh đá núi lửa độc nhất vô nhị."
      },
      {
        type: "heading-2",
        text: "Những tọa độ không thể bỏ qua tại Phú Yên"
      },
      {
        type: "heading-3",
        text: "1. Ghềnh Đá Đĩa - Tuyệt tác kiến tạo núi lửa"
      },
      {
        type: "paragraph",
        text: "Được hình thành từ dòng dung nham đông đặc khi phun trào gặp nước biển lạnh từ hàng triệu năm trước, Ghềnh Đá Đĩa trông như một tổ ong khổng lồ bằng đá bazan đen óng ánh. Sóng biển xô vào vách đá tung bọt trắng xóa tạo nên một khung cảnh vô cùng ngoạn mục cho người yêu nhiếp ảnh."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        caption: "Bờ biển Phú Yên trong vắt lấp lánh dưới ánh nắng sớm."
      },
      {
        type: "heading-3",
        text: "2. Mũi Điện (Mũi Đại Lãnh) - Đón ánh bình minh đầu tiên"
      },
      {
        type: "paragraph",
        text: "Leo bộ khoảng 1km bậc thang đá lên ngọn hải đăng Mũi Điện lúc 5:00 sáng. Đứng trên vách đá cao, ngắm nhìn vầng mặt trời đỏ rực từ từ nhô lên khỏi đường chân trời rộng lớn của Thái Bình Dương. Cảm giác đón những tia nắng đầu tiên của ngày mới trên đất liền Việt Nam là trải nghiệm thiêng liêng và vô giá."
      },
      {
        type: "blockquote",
        text: "Đứng dưới chân hải đăng Mũi Đại Lãnh, ngóng mắt nhìn biển cả mênh mông xanh biếc và nghe tiếng gió lùa qua khe đá, bạn mới thấy quê hương mình đẹp đến nhường nào.",
        author: "Blogger Du lịch bụi Trần Hoài Nam"
      },
      {
        type: "heading-2",
        text: "Trải nghiệm ẩm thực xứ Nẫu đậm đà"
      },
      {
        type: "paragraph",
        text: "Ẩm thực Phú Yên cực kỳ rẻ và tươi ngon nhờ nguồn hải sản đánh bắt trong ngày phong phú. Đừng quên thử các món ăn độc lạ:"
      },
      {
        type: "list",
        items: [
          "Mắt cá ngừ đại dương tiềm thuốc bắc béo ngậy ăn kèm rau cải đắng.",
          "Bún mực nóng hổi ngọt thanh với những con mực cơm nhỏ giòn ngọt.",
          "Bánh hỏi lòng heo nóng sốt ăn kèm bát cháo lòng ấm bụng buổi sáng."
        ]
      },
      {
        type: "tip-box",
        title: "Thời điểm lý tưởng nhất",
        text: "Tháng 3 đến tháng 9 là mùa khô của Phú Yên, biển êm và nước xanh ngắt, rất thích hợp cho việc tắm biển, khám phá ghềnh đá và cắm trại qua đêm ven biển."
      }
    ]
  },
  3: {
    id: 3,
    category: "Núi rừng",
    title: "Đà Lạt ngoài trung tâm: homestay yên tĩnh, quán cà phê trong rừng và chợ phiên",
    date: "09/05/2026",
    readTime: "7 phút đọc",
    author: {
      name: "Hoàng Thu Trang",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      role: "Lifestyle Blogger"
    },
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    summary: "Bỏ qua tiếng còi xe ồn ào và khói bụi ở khu vực quanh Hồ Xuân Hương, Đà Lạt vẫn ẩn chứa những góc nhỏ ngập tràn thông reo, tiếng chim hót và sương mù lãng mạn ở vùng ngoại ô.",
    relatedPackageSlug: "da-lat-san-may",
    seoDescription: "Khám phá Đà Lạt vùng ngoại ô bình yên. Hướng dẫn săn mây tại đồi chè Cầu Đất, danh sách homestay view thung lũng thông reo và các quán cà phê gỗ mộc mạc ẩn trong rừng thông.",
    blocks: [
      {
        type: "paragraph",
        text: "Nhiều người nói Đà Lạt đã mất đi vẻ bình yên xưa cũ. Nhưng đó là khi họ chỉ quẩn quanh trung tâm thành phố. Chỉ cần di chuyển xa hơn khoảng 7-10km về hướng Trại Mát, Tà Nung hay Suối Vàng, bạn sẽ thấy một Đà Lạt mộc mạc, lạnh tê tái vào sáng sớm và thơm mùi nhựa thông ẩm ướt."
      },
      {
        type: "heading-2",
        text: "Hành trình trốn khói bụi đô thị"
      },
      {
        type: "paragraph",
        text: "Thay vì chọn các khách sạn hiện đại ngay trung tâm, hãy đặt phòng tại những căn homestay nhỏ bằng gỗ thông nằm lọt thỏm giữa sườn đồi. Thức dậy lúc 6h sáng, mở cửa sổ đón làn sương lạnh tràn vào phòng, lắng nghe tiếng rừng thông rì rào và ngắm nhìn thung lũng sương mù dày đặc phía dưới."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80",
        caption: "Một sớm đẫm sương trên những triền đồi ngập tràn hoa dại ngoại ô Đà Lạt."
      },
      {
        type: "heading-3",
        text: "Những quán cà phê ẩn mình dưới tán lá thông"
      },
      {
        type: "paragraph",
        text: "Đà Lạt là thiên đường của những quán cà phê đẹp, đặc biệt là những quán dựng hoàn toàn bằng gỗ cũ, không có cửa kính, mở rộng tầm mắt ra những cánh rừng bạt ngàn. Tại đây bạn có thể ngồi hàng giờ đọc một cuốn sách, nhâm nhi ly trà atiso nóng và ngắm hoàng hôn buông chậm rãi xuống đồi thông xanh."
      },
      {
        type: "blockquote",
        text: "Tiếng gió lùa qua kẽ lá thông, mùi gỗ ẩm ngấm nước mưa và hơi ấm từ ly cà phê đen nóng tạo nên một không gian thiền định, xoa dịu mọi áp lực thường nhật của người thành phố.",
        author: "Hoàng Thu Trang"
      },
      {
        type: "tip-box",
        title: "Góc trải nghiệm độc quyền",
        text: "Hãy đi chợ phiên rau củ Đà Lạt họp lúc sáng sớm tại các vùng ven đô. Bạn sẽ tìm thấy những củ khoai lang mật nướng nóng hổi, dâu tây vườn vừa hái còn đọng sương với mức giá vô cùng rẻ từ người nông dân."
      },
      {
        type: "heading-2",
        text: "Lưu ý nhỏ để chuyến đi trọn vẹn"
      },
      {
        type: "list",
        items: [
          "Chuẩn bị áo khoác ấm dày vì nhiệt độ vùng ngoại ô xuống thấp hơn trung tâm từ 2-3 độ C.",
          "Thuê xe máy số khỏe để dễ leo dốc đứng và đi đường đồi đất trơn trượt.",
          "Hạn chế xả rác tại các điểm check-in thiên nhiên tự phát để bảo vệ rừng thông sạch đẹp."
        ]
      }
    ]
  },
  4: {
    id: 4,
    category: "Gia đình",
    title: "Kỳ nghỉ ngắn ngày ở Ninh Bình cho gia đình có trẻ nhỏ",
    date: "04/05/2026",
    readTime: "8 phút đọc",
    author: {
      name: "Nguyễn Minh Châu",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      role: "Family Travel Planner"
    },
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85",
    summary: "Ninh Bình với những dòng sông uốn lượn hiền hòa, hang động mát lạnh và những cánh đồng lúa chín vàng rực rỡ là điểm đến hoàn hảo cho gia đình có trẻ em cần một chuyến đi thiên nhiên nhẹ nhàng.",
    relatedPackageSlug: "ninh-binh-cuoi-tuan",
    seoDescription: "Kế hoạch đi chơi Ninh Bình cuối tuần cho gia đình có trẻ nhỏ. Lịch trình chèo thuyền Tràng An mát mẻ, đạp xe quanh Tam Cốc và gợi ý khách sạn nghỉ dưỡng có khuôn viên rộng rãi.",
    blocks: [
      {
        type: "paragraph",
        text: "Chỉ cách Hà Nội chưa đầy 2 giờ lái xe, Ninh Bình nổi tiếng như một \"Hạ Long trên cạn\" với phong cảnh núi non trùng điệp đan xen sông nước. Đối với các gia đình có con nhỏ, Ninh Bình là lựa chọn tuyệt vời vì thời gian di chuyển ngắn, trẻ em được hòa mình vào thiên nhiên hoang dã mà không bị quá mệt mỏi."
      },
      {
        type: "heading-2",
        text: "Lịch trình nhẹ nhàng cho bé khám phá thiên nhiên"
      },
      {
        type: "heading-3",
        text: "Sáng: Đi thuyền Tràng An mát mẻ"
      },
      {
        type: "paragraph",
        text: "Hãy chọn tuyến chèo thuyền số 2 hoặc 3 ở Tràng An. Thuyền đi qua những hang động tự nhiên mát lạnh, bé sẽ vô cùng thích thú khi nhìn thấy thạch nhũ lấp lánh rủ xuống sát đầu. Những người chèo thuyền bản địa rất thân thiện, thường hát những làn điệu dân ca và chỉ cho các bé cách xem rêu xanh mọc dưới dòng nước trong vắt."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
        caption: "Ninh Bình nước non hữu tình nhìn từ trên cao xuống."
      },
      {
        type: "heading-3",
        text: "Chiều: Đạp xe thong thả quanh cánh đồng Tam Cốc"
      },
      {
        type: "paragraph",
        text: "Sau giờ nghỉ trưa ấm cúng, cả nhà có thể thuê xe đạp có ghế ngồi trẻ em tại homestay. Đạp xe dạo quanh những con đường nhỏ uốn lượn ven chân núi đá vôi, ngắm những cánh đồng lúa đang ngả vàng và ngửi mùi rơm rạ thơm nồng. Bé sẽ được nhìn thấy những đàn trâu gặm cỏ và hái hoa dại bên đường."
      },
      {
        type: "blockquote",
        text: "Cho trẻ tiếp xúc với không gian xanh rộng lớn, không tiếng ồn giao thông và không thiết bị điện tử sẽ kích thích trí tò mò, cải thiện giấc ngủ và mang cả nhà lại gần nhau hơn.",
        author: "Bác sĩ Nhi khoa Phạm Gia Anh"
      },
      {
        type: "tip-box",
        title: "Lựa chọn lưu trú thông minh",
        text: "Hãy chọn các khu resort sinh thái có khuôn viên cỏ rộng rãi, bể bơi nước ấm và nằm cách xa trục đường giao thông chính để các bé thỏa sức chạy nhảy tự do và an toàn."
      },
      {
        type: "heading-2",
        text: "Những vật dụng không thể thiếu cho bé"
      },
      {
        type: "list",
        items: [
          "Mũ rộng vành và kem chống nắng hữu cơ dịu nhẹ cho da bé.",
          "Xịt chống muỗi và côn trùng chiết xuất từ sả chanh tự nhiên.",
          "Nước uống đóng chai và một ít bánh ngọt ăn nhẹ dọc đường đi thuyền."
        ]
      }
    ]
  }
};

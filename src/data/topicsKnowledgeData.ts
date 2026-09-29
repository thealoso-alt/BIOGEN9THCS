export interface TopicKnowledgeContent {
  topicId: string;
  sections: {
    heading: string;
    paragraphs?: string[];
    bulletPoints?: string[];
    formulaBox?: {
      title: string;
      formulas: string[];
    };
    highlightBox?: string;
  }[];
}

export const TOPICS_KNOWLEDGE_BASE: Record<string, TopicKnowledgeContent> = {
  dna: {
    topicId: 'dna',
    sections: [
      {
        heading: '1. Tính chất hóa học & Nguyên tắc đa phân của DNA',
        paragraphs: [
          'Deoxyribonucleic acid (DNA) là đại phân tử hữu cơ cấu tạo theo nguyên tắc đa phân. Đơn phân là các nucleotide gồm 4 loại: Adenine (A), Thymine (T), Guanine (G) và Cytosine (C).',
          'Mỗi nucleotide gồm 3 thành phần: Nhóm phosphate (H3PO4 / PO4³⁻), đường deoxyribose (C5H10O4) và một trong 4 loại nitrogenous base (A, T, G, C). Trong đó A và G có kích thước lớn hơn (nhóm Purine - vòng kép), T và C có kích thước bé hơn (nhóm Pyrimidine - vòng đơn).',
        ],
        bulletPoints: [
          'Độ dài mỗi nucleotide: 3,4 Å (1 Å = 0,1 nm = 10^-4 μm).',
          'Khối lượng phân tử trung bình của 1 nucleotide: 300 amu (đvC).',
          'Các nucleotide trên cùng một mạch liên kết với nhau bằng liên kết cộng hoá trị phosphodiester bền vững giữa đường deoxyribose của nu này với nhóm phosphate của nu kế tiếp.',
        ],
        formulaBox: {
          title: 'Hệ thống công thức toán sinh trọng tâm về DNA chuẩn SGK',
          formulas: [
            'Tổng số nucleotide: N = 2A + 2G = 2T + 2C',
            'Chiều dài phân tử DNA: L = (N / 2) × 3,4 Å = (N / 2) × 0,34 nm',
            'Khối lượng phân tử DNA: M = N × 300 amu',
            'Số chu kỳ xoắn: C = N / 20 = L / 34 Å (mỗi chu kì cao 34 Å = 3,4 nm, gồm 10 cặp nucleotide)',
            'Tổng số liên kết hydrogen: H = 2A + 3G = 2T + 3C',
            'Tổng số liên kết cộng hoá trị phosphodiester giữa các nu: HT = 2N - 2 (trên 2 mạch)',
          ],
        },
      },
      {
        heading: '2. Cấu trúc không gian theo mô hình Watson - Crick (1953)',
        paragraphs: [
          'DNA là một chuỗi xoắn kép gồm hai mạch đơn polynucleotide song song và ngược chiều nhau (một mạch có chiều 3\'→5\', mạch kia có chiều 5\'→3\') xoắn đều quanh một trục tưởng tượng theo chiều từ trái sang phải (xoắn phải).',
          'Các nitrogenous base giữa hai mạch quay vào phía trong và liên kết với nhau bằng các liên kết hydrogen theo NGUYÊN TẮC BỔ SUNG:',
        ],
        bulletPoints: [
          'Adenine liên kết với Thymine bằng 2 liên kết hydrogen (A = T).',
          'Guanine liên kết với Cytosine bằng 3 liên kết hydrogen (G ≡ C).',
          'Đường kính chuỗi xoắn: 20 Å (2 nm). Chiều cao mỗi chu kỳ xoắn: 34 Å (3,4 nm), gồm đúng 10 cặp nucleotide. Khoảng cách giữa 2 cặp base kế tiếp: 3,4 Å (0,34 nm).',
        ],
        highlightBox:
          'Hệ quả nguyên tắc bổ sung: Trong phân tử DNA mạch kép luôn có A = T, G = C; suy ra A + G = T + C = 50% tổng số nu của DNA. Tỉ lệ (A+T)/(G+C) mang tính đặc trưng cho từng loài sinh vật.',
      },
      {
        heading: '3. Chức năng sinh học của DNA',
        paragraphs: [
          'Lưu giữ thông tin di truyền: Thông tin di truyền được mã hóa dưới dạng số lượng, thành phần và trật tự sắp xếp của các nucleotide trên phân tử DNA.',
          'Truyền đạt thông tin di truyền: Qua các thế hệ tế bào và cơ thể nhờ cơ chế tái bản (tự nhân đôi) của DNA trong quá trình phân bào, đảm bảo tính ổn định của loài.',
        ],
      },
    ],
  },
  gene: {
    topicId: 'gene',
    sections: [
      {
        heading: '1. Khái niệm & Bản chất hóa học của Gene',
        paragraphs: [
          'Gene là một đoạn của phân tử DNA mang thông tin mã hóa cho một sản phẩm xác định (sản phẩm đó có thể là một chuỗi polypeptide hoặc một phân tử RNA).',
          'Bản chất hóa học của gene chính là deoxyribonucleic acid (DNA). Một phân tử DNA chứa rất nhiều gene khác nhau.',
        ],
      },
      {
        heading: '2. Cấu trúc chung của một gene cấu trúc',
        paragraphs: [
          'Mỗi gene cấu trúc điển hình gồm 3 vùng kế tiếp nhau trên mạch mã gốc (chiều 3\'→5\'):',
        ],
        bulletPoints: [
          'Vùng điều hòa (Promoter - đầu 3\'): Nơi RNA polymerase bám vào khởi động phiên mã và điều hòa quá trình.',
          'Vùng mã hóa (Coding region): Mang thông tin mã hóa các amino acid. Ở sinh vật nhân thực, vùng mã hóa gồm các đoạn Exon (mã hóa) xen kẽ các đoạn Intron (không mã hóa) gọi là gene phân mảnh.',
          'Vùng kết thúc (Terminator - đầu 5\'): Chứa tín hiệu báo hiệu cho enzyme dừng phiên mã.',
        ],
      },
      {
        heading: '3. Mã di truyền (Genetic Code)',
        paragraphs: [
          'Mã di truyền là mã bộ ba (Codon): Cứ 3 nucleotide kế tiếp trên mạch mARN quy định 1 amino acid trên chuỗi polypeptide.',
          'Có 4^3 = 64 bộ ba mã hóa, trong đó:',
        ],
        bulletPoints: [
          'Bộ ba mở đầu: 5\' AUG 3\' (mã hóa amino acid Methionine ở sinh vật nhân thực).',
          '3 bộ ba kết thúc không mã hóa amino acid: 5\' UAA 3\', 5\' UAG 3\', 5\' UGA 3\'.',
          'Đặc điểm mã di truyền: Tính liên tục, tính phổ biến (hầu hết sinh vật dùng chung một bộ mã), tính đặc hiệu (1 bộ ba chỉ mã hóa 1 amino acid), và tính thoái hóa (nhiều bộ ba cùng mã hóa 1 amino acid).',
        ],
      },
    ],
  },
  rna: {
    topicId: 'rna',
    sections: [
      {
        heading: '1. Thành phần hóa học và cấu trúc của RNA',
        paragraphs: [
          'Ribonucleic acid (RNA) là đại phân tử hữu cơ cấu tạo theo nguyên tắc đa phân. Đơn phân là ribonucleotide gồm 4 loại: Adenine (A), Uracil (U), Guanine (G) và Cytosine (C).',
          'Điểm khác biệt căn bản so với DNA: RNA cấu tạo mạch đơn; đường là Ribose (C5H10O5); nitrogenous base Uracil (U) thay thế cho Thymine (T).',
        ],
      },
      {
        heading: '2. Phân loại và chức năng của 3 dạng RNA chính',
        paragraphs: ['Trong tế bào có 3 loại RNA chủ yếu:'],
        bulletPoints: [
          'mARN (RNA thông tin - 5% tổng lượng RNA): Mạch đơn dạng thẳng, làm khuôn trực tiếp cho quá trình dịch mã tổng hợp protein.',
          'tARN (RNA vận chuyển - 10-15% tổng lượng RNA): Cấu trúc cuộn thành hình lá chẽ ba. Một đầu mang bộ ba đối mã (Anticodon), một đầu gắn với amino acid đặc hiệu tương ứng.',
          'rARN (RNA ribosome - 70-80% tổng lượng RNA): Cấu trúc xoắn phức tạp, kết hợp với các phân tử protein tạo thành các tiểu đơn vị của Ribosome.',
        ],
      },
    ],
  },
  protein: {
    topicId: 'protein',
    sections: [
      {
        heading: '1. Thành phần hóa học và tính đa dạng của Protein',
        paragraphs: [
          'Protein là hợp chất hữu cơ quan trọng nhất cấu thành sự sống. Cấu tạo theo nguyên tắc đa phân, đơn phân là các amino acid. Tự nhiên có hơn 20 loại amino acid khác nhau.',
          'Mỗi amino acid gồm 3 nhóm: Nhóm amin (-NH2), nhóm cacboxyl (-COOH) và gốc R đặc trưng. Các amino acid nối với nhau bằng liên kết peptide (-CO-NH-) giải phóng 1 phân tử nước.',
        ],
      },
      {
        heading: '2. Bốn bậc cấu trúc không gian của Protein',
        paragraphs: [
          'Cấu trúc bậc 1: Chuỗi polypeptide dạng thẳng, quyết định toàn bộ cấu trúc các bậc sau.',
          'Cấu trúc bậc 2: Xoắn α hoặc gấp nếp β nhờ liên kết hydrogen giữa các liên kết peptide.',
          'Cấu trúc bậc 3: Cuộn xoắn không gian 3 chiều đặc thù quy định hoạt tính sinh học nhờ các liên kết disulfide (-S-S-), liên kết ion và tương tác kỵ nước.',
          'Cấu trúc bậc 4: Phối hợp từ hai hay nhiều chuỗi polypeptide (ví dụ: Hemoglobin gồm 4 chuỗi).',
        ],
        highlightBox:
          'Hiện tượng biến tính protein: Khi gặp nhiệt độ cao, pH cực đoan hoặc hóa chất mạnh, các liên kết yếu trong cấu trúc bậc 2, 3, 4 bị phá vỡ làm protein mất cấu hình không gian và mất hoàn toàn hoạt tính sinh học.',
      },
      {
        heading: '3. Chức năng đa dạng của Protein',
        paragraphs: [
          'Chức năng cấu trúc: Tạo nên màng sinh chất, tế bào chất, khung xương tế bào (collagen, keratin).',
          'Chức năng xúc tác: Hầu hết các enzyme sinh học là protein.',
          'Chức năng điều hòa: Các hormone điều hòa chuyển hóa cơ thể (insulin, glucagon).',
          'Chức năng bảo vệ: Các kháng thể (immunoglobulin) chống lại vi khuẩn, virus.',
        ],
      },
    ],
  },
  dna_replication: {
    topicId: 'dna_replication',
    sections: [
      {
        heading: '1. Vị trí, thời điểm và nguyên liệu nhân đôi DNA',
        paragraphs: [
          'Vị trí: Diễn ra chủ yếu trong nhân tế bào (ở sinh vật nhân thực) hoặc vùng nhân (ở sinh vật nhân sơ).',
          'Thời điểm: Diễn ra tại pha S của kỳ trung gian giữa 2 lần phân bào, chuẩn bị cho tế bào phân chia.',
          'Nguyên liệu: Phân tử DNA mẹ làm khuôn, các nucleotide tự do (A, T, G, C), hệ enzyme xúc tác và năng lượng ATP.',
        ],
      },
      {
        heading: '2. Các giai đoạn cơ bản của quá trình nhân đôi',
        paragraphs: [
          'Bước 1: Tháo xoắn phân tử DNA nhờ enzyme Helicase, bẻ gãy liên kết hydrogen tạo chạc chữ Y.',
          'Bước 2: Enzyme DNA polymerase tổng hợp mạch mới theo chiều 5\'→3\' (trên mạch khuôn 3\'→5\' tổng hợp liên tục; trên mạch khuôn 5\'→3\' tổng hợp ngắt quãng thành các đoạn Okazaki sau đó nối lại bởi Ligase).',
          'Bước 3: Tạo thành 2 phân tử DNA con giống hệt nhau và giống phân tử DNA mẹ.',
        ],
        bulletPoints: [
          'Trên mạch khuôn 3\'→5\': Mạch mới được tổng hợp liên tục hướng vào chạc chữ Y.',
          'Trên mạch khuôn 5\'→3\': Mạch mới được tổng hợp ngắt quãng ngược chiều tháo xoắn thành các đoạn Okazaki (1000 - 2000 nu), sau đó được enzyme nối Ligase hàn gắn.',
        ],
        formulaBox: {
          title: 'Công thức toán sinh Nhân đôi DNA chuẩn SGK',
          formulas: [
            'Từ 1 DNA ban đầu qua k lần nhân đôi: Tạo 2^k phân tử DNA con',
            'Số phân tử DNA con chứa hoàn toàn nguyên liệu mới: 2^k - 2',
            'Số nu tự do môi trường cung cấp: N_mt = N × (2^k - 1)',
            'Số nu từng loại môi trường cung cấp: A_mt = T_mt = A × (2^k - 1); G_mt = C_mt = G × (2^k - 1)',
          ],
        },
      },
      {
        heading: '3. Hai nguyên tắc bất biến của Nhân đôi DNA',
        paragraphs: [
          'Nguyên tắc bổ sung: Nucleotide trên mạch mới liên kết đặc hiệu với nucleotide trên mạch khuôn (A liên kết T bằng 2 liên kết hydrogen, G liên kết C bằng 3 liên kết hydrogen).',
          'Nguyên tắc bán bảo tồn (Semi-conservative): Trong mỗi phân tử DNA con được tạo thành luôn có 1 mạch cũ của DNA mẹ và 1 mạch mới được tổng hợp từ môi trường tế bào.',
        ],
      },
    ],
  },
  transcription: {
    topicId: 'transcription',
    sections: [
      {
        heading: '1. Khái niệm & Cơ chế Phiên mã (Transcription)',
        paragraphs: [
          'Phiên mã là quá trình tổng hợp phân tử RNA dựa trên khuôn mẫu của một đoạn phân tử DNA (gene). Diễn ra trong nhân tế bào tại kỳ trung gian.',
          'Enzyme chính tham gia phiên mã là RNA polymerase – có chức năng vừa tháo xoắn gene vừa lắp ráp nucleotide tự do.',
        ],
      },
      {
        heading: '2. Các diễn biến chi tiết',
        bulletPoints: [
          'Khởi đầu: RNA polymerase nhận biết và bám vào promoter ở đầu 3\' của mạch mã gốc trên DNA, tách 2 mạch.',
          'Kéo dài: RNA polymerase trượt theo chiều 3\'→5\' trên mạch gốc, tổng hợp mARN theo chiều 5\'→3\' theo nguyên tắc bổ sung: A_gốc ↔ U_mt, T_gốc ↔ A_mt, G_gốc ↔ C_mt, C_gốc ↔ G_mt.',
          'Kết thúc: Khi gặp tín hiệu kết thúc ở đầu 5\' mạch gốc, enzyme tách ra, mARN sơ khai được giải phóng.',
        ],
      },
    ],
  },
  translation: {
    topicId: 'translation',
    sections: [
      {
        heading: '1. Khái niệm & Thành phần tham gia Dịch mã',
        paragraphs: [
          'Dịch mã là quá trình chuyển đổi thông tin di truyền từ trình tự các bộ ba codon trên mARN thành trình tự các amino acid trong chuỗi polypeptide của protein.',
          'Diễn ra tại Ribosome trong tế bào chất.',
        ],
        bulletPoints: [
          'Khuôn mẫu: Phân tử mARN.',
          'Nguyên liệu: 20 loại amino acid tự do.',
          'Người vận chuyển: tARN mang bộ ba đối mã (anticodon).',
          'Bộ máy thực hiện: Ribosome gồm tiểu phần bé và tiểu phần lớn.',
        ],
      },
      {
        heading: '2. Cơ chế 2 bước của Dịch mã',
        paragraphs: [
          'Giai đoạn 1: Hoạt hóa amino acid: Amino acid kết hợp với ATP và gắn vào tARN tương ứng nhờ enzyme đặc hiệu.',
          'Giai đoạn 2: Tổng hợp chuỗi polypeptide:',
        ],
        bulletPoints: [
          'Mở đầu: Tiểu phần bé bám vào mARN tại codon mở đầu AUG. tARN mang Met tiến vào khớp anticodon UAC.',
          'Kéo dài: tARN thứ nhất mang amino acid 1 vào vị trí A. Hình thành liên kết peptide giữa Met và aa1. Ribosome dịch chuyển 1 codon (3 nu) sang vị trí kế tiếp.',
          'Kết thúc: Khi ribosome tiếp xúc codon kết thúc (UAA, UAG, UGA), chuỗi polypeptide tách ra và amino acid mở đầu Met bị cắt bỏ tạo protein hoàn chỉnh.',
        ],
      },
    ],
  },
  gene_mutation: {
    topicId: 'gene_mutation',
    sections: [
      {
        heading: '1. Định nghĩa & Các dạng Đột biến Gene',
        paragraphs: [
          'Đột biến gene là những biến đổi trong cấu trúc của gene liên quan đến một hoặc một số cặp nucleotide. Đột biến liên quan đến 1 cặp nu gọi là đột biến điểm.',
        ],
        bulletPoints: [
          'Thay thế 1 cặp nucleotide: Có thể làm biến đổi 1 amino acid (đột biến sai nghĩa) hoặc không làm biến đổi do mã thoái hóa (đột biến đồng nghĩa) hoặc tạo codon kết thúc sớm (đột biến vô nghĩa).',
          'Mất 1 cặp nucleotide: Gây đột biến dịch khung đọc mã từ vị trí mất về sau, làm thay đổi toàn bộ trình tự amino acid.',
          'Thêm 1 cặp nucleotide: Cũng gây đột biến dịch khung, làm thay đổi nghiêm trọng cấu trúc chuỗi polypeptide.',
        ],
      },
      {
        heading: '2. Nguyên nhân & Vai trò của Đột biến Gene',
        paragraphs: [
          'Nguyên nhân: Do tác nhân vật lý (tia tử ngoại UV, phóng xạ), tác nhân hóa học (5-BU, EMS) hoặc rối loạn sinh lý nội bào trong quá trình nhân đôi DNA.',
          'Vai trò: Là nguồn nguyên liệu sơ cấp dồi dào cho tiến hóa và chọn giống. Mặc dù phần lớn đột biến có hại cho cá thể, một số đột biến đem lại tính trạng có lợi hoặc trung tính thích nghi với môi trường mới.',
        ],
      },
    ],
  },
  chromosome: {
    topicId: 'chromosome',
    sections: [
      {
        heading: '1. Khái niệm & Hình thái Nhiễm sắc thể',
        paragraphs: [
          'Nhiễm sắc thể (NST) là cấu trúc mang vật chất di truyền nằm trong nhân tế bào, bắt màu kiềm tính mạnh khi nhuộm bằng thuốc nhuộm bazơ.',
          'Hình thái NST được quan sát rõ nhất dưới kính hiển vi quang học ở KỲ GIỮA của quá trình nguyên phân khi các NST co xoắn cực đại.',
        ],
        bulletPoints: [
          'Mỗi NST kép ở kỳ giữa gồm 2 cromatit (nhiễm sắc tử chị em) đính nhau tại tâm động (eo thứ nhất).',
          'Tâm động (Centromere): Nơi đính của thoi phân bào giúp NST di chuyển về các cực tế bào trong phân bào.',
          'Đầu mút (Telomere): Bảo vệ đầu mút NST và ngăn cản các NST dính vào nhau.',
        ],
      },
      {
        heading: '2. Cấu trúc siêu hiển vi của NST ở sinh vật nhân thực',
        paragraphs: [
          'Thành phần cấu tạo gồm phân tử DNA liên kết với protein loại histone:',
        ],
        bulletPoints: [
          'Đơn vị cơ bản: Nucleosome (146 cặp nu quấn 1 ¾ vòng quanh lõi gồm 8 phân tử histone).',
          'Sợi cơ bản: Đường kính 11 nm.',
          'Sợi nhiễm sắc: Đường kính 30 nm.',
          'Vùng xếp cuộn (quai xoắn): Đường kính 300 nm.',
          'Crômatit: Đường kính 700 nm.',
          'NST kỳ giữa: Đường kính 1400 nm.',
        ],
      },
    ],
  },
  chromosome_set: {
    topicId: 'chromosome_set',
    sections: [
      {
        heading: '1. Tính đặc trưng của Bộ Nhiễm sắc thể',
        paragraphs: [
          'Tế bào của mỗi loài sinh vật có một bộ nhiễm sắc thể đặc trưng về số lượng, hình thái và cấu trúc.',
          'Số lượng NST không phản ánh trình độ tiến hóa của loài (Ví dụ: Người 2n = 46, Ruồi giấm 2n = 8, Tinh tinh 2n = 48, Gà 2n = 78).',
        ],
      },
      {
        heading: '2. Bộ Lưỡng bội (2n) và Đơn bội (n)',
        bulletPoints: [
          'Bộ lưỡng bội (2n): Tồn tại trong các tế bào sinh dưỡng (xôma). Các NST tồn tại thành từng cặp tương đồng (một chiếc có nguồn gốc từ bố, một chiếc có nguồn gốc từ mẹ).',
          'Bộ đơn bội (n): Tồn tại trong giao tử (trứng, tinh trùng). Mỗi cặp tương đồng chỉ có duy nhất 1 chiếc.',
        ],
      },
    ],
  },
  mitosis: {
    topicId: 'mitosis',
    sections: [
      {
        heading: '1. Khái niệm & Ý nghĩa của Nguyên phân',
        paragraphs: [
          'Nguyên phân (Mitosis) là phương thức phân bào nguyên nhiễm xảy ra ở tế bào sinh dưỡng và tế bào sinh dục sơ khai.',
          'Từ 1 tế bào mẹ (2n) ban đầu qua một lần nguyên phân tạo ra 2 tế bào con có bộ NST giống hệt nhau và giống hệt tế bào mẹ (2n).',
        ],
      },
      {
        heading: '2. Diễn biến 4 kỳ của Nguyên phân',
        bulletPoints: [
          'Kỳ đầu: NST kép co xoắn; màng nhân và nhân con tiêu biến; thoi phân bào xuất hiện.',
          'Kỳ giữa: NST kép co xoắn cực đại và tập trung thành 1 hàng trên mặt phẳng xích đạo của thoi phân bào.',
          'Kỳ sau: Các cromatit tách nhau tại tâm động tạo thành các NST đơn và phân ly đều về 2 cực tế bào.',
          'Kỳ cuối: NST dãn xoắn; màng nhân tái lập; tế bào chất phân chia tạo 2 tế bào con 2n.',
        ],
        formulaBox: {
          title: 'Công thức toán sinh Nguyên phân',
          formulas: [
            'Số tế bào con tạo thành sau k lần nguyên phân: 2^k',
            'Số NST đơn môi trường cung cấp: 2n × (2^k - 1)',
            'Số NST đơn trong các tế bào con hoàn toàn mới: 2n × (2^k - 2)',
          ],
        },
      },
    ],
  },
  meiosis: {
    topicId: 'meiosis',
    sections: [
      {
        heading: '1. Khái niệm & Vị trí xảy ra Giảm phân',
        paragraphs: [
          'Giảm phân (Meiosis) là hình thức phân bào giảm nhiễm diễn ra ở tế bào sinh dục thời kỳ chín.',
          'Gồm 2 lần phân bào liên tiếp nhưng nhiễm sắc thể chỉ nhân đôi 1 lần ở kỳ trung gian trước giảm phân I.',
          'Kết quả: Từ 1 tế bào mẹ lưỡng bội (2n) tạo ra 4 tế bào con đơn bội (n) có số lượng NST giảm đi một nửa.',
        ],
      },
      {
        heading: '2. Điểm khác biệt mấu chốt giữa Giảm phân I và Giảm phân II',
        bulletPoints: [
          'Kỳ đầu I: Có hiện tượng tiếp hợp và trao đổi chéo giữa các cromatit không chị em trong cặp tương đồng tạo biến dị tổ hợp phong phú.',
          'Kỳ giữa I: Các cặp NST kép xếp thành 2 hàng trên mặt phẳng xích đạo (ở nguyên phân là 1 hàng).',
          'Kỳ sau I: Phân ly độc lập các NST kép về 2 cực tế bào (không chẻ dọc tâm động).',
          'Giảm phân II: Diễn ra tương tự như nguyên phân, các NST kép tách nhau tại tâm động phân ly về 2 cực.',
        ],
      },
    ],
  },
  sex_determination: {
    topicId: 'sex_determination',
    sections: [
      {
        heading: '1. Cặp Nhiễm sắc thể Giới tính',
        paragraphs: [
          'Trong tế bào lưỡng bội ngoài các cặp NST thường (Autosomes) còn có 1 cặp NST giới tính quy định giới tính đực/cái và các tính trạng liên kết giới tính.',
        ],
        bulletPoints: [
          'Ở người, động vật có vú, ruồi giấm: Nữ/Cái là XX (đồng giao tử), Nam/Đực là XY (dị giao tử).',
          'Ở chim, bướm, bò sát, ếch nhái: Cái là XY (hoặc ZW), Đực là XX (hoặc ZZ).',
        ],
      },
      {
        heading: '2. Cơ chế phân ly và thụ tinh tạo tỉ lệ 1 : 1',
        paragraphs: [
          'Mẹ (XX) chỉ sinh ra một loại trứng duy nhất mang NST X (100% X).',
          'Bố (XY) sinh ra 2 loại tinh trùng với tỉ lệ ngang nhau: 50% mang X và 50% mang Y.',
          'Khi thụ tinh ngẫu nhiên: Trứng (X) kết hợp với tinh trùng (X) tạo hợp tử XX (gái); trứng (X) kết hợp tinh trùng (Y) tạo hợp tử XY (trai). Do đó tỉ lệ sinh trai : gái xấp xỉ 1 : 1 ở quy mô quần thể lớn.',
        ],
      },
    ],
  },
  genetic_linkage: {
    topicId: 'genetic_linkage',
    sections: [
      {
        heading: '1. Thí nghiệm của Moocgan (T.H. Morgan)',
        paragraphs: [
          'Morgan cho lai ruồi giấm cái thân xám, cánh dài thuần chủng với ruồi đực thân đen, cánh cụt thuần chủng. F1 thu được 100% thân xám, cánh dài.',
          'Khi lai phân tích ruồi đực F1 (thân xám, cánh dài) với ruồi cái thân đen, cánh cụt: Fa thu được tỉ lệ đúng 1 thân xám, cánh dài : 1 thân đen, cánh cụt (không xuất hiện biến dị tổ hợp xám-cụt hay đen-dài).',
        ],
      },
      {
        heading: '2. Kết luận & Bản chất hiện tượng Liên kết gene',
        bulletPoints: [
          'Các gene quy định màu thân và độ dài cánh cùng nằm trên một nhiễm sắc thể.',
          'Trong quá trình giảm phân phát sinh giao tử, các gene này di truyền cùng nhau tạo thành một nhóm gene liên kết.',
          'Số nhóm gene liên kết ở mỗi loài bằng số lượng NST trong bộ đơn bội (n) của loài đó (Ví dụ: Ruồi giấm n = 4 có 4 nhóm liên kết; Người n = 23 có 23 nhóm liên kết).',
        ],
      },
    ],
  },
  chromosomal_mutation: {
    topicId: 'chromosomal_mutation',
    sections: [
      {
        heading: '1. Đột biến cấu trúc Nhiễm sắc thể',
        paragraphs: [
          'Là những biến đổi trong cấu trúc hình thái của NST. Gồm 4 dạng cơ bản:',
        ],
        bulletPoints: [
          'Mất đoạn: Một đoạn NST bị đứt và tiêu biến (Ví dụ: Mất đoạn nhánh ngắn NST số 5 gây hội chứng Cri-du-chat; mất đoạn nhỏ NST 21 gây ung thư máu).',
          'Lặp đoạn: Một đoạn NST được lặp lại một hay nhiều lần (Ví dụ: Lặp đoạn ở lúa mạch tăng hoạt tính enzyme amilaza).',
          'Đảo đoạn: Đoạn NST đứt ra rồi quay 180 độ và gắn lại.',
          'Chuyển đoạn: Trao đổi đoạn giữa 2 NST không tương đồng (Ví dụ: Chuyển đoạn giữa NST 9 và 22 gây bệnh bạch cầu tủy mạn tính).',
        ],
      },
      {
        heading: '2. Đột biến số lượng Nhiễm sắc thể',
        paragraphs: [
          'Biến đổi liên quan đến số lượng một hoặc một số cặp NST (Dị bội) hoặc toàn bộ bộ NST (Đa bội):',
        ],
        bulletPoints: [
          'Thể ba nhiễm (2n + 1): Có 3 chiếc ở 1 cặp NST. Ví dụ: Hội chứng Down ở người do có 3 NST số 21 (2n + 1 = 47).',
          'Thể một nhiễm (2n - 1): Chỉ có 1 chiếc ở 1 cặp NST. Ví dụ: Hội chứng Turner ở nữ chỉ có 1 NST X (XO, 2n - 1 = 45).',
          'Thể đa bội (3n, 4n): Bộ NST tăng lên theo bội số của n. Thường gặp ở thực vật cho năng suất cao, quả to không hạt (dưa hấu 3n, nho tam bội).',
        ],
      },
    ],
  },
  mendel: {
    topicId: 'mendel',
    sections: [
      {
        heading: '1. Khái quát về Di truyền học & Thí nghiệm của Mendel (Bài 36)',
        paragraphs: [
          'Di truyền học là khoa học nghiên cứu về tính di truyền và biến dị ở các sinh vật. Hiện tượng di truyền và biến dị do nhân tố di truyền nằm trong tế bào (sau này gọi là gene) quy định, do đó gene được xem là trung tâm của di truyền học.',
          'Grego Johann Mendel (1822 – 1884) là người đầu tiên vận dụng phương pháp khoa học vào nghiên cứu di truyền trên đối tượng đậu hà lan (Pisum sativum) có đặc điểm tự thụ phấn nghiêm ngặt.',
        ],
        bulletPoints: [
          'Tính trạng: Là đặc điểm về hình thái, cấu tạo, sinh lí của một cơ thể.',
          'Tính trạng tương phản: Hai trạng thái biểu hiện trái ngược nhau của cùng một loại tính trạng (hạt vàng ✕ hạt xanh, vỏ trơn ✕ vỏ nhăn, hoa tím ✕ hoa trắng, thân cao ✕ thân thấp).',
          'Kiểu hình: Tổ hợp toàn bộ tính trạng của cơ thể sinh vật.',
          'Kiểu gene: Tổ hợp toàn bộ gene trong tế bào của cơ thể sinh vật.',
          'Dòng thuần (thuần chủng): Đồng hợp về tất cả các cặp gene nghiên cứu, các thế hệ sau sinh ra đồng nhất và giống bố mẹ.',
        ],
        highlightBox:
          'Kí hiệu nghiên cứu di truyền: P: cặp bố mẹ xuất phát; ✕: phép lai; G: giao tử; F: thế hệ con (F1, F2...); ♀: con cái; ♂: con đực.',
      },
      {
        heading: '2. Các quy luật di truyền của Mendel (Bài 37)',
        paragraphs: [
          'Thí nghiệm lai một tính trạng màu hoa (Hình 37.1): P thuần chủng hoa tím (AA) ✕ hoa trắng (aa) ➔ F1 100% cây hoa tím (Aa). F1 tự thụ phấn ➔ F2 phân tính theo tỉ lệ 3 cây hoa tím : 1 cây hoa trắng (tỉ lệ kiểu gene: 1 AA : 2 Aa : 1 aa).',
          'Nội dung quy luật phân li: Mỗi tính trạng do một cặp nhân tố di truyền (cặp allele) quy định. Khi giảm phân hình thành giao tử, các allele trong cặp phân li đồng đều về các giao tử nên mỗi giao tử chỉ chứa một allele của cặp.',
        ],
        bulletPoints: [
          'Phép lai phân tích (Hình 37.2): Lai giữa cơ thể mang tính trạng trội chưa biết kiểu gene với cơ thể mang tính trạng lặn (aa). Nếu con lai 100% trội ➔ cơ thể trội có kiểu gene đồng hợp (AA). Nếu con lai phân tính 1 trội : 1 lặn ➔ cơ thể trội có kiểu gene dị hợp (Aa).',
          'Quy luật phân li độc lập (Hình 37.3): Lai hai tính trạng hạt vàng trơn (AABB) ✕ xanh nhăn (aabb) ➔ F1 100% vàng trơn (AaBb) ➔ F2 cho 16 tổ hợp với 4 loại kiểu hình: 9 Vàng trơn (A-B-) : 3 Vàng nhăn (A-bb) : 3 Xanh trơn (aaB-) : 1 Xanh nhăn (aabb).',
        ],
        formulaBox: {
          title: 'Hệ thống công thức quy luật di truyền Mendel',
          formulas: [
            'Lai 1 cặp dị hợp: Aa ✕ Aa ➔ KG: 1/4 AA : 2/4 Aa : 1/4 aa (KH: 3/4 trội : 1/4 lặn)',
            'Lai phân tích: Aa ✕ aa ➔ 1/2 Aa (trội) : 1/2 aa (lặn)',
            'Lai 2 cặp dị hợp độc lập: AaBb ✕ AaBb ➔ KH: (3 : 1)(3 : 1) = 9 : 3 : 3 : 1',
            'Số loại giao tử của cơ thể dị hợp n cặp gene: 2^n',
            'Số loại tổ hợp giao tử ở F2 khi lai 2 cơ thể dị hợp n cặp gene: 4^n',
            'Số loại kiểu hình ở F2: 2^n (với tính trạng trội hoàn toàn)',
          ],
        },
      },
    ],
  },
};

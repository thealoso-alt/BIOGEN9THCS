export interface SoloQuestionMCQ {
  id: string;
  type: 'multiple_choice';
  questionNumber: number;
  question: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topicTitle: string;
}

export interface SoloQuestionTF {
  id: string;
  type: 'true_false';
  questionNumber: number;
  question: string;
  correctAnswer: boolean; // true = Đúng, false = Sai
  explanation: string;
  topicTitle: string;
}

export type SoloChallengeQuestion = SoloQuestionMCQ | SoloQuestionTF;

// PHẦN THỬ THÁCH ĐƠN: ĐÚNG 15 CÂU HỎI (10 CÂU 4 ĐÁP ÁN + 5 CÂU ĐÚNG SAI)
export const SOLO_CHALLENGE_QUESTIONS: SoloChallengeQuestion[] = [
  // --- 10 CÂU 4 ĐÁP ÁN (CÂU 1 -> CÂU 10) ---
  {
    id: 'solo_mcq_1',
    type: 'multiple_choice',
    questionNumber: 1,
    topicTitle: 'Cấu trúc DNA',
    question: 'Theo mô hình Watson – Crick, đường kính của chuỗi xoắn kép DNA và chiều cao của mỗi chu kì xoắn lần lượt là bao nhiêu?',
    options: [
      { id: 'A', text: 'Đường kính 2 nm (20 Å) và chu kì xoắn cao 3,4 nm (34 Å)' },
      { id: 'B', text: 'Đường kính 3,4 nm (34 Å) và chu kì xoắn cao 2 nm (20 Å)' },
      { id: 'C', text: 'Đường kính 20 nm (200 Å) và chu kì xoắn cao 34 nm (340 Å)' },
      { id: 'D', text: 'Đường kính 1 nm (10 Å) và chu kì xoắn cao 3,4 nm (34 Å)' },
    ],
    correctAnswer: 'A',
    explanation: 'Theo SGK KHTN 9 Bài 38: Chuỗi xoắn kép DNA có đường kính 20 Å (tương đương 2 nm); mỗi chu kì xoắn gồm 10 cặp nucleotide có chiều cao 34 Å (tương đương 3,4 nm).',
  },
  {
    id: 'solo_mcq_2',
    type: 'multiple_choice',
    questionNumber: 2,
    topicTitle: 'Nguyên tắc bổ sung trong DNA',
    question: 'Trong cấu trúc chuỗi xoắn kép DNA, các nitrogenous base giữa hai mạch đơn liên kết với nhau theo nguyên tắc bổ sung như thế nào?',
    options: [
      { id: 'A', text: 'A liên kết với T bằng 3 liên kết hydrogen, G liên kết với C bằng 2 liên kết hydrogen' },
      { id: 'B', text: 'A liên kết với T bằng 2 liên kết hydrogen, G liên kết với C bằng 3 liên kết hydrogen' },
      { id: 'C', text: 'A liên kết với U bằng 2 liên kết hydrogen, G liên kết với C bằng 3 liên kết hydrogen' },
      { id: 'D', text: 'A liên kết với C bằng 2 liên kết hydrogen, G liên kết với T bằng 3 liên kết hydrogen' },
    ],
    correctAnswer: 'B',
    explanation: 'Theo nguyên tắc bổ sung của Watson – Crick: Adenine (A) liên kết với Thymine (T) bằng 2 liên kết hydrogen; Guanine (G) liên kết với Cytosine (C) bằng 3 liên kết hydrogen.',
  },
  {
    id: 'solo_mcq_3',
    type: 'multiple_choice',
    questionNumber: 3,
    topicTitle: 'Cấu tạo RNA',
    question: 'Điểm khác biệt căn bản về thành phần hóa học giữa phân tử RNA và phân tử DNA là gì?',
    options: [
      { id: 'A', text: 'RNA có đường ribose (C5H10O5) và base Uracil (U) thay cho Thymine (T)' },
      { id: 'B', text: 'RNA có đường deoxyribose (C5H10O4) và base Uracil (U) thay cho Thymine (T)' },
      { id: 'C', text: 'RNA có đường ribose (C5H10O5) và base Thymine (T) thay cho Uracil (U)' },
      { id: 'D', text: 'RNA có 2 mạch xoắn kép còn DNA có cấu tạo 1 mạch đơn' },
    ],
    correctAnswer: 'A',
    explanation: 'RNA là phân tử mạch đơn, đường pentose cấu tạo là ribose (C5H10O5) và có 4 loại base A, U, G, C (Uracil thay cho Thymine trong DNA).',
  },
  {
    id: 'solo_mcq_4',
    type: 'multiple_choice',
    questionNumber: 4,
    topicTitle: 'Chức năng các loại RNA',
    question: 'Phân tử RNA nào mang bộ ba đối mã (anticodon) và làm nhiệm vụ vận chuyển amino acid tới ribosome trong quá trình dịch mã?',
    options: [
      { id: 'A', text: 'mRNA (RNA thông tin)' },
      { id: 'B', text: 'tRNA (RNA vận chuyển)' },
      { id: 'C', text: 'rRNA (RNA ribosome)' },
      { id: 'D', text: 'snRNA (RNA nhỏ trong nhân)' },
    ],
    correctAnswer: 'B',
    explanation: 'tRNA (transfer RNA) có cấu trúc cuộn 3 thùy, một đầu gắn với amino acid đặc hiệu và một thùy mang bộ ba đối mã (anticodon) khớp bổ sung với codon trên mRNA.',
  },
  {
    id: 'solo_mcq_5',
    type: 'multiple_choice',
    questionNumber: 5,
    topicTitle: 'Cấu trúc Protein',
    question: 'Cấu trúc bậc 1 của protein được đặc trưng bởi liên kết hóa học nào giữa các amino acid trong chuỗi polypeptide?',
    options: [
      { id: 'A', text: 'Liên kết hydrogen' },
      { id: 'B', text: 'Liên kết peptide (-CO-NH-)' },
      { id: 'C', text: 'Liên kết disulfide (-S-S-)' },
      { id: 'D', text: 'Liên kết cộng hoá trị phosphodiester' },
    ],
    correctAnswer: 'B',
    explanation: 'Cấu trúc bậc 1 là trình tự sắp xếp các amino acid nối với nhau bằng các liên kết peptide (-CO-NH-), quyết định tính đặc thù và các bậc cấu trúc cao hơn.',
  },
  {
    id: 'solo_mcq_6',
    type: 'multiple_choice',
    questionNumber: 6,
    topicTitle: 'Tái bản DNA',
    question: 'Quá trình tái bản DNA diễn ra theo hai nguyên tắc cốt lõi nào?',
    options: [
      { id: 'A', text: 'Nguyên tắc bổ sung và nguyên tắc bán bảo tồn' },
      { id: 'B', text: 'Nguyên tắc bảo tồn và nguyên tắc gián đoạn' },
      { id: 'C', text: 'Nguyên tắc đa phân và nguyên tắc phiên mã ngược' },
      { id: 'D', text: 'Nguyên tắc bổ sung và nguyên tắc phân li độc lập' },
    ],
    correctAnswer: 'A',
    explanation: 'Tái bản DNA tuân theo: Nguyên tắc bổ sung (A-T, G-C) và Nguyên tắc bán bảo tồn (semi-conservative: mỗi DNA con có 1 mạch cũ của mẹ và 1 mạch mới tổng hợp).',
  },
  {
    id: 'solo_mcq_7',
    type: 'multiple_choice',
    questionNumber: 7,
    topicTitle: 'Cơ chế Phiên mã',
    question: 'Trong quá trình phiên mã, enzyme RNA polymerase di chuyển trên mạch khuôn của gene theo chiều nào và tổng hợp mạch mRNA mới theo chiều nào?',
    options: [
      { id: 'A', text: 'Trượt trên mạch khuôn theo chiều 3\' → 5\' và tổng hợp mRNA theo chiều 5\' → 3\'' },
      { id: 'B', text: 'Trượt trên mạch khuôn theo chiều 5\' → 3\' và tổng hợp mRNA theo chiều 3\' → 5\'' },
      { id: 'C', text: 'Trượt trên cả 2 mạch khuôn đồng thời theo chiều 3\' → 5\'' },
      { id: 'D', text: 'Trượt ngắt quãng theo cả hai chiều tùy theo vị trí promoter' },
    ],
    correctAnswer: 'A',
    explanation: 'RNA polymerase chỉ tổng hợp mạch mới theo chiều 5\' → 3\', do đó nó phải đọc mạch khuôn DNA theo chiều 3\' → 5\'.',
  },
  {
    id: 'solo_mcq_8',
    type: 'multiple_choice',
    questionNumber: 8,
    topicTitle: 'Mã di truyền & Dịch mã',
    question: 'Codon nào trên phân tử mRNA đóng vai trò là bộ ba mở đầu quy định amino acid Methionine (Met) ở sinh vật nhân thực?',
    options: [
      { id: 'A', text: '5\'-UAA-3\'' },
      { id: 'B', text: '5\'-UAG-3\'' },
      { id: 'C', text: '5\'-AUG-3\'' },
      { id: 'D', text: '5\'-UGA-3\'' },
    ],
    correctAnswer: 'C',
    explanation: '5\'-AUG-3\' là codon mở đầu duy nhất trên mRNA, mã hóa amino acid Methionine ở sinh vật nhân thực (hoặc Formylmethionine ở nhân sơ).',
  },
  {
    id: 'solo_mcq_9',
    type: 'multiple_choice',
    questionNumber: 9,
    topicTitle: 'Đột biến Gene',
    question: 'Một đột biến điểm thay thế một cặp A – T bằng một cặp G – C trong phân tử DNA sẽ làm số liên kết hydrogen của gene thay đổi như thế nào?',
    options: [
      { id: 'A', text: 'Giảm 1 liên kết hydrogen' },
      { id: 'B', text: 'Tăng 1 liên kết hydrogen' },
      { id: 'C', text: 'Tăng 2 liên kết hydrogen' },
      { id: 'D', text: 'Không làm thay đổi số liên kết hydrogen' },
    ],
    correctAnswer: 'B',
    explanation: 'Cặp A-T có 2 liên kết hydrogen, cặp G-C có 3 liên kết hydrogen. Khi thay A-T bằng G-C, số liên kết hydrogen tăng: 3 - 2 = +1 liên kết.',
  },
  {
    id: 'solo_mcq_10',
    type: 'multiple_choice',
    questionNumber: 10,
    topicTitle: 'Quy luật di truyền Mendel',
    question: 'Khi lai phân tích một cá thể mang kiểu hình hoa tím (trội) với cá thể mang kiểu hình hoa trắng (lặn aa), nếu đời con phân li tỉ lệ 1 tím : 1 trắng thì cá thể hoa tím ban đầu có kiểu gene là gì?',
    options: [
      { id: 'A', text: 'Đồng hợp trội (AA)' },
      { id: 'B', text: 'Dị hợp (Aa)' },
      { id: 'C', text: 'Đồng hợp lặn (aa)' },
      { id: 'D', text: 'Không xác định được kiểu gene' },
    ],
    correctAnswer: 'B',
    explanation: 'Phép lai phân tích Aa × aa cho đời con 1 Aa (tím) : 1 aa (trắng). Do đó cá thể đem lai là dị hợp tử Aa. Nếu là AA × aa thì 100% con sẽ là hoa tím (Aa).',
  },

  // --- 5 CÂU ĐÚNG SAI (CÂU 11 -> CÂU 15) ---
  {
    id: 'solo_tf_11',
    type: 'true_false',
    questionNumber: 11,
    topicTitle: 'Hệ quả nguyên tắc bổ sung DNA',
    question: 'Trong mọi phân tử DNA mạch kép, tỉ lệ tổng số base (A + G) luôn luôn bằng tỉ lệ tổng số base (T + C) ở bất kì loài sinh vật nào.',
    correctAnswer: true,
    explanation: 'ĐÚNG. Theo nguyên tắc bổ sung: A = T và G = C nên luôn có A + G = T + C = 50% tổng số nucleotide của phân tử DNA mạch kép.',
  },
  {
    id: 'solo_tf_12',
    type: 'true_false',
    questionNumber: 12,
    topicTitle: 'Vị trí dịch mã',
    question: 'Quá trình dịch mã tổng hợp chuỗi polypeptide diễn ra bên trong nhân tế bào ngay trên khuôn mẫu của phân tử DNA.',
    correctAnswer: false,
    explanation: 'SAI. Quá trình dịch mã diễn ra tại bào quan Ribosome ở tế bào chất, sử dụng phân tử mRNA làm khuôn mẫu (chứ không diễn ra trong nhân và không dùng trực tiếp DNA).',
  },
  {
    id: 'solo_tf_13',
    type: 'true_false',
    questionNumber: 13,
    topicTitle: 'Hậu quả đột biến gene',
    question: 'Đột biến mất hoặc thêm một cặp nucleotide trong vùng mã hóa của gene thường làm thay đổi nhiều amino acid hơn so với đột biến thay thế một cặp nucleotide.',
    correctAnswer: true,
    explanation: 'ĐÚNG. Đột biến thêm hoặc mất 1 cặp nucleotide làm dịch khung đọc mã di truyền (frameshift mutation) từ vị trí xảy ra đột biến đến hết gene, làm thay đổi toàn bộ các amino acid phía sau.',
  },
  {
    id: 'solo_tf_14',
    type: 'true_false',
    questionNumber: 14,
    topicTitle: 'Kích thước chu kì xoắn DNA',
    question: 'Mỗi chu kì xoắn của phân tử DNA theo mô hình Watson – Crick dài 3,4 nm và chứa đúng 20 cặp nucleotide.',
    correctAnswer: false,
    explanation: 'SAI. Mỗi chu kì xoắn cao 3,4 nm (34 Å) chứa đúng 10 CẶP nucleotide (tức 20 nucleotide đơn), không phải 20 cặp.',
  },
  {
    id: 'solo_tf_15',
    type: 'true_false',
    questionNumber: 15,
    topicTitle: 'Nguyên tắc bán bảo tồn',
    question: 'Nguyên tắc bán bảo tồn trong tái bản DNA có nghĩa là trong mỗi phân tử DNA con được tạo thành luôn có một mạch của DNA mẹ ban đầu và một mạch mới được tổng hợp.',
    correctAnswer: true,
    explanation: 'ĐÚNG. "Bán bảo tồn" (semi-conservative) tức là giữ lại một nửa: mỗi phân tử DNA con gồm 1 mạch cũ từ DNA mẹ và 1 mạch mới tổng hợp từ nucleotide tự do của môi trường tế bào.',
  },
];

// --- KHO CÂU HỎI ĐẤU TRƯỜNG THỜI GIAN THỰC (RANDOM BATTLE QUESTION POOL) ---
export interface BattlePoolQuestion {
  id: string;
  topic: string;
  question: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export const BATTLE_QUESTIONS_POOL: BattlePoolQuestion[] = [
  {
    id: 'bp_1',
    topic: 'Cấu trúc DNA',
    question: 'Trong phân tử DNA, Guanine (G) liên kết với Cytosine (C) bằng bao nhiêu liên kết hydrogen?',
    options: [
      { id: 'A', text: '1 liên kết' },
      { id: 'B', text: '2 liên kết' },
      { id: 'C', text: '3 liên kết' },
      { id: 'D', text: '4 liên kết' },
    ],
    correct: 'C',
    explanation: 'G liên kết với C bằng 3 liên kết hydrogen bền vững.',
  },
  {
    id: 'bp_2',
    topic: 'Phân bào nguyên phân',
    question: 'Ở kì nào của quá trình nguyên phân, các nhiễm sắc thể kép co xoắn cực đại và xếp thành một hàng trên mặt phẳng xích đạo?',
    options: [
      { id: 'A', text: 'Kì đầu (Prophase)' },
      { id: 'B', text: 'Kì giữa (Metaphase)' },
      { id: 'C', text: 'Kì sau (Anaphase)' },
      { id: 'D', text: 'Kì cuối (Telophase)' },
    ],
    correct: 'B',
    explanation: 'Ở kì giữa, các NST kép đóng xoắn tối đa và xếp thành 1 hàng trên mặt phẳng xích đạo.',
  },
  {
    id: 'bp_3',
    topic: 'Di truyền học Mendel',
    question: 'Khi cho hai cây đậu Hà Lan thuần chủng hoa tím (AA) lai với hoa trắng (aa), thế hệ F1 thu được kết quả kiểu hình là gì?',
    options: [
      { id: 'A', text: '100% Cây hoa tím' },
      { id: 'B', text: '100% Cây hoa trắng' },
      { id: 'C', text: '50% hoa tím : 50% hoa trắng' },
      { id: 'D', text: '75% hoa tím : 25% hoa trắng' },
    ],
    correct: 'A',
    explanation: 'P thuần chủng AA × aa cho 100% F1 có kiểu gene Aa biểu hiện kiểu hình hoa tím.',
  },
  {
    id: 'bp_4',
    topic: 'Cấu tạo RNA',
    question: 'Loại nitrogenous base nào chỉ có trong phân tử RNA mà không có trong phân tử DNA?',
    options: [
      { id: 'A', text: 'Adenine (A)' },
      { id: 'B', text: 'Thymine (T)' },
      { id: 'C', text: 'Uracil (U)' },
      { id: 'D', text: 'Guanine (G)' },
    ],
    correct: 'C',
    explanation: 'Uracil (U) chỉ có ở RNA, thay thế cho Thymine (T) trong DNA.',
  },
  {
    id: 'bp_5',
    topic: 'Mã di truyền',
    question: 'Bộ ba nào sau đây KHÔNG PHẢI là codon kết thúc dịch mã trên phân tử mRNA?',
    options: [
      { id: 'A', text: 'UAA' },
      { id: 'B', text: 'UAG' },
      { id: 'C', text: 'UGA' },
      { id: 'D', text: 'AUG' },
    ],
    correct: 'D',
    explanation: 'AUG là codon mở đầu mã hóa Methionine. Ba codon kết thúc là UAA, UAG, UGA.',
  },
  {
    id: 'bp_6',
    topic: 'Tái bản DNA',
    question: 'Một phân tử DNA thực hiện nhân đôi liên tiếp 3 lần sẽ tạo ra tổng cộng bao nhiêu phân tử DNA con?',
    options: [
      { id: 'A', text: '4 phân tử' },
      { id: 'B', text: '6 phân tử' },
      { id: 'C', text: '8 phân tử' },
      { id: 'D', text: '16 phân tử' },
    ],
    correct: 'C',
    explanation: 'Số phân tử DNA con tạo thành sau k lần nhân đôi = 2^k = 2^3 = 8 phân tử.',
  },
  {
    id: 'bp_7',
    topic: 'Bộ nhiễm sắc thể',
    question: 'Bộ nhiễm sắc thể lưỡng bội (2n) ở người bình thường gồm bao nhiêu chiếc nhiễm sắc thể?',
    options: [
      { id: 'A', text: '23 chiếc' },
      { id: 'B', text: '46 chiếc' },
      { id: 'C', text: '48 chiếc' },
      { id: 'D', text: '92 chiếc' },
    ],
    correct: 'B',
    explanation: 'Bộ NST lưỡng bội của người có 2n = 46 chiếc (23 cặp).',
  },
  {
    id: 'bp_8',
    topic: 'Đột biến Gene',
    question: 'Bệnh thiếu máu hồng cầu hình liềm (HbS) ở người là do dạng đột biến gene nào gây nên?',
    options: [
      { id: 'A', text: 'Mất một cặp nucleotide' },
      { id: 'B', text: 'Thêm một cặp nucleotide' },
      { id: 'C', text: 'Thay thế cặp T - A thành cặp A - T' },
      { id: 'D', text: 'Đảo đoạn nhiễm sắc thể' },
    ],
    correct: 'C',
    explanation: 'Theo SGK Hình 41.2: Đột biến thay thế cặp T-A bằng A-T làm thay đổi codon mã hóa axit glutamic thành valine trên chuỗi beta-globin.',
  },
  {
    id: 'bp_9',
    topic: 'Liên kết di truyền Morgan',
    question: 'Nhà khoa học Thomas Hunt Morgan đã phát hiện ra hiện tượng di truyền liên kết trên đối tượng sinh vật nào?',
    options: [
      { id: 'A', text: 'Đậu Hà Lan (Pisum sativum)' },
      { id: 'B', text: 'Ruồi giấm (Drosophila melanogaster)' },
      { id: 'C', text: 'Chuột bạch' },
      { id: 'D', text: 'Vi khuẩn E. coli' },
    ],
    correct: 'B',
    explanation: 'Morgan thực hiện các công trình nghiên cứu di truyền kinh điển trên ruồi giấm (Drosophila melanogaster).',
  },
  {
    id: 'bp_10',
    topic: 'Di truyền giới tính',
    question: 'Ở người và các loài thú, cặp nhiễm sắc thể giới tính ở giới đực và giới cái lần lượt có dạng là gì?',
    options: [
      { id: 'A', text: 'Giới đực là XX, giới cái là XY' },
      { id: 'B', text: 'Giới đực là XY, giới cái là XX' },
      { id: 'C', text: 'Giới đực là ZZ, giới cái là ZW' },
      { id: 'D', text: 'Giới đực là XO, giới cái là XX' },
    ],
    correct: 'B',
    explanation: 'Ở người và động vật có vú, nữ (cái) có cặp NST giới tính tương đồng XX, nam (đực) có cặp không tương đồng XY.',
  },
  {
    id: 'bp_11',
    topic: 'Toán sinh học DNA',
    question: 'Một phân tử DNA có 2000 nucleotide, trong đó Adenine (A) = 400 nu. Số lượng nucleotide loại Guanine (G) là bao nhiêu?',
    options: [
      { id: 'A', text: '400 nucleotide' },
      { id: 'B', text: '600 nucleotide' },
      { id: 'C', text: '800 nucleotide' },
      { id: 'D', text: '1200 nucleotide' },
    ],
    correct: 'B',
    explanation: 'Tổng A + G = N / 2 = 1000. Suy ra G = 1000 - 400 = 600 nucleotide.',
  },
  {
    id: 'bp_12',
    topic: 'Ứng dụng sinh học',
    question: 'Kĩ thuật nhân bản hàng triệu bản sao đoạn DNA trong ống nghiệm ở các mức nhiệt độ 95°C, 55°C, 72°C có tên gọi là gì?',
    options: [
      { id: 'A', text: 'Kĩ thuật ELISA' },
      { id: 'B', text: 'Kĩ thuật điện di gel' },
      { id: 'C', text: 'Kĩ thuật PCR (Polymerase Chain Reaction)' },
      { id: 'D', text: 'Kĩ thuật lai Western Blot' },
    ],
    correct: 'C',
    explanation: 'Hình 39.3 SGK KHTN 9 giới thiệu kĩ thuật PCR (phản ứng chuỗi polymerase) mô phỏng tái bản DNA.',
  },
  {
    id: 'bp_13',
    topic: 'Cấu trúc Protein',
    question: 'Cấu trúc xoắn alpha (α) và phiến gấp beta (β) là đặc trưng của bậc cấu trúc nào trong phân tử protein?',
    options: [
      { id: 'A', text: 'Cấu trúc bậc 1' },
      { id: 'B', text: 'Cấu trúc bậc 2' },
      { id: 'C', text: 'Cấu trúc bậc 3' },
      { id: 'D', text: 'Cấu trúc bậc 4' },
    ],
    correct: 'B',
    explanation: 'Cấu trúc bậc 2 là chuỗi polypeptide cuộn xoắn lò xo α hoặc gấp nếp β nhờ các liên kết hydrogen giữa các nhóm peptide.',
  },
  {
    id: 'bp_14',
    topic: 'Giảm phân hình thành giao tử',
    question: 'Hiện tượng trao đổi chéo giữa các chromatid khác nguồn trong cặp nhiễm sắc thể tương đồng diễn ra ở kì nào?',
    options: [
      { id: 'A', text: 'Kì đầu của Giảm phân I (Prophase I)' },
      { id: 'B', text: 'Kì giữa của Giảm phân I' },
      { id: 'C', text: 'Kì sau của Giảm phân II' },
      { id: 'D', text: 'Kì đầu của Giảm phân II' },
    ],
    correct: 'A',
    explanation: 'Ở kì đầu I, các NST tương đồng tiếp hợp và có thể trao đổi đoạn chéo tạo nên các tổ hợp gene mới (hoán vị gene).',
  },
  {
    id: 'bp_15',
    topic: 'Di truyền liên kết',
    question: 'Khi các gene cùng nằm trên một cặp nhiễm sắc thể di truyền cùng nhau qua các thế hệ tế bào, hiện tượng này gọi là gì?',
    options: [
      { id: 'A', text: 'Phân li độc lập' },
      { id: 'B', text: 'Di truyền liên kết hoàn toàn' },
      { id: 'C', text: 'Tương tác bổ sung' },
      { id: 'D', text: 'Đột biến cấu trúc' },
    ],
    correct: 'B',
    explanation: 'Di truyền liên kết là hiện tượng một nhóm gene cùng nằm trên một NST cùng phân li về một giao tử trong phân bào.',
  },
  {
    id: 'bp_16',
    topic: 'Quy luật Mendel',
    question: 'Trong phép lai phân tích cá thể dị hợp 2 cặp gene AaBb × aabb, tỉ lệ phân li kiểu hình ở đời con là gì?',
    options: [
      { id: 'A', text: '9 : 3 : 3 : 1' },
      { id: 'B', text: '3 : 1' },
      { id: 'C', text: '1 : 1 : 1 : 1' },
      { id: 'D', text: '1 : 2 : 1' },
    ],
    correct: 'C',
    explanation: 'AaBb cho 4 loại giao tử tỉ lệ 1:1:1:1 kết hợp với giao tử ab cho đời con tỉ lệ 1 AaBb : 1 Aabb : 1 aaBb : 1 aabb.',
  },
  {
    id: 'bp_17',
    topic: 'Cấu tạo RNA',
    question: 'Đường pentose cấu tạo nên các ribonucleotide của phân tử RNA có công thức phân tử là gì?',
    options: [
      { id: 'A', text: 'C5H10O4 (Deoxyribose)' },
      { id: 'B', text: 'C5H10O5 (Ribose)' },
      { id: 'C', text: 'C6H12O6 (Glucose)' },
      { id: 'D', text: 'C12H22O11 (Sucrose)' },
    ],
    correct: 'B',
    explanation: 'Đường cấu tạo của RNA là ribose có công thức hóa học C5H10O5, nhiều hơn đường deoxyribose (C5H10O4) 1 nguyên tử oxy.',
  },
  {
    id: 'bp_18',
    topic: 'Đột biến nhiễm sắc thể',
    question: 'Hội chứng Down ở người là do dạng đột biến số lượng nhiễm sắc thể nào gây nên?',
    options: [
      { id: 'A', text: 'Thể một (2n - 1) ở cặp số 21' },
      { id: 'B', text: 'Thể ba (2n + 1) ở cặp số 21 (có 3 NST số 21)' },
      { id: 'C', text: 'Mất một chiếc NST giới tính X (XO)' },
      { id: 'D', text: 'Thừa một chiếc NST giới tính (XXY)' },
    ],
    correct: 'B',
    explanation: 'Hội chứng Down do đột biến dị bội: cặp NST số 21 có 3 chiếc thay vì 2 chiếc (thể ba 2n + 1 = 47 NST).',
  },
  {
    id: 'bp_19',
    topic: 'Nguyên phân',
    question: 'Trong chu kì tế bào, sự nhân đôi phân tử DNA và nhân đôi nhiễm sắc thể diễn ra tại thời điểm nào?',
    options: [
      { id: 'A', text: 'Pha S của kì trung gian' },
      { id: 'B', text: 'Kì đầu của nguyên phân' },
      { id: 'C', text: 'Pha G2 của kì trung gian' },
      { id: 'D', text: 'Kì giữa của nguyên phân' },
    ],
    correct: 'A',
    explanation: 'Tại pha S (Synthesis) của kì trung gian, phân tử DNA tự nhân đôi, từ đó mỗi NST đơn trở thành 1 NST kép gồm 2 chromatid.',
  },
  {
    id: 'bp_20',
    topic: 'Dịch mã',
    question: 'Enzyme và bào quan trực tiếp thực hiện quá trình dịch mã tổng hợp chuỗi polypeptide là gì?',
    options: [
      { id: 'A', text: 'Bào quan Ribosome' },
      { id: 'B', text: 'Ti thể (Mitochondria)' },
      { id: 'C', text: 'Bộ máy Golgi' },
      { id: 'D', text: 'Lưới nội chất trơn' },
    ],
    correct: 'A',
    explanation: 'Ribosome là nơi dịch mã thông tin từ mRNA thành trình tự amino acid của chuỗi polypeptide.',
  },
  {
    id: 'bp_21',
    topic: 'Cấu trúc DNA',
    question: 'Mỗi chu kì xoắn của phân tử DNA theo mô hình Watson – Crick dài bao nhiêu nm?',
    options: [
      { id: 'A', text: '2 nm (20 Å)' },
      { id: 'B', text: '3,4 nm (34 Å)' },
      { id: 'C', text: '0,34 nm (3,4 Å)' },
      { id: 'D', text: '34 nm (340 Å)' },
    ],
    correct: 'B',
    explanation: 'Mỗi chu kì xoắn của DNA cao 3,4 nm (34 Å) gồm đúng 10 cặp nucleotide.',
  },
  {
    id: 'bp_22',
    topic: 'Di truyền người',
    question: 'Người có bộ nhiễm sắc thể gồm 45 chiếc, trong đó chỉ có 1 nhiễm sắc thể giới tính X (cặp giới tính dạng XO) mắc hội chứng gì?',
    options: [
      { id: 'A', text: 'Hội chứng Klinefelter (XXY)' },
      { id: 'B', text: 'Hội chứng Turner (XO)' },
      { id: 'C', text: 'Hội chứng Down' },
      { id: 'D', text: 'Bệnh máu khó đông' },
    ],
    correct: 'B',
    explanation: 'Hội chứng Turner (XO, 2n - 1 = 45) biểu hiện ở nữ giới: lùn, cổ ngắn, tuyến vú không phát triển và mất khả năng sinh sản.',
  },
  {
    id: 'bp_23',
    topic: 'Mã di truyền',
    question: 'Có bao nhiêu codon trong bảng mã di truyền thực sự mã hóa các amino acid (không tính 3 codon kết thúc)?',
    options: [
      { id: 'A', text: '64 bộ ba' },
      { id: 'B', text: '61 bộ ba' },
      { id: 'C', text: '20 bộ ba' },
      { id: 'D', text: '16 bộ ba' },
    ],
    correct: 'B',
    explanation: 'Trong tổng số 4³ = 64 codon mã di truyền, có 3 codon kết thúc (UAA, UAG, UGA) không mã hóa amino acid, nên còn lại 61 codon mã hóa.',
  },
  {
    id: 'bp_24',
    topic: 'Tái bản DNA',
    question: 'Đặc điểm nào sau đây chứng minh tính bán bảo tồn trong tái bản DNA?',
    options: [
      { id: 'A', text: 'Mỗi phân tử DNA con tạo ra giữ lại một mạch khuôn của DNA mẹ' },
      { id: 'B', text: 'Cả hai mạch mới đều được tổng hợp liên tục' },
      { id: 'C', text: 'Hai phân tử DNA con có cấu trúc khác hoàn toàn DNA mẹ' },
      { id: 'D', text: 'Một DNA con giữ nguyên cả 2 mạch cũ, một DNA con có 2 mạch mới' },
    ],
    correct: 'A',
    explanation: 'Bán bảo tồn (bảo tồn một nửa): trong mỗi DNA con luôn có 1 mạch cũ của mẹ và 1 mạch mới tổng hợp từ nucleotide tự do.',
  },
  {
    id: 'bp_25',
    topic: 'Mức xoắn NST',
    question: 'Đơn vị cấu trúc cơ bản của nhiễm sắc thể gồm lõi 8 phân tử histone được quấn quanh bởi 146 cặp nucleotide DNA gọi là gì?',
    options: [
      { id: 'A', text: 'Nucleosome' },
      { id: 'B', text: 'Chromatid' },
      { id: 'C', text: 'Centromere' },
      { id: 'D', text: 'Telomere' },
    ],
    correct: 'A',
    explanation: 'Nucleosome là đơn vị cấu trúc hạt cơ bản của chất nhiễm sắc (đường kính 11 nm).',
  },
];

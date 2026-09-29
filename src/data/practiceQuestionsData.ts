export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple_choice';
  question: string;
  options: string[]; // exactly 4 options (A, B, C, D)
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string;
}

export interface TrueFalseQuestion {
  id: string;
  type: 'true_false';
  question: string;
  correctAnswer: boolean; // true = Đúng, false = Sai
  explanation: string;
}

export type PracticeQuestion = MultipleChoiceQuestion | TrueFalseQuestion;

export interface TopicQuestionBank {
  topicId: string;
  multipleChoice: MultipleChoiceQuestion[];
  trueFalse: TrueFalseQuestion[];
}

export const TOPIC_QUESTION_BANKS: Record<string, TopicQuestionBank> = {
  // 1. Cấu trúc & Chức năng DNA
  dna: {
    topicId: 'dna',
    multipleChoice: [
      {
        id: 'dna_mc_1',
        type: 'multiple_choice',
        question: 'Đơn phân cấu trúc cơ bản cấu tạo nên đại phân tử DNA là gì?',
        options: ['A. Amino acid', 'B. Nucleotide', 'C. Glucose', 'D. Acid béo'],
        correctAnswer: 1,
        explanation: 'DNA là đại phân tử sinh học cấu tạo theo nguyên tắc đa phân, đơn vị cấu trúc cơ bản là các nucleotide.',
      },
      {
        id: 'dna_mc_2',
        type: 'multiple_choice',
        question: 'Mỗi đơn phân nucleotide của DNA có cấu tạo gồm 3 thành phần chính là:',
        options: [
          'A. Đường ribose, nhóm phosphate và base nitơ',
          'B. Đường deoxyribose, nhóm phosphate và base nitơ',
          'C. Đường glucose, acid amin và base nitơ',
          'D. Glycerol, nhóm phosphate và base nitơ'
        ],
        correctAnswer: 1,
        explanation: 'Mỗi nucleotide cấu tạo gồm 1 phân tử đường deoxyribose (C5H10O4), 1 nhóm phosphate và 1 trong 4 loại base nitơ (A, T, G, C).',
      },
      {
        id: 'dna_mc_3',
        type: 'multiple_choice',
        question: 'Theo mô hình Watson - Crick, giữa hai mạch đơn của DNA, các nucleotide bắt cặp bổ sung với nhau qua loại liên kết nào?',
        options: [
          'A. Liên kết peptide',
          'B. Liên kết cộng hóa trị phosphodiester',
          'C. Liên kết hydrogen',
          'D. Liên kết ion tĩnh điện'
        ],
        correctAnswer: 2,
        explanation: 'Hai mạch liên kết theo nguyên tắc bổ sung bằng liên kết hydrogen: A-T bằng 2 liên kết, G-C bằng 3 liên kết.',
      },
      {
        id: 'dna_mc_4',
        type: 'multiple_choice',
        question: 'Một chu kỳ xoắn của phân tử DNA dạng B có chiều dài và số cặp nucleotide tương ứng là:',
        options: [
          'A. 34 Å và 10 cặp nucleotide',
          'B. 20 Å và 10 cặp nucleotide',
          'C. 3,4 Å và 20 cặp nucleotide',
          'D. 34 Å và 20 cặp nucleotide'
        ],
        correctAnswer: 0,
        explanation: 'Mỗi chu kỳ xoắn của DNA dài 34 Å (3,4 nm), gồm đúng 10 cặp nucleotide (20 nucleotide), đường kính vòng xoắn là 20 Å.',
      },
      {
        id: 'dna_mc_5',
        type: 'multiple_choice',
        question: 'Phân tử DNA có tính đa dạng và đặc thù cho mỗi loài sinh vật chủ yếu do yếu tố nào quyết định?',
        options: [
          'A. Khối lượng và số lượng liên kết hydro giữa 2 mạch',
          'B. Số lượng, thành phần và trật tự sắp xếp các nucleotide',
          'C. Chiều xoắn từ trái sang phải theo chu kỳ',
          'D. Khung đường - phosphate phân bố ở mặt ngoài'
        ],
        correctAnswer: 1,
        explanation: 'Tính đa dạng và đặc thù của DNA được quy định bởi số lượng, thành phần và đặc biệt là trật tự sắp xếp của 4 loại nucleotide.',
      },
      {
        id: 'dna_mc_6',
        type: 'multiple_choice',
        question: 'Chức năng sinh học quan trọng nhất của phân tử DNA đối với sự sống là:',
        options: [
          'A. Trực tiếp xúc tác cho các phản ứng sinh hóa',
          'B. Lưu giữ, bảo quản và truyền đạt thông tin di truyền',
          'C. Cung cấp năng lượng ATP cho tế bào',
          'D. Vận chuyển các chất qua màng sinh chất'
        ],
        correctAnswer: 1,
        explanation: 'DNA mang thông tin di truyền dưới dạng trình tự nucleotide, đảm nhiệm lưu giữ, bảo quản và truyền đạt thông tin di truyền.',
      },
      {
        id: 'dna_mc_7',
        type: 'multiple_choice',
        question: 'Một phân tử DNA có 3000 nucleotide. Chiều dài (L) của phân tử DNA này là bao nhiêu Ångström (Å)?',
        options: ['A. 10200 Å', 'B. 5100 Å', 'C. 2550 Å', 'D. 4080 Å'],
        correctAnswer: 1,
        explanation: 'Chiều dài phân tử DNA: L = (N / 2) × 3,4 Å = (3000 / 2) × 3,4 = 1500 × 3,4 = 5100 Å.',
      },
      {
        id: 'dna_mc_8',
        type: 'multiple_choice',
        question: 'Trên một mạch đơn của DNA, các nucleotide kế tiếp nhau liên kết với nhau bằng loại liên kết nào?',
        options: [
          'A. Liên kết hydrogen',
          'B. Liên kết phosphodiester (cộng hóa trị)',
          'C. Liên kết peptide',
          'D. Liên kết kỵ nước'
        ],
        correctAnswer: 1,
        explanation: 'Dọc theo mỗi mạch đơn, nhóm photphat của nucleotide này gắn với đường của nucleotide kế tiếp bằng liên kết photphodieste.',
      },
      {
        id: 'dna_mc_9',
        type: 'multiple_choice',
        question: 'Một đoạn phân tử DNA có tổng số 2400 nucleotide, trong đó số nucleotide loại A = 400. Số liên kết hydrogen của đoạn DNA này là:',
        options: ['A. 3200', 'B. 2800', 'C. 3000', 'D. 3600'],
        correctAnswer: 0,
        explanation: 'Ta có A = T = 400. Suy ra G = C = (2400 - 800) / 2 = 800. Tổng liên kết H = 2A + 3G = 2×400 + 3×800 = 800 + 2400 = 3200.',
      },
    ],
    trueFalse: [
      {
        id: 'dna_tf_1',
        type: 'true_false',
        question: 'Trong mọi phân tử DNA mạch kép, tổng số nucleotide loại A và G luôn bằng tổng số nucleotide loại T và C (A + G = T + C).',
        correctAnswer: true,
        explanation: 'ĐÚNG. Do nguyên tắc bổ sung A = T và G = C nên A + G = T + C = 50% tổng số nucleotide.',
      },
      {
        id: 'dna_tf_2',
        type: 'true_false',
        question: 'Hai mạch polynucleotide của phân tử DNA xoắn song song và cùng chiều từ 5\' đến 3\'.',
        correctAnswer: false,
        explanation: 'SAI. Hai mạch của phân tử DNA xoắn song song nhưng NGƯỢC CHIỀU nhau (một mạch 3\'→5\', mạch còn lại 5\'→3\').',
      },
      {
        id: 'dna_tf_3',
        type: 'true_false',
        question: 'Từng liên kết hydrogen giữa 2 mạch là liên kết yếu, nhưng số lượng rất lớn giúp DNA vừa ổn định cấu trúc vừa linh hoạt tháo xoắn.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Từng liên kết H tuy yếu nhưng số lượng hàng nghìn đến hàng triệu liên kết tạo nên cấu trúc bền vững và linh hoạt.',
      },
      {
        id: 'dna_tf_4',
        type: 'true_false',
        question: 'Các nucleotide loại Guanine (G) liên kết bổ sung với Cytosine (C) bằng 2 liên kết hydrogen.',
        correctAnswer: false,
        explanation: 'SAI. G liên kết với C bằng 3 liên kết hydrogen (còn A liên kết với T bằng 2 liên kết hydrogen).',
      },
    ],
  },

  // 2. Gene & Bản chất hóa học của Gene
  gene: {
    topicId: 'gene',
    multipleChoice: [
      {
        id: 'gene_mc_1',
        type: 'multiple_choice',
        question: 'Về mặt bản chất sinh học, gene được định nghĩa là:',
        options: [
          'A. Một chuỗi polypeptide hoàn chỉnh',
          'B. Một đoạn phân tử DNA mang thông tin mã hóa cho một sản phẩm xác định (RNA hoặc chuỗi polypeptide)',
          'C. Toàn bộ phân tử DNA có trong nhân tế bào',
          'D. Một phân tử protein histone'
        ],
        correctAnswer: 1,
        explanation: 'Gene là một đoạn phân tử DNA mang thông tin mã hóa một sản phẩm xác định là chuỗi polypeptide hoặc một phân tử RNA.',
      },
      {
        id: 'gene_mc_2',
        type: 'multiple_choice',
        question: 'Cấu trúc chung của một gene cấu trúc điển hình gồm có 3 vùng trình tự theo thứ tự là:',
        options: [
          'A. Vùng điều hòa → Vùng mã hóa → Vùng kết thúc',
          'B. Vùng kết thúc → Vùng mã hóa → Vùng điều hòa',
          'C. Vùng mã hóa → Vùng điều hòa → Vùng kết thúc',
          'D. Vùng khởi động → Vùng vận hành → Vùng ức chế'
        ],
        correctAnswer: 0,
        explanation: 'Gene cấu trúc gồm 3 vùng: Vùng điều hòa (đầu gene), Vùng mã hóa (giữa gene) và Vùng kết thúc (cuối gene).',
      },
      {
        id: 'gene_mc_3',
        type: 'multiple_choice',
        question: 'Mã di truyền có tính thoái hóa (dư thừa) nghĩa là:',
        options: [
          'A. Một bộ ba mã hóa cho nhiều loại amino acid khác nhau',
          'B. Nhiều bộ ba khác nhau cùng mã hóa cho một loại amino acid',
          'C. Tất cả các loài sinh vật đều dùng chung một bảng mã di truyền',
          'D. Mã di truyền được đọc từng bộ ba không gối lên nhau'
        ],
        correctAnswer: 1,
        explanation: 'Tính thoái hóa nghĩa là nhiều bộ ba khác nhau cùng mã hóa cho một loại amino acid (trừ AUG và UGG).',
      },
      {
        id: 'gene_mc_4',
        type: 'multiple_choice',
        question: 'Có bao nhiêu bộ ba mã hóa (codon) trong bảng mã di truyền?',
        options: ['A. 64 bộ ba', 'B. 61 bộ ba', 'C. 20 bộ ba', 'D. 16 bộ ba'],
        correctAnswer: 0,
        explanation: 'Từ 4 loại nucleotide tạo thành 4^3 = 64 bộ ba mã di truyền (trong đó có 61 bộ ba mã hóa amino acid và 3 bộ ba kết thúc).',
      },
      {
        id: 'gene_mc_5',
        type: 'multiple_choice',
        question: 'Bộ ba mở đầu trên phân tử mARN quy định amino acid mở đầu ở sinh vật nhân thực là:',
        options: [
          'A. 5\' UAA 3\' (Mã kết thúc)',
          'B. 5\' AUG 3\' (Mã hóa Methionine)',
          'C. 5\' UGA 3\' (Mã kết thúc)',
          'D. 5\' UAG 3\' (Mã kết thúc)'
        ],
        correctAnswer: 1,
        explanation: 'Codon 5\' AUG 3\' là bộ ba mở đầu, mã hóa cho amino acid Methionine ở sinh vật nhân thực (Formyl-methionine ở nhân sơ).',
      },
      {
        id: 'gene_mc_6',
        type: 'multiple_choice',
        question: 'Vùng điều hòa của gene có chức năng sinh học chủ yếu là:',
        options: [
          'A. Mang tín hiệu kết thúc quá trình phiên mã',
          'B. Mang tín hiệu khởi động và kiểm soát quá trình phiên mã',
          'C. Trực tiếp mã hóa trình tự các amino acid',
          'D. Gắn kết ribosome khi dịch mã'
        ],
        correctAnswer: 1,
        explanation: 'Vùng điều hòa nằm ở đầu gene, chứa trình tự promoter để enzyme RNA polymerase nhận biết và bám vào khởi động phiên mã.',
      },
      {
        id: 'gene_mc_7',
        type: 'multiple_choice',
        question: 'Đặc điểm nào sau đây KHÔNG PHẢI là đặc tính của mã di truyền?',
        options: [
          'A. Mã di truyền là mã bộ ba, đọc liên tục không gối lên nhau',
          'B. Mã di truyền có tính phổ biến (hầu hết các loài dùng chung)',
          'C. Mã di truyền có tính gián đoạn gối đè lên nhau',
          'D. Mã di truyền có tính đặc hiệu (một bộ ba chỉ mã hóa 1 amino acid)'
        ],
        correctAnswer: 2,
        explanation: 'Mã di truyền đọc liên tục từ một điểm xác định từng bộ ba một, KHÔNG gối lên nhau.',
      },
    ],
    trueFalse: [
      {
        id: 'gene_tf_1',
        type: 'true_false',
        question: 'Mỗi gene cấu trúc mang thông tin di truyền quy định cấu trúc của một chuỗi polypeptide hoặc một phân tử RNA.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Đây là định nghĩa khoa học chuẩn xác về gene.',
      },
      {
        id: 'gene_tf_2',
        type: 'true_false',
        question: 'Ba bộ ba kết thúc không mã hóa amino acid nào gồm có UAA, UAG và UGA.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Cả 3 bộ ba này làm nhiệm vụ phát tín hiệu kết thúc dịch mã.',
      },
      {
        id: 'gene_tf_3',
        type: 'true_false',
        question: 'Mã di truyền có tính phổ biến chứng minh nguồn gốc thống nhất của toàn bộ sinh giới.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Mọi sinh vật từ vi khuẩn đến người đều dùng chung bảng mã di truyền, là bằng chứng tiến hóa sinh học.',
      },
    ],
  },

  // 3. Cấu trúc & Các loại RNA
  rna: {
    topicId: 'rna',
    multipleChoice: [
      {
        id: 'rna_mc_1',
        type: 'multiple_choice',
        question: 'Các loại nucleotide cấu tạo nên phân tử RNA gồm:',
        options: ['A. A, T, G, C', 'B. A, U, G, C', 'C. A, T, U, C', 'D. A, U, T, G'],
        correctAnswer: 1,
        explanation: 'RNA được cấu tạo từ 4 loại ribonucleotide là Adenine (A), Uracil (U), Guanine (G) và Cytosine (C). Không có Thymine (T).',
      },
      {
        id: 'rna_mc_2',
        type: 'multiple_choice',
        question: 'Đường cấu tạo nên đơn phân ribonucleotide của RNA là loại đường nào?',
        options: ['A. Deoxyribose (C5H10O4)', 'B. Ribose (C5H10O5)', 'C. Glucose (C6H12O6)', 'D. Fructose'],
        correctAnswer: 1,
        explanation: 'Đường trong RNA là đường Ribose (C5H10O5), có nhiều hơn 1 nguyên tử oxy so với đường Deoxyribose của DNA.',
      },
      {
        id: 'rna_mc_3',
        type: 'multiple_choice',
        question: 'Loại RNA nào đóng vai trò truyền đạt thông tin di truyền từ DNA trong nhân tới ribosome ngoài tế bào chất?',
        options: ['A. tARN (RNA vận chuyển)', 'B. mARN (RNA thông tin)', 'C. rARN (RNA ribosome)', 'D. snRNA'],
        correctAnswer: 1,
        explanation: 'mARN (messenger RNA) sao chép nguyên vẹn thông tin từ mạch gốc DNA và mang đến ribosome làm khuôn dịch mã.',
      },
      {
        id: 'rna_mc_4',
        type: 'multiple_choice',
        question: 'Cấu trúc phân tử tARN (RNA vận chuyển) có đặc điểm nổi bật nào sau đây?',
        options: [
          'A. Cấu trúc xoắn kép thẳng tắp dài hàng triệu nucleotide',
          'B. Cuộn gập tạo thành 3 thùy tròn (hình lá chẽ ba), có bộ ba đối mã (anticodon) và đầu gắn amino acid',
          'C. Hình cầu đặc khép kín không có liên kết hydrogen',
          'D. Mạch đôi vòng khép kín'
        ],
        correctAnswer: 1,
        explanation: 'tARN cuộn gập hình lá chẽ ba, có các đoạn bắt cặp bổ sung tạo liên kết H, một đầu mang bộ ba đối mã anticodon và một đầu gắn amino acid.',
      },
      {
        id: 'rna_mc_5',
        type: 'multiple_choice',
        question: 'Loại RNA chiếm tỉ lệ lớn nhất về khối lượng trong tế bào (chiếm khoảng 80% tổng lượng RNA) là:',
        options: ['A. mARN', 'B. tARN', 'C. rARN', 'D. miRNA'],
        correctAnswer: 2,
        explanation: 'rARN (Ribosomal RNA) kết hợp với protein tạo nên các tiểu phần của ribosome, chiếm khoảng 80% tổng lượng RNA.',
      },
      {
        id: 'rna_mc_6',
        type: 'multiple_choice',
        question: 'Phát biểu nào sau đây đúng khi so sánh giữa phân tử DNA và RNA?',
        options: [
          'A. Cả DNA và RNA đều luôn tồn tại ở dạng chuỗi xoắn kép 2 mạch',
          'B. DNA chứa đường deoxyribose và bazơ T; còn RNA chứa đường ribose và bazơ U',
          'C. DNA có kích thước nhỏ hơn phân tử mARN rất nhiều',
          'D. RNA có khả năng tự nhân đôi độc lập trong tế bào sinh dưỡng'
        ],
        correctAnswer: 1,
        explanation: 'DNA chứa deoxyribose và Thymine; RNA chứa ribose và Uracil.',
      },
      {
        id: 'rna_mc_7',
        type: 'multiple_choice',
        question: 'Phân tử mARN có cấu trúc dạng nào sau đây?',
        options: [
          'A. Một chuỗi polynucleotide mạch thẳng, không có liên kết hydrogen bổ sung',
          'B. Mạch đôi xoắn kép ngược chiều',
          'C. Vòng tròn liên kết bằng cầu disunfua',
          'D. Ba mạch đơn xoắn vào nhau'
        ],
        correctAnswer: 0,
        explanation: 'mARN là phân tử dạng mạch thẳng đơn, không có cấu trúc xoắn kép bổ sung nội tại nên kém bền vững hơn tARN và rARN.',
      },
    ],
    trueFalse: [
      {
        id: 'rna_tf_1',
        type: 'true_false',
        question: 'Khác với DNA, đa số các phân tử RNA ở sinh vật nhân thực chỉ gồm một mạch đơn polynucleotide.',
        correctAnswer: true,
        explanation: 'ĐÚNG. RNA thông thường là dạng mạch đơn.',
      },
      {
        id: 'rna_tf_2',
        type: 'true_false',
        question: 'Trong phân tử tARN hoàn toàn không có bất kỳ liên kết hydrogen nào giữa các nucleotide.',
        correctAnswer: false,
        explanation: 'SAI. Tại các vùng cuộn gập tạo thùy tròn của tARN, các base nitơ vẫn bắt cặp bổ sung bằng liên kết hydrogen.',
      },
      {
        id: 'rna_tf_3',
        type: 'true_false',
        question: 'Mỗi phân tử tARN chỉ gắn đặc hiệu với một loại amino acid tương ứng với bộ ba đối mã (anticodon) của nó.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Tính đặc hiệu này đảm bảo dịch mã chính xác theo đúng mã di truyền.',
      },
    ],
  },

  // 4. Cấu trúc & Chức năng Protein
  protein: {
    topicId: 'protein',
    multipleChoice: [
      {
        id: 'protein_mc_1',
        type: 'multiple_choice',
        question: 'Đơn vị cấu tạo cơ bản (đơn phân) của phân tử protein là gì?',
        options: ['A. Nucleotide', 'B. Amino acid (axit amin)', 'C. Glucose', 'D. Triglyceride'],
        correctAnswer: 1,
        explanation: 'Protein là đại phân tử sinh học cấu tạo theo nguyên tắc đa phân, đơn vị cấu tạo là hơn 20 loại amino acid.',
      },
      {
        id: 'protein_mc_2',
        type: 'multiple_choice',
        question: 'Các amino acid trong chuỗi polypeptide liên kết với nhau bằng loại liên kết hóa học nào?',
        options: ['A. Liên kết peptide', 'B. Liên kết phosphodiester', 'C. Liên kết glycosidic', 'D. Liên kết ion'],
        correctAnswer: 0,
        explanation: 'Nhóm carboxyl (-COOH) của amino acid này liên kết với nhóm amino (-NH2) của amino acid kế tiếp tạo liên kết peptide (-CO-NH-).',
      },
      {
        id: 'protein_mc_3',
        type: 'multiple_choice',
        question: 'Cấu trúc bậc 1 của phân tử protein được định nghĩa là:',
        options: [
          'A. Trình tự sắp xếp đặc thù của các amino acid trong chuỗi polypeptide',
          'B. Dạng xoắn alpha hoặc gấp nếp beta nhờ liên kết hydrogen',
          'C. Dạng cuộn gập không gian 3 chiều đặc thù',
          'D. Sự phối hợp của nhiều chuỗi polypeptide tạo phức hợp'
        ],
        correctAnswer: 0,
        explanation: 'Cấu trúc bậc 1 là trình tự sắp xếp các amino acid trong chuỗi polypeptide, quyết định tất cả các bậc cấu trúc cao hơn.',
      },
      {
        id: 'protein_mc_4',
        type: 'multiple_choice',
        question: 'Hiện tượng protein bị biến tính (mất hoạt tính sinh học) xảy ra khi nào?',
        options: [
          'A. Khi nhiệt độ cao, độ pH thay đổi làm phá hủy cấu trúc không gian 3 chiều bậc 3 và bậc 4',
          'B. Khi phân tử protein được tổng hợp xong tại ribosome',
          'C. Khi protein liên kết với cơ chất ở trung tâm hoạt động',
          'D. Khi tế bào tăng cường cung cấp năng lượng ATP'
        ],
        correctAnswer: 0,
        explanation: 'Yếu tố môi trường (nhiệt độ, pH, kim loại nặng) phá vỡ các liên kết H, disunfua làm protein duỗi xoắn biến tính và mất chức năng.',
      },
      {
        id: 'protein_mc_5',
        type: 'multiple_choice',
        question: 'Phân tử Hemoglobin (huyết sắc tố) vận chuyển oxy trong máu người có cấu trúc không gian ở bậc mấy?',
        options: ['A. Bậc 1', 'B. Bậc 2', 'C. Bậc 3', 'D. Bậc 4'],
        correctAnswer: 3,
        explanation: 'Hemoglobin gồm 4 chuỗi polypeptide (2 chuỗi alpha và 2 chuỗi beta) liên kết với nhau, thuộc cấu trúc bậc 4.',
      },
      {
        id: 'protein_mc_6',
        type: 'multiple_choice',
        question: 'Chức năng nào sau đây KHÔNG PHẢI là chức năng chủ yếu của protein trong cơ thể sống?',
        options: [
          'A. Xúc tác sinh học cho các phản ứng (enzyme)',
          'B. Vận chuyển các chất (hemoglobin) và bảo vệ cơ thể (kháng thể)',
          'C. Cấu tạo nên tế bào và cơ thể (collagen, keratin)',
          'D. Lưu giữ thông tin di truyền truyền qua các thế hệ'
        ],
        correctAnswer: 3,
        explanation: 'Lưu giữ và truyền đạt thông tin di truyền là chức năng của axit nucleic (DNA, RNA), không phải của protein.',
      },
      {
        id: 'protein_mc_7',
        type: 'multiple_choice',
        question: 'Cấu trúc xoắn alpha (α) và phiến gấp nếp beta (β) của phân tử protein được giữ ổn định nhờ loại liên kết nào?',
        options: ['A. Liên kết hydrogen', 'B. Cầu disunfua (S-S)', 'C. Liên kết peptide', 'D. Tương tác kỵ nước'],
        correctAnswer: 0,
        explanation: 'Cấu trúc bậc 2 hình thành nhờ các liên kết hydrogen giữa các nhóm peptide cách nhau đều đặn trong chuỗi.',
      },
    ],
    trueFalse: [
      {
        id: 'protein_tf_1',
        type: 'true_false',
        question: 'Tính đa dạng và đặc thù của protein do số lượng, thành phần và trật tự sắp xếp của hơn 20 loại amino acid quyết định.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Giống như 24 chữ cái tạo nên vô số từ ngữ, hơn 20 loại amino acid tạo nên hàng vạn loại protein đặc thù.',
      },
      {
        id: 'protein_tf_2',
        type: 'true_false',
        question: 'Chỉ khi protein đạt cấu trúc không gian bậc 3 hoặc bậc 4 thì mới có hoạt tính sinh học.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Cấu hình không gian 3 chiều tạo ra trung tâm hoạt động để tương tác với cơ chất hoặc kháng nguyên.',
      },
      {
        id: 'protein_tf_3',
        type: 'true_false',
        question: 'Enzyme có bản chất hóa học chủ yếu là lipid và carbohydrate.',
        correctAnswer: false,
        explanation: 'SAI. Tuyệt đại đa số các enzyme đều có bản chất là protein.',
      },
    ],
  },

  // 5. Nhân đôi DNA
  dna_replication: {
    topicId: 'dna_replication',
    multipleChoice: [
      {
        id: 'rep_mc_1',
        type: 'multiple_choice',
        question: 'Quá trình nhân đôi (tự sao) của phân tử DNA diễn ra ở đâu và vào thời điểm nào trong chu kỳ tế bào?',
        options: [
          'A. Trong nhân tế bào, tại pha S của kỳ trung gian',
          'B. Ngoài tế bào chất, tại kỳ giữa của nguyên phân',
          'C. Trong nhân tế bào, tại kỳ đầu của phân bào',
          'D. Tại màng sinh chất, sau khi phân chia tế bào chất'
        ],
        correctAnswer: 0,
        explanation: 'Nhân đôi DNA diễn ra trong nhân tế bào tại pha S (pha tổng hợp) của kỳ trung gian.',
      },
      {
        id: 'rep_mc_2',
        type: 'multiple_choice',
        question: 'Enzyme giữ vai trò tháo xoắn và tách hai mạch đơn của phân tử DNA tại chạc chữ Y là:',
        options: ['A. DNA polymerase', 'B. Helicase', 'C. Ligase', 'D. RNA polymerase'],
        correctAnswer: 1,
        explanation: 'Helicase là enzyme bẻ gãy các liên kết hydrogen giữa 2 mạch để mở chạc tái bản.',
      },
      {
        id: 'rep_mc_3',
        type: 'multiple_choice',
        question: 'Enzyme DNA polymerase tổng hợp mạch mới luôn kéo dài theo chiều nào?',
        options: ['A. Chiều 3\' → 5\'', 'B. Chiều 5\' → 3\'', 'C. Cả hai chiều đồng thời', 'D. Tùy thuộc vào loại tế bào'],
        correctAnswer: 1,
        explanation: 'DNA polymerase chỉ có thể gắn nucleotide mới vào nhóm 3\'-OH tự do, do đó mạch mới LUÔN kéo dài theo chiều 5\' → 3\'.',
      },
      {
        id: 'rep_mc_4',
        type: 'multiple_choice',
        question: 'Tên gọi các đoạn nucleotide ngắn được tổng hợp ngắt quãng trên mạch khuôn 5\' → 3\' là gì?',
        options: ['A. Đoạn Okazaki', 'B. Đoạn Telomere', 'C. Đoạn Centromere', 'D. Đoạn Operon'],
        correctAnswer: 0,
        explanation: 'Các đoạn tổng hợp gián đoạn trên mạch theo sau được gọi là đoạn Okazaki, sau đó được nối lại nhờ enzyme Ligase.',
      },
      {
        id: 'rep_mc_5',
        type: 'multiple_choice',
        question: 'Nguyên tắc bán bảo tồn (bán bảo toàn) trong nhân đôi DNA có ý nghĩa là:',
        options: [
          'A. Trong mỗi phân tử DNA con có 1 mạch của mẹ ban đầu và 1 mạch mới được tổng hợp',
          'B. Chỉ có một nửa số phân tử DNA con được giữ lại trong nhân',
          'C. Một nửa số nucleotide bị phân giải làm năng lượng',
          'D. Hai phân tử DNA con có cấu trúc khác hoàn toàn DNA mẹ'
        ],
        correctAnswer: 0,
        explanation: 'Bán bảo tồn (semi-conservative) nghĩa là giữ lại một nửa: mỗi DNA con có 1 mạch cũ của mẹ và 1 mạch mới.',
      },
      {
        id: 'rep_mc_6',
        type: 'multiple_choice',
        question: 'Từ 1 phân tử DNA mẹ ban đầu, sau 4 lần nhân đôi liên tiếp tạo ra bao nhiêu phân tử DNA con?',
        options: ['A. 8', 'B. 16', 'C. 32', 'D. 64'],
        correctAnswer: 1,
        explanation: 'Số phân tử DNA con tạo thành sau k lần nhân đôi = 2^k = 2^4 = 16 phân tử.',
      },
      {
        id: 'rep_mc_7',
        type: 'multiple_choice',
        question: 'Enzyme có chức năng hàn gắn và nối các đoạn Okazaki lại với nhau thành mạch liên tục là:',
        options: ['A. DNA Ligase', 'B. Helicase', 'C. Topoisomerase', 'D. Amylase'],
        correctAnswer: 0,
        explanation: 'DNA Ligase tạo liên kết phosphodiester giữa các đoạn Okazaki để hoàn chỉnh mạch mới.',
      },
    ],
    trueFalse: [
      {
        id: 'rep_tf_1',
        type: 'true_false',
        question: 'Quá trình nhân đôi DNA diễn ra theo hai nguyên tắc cốt lõi là nguyên tắc bổ sung và nguyên tắc bán bảo tồn.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Hai nguyên tắc này đảm bảo thông tin di truyền được sao chép chính xác.',
      },
      {
        id: 'rep_tf_2',
        type: 'true_false',
        question: 'Cả hai mạch mới đều được enzyme DNA polymerase tổng hợp liên tục cùng chiều với chiều tháo xoắn của chạc chữ Y.',
        correctAnswer: false,
        explanation: 'SAI. Chỉ có mạch khuôn 3\'→5\' được tổng hợp liên tục; mạch khuôn 5\'→3\' được tổng hợp ngắt quãng thành các đoạn Okazaki.',
      },
      {
        id: 'rep_tf_3',
        type: 'true_false',
        question: 'Từ 1 DNA ban đầu sau 3 lần nhân đôi, luôn luôn có đúng 2 phân tử DNA con chứa mạch cũ của phân tử DNA ban đầu.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Hai mạch ban đầu của DNA mẹ tách ra và luôn nằm trong 2 phân tử DNA con.',
      },
    ],
  },

  // 6. Phiên mã
  transcription: {
    topicId: 'transcription',
    multipleChoice: [
      {
        id: 'tra_mc_1',
        type: 'multiple_choice',
        question: 'Phiên mã là quá trình tổng hợp nên phân tử nào dựa trên khuôn mẫu DNA?',
        options: ['A. Protein', 'B. RNA (mARN, tARN, rARN)', 'C. Phân tử DNA mới', 'D. Glycogen'],
        correctAnswer: 1,
        explanation: 'Phiên mã là quá trình truyền đạt thông tin từ mạch gốc DNA sang phân tử RNA nhờ enzyme RNA polymerase.',
      },
      {
        id: 'tra_mc_2',
        type: 'multiple_choice',
        question: 'Loại enzyme trực tiếp thực hiện quá trình phiên mã là:',
        options: ['A. DNA polymerase', 'B. RNA polymerase', 'C. Helicase', 'D. Pepsin'],
        correctAnswer: 1,
        explanation: 'RNA polymerase vừa có khả năng tháo xoắn vừa lắp ráp các ribonucleotide tự do theo nguyên tắc bổ sung.',
      },
      {
        id: 'tra_mc_3',
        type: 'multiple_choice',
        question: 'Enzyme RNA polymerase sử dụng mạch nào của gene để làm khuôn tổng hợp phân tử mARN?',
        options: [
          'A. Mạch có chiều 3\' → 5\' (mạch gốc)',
          'B. Mạch có chiều 5\' → 3\' (mạch bổ sung)',
          'C. Cả hai mạch đơn của gene cùng một lúc',
          'D. Luân phiên đổi mạch sau mỗi chu kỳ xoắn'
        ],
        correctAnswer: 0,
        explanation: 'RNA polymerase chỉ đọc trên mạch khuôn có chiều 3\' → 5\' để kéo dài mạch mARN theo chiều 5\' → 3\'.',
      },
      {
        id: 'tra_mc_4',
        type: 'multiple_choice',
        question: 'Trong quá trình phiên mã, nucleotide loại Adenine (A) trên mạch gốc của DNA sẽ liên kết bổ sung với nucleotide loại nào của môi trường?',
        options: ['A. Thymine (T)', 'B. Uracil (U)', 'C. Guanine (G)', 'D. Cytosine (C)'],
        correctAnswer: 1,
        explanation: 'Theo nguyên tắc bổ sung trong phiên mã: A mạch gốc bắt cặp với U tự do (A - U, T - A, G - C, C - G).',
      },
      {
        id: 'tra_mc_5',
        type: 'multiple_choice',
        question: 'Phân tử mARN sơ khai ở sinh vật nhân thực sau khi phiên mã phải trải qua quá trình nào trước khi ra tế bào chất?',
        options: [
          'A. Cắt bỏ các đoạn intron không mã hóa và nối các đoạn exon mã hóa lại với nhau',
          'B. Nhân đôi lên 2 lần để tăng số lượng',
          'C. Gắn thêm 2 mạch nucleotide để trở thành mạch kép',
          'D. Phân giải thành các amino acid'
        ],
        correctAnswer: 0,
        explanation: 'Ở sinh vật nhân thực, gene phân mảnh có chứa intron (không mã hóa) nên mARN sơ khai phải được hoàn thiện (splicing) cắt bỏ intron.',
      },
      {
        id: 'tra_mc_6',
        type: 'multiple_choice',
        question: 'Một đoạn mạch gốc của gene có trình tự: 3\' - T A C G C A T T C - 5\'. Trình tự nucleotide của đoạn mARN tương ứng là:',
        options: [
          'A. 5\' - A U G C G U A A G - 3\'',
          'B. 5\' - A T G C G T A A G - 3\'',
          'C. 3\' - A U G C G U A A G - 5\'',
          'D. 5\' - U A C G C A U U C - 3\''
        ],
        correctAnswer: 0,
        explanation: 'Theo nguyên tắc bổ sung: T→A, A→U, C→G, G→C, C→G, A→U, T→A, T→A, C→G theo chiều 5\'→3\'.',
      },
      {
        id: 'tra_mc_7',
        type: 'multiple_choice',
        question: 'Quá trình phiên mã kết thúc khi enzyme RNA polymerase gặp phải tín hiệu nào trên phân tử DNA?',
        options: [
          'A. Vùng điều hòa đầu gene',
          'B. Tín hiệu kết thúc ở vùng kết thúc của gene',
          'C. Vị trí gắn của ribosome',
          'D. Điểm khởi đầu sao chép ORI'
        ],
        correctAnswer: 1,
        explanation: 'Khi RNA polymerase di chuyển đến vùng kết thúc mang tín hiệu kết thúc phiên mã, phân tử RNA tách khỏi gene.',
      },
    ],
    trueFalse: [
      {
        id: 'tra_tf_1',
        type: 'true_false',
        question: 'Trong phiên mã, chỉ có một mạch đơn của gene (mạch gốc 3\'→5\') được dùng làm khuôn mẫu tổng hợp RNA.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Khác với nhân đôi DNA dùng cả 2 mạch, phiên mã chỉ sử dụng mạch gốc 3\'→5\'.',
      },
      {
        id: 'tra_tf_2',
        type: 'true_false',
        question: 'Quá trình phiên mã diễn ra theo nguyên tắc bán bảo tồn giống như quá trình nhân đôi DNA.',
        correctAnswer: false,
        explanation: 'SAI. Phiên mã chỉ diễn ra theo nguyên tắc bổ sung, KHÔNG CÓ nguyên tắc bán bảo tồn.',
      },
      {
        id: 'tra_tf_3',
        type: 'true_false',
        question: 'Mạch mARN sau khi tổng hợp xong được kéo dài theo chiều 5\' → 3\'.',
        correctAnswer: true,
        explanation: 'ĐÚNG. RNA polymerase gắn ribonucleotide mới vào đầu 3\'-OH nên mạch mARN kéo dài theo chiều 5\'→3\'.',
      },
    ],
  },

  // 7. Dịch mã
  translation: {
    topicId: 'translation',
    multipleChoice: [
      {
        id: 'trn_mc_1',
        type: 'multiple_choice',
        question: 'Dịch mã là quá trình tổng hợp nên phân tử nào sau đây?',
        options: ['A. DNA', 'B. Chuỗi polypeptide (protein)', 'C. mARN', 'D. Ribosome'],
        correctAnswer: 1,
        explanation: 'Dịch mã là quá trình chuyển mã di truyền trên mARN thành trình tự amino acid trong chuỗi polypeptide.',
      },
      {
        id: 'trn_mc_2',
        type: 'multiple_choice',
        question: 'Bào quan trực tiếp thực hiện quá trình dịch mã tổng hợp protein trong tế bào là:',
        options: ['A. Ti thể', 'B. Ribosome', 'C. Lưới nội chất trơn', 'D. Bộ máy Golgi'],
        correctAnswer: 1,
        explanation: 'Ribosome gồm 2 tiểu phần lớn và bé là nhà máy sinh học trực tiếp thực hiện dịch mã.',
      },
      {
        id: 'trn_mc_3',
        type: 'multiple_choice',
        question: 'Bộ ba đối mã (anticodon) nằm trên loại phân tử nào?',
        options: ['A. mARN', 'B. tARN', 'C. rARN', 'D. DNA'],
        correctAnswer: 1,
        explanation: 'Bộ ba đối mã anticodon nằm trên thùy tròn của phân tử tARN, bắt cặp bổ sung với codon trên mARN.',
      },
      {
        id: 'trn_mc_4',
        type: 'multiple_choice',
        question: 'Amino acid mở đầu trong chuỗi polypeptide của sinh vật nhân thực là:',
        options: ['A. Valine', 'B. Methionine (Met)', 'C. Alanine', 'D. Lysine'],
        correctAnswer: 1,
        explanation: 'Ở sinh vật nhân thực, amino acid mở đầu là Methionine (ở sinh vật nhân sơ là Formyl-methionine).',
      },
      {
        id: 'trn_mc_5',
        type: 'multiple_choice',
        question: 'Quá trình dịch mã dừng lại khi ribosome gặp phải bộ ba nào trên phân tử mARN?',
        options: [
          'A. 5\' AUG 3\'',
          'B. 5\' UAA 3\', 5\' UAG 3\', hoặc 5\' UGA 3\'',
          'C. 5\' GGG 3\'',
          'D. 5\' AAA 3\''
        ],
        correctAnswer: 1,
        explanation: 'Khi ribosome tiếp xúc với 1 trong 3 bộ ba kết thúc (UAA, UAG, UGA), quá trình dịch mã chấm dứt.',
      },
      {
        id: 'trn_mc_6',
        type: 'multiple_choice',
        question: 'Hiện tượng nhiều ribosome cùng trượt trên một phân tử mARN (polyribosome / polysome) có ý nghĩa sinh học gì?',
        options: [
          'A. Làm tăng hiệu suất tổng hợp cùng một loại chuỗi polypeptide trong thời gian ngắn',
          'B. Tạo ra nhiều loại protein khác nhau từ một phân tử mARN',
          'C. Giúp phân tử mARN không bị phân hủy',
          'D. Biến đổi cấu trúc gen ban đầu'
        ],
        correctAnswer: 0,
        explanation: 'Polysome giúp cùng lúc tổng hợp được nhiều chuỗi polypeptide giống nhau, đáp ứng nhu cầu protein nhanh chóng cho tế bào.',
      },
      {
        id: 'trn_mc_7',
        type: 'multiple_choice',
        question: 'Sau khi chuỗi polypeptide được tổng hợp xong, amino acid mở đầu sẽ diễn biến như thế nào?',
        options: [
          'A. Được enzyme chuyên biệt cắt bỏ khỏi chuỗi polypeptide',
          'B. Tồn tại vĩnh viễn ở đầu chuỗi',
          'C. Biến đổi thành nhóm phosphate',
          'D. Di chuyển về cuối chuỗi'
        ],
        correctAnswer: 0,
        explanation: 'Enzyme chuyên biệt sẽ cắt bỏ amino acid mở đầu (Met) để chuỗi polypeptide cuộn gập thành protein có hoạt tính sinh học.',
      },
    ],
    trueFalse: [
      {
        id: 'trn_tf_1',
        type: 'true_false',
        question: 'Quá trình dịch mã diễn ra ngoài tế bào chất, nơi có sẵn các amino acid tự do và ribosome.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Khác với nhân đôi và phiên mã diễn ra trong nhân, dịch mã diễn ra ở tế bào chất.',
      },
      {
        id: 'trn_tf_2',
        type: 'true_false',
        question: 'Mỗi phân tử tARN có thể vận chuyển cùng lúc nhiều loại amino acid khác nhau vào ribosome.',
        correctAnswer: false,
        explanation: 'SAI. Mỗi phân tử tARN chỉ gắn và vận chuyển đặc hiệu một loại amino acid duy nhất.',
      },
      {
        id: 'trn_tf_3',
        type: 'true_false',
        question: 'Nguyên tắc bổ sung giữa codon trên mARN và anticodon trên tARN đảm bảo tính chính xác của chuỗi polypeptide.',
        correctAnswer: true,
        explanation: 'ĐÚNG. A bắt cặp với U, G bắt cặp với C đảm bảo lắp ráp đúng amino acid theo mã di truyền.',
      },
    ],
  },

  // 8. Đột biến Gene
  gene_mutation: {
    topicId: 'gene_mutation',
    multipleChoice: [
      {
        id: 'gmut_mc_1',
        type: 'multiple_choice',
        question: 'Đột biến gene là gì?',
        options: [
          'A. Những biến đổi trong cấu trúc của gene liên quan đến một hoặc một số cặp nucleotide',
          'B. Biến đổi số lượng nhiễm sắc thể trong tế bào',
          'C. Sự trao đổi chéo giữa các cromatit',
          'D. Sự thay đổi hình thái tế bào do môi trường'
        ],
        correctAnswer: 0,
        explanation: 'Đột biến gene là những biến đổi trong cấu trúc của gene, xảy ra tại một điểm (đột biến điểm) hoặc nhiều cặp nucleotide.',
      },
      {
        id: 'gmut_mc_2',
        type: 'multiple_choice',
        question: 'Đột biến điểm là dạng đột biến gene liên quan đến bao nhiêu cặp nucleotide?',
        options: ['A. Đúng 1 cặp nucleotide', 'B. 2 cặp nucleotide', 'C. 3 cặp nucleotide', 'D. Cả một đoạn exon'],
        correctAnswer: 0,
        explanation: 'Đột biến điểm (point mutation) là dạng đột biến chỉ liên quan đến biến đổi của đúng 1 cặp nucleotide.',
      },
      {
        id: 'gmut_mc_3',
        type: 'multiple_choice',
        question: 'Các dạng đột biến điểm cơ bản gồm có:',
        options: [
          'A. Mất, lặp, đảo và chuyển đoạn',
          'B. Thay thế, thêm hoặc mất một cặp nucleotide',
          'C. Đa bội và dị bội',
          'D. Đồng hoán và dị hoán nhiễm sắc thể'
        ],
        correctAnswer: 1,
        explanation: 'Ba dạng đột biến điểm cơ bản là: Thay thế 1 cặp nu, Thêm 1 cặp nu, Mất 1 cặp nu.',
      },
      {
        id: 'gmut_mc_4',
        type: 'multiple_choice',
        question: 'Dạng đột biến điểm nào thường dẫn đến hậu quả nghiêm trọng nhất đối với cấu trúc của chuỗi polypeptide?',
        options: [
          'A. Thay thế 1 cặp nucleotide bằng 1 cặp nucleotide khác',
          'B. Mất hoặc thêm 1 cặp nucleotide ở đầu vùng mã hóa',
          'C. Thay thế 1 nucleotide ở bộ ba thoái hóa',
          'D. Thay thế nucleotide ở vùng kết thúc'
        ],
        correctAnswer: 1,
        explanation: 'Mất hoặc thêm 1 cặp nu gây đột biến dịch khung đọc mã (frameshift), làm thay đổi toàn bộ trình tự amino acid từ vị trí đột biến đến cuối chuỗi.',
      },
      {
        id: 'gmut_mc_5',
        type: 'multiple_choice',
        question: 'Bệnh thiếu máu hồng cầu hình lưỡi liềm ở người là do dạng đột biến gene nào gây ra?',
        options: [
          'A. Mất 1 cặp nucleotide',
          'B. Đột biến thay thế cặp T-A bằng cặp A-T tại codon thứ 6 của chuỗi beta-hemoglobin (GAG → GUG)',
          'C. Thêm 1 cặp nucleotide',
          'D. Đột biến mất đoạn nhiễm sắc thể số 5'
        ],
        correctAnswer: 1,
        explanation: 'Đột biến thay thế 1 cặp nu làm codon GAG (mã hóa Glutamic acid) thành GUG (mã hóa Valine), làm biến dạng hồng cầu hình liềm.',
      },
      {
        id: 'gmut_mc_6',
        type: 'multiple_choice',
        question: 'Vai trò chủ yếu của đột biến gene trong tiến hóa và chọn giống là:',
        options: [
          'A. Cung cấp nguồn biến dị sơ cấp phong phú cho chọn lọc tự nhiên và chọn giống',
          'B. Làm giảm sức sống của toàn bộ quần thể',
          'C. Luôn tạo ra các cá thể bất thụ',
          'D. Làm dừng quá trình sinh sản của loài'
        ],
        correctAnswer: 0,
        explanation: 'Đột biến gene tạo ra các allele mới, cung cấp nguồn nguyên liệu sơ cấp phong phú cho chọn lọc tự nhiên và tiến hóa.',
      },
      {
        id: 'gmut_mc_7',
        type: 'multiple_choice',
        question: 'Cá thể mang gene đột biến đã biểu hiện ra kiểu hình được gọi là gì?',
        options: ['A. Thể đột biến', 'B. Thể dị hợp', 'C. Thể nguyên dưỡng', 'D. Kiểu gen chuẩn'],
        correctAnswer: 0,
        explanation: 'Thể đột biến là những cá thể mang gene đột biến đã biểu hiện ra kiểu hình của cơ thể.',
      },
    ],
    trueFalse: [
      {
        id: 'gmut_tf_1',
        type: 'true_false',
        question: 'Đột biến thay thế một cặp nucleotide có thể không làm thay đổi chuỗi amino acid nhờ tính thoái hóa của mã di truyền.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Đây là đột biến đồng nghĩa (đột biến câm), do nhiều codon cùng mã hóa một amino acid.',
      },
      {
        id: 'gmut_tf_2',
        type: 'true_false',
        question: 'Tất cả các đột biến gene đều có hại cho sinh vật mang đột biến.',
        correctAnswer: false,
        explanation: 'SAI. Đột biến gene có thể có hại, có lợi hoặc trung tính tùy thuộc vào môi trường và tổ hợp gene.',
      },
      {
        id: 'gmut_tf_3',
        type: 'true_false',
        question: 'Đột biến gene có thể phát sinh do tác nhân vật lý (tia tử ngoại, phóng xạ), tác nhân hóa học hoặc rối loạn sinh lý nội bào.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Các tác nhân này gây bắt cặp nhầm hoặc tổn thương phân tử DNA.',
      },
    ],
  },

  // 9. Nhiễm sắc thể
  chromosome: {
    topicId: 'chromosome',
    multipleChoice: [
      {
        id: 'chr_mc_1',
        type: 'multiple_choice',
        question: 'Vật chất cấu tạo nên nhiễm sắc thể ở sinh vật nhân thực gồm hai thành phần chính là:',
        options: [
          'A. Phân tử DNA và protein loại Histone',
          'B. Phân tử RNA và phospholipid',
          'C. Lipid và carbohydrate',
          'D. DNA và cellulose'
        ],
        correctAnswer: 0,
        explanation: 'NST cấu tạo từ phân tử DNA liên kết chặt chẽ với protein kiềm loại Histone.',
      },
      {
        id: 'chr_mc_2',
        type: 'multiple_choice',
        question: 'Đơn vị cấu trúc cơ bản của nhiễm sắc thể là nucleosome. Mỗi nucleosome có cấu tạo gồm:',
        options: [
          'A. Lõi 8 phân tử protein Histone được quấn quanh bởi khoảng 146 cặp nucleotide của DNA (1 ¾ vòng)',
          'B. 4 phân tử histone quấn quanh phân tử mARN',
          'C. Một phân tử DNA quấn quanh 10 phân tử ribosome',
          'D. Chuỗi polypeptide cuộn xoắn thành khối cầu'
        ],
        correctAnswer: 0,
        explanation: 'Mỗi nucleosome gồm lõi 8 phân tử histone được bọc quanh bởi đoạn DNA dài 146 cặp nu quấn 1 ¾ vòng.',
      },
      {
        id: 'chr_mc_3',
        type: 'multiple_choice',
        question: 'Vị trí trên nhiễm sắc thể là nơi các sợi thoi phân bào bám vào trong quá trình phân chia tế bào được gọi là:',
        options: ['A. Tâm động (Centromere)', 'B. Đầu mút (Telomere)', 'C. Eo thứ hai', 'D. Thể kèm'],
        correctAnswer: 0,
        explanation: 'Tâm động là eo thắt trên NST, nơi có đĩa thể động (kinetochore) để thoi phân bào đính vào kéo NST về 2 cực.',
      },
      {
        id: 'chr_mc_4',
        type: 'multiple_choice',
        question: 'Đầu mút (Telomere) của nhiễm sắc thể có chức năng sinh học quan trọng nào sau đây?',
        options: [
          'A. Bảo vệ nhiễm sắc thể, ngăn cản các NST dính vào nhau và duy trì độ bền vững',
          'B. Đính thoi phân bào khi tế bào phân chia',
          'C. Nơi khởi đầu sao chép của phân tử DNA',
          'D. Tổng hợp protein cho nhân con'
        ],
        correctAnswer: 0,
        explanation: 'Telomere ở hai đầu mút giúp bảo vệ NST khỏi bị dung hợp hoặc thoái hóa bởi enzyme exonuclease.',
      },
      {
        id: 'chr_mc_5',
        type: 'multiple_choice',
        question: 'Nhiễm sắc thể co xoắn cực đại và quan sát rõ hình thái, kích thước đặc trưng nhất ở kỳ nào của phân bào?',
        options: ['A. Kỳ đầu', 'B. Kỳ giữa (Metaphase)', 'C. Kỳ sau', 'D. Kỳ cuối'],
        correctAnswer: 1,
        explanation: 'Ở kỳ giữa, các NST co xoắn cực đại (đường kính khoảng 1400 nm), hiển vi rõ nét nhất để đếm và lập bộ NST.',
      },
      {
        id: 'chr_mc_6',
        type: 'multiple_choice',
        question: 'Mỗi nhiễm sắc thể kép ở kỳ giữa của phân bào gồm có:',
        options: [
          'A. Hai nhiễm sắc tử chị em (cromatit) dính nhau ở tâm động',
          'B. Một sợi đơn DNA duy nhất',
          'C. Bốn nhiễm sắc thể đơn riêng biệt',
          'D. Hai tâm động tách rời nhau'
        ],
        correctAnswer: 0,
        explanation: 'NST kép gồm 2 cromatit chị em mang phân tử DNA giống hệt nhau, dính nhau tại tâm động.',
      },
      {
        id: 'chr_mc_7',
        type: 'multiple_choice',
        question: 'Đường kính của sợi cơ bản và sợi nhiễm sắc trong cấu trúc siêu hiển vi của NST lần lượt là:',
        options: ['A. 11 nm và 30 nm', 'B. 2 nm và 20 nm', 'C. 300 nm và 700 nm', 'D. 100 nm và 500 nm'],
        correctAnswer: 0,
        explanation: 'Sợi cơ bản gồm chuỗi nucleosome có đường kính 11 nm, xoắn tiếp thành sợi nhiễm sắc có đường kính 30 nm.',
      },
    ],
    trueFalse: [
      {
        id: 'chr_tf_1',
        type: 'true_false',
        question: 'Cấu trúc cuộn xoắn nhiều cấp độ giúp nén phân tử DNA dài hàng mét gọn gàng vào trong nhân tế bào có đường kính vài micromet.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Mức độ co xoắn thu nhỏ chiều dài DNA hơn 10.000 lần, giúp NST dễ dàng phân ly trong phân bào.',
      },
      {
        id: 'chr_tf_2',
        type: 'true_false',
        question: 'Ở sinh vật nhân sơ (như vi khuẩn E. coli), vật chất di truyền cũng đóng gói thành các nhiễm sắc thể có protein histone như sinh vật nhân thực.',
        correctAnswer: false,
        explanation: 'SAI. Vi khuẩn chỉ có phân tử DNA trần dạng vòng kép, chưa có cấu trúc NST điển hình liên kết histone.',
      },
      {
        id: 'chr_tf_3',
        type: 'true_false',
        question: 'Hai cromatit chị em trong một NST kép có trình tự nucleotide giống hệt nhau do được nhân đôi từ cùng một phân tử DNA mẹ.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Nhờ nhân đôi bán bảo tồn ở pha S, hai chromatid chị em giống hệt nhau về trình tự gen.',
      },
    ],
  },

  // 10. Bộ Nhiễm sắc thể
  chromosome_set: {
    topicId: 'chromosome_set',
    multipleChoice: [
      {
        id: 'cset_mc_1',
        type: 'multiple_choice',
        question: 'Bộ nhiễm sắc thể lưỡng bội (ký hiệu là 2n) của loài người bình thường gồm có bao nhiêu chiếc?',
        options: ['A. 23 chiếc', 'B. 46 chiếc (23 cặp)', 'C. 48 chiếc', 'D. 92 chiếc'],
        correctAnswer: 1,
        explanation: 'Bộ NST lưỡng bội của người gồm 2n = 46 chiếc, tạo thành 23 cặp (22 cặp NST thường và 1 cặp NST giới tính).',
      },
      {
        id: 'cset_mc_2',
        type: 'multiple_choice',
        question: 'Cặp nhiễm sắc thể tương đồng là cặp NST gồm có đặc điểm:',
        options: [
          'A. Hai chiếc giống nhau về hình thái, kích thước và trật tự phân bố các locus gen, một chiếc có nguồn gốc từ bố và một chiếc từ mẹ',
          'B. Hai chiếc hoàn toàn khác nhau về hình thái',
          'C. Luôn luôn dính liền nhau tại tâm động',
          'D. Hai chiếc chỉ xuất hiện ở tế bào sinh dục đơn bội'
        ],
        correctAnswer: 0,
        explanation: 'Cặp tương đồng gồm 2 chiếc giống nhau về hình thái và trình tự locus gen, 1 chiếc nhận từ bố qua tinh trùng, 1 chiếc nhận từ mẹ qua trứng.',
      },
      {
        id: 'cset_mc_3',
        type: 'multiple_choice',
        question: 'Bộ nhiễm sắc thể đơn bội (ký hiệu là n) là bộ NST có mặt ở loại tế bào nào?',
        options: [
          'A. Tế bào sinh dưỡng (tế bào soma)',
          'B. Giao tử (trứng hoặc tinh trùng)',
          'C. Hợp tử sau thụ tinh',
          'D. Tế bào sinh dục sơ khai'
        ],
        correctAnswer: 1,
        explanation: 'Giao tử (trứng, tinh trùng) trải qua giảm phân chỉ còn chứa 1 bộ NST đơn bội (n = 23 chiếc ở người).',
      },
      {
        id: 'cset_mc_4',
        type: 'multiple_choice',
        question: 'Bộ nhiễm sắc thể lưỡng bội (2n) của loài ruồi giấm (Drosophila melanogaster) có số lượng là:',
        options: ['A. 2n = 8 (4 cặp)', 'B. 2n = 14', 'C. 2n = 20', 'D. 2n = 46'],
        correctAnswer: 0,
        explanation: 'Ruồi giấm có 2n = 8 gồm 3 cặp NST thường và 1 cặp NST giới tính (XX hoặc XY).',
      },
      {
        id: 'cset_mc_5',
        type: 'multiple_choice',
        question: 'Trong tế bào sinh dưỡng của người nữ bình thường, cặp nhiễm sắc thể giới tính là:',
        options: ['A. Cặp XX', 'B. Cặp XY', 'C. Cặp XO', 'D. Cặp YY'],
        correctAnswer: 0,
        explanation: 'Ở người, nữ giới mang cặp NST giới tính tương đồng XX, nam giới mang cặp không tương đồng XY.',
      },
      {
        id: 'cset_mc_6',
        type: 'multiple_choice',
        question: 'Đặc trưng của bộ nhiễm sắc thể ở mỗi loài sinh vật được thể hiện qua các tiêu chí nào?',
        options: [
          'A. Số lượng, hình thái và cấu trúc đặc thù của các nhiễm sắc thể',
          'B. Chỉ phụ thuộc vào khối lượng cơ thể loài đó',
          'C. Chỉ phụ thuộc vào số lượng tế bào trong cơ thể',
          'D. Thay đổi liên tục theo thời tiết'
        ],
        correctAnswer: 0,
        explanation: 'Mỗi loài sinh vật có bộ NST đặc trưng về số lượng (2n), hình thái (tâm giữa, tâm lệch, tâm mút) và cấu trúc.',
      },
      {
        id: 'cset_mc_7',
        type: 'multiple_choice',
        question: 'Số lượng nhiễm sắc thể trong tế bào nhiều hay ít có phản ánh mức độ tiến hóa cao hay thấp của loài sinh vật đó không?',
        options: [
          'A. Có, loài nào có nhiều NST hơn thì luôn tiến hóa cao hơn',
          'B. Không phản ánh mức độ tiến hóa của loài',
          'C. Có, chỉ đúng với giới động vật',
          'D. Có, chỉ đúng với giới thực vật'
        ],
        correctAnswer: 1,
        explanation: 'Số lượng NST không phản ánh mức độ tiến hóa (ví dụ: gà 2n = 78, tôm 2n = 254 nhưng không tiến hóa cao hơn người 2n = 46).',
      },
    ],
    trueFalse: [
      {
        id: 'cset_tf_1',
        type: 'true_false',
        question: 'Tất cả các tế bào sinh dưỡng bình thường trong cùng một cơ thể đều chứa bộ nhiễm sắc thể lưỡng bội (2n) giống hệt nhau.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Nhờ nguyên phân từ hợp tử ban đầu, tất cả tế bào sinh dưỡng đều có cùng bộ NST 2n.',
      },
      {
        id: 'cset_tf_2',
        type: 'true_false',
        question: 'Trong giao tử bình thường, mỗi cặp nhiễm sắc thể tương đồng chỉ còn lại đúng một chiếc.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Giảm phân phân ly mỗi cặp tương đồng để giao tử mang bộ đơn bội n.',
      },
      {
        id: 'cset_tf_3',
        type: 'true_false',
        question: 'Số lượng nhiễm sắc thể trong bộ 2n luôn luôn là một số chẵn.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Do các NST tồn tại thành từng cặp tương đồng nên 2n luôn là một số chẵn.',
      },
    ],
  },

  // 11. Nguyên phân
  mitosis: {
    topicId: 'mitosis',
    multipleChoice: [
      {
        id: 'mit_mc_1',
        type: 'multiple_choice',
        question: 'Ở kỳ nào của nguyên phân các nhiễm sắc thể kép co xoắn cực đại và tập trung thành 1 hàng trên mặt phẳng xích đạo?',
        options: ['A. Kỳ đầu', 'B. Kỳ giữa (Metaphase)', 'C. Kỳ sau (Anaphase)', 'D. Kỳ cuối (Telophase)'],
        correctAnswer: 1,
        explanation: 'Ở kỳ giữa, các NST kép đóng xoắn tối đa, có hình thái rõ rệt nhất và xếp thành một hàng trên mặt phẳng xích đạo.',
      },
      {
        id: 'mit_mc_2',
        type: 'multiple_choice',
        question: 'Một tế bào sinh dưỡng của người (2n = 46) tiến hành nguyên phân 3 lần liên tiếp. Số tế bào con được tạo thành là bao nhiêu?',
        options: ['A. 6 tế bào', 'B. 8 tế bào', 'C. 16 tế bào', 'D. 32 tế bào'],
        correctAnswer: 1,
        explanation: 'Số tế bào con = 2^k = 2^3 = 8 tế bào.',
      },
      {
        id: 'mit_mc_3',
        type: 'multiple_choice',
        question: 'Số lượng nhiễm sắc thể có trong một tế bào sinh dưỡng của người ở KỲ SAU của nguyên phân là bao nhiêu chiếc?',
        options: ['A. 46 NST kép', 'B. 92 NST đơn (4n đơn)', 'C. 23 NST đơn', 'D. 46 NST đơn'],
        correctAnswer: 1,
        explanation: 'Ở kỳ sau, 46 NST kép tách nhau tại tâm động thành 92 NST đơn phân ly về 2 cực tế bào (trạng thái 4n đơn tạm thời).',
      },
      {
        id: 'mit_mc_4',
        type: 'multiple_choice',
        question: 'Tại kỳ cuối của nguyên phân ở tế bào thực vật, tế bào chất phân chia bằng cách nào?',
        options: [
          'A. Màng sinh chất thắt eo ở giữa từ ngoài vào trong',
          'B. Hình thành vách ngăn xenlulôzơ ở mặt phẳng xích đạo từ trong ra ngoài',
          'C. Tế bào tự vỡ màng để giải phóng nhân con',
          'D. Tiêu biến toàn bộ tế bào chất cũ'
        ],
        correctAnswer: 1,
        explanation: 'Tế bào thực vật có thành xenlulôzơ cứng nên phân chia tế bào chất bằng cách hình thành vách ngăn từ trung tâm lan ra ngoài.',
      },
      {
        id: 'mit_mc_5',
        type: 'multiple_choice',
        question: 'Số lượng chromatid (nhiễm sắc tử chị em) có trong một tế bào ruồi giấm (2n = 8) ở KỲ GIỮA của nguyên phân là bao nhiêu?',
        options: ['A. 8 chromatid', 'B. 16 chromatid', 'C. 32 chromatid', 'D. 0 chromatid'],
        correctAnswer: 1,
        explanation: 'Ở kỳ giữa tế bào có 8 NST kép, mỗi NST kép gồm 2 chromatid nên có tổng cộng 8 × 2 = 16 chromatid.',
      },
      {
        id: 'mit_mc_6',
        type: 'multiple_choice',
        question: 'Ý nghĩa sinh học quan trọng nhất của nguyên phân đối với cơ thể đa bào là gì?',
        options: [
          'A. Tạo ra các giao tử đơn bội phục vụ thụ tinh',
          'B. Giúp cơ thể sinh trưởng tăng khối lượng tế bào, làm lành vết thương và tái tạo mô',
          'C. Tạo ra nhiều biến dị tổ hợp phong phú',
          'D. Giảm số lượng NST đi một nửa'
        ],
        correctAnswer: 1,
        explanation: 'Nguyên phân làm tăng số lượng tế bào sinh dưỡng, giúp cơ thể lớn lên, thay thế tế bào già cỗi và phục hồi tổn thương.',
      },
      {
        id: 'mit_mc_7',
        type: 'multiple_choice',
        question: 'Ở kỳ đầu của nguyên phân, màng nhân và nhân con diễn biến như thế nào?',
        options: [
          'A. Bắt đầu tiêu biến dần để lộ khoảng không cho thoi phân bào bám NST',
          'B. Nhân đôi màng nhân gấp 2 lần',
          'C. Không có sự thay đổi nào',
          'D. Dày lên gấp đôi để bảo vệ NST'
        ],
        correctAnswer: 0,
        explanation: 'Ở kỳ đầu, màng nhân và nhân con tiêu biến để thoi phân bào tiếp cận đính vào tâm động của các NST.',
      },
    ],
    trueFalse: [
      {
        id: 'mit_tf_1',
        type: 'true_false',
        question: 'Trong nguyên phân, màng nhân và nhân con tiêu biến ở kỳ đầu và tái lập lại ở kỳ cuối.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Màng nhân tiêu biến ở kỳ đầu và tái tạo lại bao quanh các bộ NST con ở kỳ cuối.',
      },
      {
        id: 'mit_tf_2',
        type: 'true_false',
        question: 'Ở kỳ sau của nguyên phân, các nhiễm sắc thể kép vẫn dính nhau ở tâm động và di chuyển nguyên vẹn về 2 cực tế bào.',
        correctAnswer: false,
        explanation: 'SAI. Ở kỳ sau, mỗi NST kép chẻ dọc tại tâm động tách thành 2 NST đơn riêng biệt di chuyển về 2 cực.',
      },
      {
        id: 'mit_tf_3',
        type: 'true_false',
        question: 'Kết quả của nguyên phân tạo ra 2 tế bào con có bộ nhiễm sắc thể giống hệt nhau và giống hệt tế bào mẹ (2n).',
        correctAnswer: true,
        explanation: 'ĐÚNG. Nhờ nhân đôi 1 lần và phân ly 1 lần, bộ NST 2n được bảo toàn nguyên vẹn.',
      },
    ],
  },

  // 12. Giảm phân
  meiosis: {
    topicId: 'meiosis',
    multipleChoice: [
      {
        id: 'mei_mc_1',
        type: 'multiple_choice',
        question: 'Quá trình giảm phân diễn ra ở loại tế bào nào trong cơ thể?',
        options: [
          'A. Tế bào sinh dưỡng (soma)',
          'B. Tế bào sinh dục thời kỳ chín (tế bào sinh tinh và sinh trứng)',
          'C. Tế bào hợp tử sau thụ tinh',
          'D. Tế bào biểu bì da'
        ],
        correctAnswer: 1,
        explanation: 'Giảm phân chỉ diễn ra ở các tế bào sinh dục thời kỳ chín để tạo ra các giao tử đơn bội (n).',
      },
      {
        id: 'mei_mc_2',
        type: 'multiple_choice',
        question: 'Hiện tượng tiếp hợp và trao đổi chéo giữa các cromatit không chị em diễn ra ở kỳ nào của giảm phân?',
        options: [
          'A. Kỳ đầu của giảm phân I (Prophase I)',
          'B. Kỳ giữa của giảm phân I',
          'C. Kỳ đầu của giảm phân II',
          'D. Kỳ sau của giảm phân II'
        ],
        correctAnswer: 0,
        explanation: 'Tiếp hợp và trao đổi chéo (Crossing-over) diễn ra ở kỳ đầu I, tạo ra các giao tử mang tổ hợp gene mới (hoán vị gen).',
      },
      {
        id: 'mei_mc_3',
        type: 'multiple_choice',
        question: 'Kết quả của quá trình giảm phân từ 1 tế bào mẹ ban đầu (2n) tạo ra bao nhiêu tế bào con có bộ NST như thế nào?',
        options: [
          'A. 2 tế bào con có bộ NST lưỡng bội (2n)',
          'B. 4 tế bào con có bộ NST đơn bội (n)',
          'C. 4 tế bào con có bộ NST lưỡng bội (2n)',
          'D. 8 tế bào con có bộ NST đơn bội (n)'
        ],
        correctAnswer: 1,
        explanation: 'Qua 2 lần phân bào liên tiếp nhưng chỉ nhân đôi DNA 1 lần, 1 tế bào mẹ 2n tạo ra đúng 4 tế bào con mang bộ NST giảm đi một nửa (n).',
      },
      {
        id: 'mei_mc_4',
        type: 'multiple_choice',
        question: 'Từ 1 tế bào sinh tinh qua giảm phân bình thường tạo ra được bao nhiêu tinh trùng?',
        options: ['A. 1 tinh trùng', 'B. 2 tinh trùng', 'C. 4 tinh trùng (n)', 'D. 8 tinh trùng'],
        correctAnswer: 2,
        explanation: 'Một tế bào sinh tinh (2n) giảm phân tạo 4 tinh tử, phát triển thành 4 tinh trùng đều có khả năng thụ tinh.',
      },
      {
        id: 'mei_mc_5',
        type: 'multiple_choice',
        question: 'Từ 1 tế bào sinh trứng qua giảm phân bình thường tạo ra được bao nhiêu trứng và thể cực (thể định hướng)?',
        options: [
          'A. 4 trứng có kích thước bằng nhau',
          'B. 1 trứng duy nhất (n) có kích thước lớn và 3 thể cực nhỏ tiêu biến',
          'C. 2 trứng và 2 thể cực',
          'D. 3 trứng và 1 thể cực'
        ],
        correctAnswer: 1,
        explanation: 'Do phân chia tế bào chất không đều, 1 tế bào sinh trứng chỉ tạo 1 trứng duy nhất (giàu dinh dưỡng) và 3 thể cực bị tiêu biến.',
      },
      {
        id: 'mei_mc_6',
        type: 'multiple_choice',
        question: 'Ở kỳ giữa của giảm phân I, các nhiễm sắc thể kép tập trung thành mấy hàng trên mặt phẳng xích đạo?',
        options: [
          'A. Một hàng duy nhất',
          'B. Hai hàng song song',
          'C. Ba hàng sole',
          'D. Bốn hàng thẳng đứng'
        ],
        correctAnswer: 1,
        explanation: 'Ở kỳ giữa I, các cặp NST kép tương đồng xếp thành HAI HÀNG song song trên mặt phẳng xích đạo.',
      },
      {
        id: 'mei_mc_7',
        type: 'multiple_choice',
        question: 'Lần phân bào nào trong giảm phân thực chất có cơ chế phân chia giống hệt với nguyên phân?',
        options: ['A. Giảm phân I', 'B. Giảm phân II', 'C. Cả hai lần phân bào', 'D. Không có lần nào giống'],
        correctAnswer: 1,
        explanation: 'Giảm phân II là phân bào nguyên nhiễm: các NST kép xếp 1 hàng ở kỳ giữa II và tách tâm động ở kỳ sau II giống hệt nguyên phân.',
      },
    ],
    trueFalse: [
      {
        id: 'mei_tf_1',
        type: 'true_false',
        question: 'Giữa giảm phân I và giảm phân II có một kỳ trung gian nhưng nhiễm sắc thể KHÔNG NHÂN ĐÔI thêm lần nào nữa.',
        correctAnswer: true,
        explanation: 'ĐÚNG. NST chỉ nhân đôi 1 lần duy nhất ở pha S trước khi bước vào giảm phân I.',
      },
      {
        id: 'mei_tf_2',
        type: 'true_false',
        question: 'Sự phân ly độc lập và trao đổi chéo của các NST trong giảm phân tạo ra vô số biến dị tổ hợp ở đời con.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Đây là cơ chế giải thích vì sao con cái sinh ra không giống hệt bố mẹ.',
      },
      {
        id: 'mei_tf_3',
        type: 'true_false',
        question: 'Ở kỳ sau của giảm phân I, mỗi NST kép tách đôi ở tâm động thành 2 NST đơn.',
        correctAnswer: false,
        explanation: 'SAI. Ở kỳ sau I, các NST kép KHÔNG tách tâm động mà đi nguyên vẹn chiếc kép về mỗi cực.',
      },
    ],
  },

  // 13. Cơ chế xác định giới tính
  sex_determination: {
    topicId: 'sex_determination',
    multipleChoice: [
      {
        id: 'sxd_mc_1',
        type: 'multiple_choice',
        question: 'Ở người và động vật có vú, giới tính nào là giới dị giao tử?',
        options: [
          'A. Giới cái (XX)',
          'B. Giới đực (XY)',
          'C. Cả hai giới đều là đồng giao tử',
          'D. Tùy thuộc vào mùa sinh sản'
        ],
        correctAnswer: 1,
        explanation: 'Ở người và thú, con đực mang cặp XY giảm phân tạo 2 loại tinh trùng (50% X : 50% Y) nên là giới dị giao tử.',
      },
      {
        id: 'sxd_mc_2',
        type: 'multiple_choice',
        question: 'Gen SRY (Sex-determining Region Y) quyết định sự phát triển giới tính nam nằm ở vị trí nào?',
        options: [
          'A. Trên nhánh ngắn của nhiễm sắc thể Y',
          'B. Trên nhiễm sắc thể X',
          'C. Trên nhiễm sắc thể thường số 21',
          'D. Trong ti thể'
        ],
        correctAnswer: 0,
        explanation: 'Gen SRY nằm trên nhánh ngắn của NST Y mã hóa yếu tố biệt hóa tinh hoàn (TDF) quyết định phát triển kiểu hình nam.',
      },
      {
        id: 'sxd_mc_3',
        type: 'multiple_choice',
        question: 'Tỉ lệ giới tính đực : cái ở đa số các loài giao phối xấp xỉ 1 : 1 là do cơ chế nào?',
        options: [
          'A. Con cái đẻ trứng nhiều gấp đôi con đực',
          'B. Giới dị giao tử (XY) tạo 2 loại giao tử X và Y với tỉ lệ ngang nhau (1:1), thụ tinh ngẫu nhiên với trứng (X)',
          'C. Tác động của nhiệt độ môi trường',
          'D. Sự chọn lọc tự nhiên ưu đãi giống đực'
        ],
        correctAnswer: 1,
        explanation: 'Cơ chế phân ly tạo 50% tinh trùng X và 50% tinh trùng Y kết hợp ngẫu nhiên với 100% trứng X tái tạo tỉ lệ 1 XX : 1 XY.',
      },
      {
        id: 'sxd_mc_4',
        type: 'multiple_choice',
        question: 'Ở các loài chim, bướm và một số loài bò sát, cặp nhiễm sắc thể giới tính của con cái và con đực là:',
        options: [
          'A. Con đực XX, con cái XY (hoặc ZZ ở con đực, ZW ở con cái)',
          'B. Con đực XY, con cái XX',
          'C. Con đực XO, con cái XX',
          'D. Cả hai giới đều mang XX'
        ],
        correctAnswer: 0,
        explanation: 'Ở chim, bướm, bò sát: con đực là giới đồng giao tử (ZZ), con cái là giới dị giao tử (ZW).',
      },
      {
        id: 'sxd_mc_5',
        type: 'multiple_choice',
        question: 'Nhiễm sắc thể X ở người có đặc điểm nào sau đây so với nhiễm sắc thể Y?',
        options: [
          'A. Kích thước lớn hơn nhiều và mang nhiều gen quy định tính trạng thường hơn',
          'B. Kích thước nhỏ hơn nhiễm sắc thể Y',
          'C. Hoàn toàn không mang bất kỳ gen nào',
          'D. Chỉ xuất hiện ở nữ giới'
        ],
        correctAnswer: 0,
        explanation: 'NST X có kích thước lớn (~155 triệu bp, hơn 900 gen), chứa nhiều gen tính trạng thường như gen máu khó đông, mù màu.',
      },
      {
        id: 'sxd_mc_6',
        type: 'multiple_choice',
        question: 'Thể Barr (Barr body) quan sát thấy trong nhân tế bào sinh dưỡng của nữ giới thực chất là:',
        options: [
          'A. Một trong hai nhiễm sắc thể X bị bất hoạt và co đặc',
          'B. Nhiễm sắc thể Y bị thoái hóa',
          'C. Một hạt ribosome dư thừa',
          'D. Khối protein histone kết tụ'
        ],
        correctAnswer: 0,
        explanation: 'Thể Barr là 1 trong 2 NST X ở nữ bị bất hoạt ngẫu nhiên để cân bằng liều lượng gen với nam giới.',
      },
      {
        id: 'sxd_mc_7',
        type: 'multiple_choice',
        question: 'Yếu tố nào sau đây có thể ảnh hưởng đến sự phân hóa giới tính ở một số loài rùa và cá sấu?',
        options: [
          'A. Nhiệt độ của môi trường ấp trứng',
          'B. Độ pH của nguồn nước',
          'C. Ánh sáng mặt trời chiếu trực tiếp',
          'D. Nồng độ khí oxy trong không khí'
        ],
        correctAnswer: 0,
        explanation: 'Ở rùa và cá sấu, nhiệt độ ấp trứng quyết định giới tính (ở rùa, nhiệt độ cao sinh con cái, nhiệt độ thấp sinh con đực).',
      },
    ],
    trueFalse: [
      {
        id: 'sxd_tf_1',
        type: 'true_false',
        question: 'Ở người, giới tính của thai nhi hoàn toàn do loại tinh trùng (mang NST X hay mang NST Y) của người bố thụ tinh quyết định.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Mẹ chỉ cho 1 loại trứng mang X; bố cho 2 loại tinh trùng X (tạo con gái) và Y (tạo con trai).',
      },
      {
        id: 'sxd_tf_2',
        type: 'true_false',
        question: 'Vùng giả tương đồng (PAR) ở hai đầu mút của NST X và Y cho phép chúng tiếp hợp trong kỳ đầu giảm phân I ở nam giới.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Nhờ vùng PAR tương đồng, NST X và Y có thể bắt cặp và phân ly đồng đều trong giảm phân.',
      },
      {
        id: 'sxd_tf_3',
        type: 'true_false',
        question: 'Ở tất cả các loài sinh vật trên trái đất, giới đực luôn luôn mang cặp NST giới tính XY.',
        correctAnswer: false,
        explanation: 'SAI. Ở chim, bướm, tằm thì con đực mang ZZ (đồng giao tử), còn con cái mang ZW.',
      },
    ],
  },

  // 14. Di truyền liên kết
  genetic_linkage: {
    topicId: 'genetic_linkage',
    multipleChoice: [
      {
        id: 'glink_mc_1',
        type: 'multiple_choice',
        question: 'Hiện tượng di truyền liên kết gene được nhà khoa học nào phát hiện lần đầu tiên trên đối tượng ruồi giấm?',
        options: ['A. Gregor Mendel', 'B. Thomas Hunt Morgan', 'C. Charles Darwin', 'D. James Watson'],
        correctAnswer: 1,
        explanation: 'T.H. Morgan là người đầu tiên phát hiện ra quy luật liên kết gen và hoán vị gen trên ruồi giấm năm 1910.',
      },
      {
        id: 'glink_mc_2',
        type: 'multiple_choice',
        question: 'Cơ sở tế bào học của hiện tượng di truyền liên kết gene là:',
        options: [
          'A. Các gene cùng nằm trên một nhiễm sắc thể phân ly cùng nhau trong phân bào',
          'B. Các gene nằm trên các nhiễm sắc thể khác nhau',
          'C. Các gene nằm trong tế bào chất',
          'D. Các gene luôn bị đột biến đồng thời'
        ],
        correctAnswer: 0,
        explanation: 'Các gene cùng nằm trên 1 phân tử DNA của NST sẽ di chuyển cùng nhau trong phân bào, tạo thành nhóm gene liên kết.',
      },
      {
        id: 'glink_mc_3',
        type: 'multiple_choice',
        question: 'Số nhóm gene liên kết của một loài sinh vật thường bằng số lượng nhiễm sắc thể nào?',
        options: [
          'A. Số lượng NST trong bộ đơn bội (n) của loài đó',
          'B. Số lượng NST trong bộ lưỡng bội (2n)',
          'C. Số lượng NST giới tính',
          'D. Gấp đôi bộ nhiễm sắc thể lưỡng bội'
        ],
        correctAnswer: 0,
        explanation: 'Số nhóm gen liên kết bằng số NST trong bộ đơn bội n (ví dụ ruồi giấm 2n=8 có 4 nhóm gen liên kết, người 2n=46 có 23 nhóm gen liên kết ở nữ).',
      },
      {
        id: 'glink_mc_4',
        type: 'multiple_choice',
        question: 'Trong thí nghiệm lai phân tích ruồi đực F1 thân xám, cánh dài (BV/bv) với ruồi cái thân đen, cánh cụt (bv/bv), Morgan thu được tỉ lệ kiểu hình ở đời con Fa là:',
        options: [
          'A. 1 Thân xám, cánh dài : 1 Thân đen, cánh cụt (1 : 1)',
          'B. 1 : 1 : 1 : 1',
          'C. 3 Thân xám, cánh dài : 1 Thân đen, cánh cụt',
          'D. 9 : 3 : 3 : 1'
        ],
        correctAnswer: 0,
        explanation: 'Do liên kết gen hoàn toàn ở ruồi đực, Fa thu được tỉ lệ đúng 1 xám, dài : 1 đen, cụt (khác tỉ lệ 1:1:1:1 của Menđen).',
      },
      {
        id: 'glink_mc_5',
        type: 'multiple_choice',
        question: 'So với quy luật phân ly độc lập của Menđen, hiện tượng liên kết gene có ý nghĩa sinh học như thế nào?',
        options: [
          'A. Làm tăng tối đa biến dị tổ hợp',
          'B. Hạn chế xuất hiện biến dị tổ hợp, giúp duy trì các nhóm tính trạng quý đi kèm nhau ổn định',
          'C. Luôn làm giảm sức sống của con lai',
          'D. Tạo ra nhiều kiểu gen mới chưa từng có'
        ],
        correctAnswer: 1,
        explanation: 'Liên kết gen đảm bảo các gene có lợi trên cùng 1 NST di truyền cùng nhau, hạn chế phân ly xáo trộn tổ hợp.',
      },
      {
        id: 'glink_mc_6',
        type: 'multiple_choice',
        question: 'Ở ruồi giấm đực (Drosophila melanogaster), hiện tượng trao đổi chéo (hoán vị gen):',
        options: [
          'A. Diễn ra với tần số rất cao',
          'B. Hoàn toàn KHÔNG xảy ra (luôn liên kết hoàn toàn 100%)',
          'C. Chỉ xảy ra trên NST giới tính Y',
          'D. Diễn ra tương tự ruồi giấm cái'
        ],
        correctAnswer: 1,
        explanation: 'Đặc điểm đặc biệt ở ruồi giấm: hoán vị gen chỉ xảy ra ở ruồi cái, ở ruồi đực liên kết hoàn toàn 100%.',
      },
      {
        id: 'glink_mc_7',
        type: 'multiple_choice',
        question: 'Đơn vị đo khoảng cách giữa các gene trên bản đồ di truyền mang tên nhà khoa học Morgan là:',
        options: ['A. Centimorgan (cM)', 'B. Nanomet (nm)', 'C. Ångström (Å)', 'D. Micromet (µm)'],
        correctAnswer: 0,
        explanation: 'Đơn vị khoảng cách gen là centimorgan (cM), 1 cM tương ứng với tần số hoán vị gen 1%.',
      },
    ],
    trueFalse: [
      {
        id: 'glink_tf_1',
        type: 'true_false',
        question: 'Các gene càng nằm gần nhau trên một nhiễm sắc thể thì liên kết càng chặt chẽ và tần số hoán vị gene càng thấp.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Khoảng cách càng gần thì lực liên kết càng bền, xác suất đứt chéo xảy ra giữa chúng càng nhỏ.',
      },
      {
        id: 'glink_tf_2',
        type: 'true_false',
        question: 'Tần số hoán vị gen giữa 2 locus không bao giờ vượt quá 50%.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Tần số hoán vị tối đa là 50% (khi 2 gen ở 2 đầu rất xa nhau biểu hiện tương đương phân ly độc lập).',
      },
      {
        id: 'glink_tf_3',
        type: 'true_false',
        question: 'Nếu 2 cặp tính trạng di truyền liên kết hoàn toàn, phép lai phân tích cá thể dị hợp 2 cặp gen sẽ cho tỉ lệ 1 : 1 : 1 : 1.',
        correctAnswer: false,
        explanation: 'SAI. Phép lai phân tích dị hợp tử 2 cặp gen liên kết hoàn toàn chỉ cho tỉ lệ 1 : 1 (tỉ lệ 1:1:1:1 là của Menđen).',
      },
    ],
  },

  // 15. Đột biến Nhiễm sắc thể
  chromosomal_mutation: {
    topicId: 'chromosomal_mutation',
    multipleChoice: [
      {
        id: 'cmut_mc_1',
        type: 'multiple_choice',
        question: 'Đột biến cấu trúc nhiễm sắc thể gồm có 4 dạng cơ bản là:',
        options: [
          'A. Mất đoạn, lặp đoạn, đảo đoạn và chuyển đoạn',
          'B. Đa bội, dị bội, tam bội và tứ bội',
          'C. Thêm, mất và thay thế một cặp nucleotide',
          'D. Đồng hoán, dị hoán, đứt gãy và nối liền'
        ],
        correctAnswer: 0,
        explanation: 'Bốn dạng đột biến cấu trúc NST là mất đoạn, lặp đoạn, đảo đoạn và chuyển đoạn.',
      },
      {
        id: 'cmut_mc_2',
        type: 'multiple_choice',
        question: 'Hội chứng tiếng mèo kêu (Cri du chat syndrome) ở người là do dạng đột biến nào gây ra?',
        options: [
          'A. Mất một đoạn ở nhánh ngắn của nhiễm sắc thể số 5',
          'B. Thừa 1 nhiễm sắc thể số 21',
          'C. Lặp đoạn trên nhiễm sắc thể X',
          'D. Mất nhiễm sắc thể giới tính Y'
        ],
        correctAnswer: 0,
        explanation: 'Hội chứng tiếng mèo kêu do mất đoạn nhánh ngắn của NST số 5 gây dị tật thanh quản, chậm phát triển trí tuệ.',
      },
      {
        id: 'cmut_mc_3',
        type: 'multiple_choice',
        question: 'Ở ruồi giấm, đột biến lặp đoạn 16A trên nhiễm sắc thể X gây ra hậu quả kiểu hình nào?',
        options: [
          'A. Mắt lồi bình thường biến đổi thành mắt dẹt',
          'B. Cánh dài thành cánh cụt',
          'C. Thân xám thành thân đen',
          'D. Chết phôi ngay sau khi thụ tinh'
        ],
        correctAnswer: 0,
        explanation: 'Lặp đoạn 16A trên NST X làm giảm số lượng đơn vị thị giác, khiến mắt ruồi giấm lồi trở thành mắt dẹt.',
      },
      {
        id: 'cmut_mc_4',
        type: 'multiple_choice',
        question: 'Hội chứng Down (Down syndrome) ở người là dạng đột biến số lượng nhiễm sắc thể nào?',
        options: [
          'A. Thể ba (Trisomy 21) ở cặp nhiễm sắc thể số 21 (2n + 1 = 47 chiếc)',
          'B. Thể một (Monosomy) ở cặp NST số 21 (2n - 1 = 45)',
          'C. Đa bội chẵn (4n = 92)',
          'D. Mất đoạn NST số 21'
        ],
        correctAnswer: 0,
        explanation: 'Người mắc hội chứng Down có 3 chiếc NST số 21 (2n + 1 = 47 chiếc), do cặp 21 không phân ly trong giảm phân.',
      },
      {
        id: 'cmut_mc_5',
        type: 'multiple_choice',
        question: 'Hội chứng Turner ở nữ giới (chỉ có 1 nhiễm sắc thể X, ký hiệu là XO) thuộc dạng đột biến nào?',
        options: [
          'A. Thể một (Monosomy 2n - 1 = 45,XO)',
          'B. Thể ba (Trisomy 2n + 1 = 47,XXY)',
          'C. Thể không (Nullisomy 2n - 2)',
          'D. Thể tam bội (3n)'
        ],
        correctAnswer: 0,
        explanation: 'Hội chứng Turner là thể một duy nhất ở người sống sót, bệnh nhân là nữ thiếu 1 NST X (2n - 1 = 45).',
      },
      {
        id: 'cmut_mc_6',
        type: 'multiple_choice',
        question: 'Cây tam bội (3n) như dưa hấu tam bội, chuối nhà có đặc điểm thực tiễn nổi bật nào sau đây?',
        options: [
          'A. Không có hạt do giảm phân bị rối loạn không tạo được giao tử bình thường',
          'B. Hạt to gấp đôi bình thường',
          'C. Sinh sản hữu tính rất nhanh',
          'D. Cây cằn cỗi kém phát triển'
        ],
        correctAnswer: 0,
        explanation: 'Thể đa bội lẻ (3n) bị rối loạn tiếp hợp trong giảm phân nên không tạo được hạt, được ứng dụng sản xuất dưa hấu không hạt.',
      },
      {
        id: 'cmut_mc_7',
        type: 'multiple_choice',
        question: 'Hóa chất colchicine thường được sử dụng trong chọn giống thực vật nhằm mục đích gì?',
        options: [
          'A. Cản trở sự hình thành thoi phân bào để tạo thể đa bội (tứ bội 4n)',
          'B. Tiêu diệt sâu bệnh hại lá',
          'C. Tăng tốc độ hô hấp tế bào',
          'D. Kích thích hoa nở sớm'
        ],
        correctAnswer: 0,
        explanation: 'Colchicine ức chế sự trùng hợp vi ống của thoi vô sắc, làm NST nhân đôi nhưng không phân ly, tạo thể đa bội.',
      },
    ],
    trueFalse: [
      {
        id: 'cmut_tf_1',
        type: 'true_false',
        question: 'Đột biến đảo đoạn làm thay đổi trật tự phân bố của các gene trên nhiễm sắc thể nhưng không làm thay đổi số lượng gene.',
        correctAnswer: true,
        explanation: 'ĐÚNG. Một đoạn NST đứt ra quay 180° rồi nối lại chỉ đảo chiều trật tự, số lượng gen vẫn giữ nguyên.',
      },
      {
        id: 'cmut_tf_2',
        type: 'true_false',
        question: 'Tỉ lệ sinh con mắc hội chứng Down tăng tỷ lệ thuận theo độ tuổi sinh đẻ của người mẹ (đặc biệt sau 35 tuổi).',
        correctAnswer: true,
        explanation: 'ĐÚNG. Tuổi mẹ càng cao thì tế bào trứng tích lũy càng nhiều đột biến và thoi phân bào dễ bị rối loạn không phân ly.',
      },
      {
        id: 'cmut_tf_3',
        type: 'true_false',
        question: 'Đột biến chuyển đoạn tương hỗ là sự trao đổi các đoạn nhiễm sắc thể giữa hai nhiễm sắc thể trong cùng một cặp tương đồng.',
        correctAnswer: false,
        explanation: 'SAI. Chuyển đoạn là sự trao đổi giữa hai nhiễm sắc thể KHÔNG TƯƠNG ĐỒNG (nếu trong cặp tương đồng thì là trao đổi chéo).',
      },
    ],
  },
};

// Helper function to get randomly sampled questions: strictly 7 MCQs + 3 True/False = 10 questions
export const getRandomizedPracticeQuestionsForTopic = (topicId: string): PracticeQuestion[] => {
  const bank = TOPIC_QUESTION_BANKS[topicId] || TOPIC_QUESTION_BANKS['dna'];

  // Shuffle multiple choice questions and select exactly 7
  const shuffledMcq = [...bank.multipleChoice].sort(() => 0.5 - Math.random());
  const selectedMcq = shuffledMcq.slice(0, 7);

  // Shuffle true/false questions and select exactly 3
  const shuffledTf = [...bank.trueFalse].sort(() => 0.5 - Math.random());
  const selectedTf = shuffledTf.slice(0, 3);

  return [...selectedMcq, ...selectedTf];
};

// Keep backward compatibility
export const getPracticeQuestionsForTopic = (topicId: string): PracticeQuestion[] => {
  return getRandomizedPracticeQuestionsForTopic(topicId);
};

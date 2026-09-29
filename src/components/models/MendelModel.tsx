import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2, ChevronRight, Layers, Award, Volume2, X } from 'lucide-react';
import { ModelSubpartDetail, ModelDetailCard, QuickPartsBar, speakScientificTerm, playToneEffect } from './ModelInspectionHUD';

const MENDEL_DETAILS: Record<string, ModelSubpartDetail> = {
  genotype_AA: {
    id: 'genotype_AA',
    name: 'Kiểu Gene AA (Đồng hợp trội)',
    nameEn: 'Homozygous Dominant Genotype (AA)',
    category: 'Kiểu gene · Thể đồng hợp',
    parentModel: 'Di truyền Mendel · Lai 1 cặp tính trạng',
    structure: 'Mang 2 allele trội giống nhau (A) nằm ở cùng một locus trên cặp nhiễm sắc thể tương đồng.',
    functionRole: 'Quy định kiểu hình trội (hoa tím). Khi giảm phân chỉ tạo ra 1 loại giao tử mang allele A (100% A).',
    keyFact: 'Khi tự thụ phấn hoặc giao phối với cá thể AA cùng loại luôn cho đời con đồng tính 100% kiểu hình trội thuần chủng.',
    colorHex: '#8b5cf6'
  },
  genotype_Aa: {
    id: 'genotype_Aa',
    name: 'Kiểu Gene Aa (Dị hợp tử)',
    nameEn: 'Heterozygous Genotype (Aa)',
    category: 'Kiểu gene · Thể dị hợp',
    parentModel: 'Di truyền Mendel · Lai 1 cặp tính trạng',
    structure: 'Mang 2 allele khác nhau (1 allele trội A và 1 allele lặn a) trên cặp nhiễm sắc thể tương đồng.',
    functionRole: 'Biểu hiện kiểu hình trội (hoa tím) do allele A lấn át hoàn toàn allele a. Khi giảm phân tạo 2 loại giao tử bằng nhau: 50% A : 50% a.',
    keyFact: 'Khi cho F1 (Aa) tự thụ phấn sẽ phân li kiểu hình ở F2 theo tỉ lệ 3 trội : 1 lặn (tỉ lệ kiểu gene 1 AA : 2 Aa : 1 aa).',
    colorHex: '#a855f7'
  },
  genotype_aa: {
    id: 'genotype_aa',
    name: 'Kiểu Gene aa (Đồng hợp lặn)',
    nameEn: 'Homozygous Recessive Genotype (aa)',
    category: 'Kiểu gene · Thể đồng hợp lặn',
    parentModel: 'Di truyền Mendel · Lai 1 cặp tính trạng',
    structure: 'Mang 2 allele lặn giống nhau (a) trên cặp nhiễm sắc thể tương đồng.',
    functionRole: 'Chỉ ở trạng thái đồng hợp lặn thì tính trạng lặn (hoa trắng) mới được biểu hiện ra kiểu hình. Khi giảm phân chỉ tạo ra giao tử mang allele a.',
    keyFact: 'Được dùng làm cơ thể đối chứng trong phép lai phân tích (testcross) để kiểm tra kiểu gene của cá thể có kiểu hình trội.',
    colorHex: '#64748b'
  },
  gamete_A: {
    id: 'gamete_A',
    name: 'Giao tử mang allele trội (A)',
    nameEn: 'Gamete carrying dominant allele A',
    category: 'Giao tử đơn bội (n)',
    parentModel: 'Di truyền Mendel',
    structure: 'Tế bào sinh dục đơn bội mang bộ NST n và chứa 1 allele A duy nhất của cặp nhân tố di truyền.',
    functionRole: 'Tham gia thụ tinh kết hợp ngẫu nhiên với giao tử đực/cái khác để tái lập bộ NST lưỡng bội 2n.',
    keyFact: 'Theo quy luật phân li: trong quá trình giảm phân, các allele trong cặp phân li đồng đều về các giao tử.',
    colorHex: '#0ea5e9'
  },
  gamete_a: {
    id: 'gamete_a',
    name: 'Giao tử mang allele lặn (a)',
    nameEn: 'Gamete carrying recessive allele a',
    category: 'Giao tử đơn bội (n)',
    parentModel: 'Di truyền Mendel',
    structure: 'Giao tử đơn bội n mang allele lặn quy định màu hoa trắng (hoặc tính trạng lặn tương ứng).',
    functionRole: 'Khi kết hợp với giao tử a khác sẽ tạo hợp tử aa biểu hiện tính trạng lặn.',
    keyFact: 'Cá thể dị hợp Aa tạo ra 50% giao tử a và 50% giao tử A.',
    colorHex: '#64748b'
  },
  testcross_homo: {
    id: 'testcross_homo',
    name: 'Lai Phân Tích Cá Thể Đồng Hợp (AA ✕ aa)',
    nameEn: 'Testcross with Homozygous Dominant',
    category: 'Phép lai phân tích (Testcross)',
    parentModel: 'Di truyền Mendel · Hình 37.2',
    structure: 'Phép lai giữa cá thể mang kiểu hình trội đồng hợp (AA) với cá thể mang kiểu hình lặn (aa).',
    functionRole: 'Xác định kiểu gene của cá thể trội: Thế hệ con đồng tính 100% hoa tím (Aa) chứng tỏ cá thể mang kiểu hình trội đem lai là thuần chủng (AA).',
    keyFact: 'Sơ đồ lai: P: AA ✕ aa ➔ Gp: A, a ➔ Fa: 100% Aa (100% hoa tím).',
    colorHex: '#0284c7'
  },
  testcross_hetero: {
    id: 'testcross_hetero',
    name: 'Lai Phân Tích Cá Thể Dị Hợp (Aa ✕ aa)',
    nameEn: 'Testcross with Heterozygous',
    category: 'Phép lai phân tích (Testcross)',
    parentModel: 'Di truyền Mendel · Hình 37.2',
    structure: 'Phép lai giữa cá thể mang kiểu hình trội dị hợp (Aa) với cá thể mang kiểu hình lặn (aa).',
    functionRole: 'Chứng minh cá thể trội không thuần chủng: Thế hệ con lai Fa phân tính theo tỉ lệ 1 trội : 1 lặn (1 hoa tím : 1 hoa trắng).',
    keyFact: 'Sơ đồ lai: P: Aa ✕ aa ➔ Gp: (1/2 A : 1/2 a) ✕ a ➔ Fa: 1 Aa (50% tím) : 1 aa (50% trắng).',
    colorHex: '#f59e0b'
  },
  dihybrid_9331: {
    id: 'dihybrid_9331',
    name: 'Tỉ Lệ Phân Li Độc Lập 9:3:3:1',
    nameEn: '9:3:3:1 Independent Assortment Ratio',
    category: 'Quy luật di truyền · Hình 37.3',
    parentModel: 'Di truyền Mendel · Lai 2 cặp tính trạng',
    structure: 'Gồm 16 tổ hợp giao tử ở đời F2 tạo thành từ 4 loại giao tử đực kết hợp ngẫu nhiên với 4 loại giao tử cái (AB, Ab, aB, ab).',
    functionRole: '9 Vàng, trơn (A-B-) : 3 Vàng, nhăn (A-bb) : 3 Xanh, trơn (aaB-) : 1 Xanh, nhăn (aabb).',
    keyFact: 'Tỉ lệ mỗi loại kiểu hình ở F2 bằng tích tỉ lệ của các tính trạng hợp thành nó: (3 vàng : 1 xanh)(3 trơn : 1 nhăn) = 9:3:3:1.',
    colorHex: '#10b981'
  },
  phenotype_yellow_round: {
    id: 'phenotype_yellow_round',
    name: 'Kiểu hình Hạt Vàng, Vỏ Trơn (9 A-B-)',
    nameEn: 'Yellow, Round Seeds (9 A-B-)',
    category: 'Kiểu hình F2',
    parentModel: 'Mendel Lai 2 cặp tính trạng',
    structure: 'Tập hợp 4 loại kiểu gene: 1 AABB + 2 AABb + 2 AaBB + 4 AaBb = 9 tổ hợp.',
    functionRole: 'Biểu hiện cả 2 tính trạng trội hoàn toàn (hạt màu vàng và vỏ hạt trơn).',
    keyFact: 'Chiếm tỷ lệ lớn nhất (9/16 hay 56.25%) trong thí nghiệm lai 2 cặp tính trạng của Mendel.',
    colorHex: '#f59e0b'
  },
  phenotype_green_wrinkled: {
    id: 'phenotype_green_wrinkled',
    name: 'Kiểu hình Hạt Xanh, Vỏ Nhăn (1 aabb)',
    nameEn: 'Green, Wrinkled Seeds (1 aabb)',
    category: 'Kiểu hình F2',
    parentModel: 'Mendel Lai 2 cặp tính trạng',
    structure: 'Chỉ gồm duy nhất 1 kiểu gene đồng hợp lặn về cả 2 cặp gene: 1 aabb.',
    functionRole: 'Biểu hiện cả 2 tính trạng lặn (hạt màu xanh và vỏ hạt nhăn nheo).',
    keyFact: 'Chiếm tỷ lệ 1/16 (6.25%). Là biến dị tổ hợp giống với bố hoặc mẹ ở thế hệ P ban đầu.',
    colorHex: '#64748b'
  }
};

export const MendelModel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mono_37_1' | 'testcross_37_2' | 'dihybrid_37_3' | 'four_traits_37_1'>('mono_37_1');
  const [testcrossType, setTestcrossType] = useState<'homo' | 'hetero'>('homo');
  const [selectedDetail, setSelectedDetail] = useState<ModelSubpartDetail | null>(null);

  const allParts = Object.values(MENDEL_DETAILS);

  const handleSelectDetail = (detail: ModelSubpartDetail) => {
    setSelectedDetail(detail);
    playToneEffect(600);
  };

  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Thí Nghiệm Di Truyền Mendel Chuẩn SGK Hình 36.1 & 37</h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Bài 36 & 37 · Đậu Hà Lan (Pisum sativum)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quy luật phân li, phép lai phân tích và quy luật phân li độc lập (9:3:3:1) · Nhấp vào bất kỳ chi tiết nào để xem thông tin
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('mono_37_1')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'mono_37_1' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lai 1 Tính Trạng (Hình 37.1)
          </button>
          <button
            onClick={() => setActiveTab('testcross_37_2')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'testcross_37_2' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lai Phân Tích (Hình 37.2)
          </button>
          <button
            onClick={() => setActiveTab('dihybrid_37_3')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'dihybrid_37_3' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lai 2 Tính Trạng (Hình 37.3)
          </button>
          <button
            onClick={() => setActiveTab('four_traits_37_1')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'four_traits_37_1' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4 Cặp Tính Trạng (Bảng 37.1)
          </button>
        </div>
      </div>

      {/* Quick Select Chips */}
      <QuickPartsBar
        parts={allParts}
        selectedId={selectedDetail?.id}
        onSelect={handleSelectDetail}
      />

      {/* VIEW 1: MONOHYBRID CROSS (FIGURE 36.1 & 37.1) */}
      {activeTab === 'mono_37_1' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Schematic Diagram (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-gradient-to-b from-sky-50/50 via-white to-slate-50 rounded-2xl border border-sky-100 p-6 flex flex-col items-center justify-center min-h-[380px] space-y-4">
            <span className="text-xs font-mono font-bold text-sky-700 block text-center bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              HÌNH 37.1 SGK: GIẢI THÍCH THÍ NGHIỆM LAI MỘT TÍNH TRẠNG MÀU HOA
            </span>

            {/* P generation */}
            <div className="w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-around text-xs">
              <button
                onClick={() => handleSelectDetail(MENDEL_DETAILS.genotype_AA)}
                className="text-center space-y-1 p-2 rounded-xl hover:bg-purple-50 transition-all cursor-pointer"
              >
                <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-bold border border-purple-200 block">
                  Cây hoa tím (AA)
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">Giao tử: (A)</span>
              </button>
              <span className="font-extrabold text-slate-400 text-sm">✕ (Lai)</span>
              <button
                onClick={() => handleSelectDetail(MENDEL_DETAILS.genotype_aa)}
                className="text-center space-y-1 p-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-300 block">
                  Cây hoa trắng (aa)
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">Giao tử: (a)</span>
              </button>
            </div>

            {/* F1 generation */}
            <button
              onClick={() => handleSelectDetail(MENDEL_DETAILS.genotype_Aa)}
              className="w-full p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-1 text-xs hover:bg-purple-100/80 transition-all cursor-pointer"
            >
              <span className="text-purple-900 font-bold block">Thế hệ F₁: 100% Cây hoa tím (Aa)</span>
              <span className="text-[11px] text-purple-700 font-medium block">
                Cho F₁ tự thụ phấn: Giao tử F₁ tạo ra: 1/2 (A) : 1/2 (a) • Nhấp để xem chi tiết
              </span>
            </button>

            {/* Punnett Square F2 */}
            <div className="w-full max-w-sm p-4 rounded-2xl bg-white border border-sky-200 shadow-xs space-y-2 font-mono text-xs text-center">
              <span className="text-[11px] text-slate-700 font-sans uppercase font-bold block">
                Khung Punnett thế hệ F₂ (4 tổ hợp giao tử):
              </span>
              <div className="grid grid-cols-3 gap-2 text-center font-bold">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-500">♀ \ ♂</div>
                <button
                  onClick={() => handleSelectDetail(MENDEL_DETAILS.gamete_A)}
                  className="p-2 bg-sky-50 text-sky-700 rounded-xl border border-sky-100 hover:bg-sky-100 transition-colors"
                >
                  Giao tử (A)
                </button>
                <button
                  onClick={() => handleSelectDetail(MENDEL_DETAILS.gamete_a)}
                  className="p-2 bg-sky-50 text-sky-700 rounded-xl border border-sky-100 hover:bg-sky-100 transition-colors"
                >
                  Giao tử (a)
                </button>

                <button
                  onClick={() => handleSelectDetail(MENDEL_DETAILS.gamete_A)}
                  className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors"
                >
                  Giao tử (A)
                </button>
                <button
                  onClick={() => handleSelectDetail(MENDEL_DETAILS.genotype_AA)}
                  className="p-2 bg-purple-100 border border-purple-300 text-purple-900 rounded-xl shadow-xs hover:ring-2 hover:ring-purple-400 transition-all"
                >
                  AA (Tím)
                </button>
                <button
                  onClick={() => handleSelectDetail(MENDEL_DETAILS.genotype_Aa)}
                  className="p-2 bg-purple-100 border border-purple-300 text-purple-900 rounded-xl shadow-xs hover:ring-2 hover:ring-purple-400 transition-all"
                >
                  Aa (Tím)
                </button>

                <button
                  onClick={() => handleSelectDetail(MENDEL_DETAILS.gamete_a)}
                  className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors"
                >
                  Giao tử (a)
                </button>
                <button
                  onClick={() => handleSelectDetail(MENDEL_DETAILS.genotype_Aa)}
                  className="p-2 bg-purple-100 border border-purple-300 text-purple-900 rounded-xl shadow-xs hover:ring-2 hover:ring-purple-400 transition-all"
                >
                  Aa (Tím)
                </button>
                <button
                  onClick={() => handleSelectDetail(MENDEL_DETAILS.genotype_aa)}
                  className="p-2 bg-slate-100 border border-slate-300 text-slate-800 rounded-xl shadow-xs hover:ring-2 hover:ring-slate-400 transition-all"
                >
                  aa (Trắng)
                </button>
              </div>
            </div>

            {/* Result Ratio */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs text-center w-full space-y-1">
              <span className="text-slate-700">
                Tỉ lệ kiểu gene F₂: <strong className="text-sky-700 font-bold">1 AA : 2 Aa : 1 aa</strong>
              </span>
              <span className="block text-emerald-700 font-bold">
                Tỉ lệ kiểu hình F₂: 3 Cây hoa tím : 1 Cây hoa trắng (3 : 1)
              </span>
            </div>
          </div>

          {/* Theory & Law (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-3 text-xs">
              <span className="text-[10px] text-sky-700 font-mono font-bold uppercase block bg-sky-50 px-2 py-0.5 rounded w-fit">
                Nội dung Quy luật Phân li (Mendel)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Nguyên lý di truyền của Mendel:</h4>
              <p className="text-slate-600 leading-relaxed font-normal">
                Mỗi tính trạng do một cặp nhân tố di truyền (cặp allele) quy định. Trong tế bào cơ thể, các nhân tố di truyền tồn tại thành từng cặp riêng rẽ, không hòa trộn vào nhau.
              </p>
              <p className="text-slate-600 leading-relaxed font-normal">
                Khi giảm phân hình thành giao tử, các allele trong cặp phân li đồng đều về các giao tử, nên 50% số giao tử chứa allele này, 50% số giao tử chứa allele kia.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Nhấp vào bất kỳ kiểu gene (AA, Aa, aa) hoặc giao tử ở bảng trên để tra cứu chi tiết cấu tạo và quy tắc.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TESTCROSS (FIGURE 37.2) */}
      {activeTab === 'testcross_37_2' && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-50/40 via-white to-slate-50 border border-sky-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-sky-700 font-mono font-bold uppercase block bg-sky-50 px-2 py-0.5 rounded w-fit border border-sky-200">
                Hình 37.2 SGK Trang 164
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">Sơ Đồ Các Phép Lai Phân Tích Của Mendel</h4>
            </div>

            {/* Testcross toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => {
                  setTestcrossType('homo');
                  handleSelectDetail(MENDEL_DETAILS.testcross_homo);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  testcrossType === 'homo' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trường hợp 1: Đồng hợp (AA)
              </button>
              <button
                onClick={() => {
                  setTestcrossType('hetero');
                  handleSelectDetail(MENDEL_DETAILS.testcross_hetero);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  testcrossType === 'hetero' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trường hợp 2: Dị hợp (Aa)
              </button>
            </div>
          </div>

          {testcrossType === 'homo' ? (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs text-center font-mono">
              <span className="text-xs font-bold text-sky-800 uppercase block font-sans">
                Trường hợp 1: Cá thể đem lai đồng hợp tử trội (AA)
              </span>
              <p className="text-slate-700 font-sans">P: Cây hoa tím (AA) ✕ Cây hoa trắng (aa)</p>
              <p className="text-slate-500 font-bold">Gp: (A) ✕ (a)</p>
              <div className="p-3 bg-emerald-50 rounded-xl max-w-sm mx-auto border border-emerald-300 text-emerald-900 font-bold shadow-xs">
                F₁: 100% Aa (100% Cây hoa tím)
              </div>
              <p className="text-slate-600 font-sans text-xs pt-1 font-medium">
                ➜ Kết luận: Nếu thế hệ con lai đồng tính thì cây đem lai có kiểu gene đồng hợp trội (AA).
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs text-center font-mono">
              <span className="text-xs font-bold text-amber-800 uppercase block font-sans">
                Trường hợp 2: Cá thể đem lai dị hợp tử (Aa)
              </span>
              <p className="text-slate-700 font-sans">P: Cây hoa tím (Aa) ✕ Cây hoa trắng (aa)</p>
              <p className="text-slate-500 font-bold">Gp: (1/2 A : 1/2 a) ✕ (a)</p>
              <div className="p-3 bg-amber-50 rounded-xl max-w-sm mx-auto border border-amber-300 text-amber-900 font-bold shadow-xs">
                F₁: 1 Aa (50% hoa tím) : 1 aa (50% hoa trắng)
              </div>
              <p className="text-slate-600 font-sans text-xs pt-1 font-medium">
                ➜ Kết luận: Nếu thế hệ con lai phân tính theo tỉ lệ 1 : 1 thì cây đem lai có kiểu gene dị hợp (Aa).
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: DIHYBRID CROSS (FIGURE 37.3) */}
      {activeTab === 'dihybrid_37_3' && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-50/40 via-white to-slate-50 border border-sky-100 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-sky-700 font-mono font-bold uppercase block bg-sky-50 px-2 py-0.5 rounded w-fit border border-sky-200">
                Hình 37.3 SGK Trang 165
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                Quy Luật Phân Li Độc Lập: Lai 2 Tính Trạng (Màu hạt & Dạng hạt)
              </h4>
            </div>
            <button
              onClick={() => handleSelectDetail(MENDEL_DETAILS.dihybrid_9331)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-500 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Xem quy luật 9:3:3:1
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs font-mono">
            <div className="text-center font-sans space-y-1">
              <span className="text-slate-700 block font-medium">
                P thuần chủng: Cây hạt vàng, vỏ trơn (AABB) ✕ Cây hạt xanh, vỏ nhăn (aabb)
              </span>
              <span className="text-amber-700 font-bold block">
                F₁: 100% Cây hạt vàng, vỏ trơn (AaBb) ── tự thụ phấn
              </span>
            </div>

            {/* 9:3:3:1 Phenotype Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center font-sans">
              <button
                onClick={() => handleSelectDetail(MENDEL_DETAILS.phenotype_yellow_round)}
                className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-xs hover:ring-2 hover:ring-amber-400 transition-all cursor-pointer"
              >
                <span className="text-xl font-black block">9</span>
                <span className="text-[11px] font-bold">Vàng, trơn</span>
                <span className="text-[10px] text-amber-700 font-mono block">A-B-</span>
              </button>
              <button
                onClick={() => handleSelectDetail(MENDEL_DETAILS.dihybrid_9331)}
                className="p-3 rounded-2xl bg-yellow-50 border border-yellow-300 text-yellow-900 shadow-xs hover:ring-2 hover:ring-yellow-400 transition-all cursor-pointer"
              >
                <span className="text-xl font-black block">3</span>
                <span className="text-[11px] font-bold">Vàng, nhăn</span>
                <span className="text-[10px] text-yellow-700 font-mono block">A-bb</span>
              </button>
              <button
                onClick={() => handleSelectDetail(MENDEL_DETAILS.dihybrid_9331)}
                className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-xs hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer"
              >
                <span className="text-xl font-black block">3</span>
                <span className="text-[11px] font-bold">Xanh, trơn</span>
                <span className="text-[10px] text-emerald-700 font-mono block">aaB-</span>
              </button>
              <button
                onClick={() => handleSelectDetail(MENDEL_DETAILS.phenotype_green_wrinkled)}
                className="p-3 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 shadow-xs hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer"
              >
                <span className="text-xl font-black block">1</span>
                <span className="text-[11px] font-bold">Xanh, nhăn</span>
                <span className="text-[10px] text-slate-600 font-mono block">aabb</span>
              </button>
            </div>

            <p className="text-center text-slate-600 font-sans text-xs pt-1 font-medium">
              Khung Punnett 16 tổ hợp giao tử ở F₂ chứng minh: Các cặp nhân tố di truyền phân li độc lập và tổ hợp tự do trong quá trình thụ tinh.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 4: FOUR TRAITS TABLE 37.1 */}
      {activeTab === 'four_traits_37_1' && (
        <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] text-sky-700 font-mono font-bold uppercase block bg-sky-50 px-2 py-0.5 rounded w-fit border border-sky-200">
              Bảng 37.1 SGK Trang 162
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-1">Kết Quả Bốn Thí Nghiệm Của Mendel Về Phép Lai Một Tính Trạng</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-2.5">Tính trạng</th>
                  <th className="p-2.5">P thuần chủng</th>
                  <th className="p-2.5">F₁</th>
                  <th className="p-2.5">Số lượng ở F₂</th>
                  <th className="p-2.5">Tỉ lệ F₂</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
                <tr className="hover:bg-sky-50/50 cursor-pointer" onClick={() => handleSelectDetail(MENDEL_DETAILS.phenotype_yellow_round)}>
                  <td className="p-2.5 font-bold font-sans text-sky-800">Dạng hạt</td>
                  <td className="p-2.5">Trơn ✕ Nhăn</td>
                  <td className="p-2.5 text-emerald-700 font-bold">100% trơn</td>
                  <td className="p-2.5">5 474 trơn : 1 850 nhăn</td>
                  <td className="p-2.5 font-bold text-amber-700">2,96 : 1 (~3:1)</td>
                </tr>
                <tr className="hover:bg-sky-50/50 cursor-pointer" onClick={() => handleSelectDetail(MENDEL_DETAILS.dihybrid_9331)}>
                  <td className="p-2.5 font-bold font-sans text-sky-800">Màu hạt</td>
                  <td className="p-2.5">Vàng ✕ Xanh</td>
                  <td className="p-2.5 text-emerald-700 font-bold">100% vàng</td>
                  <td className="p-2.5">6 022 vàng : 2 001 xanh</td>
                  <td className="p-2.5 font-bold text-amber-700">3,01 : 1 (~3:1)</td>
                </tr>
                <tr className="hover:bg-sky-50/50 cursor-pointer" onClick={() => handleSelectDetail(MENDEL_DETAILS.genotype_Aa)}>
                  <td className="p-2.5 font-bold font-sans text-sky-800">Chiều cao cây</td>
                  <td className="p-2.5">Cao ✕ Thấp</td>
                  <td className="p-2.5 text-emerald-700 font-bold">100% thân cao</td>
                  <td className="p-2.5">787 cao : 277 thấp</td>
                  <td className="p-2.5 font-bold text-amber-700">2,84 : 1 (~3:1)</td>
                </tr>
                <tr className="hover:bg-sky-50/50 cursor-pointer" onClick={() => handleSelectDetail(MENDEL_DETAILS.genotype_AA)}>
                  <td className="p-2.5 font-bold font-sans text-sky-800">Màu hoa</td>
                  <td className="p-2.5">Tím ✕ Trắng</td>
                  <td className="p-2.5 text-emerald-700 font-bold">100% hoa tím</td>
                  <td className="p-2.5">705 hoa tím : 224 hoa trắng</td>
                  <td className="p-2.5 font-bold text-amber-700">3,15 : 1 (~3:1)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail inspection card popup */}
      {selectedDetail && (
        <ModelDetailCard
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onSelectDetail={handleSelectDetail}
          allParts={allParts}
        />
      )}
    </div>
  );
};

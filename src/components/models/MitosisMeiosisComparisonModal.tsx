import React, { useState } from 'react';
import { X, Scale, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface MitosisMeiosisComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: 'mitosis' | 'meiosis';
}

export const MitosisMeiosisComparisonModal: React.FC<MitosisMeiosisComparisonModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'mitosis'
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'chromosome_stats' | 'key_distinctions'>('comparison');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-sky-500 to-pink-500 text-white shadow-md">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                So Sánh Chuyên Sâu: Nguyên Phân &amp; Giảm Phân
              </h3>
              <p className="text-xs text-slate-400">
                Cẩm nang phân biệt trọng tâm ôn thi môn Sinh học THCS &amp; THPT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'comparison'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Bảng So Sánh Toàn Diện</span>
          </button>
          <button
            onClick={() => setActiveTab('chromosome_stats')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'chromosome_stats'
                ? 'border-pink-400 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Biến Động Số Lượng NST (Ôn Thi Trắc Nghiệm)</span>
          </button>
          <button
            onClick={() => setActiveTab('key_distinctions')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'key_distinctions'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>3 Điểm Khác Biệt Sống Còn</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs leading-relaxed">
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-inner">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 font-mono text-[11px] uppercase border-b border-slate-800">
                      <th className="p-3 w-1/4">Đặc Điểm So Sánh</th>
                      <th className="p-3 w-3/8 text-sky-400 bg-sky-950/20">Nguyên Phân (Mitosis)</th>
                      <th className="p-3 w-3/8 text-pink-400 bg-pink-950/20">Giảm Phân (Meiosis)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-400">Loại tế bào xảy ra</td>
                      <td className="p-3">Tế bào sinh dưỡng (xôma) và tế bào sinh dục sơ khai.</td>
                      <td className="p-3">Tế bào sinh dục thời kỳ chín (tạo tinh hoặc tạo trứng).</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-400">Số lần phân bào</td>
                      <td className="p-3"><strong className="text-sky-300">1 lần phân bào</strong> duy nhất.</td>
                      <td className="p-3"><strong className="text-pink-300">2 lần phân bào liên tiếp</strong> (Giảm phân I &amp; II).</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-400">Số lần nhân đôi ADN &amp; NST</td>
                      <td className="p-3">1 lần ở pha S kỳ trung gian.</td>
                      <td className="p-3">1 lần duy nhất ở kỳ trung gian trước Giảm phân I (không nhân đôi ở GP II).</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-400">Tiếp hợp &amp; Trao đổi chéo</td>
                      <td className="p-3 text-slate-400">Không có hiện tượng tiếp hợp và trao đổi chéo.</td>
                      <td className="p-3 text-amber-300 font-medium">Có ở Kỳ đầu I (Prophase I) giữa 2 chromatid phi chị em tại điểm Chiasma ➔ hoán vị gen.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-400">Sắp xếp NST ở Kỳ giữa</td>
                      <td className="p-3">NST kép co xoắn cực đại, xếp thành <strong className="text-sky-300">1 hàng</strong> trên mặt phẳng xích đạo.</td>
                      <td className="p-3">
                        • <strong>Kỳ giữa I:</strong> Cặp tương đồng xếp thành <strong className="text-pink-300">2 hàng song song</strong>.<br />
                        • <strong>Kỳ giữa II:</strong> n NST kép xếp thành 1 hàng.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-400">Phân ly ở Kỳ sau</td>
                      <td className="p-3">Tâm động tách đôi, 2 chromatid tách thành 2 NST đơn phân ly về 2 cực.</td>
                      <td className="p-3">
                        • <strong>Kỳ sau I:</strong> NST kép trong cặp tương đồng phân ly về 2 cực (tâm động <em>chưa</em> tách).<br />
                        • <strong>Kỳ sau II:</strong> Tâm động tách, 2 chromatid tách thành 2 NST đơn.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-400">Kết quả tế bào con</td>
                      <td className="p-3 font-bold text-sky-300">Tạo 2 tế bào con lưỡng bội (2n) có bộ gen giống hệt nhau và giống tế bào mẹ.</td>
                      <td className="p-3 font-bold text-pink-300">Tạo 4 tế bào con đơn bội (n), mang tổ hợp gen tái tổ hợp đa dạng độc nhất.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-400">Ý nghĩa sinh học</td>
                      <td className="p-3">Giúp cơ thể lớn lên, sinh trưởng, tái sinh mô tổn thương và sinh sản vô tính.</td>
                      <td className="p-3">Tạo nguồn biến dị tổ hợp vô tận cho chọn giống và tiến hóa; kết hợp với thụ tinh duy trì bộ NST loài.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'chromosome_stats' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-4 w-4" /> Bảng Ghi Nhớ Nhanh Quy Tắc Số Lượng NST (Ví dụ loài có 2n = 4)
                </p>
                <p className="text-[11px] text-amber-300/90">
                  Dùng để giải các bài toán tính số NST, chromatid, tâm động ở từng kỳ phân bào trong các đề thi THPT và HSG Sinh học.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mitosis Column */}
                <div className="rounded-2xl border border-sky-800/60 bg-slate-950/70 p-4 space-y-3">
                  <h4 className="font-black text-sky-300 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    Nguyên Phân (Tế bào ban đầu 2n = 4)
                  </h4>
                  <div className="overflow-x-auto text-[11px]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-1.5">Kỳ</th>
                          <th className="py-1.5">Số NST</th>
                          <th className="py-1.5">Trạng thái</th>
                          <th className="py-1.5">Chromatid</th>
                          <th className="py-1.5">Tâm động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="py-1.5 font-bold">Kỳ đầu</td>
                          <td className="py-1.5">2n = 4</td>
                          <td className="py-1.5 text-sky-400">Kép</td>
                          <td className="py-1.5">8</td>
                          <td className="py-1.5">4</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold">Kỳ giữa</td>
                          <td className="py-1.5">2n = 4</td>
                          <td className="py-1.5 text-sky-400">Kép</td>
                          <td className="py-1.5">8</td>
                          <td className="py-1.5">4</td>
                        </tr>
                        <tr className="bg-sky-500/10 font-bold text-sky-200">
                          <td className="py-1.5">Kỳ sau</td>
                          <td className="py-1.5 text-amber-300">4n = 8</td>
                          <td className="py-1.5">Đơn</td>
                          <td className="py-1.5 text-rose-400">0</td>
                          <td className="py-1.5">8</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold">Kỳ cuối (mỗi nhân)</td>
                          <td className="py-1.5">2n = 4</td>
                          <td className="py-1.5">Đơn</td>
                          <td className="py-1.5 text-rose-400">0</td>
                          <td className="py-1.5">4</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Meiosis Column */}
                <div className="rounded-2xl border border-pink-800/60 bg-slate-950/70 p-4 space-y-3">
                  <h4 className="font-black text-pink-300 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                    Giảm Phân (Tế bào ban đầu 2n = 4)
                  </h4>
                  <div className="overflow-x-auto text-[11px]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-1.5">Kỳ</th>
                          <th className="py-1.5">Số NST</th>
                          <th className="py-1.5">Trạng thái</th>
                          <th className="py-1.5">Chromatid</th>
                          <th className="py-1.5">Tâm động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="py-1.5 font-bold">Kỳ đầu I</td>
                          <td className="py-1.5">2n = 4</td>
                          <td className="py-1.5 text-pink-400">Kép</td>
                          <td className="py-1.5">8</td>
                          <td className="py-1.5">4</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold">Kỳ giữa I</td>
                          <td className="py-1.5">2n = 4</td>
                          <td className="py-1.5 text-pink-400">Kép (2 hàng)</td>
                          <td className="py-1.5">8</td>
                          <td className="py-1.5">4</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold">Kỳ sau I</td>
                          <td className="py-1.5">2n = 4</td>
                          <td className="py-1.5 text-pink-400">Kép (phân ly)</td>
                          <td className="py-1.5">8</td>
                          <td className="py-1.5">4</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold">Kỳ cuối I (mỗi tb)</td>
                          <td className="py-1.5 text-amber-300">n = 2</td>
                          <td className="py-1.5 text-pink-400">Kép</td>
                          <td className="py-1.5">4</td>
                          <td className="py-1.5">2</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold">Kỳ giữa II</td>
                          <td className="py-1.5">n = 2</td>
                          <td className="py-1.5 text-pink-400">Kép (1 hàng)</td>
                          <td className="py-1.5">4</td>
                          <td className="py-1.5">2</td>
                        </tr>
                        <tr className="bg-pink-500/10 font-bold text-pink-200">
                          <td className="py-1.5">Kỳ sau II</td>
                          <td className="py-1.5 text-amber-300">2n = 4</td>
                          <td className="py-1.5">Đơn</td>
                          <td className="py-1.5 text-rose-400">0</td>
                          <td className="py-1.5">4</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold">Kỳ cuối II (giao tử)</td>
                          <td className="py-1.5 text-emerald-400 font-black">n = 2</td>
                          <td className="py-1.5">Đơn</td>
                          <td className="py-1.5 text-rose-400">0</td>
                          <td className="py-1.5">2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'key_distinctions' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <h4 className="font-bold text-sky-300 text-sm">Xếp hàng ở Kỳ giữa: 1 Hàng vs 2 Hàng</h4>
                </div>
                <p className="text-slate-300 pl-8">
                  • Ở <strong>Nguyên phân</strong>: Toàn bộ NST kép xếp thành <strong>MỘT HÀNG</strong> trên mặt phẳng xích đạo.<br />
                  • Ở <strong>Kỳ giữa I Giảm phân</strong>: CÁC CẶP NST KÉP TƯƠNG ĐỒNG bắt cặp và xếp thành <strong>HAI HÀNG SONG SONG</strong> đối xứng qua mặt phẳng xích đạo. Đây là dấu hiệu nhận diện kỳ giữa GP I trên tiêu bản kính hiển vi!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <h4 className="font-bold text-pink-300 text-sm">Hành vi tâm động ở Kỳ sau</h4>
                </div>
                <p className="text-slate-300 pl-8">
                  • Ở <strong>Nguyên phân và Kỳ sau II Giảm phân</strong>: Tâm động <strong>BẮT BUỘC TÁCH ĐÔI</strong>, biến 1 NST kép thành 2 NST đơn.<br />
                  • Ở <strong>Kỳ sau I Giảm phân</strong>: Tâm động <strong>KHÔNG TÁCH</strong>! Toàn bộ chiếc NST kép nguyên vẹn trong cặp tương đồng phân ly về 2 cực tế bào.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <h4 className="font-bold text-amber-300 text-sm">Trao đổi chéo tại Chiasma &amp; Đa dạng di truyền</h4>
                </div>
                <p className="text-slate-300 pl-8">
                  • <strong>Nguyên phân</strong> là cơ chế sao chép bảo tồn tuyệt đối (nhân bản tế bào sinh dưỡng).<br />
                  • <strong>Giảm phân</strong> là cỗ máy tạo biến dị phong phú nhờ sự bắt chéo (Chiasma) trao đổi các đoạn nhiễm sắc thể của bố và mẹ ở Kỳ đầu I, cùng sự phân ly ngẫu nhiên của các cặp NST ở Kỳ sau I.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Mẹo: Kéo thanh trượt 3D để đối chiếu trực tiếp các kỳ với bảng trên</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};

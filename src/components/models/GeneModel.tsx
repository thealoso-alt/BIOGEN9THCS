import React, { useState } from 'react';
import { Info, Play, RotateCcw, Sparkles, Box, LayoutGrid } from 'lucide-react';
import { R3FGeneCanvas } from './R3FGeneCanvas';

export const GeneModel: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState<'promoter' | 'coding' | 'terminator'>('coding');
  const [showExons, setShowExons] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | 'schematic'>('3d');

  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Mô hình Cấu trúc Cụm Gene Điển hình</h3>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Gene Architecture 3D
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mô hình trực quan hoá không gian 3D cấu trúc gene và chuỗi xoắn kép tương tác trực tiếp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D Fiber & Drei</span>
            </button>
            <button
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'schematic'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Sơ đồ phân vùng</span>
            </button>
          </div>

          {viewMode === 'schematic' && (
            <button
              onClick={() => setShowExons(!showExons)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                showExons ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              {showExons ? 'Hiện Exon / Intron' : 'Gene liên tục'}
            </button>
          )}
        </div>
      </div>

      {viewMode === '3d' ? (
        <div className="mt-5 space-y-4">
          <R3FGeneCanvas />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-red-50/80 border border-red-100 rounded-xl flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-xs shrink-0" />
              <div>
                <p className="font-bold text-red-950">A (Adenine)</p>
                <p className="text-[11px] text-red-700">Bắt cặp T (2 lk H)</p>
              </div>
            </div>
            <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-xs shrink-0" />
              <div>
                <p className="font-bold text-blue-950">T (Thymine)</p>
                <p className="text-[11px] text-blue-700">Bắt cặp A (2 lk H)</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50/80 border border-amber-100 rounded-xl flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs shrink-0" />
              <div>
                <p className="font-bold text-amber-950">G (Guanine)</p>
                <p className="text-[11px] text-amber-700">Bắt cặp C (3 lk H)</p>
              </div>
            </div>
            <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">C (Cytosine)</p>
                <p className="text-[11px] text-emerald-700">Bắt cặp G (3 lk H)</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Visual Schematic */
      <div className="mt-5 bg-gradient-to-b from-sky-50/50 via-white to-slate-50 rounded-2xl border border-sky-100 p-6 flex flex-col items-center">
        <div className="text-xs font-mono text-slate-500 mb-4 flex items-center justify-between w-full max-w-2xl px-2 font-bold">
          <span className="text-sky-700">Đầu 3&apos; (Mạch khuôn)</span>
          <span className="text-amber-700">Chiều phiên mã ──→</span>
          <span className="text-indigo-700">Đầu 5&apos; (Mạch khuôn)</span>
        </div>

        {/* Gene Strand Bar */}
        <div className="w-full max-w-2xl flex rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md min-h-[72px]">
          {/* Vùng điều hòa (Promoter) */}
          <button
            onClick={() => setActiveRegion('promoter')}
            className={`flex-1 p-3 flex flex-col items-center justify-center transition-all ${
              activeRegion === 'promoter'
                ? 'bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-2 ring-offset-white font-bold'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            <span className="font-bold text-xs">VÙNG ĐIỀU HÒA</span>
            <span className="text-[10px] opacity-90 font-mono">Promoter (3&apos;)</span>
          </button>

          {/* Vùng mã hóa (Coding region) */}
          <button
            onClick={() => setActiveRegion('coding')}
            className={`flex-[2.5] p-3 flex flex-col items-center justify-center transition-all border-x border-slate-200 ${
              activeRegion === 'coding'
                ? 'bg-sky-600 text-white ring-2 ring-sky-300 ring-offset-2 ring-offset-white font-bold'
                : 'bg-sky-100 text-sky-900 hover:bg-sky-200'
            }`}
          >
            <span className="font-bold text-xs">VÙNG MÃ HÓA (CODING REGION)</span>
            {showExons ? (
              <div className="flex items-center gap-1 mt-1 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold shadow-xs">Exon 1</span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">Intron</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold shadow-xs">Exon 2</span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">Intron</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold shadow-xs">Exon 3</span>
              </div>
            ) : (
              <span className="text-[10px] opacity-90 font-mono">Mang thông tin mã hóa amino acid</span>
            )}
          </button>

          {/* Vùng kết thúc (Terminator) */}
          <button
            onClick={() => setActiveRegion('terminator')}
            className={`flex-1 p-3 flex flex-col items-center justify-center transition-all ${
              activeRegion === 'terminator'
                ? 'bg-rose-600 text-white ring-2 ring-rose-300 ring-offset-2 ring-offset-white font-bold'
                : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
            }`}
          >
            <span className="font-bold text-xs">VÙNG KẾT THÚC</span>
            <span className="text-[10px] opacity-90 font-mono">Terminator (5&apos;)</span>
          </button>
        </div>

        {/* Detailed Explanation for Active Region */}
        <div className="w-full max-w-2xl mt-6 p-5 rounded-2xl bg-white border border-sky-100 shadow-md text-xs">
          {activeRegion === 'promoter' && (
            <div className="space-y-1.5 text-amber-900">
              <h4 className="font-bold text-sm text-amber-800 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-600" /> 1. Vùng điều hòa (Promoter Region)
              </h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                Nằm ở đầu 3&apos; của mạch mã gốc (tương ứng đầu 5&apos; của mạch bổ sung). Mang tín hiệu khởi động và kiểm soát quá trình phiên mã.
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                Là vị trí nhận biết và liên kết đặc hiệu của enzyme <strong className="text-slate-900">RNA polymerase</strong> để bắt đầu tổng hợp mARN.
              </p>
            </div>
          )}

          {activeRegion === 'coding' && (
            <div className="space-y-1.5 text-sky-950">
              <h4 className="font-bold text-sm text-sky-800 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-sky-600" /> 2. Vùng mã hóa (Coding Region)
              </h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                Mang thông tin di truyền mã hóa các amino acid cấu tạo nên chuỗi polypeptide hoặc phân tử RNA.
              </p>
              {showExons ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-xs" />
                    <span className="text-emerald-800 font-bold">Exon:</span>
                    <span className="text-slate-600 font-medium">Đoạn mang thông tin mã hóa amino acid (được giữ lại trong mARN trưởng thành).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-slate-400" />
                    <span className="text-slate-700 font-bold">Intron:</span>
                    <span className="text-slate-600 font-medium">Đoạn không mã hóa amino acid (bị cắt bỏ trong quá trình hoàn thiện mARN ở sinh vật nhân thực).</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 font-medium">
                  Ở sinh vật nhân sơ, vùng mã hóa là liên tục (gene không phân mảnh), toàn bộ đều mã hóa amino acid.
                </p>
              )}
            </div>
          )}

          {activeRegion === 'terminator' && (
            <div className="space-y-1.5 text-rose-900">
              <h4 className="font-bold text-sm text-rose-800 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-rose-600" /> 3. Vùng kết thúc (Terminator Region)
              </h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                Nằm ở đầu 5&apos; của mạch mã gốc (tương ứng đầu 3&apos; của mạch bổ sung).
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                Chứa trình tự nucleotide đặc biệt phát tín hiệu cho enzyme RNA polymerase ngừng phiên mã và giải phóng phân tử RNA sơ khai.
              </p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

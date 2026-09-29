import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2, Info, Eye, Box } from 'lucide-react';
import { DnaInteractiveLab } from './DnaInteractiveLab';

interface BasePair {
  id: number;
  left: 'A' | 'T' | 'G' | 'C';
  right: 'A' | 'T' | 'G' | 'C';
  bonds: 2 | 3;
}

const INITIAL_PAIRS: BasePair[] = [
  { id: 1, left: 'A', right: 'T', bonds: 2 },
  { id: 2, left: 'T', right: 'A', bonds: 2 },
  { id: 3, left: 'G', right: 'C', bonds: 3 },
  { id: 4, left: 'C', right: 'G', bonds: 3 },
  { id: 5, left: 'A', right: 'T', bonds: 2 },
  { id: 6, left: 'G', right: 'C', bonds: 3 },
  { id: 7, left: 'T', right: 'A', bonds: 2 },
  { id: 8, left: 'C', right: 'G', bonds: 3 },
  { id: 9, left: 'A', right: 'T', bonds: 2 },
  { id: 10, left: 'G', right: 'C', bonds: 3 },
];

export const InteractiveDnaModel: React.FC = () => {
  const [viewFormat, setViewFormat] = useState<'3d' | '2d'>('3d');
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [selectedPair, setSelectedPair] = useState<BasePair | null>(INITIAL_PAIRS[0]);
  const [mode, setMode] = useState<'helix' | 'unwound' | 'matching'>('helix');
  const [matchChoice, setMatchChoice] = useState<'A' | 'T' | 'G' | 'C' | null>(null);
  const [matchResult, setMatchResult] = useState<string | null>(null);

  if (viewFormat === '3d') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <button
            onClick={() => setViewFormat('2d')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Chuyển sang Sơ đồ 2D</span>
          </button>
        </div>
        <DnaInteractiveLab />
      </div>
    );
  }

  // Rotation animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 1.2 * speed) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handleBaseMatch = (base: 'A' | 'T' | 'G' | 'C') => {
    setMatchChoice(base);
    if (!selectedPair) return;
    const target = selectedPair.left;
    const isCorrect =
      (target === 'A' && base === 'T') ||
      (target === 'T' && base === 'A') ||
      (target === 'G' && base === 'C') ||
      (target === 'C' && base === 'G');

    if (isCorrect) {
      const bonds = target === 'A' || target === 'T' ? 2 : 3;
      setMatchResult(`Chính xác! ${target} liên kết bổ sung với ${base} bằng ${bonds} liên kết hydrogen.`);
    } else {
      setMatchResult(`Chưa đúng! Trong phân tử DNA, ${target} chỉ liên kết bổ sung với ${target === 'A' ? 'T' : target === 'T' ? 'A' : target === 'G' ? 'C' : 'G'}.`);
    }
  };

  const getBaseColor = (base: string) => {
    switch (base) {
      case 'A':
        return { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-500', fill: '#dc2626' };
      case 'T':
        return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-500', fill: '#2563eb' };
      case 'G':
        return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-500', fill: '#059669' };
      case 'C':
        return { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500', fill: '#d97706' };
      default:
        return { bg: 'bg-slate-500', text: 'text-slate-600', border: 'border-slate-500', fill: '#64748b' };
    }
  };

  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-5 sm:p-6 shadow-xl shadow-sky-100/40 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">Mô hình Tương tác Phân tử DNA</h3>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Watson - Crick 3D
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Xoay mô hình, khảo sát các cặp nitrogenous base bổ sung (A-T: 2 liên kết, G-C: 3 liên kết)
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewFormat('3d')}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/25 transition-all"
          >
            <Box className="h-3.5 w-3.5" />
            <span>Mở 3D WebGL Lab</span>
          </button>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setMode('helix')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mode === 'helix' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xoắn kép
            </button>
            <button
              onClick={() => setMode('unwound')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mode === 'unwound' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mở xoắn phẳng
            </button>
            <button
              onClick={() => setMode('matching')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                mode === 'matching' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ghép cặp A-T / G-C
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
        {/* Canvas / SVG Visualizer Area */}
        <div className="lg:col-span-8 bg-gradient-to-b from-sky-50/70 via-white to-sky-100/40 rounded-2xl border border-sky-100 p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[340px] shadow-inner">
          {mode === 'helix' && (
            <div className="w-full flex flex-col items-center">
              <svg viewBox="0 0 400 320" className="w-full max-w-[420px] h-[300px]">
                <defs>
                  <linearGradient id="backboneLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                  <linearGradient id="backboneRight" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>

                {/* Render base pairs with 3D sine oscillation */}
                {INITIAL_PAIRS.map((pair, i) => {
                  const stepAngle = rotationAngle * (Math.PI / 180) + i * 0.65;
                  const cosVal = Math.cos(stepAngle);
                  const sinVal = Math.sin(stepAngle);
                  const y = 30 + i * 27;
                  const centerX = 200;
                  const span = 85 * cosVal;

                  const x1 = centerX - span;
                  const x2 = centerX + span;
                  const zDepth = sinVal; // For depth sorting
                  const opacity = 0.4 + 0.6 * ((zDepth + 1) / 2);
                  const strokeWidth = 3 + 2 * ((zDepth + 1) / 2);

                  const isSelected = selectedPair?.id === pair.id;

                  return (
                    <g
                      key={pair.id}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => setSelectedPair(pair)}
                      opacity={opacity}
                    >
                      {/* Hydrogen bonds line */}
                      <line
                        x1={x1}
                        y1={y}
                        x2={x2}
                        y2={y}
                        stroke={pair.bonds === 3 ? '#d97706' : '#2563eb'}
                        strokeWidth={strokeWidth}
                        strokeDasharray={pair.bonds === 3 ? '4,3' : '6,4'}
                      />

                      {/* Left Nucleotide node */}
                      <circle
                        cx={x1}
                        cy={y}
                        r={isSelected ? 16 : 13}
                        fill={getBaseColor(pair.left).fill}
                        stroke={isSelected ? '#0284c7' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 2}
                      />
                      <text
                        x={x1}
                        y={y + 4.5}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="900"
                        className="pointer-events-none select-none font-mono"
                      >
                        {pair.left}
                      </text>

                      {/* Right Nucleotide node */}
                      <circle
                        cx={x2}
                        cy={y}
                        r={isSelected ? 16 : 13}
                        fill={getBaseColor(pair.right).fill}
                        stroke={isSelected ? '#0284c7' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 2}
                      />
                      <text
                        x={x2}
                        y={y + 4.5}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="900"
                        className="pointer-events-none select-none font-mono"
                      >
                        {pair.right}
                      </text>

                      {/* Bond count indicator in center */}
                      {isSelected && (
                        <rect
                          x={centerX - 18}
                          y={y - 8}
                          width={36}
                          height={16}
                          rx={8}
                          fill="#ffffff"
                          stroke="#0284c7"
                          strokeWidth="1.5"
                        />
                      )}
                      {isSelected && (
                        <text
                          x={centerX}
                          y={y + 4}
                          textAnchor="middle"
                          fill="#0284c7"
                          fontSize="9"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {pair.bonds} H-bonds
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {mode === 'unwound' && (
            <div className="w-full py-4 flex flex-col items-center">
              <div className="text-xs text-slate-500 mb-3 flex items-center gap-4">
                <span className="font-mono text-sky-600 font-bold">Mạch 1: 5&apos; ──→ 3&apos;</span>
                <span className="font-mono text-indigo-600 font-bold">Mạch 2: 3&apos; ←── 5&apos;</span>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-[420px]">
                {INITIAL_PAIRS.slice(0, 6).map(pair => (
                  <div
                    key={pair.id}
                    onClick={() => setSelectedPair(pair)}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                      selectedPair?.id === pair.id
                        ? 'border-sky-500 bg-sky-50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-sky-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-white text-xs ${getBaseColor(pair.left).bg}`}>
                        {pair.left}
                      </span>
                      <span className="text-xs text-slate-700 font-medium">Mạch gốc</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 font-mono text-[10px] text-amber-600 font-bold">
                        {pair.bonds === 2 ? '═ 2 H-bonds ═' : '≡ 3 H-bonds ≡'}
                      </div>
                      <span className="text-[10px] text-slate-400">Nguyên tắc bổ sung</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-700 font-medium">Mạch bổ sung</span>
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-white text-xs ${getBaseColor(pair.right).bg}`}>
                        {pair.right}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'matching' && (
            <div className="w-full max-w-md flex flex-col items-center text-center p-3">
              <p className="text-xs text-slate-600 mb-4 font-medium">
                Chọn nucleotide bổ sung chính xác cho vị trí được đánh dấu trên mạch khuôn DNA:
              </p>

              {selectedPair && (
                <div className="flex items-center justify-center gap-6 my-4 p-4 rounded-2xl bg-white border border-sky-100 shadow-sm w-full">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">Mạch khuôn</span>
                    <span className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-extrabold text-white text-2xl shadow-md ${getBaseColor(selectedPair.left).bg}`}>
                      {selectedPair.left}
                    </span>
                    <span className="text-xs text-slate-700 font-semibold">
                      {selectedPair.left === 'A' ? 'Adenine' : selectedPair.left === 'T' ? 'Thymine' : selectedPair.left === 'G' ? 'Guanine' : 'Cytosine'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-sky-600">
                    <span className="text-2xl font-mono font-bold">⟷</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ghép với?</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">Lựa chọn của bạn</span>
                    <div className={`w-14 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center font-mono font-extrabold text-2xl ${
                      matchChoice
                        ? `${getBaseColor(matchChoice).bg} text-white border-transparent`
                        : 'border-sky-400 bg-sky-50 text-sky-600'
                    }`}>
                      {matchChoice || '?'}
                    </div>
                    <span className="text-xs text-slate-400">Chọn ở dưới</span>
                  </div>
                </div>
              )}

              {/* 4 Choices */}
              <div className="grid grid-cols-4 gap-2 w-full mt-2">
                {(['A', 'T', 'G', 'C'] as const).map(base => (
                  <button
                    key={base}
                    onClick={() => handleBaseMatch(base)}
                    className={`py-2.5 rounded-xl border font-mono font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xs ${
                      matchChoice === base
                        ? 'border-sky-500 bg-sky-600 text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300'
                    }`}
                  >
                    <span className={`inline-block w-3 h-3 rounded-full mr-1.5 ${getBaseColor(base).bg}`} />
                    {base}
                  </button>
                ))}
              </div>

              {matchResult && (
                <div className={`mt-3 w-full p-2.5 rounded-xl text-xs flex items-center gap-2 text-left font-medium ${
                  matchResult.startsWith('Chính xác')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{matchResult}</span>
                </div>
              )}
            </div>
          )}

          {/* Controls Bar */}
          <div className="w-full flex items-center justify-between pt-3 border-t border-slate-200/80 mt-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-xs"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 text-amber-500" /> : <Play className="h-3.5 w-3.5 text-emerald-600" />}
                <span>{isPlaying ? 'Tạm dừng' : 'Tiếp tục xoay'}</span>
              </button>

              <button
                onClick={() => {
                  setRotationAngle(0);
                  setSelectedPair(INITIAL_PAIRS[0]);
                  setMatchChoice(null);
                  setMatchResult(null);
                }}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs"
                title="Khởi động lại mô hình"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Tốc độ:</span>
              {[0.5, 1, 2].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    speed === s ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Informative Side Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Pair Concise Detail Card */}
          {selectedPair && (
            <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200">
                  Chi tiết Cặp Bazơ #{selectedPair.id}
                </span>
                <span className="text-[11px] font-bold text-indigo-700">
                  {selectedPair.bonds} liên kết H
                </span>
              </div>
              <div className="flex items-center justify-around py-1">
                <div className="text-center">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm mx-auto shadow-xs ${getBaseColor(selectedPair.left).bg}`}>
                    {selectedPair.left}
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold block mt-1">
                    {selectedPair.left === 'A' ? 'Adenine (Purine)' : selectedPair.left === 'T' ? 'Thymine (Pyrimidine)' : selectedPair.left === 'G' ? 'Guanine (Purine)' : 'Cytosine (Pyrimidine)'}
                  </span>
                </div>
                <div className="text-center font-mono font-bold text-slate-400 text-xs">
                  {selectedPair.bonds === 3 ? '≡ 3 lk ≡' : '═ 2 lk ═'}
                </div>
                <div className="text-center">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm mx-auto shadow-xs ${getBaseColor(selectedPair.right).bg}`}>
                    {selectedPair.right}
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold block mt-1">
                    {selectedPair.right === 'A' ? 'Adenine (Purine)' : selectedPair.right === 'T' ? 'Thymine (Pyrimidine)' : selectedPair.right === 'G' ? 'Guanine (Purine)' : 'Cytosine (Pyrimidine)'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-sky-100">
                <strong>Quy tắc khớp nối:</strong> 1 Purine (vòng kép lớn) luôn bắt cặp với 1 Pyrimidine (vòng đơn nhỏ) qua liên kết hydrogen để duy trì đường kính vòng xoắn chuẩn <strong className="text-sky-700">2.0 nm (20 Å)</strong>.
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-white border border-sky-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 mb-2">
              <Info className="h-4 w-4" />
              <span>Quy luật cấu trúc Watson - Crick</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900 font-bold">1. Cấu trúc xoắn kép:</strong> Gồm 2 chuỗi polynucleotide xoắn đều quanh một trục tưởng tượng theo chiều xoắn phải.
              </p>
              <p>
                <strong className="text-slate-900 font-bold">2. Đường kính &amp; chu kỳ:</strong> Đường kính 2.0 nm (20 Å), mỗi chu kỳ xoắn dài 3.4 nm (34 Å) gồm 10 cặp nucleotide.
              </p>
              <p>
                <strong className="text-slate-900 font-bold">3. Nguyên tắc bổ sung:</strong>
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between font-bold">
                  <span>A ⟷ T</span>
                  <span className="text-[10px]">2 H-bonds</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-between font-bold">
                  <span>G ⟷ C</span>
                  <span className="text-[10px]">3 H-bonds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nucleotide color legend */}
          <div className="rounded-2xl bg-white border border-sky-100 p-4 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              4 Loại Nucleotide đơn phân:
            </span>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-red-600 shrink-0" />
                <span className="text-slate-700 font-medium">A (Adenine)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-blue-600 shrink-0" />
                <span className="text-slate-700 font-medium">T (Thymine)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 shrink-0" />
                <span className="text-slate-700 font-medium">G (Guanine)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shrink-0" />
                <span className="text-slate-700 font-medium">C (Cytosine)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

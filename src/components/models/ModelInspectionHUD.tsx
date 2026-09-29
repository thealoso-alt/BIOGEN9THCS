import React from 'react';
import * as THREE from 'three';
import { Volume2, Play, Pause, X, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export const NU_COLORS: Record<string, { bg: string; text: string; hex: number }> = {
  A: { bg: '#dc2626', text: '#ffffff', hex: 0xdc2626 },
  T: { bg: '#2563eb', text: '#ffffff', hex: 0x2563eb },
  G: { bg: '#059669', text: '#ffffff', hex: 0x059669 },
  C: { bg: '#d97706', text: '#ffffff', hex: 0xd97706 },
  U: { bg: '#ea580c', text: '#ffffff', hex: 0xea580c },
};

export interface NuSpriteOptions {
  size?: number;
  textColor?: string;
  bgColor?: string;
  badgeRadius?: number;
  showBadge?: boolean;
  borderWidth?: number;
  borderColor?: string;
  depthTest?: boolean;
}

export const createNuSprite = (
  letter: string,
  options: NuSpriteOptions = {}
): THREE.Sprite => {
  const {
    size = 1.35,
    textColor = '#ffffff',
    bgColor,
    badgeRadius = 54,
    showBadge = true,
    borderWidth = 6,
    borderColor = '#ffffff',
    depthTest = false,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 128, 128);

    const baseColor = NU_COLORS[letter]?.bg || '#0284c7';
    const effectiveBg = bgColor || baseColor;

    if (showBadge) {
      // Draw circular badge
      ctx.beginPath();
      ctx.arc(64, 64, badgeRadius, 0, Math.PI * 2);
      ctx.fillStyle = effectiveBg;
      ctx.fill();

      // Draw crisp border
      if (borderWidth > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.stroke();
      }
    }

    // Bold letter with subtle outline
    ctx.font = '900 68px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (!showBadge) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.lineWidth = 14;
      ctx.lineJoin = 'round';
      ctx.strokeText(letter, 64, 64);
    } else {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.lineWidth = 7;
      ctx.strokeText(letter, 64, 64);
    }

    ctx.fillStyle = textColor;
    ctx.fillText(letter, 64, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: depthTest,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size, size, 1);
  return sprite;
};

export interface ModelSubpartDetail {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  parentModel: string;
  structure: string; // Cấu tạo / Đặc điểm ngắn gọn
  functionRole: string; // Vai trò sinh học ngắn gọn
  keyFact?: string; // Quy tắc hoặc thông số quan trọng
  colorHex?: string;
}

interface ModelDetailCardProps {
  detail: ModelSubpartDetail | null;
  onClose: () => void;
  onResumeRotation?: () => void;
  onSelectDetail?: (detail: ModelSubpartDetail) => void;
  allParts?: ModelSubpartDetail[];
}

export const speakScientificTerm = (term: string, gender: 'female' | 'male') => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(term);
  utterance.lang = 'en-US';
  utterance.rate = 0.88;
  const voices = window.speechSynthesis.getVoices();
  if (gender === 'female') {
    utterance.pitch = 1.25;
    const fv = voices.find(
      v =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('female') ||
          v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Ava') ||
          v.name.includes('Zira'))
    );
    if (fv) utterance.voice = fv;
  } else {
    utterance.pitch = 0.88;
    const mv = voices.find(
      v =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('male') ||
          v.name.includes('David') ||
          v.name.includes('Mark') ||
          v.name.includes('Alex') ||
          v.name.includes('Daniel'))
    );
    if (mv) utterance.voice = mv;
  }
  window.speechSynthesis.speak(utterance);
};

export const playToneEffect = (freq = 560) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch {}
};

export const ModelDetailCard: React.FC<ModelDetailCardProps> = ({
  detail,
  onClose,
  onResumeRotation,
  onSelectDetail,
  allParts = [],
}) => {
  if (!detail) return null;

  const accentColor = detail.colorHex || '#38bdf8';

  return (
    <div className="rounded-3xl border border-slate-700/80 bg-slate-900/95 p-4 sm:p-5 text-white space-y-3.5 shadow-2xl animate-in fade-in slide-in-from-right-3 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            {detail.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 border border-slate-700">
                {detail.parentModel}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white/90 border border-white/20"
                style={{ backgroundColor: `${accentColor}40` }}
              >
                {detail.category}
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/80 flex items-center gap-1">
                <Pause className="h-2.5 w-2.5" /> Dừng xoay 3D
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              {detail.name}
            </h3>
            {detail.nameEn && (
              <p className="text-[11px] text-slate-400 font-mono">
                {detail.nameEn}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {detail.nameEn && (
            <>
              <button
                onClick={() => speakScientificTerm(detail.nameEn!, 'female')}
                className="p-1.5 rounded-lg border border-rose-800 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors"
                title="Phát âm giọng Nữ"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span className="text-[10px]">Nữ ♀</span>
              </button>
              <button
                onClick={() => speakScientificTerm(detail.nameEn!, 'male')}
                className="p-1.5 rounded-lg border border-sky-800 bg-sky-950/80 hover:bg-sky-900 text-sky-300 text-xs font-bold flex items-center gap-1 transition-colors"
                title="Phát âm giọng Nam"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span className="text-[10px]">Nam ♂</span>
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Đóng chi tiết"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 1. Cấu tạo & Đặc điểm ngắn gọn */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
          1. Cấu Tạo &amp; Đặc Điểm Nhận Biết
        </span>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
          {detail.structure}
        </div>
      </div>

      {/* 2. Vai trò sinh học */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
          2. Vai Trò / Chức Năng Sinh Học
        </span>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
          {detail.functionRole}
        </div>
      </div>

      {/* 3. Thông số / Quy tắc then chốt */}
      {detail.keyFact && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-amber-500 rounded-full" />
            3. Thông Số / Quy Tắc Cốt Lõi
          </span>
          <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-900/40 text-xs text-amber-200/90 font-mono leading-relaxed">
            {detail.keyFact}
          </div>
        </div>
      )}

      {/* Other small parts switchers */}
      {allParts.length > 1 && onSelectDetail && (
        <div className="pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-400 font-medium block mb-1.5">
            Các chi tiết khác trong mô hình:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {allParts.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  playToneEffect(580);
                  onSelectDetail(p);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                  detail.id === p.id
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.colorHex || '#38bdf8' }}
                />
                <span>{p.name.split(' (')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resume Rotation Action */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400">
          Mô hình đang được phóng to / dừng xoay
        </span>
        {onResumeRotation && (
          <button
            onClick={() => {
              playToneEffect(440);
              onResumeRotation();
            }}
            className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/30 flex items-center gap-1.5 transition-all shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>Tiếp tục xoay 3D</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const ModelHoverPill: React.FC<{
  hoveredPart: ModelSubpartDetail | null;
}> = ({ hoveredPart }) => {
  if (!hoveredPart) return null;

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-sky-400/60 text-white text-xs backdrop-blur-md shadow-xl animate-in fade-in zoom-in-95 duration-150">
      <span
        className="w-2.5 h-2.5 rounded-full animate-ping shrink-0"
        style={{ backgroundColor: hoveredPart.colorHex || '#38bdf8' }}
      />
      <span className="font-bold text-sky-300">{hoveredPart.name}</span>
      <span className="text-slate-400 text-[10px]">· {hoveredPart.category}</span>
      <span className="text-amber-300 text-[10px] font-medium bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/60">
        Nhấp chuột để xem chi tiết
      </span>
    </div>
  );
};

export const ModelPartsChipsList: React.FC<{
  parts: ModelSubpartDetail[];
  selectedId?: string | null;
  onSelect: (part: ModelSubpartDetail) => void;
}> = ({ parts, selectedId, onSelect }) => {
  if (!parts.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
      {parts.map(part => {
        const isSelected = selectedId === part.id;
        const color = part.colorHex || '#38bdf8';

        return (
          <button
            key={part.id}
            onClick={() => onSelect(part)}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
              isSelected
                ? 'border-sky-500 bg-sky-50/90 ring-2 ring-sky-500/20 shadow-sm'
                : 'border-slate-200 bg-white hover:border-sky-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs group-hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate text-xs">
                  {part.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate block">
                  {part.category}
                </span>
              </div>
            </div>
            {isSelected && <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 ml-1" />}
          </button>
        );
      })}
    </div>
  );
};

export const QuickPartsBar = ModelPartsChipsList;

export interface TimelineStageMarker {
  id: number | string;
  label: string;
  shortLabel?: string;
  range: [number, number]; // [startPct, endPct]
  desc: string;
  color?: string;
}

export interface ProcessTimelineScrubberProps {
  progress: number; // 0 to 100
  onChange: (newProgress: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  stages: TimelineStageMarker[];
  currentEventLabel: string;
  accentColor?: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose';
  title?: string;
}

export const ProcessTimelineScrubber: React.FC<ProcessTimelineScrubberProps> = ({
  progress,
  onChange,
  isPlaying,
  onTogglePlay,
  speed,
  onChangeSpeed,
  stages,
  currentEventLabel,
  accentColor = 'emerald',
  title = 'Tiến trình diễn tiến sinh học 3D'
}) => {
  const currentStage = stages.find(s => progress >= s.range[0] && progress <= s.range[1]) || stages[0];

  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-500',
      activeText: 'text-emerald-400',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      thumb: 'accent-emerald-500',
      glow: 'shadow-emerald-500/30'
    },
    blue: {
      bg: 'bg-sky-500',
      activeText: 'text-sky-400',
      border: 'border-sky-500/40',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      thumb: 'accent-sky-500',
      glow: 'shadow-sky-500/30'
    },
    indigo: {
      bg: 'bg-indigo-500',
      activeText: 'text-indigo-400',
      border: 'border-indigo-500/40',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      thumb: 'accent-indigo-500',
      glow: 'shadow-indigo-500/30'
    },
    amber: {
      bg: 'bg-amber-500',
      activeText: 'text-amber-400',
      border: 'border-amber-500/40',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      thumb: 'accent-amber-500',
      glow: 'shadow-amber-500/30'
    },
    rose: {
      bg: 'bg-rose-500',
      activeText: 'text-rose-400',
      border: 'border-rose-500/40',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      thumb: 'accent-rose-500',
      glow: 'shadow-rose-500/30'
    }
  }[accentColor];

  const handleStep = (delta: number) => {
    const next = Math.max(0, Math.min(100, Math.round(progress + delta)));
    onChange(next);
  };

  return (
    <div className="rounded-3xl border border-slate-700/80 bg-slate-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3.5 text-white">
      {/* Top Header: Title, Live Event Badge, and Stage Tags */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${colorStyles.bg} animate-pulse shadow-md ${colorStyles.glow}`} />
          <h4 className="text-sm font-black tracking-wide uppercase text-slate-100 flex items-center gap-1.5">
            <span>{title}</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              TRƯỢT MÔ PHỎNG MƯỢT MÀ
            </span>
          </h4>
        </div>

        {/* Milestone Stage Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {stages.map((stage) => {
            const isCurrent = progress >= stage.range[0] && progress <= stage.range[1];
            return (
              <button
                key={stage.id}
                onClick={() => onChange(stage.range[0])}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 border ${
                  isCurrent
                    ? `${colorStyles.badge} shadow-xs font-black`
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{stage.shortLabel || stage.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Realtime Status Pill */}
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 font-bold shrink-0 text-[11px] font-mono uppercase bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
            {currentStage.label}
          </span>
          <span className="text-slate-300 truncate text-[12px] font-medium">
            {currentEventLabel}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
          <span className="text-slate-400 text-[10px]">Tiến độ:</span>
          <span className={`font-black text-sm ${colorStyles.activeText}`}>
            {progress.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Interactive Timeline Slider with custom track */}
      <div className="space-y-1.5 pt-1">
        <div className="relative flex items-center">
          {/* Background custom track gradient */}
          <div className="absolute inset-x-0 h-3 rounded-full bg-slate-800 overflow-hidden pointer-events-none">
            <div
              className={`h-full ${colorStyles.bg} transition-all duration-75`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Actual range input slider */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={progress}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={`relative w-full h-3 opacity-0 cursor-ew-resize z-10`}
            title="Kéo thanh trượt để quan sát quá trình diễn ra mượt mà"
          />

          {/* Visible custom thumb handle */}
          <div
            className={`absolute pointer-events-none -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 ${colorStyles.border} shadow-lg flex items-center justify-center transition-all duration-75 z-20`}
            style={{ left: `${progress}%` }}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${colorStyles.bg}`} />
          </div>
        </div>

        {/* Milestone Marks Below Slider */}
        <div className="relative h-4 text-[10px] font-mono text-slate-500">
          <span className="absolute left-0">0% Bắt đầu</span>
          {stages.slice(1).map((s) => (
            <span
              key={s.id}
              className="absolute -translate-x-1/2 cursor-pointer hover:text-slate-300 transition-colors hidden sm:inline"
              style={{ left: `${s.range[0]}%` }}
              onClick={() => onChange(s.range[0])}
            >
              • {s.range[0]}%
            </span>
          ))}
          <span className="absolute right-0 text-right">100% Hoàn thành</span>
        </div>
      </div>

      {/* Control Buttons: Play/Pause, Step -10%, Step +10%, Speed, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          {/* Play / Pause Toggle */}
          <button
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                : `${colorStyles.bg} hover:opacity-90 text-white font-black`
            }`}
            title={isPlaying ? 'Tạm dừng mô phỏng' : 'Chạy mô phỏng tự động mượt mà'}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Mô phỏng tự động</span>
              </>
            )}
          </button>

          {/* Quick Step Buttons */}
          <button
            onClick={() => handleStep(-10)}
            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors"
            title="Lùi 10%"
          >
            -10%
          </button>
          <button
            onClick={() => handleStep(10)}
            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors"
            title="Tiến 10%"
          >
            +10%
          </button>
          <button
            onClick={() => onChange(0)}
            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="Đặt lại từ đầu (0%)"
          >
            ↺ Reset
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-500 px-1.5">Tốc độ:</span>
          {([0.5, 1, 2] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                speed === spd
                  ? `${colorStyles.bg} text-white`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HoverTooltip: React.FC<{
  name: string;
  category: string;
  summary: string;
  colorHex?: string;
  x?: number;
  y?: number;
}> = ({ name, category, summary, colorHex, x, y }) => {
  const style: React.CSSProperties =
    x !== undefined && y !== undefined
      ? {
          position: 'fixed',
          left: Math.min(x + 12, window.innerWidth - 260),
          top: Math.max(y - 45, 10),
          pointerEvents: 'none',
          zIndex: 50,
        }
      : {};

  return (
    <div
      style={style}
      className={`${
        x === undefined
          ? 'absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none'
          : ''
      } max-w-xs bg-slate-950/95 border border-sky-400/60 text-white p-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs animate-in fade-in duration-100`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: colorHex || '#38bdf8' }}
        />
        <strong className="text-sky-300 font-bold truncate">{name}</strong>
      </div>
      <div className="text-[10px] text-slate-400 font-mono mb-1">{category}</div>
      <div className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
        {summary}
      </div>
    </div>
  );
};


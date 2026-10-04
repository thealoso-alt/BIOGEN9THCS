import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Volume2,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Layers,
  Activity,
  Award,
  FlaskConical,
  Eye,
  Sliders,
  Compass,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ModelSubpartDetail,
  ModelDetailCard,
  HoverTooltip,
  QuickPartsBar,
  speakScientificTerm,
  playToneEffect,
} from './models/ModelInspectionHUD';

export type LabMode = 'observe' | 'sgk_diagram' | 'explode' | 'replication' | 'puzzle' | 'quiz';

interface BasePairData {
  index: number;
  leftBase: 'A' | 'T' | 'G' | 'C';
  rightBase: 'A' | 'T' | 'G' | 'C';
  bonds: 2 | 3;
  strand1Polarity: "5' → 3'";
  strand2Polarity: "3' → 5'";
}

const HELIX_PAIRS: BasePairData[] = [
  { index: 1, leftBase: 'A', rightBase: 'T', bonds: 2, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 2, leftBase: 'T', rightBase: 'A', bonds: 2, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 3, leftBase: 'G', rightBase: 'C', bonds: 3, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 4, leftBase: 'C', rightBase: 'G', bonds: 3, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 5, leftBase: 'A', rightBase: 'T', bonds: 2, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 6, leftBase: 'G', rightBase: 'C', bonds: 3, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 7, leftBase: 'C', rightBase: 'G', bonds: 3, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 8, leftBase: 'T', rightBase: 'A', bonds: 2, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 9, leftBase: 'A', rightBase: 'T', bonds: 2, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 10, leftBase: 'G', rightBase: 'C', bonds: 3, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 11, leftBase: 'T', rightBase: 'A', bonds: 2, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
  { index: 12, leftBase: 'C', rightBase: 'G', bonds: 3, strand1Polarity: "5' → 3'", strand2Polarity: "3' → 5'" },
];

const BASE_DETAILS = {
  A: {
    name: 'Adenine (A)',
    nameVi: 'Adenine (A)',
    type: 'Purine (Vòng kép: 1 vòng sáu cạnh + 1 vòng năm cạnh)',
    formula: 'C₅H₅N₅',
    complementary: 'Thymine (T)',
    hydrogenBonds: 2,
    colorHex: '#dc2626', // Red/Crimson according to Textbook & Reference image
    description: 'Nitrogenous base loại Purine (màu đỏ cam theo SGK). Bắt cặp bổ sung với Thymine (T) qua 2 liên kết hydrogen.',
    role: 'Lưu trữ thông tin di truyền, tạo 2 liên kết hydrogen duy trì sự bền vững của chuỗi xoắn kép.',
    components: {
      phosphate: 'Gốc phosphate (H₃PO₄ / PO₄³⁻) gắn ở vị trí C5\' của đường qua liên kết este.',
      sugar: 'Đường Deoxyribose (C₅H₁₀O₄) 5 cạnh (pentose), mất 1 nguyên tử oxy ở vị trí C2\'.',
      base: 'Nitrogenous base Adenine (nhóm Purine 2 vòng) gắn vào vị trí carbon C1\' của đường.',
    },
    characteristics: [
      'Kích thước phân tử lớn (nhóm Purine gồm 2 vòng dị vòng thơm).',
      'Luôn bắt cặp đặc hiệu với Thymine (T) bằng 2 liên kết hydrogen (A = T).',
      'Đảm bảo sự liên kết với Pyrimidine để duy trì đường kính vòng xoắn 2,0 nm (20 Å).',
      'Đoạn phân tử DNA giàu A-T có nhiệt độ nóng chảy thấp hơn do chỉ có 2 liên kết H.',
    ],
  },
  T: {
    name: 'Thymine (T)',
    nameVi: 'Thymine (T)',
    type: 'Pyrimidine (Vòng đơn: 1 vòng sáu cạnh nhỏ hơn)',
    formula: 'C₅H₆N₂O₂',
    complementary: 'Adenine (A)',
    hydrogenBonds: 2,
    colorHex: '#2563eb', // Vibrant Blue according to Reference image & Textbook
    description: 'Nitrogenous base đặc trưng chỉ có trong DNA (màu xanh dương). Bổ sung với Adenine (A) qua 2 liên kết hydrogen.',
    role: 'Đảm bảo sự khớp nối chính xác giữa purine và pyrimidine để đường kính DNA luôn bằng đúng 2 nm (20 Å).',
    components: {
      phosphate: 'Gốc phosphate (H₃PO₄ / PO₄³⁻) liên kết tại vị trí carbon C5\' của đường.',
      sugar: 'Đường Deoxyribose (C₅H₁₀O₄) dạng vòng pentose đặc trưng của DNA.',
      base: 'Nitrogenous base Thymine (nhóm Pyrimidine 1 vòng) gắn vào carbon C1\' của đường.',
    },
    characteristics: [
      'Kích thước phân tử nhỏ (nhóm Pyrimidine chỉ gồm 1 vòng 6 cạnh).',
      'Là nucleotide đặc trưng duy nhất của DNA (trong RNA được thay thế bằng Uracil).',
      'Bắt cặp bổ sung hoàn hảo với Adenine (A) qua 2 liên kết hydrogen (T = A).',
      'Định vị ở phía trong chuỗi xoắn kép, vuông góc với trục thẳng đứng của phân tử.',
    ],
  },
  G: {
    name: 'Guanine (G)',
    nameVi: 'Guanine (G)',
    type: 'Purine (Vòng kép: 1 vòng sáu cạnh + 1 vòng năm cạnh)',
    formula: 'C₅H₅N₅O',
    complementary: 'Cytosine (C)',
    hydrogenBonds: 3,
    colorHex: '#059669', // Emerald/Forest Green according to Reference image & Textbook
    description: 'Nitrogenous base nhóm Purine (màu xanh lá). Bắt cặp đặc hiệu với Cytosine (C) qua 3 liên kết hydrogen.',
    role: 'Tạo 3 liên kết hydrogen vững chắc, vùng DNA giàu G-C có nhiệt độ nóng chảy (Tm) cao hơn.',
    components: {
      phosphate: 'Gốc phosphate (H₃PO₄ / PO₄³⁻) tạo liên kết phosphoester tại C5\'.',
      sugar: 'Đường Deoxyribose (C₅H₁₀O₄) 5 carbon.',
      base: 'Nitrogenous base Guanine (nhóm Purine 2 vòng) gắn tại carbon C1\'.',
    },
    characteristics: [
      'Khối lượng phân tử lớn nhất trong 4 loại nucleotide cấu thành DNA.',
      'Bắt cặp bổ sung với Cytosine (C) bằng 3 liên kết hydrogen bền vững (G ≡ C).',
      'Phân tử DNA có tỷ lệ (G+C) càng cao thì càng bền vững trước nhiệt độ và tác nhân biến tính.',
      'Đảm bảo tính chính xác cao độ trong cơ chế tự sao chép và phiên mã.',
    ],
  },
  C: {
    name: 'Cytosine (C)',
    nameVi: 'Cytosine (C)',
    type: 'Pyrimidine (Vòng đơn: 1 vòng sáu cạnh)',
    formula: 'C₄H₅N₃O',
    complementary: 'Guanine (G)',
    hydrogenBonds: 3,
    colorHex: '#d97706', // Warm Amber/Orange according to Reference image & Textbook
    description: 'Nitrogenous base nhóm Pyrimidine (màu vàng cam). Bắt cặp với Guanine qua 3 liên kết hydrogen.',
    role: 'Phối hợp với Guanine tạo nên các liên kết hydrogen bền vững nhất trong chuỗi xoắn kép.',
    components: {
      phosphate: 'Gốc phosphate (H₃PO₄ / PO₄³⁻) tại đầu 5\' của nucleotide.',
      sugar: 'Đường Deoxyribose (C₅H₁₀O₄) gắn nhóm -OH tự do tại vị trí C3\'.',
      base: 'Nitrogenous base Cytosine (nhóm Pyrimidine 1 vòng) gắn tại C1\'.',
    },
    characteristics: [
      'Kích thước phân tử nhỏ (vòng đơn 6 cạnh), có mặt ở cả phân tử DNA và RNA.',
      'Luôn bắt cặp đặc hiệu với Guanine (G) qua 3 liên kết hydrogen (C ≡ G).',
      'Tạo cặp bazơ có năng lượng liên kết cao, tăng cường tính ổn định cấu trúc của hệ gen.',
      'Tham gia vào các quá trình biến đổi biểu sinh (như hiện tượng methyl hóa cytosine).',
    ],
  },
};

export const DNA_INSPECTION_PARTS: Record<string, ModelSubpartDetail> = {
  nu_A: {
    id: 'nu_A',
    name: 'Nucleotide Adenine (A)',
    nameEn: 'Adenine Nucleotide',
    category: 'Nitrogenous Base · Purine',
    parentModel: 'Mô hình Không gian DNA 3D',
    structure: 'Vòng kép Purine (1 vòng 6 cạnh + 1 vòng 5 cạnh), công thức C5H5N5, gắn vào C1\' của đường deoxyribose.',
    functionRole: 'Lưu trữ thông tin di truyền, liên kết bổ sung với Thymine bằng 2 liên kết hydrogen (A = T).',
    keyFact: 'Theo NTBS: số nucleotide loại A luôn bằng số nucleotide loại T (A = T) trong DNA mạch kép.',
    colorHex: '#dc2626'
  },
  nu_T: {
    id: 'nu_T',
    name: 'Nucleotide Thymine (T)',
    nameEn: 'Thymine Nucleotide',
    category: 'Nitrogenous Base · Pyrimidine',
    parentModel: 'Mô hình Không gian DNA 3D',
    structure: 'Vòng đơn Pyrimidine (vòng 6 cạnh), công thức C5H6N2O2, nucleotide đặc trưng riêng của phân tử DNA.',
    functionRole: 'Khớp nối bổ sung đặc hiệu với Adenine, duy trì khoảng cách đường kính 2.0 nm của chuỗi xoắn kép.',
    keyFact: 'Trong phân tử RNA, Thymine được thay thế bằng Uracil (U).',
    colorHex: '#2563eb'
  },
  nu_G: {
    id: 'nu_G',
    name: 'Nucleotide Guanine (G)',
    nameEn: 'Guanine Nucleotide',
    category: 'Nitrogenous Base · Purine',
    parentModel: 'Mô hình Không gian DNA 3D',
    structure: 'Vòng kép Purine lớn nhất, công thức C5H5N5O, gắn vào C1\' của đường deoxyribose.',
    functionRole: 'Bắt cặp với Cytosine bằng 3 liên kết hydrogen bền chắc (G ≡ C), gia tăng tính bền vững nhiệt của phân tử.',
    keyFact: 'Đoạn DNA có tỷ lệ G-C càng cao thì càng bền nhiệt (nhiệt độ biến tính Tm cao hơn).',
    colorHex: '#059669'
  },
  nu_C: {
    id: 'nu_C',
    name: 'Nucleotide Cytosine (C)',
    nameEn: 'Cytosine Nucleotide',
    category: 'Nitrogenous Base · Pyrimidine',
    parentModel: 'Mô hình Không gian DNA 3D',
    structure: 'Vòng đơn Pyrimidine nhỏ, công thức C4H5N3O, có mặt ở cả phân tử DNA và RNA.',
    functionRole: 'Tạo 3 liên kết hydrogen vững chắc với Guanine (C ≡ G), tham gia cơ chế điều hòa methyl hóa epigenetics.',
    keyFact: 'Số nucleotide loại G bằng C (G = C) và (A + G) = (T + C) = 50% tổng số nucleotide.',
    colorHex: '#d97706'
  },
  backbone: {
    id: 'backbone',
    name: 'Trục Xương sống Đường - Phosphate',
    nameEn: 'Sugar-Phosphate Backbone',
    category: 'Khung phân tử DNA',
    parentModel: 'Mô hình Không gian DNA 3D',
    structure: 'Gồm các gốc phosphate (PO₄³⁻) và đường deoxyribose (C₅H₁₀O₄) liên kết xen kẽ qua liên kết cộng hóa trị phosphodiester.',
    functionRole: 'Tạo khung bảo vệ vững chắc cho các bazơ nitơ ở phía trong, mang điện tích âm giúp DNA liên kết với Histone.',
    keyFact: 'Hai mạch chạy song song ngược chiều (antiparallel: 5\'→3\' và 3\'→5\').',
    colorHex: '#0284c7'
  },
  hbonds: {
    id: 'hbonds',
    name: 'Liên kết Hydrogen giữa các Cặp Bazơ',
    nameEn: 'Hydrogen Bonds (Base Pairing)',
    category: 'Liên kết phân tử',
    parentModel: 'Mô hình Không gian DNA 3D',
    structure: 'Liên kết tĩnh điện yếu giữa nguyên tử H phân cực và nguyên tử âm điện (O, N) của 2 bazơ đối diện.',
    functionRole: 'Giữ 2 mạch đơn cuộn xoắn thành chuỗi kép; dễ tách ra khi nhân đôi và phiên mã nhờ enzyme helicase/RNA pol.',
    keyFact: 'A-T có 2 liên kết H; G-C có 3 liên kết H. Tổng liên kết H của gen H = 2A + 3G.',
    colorHex: '#f59e0b'
  },
  polarity: {
    id: 'polarity',
    name: 'Cực tính Chuỗi (Đầu 5\' và Đầu 3\')',
    nameEn: 'Strand Polarity (5\' and 3\' Ends)',
    category: 'Định hướng chuỗi polynucleotide',
    parentModel: 'Mô hình Không gian DNA 3D',
    structure: 'Đầu 5\' mang nhóm phosphate tự do gắn ở C5\' của đường; đầu 3\' mang nhóm hydroxyl (-OH) tự do tại carbon C3\'.',
    functionRole: 'Quy định chiều sinh học bắt buộc: enzyme DNA polymerase chỉ kéo dài chuỗi theo chiều 5\' → 3\'.',
    keyFact: 'Do tính đối song, khi nhân đôi một mạch được tổng hợp liên tục còn một mạch tổng hợp gián đoạn (Okazaki).',
    colorHex: '#38bdf8'
  },
  helix: {
    id: 'helix',
    name: 'Chuỗi Xoắn Kép Watson - Crick (B-DNA)',
    nameEn: 'Watson-Crick Double Helix Parameters',
    category: 'Cấu trúc không gian tổng thể',
    parentModel: 'Mô hình Không gian DNA 3D',
    structure: 'Hai mạch polynucleotide xoắn đều đặn quanh một trục tưởng tượng theo chiều xoắn phải (chiều kim đồng hồ).',
    functionRole: 'Bảo tồn thông tin di truyền dưới dạng mã bộ ba và truyền đạt qua các thế hệ tế bào.',
    keyFact: 'Đường kính xoắn: 2.0 nm (20 Å); Chu kỳ xoắn: 3.4 nm (34 Å) gồm 10 cặp nucleotide; Khoảng cách 2 cặp kế tiếp: 0.34 nm.',
    colorHex: '#06b6d4'
  }
};

// Helper: Generates bold, high-contrast 3D billboard text sprites (A, T, G, C, 5', 3') matching the user's reference image
const createLetterSprite = (text: string, color = '#ffffff', size = 1.45, customBg?: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 128, 128);

    const baseBgColors: Record<string, string> = {
      A: '#dc2626',
      T: '#2563eb',
      G: '#059669',
      C: '#d97706',
      U: '#ea580c',
      "5'": '#0284c7',
      "3'": '#7c3aed',
    };
    const bg = customBg || baseBgColors[text];

    if (bg) {
      // Draw circular badge background
      ctx.beginPath();
      ctx.arc(64, 64, 54, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();

      // Sharp white inner border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Subtle dark outer ring for separation from background
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw bold letter with dark stroke for sharp contrast
    ctx.font = '900 66px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.lineWidth = bg ? 8 : 14;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, 64, 64);
    ctx.fillStyle = color;
    ctx.fillText(text, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size, size, 1);
  return sprite;
};

export const DnaInteractiveLab: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Lab Mode state
  const [labMode, setLabMode] = useState<LabMode>('observe');
  const [viewportTheme, setViewportTheme] = useState<'deep' | 'lab'>('lab');
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [selectedBaseKey, setSelectedBaseKey] = useState<'A' | 'T' | 'G' | 'C'>('A');
  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const [separationFactor, setSeparationFactor] = useState(0); // 0 = double helix, 1 = exploded
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showPolarityLabels, setShowPolarityLabels] = useState(true);
  const [highlightComponent, setHighlightComponent] = useState<'all' | 'backbone' | 'bases' | 'hbonds'>('all');

  // Nucleotide inspection modal state (Triggered when user clicks directly on a 3D nucleotide)
  const [inspectingNucleotide, setInspectingNucleotide] = useState<'A' | 'T' | 'G' | 'C' | null>(null);
  const [selectedPartDetail, setSelectedPartDetail] = useState<ModelSubpartDetail | null>(null);
  const [hoverPartDetail, setHoverPartDetail] = useState<ModelSubpartDetail | null>(null);
  const [hoverMousePos, setHoverMousePos] = useState<{ x: number; y: number } | null>(null);

  // Synchronized refs for immediate animation control
  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const rotationSpeedRef = useRef(rotationSpeed);
  useEffect(() => {
    rotationSpeedRef.current = rotationSpeed;
  }, [rotationSpeed]);

  // Handle clicking on any 3D Nucleotide: pauses rotation and shows detailed modal
  const handleSelectNucleotideFrom3D = (base: 'A' | 'T' | 'G' | 'C', pairIdx?: number) => {
    setAutoRotate(false);
    autoRotateRef.current = false;
    setSelectedBaseKey(base);
    if (typeof pairIdx === 'number') {
      setSelectedPairIndex(pairIdx);
    }
    setInspectingNucleotide(base);
    playSynthesizedTone('click');
  };

  // Resume rotation handler
  const handleResumeRotation = () => {
    setInspectingNucleotide(null);
    setAutoRotate(true);
    autoRotateRef.current = true;
    playSynthesizedTone('step');
  };

  // Replication Simulator State
  const [replicationStep, setReplicationStep] = useState<number>(1);
  const [isReplicating, setIsReplicating] = useState<boolean>(false);

  // Interactive Puzzle State
  const [puzzleTargetSequence, setPuzzleTargetSequence] = useState<('A' | 'T' | 'G' | 'C')[]>([
    'A', 'T', 'G', 'C', 'C', 'T', 'A', 'G'
  ]);
  const [puzzleUserMatches, setPuzzleUserMatches] = useState<('A' | 'T' | 'G' | 'C' | null)[]>([
    null, null, null, null, null, null, null, null
  ]);
  const [puzzleScore, setPuzzleScore] = useState(0);
  const [puzzleFinished, setPuzzleFinished] = useState(false);
  const [puzzleFeedback, setPuzzleFeedback] = useState<string | null>(null);

  // Textbook Fig 38.1 & Page 167 interactive exercise
  const [sgkInputSequence, setSgkInputSequence] = useState('');
  const [sgkResult, setSgkResult] = useState<string | null>(null);

  // Mini Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Pronunciation with dual voice (Male and Female)
  const speakTermWithGender = (term: string, gender: 'female' | 'male') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = 'en-US';
    const voices = window.speechSynthesis.getVoices();
    if (gender === 'female') {
      utterance.pitch = 1.25;
      utterance.rate = 0.88;
      const femaleVoice = voices.find(
        v =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('female') ||
            v.name.includes('Samantha') ||
            v.name.includes('Zira') ||
            v.name.includes('Victoria') ||
            v.name.includes('Jenny') ||
            v.name.includes('Ava'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    } else {
      utterance.pitch = 0.92;
      utterance.rate = 0.88;
      const maleVoice = voices.find(
        v =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('male') ||
            v.name.includes('David') ||
            v.name.includes('Mark') ||
            v.name.includes('Guy') ||
            v.name.includes('Alex') ||
            v.name.includes('Daniel') ||
            v.name.includes('Oliver'))
      );
      if (maleVoice) utterance.voice = maleVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const speakFemaleTerm = (term: string) => {
    speakTermWithGender(term, 'female');
  };

  // Sound effect synthesizer for STEM interactions
  const playSynthesizedTone = (type: 'correct' | 'wrong' | 'click' | 'step') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'step') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch {
      // AudioContext not allowed or not supported in this frame
    }
  };

  // --- THREE.JS 3D ENGINE INITIALIZATION & ANIMATION LOOP ---
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const dnaGroupRef = useRef<THREE.Group | null>(null);
  const leftStrandGroupRef = useRef<THREE.Group | null>(null);
  const rightStrandGroupRef = useRef<THREE.Group | null>(null);
  const hBondsGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.Material } | null>(null);

  // Mouse interaction refs
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 32);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting - Scientific Laboratory Ambient & Rim Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2); // Cyan key light
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.9); // Violet rim light
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    // 5. Build DNA 3D Geometry
    const dnaGroup = new THREE.Group();
    dnaGroupRef.current = dnaGroup;
    scene.add(dnaGroup);

    const leftStrandGroup = new THREE.Group();
    const rightStrandGroup = new THREE.Group();
    const hBondsGroup = new THREE.Group();
    leftStrandGroupRef.current = leftStrandGroup;
    rightStrandGroupRef.current = rightStrandGroup;
    hBondsGroupRef.current = hBondsGroup;

    dnaGroup.add(leftStrandGroup);
    dnaGroup.add(rightStrandGroup);
    dnaGroup.add(hBondsGroup);

    // Base materials matching reference image
    const materials = {
      A: new THREE.MeshStandardMaterial({
        color: 0xdc2626, // Red Adenine
        roughness: 0.25,
        metalness: 0.2,
      }),
      T: new THREE.MeshStandardMaterial({
        color: 0x2563eb, // Vibrant Blue Thymine
        roughness: 0.25,
        metalness: 0.2,
      }),
      G: new THREE.MeshStandardMaterial({
        color: 0x059669, // Forest/Emerald Green Guanine
        roughness: 0.25,
        metalness: 0.2,
      }),
      C: new THREE.MeshStandardMaterial({
        color: 0xd97706, // Golden Amber Cytosine
        roughness: 0.25,
        metalness: 0.2,
      }),
      backbone: new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Vibrant Metallic Ocean/Cyan Blue ribbon - prominent & beautiful
        roughness: 0.22,
        metalness: 0.55,
      }),
      dashedBond: new THREE.MeshBasicMaterial({
        color: viewportTheme === 'lab' ? 0x0284c7 : 0xffffff, // Visibly sharp in both light and dark
      }),
    };
    materialsRef.current = materials;

    // Helical parameters matching reference image
    const radius = 4.8;
    const heightStep = 1.7;
    const angleStep = (36 * Math.PI) / 180; // 36° per pair = 10 pairs per 360° turn
    const numPairs = HELIX_PAIRS.length; // 12 base pairs
    const startY = -((numPairs - 1) * heightStep) / 2;

    // 1. Build continuous smooth tubular double-helix backbones (Tubular ribbons)
    const leftSplinePoints: THREE.Vector3[] = [];
    const rightSplinePoints: THREE.Vector3[] = [];
    const minS = -0.8;
    const maxS = numPairs - 0.2;
    const splineSteps = 90;

    for (let sIdx = 0; sIdx <= splineSteps; sIdx++) {
      const s = minS + (sIdx / splineSteps) * (maxS - minS);
      const y = startY + s * heightStep;
      const angle = s * angleStep;
      leftSplinePoints.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      rightSplinePoints.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }

    const leftCurve = new THREE.CatmullRomCurve3(leftSplinePoints);
    const rightCurve = new THREE.CatmullRomCurve3(rightSplinePoints);
    const backboneRadius = 0.52; // thick prominent cylindrical spiral ribbon

    const leftTubeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(leftCurve, 120, backboneRadius, 16, false),
      materials.backbone
    );
    leftTubeMesh.userData = { isBackbone: true, partInfo: DNA_INSPECTION_PARTS.backbone };

    const rightTubeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(rightCurve, 120, backboneRadius, 16, false),
      materials.backbone
    );
    rightTubeMesh.userData = { isBackbone: true, partInfo: DNA_INSPECTION_PARTS.backbone };

    leftStrandGroup.add(leftTubeMesh);
    rightStrandGroup.add(rightTubeMesh);

    // 2. Add 5' and 3' polarity labels at top and bottom of both strands
    const topY = startY + (numPairs - 0.2) * heightStep;
    const topAngle = (numPairs - 0.2) * angleStep;
    const botY = startY + minS * heightStep;
    const botAngle = minS * angleStep;

    // Left strand top: 5' (white bold label)
    const label5pTop = createLetterSprite("5'", "#ffffff", 1.8);
    label5pTop.position.set(Math.cos(topAngle) * radius, topY + 1.2, Math.sin(topAngle) * radius);
    label5pTop.userData = { isPolarity: true, partInfo: DNA_INSPECTION_PARTS.polarity };
    leftStrandGroup.add(label5pTop);

    // Right strand top: 3'
    const label3pTop = createLetterSprite("3'", "#ffffff", 1.8);
    label3pTop.position.set(Math.cos(topAngle + Math.PI) * radius, topY + 1.2, Math.sin(topAngle + Math.PI) * radius);
    label3pTop.userData = { isPolarity: true, partInfo: DNA_INSPECTION_PARTS.polarity };
    rightStrandGroup.add(label3pTop);

    // Left strand bottom: 3'
    const label3pBot = createLetterSprite("3'", "#ffffff", 1.8);
    label3pBot.position.set(Math.cos(botAngle) * radius, botY - 1.2, Math.sin(botAngle) * radius);
    label3pBot.userData = { isPolarity: true, partInfo: DNA_INSPECTION_PARTS.polarity };
    leftStrandGroup.add(label3pBot);

    // Right strand bottom: 5'
    const label5pBot = createLetterSprite("5'", "#ffffff", 1.8);
    label5pBot.position.set(Math.cos(botAngle + Math.PI) * radius, botY - 1.2, Math.sin(botAngle + Math.PI) * radius);
    label5pBot.userData = { isPolarity: true, partInfo: DNA_INSPECTION_PARTS.polarity };
    rightStrandGroup.add(label5pBot);

    // 3. Build rectangular base slabs, bold letter labels, and dashed hydrogen bonds
    const slabLength = 2.0;
    const slabHeight = 0.52;
    const slabDepth = 0.72;
    const baseSlabGeo = new THREE.BoxGeometry(slabLength, slabHeight, slabDepth);

    // Tiny 3D dashed segments for hydrogen bonds
    const dashSegmentGeo = new THREE.BoxGeometry(0.18, 0.08, 0.08);

    for (let i = 0; i < numPairs; i++) {
      const pair = HELIX_PAIRS[i];
      const y = startY + i * heightStep;
      const angle = i * angleStep;

      // Positions along perimeter
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Distance from center to center of each base slab
      const slabDistFromCenter = radius - 0.45 - slabLength / 2;

      // Left Base Slab
      const leftBaseMesh = new THREE.Mesh(baseSlabGeo, materials[pair.leftBase]);
      leftBaseMesh.position.set(Math.cos(angle) * slabDistFromCenter, y, Math.sin(angle) * slabDistFromCenter);
      leftBaseMesh.lookAt(0, y, 0);
      leftBaseMesh.rotateY(Math.PI / 2);
      leftBaseMesh.userData = {
        isNucleotide: true,
        base: pair.leftBase,
        pairIndex: i,
        strand: 'left',
        partInfo: DNA_INSPECTION_PARTS['nu_' + pair.leftBase]
      };
      leftStrandGroup.add(leftBaseMesh);

      // Bold White Letter Sprite on Left Base (A, T, G, C)
      const leftTextSprite = createLetterSprite(pair.leftBase, '#ffffff', 1.45);
      leftTextSprite.position.set(Math.cos(angle) * (slabDistFromCenter + 0.35), y, Math.sin(angle) * (slabDistFromCenter + 0.35));
      leftTextSprite.userData = {
        isNucleotide: true,
        base: pair.leftBase,
        pairIndex: i,
        strand: 'left',
        partInfo: DNA_INSPECTION_PARTS['nu_' + pair.leftBase]
      };
      leftStrandGroup.add(leftTextSprite);

      // Right Base Slab
      const rightBaseMesh = new THREE.Mesh(baseSlabGeo, materials[pair.rightBase]);
      rightBaseMesh.position.set(Math.cos(angle + Math.PI) * slabDistFromCenter, y, Math.sin(angle + Math.PI) * slabDistFromCenter);
      rightBaseMesh.lookAt(0, y, 0);
      rightBaseMesh.rotateY(Math.PI / 2);
      rightBaseMesh.userData = {
        isNucleotide: true,
        base: pair.rightBase,
        pairIndex: i,
        strand: 'right',
        partInfo: DNA_INSPECTION_PARTS['nu_' + pair.rightBase]
      };
      rightStrandGroup.add(rightBaseMesh);

      // Bold White Letter Sprite on Right Base (A, T, G, C)
      const rightTextSprite = createLetterSprite(pair.rightBase, '#ffffff', 1.45);
      rightTextSprite.position.set(Math.cos(angle + Math.PI) * (slabDistFromCenter + 0.35), y, Math.sin(angle + Math.PI) * (slabDistFromCenter + 0.35));
      rightTextSprite.userData = {
        isNucleotide: true,
        base: pair.rightBase,
        pairIndex: i,
        strand: 'right',
        partInfo: DNA_INSPECTION_PARTS['nu_' + pair.rightBase]
      };
      rightStrandGroup.add(rightTextSprite);

      // 4. Dashed Hydrogen Bond Lines in the center gap
      // 2 dashed lines for A-T pairs, 3 dashed lines for G-C pairs
      const hBondSubGroup = new THREE.Group();
      hBondSubGroup.position.set(0, y, 0);

      const numBonds = pair.bonds; // 2 or 3
      const bondSpacingY = 0.16;
      const startBondY = -((numBonds - 1) * bondSpacingY) / 2;

      for (let b = 0; b < numBonds; b++) {
        const by = startBondY + b * bondSpacingY;
        // 3 white dashed segments across the gap
        for (let d = -1; d <= 1; d++) {
          const dash = new THREE.Mesh(dashSegmentGeo, materials.dashedBond);
          const dashRadius = d * 0.32;
          dash.position.set(Math.cos(angle) * dashRadius, by, Math.sin(angle) * dashRadius);
          dash.lookAt(x1, by, z1);
          dash.rotateY(Math.PI / 2);
          dash.userData = {
            isHBond: true,
            bonds: pair.bonds,
            pairIndex: i,
            partInfo: DNA_INSPECTION_PARTS.hbonds
          };
          hBondSubGroup.add(dash);
        }
      }
      hBondsGroup.add(hBondSubGroup);
    }

    // Raycaster for interactive clicking on nucleotides
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mouseDownPos = { x: 0, y: 0, time: 0 };
    let touchStartPos = { x: 0, y: 0, time: 0 };

    // Animation & Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotateRef.current && dnaGroupRef.current && !isDraggingRef.current) {
        dnaGroupRef.current.rotation.y += 0.008 * rotationSpeedRef.current;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse drag handlers & click detection
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      mouseDownPos = { x: e.clientX, y: e.clientY, time: Date.now() };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !dnaGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      dnaGroupRef.current.rotation.y += deltaX * 0.01;
      dnaGroupRef.current.rotation.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      const dx = Math.abs(e.clientX - mouseDownPos.x);
      const dy = Math.abs(e.clientY - mouseDownPos.y);
      const dt = Date.now() - mouseDownPos.time;

      // Click detected (not dragging)
      if (dx < 6 && dy < 6 && dt < 450) {
        const domRect = domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - domRect.left) / domRect.width) * 2 - 1;
        mouse.y = -((e.clientY - domRect.top) / domRect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([leftStrandGroup, rightStrandGroup, hBondsGroup], true);

        for (const hit of intersects) {
          let obj: THREE.Object3D | null = hit.object;
          while (obj && !obj.userData?.partInfo && !obj.userData?.isNucleotide) {
            obj = obj.parent;
          }
          if (obj && (obj.userData?.partInfo || obj.userData?.isNucleotide)) {
            const partInfo = obj.userData.partInfo as ModelSubpartDetail | undefined;
            if (partInfo) {
              setSelectedPartDetail(partInfo);
              setAutoRotate(false);
              autoRotateRef.current = false;
              playToneEffect(600);
            }
            if (obj.userData?.isNucleotide) {
              const base = obj.userData.base as 'A' | 'T' | 'G' | 'C';
              handleSelectNucleotideFrom3D(base, obj.userData.pairIndex);
            }
            break;
          }
        }
      }
    };

    // Hover cursor styling to signal interactivity
    const handleMouseMoveHover = (e: MouseEvent) => {
      if (isDraggingRef.current) return;
      const domRect = domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - domRect.left) / domRect.width) * 2 - 1;
      mouse.y = -((e.clientY - domRect.top) / domRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([leftStrandGroup, rightStrandGroup, hBondsGroup], true);
      let hoveredDetail: ModelSubpartDetail | null = null;

      for (const hit of intersects) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj && !obj.userData?.partInfo && !obj.userData?.isNucleotide) obj = obj.parent;
        if (obj?.userData?.partInfo) {
          hoveredDetail = obj.userData.partInfo;
          break;
        } else if (obj?.userData?.isNucleotide) {
          const baseKey = obj.userData.base as 'A' | 'T' | 'G' | 'C';
          hoveredDetail = DNA_INSPECTION_PARTS['nu_' + baseKey] || null;
          break;
        }
      }

      setHoverPartDetail(hoveredDetail);
      if (hoveredDetail) {
        setHoverMousePos({ x: e.clientX, y: e.clientY });
      }
      domElement.style.cursor = hoveredDetail ? 'pointer' : 'grab';
    };

    // Touch handlers for mobile/iPad
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !dnaGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      dnaGroupRef.current.rotation.y += deltaX * 0.01;
      dnaGroupRef.current.rotation.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      isDraggingRef.current = false;
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dx = Math.abs(touch.clientX - touchStartPos.x);
        const dy = Math.abs(touch.clientY - touchStartPos.y);
        const dt = Date.now() - touchStartPos.time;

        if (dx < 10 && dy < 10 && dt < 450) {
          const domRect = domElement.getBoundingClientRect();
          mouse.x = ((touch.clientX - domRect.left) / domRect.width) * 2 - 1;
          mouse.y = -((touch.clientY - domRect.top) / domRect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects([leftStrandGroup, rightStrandGroup], true);

          for (const hit of intersects) {
            let obj: THREE.Object3D | null = hit.object;
            while (obj && !obj.userData?.isNucleotide) {
              obj = obj.parent;
            }
            if (obj && obj.userData?.isNucleotide) {
              const base = obj.userData.base as 'A' | 'T' | 'G' | 'C';
              handleSelectNucleotideFrom3D(base, obj.userData.pairIndex);
              break;
            }
          }
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('mousemove', handleMouseMoveHover);
    domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update separation (Exploded view) in 3D scene
  useEffect(() => {
    if (!leftStrandGroupRef.current || !rightStrandGroupRef.current || !hBondsGroupRef.current) return;
    const factor = separationFactor * 10; // max separation distance 10 units
    leftStrandGroupRef.current.position.x = -factor;
    rightStrandGroupRef.current.position.x = factor;

    // Hydrogen bonds fade out or break when separated
    hBondsGroupRef.current.visible = separationFactor < 0.2;
  }, [separationFactor]);

  // Dynamically update dashed line color on theme toggle
  useEffect(() => {
    if (materialsRef.current && materialsRef.current.dashedBond) {
      const basicMat = materialsRef.current.dashedBond as THREE.MeshBasicMaterial;
      basicMat.color.set(viewportTheme === 'lab' ? 0x0284c7 : 0xffffff);
    }
  }, [viewportTheme]);

  // Camera presets
  const setCameraPreset = (preset: 'watson_crick' | 'top_down' | 'side') => {
    if (!cameraRef.current || !dnaGroupRef.current) return;
    if (preset === 'watson_crick') {
      cameraRef.current.position.set(0, 0, 32);
      dnaGroupRef.current.rotation.set(0.3, 0.4, 0);
    } else if (preset === 'top_down') {
      cameraRef.current.position.set(0, 35, 2);
      cameraRef.current.lookAt(0, 0, 0);
      dnaGroupRef.current.rotation.set(0, 0, 0);
    } else if (preset === 'side') {
      cameraRef.current.position.set(34, 0, 0);
      cameraRef.current.lookAt(0, 0, 0);
      dnaGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -3 : 3;
    cameraRef.current.position.z = Math.max(15, Math.min(50, cameraRef.current.position.z + delta));
  };

  // --- PUZZLE MATCHING GAME HANDLER ---
  const handleSelectPuzzleBase = (base: 'A' | 'T' | 'G' | 'C') => {
    // Find first empty slot
    const firstEmptyIdx = puzzleUserMatches.findIndex(m => m === null);
    if (firstEmptyIdx === -1) return;

    const target = puzzleTargetSequence[firstEmptyIdx];
    const isCorrect =
      (target === 'A' && base === 'T') ||
      (target === 'T' && base === 'A') ||
      (target === 'G' && base === 'C') ||
      (target === 'C' && base === 'G');

    if (isCorrect) {
      playSynthesizedTone('correct');
      const next = [...puzzleUserMatches];
      next[firstEmptyIdx] = base;
      setPuzzleUserMatches(next);
      setPuzzleScore(s => s + 10);
      setPuzzleFeedback(`Chính xác! ${target} liên kết với ${base} bằng ${target === 'A' || target === 'T' ? 2 : 3} liên kết hydro.`);

      if (firstEmptyIdx === puzzleTargetSequence.length - 1) {
        setPuzzleFinished(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      playSynthesizedTone('wrong');
      const partner = target === 'A' ? 'T' : target === 'T' ? 'A' : target === 'G' ? 'C' : 'G';
      setPuzzleFeedback(`Chưa chính xác! Trong DNA, ${target} chỉ liên kết bổ sung với ${partner}. Hãy thử lại.`);
    }
  };

  const resetPuzzle = () => {
    setPuzzleUserMatches([null, null, null, null, null, null, null, null]);
    setPuzzleFinished(false);
    setPuzzleScore(0);
    setPuzzleFeedback(null);
  };

  // --- REPLICATION SIMULATOR ADVANCE ---
  const handleReplicationStep = (step: number) => {
    setReplicationStep(step);
    playSynthesizedTone('step');
    if (step === 2) {
      setSeparationFactor(0.6); // helicase separates
    } else if (step === 3) {
      setSeparationFactor(0.9); // two identical daughter DNA molecules
    } else {
      setSeparationFactor(0); // initial helix
    }
  };

  const selectedBaseInfo = BASE_DETAILS[selectedBaseKey];

  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-4 sm:p-6 shadow-xl shadow-sky-100/50 space-y-6 text-slate-800">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-500/25">
            <FlaskConical className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                PHÒNG LAB 3D SINH HỌC 9
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                MÔ HÌNH WATSON & CRICK
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Phòng Thí Nghiệm DNA 3D Tương Tác
            </h2>
            <p className="text-xs text-slate-500">
              Cấu trúc xoắn kép nổi bật chuẩn SGK, bóc tách 2 mạch và ghép cặp nucleotide bổ sung
            </p>
          </div>
        </div>

        {/* Laboratory Mode Tabs (Bright & Friendly) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs">
          {[
            { id: 'observe', label: '1. Không gian 3D', icon: Eye },
            { id: 'sgk_diagram', label: '2. Chuẩn SGK Hình 38.1', icon: Layers },
            { id: 'explode', label: '3. Bóc tách 2 mạch', icon: Sliders },
            { id: 'puzzle', label: '4. Ghép cặp Nucleotide', icon: Sparkles },
            { id: 'quiz', label: '5. Kiểm tra nhanh', icon: Award },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setLabMode(tab.id as LabMode);
                  if (tab.id === 'explode') {
                    setSeparationFactor(0.5);
                  } else {
                    setSeparationFactor(0);
                  }
                }}
                className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  labMode === tab.id
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Lab Canvas and Interactive Inspector Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D WebGL Canvas Viewport (lg:col-span-7 khi xem Nu bên cạnh, lg:col-span-8 khi bình thường) */}
        <div className={`${inspectingNucleotide ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-8'} space-y-3 transition-all duration-300`}>
          <div
            className={`relative rounded-3xl border border-slate-300/80 overflow-hidden shadow-xl h-[480px] sm:h-[530px] transition-colors ${
              viewportTheme === 'deep'
                ? 'bg-[#070c18]'
                : 'bg-gradient-to-b from-sky-50/80 via-white to-sky-100/60'
            }`}
          >
            {/* Scientific HUD Overlay: Measurements and Parameters */}
            {showMeasurements && (
              <div
                className={`absolute top-3 left-3 z-10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1 shadow-md pointer-events-none ${
                  viewportTheme === 'deep'
                    ? 'bg-slate-950/80 border border-slate-800 text-slate-300'
                    : 'bg-white/85 border border-sky-100 text-slate-700'
                }`}
              >
                <div className="text-sky-500 font-bold flex items-center gap-1">
                  <Activity className="h-3 w-3" /> THÔNG SỐ WATSON-CRICK
                </div>
                <div>
                  <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Đường kính (d):</span>{' '}
                  <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>2.0 nm (20 Å)</strong>
                </div>
                <div>
                  <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>1 Chu kỳ xoắn:</span>{' '}
                  <strong className="text-amber-500">3.4 nm (34 Å) · 10 cặp Nu</strong>
                </div>
                <div>
                  <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Khoảng cách 2 cặp:</span>{' '}
                  <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>0.34 nm (3.4 Å)</strong>
                </div>
                <div>
                  <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Góc xoay / cặp:</span>{' '}
                  <strong className="text-emerald-500">36° xoắn phải</strong>
                </div>
              </div>
            )}

            {/* Polarity Badges (5' - 3' and 3' - 5') */}
            {showPolarityLabels && (
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 text-[10px] font-mono font-bold">
                <span className="px-2.5 py-1 rounded-xl bg-sky-500 text-white shadow-md">
                  Mạch 1: 5' ──────→ 3'
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white shadow-md">
                  Mạch 2: 3' ←────── 5'
                </span>
              </div>
            )}

            {/* Top Interactive Prompt or Selection Pill */}
            {!inspectingNucleotide ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-sky-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Bấm trực tiếp vào bất kỳ Nu nào trên mô hình để <strong>dừng xoay &amp; xem cấu trúc</strong></span>
              </div>
            ) : (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/60 text-white text-[11px] backdrop-blur-md shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full animate-ping shrink-0" style={{ backgroundColor: BASE_DETAILS[inspectingNucleotide].colorHex }} />
                <span>Đang xem: <strong className="text-amber-300">{BASE_DETAILS[inspectingNucleotide].nameVi} ({inspectingNucleotide})</strong> · Mô hình đã dừng</span>
                <button
                  onClick={handleResumeRotation}
                  className="ml-1 px-2.5 py-0.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-[10px] font-bold text-white flex items-center gap-1 transition-colors shadow-xs"
                  title="Tiếp tục xoay mô hình 3D"
                >
                  <Play className="h-2.5 w-2.5 fill-white" /> Xoay tiếp
                </button>
              </div>
            )}

            {/* Three.js Canvas Container (Always unobstructed and visible) */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Hover Tooltip when moving mouse over any detail */}
            {hoverPartDetail && (
              <HoverTooltip
                name={hoverPartDetail.name}
                category={hoverPartDetail.category}
                summary={hoverPartDetail.structure}
                colorHex={hoverPartDetail.colorHex}
                x={hoverMousePos?.x}
                y={hoverMousePos?.y}
              />
            )}

            {/* Bottom 3D Viewport Controls Toolbar */}
            <div
              className={`absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl backdrop-blur-md text-xs shadow-lg ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/85 border border-slate-800 text-slate-200'
                  : 'bg-white/90 border border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                    autoRotate ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  title={autoRotate ? 'Dừng xoay tự động' : 'Bật xoay 360°'}
                >
                  {autoRotate ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline text-[11px]">{autoRotate ? 'Đang xoay' : 'Xoay 360°'}</span>
                </button>

                <button
                  onClick={() => handleZoom('in')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Phóng to"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleZoom('out')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-300 hidden sm:block" />

                <div className="hidden sm:flex items-center gap-1 text-[11px]">
                  <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Góc:</span>
                  <button
                    onClick={() => setCameraPreset('watson_crick')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Chuẩn
                  </button>
                  <button
                    onClick={() => setCameraPreset('top_down')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Đỉnh trục
                  </button>
                  <button
                    onClick={() => setCameraPreset('side')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Mặt bên
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Viewport Theme Toggle (Deep Contrast matching image vs Bright Lab) */}
                <button
                  onClick={() => setViewportTheme(t => (t === 'deep' ? 'lab' : 'deep'))}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                  title="Chuyển đổi phông nền tương phản cao hoặc phông nền sáng"
                >
                  {viewportTheme === 'deep' ? '☀️ Phông Lab Sáng' : '🌌 Phông Tương Phản'}
                </button>

                <button
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                    showMeasurements ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Thông số
                </button>
                <button
                  onClick={() => setShowPolarityLabels(!showPolarityLabels)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                    showPolarityLabels ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Chiều 5'-3'
                </button>
              </div>
            </div>
          </div>

          {/* Quick Subpart Inspection Chips */}
          <div className="pt-1">
            <QuickPartsBar
              parts={Object.values(DNA_INSPECTION_PARTS)}
              selectedId={selectedPartDetail?.id}
              onSelect={(part) => {
                setSelectedPartDetail(part);
                setAutoRotate(false);
                autoRotateRef.current = false;
                playToneEffect(600);
              }}
            />
          </div>

          {/* Quick Base Color Legend & Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            {(['A', 'T', 'G', 'C'] as const).map(baseKey => {
              const info = BASE_DETAILS[baseKey];
              const isSelected = selectedBaseKey === baseKey;
              return (
                <button
                  key={baseKey}
                  onClick={() => {
                    handleSelectNucleotideFrom3D(baseKey);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-sky-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-md shrink-0 shadow-xs"
                      style={{ backgroundColor: info.colorHex }}
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{baseKey} ({info.nameVi.split(' ')[0]})</span>
                      <span className="text-[10px] text-slate-500 font-mono">{info.hydrogenBonds} lk hydrogen</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Mode-Specific Content & Biochemical Inspector (lg:col-span-5 khi xem Nu, lg:col-span-4 khi bình thường) */}
        <div className={`${inspectingNucleotide ? 'lg:col-span-5 xl:col-span-5' : 'lg:col-span-4'} space-y-4 transition-all duration-300`}>
          {/* NUCLEOTIDE INSPECTION PANEL (HIỆN 1 BÊN, THÔNG TIN RÚT GỌN, KHÔNG CHIẾM HẾT MÀN HÌNH) */}
          {inspectingNucleotide ? (
            <div className="rounded-3xl border border-slate-700/80 bg-slate-900/95 p-4 sm:p-5 text-white space-y-3.5 shadow-2xl animate-in fade-in slide-in-from-right-3 duration-200">
              {/* Header: Nu icon + Name + Dual Voice Buttons + Close */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md shrink-0"
                    style={{ backgroundColor: BASE_DETAILS[inspectingNucleotide].colorHex }}
                  >
                    {inspectingNucleotide}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-950 text-sky-400 border border-sky-800/80">
                        HỒ SƠ NUCLEOTIDE
                      </span>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/80 flex items-center gap-1">
                        <Pause className="h-2.5 w-2.5" /> Dừng xoay
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                      {BASE_DETAILS[inspectingNucleotide].nameVi}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {BASE_DETAILS[inspectingNucleotide].type} · <strong className="text-sky-400">{BASE_DETAILS[inspectingNucleotide].formula}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => speakTermWithGender(BASE_DETAILS[inspectingNucleotide].name, 'female')}
                    className="p-1.5 rounded-lg border border-rose-800 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Phát âm giọng Nữ"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Nữ ♀</span>
                  </button>
                  <button
                    onClick={() => speakTermWithGender(BASE_DETAILS[inspectingNucleotide].name, 'male')}
                    className="p-1.5 rounded-lg border border-sky-800 bg-sky-950/80 hover:bg-sky-900 text-sky-300 text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Phát âm giọng Nam"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Nam ♂</span>
                  </button>
                  <button
                    onClick={handleResumeRotation}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Đóng và tiếp tục xoay mô hình"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 1. CẤU TRÚC THÀNH PHẦN (3 thành phần cô đọng) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-sky-500 rounded-full" />
                  1. Cấu Trúc Thành Phần (1 Nu)
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-amber-900/50 space-y-0.5">
                    <div className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span>Phosphate</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      H₃PO₄ · Gắn C5' đường
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-cyan-900/50 space-y-0.5">
                    <div className="font-bold text-cyan-400 flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-md bg-cyan-500 shrink-0" />
                      <span>Deoxyribose</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      C₅H₁₀O₄ (Đường 5C)
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-md shrink-0" style={{ backgroundColor: BASE_DETAILS[inspectingNucleotide].colorHex }} />
                      <span>Bazơ Nitơ</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight font-mono">
                      {inspectingNucleotide} · Gắn C1' đường
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. ĐẶC ĐIỂM & NGUYÊN TẮC BỔ SUNG */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-purple-500 rounded-full" />
                  2. Đặc Điểm &amp; Nguyên Tắc Bổ Sung
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800/80">
                    <span className="text-slate-300 font-mono">
                      Bắt cặp: <strong className="text-sky-300">{inspectingNucleotide} {inspectingNucleotide === 'A' || inspectingNucleotide === 'T' ? '=' : '≡'} {BASE_DETAILS[inspectingNucleotide].complementary}</strong>
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 text-[10px]">
                      {BASE_DETAILS[inspectingNucleotide].hydrogenBonds} lk Hydrogen
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {inspectingNucleotide === 'A' || inspectingNucleotide === 'G'
                      ? 'Thuộc nhóm Purine (kích thước lớn gồm 2 vòng dị vòng).'
                      : 'Thuộc nhóm Pyrimidine (kích thước nhỏ gồm 1 vòng đơn).'}
                    {' '}Bắt cặp với {BASE_DETAILS[inspectingNucleotide].complementary} giúp duy trì đường kính chuỗi xoắn kép chuẩn <strong>2,0 nm (20 Å)</strong>.
                  </p>
                </div>
              </div>

              {/* 3. MÔ HÌNH NUCLEOTIDE (SƠ ĐỒ TRỰC QUAN 3 KHỐI THU NHỎ) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
                  3. Sơ Đồ Mô Hình Đơn Phân Nu
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-center gap-2 text-white">
                  {/* P */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                      P
                    </div>
                    <span className="text-[9px] text-amber-300 font-mono mt-0.5">Phosphate</span>
                  </div>

                  {/* Bond 1 */}
                  <div className="w-5 h-0.5 bg-slate-600 relative">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-400">ester</span>
                  </div>

                  {/* D */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-8 bg-gradient-to-tr from-cyan-600 to-teal-500 text-white font-black text-xs flex items-center justify-center rounded-lg shadow transform rotate-3">
                      D
                    </div>
                    <span className="text-[9px] text-cyan-300 font-mono mt-0.5">Đường (C5)</span>
                  </div>

                  {/* Bond 2 */}
                  <div className="w-5 h-0.5 bg-slate-600 relative">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-400">glyco</span>
                  </div>

                  {/* Base */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-8 text-white font-black text-xs flex items-center justify-center rounded-lg shadow border border-white/40"
                      style={{ backgroundColor: BASE_DETAILS[inspectingNucleotide].colorHex }}
                    >
                      {inspectingNucleotide}
                    </div>
                    <span className="text-[9px] font-mono mt-0.5 font-bold" style={{ color: BASE_DETAILS[inspectingNucleotide].colorHex }}>
                      Bazơ ({inspectingNucleotide})
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Switch & Resume Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">Đổi Nu:</span>
                  {(['A', 'T', 'G', 'C'] as const).map(k => (
                    <button
                      key={k}
                      onClick={() => {
                        setSelectedBaseKey(k);
                        setInspectingNucleotide(k);
                        playSynthesizedTone('step');
                      }}
                      className={`w-6 h-6 rounded-md font-bold text-[11px] flex items-center justify-center transition-all ${
                        inspectingNucleotide === k
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleResumeRotation}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/30 flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Tiếp tục xoay 3D</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* MODE 1: 3D OBSERVATION & INSPECTOR */}
              {labMode === 'observe' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-md shadow"
                    style={{ backgroundColor: selectedBaseInfo.colorHex }}
                  />
                  <h3 className="text-base font-bold text-white">{selectedBaseInfo.name}</h3>
                </div>
                <button
                  onClick={() => speakFemaleTerm(selectedBaseInfo.name)}
                  className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 transition-colors"
                  title="Nghe phát âm giọng nữ chuẩn"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              {/* Molecular Info Card */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                    Phân loại & Công thức
                  </span>
                  <div className="font-semibold text-slate-200">{selectedBaseInfo.type}</div>
                  <div className="font-mono text-cyan-300 font-bold">Công thức: {selectedBaseInfo.formula}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                    Nguyên tắc Bổ sung (Watson - Crick)
                  </span>
                  <div className="text-amber-300 font-bold">
                    Liên kết bổ sung với: {selectedBaseInfo.complementary}
                  </div>
                  <div className="text-slate-300">
                    Số liên kết hydrogen: <strong className="text-white">{selectedBaseInfo.hydrogenBonds} liên kết</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-cyan-400 font-semibold block mb-1">Đặc điểm sinh học:</span>
                  {selectedBaseInfo.description}
                </div>

                {/* 3 Components of a Nucleotide */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300 block mb-2">
                    🧬 3 Thành phần cấu tạo 1 Nucleotide:
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <span>Nhóm phosphate (H₃PO₄ / PO₄³⁻) gắn vào C5'</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span>Đường deoxyribose (C₅H₁₀O₄) 5 cạnh (pentose)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedBaseInfo.colorHex }} />
                      <span>Nitrogenous base ({selectedBaseKey}) gắn vào C1'</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* MODE: CHUẨN SGK HÌNH 38.1 */}
          {labMode === 'sgk_diagram' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Sơ Đồ Chuẩn SGK Hình 38.1</h3>
                    <span className="text-[10px] text-cyan-400 font-mono">Trang 166 · SGK Sinh Học 9 Kết Nối Tri Thức</span>
                  </div>
                </div>
              </div>

              {/* Anatomy Diagram */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between font-mono font-bold text-[11px] pb-2 border-b border-slate-800">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Đỉnh Mạch Trái: 5'
                  </span>
                  <span className="text-purple-400 flex items-center gap-1">
                    Đỉnh Mạch Phải: 3' <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  </span>
                </div>

                {/* Key annotations */}
                <div className="space-y-2 py-1 text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
                    <span className="text-amber-400 font-bold text-base leading-none">↳</span>
                    <div>
                      <strong className="text-amber-300">Liên kết cộng hoá trị phosphodiester:</strong>
                      <p className="text-[11px] text-slate-400">Hình thành giữa đường deoxyribose của nucleotide này với nhóm phosphate của nucleotide kế tiếp trên cùng một mạch đơn.</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold text-base leading-none">⇄</span>
                    <div>
                      <strong className="text-cyan-300">Liên kết hydrogen (nguyên tắc bổ sung):</strong>
                      <p className="text-[11px] text-slate-400">Nằm giữa 2 mạch: Adenine liên kết với Thymine bằng 2 liên kết; Guanine liên kết với Cytosine bằng 3 liên kết.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-500 block">Đường kính</span>
                      <strong className="text-white text-xs">20 Å (2.0 nm)</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-500 block">Chu kì xoắn</span>
                      <strong className="text-amber-400 text-xs">34 Å (10 cặp Nu)</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono font-bold text-[11px] pt-2 border-t border-slate-800">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Đáy Mạch Trái: 3'
                  </span>
                  <span className="text-purple-400 flex items-center gap-1">
                    Đáy Mạch Phải: 5' <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  </span>
                </div>
              </div>

              {/* Color legend exact to textbook */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
                  Bảng màu 4 bazơ nitơ chuẩn SGK Hình 38.1:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900">
                    <span className="w-3.5 h-3.5 rounded-md bg-red-500 shrink-0"></span>
                    <div>
                      <span className="font-bold text-white">Adenine</span>
                      <span className="text-[10px] text-slate-400 block">A (Đỏ cam)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900">
                    <span className="w-3.5 h-3.5 rounded-md bg-indigo-400 shrink-0"></span>
                    <div>
                      <span className="font-bold text-white">Thymine</span>
                      <span className="text-[10px] text-slate-400 block">T (Xanh tím)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900">
                    <span className="w-3.5 h-3.5 rounded-md bg-sky-600 shrink-0"></span>
                    <div>
                      <span className="font-bold text-white">Guanine</span>
                      <span className="text-[10px] text-slate-400 block">G (Xanh lam)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900">
                    <span className="w-3.5 h-3.5 rounded-md bg-green-500 shrink-0"></span>
                    <div>
                      <span className="font-bold text-white">Cytosine</span>
                      <span className="text-[10px] text-slate-400 block">C (Xanh lá)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Textbook Page 167 Exercise */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 space-y-2.5 text-xs">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Bài tập thực hành SGK trang 167:</span>
                </div>
                <div className="font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block mb-1">Mạch đã cho:</span>
                  <span className="text-white font-bold tracking-wider">...A-T-G-C-T-G-A-T-C-A-C-G-T...</span>
                </div>
                <div>
                  <label className="text-slate-300 text-[11px] font-semibold block mb-1">
                    Nhập trình tự mạch bổ sung tương ứng:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sgkInputSequence}
                      onChange={e => setSgkInputSequence(e.target.value.toUpperCase())}
                      placeholder="ví dụ: T-A-C-G-A-C-T-A-G-T-G-C-A"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const clean = sgkInputSequence.replace(/[^ATGC]/g, '');
                        const target = 'TACGACTAGTGCA';
                        if (clean === target) {
                          setSgkResult('Chính xác 100%! Trình tự đúng: ...T-A-C-G-A-C-T-A-G-T-G-C-A...');
                          confetti({ particleCount: 60, spread: 60 });
                        } else {
                          setSgkResult(`Chưa đúng. Gợi ý: A liên kết với T, T liên kết với A, G liên kết với C, C liên kết với G. Đáp án chuẩn: T-A-C-G-A-C-T-A-G-T-G-C-A`);
                        }
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs shrink-0"
                    >
                      Kiểm tra
                    </button>
                  </div>
                  {sgkResult && (
                    <p className={`text-[11px] mt-2 font-medium ${sgkResult.startsWith('Chính xác') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {sgkResult}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: EXPLODED / UNWOUND VIEW */}
          {labMode === 'explode' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-cyan-400" />
                  <span>Bóc Tách & Tháo Xoắn 2 Mạch</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Kéo thanh trượt để tách rời 2 mạch đơn, quan sát sự đứt gãy của liên kết hydrogen yếu trong khi khung đường - phosphate vẫn nguyên vẹn.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Độ giãn cách 2 mạch:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {Math.round(separationFactor * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={separationFactor}
                  onChange={e => setSeparationFactor(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Xoắn kép)</span>
                  <span>50% (Đứt liên kết hydrogen)</span>
                  <span>100% (Tách hoàn toàn)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Ý nghĩa sinh học quan trọng:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Liên kết hydrogen giữa hai mạch là liên kết yếu, giúp enzyme tháo xoắn (Helicase) dễ dàng bóc tách hai mạch để làm khuôn trong quá trình nhân đôi và phiên mã.
                </p>
              </div>
            </div>
          )}

          {/* MODE 3: REPLICATION SIMULATION */}
          {labMode === 'replication' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-400" />
                  <span>Mô Phỏng Nhân Đôi DNA</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Tuân theo 2 nguyên tắc cốt lõi: <strong>Nguyên tắc bổ sung</strong> và <strong>Nguyên tắc bán bảo tồn</strong>.
                </p>
              </div>

              {/* 3 Step Stepper */}
              <div className="space-y-2">
                {[
                  {
                    step: 1,
                    title: 'Bước 1: Tháo xoắn & tách mạch',
                    desc: 'Enzyme Helicase cắt đứt các liên kết hydrogen giữa 2 mạch, tạo chạc chữ Y.',
                  },
                  {
                    step: 2,
                    title: 'Bước 2: Lắp ráp nucleotide tự do',
                    desc: 'DNA Polymerase gắn các nucleotide tự do từ môi trường theo nguyên tắc bổ sung (A-T, G-C).',
                  },
                  {
                    step: 3,
                    title: 'Bước 3: Tạo thành 2 phân tử DNA con',
                    desc: 'Mỗi DNA con chứa 1 mạch mẹ cũ và 1 mạch mới tổng hợp (Bán bảo tồn - Semi-conservative).',
                  },
                ].map(s => (
                  <button
                    key={s.step}
                    onClick={() => handleReplicationStep(s.step)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      replicationStep === s.step
                        ? 'border-amber-500 bg-amber-950/40 shadow-md ring-1 ring-amber-500/40'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                          replicationStep === s.step ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s.step}
                      </span>
                      <span className="font-bold text-white text-xs">{s.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 pl-7">{s.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-amber-800/40 text-[11px] text-amber-300/90 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  Kết quả: Từ 1 phân tử DNA ban đầu tạo ra 2 phân tử DNA con hoàn toàn giống nhau và giống DNA mẹ.
                </span>
              </div>
            </div>
          )}

          {/* MODE 4: COMPLEMENTARY BASE PAIRING PUZZLE GAME */}
          {labMode === 'puzzle' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    <span>Lắp Ghép Mạch Bổ Sung</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Chọn nucleotide đúng để lắp ráp mạch thứ 2 theo nguyên tắc bổ sung!
                  </p>
                </div>
                <button
                  onClick={resetPuzzle}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Chơi lại"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Template Strand vs Matched Strand */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">MẠCH KHUÔN (5' → 3'):</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {puzzleTargetSequence.map((base, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow"
                        style={{ backgroundColor: BASE_DETAILS[base].colorHex }}
                      >
                        {base}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-2">
                  <span className="text-[10px] text-slate-400 block mb-1">MẠCH BỔ SUNG CỦA BẠN (3' → 5'):</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {puzzleUserMatches.map((matched, idx) => (
                      <div
                        key={idx}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${
                          matched
                            ? 'text-white border-transparent shadow'
                            : 'border-dashed border-slate-700 bg-slate-900/60 text-slate-500'
                        }`}
                        style={matched ? { backgroundColor: BASE_DETAILS[matched].colorHex } : {}}
                      >
                        {matched || '?'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons: choose A, T, G, C */}
              {!puzzleFinished ? (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Nhấp chọn nucleotide tiếp theo:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {(['A', 'T', 'G', 'C'] as const).map(b => (
                      <button
                        key={b}
                        onClick={() => handleSelectPuzzleBase(b)}
                        className="py-2.5 rounded-xl font-black text-sm text-white shadow-md transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
                        style={{ backgroundColor: BASE_DETAILS[b].colorHex }}
                      >
                        <span>{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm">XUẤT SẮC! HOÀN THÀNH MẠCH DNA</h4>
                  <p className="text-xs text-emerald-200">
                    Bạn đã vận dụng hoàn hảo nguyên tắc bổ sung A-T (2 lk) và G-C (3 lk).
                  </p>
                  <button
                    onClick={resetPuzzle}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Chơi lại lượt mới
                  </button>
                </div>
              )}

              {puzzleFeedback && !puzzleFinished && (
                <p className="text-xs font-medium text-slate-300 italic pt-1">{puzzleFeedback}</p>
              )}
            </div>
          )}

          {/* MODE 5: MINI QUIZ */}
          {labMode === 'quiz' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-cyan-400" />
                  <span>Kiểm Tra Nhanh Cấu Trúc DNA</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">3 câu hỏi chớp nhoáng củng cố kiến thức phòng lab.</p>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Q1 */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-semibold text-white">1. Đường kính chuỗi xoắn kép DNA theo Watson-Crick là:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['2.0 nm (20 Å)', '3.4 nm (34 Å)', '0.34 nm (3.4 Å)', '10 nm (100 Å)'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, 1: opt }))}
                        className={`p-2 rounded-lg text-left transition-colors font-mono text-[11px] ${
                          quizAnswers[1] === opt
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-semibold text-white">2. Số liên kết hydrogen giữa cặp Guanine (G) và Cytosine (C) là:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['1 liên kết', '2 liên kết', '3 liên kết', '4 liên kết'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, 2: opt }))}
                        className={`p-2 rounded-lg text-left transition-colors font-mono text-[11px] ${
                          quizAnswers[2] === opt
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3 */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-semibold text-white">3. Chiều của hai mạch đơn trong chuỗi xoắn kép DNA là:</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {['Cùng chiều 5\' → 3\'', 'Song song ngược chiều (antiparallel 5\'→3\' và 3\'→5\')', 'Không có chiều xác định'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, 3: opt }))}
                        className={`p-2 rounded-lg text-left transition-colors text-[11px] ${
                          quizAnswers[3] === opt
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={() => {
                    setQuizSubmitted(true);
                    playSynthesizedTone('correct');
                  }}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs shadow-md shadow-cyan-900/40"
                >
                  Kiểm tra kết quả
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Đáp án chính xác: 1. 2.0 nm (20 Å) | 2. 3 liên kết | 3. Song song ngược chiều</span>
                  </div>
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="text-cyan-400 hover:underline text-[11px]"
                  >
                    Làm lại bài kiểm tra
                  </button>
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* Detail inspection card popup for any selected part */}
      {selectedPartDetail && (
        <ModelDetailCard
          detail={selectedPartDetail}
          onClose={() => setSelectedPartDetail(null)}
          onResumeRotation={handleResumeRotation}
          onSelectDetail={(part) => setSelectedPartDetail(part)}
          allParts={Object.values(DNA_INSPECTION_PARTS)}
        />
      )}
    </div>
  );
};

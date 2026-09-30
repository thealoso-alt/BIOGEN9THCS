import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  Box,
  Scale,
  Info
} from 'lucide-react';
import {
  ModelSubpartDetail,
  ModelDetailCard,
  ModelHoverPill,
  ModelPartsChipsList,
  playToneEffect,
  ProcessTimelineScrubber,
  TimelineStageMarker
} from './ModelInspectionHUD';
import { MitosisMeiosisComparisonModal } from './MitosisMeiosisComparisonModal';

interface MeiosisPhaseInfo {
  id: string;
  nameVi: string;
  nameEn: string;
  stageGroup: 'meiosis1' | 'meiosis2';
  events: string;
  chromosomesState: string;
  stats: {
    totalN: string;
    state: string;
    chromatids: number;
    centromeres: number;
    arrangement: string;
  };
  significance: string;
}

const MEIOSIS_TIMELINE_STAGES: TimelineStageMarker[] = [
  {
    id: 'prophase1',
    label: 'Kỳ Đầu I (Prophase I)',
    shortLabel: 'Đầu I (0%)',
    range: [0, 15],
    desc: 'NST tương đồng tiếp hợp & trao đổi chéo tại Chiasma; màng nhân tiêu biến.'
  },
  {
    id: 'metaphase1',
    label: 'Kỳ Giữa I (Metaphase I)',
    shortLabel: 'Giữa I (16%)',
    range: [16, 28],
    desc: 'Các cặp NST kép tương đồng xếp thành 2 HÀNG SONG SONG tại mặt phẳng xích đạo.'
  },
  {
    id: 'anaphase1',
    label: 'Kỳ Sau I (Anaphase I)',
    shortLabel: 'Sau I (29%)',
    range: [29, 42],
    desc: 'Các NST kép trong cặp phân ly độc lập về 2 cực (tâm động CHƯA tách).'
  },
  {
    id: 'telophase1',
    label: 'Kỳ Cuối I (Telophase I)',
    shortLabel: 'Cuối I (43%)',
    range: [43, 50],
    desc: 'Tế bào chất phân chia tạo 2 tế bào con mang bộ NST đơn bội kép (n kép).'
  },
  {
    id: 'prophase2',
    label: 'Kỳ Đầu II (Prophase II)',
    shortLabel: 'Đầu II (51%)',
    range: [51, 62],
    desc: 'NST co xoắn lại, thoi phân bào mới hình thành ở cả 2 tế bào con.'
  },
  {
    id: 'metaphase2',
    label: 'Kỳ Giữa II (Metaphase II)',
    shortLabel: 'Giữa II (63%)',
    range: [63, 75],
    desc: 'n NST kép xếp thành 1 HÀNG trên mặt phẳng xích đạo của từng tế bào.'
  },
  {
    id: 'anaphase2',
    label: 'Kỳ Sau II (Anaphase II)',
    shortLabel: 'Sau II (76%)',
    range: [76, 88],
    desc: 'Tâm động tách đôi! 2 chromatid phân ly thành 2 NST đơn về 2 cực tế bào.'
  },
  {
    id: 'telophase2',
    label: 'Kỳ Cuối II & 4 Giao Tử',
    shortLabel: 'Cuối II (89%)',
    range: [89, 100],
    desc: 'Hoàn tất phân chia tạo 4 tế bào con đơn bội (n) mang biến dị tổ hợp phong phú.'
  }
];

const getMeiosisEventLabel = (pct: number): string => {
  if (pct < 8) return 'Kỳ đầu I: Các NST kép tương đồng tìm đến nhau, tiếp hợp dọc tạo thể tứ tử (tetrad).';
  if (pct < 16) return 'Kỳ đầu I: Bắt chéo (Chiasma) và trao đổi chéo giữa các chromatid phi chị em gây hoán vị gen!';
  if (pct < 23) return 'Kỳ giữa I: Thoi phân bào đính kinetochore; các cặp tương đồng di chuyển về xích đạo.';
  if (pct < 29) return 'Kỳ giữa I: Các cặp NST kép tương đồng xếp thành ĐÚNG 2 HÀNG song song trên xích đạo.';
  if (pct < 36) return 'Kỳ sau I: Toàn bộ NST kép trong từng cặp phân ly độc lập về 2 cực (tâm động KHÔNG tách).';
  if (pct < 43) return 'Kỳ sau I: Hai nhóm NST kép về đến 2 cực đối diện, chuẩn bị phân chia lần thứ nhất.';
  if (pct < 51) return 'Kỳ cuối I: Tế bào chất thắt eo chia thành 2 tế bào con chứa n NST kép (giảm nhiễm).';
  if (pct < 57) return 'Kỳ đầu II: NST kép co ngắn trở lại; thoi phân bào mới hình thành ở 2 tế bào con.';
  if (pct < 63) return 'Kỳ đầu II: Màng nhân tiêu biến, vi ống bám vào thể động ở 2 phía của tâm động.';
  if (pct < 76) return 'Kỳ giữa II: n NST kép xếp thành MỘT HÀNG trên mặt phẳng xích đạo của mỗi tế bào con.';
  if (pct < 83) return 'Kỳ sau II: TÂM ĐỘNG TÁCH ĐÔI! 2 chromatid chị em phân ly thành 2 NST đơn về 2 cực.';
  if (pct < 89) return 'Kỳ sau II: Các NST đơn được kéo nhanh về các cực của 2 tế bào dưới lực co thoi vô sắc.';
  if (pct < 95) return 'Kỳ cuối II: Màng nhân tái lập, màng tế bào thắt eo chia đôi cả 2 tế bào con.';
  return 'Hoàn tất giảm phân: Tạo thành 4 giao tử đơn bội (n) mang các tổ hợp gen tái tổ hợp độc nhất!';
};

const MEIOSIS_PHASE_DETAILS: Record<string, MeiosisPhaseInfo> = {
  prophase1: {
    id: 'prophase1',
    nameVi: 'Kỳ Đầu I (Prophase I)',
    nameEn: 'Prophase I (Synapsis & Crossing Over)',
    stageGroup: 'meiosis1',
    events: 'Các NST kép tương đồng tiếp hợp dọc theo chiều dài (synapsis) tạo thành thể tứ tử (tetrad). Xảy ra hiện tượng trao đổi chéo (crossing-over) giữa 2 chromatid khác nguồn tại điểm bắt chéo (Chiasma) dẫn đến hoán vị gen. Màng nhân tiêu biến, thoi phân bào hình thành.',
    chromosomesState: '2n kép = 4 NST kép (8 chromatid, 4 tâm động) - Tiếp hợp & bắt chéo',
    stats: {
      totalN: '2n = 4',
      state: 'Kép (Tiếp hợp)',
      chromatids: 8,
      centromeres: 4,
      arrangement: 'Tập hợp thành các cặp tương đồng'
    },
    significance: 'Cội nguồn sinh học quan trọng nhất tạo ra các biến dị tổ hợp phong phú ở sinh vật sinh sản hữu tính.'
  },
  metaphase1: {
    id: 'metaphase1',
    nameVi: 'Kỳ Giữa I (Metaphase I)',
    nameEn: 'Metaphase I (Double-row Alignment)',
    stageGroup: 'meiosis1',
    events: 'Các cặp NST kép tương đồng co xoắn cực đại, định vị tập trung xếp thành HAI HÀNG SONG SONG trên mặt phẳng xích đạo của thoi phân bào. Sợi thoi từ mỗi cực chỉ đính vào một phía của mỗi NST kép trong cặp.',
    chromosomesState: '2n kép = 4 NST kép (8 chromatid, 4 tâm động) - Xếp thành 2 hàng',
    stats: {
      totalN: '2n = 4',
      state: 'Kép co xoắn cực đại',
      chromatids: 8,
      centromeres: 4,
      arrangement: '2 hàng song song đối xứng qua xích đạo'
    },
    significance: 'Dấu hiệu then chốt phân biệt với nguyên phân (nơi NST chỉ xếp 1 hàng).'
  },
  anaphase1: {
    id: 'anaphase1',
    nameVi: 'Kỳ Sau I (Anaphase I)',
    nameEn: 'Anaphase I (Independent Assortment)',
    stageGroup: 'meiosis1',
    events: 'Dưới lực co rút của thoi vô sắc, CÁC NST KÉP TRONG CẶP TƯƠNG ĐỒNG phân ly độc lập và tổ hợp tự do về 2 cực tế bào. Lưu ý: Tâm động CHƯA tách đôi, mỗi NST vẫn ở dạng kép gồm 2 chromatid dính nhau.',
    chromosomesState: '2n kép = 4 NST kép (8 chromatid, 4 tâm động) - Phân ly về 2 cực',
    stats: {
      totalN: '2n = 4',
      state: 'Kép (phân ly độc lập)',
      chromatids: 8,
      centromeres: 4,
      arrangement: 'Mỗi cực nhận n = 2 NST kép'
    },
    significance: 'Cơ sở tế bào học cho quy luật phân ly độc lập của Mendel.'
  },
  telophase1: {
    id: 'telophase1',
    nameVi: 'Kỳ Cuối I (Telophase I)',
    nameEn: 'Telophase I & Cytokinesis',
    stageGroup: 'meiosis1',
    events: 'NST kép về đến 2 cực dãn xoắn nhẹ. Màng nhân tạm thời hình thành. Tế bào chất phân chia tạo ra 2 tế bào con, mỗi tế bào con chứa một bộ nhiễm sắc thể đơn bội kép (n kép = 2 NST kép).',
    chromosomesState: 'Mỗi tế bào: n kép = 2 NST kép (4 chromatid, 2 tâm động)',
    stats: {
      totalN: 'n = 2 (mỗi tb)',
      state: 'Kép (đơn bội)',
      chromatids: 4,
      centromeres: 2,
      arrangement: '2 tế bào con độc lập'
    },
    significance: 'Hoàn tất phân chia giảm nhiễm: số lượng NST giảm một nửa từ 2n xuống n.'
  },
  prophase2: {
    id: 'prophase2',
    nameVi: 'Kỳ Đầu II (Prophase II)',
    nameEn: 'Prophase II',
    stageGroup: 'meiosis2',
    events: 'Không có nhân đôi ADN ở kỳ trung gian trước đó! Các NST kép trong cả 2 tế bào con co ngắn trở lại. Màng nhân tiêu biến, thoi phân bào mới hình thành ở mỗi tế bào theo trục vuông góc với lần phân bào I.',
    chromosomesState: 'Mỗi tế bào: n kép = 2 NST kép (4 chromatid, 2 tâm động)',
    stats: {
      totalN: 'n = 2 (mỗi tb)',
      state: 'Kép co xoắn',
      chromatids: 4,
      centromeres: 2,
      arrangement: 'Rải rác trong 2 tế bào con'
    },
    significance: 'Khởi đầu lần phân bào thứ 2 để tách các chromatid chị em.'
  },
  metaphase2: {
    id: 'metaphase2',
    nameVi: 'Kỳ Giữa II (Metaphase II)',
    nameEn: 'Metaphase II (Single-row Alignment)',
    stageGroup: 'meiosis2',
    events: 'Ở mỗi tế bào con, n NST kép co xoắn cực đại và tập trung xếp thành MỘT HÀNG trên mặt phẳng xích đạo của thoi phân bào. Sợi thoi từ 2 cực đính vào 2 phía của tâm động.',
    chromosomesState: 'Mỗi tế bào: n kép = 2 NST kép (4 chromatid, 2 tâm động) - Xếp 1 hàng',
    stats: {
      totalN: 'n = 2 (mỗi tb)',
      state: 'Kép co xoắn cực đại',
      chromatids: 4,
      centromeres: 2,
      arrangement: '1 hàng trên xích đạo mỗi tế bào'
    },
    significance: 'Tương tự như kỳ giữa của nguyên phân nhưng với số lượng đơn bội (n).'
  },
  anaphase2: {
    id: 'anaphase2',
    nameVi: 'Kỳ Sau II (Anaphase II)',
    nameEn: 'Anaphase II (Centromere Cleavage)',
    stageGroup: 'meiosis2',
    events: 'TÂM ĐỘNG TÁCH ĐÔI! Mỗi NST kép tách thành 2 NST đơn riêng biệt. Dưới sức kéo của thoi phân bào, các NST đơn phân ly đều về 2 cực của mỗi tế bào.',
    chromosomesState: 'Mỗi tế bào: 2n đơn = 4 NST đơn (0 chromatid, 4 tâm động)',
    stats: {
      totalN: '2n = 4 (mỗi tb)',
      state: 'Đơn (tâm động đã tách)',
      chromatids: 0,
      centromeres: 4,
      arrangement: 'Các NST đơn phân ly về 2 cực'
    },
    significance: 'Tách hoàn toàn các bản sao chromatid và đoạn lai trao đổi chéo.'
  },
  telophase2: {
    id: 'telophase2',
    nameVi: 'Kỳ Cuối II & 4 Giao Tử',
    nameEn: 'Telophase II & 4 Haploid Gametes',
    stageGroup: 'meiosis2',
    events: 'Các NST đơn dãn xoắn. Màng nhân và nhân con tái lập. Cả 2 tế bào con tiếp tục phân chia tế bào chất, tạo thành BỐN TẾ BÀO CON ĐƠN BỘI (n đơn = 2 NST đơn). Ở giống đực phát triển thành 4 tinh trùng; ở giống cái tạo 1 trứng và 3 thể cực.',
    chromosomesState: 'Mỗi giao tử: n đơn = 2 NST đơn (0 chromatid, 2 tâm động)',
    stats: {
      totalN: 'n = 2 (mỗi giao tử)',
      state: 'Đơn bội n đơn',
      chromatids: 0,
      centromeres: 2,
      arrangement: '4 giao tử riêng biệt'
    },
    significance: 'Tạo 4 giao tử có cấu trúc di truyền độc nhất, sẵn sàng kết hợp trong thụ tinh.'
  }
};

const MEIOSIS_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  crossing_over: {
    id: 'crossing_over',
    name: 'Hiện Tượng Trao Đổi Chéo (Crossing Over)',
    nameEn: 'Crossing Over (Genetic Recombination)',
    category: 'Cơ chế biến dị',
    parentModel: 'Mô Hình Phân Bào Giảm Phân (Meiosis)',
    structure: 'Xảy ra ở kỳ đầu I (Prophase I) giữa 2 trong 4 chromatid khác nguồn gốc của cặp NST kép tương đồng.',
    functionRole: 'Hoán đổi các đoạn tương ứng của phân tử DNA, dẫn đến sự hoán vị gen và tái tổ hợp các alen của bố và mẹ.',
    keyFact: 'Nguồn gốc chính tạo ra vô số các biến dị tổ hợp phong phú ở các loài sinh sản hữu tính.',
    colorHex: '#ec4899'
  },
  chiasma: {
    id: 'chiasma',
    name: 'Điểm Bắt Chéo (Chiasma)',
    nameEn: 'Chiasma Point',
    category: 'Cấu trúc tiếp hợp',
    parentModel: 'Mô Hình Phân Bào Giảm Phân (Meiosis)',
    structure: 'Vị trí tiếp xúc hình chữ X nơi hai nhánh chromatid phi chị em đan chéo và bẻ gãy - nối lại với nhau.',
    functionRole: 'Giữ chặt cặp NST tương đồng gắn kết với nhau trước khi phân ly ở kỳ sau I và xúc tác tái tổ hợp gen.',
    keyFact: 'Tần số hoán vị gen (f) tỷ lệ thuận với khoảng cách giữa các gen trên NST.',
    colorHex: '#f59e0b'
  },
  tetrad_align: {
    id: 'tetrad_align',
    name: 'NST Kép Tương Đồng Xếp 2 Hàng (Kỳ Giữa I)',
    nameEn: 'Double-row Metaphase I Alignment',
    category: 'Sắp xếp mặt phẳng xích đạo',
    parentModel: 'Mô Hình Phân Bào Giảm Phân (Meiosis)',
    structure: 'Mỗi cặp gồm 2 NST kép (4 chromatid) xếp đối diện song song qua mặt phẳng xích đạo.',
    functionRole: 'Định hướng cho sự phân ly độc lập của nguyên chiếc NST kép về 2 cực tế bào mà không tách tâm động.',
    keyFact: 'Xếp 2 hàng ở GP I là điểm khác biệt độc nhất so với 1 hàng ở Nguyên phân và GP II.',
    colorHex: '#8b5cf6'
  },
  reduction: {
    id: 'reduction',
    name: 'Sự Giảm Nhiễm (2n Kép → n Kép → n Đơn)',
    nameEn: 'Reductional Division',
    category: 'Cơ chế số lượng',
    parentModel: 'Mô Hình Phân Bào Giảm Phân (Meiosis)',
    structure: 'Trải qua 2 lần phân bào liên tiếp nhưng DNA chỉ nhân đôi đúng 1 lần duy nhất ở kỳ trung gian trước giảm phân I.',
    functionRole: 'Tạo ra 4 tế bào con có bộ NST giảm đi một nửa (đơn bội n) so với tế bào mẹ ban đầu (lưỡng bội 2n).',
    keyFact: 'Khi thụ tinh (n + n = 2n), bộ NST 2n đặc trưng của loài được phục hồi nguyên vẹn qua các thế hệ.',
    colorHex: '#0284c7'
  },
  gametes: {
    id: 'gametes',
    name: 'Bốn Giao Tử Đơn Bội (n) Tái Tổ Hợp',
    nameEn: '4 Recombinant Haploid Gametes (n)',
    category: 'Sản phẩm giảm phân',
    parentModel: 'Mô Hình Phân Bào Giảm Phân (Meiosis)',
    structure: 'Ở giới đực phát triển thành 4 tinh trùng (n); ở giới cái tạo thành 1 trứng (n) lớn và 3 thể cực (thể định hướng tiêu biến).',
    functionRole: 'Tham gia vào quá trình thụ tinh kết hợp vật chất di truyền của hai cá thể bố và mẹ.',
    keyFact: 'Mỗi giao tử mang một tổ hợp gen độc nhất vô nhị nhờ sự phân ly độc lập và trao đổi chéo.',
    colorHex: '#10b981'
  }
};

export const MeiosisModel: React.FC = () => {
  const [progress, setProgress] = useState<number>(22);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewportTheme, setViewportTheme] = useState<'deep' | 'lab'>('deep');
  const [inspectedDetail, setInspectedDetail] = useState<ModelSubpartDetail | null>(null);
  const [hoveredDetail, setHoveredDetail] = useState<ModelSubpartDetail | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Compute current phase based on progress
  const getCurrentPhaseId = (pct: number): string => {
    if (pct <= 15) return 'prophase1';
    if (pct <= 28) return 'metaphase1';
    if (pct <= 42) return 'anaphase1';
    if (pct <= 50) return 'telophase1';
    if (pct <= 62) return 'prophase2';
    if (pct <= 75) return 'metaphase2';
    if (pct <= 88) return 'anaphase2';
    return 'telophase2';
  };

  const currentPhaseId = getCurrentPhaseId(progress);
  const currentPhaseInfo = MEIOSIS_PHASE_DETAILS[currentPhaseId];

  const mountRef = useRef<HTMLDivElement | null>(null);
  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });

  // Auto-simulation animation loop
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setProgress((prev) => {
        const next = prev + dt * 12 * speed;
        if (next >= 100) return 0;
        return next;
      });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  const handleSelectDetail = (detail: ModelSubpartDetail) => {
    setAutoRotate(false);
    autoRotateRef.current = false;
    setInspectedDetail(detail);
    playToneEffect(530);
  };

  const handleResumeRotation = () => {
    setInspectedDetail(null);
    setAutoRotate(true);
    autoRotateRef.current = true;
    playToneEffect(440);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const factor = direction === 'in' ? 0.85 : 1.15;
    cameraRef.current.position.z = Math.max(12, Math.min(70, cameraRef.current.position.z * factor));
  };

  const allPartsList = Object.values(MEIOSIS_PARTS_INFO);

  // Initialize Three.js scene once on mount
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 36);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xec4899, 1.2);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0284c7, 1.0);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 16);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildMeiosis3DScene(progress, mainGroup);

    // Raycaster for 3D interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = { x: 0, y: 0, time: 0 };

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotateRef.current && modelGroupRef.current && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
    };
    animate();

    const domElement = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
      downPos = { x: e.clientX, y: e.clientY, time: Date.now() };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current) {
        const rect = domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(mainGroup.children, true);
        let foundPart: ModelSubpartDetail | null = null;
        for (const hit of hits) {
          let cur: THREE.Object3D | null = hit.object;
          while (cur && !cur.userData?.partInfo) cur = cur.parent;
          if (cur?.userData?.partInfo) {
            foundPart = cur.userData.partInfo;
            break;
          }
        }
        setHoveredDetail(foundPart);
        domElement.style.cursor = foundPart ? 'pointer' : 'grab';
        return;
      }

      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      modelGroupRef.current.rotation.y += dx * 0.01;
      modelGroupRef.current.rotation.x += dy * 0.008;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      const dx = Math.abs(e.clientX - downPos.x);
      const dy = Math.abs(e.clientY - downPos.y);
      const dt = Date.now() - downPos.time;

      if (dx < 6 && dy < 6 && dt < 450) {
        const rect = domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(mainGroup.children, true);
        for (const hit of hits) {
          let cur: THREE.Object3D | null = hit.object;
          while (cur && !cur.userData?.partInfo) cur = cur.parent;
          if (cur?.userData?.partInfo) {
            handleSelectDetail(cur.userData.partInfo);
            break;
          }
        }
      }
    };

    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update 3D scene smoothly whenever progress changes
  useEffect(() => {
    if (modelGroupRef.current) {
      buildMeiosis3DScene(progress, modelGroupRef.current);
    }
  }, [progress]);

  // Construct full 3D Meiosis simulation dynamically matching progress (0% - 100%)
  const buildMeiosis3DScene = (pct: number, group: THREE.Group) => {
    group.clear();
    const t = Math.max(0, Math.min(100, pct)) / 100; // 0.0 to 1.0

    // Colors:
    const colorFather = 0x0284c7; // Paternal 1 (Cyan/Blue)
    const colorMother = 0xec4899; // Maternal 1 (Pink)
    const colorFather2 = 0x6366f1; // Paternal 2 (Indigo)
    const colorMother2 = 0xf43f5e; // Maternal 2 (Rose)

    // STAGE DIVISION:
    // 0.0 - 0.50: GIẢM PHÂN I (Prophase I -> Metaphase I -> Anaphase I -> Telophase I)
    // 0.51 - 1.00: GIẢM PHÂN II (Prophase II -> Metaphase II -> Anaphase II -> Telophase II 4 gametes)

    if (t <= 0.50) {
      // ==========================================
      // GIẢM PHÂN I: Phân chia giảm nhiễm (0 - 50%)
      // ==========================================

      // 1. Cell Envelope Dynamics
      if (t < 0.40) {
        // Single cell
        const cellMesh = new THREE.Mesh(
          new THREE.SphereGeometry(12, 32, 24),
          new THREE.MeshStandardMaterial({
            color: 0xec4899,
            transparent: true,
            opacity: 0.12,
            wireframe: true
          })
        );
        cellMesh.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
        group.add(cellMesh);
      } else {
        // Furrow pinching in Telophase I (0.40 -> 0.50)
        const furrowFactor = (t - 0.40) / 0.10; // 0.0 -> 1.0
        const lobeY = 3.8 + furrowFactor * 2.8;
        const lobeRadius = 8.2 - furrowFactor * 0.7;

        const topLobe = new THREE.Mesh(
          new THREE.SphereGeometry(lobeRadius, 24, 20),
          new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.14, wireframe: true })
        );
        topLobe.position.set(0, lobeY, 0);
        topLobe.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
        group.add(topLobe);

        const botLobe = new THREE.Mesh(
          new THREE.SphereGeometry(lobeRadius, 24, 20),
          new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.14, wireframe: true })
        );
        botLobe.position.set(0, -lobeY, 0);
        botLobe.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
        group.add(botLobe);

        // Furrow ring at equator
        const ringRad = Math.max(0.5, 9.0 * (1 - furrowFactor * 0.85));
        const furrowRing = new THREE.Mesh(
          new THREE.TorusGeometry(ringRad, 0.3, 12, 32),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, emissive: 0xd97706, emissiveIntensity: 0.4 })
        );
        furrowRing.rotation.x = Math.PI / 2;
        group.add(furrowRing);
      }

      // Centrosomes at poles (y = ±9.0)
      const poleY = 9.2;
      const topCent = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.2 })
      );
      topCent.position.set(0, poleY, 0);
      group.add(topCent);

      const botCent = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.2 })
      );
      botCent.position.set(0, -poleY, 0);
      group.add(botCent);

      // Sub-phases of Meiosis I:
      if (t <= 0.15) {
        // --- KỲ ĐẦU I (0 - 15%): Tiếp hợp (Synapsis) & Trao đổi chéo tại Chiasma
        const u = t / 0.15; // 0.0 -> 1.0
        // Nuclear membrane dissolves gradually
        const nucOpacity = 0.35 * (1 - u);
        if (nucOpacity > 0.05) {
          const nuc = new THREE.Mesh(
            new THREE.SphereGeometry(7.5, 24, 20),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: nucOpacity })
          );
          group.add(nuc);
        }

        // Two homologous chromosomes approaching each other:
        // Paternal 1 (left) and Maternal 1 (right)
        const separation = 4.2 * (1 - u * 0.75); // Distance shrinks from 4.2 to 1.0
        const crossAlpha = Math.max(0, (u - 0.4) / 0.6); // Chiasma contact develops in second half

        // Chromosome 1 (Paternal - Cyan/Blue)
        const c1Pts = [
          new THREE.Vector3(-separation, 6.5, 0),
          new THREE.Vector3(-separation * 0.6, 2.5, 0.3),
          new THREE.Vector3(-0.2 * crossAlpha, 0, 0.2 * crossAlpha), // touch at center
          new THREE.Vector3(-separation * 0.6, -2.5, 0.3),
          new THREE.Vector3(-separation, -6.5, 0)
        ];
        const m1 = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c1Pts), 24, 0.55, 12, false),
          new THREE.MeshStandardMaterial({ color: colorFather, roughness: 0.3 })
        );
        m1.userData = { partInfo: MEIOSIS_PARTS_INFO.crossing_over };
        group.add(m1);

        // Sister chromatid behind for Paternal
        const c1SisterPts = [
          new THREE.Vector3(-separation - 0.7, 6.0, -0.4),
          new THREE.Vector3(-separation * 0.8, 0, -0.4),
          new THREE.Vector3(-separation - 0.7, -6.0, -0.4)
        ];
        const m1Sister = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c1SisterPts), 16, 0.45, 10, false),
          new THREE.MeshStandardMaterial({ color: colorFather, roughness: 0.35 })
        );
        group.add(m1Sister);

        // Chromosome 2 (Maternal - Pink)
        const c2Pts = [
          new THREE.Vector3(separation, 6.5, 0),
          new THREE.Vector3(separation * 0.6, 2.5, 0.3),
          new THREE.Vector3(0.2 * crossAlpha, 0, 0.2 * crossAlpha), // touch at center
          new THREE.Vector3(separation * 0.6, -2.5, 0.3),
          new THREE.Vector3(separation, -6.5, 0)
        ];
        const m2 = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c2Pts), 24, 0.55, 12, false),
          new THREE.MeshStandardMaterial({ color: colorMother, roughness: 0.3 })
        );
        m2.userData = { partInfo: MEIOSIS_PARTS_INFO.crossing_over };
        group.add(m2);

        // Sister chromatid behind for Maternal
        const c2SisterPts = [
          new THREE.Vector3(separation + 0.7, 6.0, -0.4),
          new THREE.Vector3(separation * 0.8, 0, -0.4),
          new THREE.Vector3(separation + 0.7, -6.0, -0.4)
        ];
        const m2Sister = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c2SisterPts), 16, 0.45, 10, false),
          new THREE.MeshStandardMaterial({ color: colorMother, roughness: 0.35 })
        );
        group.add(m2Sister);

        // Chiasma intersection beacon (glowing gold)
        if (crossAlpha > 0.1) {
          const chiasmaDot = new THREE.Mesh(
            new THREE.SphereGeometry(1.2 * crossAlpha, 16, 16),
            new THREE.MeshStandardMaterial({
              color: 0xfacc15,
              emissive: 0xeab308,
              emissiveIntensity: 0.6,
              roughness: 0.2
            })
          );
          chiasmaDot.position.set(0, 0, 0.2);
          chiasmaDot.userData = { partInfo: MEIOSIS_PARTS_INFO.chiasma };
          group.add(chiasmaDot);

          // Recombinant tip segments swapping colors on chromatids!
          const swapTip1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 12, 12),
            new THREE.MeshStandardMaterial({ color: colorMother, emissive: colorMother, emissiveIntensity: 0.3 })
          );
          swapTip1.position.set(-0.8, 1.8, 0.2);
          group.add(swapTip1);

          const swapTip2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 12, 12),
            new THREE.MeshStandardMaterial({ color: colorFather, emissive: colorFather, emissiveIntensity: 0.3 })
          );
          swapTip2.position.set(0.8, -1.8, 0.2);
          group.add(swapTip2);
        }

      } else if (t <= 0.28) {
        // --- KỲ GIỮA I (16 - 28%): CÁC CẶP NST KÉP TƯƠNG ĐỒNG XẾP THÀNH 2 HÀNG SONG SONG
        // Row 1 (Top row at y = +1.8), Row 2 (Bottom row at y = -1.8)
        // Two pairs: Pair 1 (x = -2.8), Pair 2 (x = +2.8)
        const rowOffset = 1.9; // Y distance above and below equator

        // Pair 1 (Longer: Paternal top row, Maternal bottom row with recombinant tips)
        [-2.6, 2.6].forEach((xPos, pIdx) => {
          const cTopColor = pIdx === 0 ? colorFather : colorFather2;
          const cBotColor = pIdx === 0 ? colorMother : colorMother2;
          const armLen = pIdx === 0 ? 3.4 : 2.6;

          // Upper chromosome in Row 1 (pointing toward top pole)
          const arm1Top = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.42, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cTopColor, roughness: 0.3 })
          );
          arm1Top.position.set(xPos, rowOffset, 0);
          arm1Top.rotation.z = Math.PI / 4;
          arm1Top.userData = { partInfo: MEIOSIS_PARTS_INFO.tetrad_align };
          group.add(arm1Top);

          const arm2Top = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.42, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cTopColor, roughness: 0.3 })
          );
          arm2Top.position.set(xPos, rowOffset, 0);
          arm2Top.rotation.z = -Math.PI / 4;
          arm2Top.userData = { partInfo: MEIOSIS_PARTS_INFO.tetrad_align };
          group.add(arm2Top);

          // Recombinant tip badge on upper chromosome
          const tipMesh1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.45, 10, 10),
            new THREE.MeshStandardMaterial({ color: cBotColor, emissive: cBotColor, emissiveIntensity: 0.4 })
          );
          tipMesh1.position.set(xPos + 0.9, rowOffset - armLen * 0.35, 0.2);
          group.add(tipMesh1);

          // Kinetochore / Centromere dot (outer side facing pole)
          const centTop = new THREE.Mesh(
            new THREE.SphereGeometry(0.55, 14, 14),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, emissive: 0xeab308, emissiveIntensity: 0.3 })
          );
          centTop.position.set(xPos, rowOffset, 0);
          centTop.userData = { partInfo: MEIOSIS_PARTS_INFO.tetrad_align };
          group.add(centTop);

          // Spindle fiber from top pole to upper kinetochore
          const fibTop = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, poleY, 0),
            new THREE.Vector3(xPos, rowOffset, 0)
          ]);
          group.add(new THREE.Line(fibTop, new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.7, transparent: true })));

          // Lower chromosome in Row 2 (pointing toward bottom pole)
          const arm1Bot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.42, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cBotColor, roughness: 0.3 })
          );
          arm1Bot.position.set(xPos, -rowOffset, 0);
          arm1Bot.rotation.z = Math.PI / 4;
          arm1Bot.userData = { partInfo: MEIOSIS_PARTS_INFO.tetrad_align };
          group.add(arm1Bot);

          const arm2Bot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.42, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cBotColor, roughness: 0.3 })
          );
          arm2Bot.position.set(xPos, -rowOffset, 0);
          arm2Bot.rotation.z = -Math.PI / 4;
          arm2Bot.userData = { partInfo: MEIOSIS_PARTS_INFO.tetrad_align };
          group.add(arm2Bot);

          // Recombinant tip badge on lower chromosome
          const tipMesh2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.45, 10, 10),
            new THREE.MeshStandardMaterial({ color: cTopColor, emissive: cTopColor, emissiveIntensity: 0.4 })
          );
          tipMesh2.position.set(xPos - 0.9, -rowOffset + armLen * 0.35, 0.2);
          group.add(tipMesh2);

          // Kinetochore / Centromere dot (outer side facing bottom pole)
          const centBot = new THREE.Mesh(
            new THREE.SphereGeometry(0.55, 14, 14),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, emissive: 0xeab308, emissiveIntensity: 0.3 })
          );
          centBot.position.set(xPos, -rowOffset, 0);
          centBot.userData = { partInfo: MEIOSIS_PARTS_INFO.tetrad_align };
          group.add(centBot);

          // Spindle fiber from bottom pole to lower kinetochore
          const fibBot = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -poleY, 0),
            new THREE.Vector3(xPos, -rowOffset, 0)
          ]);
          group.add(new THREE.Line(fibBot, new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.7, transparent: true })));
        });

        // Highlight the 2 rows with subtle dashed guideline plane
        const planeGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-6, 0, 0),
          new THREE.Vector3(6, 0, 0)
        ]);
        const planeLine = new THREE.Line(planeGeo, new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 0.5, gapSize: 0.3 }));
        planeLine.computeLineDistances();
        group.add(planeLine);

      } else if (t <= 0.42) {
        // --- KỲ SAU I (29 - 42%): NST KÉP TƯƠNG ĐỒNG PHÂN LY ĐỘC LẬP (TÂM ĐỘNG KHÔNG TÁCH!)
        const u = (t - 0.28) / 0.14; // 0.0 -> 1.0
        const yTop = 1.9 + u * 4.4; // 1.9 -> 6.3
        const yBot = -1.9 - u * 4.4; // -1.9 -> -6.3

        [-2.6, 2.6].forEach((xPos, pIdx) => {
          const cTopColor = pIdx === 0 ? colorFather : colorFather2;
          const cBotColor = pIdx === 0 ? colorMother : colorMother2;
          const armLen = pIdx === 0 ? 3.4 : 2.6;

          // Whole X-shaped duplicated chromosome glides to top pole
          const arm1Top = new THREE.Mesh(
            new THREE.CylinderGeometry(0.40, 0.40, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cTopColor, roughness: 0.3 })
          );
          arm1Top.position.set(xPos, yTop, 0);
          arm1Top.rotation.z = Math.PI / 4;
          arm1Top.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
          group.add(arm1Top);

          const arm2Top = new THREE.Mesh(
            new THREE.CylinderGeometry(0.40, 0.40, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cTopColor, roughness: 0.3 })
          );
          arm2Top.position.set(xPos, yTop, 0);
          arm2Top.rotation.z = -Math.PI / 4;
          arm2Top.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
          group.add(arm2Top);

          // Recombinant tip
          const tipMesh1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.45, 10, 10),
            new THREE.MeshStandardMaterial({ color: cBotColor, emissive: cBotColor, emissiveIntensity: 0.4 })
          );
          tipMesh1.position.set(xPos + 0.9, yTop - armLen * 0.35, 0.2);
          group.add(tipMesh1);

          // Intact centromere dot
          const centTop = new THREE.Mesh(
            new THREE.SphereGeometry(0.52, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 })
          );
          centTop.position.set(xPos, yTop, 0);
          group.add(centTop);

          // Shortening fiber
          const fibTop = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, poleY, 0),
            new THREE.Vector3(xPos, yTop, 0)
          ]);
          group.add(new THREE.Line(fibTop, new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.8, transparent: true })));

          // Whole X-shaped duplicated chromosome glides to bottom pole
          const arm1Bot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.40, 0.40, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cBotColor, roughness: 0.3 })
          );
          arm1Bot.position.set(xPos, yBot, 0);
          arm1Bot.rotation.z = Math.PI / 4;
          arm1Bot.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
          group.add(arm1Bot);

          const arm2Bot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.40, 0.40, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cBotColor, roughness: 0.3 })
          );
          arm2Bot.position.set(xPos, yBot, 0);
          arm2Bot.rotation.z = -Math.PI / 4;
          arm2Bot.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
          group.add(arm2Bot);

          // Recombinant tip
          const tipMesh2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.45, 10, 10),
            new THREE.MeshStandardMaterial({ color: cTopColor, emissive: cTopColor, emissiveIntensity: 0.4 })
          );
          tipMesh2.position.set(xPos - 0.9, yBot + armLen * 0.35, 0.2);
          group.add(tipMesh2);

          const centBot = new THREE.Mesh(
            new THREE.SphereGeometry(0.52, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 })
          );
          centBot.position.set(xPos, yBot, 0);
          group.add(centBot);

          const fibBot = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -poleY, 0),
            new THREE.Vector3(xPos, yBot, 0)
          ]);
          group.add(new THREE.Line(fibBot, new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.8, transparent: true })));
        });

      } else {
        // --- KỲ CUỐI I (43 - 50%): TẠO 2 TẾ BÀO CON ĐƠN BỘI KÉP (n KÉP)
        const yTop = 6.4;
        const yBot = -6.4;

        [-2.4, 2.4].forEach((xPos, pIdx) => {
          const cTopColor = pIdx === 0 ? colorFather : colorFather2;
          const cBotColor = pIdx === 0 ? colorMother : colorMother2;
          const armLen = pIdx === 0 ? 3.0 : 2.4;

          const topChrom = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.38, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cTopColor, roughness: 0.3 })
          );
          topChrom.position.set(xPos, yTop, 0);
          topChrom.rotation.z = Math.PI / 4;
          topChrom.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
          group.add(topChrom);

          const botChrom = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.38, armLen, 14),
            new THREE.MeshStandardMaterial({ color: cBotColor, roughness: 0.3 })
          );
          botChrom.position.set(xPos, yBot, 0);
          botChrom.rotation.z = Math.PI / 4;
          botChrom.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
          group.add(botChrom);
        });
      }

    } else {
      // ==========================================
      // GIẢM PHÂN II: Phân chia nguyên nhiễm (51 - 100%)
      // ==========================================

      if (t <= 0.88) {
        // Two daughter cells side by side or stacked (Cell A at y = +6.0, Cell B at y = -6.0)
        const cellAY = 6.2;
        const cellBY = -6.2;

        // Two cell boundary spheres
        const cellA = new THREE.Mesh(
          new THREE.SphereGeometry(6.6, 24, 20),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.13, wireframe: true })
        );
        cellA.position.set(0, cellAY, 0);
        group.add(cellA);

        const cellB = new THREE.Mesh(
          new THREE.SphereGeometry(6.6, 24, 20),
          new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.13, wireframe: true })
        );
        cellB.position.set(0, cellBY, 0);
        group.add(cellB);

        // New centrioles in each cell (horizontal axis x = ±5.5)
        [-5.2, 5.2].forEach((cx) => {
          const cA = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
          cA.position.set(cx, cellAY, 0);
          group.add(cA);

          const cB = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
          cB.position.set(cx, cellBY, 0);
          group.add(cB);
        });

        if (t <= 0.62) {
          // --- KỲ ĐẦU II (51 - 62%): NST KÉP CO XOẮN LẠI TRONG 2 TẾ BÀO CON
          const u = (t - 0.50) / 0.12;
          [-1.6, 1.6].forEach((xPos, idx) => {
            const topC = new THREE.Mesh(
              new THREE.CylinderGeometry(0.38, 0.38, 2.8, 14),
              new THREE.MeshStandardMaterial({ color: idx === 0 ? colorFather : colorMother2, roughness: 0.3 })
            );
            topC.position.set(xPos, cellAY, 0);
            topC.rotation.z = Math.PI / 4 + (1 - u) * 0.4;
            group.add(topC);

            const botC = new THREE.Mesh(
              new THREE.CylinderGeometry(0.38, 0.38, 2.8, 14),
              new THREE.MeshStandardMaterial({ color: idx === 0 ? colorMother : colorFather2, roughness: 0.3 })
            );
            botC.position.set(xPos, cellBY, 0);
            botC.rotation.z = -Math.PI / 4 + (1 - u) * 0.4;
            group.add(botC);
          });

        } else if (t <= 0.75) {
          // --- KỲ GIỮA II (63 - 75%): n NST KÉP XẾP THÀNH 1 HÀNG TRÊN MẶT PHẲNG XÍCH ĐẠO (x = 0)
          // Inside Cell A (top):
          [-1.5, 1.5].forEach((yOffset, idx) => {
            const chromColor = idx === 0 ? colorFather : colorMother2;
            const arm = new THREE.Mesh(
              new THREE.CylinderGeometry(0.40, 0.40, 2.8, 14),
              new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
            );
            arm.position.set(0, cellAY + yOffset, 0);
            arm.rotation.z = Math.PI / 4;
            arm.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
            group.add(arm);

            const arm2 = new THREE.Mesh(
              new THREE.CylinderGeometry(0.40, 0.40, 2.8, 14),
              new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
            );
            arm2.position.set(0, cellAY + yOffset, 0);
            arm2.rotation.z = -Math.PI / 4;
            arm2.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
            group.add(arm2);

            // Centromere
            const cent = new THREE.Mesh(
              new THREE.SphereGeometry(0.5, 12, 12),
              new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.3 })
            );
            cent.position.set(0, cellAY + yOffset, 0);
            group.add(cent);

            // Spindle fibers to horizontal poles
            [-5.2, 5.2].forEach((px) => {
              const fib = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(px, cellAY, 0),
                new THREE.Vector3(0, cellAY + yOffset, 0)
              ]);
              group.add(new THREE.Line(fib, new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.65, transparent: true })));
            });
          });

          // Inside Cell B (bottom):
          [-1.5, 1.5].forEach((yOffset, idx) => {
            const chromColor = idx === 0 ? colorMother : colorFather2;
            const arm = new THREE.Mesh(
              new THREE.CylinderGeometry(0.40, 0.40, 2.8, 14),
              new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
            );
            arm.position.set(0, cellBY + yOffset, 0);
            arm.rotation.z = Math.PI / 4;
            arm.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
            group.add(arm);

            const arm2 = new THREE.Mesh(
              new THREE.CylinderGeometry(0.40, 0.40, 2.8, 14),
              new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
            );
            arm2.position.set(0, cellBY + yOffset, 0);
            arm2.rotation.z = -Math.PI / 4;
            arm2.userData = { partInfo: MEIOSIS_PARTS_INFO.reduction };
            group.add(arm2);

            const cent = new THREE.Mesh(
              new THREE.SphereGeometry(0.5, 12, 12),
              new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.3 })
            );
            cent.position.set(0, cellBY + yOffset, 0);
            group.add(cent);

            [-5.2, 5.2].forEach((px) => {
              const fib = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(px, cellBY, 0),
                new THREE.Vector3(0, cellBY + yOffset, 0)
              ]);
              group.add(new THREE.Line(fib, new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.65, transparent: true })));
            });
          });

        } else {
          // --- KỲ SAU II (76 - 88%): TÂM ĐỘNG TÁCH ĐÔI! NST ĐƠN PHÂN LY VỀ 2 PHÍA
          const u = (t - 0.75) / 0.13; // 0.0 -> 1.0
          const xLeft = -u * 3.5;
          const xRight = u * 3.5;

          // In Cell A:
          [-1.4, 1.4].forEach((yOffset, idx) => {
            const chromColor = idx === 0 ? colorFather : colorMother2;

            // Single V-shaped daughter chromosome going Left
            const leftPts = [
              new THREE.Vector3(xLeft, cellAY + yOffset, 0),
              new THREE.Vector3(xLeft + 1.1, cellAY + yOffset + 0.6, 0)
            ];
            const leftMesh = new THREE.Mesh(
              new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftPts), 8, 0.35, 8, false),
              new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
            );
            group.add(leftMesh);

            // Single V-shaped daughter chromosome going Right
            const rightPts = [
              new THREE.Vector3(xRight, cellAY + yOffset, 0),
              new THREE.Vector3(xRight - 1.1, cellAY + yOffset + 0.6, 0)
            ];
            const rightMesh = new THREE.Mesh(
              new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightPts), 8, 0.35, 8, false),
              new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
            );
            group.add(rightMesh);
          });

          // In Cell B:
          [-1.4, 1.4].forEach((yOffset, idx) => {
            const chromColor = idx === 0 ? colorMother : colorFather2;

            const leftPts = [
              new THREE.Vector3(xLeft, cellBY + yOffset, 0),
              new THREE.Vector3(xLeft + 1.1, cellBY + yOffset + 0.6, 0)
            ];
            const leftMesh = new THREE.Mesh(
              new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftPts), 8, 0.35, 8, false),
              new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
            );
            group.add(leftMesh);

            const rightPts = [
              new THREE.Vector3(xRight, cellBY + yOffset, 0),
              new THREE.Vector3(xRight - 1.1, cellBY + yOffset + 0.6, 0)
            ];
            const rightMesh = new THREE.Mesh(
              new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightPts), 8, 0.35, 8, false),
              new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
            );
            group.add(rightMesh);
          });
        }

      } else {
        // --- KỲ CUỐI II & BỐN GIAO TỬ ĐƠN BỘI n (89 - 100%)
        // 4 distinct gametes organized in a 2x2 grid with unique recombinant colors!
        const gameteConfigs = [
          {
            x: -5.4,
            y: 4.8,
            name: 'Giao tử 1 (n) - Thuần nguồn bố',
            color1: colorFather,
            color2: colorFather2,
            hasRecombinant: false
          },
          {
            x: 5.4,
            y: 4.8,
            name: 'Giao tử 2 (n) - Tái tổ hợp lai (Hoán vị gen)',
            color1: colorFather,
            color2: colorMother2,
            hasRecombinant: true
          },
          {
            x: -5.4,
            y: -4.8,
            name: 'Giao tử 3 (n) - Tái tổ hợp lai (Hoán vị gen)',
            color1: colorMother,
            color2: colorFather2,
            hasRecombinant: true
          },
          {
            x: 5.4,
            y: -4.8,
            name: 'Giao tử 4 (n) - Thuần nguồn mẹ',
            color1: colorMother,
            color2: colorMother2,
            hasRecombinant: false
          }
        ];

        gameteConfigs.forEach((g, idx) => {
          // Gamete cell membrane sphere
          const gCell = new THREE.Mesh(
            new THREE.SphereGeometry(3.8, 24, 24),
            new THREE.MeshStandardMaterial({
              color: g.color1,
              transparent: true,
              opacity: 0.22,
              wireframe: true
            })
          );
          gCell.position.set(g.x, g.y, 0);
          gCell.userData = {
            partInfo: {
              ...MEIOSIS_PARTS_INFO.gametes,
              name: g.name,
              keyFact: `Giao tử đơn bội n = 2 mang tổ hợp alen độc nhất vô nhị (${g.hasRecombinant ? 'Có đoạn trao đổi chéo' : 'Không trao đổi chéo'}).`
            }
          };
          group.add(gCell);

          // Chromosome 1 inside gamete (single chromosome rod)
          const chr1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.36, 0.36, 3.4, 16),
            new THREE.MeshStandardMaterial({ color: g.color1, roughness: 0.3 })
          );
          chr1.position.set(g.x - 0.7, g.y, 0);
          chr1.rotation.z = Math.PI / 6;
          chr1.userData = gCell.userData;
          group.add(chr1);

          // If recombinant, attach a swapped colored tip
          if (g.hasRecombinant) {
            const tip = new THREE.Mesh(
              new THREE.SphereGeometry(0.48, 12, 12),
              new THREE.MeshStandardMaterial({
                color: idx === 1 ? colorMother : colorFather,
                emissive: idx === 1 ? colorMother : colorFather,
                emissiveIntensity: 0.5
              })
            );
            tip.position.set(g.x - 0.7 + 0.8, g.y + 1.2, 0.1);
            group.add(tip);
          }

          // Chromosome 2 inside gamete (shorter single chromosome rod)
          const chr2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.36, 0.36, 2.4, 16),
            new THREE.MeshStandardMaterial({ color: g.color2, roughness: 0.3 })
          );
          chr2.position.set(g.x + 0.7, g.y, 0);
          chr2.rotation.z = -Math.PI / 6;
          chr2.userData = gCell.userData;
          group.add(chr2);

          // Centromere dots
          const cDot1 = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
          cDot1.position.set(g.x - 0.7, g.y, 0);
          group.add(cDot1);

          const cDot2 = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
          cDot2.position.set(g.x + 0.7, g.y, 0);
          group.add(cDot2);
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Phân Bào Giảm Phân 3D (Meiosis)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kéo thanh trượt tiến trình mượt mà để quan sát trọn vẹn 2 lần phân bào: Giảm phân I (tiếp hợp, trao đổi chéo &amp; giảm nhiễm) ➔ Giảm phân II (tạo 4 giao tử n)
          </p>
        </div>

        {/* Action Buttons: Compare Mitosis & Meiosis + Quick Division Select */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-pink-500/10 to-purple-500/10 hover:from-sky-500/20 hover:to-pink-500/20 border border-pink-300/80 text-pink-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="Mở bảng so sánh chuyên sâu Nguyên phân vs Giảm phân"
          >
            <Scale className="h-4 w-4 text-pink-600" />
            <span>So sánh với Nguyên phân</span>
          </button>
        </div>
      </div>

      {/* Phase Jump Shortcuts */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
          Chuyển nhanh kỳ:
        </span>
        {[
          { label: 'Kỳ đầu I (8%)', pct: 8, group: 'GPI' },
          { label: 'Kỳ giữa I (22%)', pct: 22, group: 'GPI' },
          { label: 'Kỳ sau I (36%)', pct: 36, group: 'GPI' },
          { label: 'Kỳ cuối I (47%)', pct: 47, group: 'GPI' },
          { label: 'Kỳ đầu II (56%)', pct: 56, group: 'GPII' },
          { label: 'Kỳ giữa II (69%)', pct: 69, group: 'GPII' },
          { label: 'Kỳ sau II (82%)', pct: 82, group: 'GPII' },
          { label: '4 Giao tử n (95%)', pct: 95, group: 'GPII' }
        ].map((item) => {
          const isCurrent = Math.abs(progress - item.pct) <= 7;
          return (
            <button
              key={item.pct}
              onClick={() => {
                setProgress(item.pct);
                setInspectedDetail(null);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isCurrent
                  ? 'bg-pink-600 text-white border-pink-500 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Process Timeline Scrubber */}
      <ProcessTimelineScrubber
        progress={progress}
        onChange={(val) => {
          setProgress(val);
          setInspectedDetail(null);
        }}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        speed={speed}
        onChangeSpeed={setSpeed}
        stages={MEIOSIS_TIMELINE_STAGES}
        currentEventLabel={getMeiosisEventLabel(progress)}
        accentColor="rose"
        title="Tiến trình giảm phân (Meiosis I & II)"
      />

      {/* Real-time Biological Chromosome HUD Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs">
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-pink-400 font-mono block">Giai đoạn:</span>
          <strong className="text-white text-[12px] block truncate">
            {progress <= 50 ? 'Giảm phân I' : 'Giảm phân II'}
          </strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-sky-400 font-mono block">Số NST:</span>
          <strong className="text-white text-[12px] block truncate">
            {currentPhaseInfo.stats.totalN}
          </strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-amber-400 font-mono block">Trạng thái NST:</span>
          <strong className="text-amber-300 text-[12px] block truncate">
            {currentPhaseInfo.stats.state}
          </strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-purple-400 font-mono block">Chromatid:</span>
          <strong className="text-purple-300 text-[12px] block">
            {currentPhaseInfo.stats.chromatids} sợi
          </strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-emerald-400 font-mono block">Tâm động:</span>
          <strong className="text-emerald-300 text-[12px] block">
            {currentPhaseInfo.stats.centromeres} điểm
          </strong>
        </div>
      </div>

      {/* Main 3D Viewport & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Canvas */}
        <div className={`${inspectedDetail ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-8'} space-y-3 transition-all duration-300`}>
          <div
            className={`relative rounded-3xl border border-slate-300/80 overflow-hidden shadow-xl h-[480px] sm:h-[530px] transition-colors ${
              viewportTheme === 'deep'
                ? 'bg-[#070c18]'
                : 'bg-gradient-to-b from-pink-50/70 via-white to-purple-100/40'
            }`}
          >
            {/* Scientific HUD Overlay */}
            <div
              className={`absolute top-3 left-3 z-10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1 shadow-md pointer-events-none max-w-xs ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/80 border border-slate-800 text-slate-300'
                  : 'bg-white/85 border border-pink-100 text-slate-700'
              }`}
            >
              <div className="text-pink-400 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> GIẢM PHÂN 3D
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Kỳ hiện tại:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>
                  {currentPhaseInfo.nameVi}
                </strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Sắp xếp:</span>{' '}
                <strong className="text-amber-400">{currentPhaseInfo.stats.arrangement}</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-pink-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                <span>Nhấp chuột vào điểm bắt chéo vàng, NST hoặc tế bào giao tử để <strong>xem chi tiết</strong></span>
              </div>
            ) : null}

            {/* Floating hover pill */}
            <ModelHoverPill hoveredPart={hoveredDetail} />

            {/* Three.js Canvas Container */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

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
                    autoRotate ? 'bg-pink-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewportTheme(t => (t === 'deep' ? 'lab' : 'deep'))}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition-colors"
                >
                  {viewportTheme === 'deep' ? '☀️ Phông Sáng' : '🌌 Phông Tối'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Component Selection Buttons */}
          <ModelPartsChipsList
            parts={allPartsList}
            selectedId={inspectedDetail?.id || null}
            onSelect={handleSelectDetail}
          />
        </div>

        {/* Right Column: Side-by-side Inspection Panel */}
        <div className={`${inspectedDetail ? 'lg:col-span-5 xl:col-span-5' : 'lg:col-span-4'} space-y-4 transition-all duration-300`}>
          {inspectedDetail ? (
            <ModelDetailCard
              detail={inspectedDetail}
              onClose={() => setInspectedDetail(null)}
              onResumeRotation={handleResumeRotation}
              onSelectDetail={handleSelectDetail}
              allParts={allPartsList}
            />
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-400 shadow-sm" />
                  <h3 className="text-base font-bold text-white">
                    {currentPhaseInfo.nameVi}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {progress <= 50 ? 'LẦN PHÂN BÀO I' : 'LẦN PHÂN BÀO II'}
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-pink-400 uppercase tracking-wider block font-mono">
                    Diễn biến sự kiện chính
                  </span>
                  <p className="leading-relaxed">{currentPhaseInfo.events}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Trạng thái nhiễm sắc thể
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{currentPhaseInfo.chromosomesState}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-mono">
                    Ý nghĩa sinh học
                  </span>
                  <p className="leading-relaxed">{currentPhaseInfo.significance}</p>
                </div>

                <div className="p-3 rounded-xl bg-pink-950/40 border border-pink-800/60 text-pink-200">
                  <span className="font-bold block mb-1">Mẹo học tập:</span>
                  Nhấp vào nút <strong className="text-white">"So sánh với Nguyên phân"</strong> ở góc trên để tra cứu nhanh bảng số liệu NST trong đề thi trắc nghiệm.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mitosis vs Meiosis Comparison Modal */}
      <MitosisMeiosisComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        initialTopic="meiosis"
      />
    </div>
  );
};

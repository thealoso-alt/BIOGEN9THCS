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
  Compass,
  Info
} from 'lucide-react';
import {
  ModelSubpartDetail,
  ModelDetailCard,
  ModelHoverPill,
  ModelPartsChipsList,
  playToneEffect,
  createNuSprite,
  NU_COLORS,
  ProcessTimelineScrubber,
  TimelineStageMarker
} from './ModelInspectionHUD';

interface StageDetail {
  step: number;
  title: string;
  enzymes: string;
  principles: string;
  mechanism: string;
  notes: string;
}

const STAGES: Record<1 | 2 | 3, StageDetail> = {
  1: {
    step: 1,
    title: 'Giai Đoạn 1: Khởi Đầu & Tháo Xoắn Phân Tử DNA',
    enzymes: 'Enzyme Helicase & Topoisomerase (Gyrase), Protein SSB',
    principles: 'Bẻ gãy liên kết hydrogen giữa 2 mạch polynucleotide',
    mechanism: 'Helicase di chuyển dọc theo phân tử DNA, bẻ gãy các liên kết hydrogen giữa các cặp base bổ sung, tách 2 mạch đơn tạo thành chạc tái bản hình chữ Y. Topoisomerase giảm sức căng xoắn vặn phía trước chạc ba, protein SSB bám giữ bảo vệ mạch đơn không bị tái liên kết.',
    notes: 'Hai mạch của DNA mẹ có cấu trúc đối song song: mạch trên chạy theo chiều 3\' → 5\', mạch dưới chạy theo chiều 5\' → 3\' (tính theo hướng mở rộng của chạc chữ Y).'
  },
  2: {
    step: 2,
    title: 'Giai Đoạn 2: Kéo Dài & Tổng Hợp Mạch Mới Theo Chiều 5\' → 3\'',
    enzymes: 'Enzyme RNA Primase & DNA Polymerase (DNA Poly III)',
    principles: 'Nguyên tắc Bổ sung: A liên kết T (2 liên kết H), G liên kết C (3 liên kết H)',
    mechanism: 'DNA Polymerase chỉ có thể gắn nucleotide mới vào nhóm 3\'-OH tự do (chiều tổng hợp luôn là 5\' → 3\'). Do đó: Mạch khuôn 3\' → 5\' được tổng hợp liên tục hướng vào chạc tái bản (Mạch dẫn đầu - Leading strand). Mạch khuôn 5\' → 3\' phải tổng hợp ngắt quãng ngược chiều tháo xoắn tạo các đoạn Okazaki (Mạch theo sau - Lagging strand), mỗi đoạn bắt đầu bằng một đoạn mồi RNA do Primase tổng hợp.',
    notes: 'Đoạn mồi RNA mang base Uracil (U) và đường Ribose (C₅H₁₀O₅), cung cấp đầu 3\'-OH cho DNA Poly III.'
  },
  3: {
    step: 3,
    title: 'Giai Đoạn 3: Hoàn Thiện, Nối Ligase & Bán Bảo Tồn',
    enzymes: 'DNA Polymerase I (loại mồi) & DNA Ligase (tạo liên kết phosphodiester)',
    principles: 'Nguyên tắc Bán bảo tồn (Semi-conservative): Giữ lại 1 mạch cũ của DNA mẹ',
    mechanism: 'Các đoạn mồi RNA bị loại bỏ và thay thế bằng deoxyribonucleotide. Enzyme DNA Ligase xúc tác hình thành liên kết phosphodiester hàn gắn các đoạn Okazaki lại thành mạch liên tục. Kết quả tạo ra 2 phân tử DNA con hoàn toàn giống nhau và giống phân tử DNA mẹ ban đầu, mỗi phân tử chứa đúng 1 mạch cũ của mẹ và 1 mạch mới tổng hợp.',
    notes: 'Đảm bảo thông tin di truyền được truyền đạt chính xác tuyệt đối qua các thế hệ tế bào.'
  }
};

const REPLICATION_TIMELINE_STAGES: TimelineStageMarker[] = [
  {
    id: 1,
    label: 'GĐ 1: Khởi Đầu & Tháo Xoắn',
    shortLabel: 'GĐ 1: Tháo xoắn (0%)',
    range: [0, 33],
    desc: 'Helicase bẻ gãy liên kết H mở chạc chữ Y; Topoisomerase giảm sức căng; SSB ổn định mạch đơn.'
  },
  {
    id: 2,
    label: 'GĐ 2: Kéo Dài Mạch Mới (5\'→3\')',
    shortLabel: 'GĐ 2: Kéo dài (34%)',
    range: [34, 74],
    desc: 'Primase đặt mồi RNA; DNA Poly tổng hợp liên tục mạch dẫn đầu và ngắt quãng đoạn Okazaki mạch theo sau.'
  },
  {
    id: 3,
    label: 'GĐ 3: Nối Ligase & Bán Bảo Tồn',
    shortLabel: 'GĐ 3: Bán bảo tồn (75%)',
    range: [75, 100],
    desc: 'DNA Ligase hàn gắn đoạn Okazaki; hình thành 2 chuỗi xoắn kép DNA con bán bảo tồn hoàn chỉnh.'
  }
];

const getReplicationEventLabel = (pct: number) => {
  if (pct < 12) return 'Khởi đầu: Topoisomerase giảm sức căng; Helicase nhận biết điểm ori tiếp cận chuỗi xoắn kép mẹ.';
  if (pct < 28) return 'Tháo xoắn: Helicase bẻ gãy liên kết H, mở chạc chữ Y; protein SSB bám giữ chống tái liên kết.';
  if (pct < 45) return 'Mồi & Kéo dài: Primase tổng hợp mồi RNA; DNA Polymerase lắp nu liên tục trên mạch 3\'→5\' (Leading).';
  if (pct < 65) return 'Mạch theo sau: DNA Polymerase tổng hợp ngắt quãng các đoạn Okazaki ngược chiều tháo xoắn (Lagging).';
  if (pct < 80) return 'Thay thế mồi: Các đoạn mồi RNA được loại bỏ và thay thế bằng deoxyribonucleotide chuẩn.';
  if (pct < 95) return 'Hàn gắn Ligase: DNA Ligase xúc tác tạo liên kết phosphodiester nối liền các đoạn Okazaki.';
  return 'Hoàn thành nhân đôi: Tạo 2 phân tử DNA con giống hệt mẹ theo nguyên tắc bán bảo tồn & bổ sung!';
};

const REPLICATION_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  helicase: {
    id: 'helicase',
    name: 'Enzyme Tháo Xoắn Helicase',
    nameEn: 'DNA Helicase Enzyme',
    category: 'Enzyme tháo xoắn',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Phức hợp protein dạng nhẫn gồm 6 tiểu đơn vị (hexamer) bao bọc lấy mạch DNA đơn tại chạc ba nhân đôi.',
    functionRole: 'Sử dụng năng lượng từ thủy phân ATP để bẻ gãy liên kết hydrogen giữa 2 mạch polynucleotide, tách đôi chuỗi xoắn kép tạo chạc ba tái bản hình chữ Y.',
    keyFact: 'Tốc độ tháo xoắn rất cao (hàng nghìn cặp bazơ mỗi phút), di chuyển theo chiều tháo xoắn về phía chuỗi xoắn kép chưa mở.',
    colorHex: '#eab308'
  },
  topoisomerase: {
    id: 'topoisomerase',
    name: 'Enzyme Topoisomerase (Gyrase)',
    nameEn: 'DNA Topoisomerase / Gyrase',
    category: 'Enzyme giải tỏa sức căng',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Enzyme dạng vòng hoạt động ở vùng chuỗi xoắn kép nằm phía trước chạc ba tái bản.',
    functionRole: 'Cắt tạm thời một hoặc hai mạch DNA rồi nối lại, giải tỏa ứng suất siêu xoắn (torsional strain) do quá trình tháo xoắn của Helicase gây ra.',
    keyFact: 'Nếu không có Topoisomerase, chuỗi xoắn kép sẽ bị xoắn vặn quá mức dẫn đến đứt gãy hoặc làm dừng quá trình tái bản.',
    colorHex: '#06b6d4'
  },
  ssb_protein: {
    id: 'ssb_protein',
    name: 'Protein Bám Mạch Đơn (SSB)',
    nameEn: 'Single-Strand Binding Proteins',
    category: 'Protein bảo vệ & ổn định',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Các phân tử protein tetramer nhỏ bám đều đặn dọc theo các đoạn mạch đơn vừa được Helicase tách ra.',
    functionRole: 'Ngăn 2 mạch đơn tái bắt cặp (hồi tính) trở lại và bảo vệ mạch đơn không bị các enzyme nuclease trong tế bào phân giải.',
    keyFact: 'SSB bị đẩy ra tuần tự khi phức hệ DNA Polymerase tiến hành tổng hợp mạch bổ sung.',
    colorHex: '#a855f7'
  },
  primase: {
    id: 'primase',
    name: 'Enzyme RNA Primase & Đoạn Mồi RNA',
    nameEn: 'RNA Primase & RNA Primer',
    category: 'Enzyme tạo mồi',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Phức hợp RNA polymerase đặc hiệu tổng hợp một đoạn ngắn RNA (~10 ribonucleotide có gốc đường Ribose C₅H₁₀O₅ và base Uracil U).',
    functionRole: 'Cung cấp nhóm 3\'-OH tự do cho DNA Polymerase bắt đầu kéo dài chuỗi, vì DNA Polymerase không thể tự khởi đầu tổng hợp từ đầu.',
    keyFact: 'Mạch dẫn đầu chỉ cần 1 đoạn mồi duy nhất; mạch theo sau cần nhiều đoạn mồi riêng cho từng đoạn Okazaki.',
    colorHex: '#f97316'
  },
  dna_poly: {
    id: 'dna_poly',
    name: 'Enzyme DNA Polymerase III & Kẹp Trượt β',
    nameEn: 'DNA Polymerase III & Sliding Clamp',
    category: 'Enzyme kéo dài mạch mới',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Cấu trúc không gian dạng "bàn tay phải" gồm 3 miền (ngón tay, lòng bàn tay, ngón cái) gắn kèm vòng kẹp trượt β bao quanh DNA.',
    functionRole: 'Xúc tác gắn các nucleotide tự do (dATP, dTTP, dGTP, dCTP) từ môi trường vào đầu 3\'-OH của mạch mới theo nguyên tắc bổ sung (A-T, G-C).',
    keyFact: 'CHỈ tổng hợp theo một chiều duy nhất 5\' → 3\' và có chức năng tự đọc soát sửa sai (proofreading 3\'→5\' exonuclease) với độ chính xác cực cao.',
    colorHex: '#10b981'
  },
  leading_strand: {
    id: 'leading_strand',
    name: 'Mạch Dẫn Đầu (Leading Strand - 5\' → 3\')',
    nameEn: 'Leading Strand (Continuous)',
    category: 'Mạch mới tổng hợp liên tục',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Mạch DNA mới được tổng hợp dựa trên mạch khuôn có chiều 3\' → 5\' (tính theo hướng mở rộng của chạc tái bản).',
    functionRole: 'DNA Polymerase tổng hợp liên tục theo chiều 5\' → 3\' cùng chiều với hướng mở xoắn của chạc ba tái bản.',
    keyFact: 'Chỉ cần một đoạn mồi RNA duy nhất ở điểm xuất phát ban đầu để kéo dài đến hết toàn bộ phân tử.',
    colorHex: '#38bdf8'
  },
  lagging_strand: {
    id: 'lagging_strand',
    name: 'Mạch Theo Sau & Đoạn Okazaki (Lagging Strand)',
    nameEn: 'Lagging Strand & Okazaki Fragments',
    category: 'Mạch mới tổng hợp ngắt quãng',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Gồm các đoạn ngắn Okazaki (dài 100 - 200 nu ở sinh vật nhân thực, 1000 - 2000 nu ở vi khuẩn) tổng hợp trên mạch khuôn 5\' → 3\'.',
    functionRole: 'Tổng hợp ngắt quãng theo chiều 5\' → 3\' hướng ra xa chạc ba tái bản, giải quyết nghịch lý chiều tổng hợp của enzyme polymerase.',
    keyFact: 'Mỗi đoạn Okazaki cần một đoạn mồi RNA riêng, sau đó các đoạn mồi bị cắt bỏ và nối lại bởi enzyme DNA Ligase.',
    colorHex: '#ec4899'
  },
  ligase: {
    id: 'ligase',
    name: 'Enzyme Hàn Gắn DNA Ligase',
    nameEn: 'DNA Ligase Enzyme',
    category: 'Enzyme hàn gắn liên kết',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Enzyme đặc hiệu nhận diện các điểm đứt gãy đơn (nick) trên khung đường - phosphate của phân tử DNA.',
    functionRole: 'Xúc tác tạo liên kết cộng hóa trị phosphodiester giữa nhóm 3\'-OH và 5\'-phosphate của 2 đoạn nucleotide liền kề, hàn kín mạch.',
    keyFact: 'Tiêu thụ năng lượng ATP (hoặc NAD+ ở vi khuẩn) để hoàn thiện phân tử DNA con thành một chuỗi liên tục bền vững.',
    colorHex: '#8b5cf6'
  },
  parent_stem: {
    id: 'parent_stem',
    name: 'Mạch Khuôn DNA Mẹ (Đối Song Song 3\'→5\' & 5\'→3\')',
    nameEn: 'Parent Template DNA Strands',
    category: 'Mạch khuôn gốc',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Chuỗi xoắn kép ban đầu gồm 2 mạch polynucleotide đối song song mang toàn bộ mã thông tin di truyền gốc.',
    functionRole: 'Cung cấp trình tự các base làm khuôn mẫu chính xác để lắp ráp các nucleotide tự do thành 2 mạch mới.',
    keyFact: 'Cấu tạo từ các nucleotide mang đường Deoxyribose (C₅H₁₀O₄), liên kết với nhau qua liên kết phosphodiester.',
    colorHex: '#0284c7'
  },
  semi_conservative: {
    id: 'semi_conservative',
    name: 'Nguyên Tắc Bán Bảo Tồn (Semi-conservative)',
    nameEn: 'Semi-conservative Replication Principle',
    category: 'Quy luật di truyền cốt lõi',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Hai phân tử DNA con tạo thành hoàn toàn giống nhau và giống phân tử DNA mẹ ban đầu.',
    functionRole: 'Mỗi phân tử con chứa đúng 1 mạch cũ của DNA mẹ ban đầu và 1 mạch mới được tổng hợp từ nguyên liệu nội bào.',
    keyFact: 'Được chứng minh bởi thí nghiệm kinh điển Meselson - Stahl (1958) sử dụng đồng vị phóng xạ nitơ phân tử ¹⁵N và ¹⁴N.',
    colorHex: '#10b981'
  }
};

/**
 * Creates a crisp Canvas Text Badge Sprite for 3D annotations (5', 3', labels)
 */
function createBadgeSprite(
  text: string,
  bgColor = '#0284c7',
  textColor = '#ffffff',
  width = 160,
  height = 56
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, width, height);

    // Rounded rectangle pill
    const radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();

    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = 'bold 24px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
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
  sprite.scale.set((width / height) * 1.35, 1.35, 1);
  return sprite;
}

export const ReplicationModel: React.FC = () => {
  const [progress, setProgress] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewportTheme, setViewportTheme] = useState<'deep' | 'lab'>('deep');
  const [inspectedDetail, setInspectedDetail] = useState<ModelSubpartDetail | null>(null);
  const [hoveredDetail, setHoveredDetail] = useState<ModelSubpartDetail | null>(null);

  const activeStage: 1 | 2 | 3 = progress < 34 ? 1 : progress < 75 ? 2 : 3;

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

  // Continuous auto-simulation animation loop
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setProgress(prev => {
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
    playToneEffect(540);
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
    cameraRef.current.position.z = Math.max(12, Math.min(68, cameraRef.current.position.z * factor));
  };

  const allPartsList = Object.values(REPLICATION_PARTS_INFO);

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

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.25);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 0.95);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.1, 60);
    pointLight.position.set(0, 0, 18);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildReplication3DScene(progress, mainGroup);

    // Raycaster for 3D interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = { x: 0, y: 0, time: 0 };

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotateRef.current && modelGroupRef.current && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.005;
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
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Rebuild 3D scene when progress scrubbing changes
  useEffect(() => {
    if (modelGroupRef.current) {
      buildReplication3DScene(progress, modelGroupRef.current);
    }
  }, [progress]);

  /**
   * Constructs the 3D DNA Replication Model with 100% biological accuracy:
   * - Unopened Parent Double Helix ahead of fork (x > forkX).
   * - Helicase moving in +x direction, unzipping hydrogen bonds.
   * - Topoisomerase relieving supercoiling ahead of Helicase.
   * - Top parent strand: template 3' (x = -14) → 5' (at forkX).
   * - Leading daughter strand: synthesized 5' → 3' continuously towards forkX.
   * - Bottom parent strand: template 5' (x = -14) → 3' (at forkX).
   * - Lagging daughter strand: synthesized 5' → 3' in Okazaki fragments away from forkX.
   * - DNA Ligase sealing the phosphodiester nicks.
   * - Semi-conservative formation of 2 daughter double helices at completion.
   */
  const buildReplication3DScene = (pct: number, group: THREE.Group) => {
    group.clear();

    const t = Math.max(0, Math.min(100, pct)) / 100; // 0.0 -> 1.0
    // Fork travels from -6 (early stage) to +8 (completed)
    const forkX = -6 + t * 14;

    const parentSequence = [
      { top: 'A', bot: 'T', hBonds: 2 },
      { top: 'T', bot: 'A', hBonds: 2 },
      { top: 'G', bot: 'C', hBonds: 3 },
      { top: 'C', bot: 'G', hBonds: 3 },
      { top: 'A', bot: 'T', hBonds: 2 },
      { top: 'G', bot: 'C', hBonds: 3 },
      { top: 'T', bot: 'A', hBonds: 2 },
      { top: 'C', bot: 'G', hBonds: 3 },
      { top: 'A', bot: 'T', hBonds: 2 },
      { top: 'T', bot: 'A', hBonds: 2 },
      { top: 'G', bot: 'C', hBonds: 3 },
      { top: 'C', bot: 'G', hBonds: 3 },
      { top: 'A', bot: 'T', hBonds: 2 },
      { top: 'T', bot: 'A', hBonds: 2 },
    ];

    // =========================================================================
    // 1. UNOPENED PARENT DOUBLE HELIX AHEAD OF FORK (x from forkX to +16)
    // =========================================================================
    const aheadPts1: THREE.Vector3[] = [];
    const aheadPts2: THREE.Vector3[] = [];
    const aheadStartX = forkX + 0.8;
    const aheadEndX = 16;
    const aheadSteps = Math.max(2, Math.floor((aheadEndX - aheadStartX) / 0.55));

    for (let i = 0; i <= aheadSteps; i++) {
      const x = aheadStartX + i * 0.55;
      const angle = i * 0.65 + t * 2;
      const y1 = Math.sin(angle) * 1.7;
      const z1 = Math.cos(angle) * 1.7;
      const y2 = Math.sin(angle + Math.PI) * 1.7;
      const z2 = Math.cos(angle + Math.PI) * 1.7;

      aheadPts1.push(new THREE.Vector3(x, y1, z1));
      aheadPts2.push(new THREE.Vector3(x, y2, z2));

      // Intact complementary base pairs with hydrogen bonds ahead of fork
      if (i % 2 === 0 && x > forkX + 1.2 && x < aheadEndX - 0.5) {
        const pair = parentSequence[i % parentSequence.length];

        const topSprite = createNuSprite(pair.top, { size: 1.0, depthTest: false });
        topSprite.position.set(x, y1 * 0.65, z1 * 0.65);
        topSprite.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
        group.add(topSprite);

        const botSprite = createNuSprite(pair.bot, { size: 1.0, depthTest: false });
        botSprite.position.set(x, y2 * 0.65, z2 * 0.65);
        botSprite.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
        group.add(botSprite);

        // Dashed Hydrogen Bond line (2 bonds = yellow, 3 bonds = green)
        const hLineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y1 * 0.45, z1 * 0.45),
          new THREE.Vector3(x, y2 * 0.45, z2 * 0.45)
        ]);
        const hLineMat = new THREE.LineDashedMaterial({
          color: pair.hBonds === 3 ? 0x10b981 : 0xfacc15,
          dashSize: 0.16,
          gapSize: 0.08
        });
        const hLine = new THREE.Line(hLineGeo, hLineMat);
        hLine.computeLineDistances();
        group.add(hLine);
      }
    }

    if (aheadPts1.length >= 2) {
      const aheadCurve1 = new THREE.CatmullRomCurve3(aheadPts1);
      const aheadCurve2 = new THREE.CatmullRomCurve3(aheadPts2);

      const stemMesh1 = new THREE.Mesh(
        new THREE.TubeGeometry(aheadCurve1, Math.max(8, aheadPts1.length * 2), 0.26, 12, false),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
      );
      const stemMesh2 = new THREE.Mesh(
        new THREE.TubeGeometry(aheadCurve2, Math.max(8, aheadPts2.length * 2), 0.26, 12, false),
        new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3 })
      );
      stemMesh1.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
      stemMesh2.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
      group.add(stemMesh1);
      group.add(stemMesh2);

      // 5' and 3' badges at the end of unopened parent double helix
      if (t < 0.95) {
        const endBadgeTop = createBadgeSprite('5\'', '#0284c7', '#ffffff', 90, 48);
        endBadgeTop.position.set(aheadEndX + 0.8, 1.4, 0);
        group.add(endBadgeTop);

        const endBadgeBot = createBadgeSprite('3\'', '#0369a1', '#ffffff', 90, 48);
        endBadgeBot.position.set(aheadEndX + 0.8, -1.4, 0);
        group.add(endBadgeBot);
      }
    }

    // =========================================================================
    // 2. HELICASE & TOPOISOMERASE ENZYMES
    // =========================================================================
    // Topoisomerase (Gyrase) positioned ahead of Helicase relieving supercoiling
    const gyraseMesh = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.45, 16, 28),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.25,
        metalness: 0.45,
        emissive: 0x0891b2,
        emissiveIntensity: 0.2
      })
    );
    gyraseMesh.position.set(Math.min(15, forkX + 3.2), 0, 0);
    gyraseMesh.rotation.y = Math.PI / 2;
    gyraseMesh.userData = { partInfo: REPLICATION_PARTS_INFO.topoisomerase };
    group.add(gyraseMesh);

    // Helicase Hexameric Ring at the exact fork point
    const helicaseGroup = new THREE.Group();
    helicaseGroup.position.set(forkX, 0, 0);

    const helicaseTorus = new THREE.Mesh(
      new THREE.TorusGeometry(2.3, 0.7, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0xeab308,
        roughness: 0.25,
        metalness: 0.5,
        emissive: 0xca8a04,
        emissiveIntensity: 0.3
      })
    );
    helicaseTorus.rotation.y = Math.PI / 2;
    helicaseTorus.rotation.z = t * Math.PI * 8; // spins with progress
    helicaseTorus.userData = { partInfo: REPLICATION_PARTS_INFO.helicase };
    helicaseGroup.add(helicaseTorus);

    // 6 Subunit lobes of the hexamer
    for (let h = 0; h < 6; h++) {
      const subAngle = (h * Math.PI) / 3 + t * Math.PI * 8;
      const lobe = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
      );
      lobe.position.set(0, Math.sin(subAngle) * 2.3, Math.cos(subAngle) * 2.3);
      lobe.userData = { partInfo: REPLICATION_PARTS_INFO.helicase };
      helicaseGroup.add(lobe);
    }
    group.add(helicaseGroup);

    // Badge for Helicase
    const heliBadge = createBadgeSprite('Helicase (Tháo xoắn)', '#ca8a04', '#ffffff', 220, 52);
    heliBadge.position.set(forkX, 3.8, 0);
    group.add(heliBadge);

    // =========================================================================
    // 3. SSB PROTEINS (Single-Strand Binding Proteins) NEAR FORK
    // =========================================================================
    [-1, 1].forEach((dir) => {
      for (let s = 1; s <= 2; s++) {
        const ssb = new THREE.Mesh(
          new THREE.SphereGeometry(0.44, 12, 12),
          new THREE.MeshStandardMaterial({
            color: 0xa855f7,
            roughness: 0.25,
            emissive: 0x7e22ce,
            emissiveIntensity: 0.25
          })
        );
        ssb.position.set(forkX - s * 1.4, dir * (1.3 + s * 0.9), dir * 0.3);
        ssb.userData = { partInfo: REPLICATION_PARTS_INFO.ssb_protein };
        group.add(ssb);
      }
    });

    // =========================================================================
    // 4. TOP BRANCH: LEADING STRAND (Mạch Dẫn Đầu)
    //    Parent template: 3' (at x = -14) ──> 5' (at forkX)
    //    New leading daughter: 5' (at x = -14) ──> 3' (heading towards forkX)
    // =========================================================================
    const topStartX = -14;
    const topTemplatePts = [
      new THREE.Vector3(topStartX, 4.5, 0),
      new THREE.Vector3(topStartX + (forkX - topStartX) * 0.4, 4.2, 0.4),
      new THREE.Vector3(topStartX + (forkX - topStartX) * 0.8, 2.5, 0.2),
      new THREE.Vector3(forkX, 0.8, 0)
    ];
    const topCurve = new THREE.CatmullRomCurve3(topTemplatePts);
    const topTemplateMesh = new THREE.Mesh(
      new THREE.TubeGeometry(topCurve, 32, 0.28, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    topTemplateMesh.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
    group.add(topTemplateMesh);

    // 3' Badge on parent top template
    const badgeTop3 = createBadgeSprite('3\' [Khuôn Mẹ]', '#0284c7', '#ffffff', 160, 48);
    badgeTop3.position.set(topStartX - 1.2, 5.5, 0);
    group.add(badgeTop3);

    // Bases along top template strand
    const topBases = ['T', 'A', 'C', 'G', 'T', 'A', 'C', 'G', 'T', 'A', 'C'];
    topBases.forEach((b, idx) => {
      const u = (idx + 0.5) / topBases.length;
      const pt = topCurve.getPoint(u);
      const sprite = createNuSprite(b, { size: 1.0, depthTest: false });
      sprite.position.set(pt.x, pt.y + 0.55, pt.z);
      sprite.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
      group.add(sprite);
    });

    // Continuous leading strand daughter synthesis (extends from left towards forkX)
    const leadingSynthesisRatio = Math.max(0.08, Math.min(0.96, t * 1.1));
    const leadingDaughterPts: THREE.Vector3[] = [];
    const leadSteps = Math.max(4, Math.floor(leadingSynthesisRatio * 24));

    for (let k = 0; k <= leadSteps; k++) {
      const u = (k / 24) * leadingSynthesisRatio;
      const pt = topCurve.getPoint(u);
      leadingDaughterPts.push(new THREE.Vector3(pt.x, pt.y - 0.8, pt.z + 0.2));
    }

    if (leadingDaughterPts.length >= 2) {
      const leadingDaughterCurve = new THREE.CatmullRomCurve3(leadingDaughterPts);
      const leadingDaughterMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leadingDaughterCurve, Math.max(8, leadSteps * 2), 0.26, 12, false),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.2,
          metalness: 0.5,
          emissive: 0x0284c7,
          emissiveIntensity: 0.25
        })
      );
      leadingDaughterMesh.userData = { partInfo: REPLICATION_PARTS_INFO.leading_strand };
      group.add(leadingDaughterMesh);

      // 5' Badge on newly synthesized leading strand
      const badgeLead5 = createBadgeSprite('5\' [Mạch Mới Dẫn Đầu]', '#059669', '#ffffff', 220, 48);
      badgeLead5.position.set(topStartX - 1.2, 3.2, 0);
      group.add(badgeLead5);

      // Complementary nucleotides matching template (A matches T, T matches A...)
      const compLeading = ['A', 'T', 'G', 'C', 'A', 'T', 'G', 'C', 'A', 'T', 'G'];
      compLeading.forEach((b, idx) => {
        const u = (idx + 0.5) / topBases.length;
        if (u <= leadingSynthesisRatio) {
          const pt = leadingDaughterCurve.getPoint(Math.min(1, u / leadingSynthesisRatio));
          const sprite = createNuSprite(b, {
            size: 1.0,
            depthTest: false,
            borderColor: '#38bdf8'
          });
          sprite.position.set(pt.x, pt.y - 0.4, pt.z);
          sprite.userData = { partInfo: REPLICATION_PARTS_INFO.leading_strand };
          group.add(sprite);

          // Formed Hydrogen Bonds between template & leading daughter
          const tPt = topCurve.getPoint(u);
          const hLineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(tPt.x, tPt.y + 0.1, tPt.z),
            new THREE.Vector3(pt.x, pt.y, pt.z)
          ]);
          const hLineMat = new THREE.LineDashedMaterial({
            color: (b === 'G' || b === 'C') ? 0x10b981 : 0xfacc15,
            dashSize: 0.15,
            gapSize: 0.08
          });
          const hLine = new THREE.Line(hLineGeo, hLineMat);
          hLine.computeLineDistances();
          group.add(hLine);
        }
      });

      // DNA Polymerase III positioned right at the advancing 3'-OH tip of leading strand
      const leadTip = leadingDaughterPts[leadingDaughterPts.length - 1];
      const leadPolyGroup = new THREE.Group();
      leadPolyGroup.position.copy(leadTip);

      const polyCore = new THREE.Mesh(
        new THREE.SphereGeometry(1.35, 20, 20),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.25,
          metalness: 0.45,
          emissive: 0x059669,
          emissiveIntensity: 0.35
        })
      );
      polyCore.userData = { partInfo: REPLICATION_PARTS_INFO.dna_poly };
      leadPolyGroup.add(polyCore);

      // Sliding clamp ring behind polymerase
      const clampRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.24, 12, 24),
        new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3, metalness: 0.3 })
      );
      clampRing.rotation.y = Math.PI / 2;
      clampRing.position.set(-0.8, 0, 0);
      clampRing.userData = { partInfo: REPLICATION_PARTS_INFO.dna_poly };
      leadPolyGroup.add(clampRing);

      group.add(leadPolyGroup);

      // Badge showing active 3'-OH growing direction
      if (t < 0.95) {
        const polyBadge = createBadgeSprite('DNA Poly III (3\'-OH ──>)', '#059669', '#ffffff', 230, 48);
        polyBadge.position.set(leadTip.x, leadTip.y + 2.2, leadTip.z);
        group.add(polyBadge);

        // Incoming free nucleotide floating towards DNA Polymerase active site
        const incomingNu = createNuSprite(compLeading[leadSteps % compLeading.length] || 'A', {
          size: 1.1,
          depthTest: false,
          borderColor: '#10b981'
        });
        incomingNu.position.set(leadTip.x + 1.2, leadTip.y + 1.5, leadTip.z + 0.6);
        incomingNu.userData = { partInfo: REPLICATION_PARTS_INFO.dna_poly };
        group.add(incomingNu);
      }
    }

    // =========================================================================
    // 5. BOTTOM BRANCH: LAGGING STRAND (Mạch Theo Sau & Đoạn Okazaki)
    //    Parent template: 5' (at x = -14) ──> 3' (at forkX)
    //    Discontinuous Okazaki fragments synthesized 5' → 3' AWAY from fork!
    // =========================================================================
    const botStartX = -14;
    const botTemplatePts = [
      new THREE.Vector3(botStartX, -4.5, 0),
      new THREE.Vector3(botStartX + (forkX - botStartX) * 0.4, -4.2, -0.4),
      new THREE.Vector3(botStartX + (forkX - botStartX) * 0.8, -2.5, -0.2),
      new THREE.Vector3(forkX, -0.8, 0)
    ];
    const botCurve = new THREE.CatmullRomCurve3(botTemplatePts);
    const botTemplateMesh = new THREE.Mesh(
      new THREE.TubeGeometry(botCurve, 32, 0.28, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3 })
    );
    botTemplateMesh.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
    group.add(botTemplateMesh);

    // 5' Badge on parent bottom template
    const badgeBot5 = createBadgeSprite('5\' [Khuôn Mẹ]', '#0369a1', '#ffffff', 160, 48);
    badgeBot5.position.set(botStartX - 1.2, -5.5, 0);
    group.add(badgeBot5);

    // Template bases on bottom strand
    const botBases = ['A', 'T', 'G', 'C', 'A', 'T', 'G', 'C', 'A', 'T', 'G'];
    botBases.forEach((b, idx) => {
      const u = (idx + 0.5) / botBases.length;
      const pt = botCurve.getPoint(u);
      const sprite = createNuSprite(b, { size: 1.0, depthTest: false });
      sprite.position.set(pt.x, pt.y - 0.55, pt.z);
      sprite.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
      group.add(sprite);
    });

    // -------------------------------------------------------------------------
    // Discontinuous Okazaki Fragments on Lagging Strand:
    // Fragment 1 (Synthesized early near left end)
    // -------------------------------------------------------------------------
    if (t >= 0.15) {
      const oka1Pts = [
        botCurve.getPoint(0.08),
        botCurve.getPoint(0.22),
        botCurve.getPoint(0.38)
      ].map(p => new THREE.Vector3(p.x, p.y + 0.8, p.z - 0.2));

      const oka1Mesh = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(oka1Pts), 16, 0.26, 12, false),
        new THREE.MeshStandardMaterial({
          color: t >= 0.85 ? 0x38bdf8 : 0xec4899,
          roughness: 0.25,
          metalness: 0.4
        })
      );
      oka1Mesh.userData = { partInfo: REPLICATION_PARTS_INFO.lagging_strand };
      group.add(oka1Mesh);

      // RNA Primer at 5' origin of Okazaki fragment (with Uracil U)
      if (t < 0.80) {
        const primerSprite = createBadgeSprite('5\' [Mồi RNA]', '#f97316', '#ffffff', 140, 44);
        primerSprite.position.set(oka1Pts[0].x, oka1Pts[0].y + 1.2, oka1Pts[0].z);
        group.add(primerSprite);

        const uSprite = createNuSprite('U', { size: 1.0, depthTest: false, borderColor: '#f97316' });
        uSprite.position.set(oka1Pts[0].x, oka1Pts[0].y + 0.4, oka1Pts[0].z);
        uSprite.userData = { partInfo: REPLICATION_PARTS_INFO.primase };
        group.add(uSprite);
      }

      ['T', 'A', 'C'].forEach((b, idx) => {
        if (idx > 0 || t >= 0.80) {
          const sprite = createNuSprite(b, { size: 1.0, depthTest: false, borderColor: '#ec4899' });
          sprite.position.set(oka1Pts[idx].x, oka1Pts[idx].y + 0.4, oka1Pts[idx].z);
          sprite.userData = { partInfo: REPLICATION_PARTS_INFO.lagging_strand };
          group.add(sprite);
        }
      });
    }

    // -------------------------------------------------------------------------
    // Fragment 2 (Synthesized as replication fork advanced further)
    // -------------------------------------------------------------------------
    if (t >= 0.42) {
      const oka2Pts = [
        botCurve.getPoint(0.44),
        botCurve.getPoint(0.60),
        botCurve.getPoint(0.76)
      ].map(p => new THREE.Vector3(p.x, p.y + 0.8, p.z - 0.2));

      const oka2Mesh = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(oka2Pts), 16, 0.26, 12, false),
        new THREE.MeshStandardMaterial({
          color: t >= 0.85 ? 0x38bdf8 : 0xec4899,
          roughness: 0.25,
          metalness: 0.4
        })
      );
      oka2Mesh.userData = { partInfo: REPLICATION_PARTS_INFO.lagging_strand };
      group.add(oka2Mesh);

      // Badge for Okazaki fragment
      const okaBadge = createBadgeSprite('<── 5\' [Đoạn Okazaki 2]', '#ec4899', '#ffffff', 210, 46);
      okaBadge.position.set(oka2Pts[1].x, oka2Pts[1].y + 1.2, oka2Pts[1].z);
      group.add(okaBadge);

      // RNA primer on Fragment 2
      if (t < 0.80) {
        const uSprite2 = createNuSprite('U', { size: 1.0, depthTest: false, borderColor: '#f97316' });
        uSprite2.position.set(oka2Pts[0].x, oka2Pts[0].y + 0.4, oka2Pts[0].z);
        uSprite2.userData = { partInfo: REPLICATION_PARTS_INFO.primase };
        group.add(uSprite2);
      }

      ['G', 'T', 'A'].forEach((b, idx) => {
        if (idx > 0 || t >= 0.80) {
          const sprite = createNuSprite(b, { size: 1.0, depthTest: false, borderColor: '#ec4899' });
          sprite.position.set(oka2Pts[idx].x, oka2Pts[idx].y + 0.4, oka2Pts[idx].z);
          sprite.userData = { partInfo: REPLICATION_PARTS_INFO.lagging_strand };
          group.add(sprite);
        }
      });

      // DNA Polymerase actively synthesizing on lagging strand
      if (t < 0.80) {
        const lagPoly = new THREE.Mesh(
          new THREE.SphereGeometry(1.25, 18, 18),
          new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.4 })
        );
        lagPoly.position.copy(oka2Pts[1]);
        lagPoly.userData = { partInfo: REPLICATION_PARTS_INFO.dna_poly };
        group.add(lagPoly);
      }
    }

    // -------------------------------------------------------------------------
    // DNA LIGASE ENZYME: Seals phosphodiester nick between Okazaki fragments
    // -------------------------------------------------------------------------
    if (t >= 0.68) {
      const nickPt = botCurve.getPoint(0.41);
      const ligaseGroup = new THREE.Group();
      ligaseGroup.position.set(nickPt.x, nickPt.y + 0.8, nickPt.z - 0.2);

      const ligaseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 1.8, 16),
        new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          roughness: 0.2,
          metalness: 0.6,
          emissive: 0x7c3aed,
          emissiveIntensity: 0.4
        })
      );
      ligaseMesh.rotation.z = Math.PI / 4;
      ligaseMesh.userData = { partInfo: REPLICATION_PARTS_INFO.ligase };
      ligaseGroup.add(ligaseMesh);

      // Catalytic energy halo of Ligase
      const ligaseHalo = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.4, 16),
        new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide })
      );
      ligaseHalo.rotation.x = Math.PI / 2;
      ligaseHalo.userData = { partInfo: REPLICATION_PARTS_INFO.ligase };
      ligaseGroup.add(ligaseHalo);

      group.add(ligaseGroup);

      const ligaseBadge = createBadgeSprite('DNA Ligase (Hàn nối)', '#8b5cf6', '#ffffff', 200, 48);
      ligaseBadge.position.set(nickPt.x, nickPt.y + 2.5, nickPt.z);
      group.add(ligaseBadge);
    }

    // =========================================================================
    // 6. STAGE 3 CONCLUSION: 2 DAUGHTER DNA HELICES (SEMI-CONSERVATIVE)
    // =========================================================================
    if (t >= 0.85) {
      // Top daughter DNA badge
      const daughterBadgeTop = createBadgeSprite('DNA Con 1 (1 Mạch Mẹ + 1 Mạch Mới)', '#0284c7', '#ffffff', 280, 52);
      daughterBadgeTop.position.set(topStartX + 6, 6.8, 0);
      daughterBadgeTop.userData = { partInfo: REPLICATION_PARTS_INFO.semi_conservative };
      group.add(daughterBadgeTop);

      // Bottom daughter DNA badge
      const daughterBadgeBot = createBadgeSprite('DNA Con 2 (1 Mạch Mẹ + 1 Mạch Mới)', '#ec4899', '#ffffff', 280, 52);
      daughterBadgeBot.position.set(botStartX + 6, -6.8, 0);
      daughterBadgeBot.userData = { partInfo: REPLICATION_PARTS_INFO.semi_conservative };
      group.add(daughterBadgeBot);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Title & Live Stage Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Tái Bản DNA 3D (Chạc Ba Tái Bản Hình Chữ Y)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              CHUẨN KIẾN THỨC SINH HỌC 9
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mô phỏng 3D chính xác về chiều tổng hợp 5&apos; → 3&apos;, mạch dẫn đầu liên tục, đoạn Okazaki mạch theo sau, hoạt động của Helicase, DNA Polymerase III và DNA Ligase theo nguyên tắc bán bảo tồn.
          </p>
        </div>

        {/* Quick Stage Jump Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => { setProgress(15); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStage === 1 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 1: Tháo xoắn (15%)</span>
          </button>
          <button
            onClick={() => { setProgress(50); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStage === 2 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 2: Kéo dài (50%)</span>
          </button>
          <button
            onClick={() => { setProgress(90); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStage === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 3: Bán bảo tồn (90%)</span>
          </button>
        </div>
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
        stages={REPLICATION_TIMELINE_STAGES}
        currentEventLabel={getReplicationEventLabel(progress)}
        accentColor="emerald"
        title="Tiến trình nhân đôi DNA"
      />

      {/* Main 3D Viewport & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Canvas */}
        <div className={`${inspectedDetail ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-8'} space-y-3 transition-all duration-300`}>
          <div
            className={`relative rounded-3xl border border-slate-300/80 overflow-hidden shadow-xl h-[490px] sm:h-[540px] transition-colors ${
              viewportTheme === 'deep'
                ? 'bg-[#060c19]'
                : 'bg-gradient-to-b from-sky-50/70 via-white to-emerald-50/60'
            }`}
          >
            {/* Scientific HUD Overlay */}
            <div
              className={`absolute top-3 left-3 z-10 p-3.5 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1.5 shadow-md pointer-events-none max-w-xs ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/85 border border-slate-800 text-slate-300'
                  : 'bg-white/90 border border-slate-200 text-slate-700'
              }`}
            >
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                <span>THÔNG SỐ TÁI BẢN DNA CHUẨN</span>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Giai đoạn:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>{STAGES[activeStage].title.split(': ')[1]}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Chiều tổng hợp:</span>{' '}
                <strong className="text-emerald-400">LUÔN LUÔN 5&apos; → 3&apos;</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Quy luật:</span>{' '}
                <strong className="text-amber-400">Bổ sung (A-T, G-C) &amp; Bán bảo tồn</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Tiến độ:</span>{' '}
                <strong className="text-sky-400 font-bold">{progress.toFixed(0)}%</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-emerald-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Nhấp chuột vào <strong>Helicase, DNA Poly, Mạch dẫn đầu, Okazaki hoặc Ligase</strong> để xem chi tiết</span>
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
                    autoRotate ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
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
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                  <h3 className="text-base font-bold text-white">
                    {STAGES[activeStage].title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-mono">
                    Enzyme tham gia chính
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{STAGES[activeStage].enzymes}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Quy luật di truyền áp dụng
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{STAGES[activeStage].principles}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-mono">
                    Cơ chế sinh học chi tiết
                  </span>
                  <p className="leading-relaxed">{STAGES[activeStage].mechanism}</p>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-200">
                  <span className="font-bold block mb-1">Điểm lưu ý SGK Sinh học 9:</span>
                  <p className="leading-relaxed text-[11px]">{STAGES[activeStage].notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

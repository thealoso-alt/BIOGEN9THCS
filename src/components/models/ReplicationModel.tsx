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
  Box
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
}

const STAGES: Record<1 | 2 | 3, StageDetail> = {
  1: {
    step: 1,
    title: 'Giai Đoạn 1: Khởi Đầu & Tháo Xoắn',
    enzymes: 'Enzyme tháo xoắn Helicase & Topoisomerase (Gyrase)',
    principles: 'Cắt đứt các liên kết hydrogen giữa 2 mạch đơn',
    mechanism: 'Helicase di chuyển dọc theo phân tử DNA, bẻ gãy các liên kết hydrogen giữa các cặp bazơ bổ sung, tách 2 mạch đơn tạo thành chạc nhân đôi hình chữ Y.'
  },
  2: {
    step: 2,
    title: 'Giai Đoạn 2: Kéo Dài & Tổng Hợp Mạch Mới',
    enzymes: 'Enzyme DNA Polymerase & Primase (tổng hợp đoạn mồi RNA)',
    principles: 'Nguyên tắc Bổ sung: A liên kết T (2 lk H), G liên kết C (3 lk H)',
    mechanism: 'DNA Polymerase chỉ có thể gắn nucleotide mới vào đầu 3\'-OH tự do. Do đó: Mạch khuôn 3\'→5\' được tổng hợp liên tục; Mạch khuôn 5\'→3\' được tổng hợp ngắt quãng thành các đoạn ngắn Okazaki (sau đó được nối lại bởi Ligase).'
  },
  3: {
    step: 3,
    title: 'Giai Đoạn 3: Kết Thúc & Bán Bảo Tồn',
    enzymes: 'Enzyme DNA Ligase (hàn gắn liên kết phosphodiester)',
    principles: 'Nguyên tắc Bán bảo tồn (Semi-conservative): Giữ lại 1 mạch mẹ',
    mechanism: 'Hai phân tử DNA con được tạo thành hoàn toàn giống nhau và giống phân tử DNA mẹ ban đầu. Trong mỗi phân tử con, có một mạch cũ của mẹ và một mạch mới được tổng hợp từ môi trường tế bào.'
  }
};

const REPLICATION_TIMELINE_STAGES: TimelineStageMarker[] = [
  {
    id: 1,
    label: 'GĐ 1: Khởi Đầu & Tháo Xoắn',
    shortLabel: 'GĐ 1: Tháo xoắn (0%)',
    range: [0, 33],
    desc: 'Helicase bẻ gãy liên kết H, mở rộng chạc chữ Y; protein SSB bám ổn định mạch đơn.'
  },
  {
    id: 2,
    label: 'GĐ 2: Kéo Dài Mạch Mới',
    shortLabel: 'GĐ 2: Kéo dài (34%)',
    range: [34, 74],
    desc: 'DNA Polymerase tổng hợp liên tục mạch dẫn đầu & tạo đoạn ngắt quãng Okazaki.'
  },
  {
    id: 3,
    label: 'GĐ 3: Nối Ligase & Bán Bảo Tồn',
    shortLabel: 'GĐ 3: Nối Ligase (75%)',
    range: [75, 100],
    desc: 'DNA Ligase hàn gắn đoạn Okazaki, hoàn tất 2 phân tử DNA con bán bảo tồn.'
  }
];

const getReplicationEventLabel = (pct: number) => {
  if (pct < 12) return 'Helicase nhận biết điểm khởi đầu (ori), tiếp cận chuỗi xoắn kép mẹ.';
  if (pct < 28) return 'Helicase bẻ gãy liên kết H, chạc chữ Y bắt đầu mở; Topoisomerase giảm sức căng vặn.';
  if (pct < 45) return 'Primase tổng hợp đoạn mồi RNA; DNA Polymerase bám đầu 3\'-OH tự do.';
  if (pct < 65) return 'DNA Polymerase xúc tác lắp Nu liên tục mạch dẫn đầu và tạo đoạn Okazaki mạch theo sau.';
  if (pct < 80) return 'DNA Polymerase hoàn tất các đoạn Okazaki; đoạn mồi RNA được thay thế bằng DNA.';
  if (pct < 95) return 'DNA Ligase xúc tác tạo liên kết phosphodiester hàn kín các điểm đứt gãy.';
  return 'Hoàn thành nhân đôi: Tạo 2 phân tử DNA con giống hệt mẹ theo nguyên tắc bán bảo tồn!';
};

const REPLICATION_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  helicase: {
    id: 'helicase',
    name: 'Enzyme Tháo Xoắn Helicase',
    nameEn: 'DNA Helicase Enzyme',
    category: 'Enzyme tháo xoắn',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Phức hợp protein hình vòng gồm 6 tiểu đơn vị (hexamer) bao bọc lấy một mạch DNA đơn tại điểm khởi đầu nhân đôi.',
    functionRole: 'Sử dụng năng lượng từ ATP bẻ gãy các liên kết hydrogen giữa 2 mạch polynucleotide, tách đôi chuỗi xoắn kép tạo chạc chữ Y.',
    keyFact: 'Tốc độ tháo xoắn cực nhanh (hàng nghìn cặp bazơ mỗi phút), cần protein SSB bám vào để ngăn 2 mạch đơn tái liên kết.',
    colorHex: '#eab308'
  },
  dna_poly: {
    id: 'dna_poly',
    name: 'Enzyme DNA Polymerase',
    nameEn: 'DNA Polymerase III',
    category: 'Enzyme kéo dài',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Có cấu trúc không gian dạng "bàn tay phải" gồm 3 miền: lòng bàn tay (trung tâm xúc tác), ngón tay (nhận diện nucleotide) và ngón cái (giữ DNA).',
    functionRole: 'Xúc tác gắn các nucleotide tự do từ môi trường vào đầu 3\'-OH của mạch mới theo nguyên tắc bổ sung (A-T, G-C).',
    keyFact: 'Chỉ tổng hợp mạch mới theo một chiều duy nhất 5\' → 3\' và có chức năng sửa sai (proofreading) 3\'→5\' exonuclease.',
    colorHex: '#10b981'
  },
  leading_strand: {
    id: 'leading_strand',
    name: 'Mạch Dẫn Đầu (Leading Strand)',
    nameEn: 'Leading Strand',
    category: 'Mạch mới liên tục',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Mạch DNA mới được tổng hợp dựa trên mạch khuôn có chiều 3\' → 5\' (tính theo chiều tiến của chạc chữ Y).',
    functionRole: 'Được DNA Polymerase tổng hợp liên tục cùng chiều với hướng mở xoắn của enzyme Helicase.',
    keyFact: 'Chỉ cần một đoạn mồi RNA duy nhất ở điểm khởi đầu để kéo dài đến hết phân tử.',
    colorHex: '#0284c7'
  },
  lagging_strand: {
    id: 'lagging_strand',
    name: 'Mạch Theo Sau & Đoạn Okazaki',
    nameEn: 'Lagging Strand & Okazaki Fragments',
    category: 'Mạch mới ngắt quãng',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Gồm các đoạn ngắn Okazaki (dài 1000 - 2000 nu ở vi khuẩn, 100 - 200 nu ở sinh vật nhân thực) tổng hợp trên mạch khuôn 5\' → 3\'.',
    functionRole: 'Tổng hợp ngắt quãng ngược chiều với chiều tháo xoắn, giúp hoàn thiện toàn bộ phân tử DNA mà không vi phạm nguyên tắc 5\'→3\'.',
    keyFact: 'Mỗi đoạn Okazaki cần một đoạn mồi RNA riêng biệt, sau đó mồi bị cắt bỏ và nối lại bởi DNA Ligase.',
    colorHex: '#ec4899'
  },
  ligase: {
    id: 'ligase',
    name: 'Enzyme Nối DNA Ligase',
    nameEn: 'DNA Ligase Enzyme',
    category: 'Enzyme hàn gắn',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Enzyme đặc hiệu có khả năng nhận biết các điểm đứt gãy đơn (nick) trên khung phosphodiester của phân tử DNA.',
    functionRole: 'Hàn gắn các đoạn Okazaki lại với nhau bằng cách tạo liên kết phosphodiester giữa nhóm 3\'-OH và 5\'-phosphate.',
    keyFact: 'Tiêu tốn năng lượng ATP (hoặc NAD+ ở vi khuẩn) để kích hoạt phản ứng ngưng tụ.',
    colorHex: '#8b5cf6'
  },
  parent_stem: {
    id: 'parent_stem',
    name: 'Mạch Khuôn DNA Mẹ (3\' → 5\' & 5\' → 3\')',
    nameEn: 'Parent Template DNA',
    category: 'Mạch khuôn mẫu',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Chuỗi xoắn kép DNA ban đầu gồm 2 mạch polynucleotide đối song song mang toàn bộ thông tin di truyền gốc.',
    functionRole: 'Cung cấp trình tự các base làm khuôn mẫu chính xác để lắp ráp các nucleotide tự do thành mạch mới (nguyên tắc bán bảo tồn).',
    keyFact: 'Mỗi phân tử DNA con tạo thành sẽ giữ lại đúng 1 mạch của mẹ và 1 mạch mới tổng hợp từ môi trường.',
    colorHex: '#38bdf8'
  },
  fork_y: {
    id: 'fork_y',
    name: 'Chạc Tái Bản Hình Chữ Y',
    nameEn: 'Replication Fork',
    category: 'Cấu trúc không gian',
    parentModel: 'Mô Hình Tái Bản DNA',
    structure: 'Vùng tiếp giáp giữa chuỗi xoắn kép chưa tháo xoắn và 2 mạch đơn vừa được tách rời bởi Helicase.',
    functionRole: 'Nơi tập hợp toàn bộ phức hệ cỗ máy nhân đôi (Replisome) gồm Helicase, Primase, DNA Poly, Clamp và Ligase.',
    keyFact: 'Ở sinh vật nhân sơ có 2 chạc chữ Y di chuyển ngược hướng nhau từ điểm khởi đầu ori, tạo bọt nhân đôi.',
    colorHex: '#f59e0b'
  }
};

export const ReplicationModel: React.FC = () => {
  const [progress, setProgress] = useState<number>(35);
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
        const next = prev + dt * 14 * speed;
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
    cameraRef.current.position.z = Math.max(10, Math.min(65, cameraRef.current.position.z * factor));
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
    camera.position.set(0, 0, 32);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 0.9);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
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

  // Update 3D scene smoothly whenever progress changes (Scrubbing / Animation)
  useEffect(() => {
    if (modelGroupRef.current) {
      buildReplication3DScene(progress, modelGroupRef.current);
    }
  }, [progress]);

  // Build 3D Replication Fork dynamically according to scrubbing progress (0 - 100)
  const buildReplication3DScene = (pct: number, group: THREE.Group) => {
    group.clear();

    const t = Math.max(0, Math.min(100, pct)) / 100; // 0.0 -> 1.0
    const forkX = -10 + t * 14; // fork travels from -10 to +4

    const parentPairs: { left: string; right: string; hBonds: number }[] = [
      { left: 'A', right: 'T', hBonds: 2 },
      { left: 'T', right: 'A', hBonds: 2 },
      { left: 'G', right: 'C', hBonds: 3 },
      { left: 'C', right: 'G', hBonds: 3 },
      { left: 'A', right: 'T', hBonds: 2 },
      { left: 'G', right: 'C', hBonds: 3 },
      { left: 'T', right: 'A', hBonds: 2 },
      { left: 'C', right: 'G', hBonds: 3 },
      { left: 'A', right: 'T', hBonds: 2 },
      { left: 'T', right: 'A', hBonds: 2 },
      { left: 'G', right: 'C', hBonds: 3 },
      { left: 'C', right: 'G', hBonds: 3 },
      { left: 'A', right: 'T', hBonds: 2 },
      { left: 'T', right: 'A', hBonds: 2 }
    ];

    // 1. Parent Double Helix Ahead of Fork (Stem of Y fork: x from -15 to forkX)
    const stemPts1: THREE.Vector3[] = [];
    const stemPts2: THREE.Vector3[] = [];
    const totalStemSteps = Math.max(4, Math.floor((forkX - (-15)) / 0.55));

    for (let i = 0; i <= totalStemSteps; i++) {
      const x = -15 + i * 0.55;
      const angle = i * 0.6;
      const y1 = Math.sin(angle) * 1.8;
      const z1 = Math.cos(angle) * 1.8;
      const y2 = Math.sin(angle + Math.PI) * 1.8;
      const z2 = Math.cos(angle + Math.PI) * 1.8;
      stemPts1.push(new THREE.Vector3(x, y1, z1));
      stemPts2.push(new THREE.Vector3(x, y2, z2));

      // Add intact base pairs with bold Nu letters & hydrogen bonds ahead of fork
      if (i % 2 === 0 && x < forkX - 0.8) {
        const pair = parentPairs[(i / 2) % parentPairs.length];

        const leftSprite = createNuSprite(pair.left, { size: 1.05, depthTest: false });
        leftSprite.position.set(x, y1 * 0.7, z1 * 0.7);
        leftSprite.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
        group.add(leftSprite);

        const rightSprite = createNuSprite(pair.right, { size: 1.05, depthTest: false });
        rightSprite.position.set(x, y2 * 0.7, z2 * 0.7);
        rightSprite.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
        group.add(rightSprite);

        // Dashed hydrogen bond line between base pair
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y1 * 0.45, z1 * 0.45),
          new THREE.Vector3(x, y2 * 0.45, z2 * 0.45)
        ]);
        const lineMat = new THREE.LineDashedMaterial({
          color: pair.hBonds === 3 ? 0x10b981 : 0xfacc15,
          dashSize: 0.15,
          gapSize: 0.08
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        group.add(line);
      }
    }

    if (stemPts1.length >= 2) {
      const c1 = new THREE.CatmullRomCurve3(stemPts1);
      const c2 = new THREE.CatmullRomCurve3(stemPts2);
      const stemMesh1 = new THREE.Mesh(
        new THREE.TubeGeometry(c1, Math.max(10, stemPts1.length * 2), 0.28, 12, false),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
      );
      const stemMesh2 = new THREE.Mesh(
        new THREE.TubeGeometry(c2, Math.max(10, stemPts2.length * 2), 0.28, 12, false),
        new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3 })
      );
      stemMesh1.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
      stemMesh2.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
      group.add(stemMesh1);
      group.add(stemMesh2);
    }

    // 2. Helicase Enzyme Ring (Hexamer) positioned directly at the fork point
    const helicaseGroup = new THREE.Group();
    helicaseGroup.position.set(forkX, 0, 0);

    const helicaseTorus = new THREE.Mesh(
      new THREE.TorusGeometry(2.3, 0.75, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0xeab308,
        roughness: 0.25,
        metalness: 0.45,
        emissive: 0xca8a04,
        emissiveIntensity: 0.2
      })
    );
    helicaseTorus.rotation.y = Math.PI / 2;
    helicaseTorus.rotation.z = t * Math.PI * 6; // spins dynamically with progress
    helicaseTorus.userData = { partInfo: REPLICATION_PARTS_INFO.helicase };
    helicaseGroup.add(helicaseTorus);

    // Subtle 6-hexamer subunit lobes for biological accuracy
    for (let h = 0; h < 6; h++) {
      const subAngle = (h * Math.PI) / 3 + t * Math.PI * 6;
      const lobe = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
      );
      lobe.position.set(0, Math.sin(subAngle) * 2.3, Math.cos(subAngle) * 2.3);
      lobe.userData = { partInfo: REPLICATION_PARTS_INFO.helicase };
      helicaseGroup.add(lobe);
    }
    group.add(helicaseGroup);

    // Topoisomerase / Gyrase ahead of Helicase
    const gyraseMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.4, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, metalness: 0.3 })
    );
    gyraseMesh.position.set(Math.max(-15, forkX - 3.2), 0, 0);
    gyraseMesh.rotation.y = Math.PI / 2;
    gyraseMesh.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
    group.add(gyraseMesh);

    // 3. Single-Stranded Binding Proteins (SSB) stabilizing separated single strands near fork
    [-1, 1].forEach((dir) => {
      for (let s = 1; s <= 2; s++) {
        const ssb = new THREE.Mesh(
          new THREE.SphereGeometry(0.42, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.25 })
        );
        ssb.position.set(forkX + s * 1.3, dir * (1.2 + s * 0.9), dir * 0.4);
        ssb.userData = { partInfo: REPLICATION_PARTS_INFO.fork_y };
        group.add(ssb);
      }
    });

    // 4. Leading Strand (Top Branch: 3' -> 5' template, synthesized continuously 5' -> 3')
    const topTemplatePts = [
      new THREE.Vector3(forkX, 0.5, 0.2),
      new THREE.Vector3(forkX + (14 - forkX) * 0.3, 3.2, 0.8),
      new THREE.Vector3(forkX + (14 - forkX) * 0.65, 5.8, 0.4),
      new THREE.Vector3(14, 7.5, 0)
    ];
    const topCurve = new THREE.CatmullRomCurve3(topTemplatePts);
    const topTemplateMesh = new THREE.Mesh(
      new THREE.TubeGeometry(topCurve, 32, 0.28, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    topTemplateMesh.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
    group.add(topTemplateMesh);

    // Nucleotides on leading template strand
    const templateSequence = ['T', 'G', 'A', 'C', 'T', 'G', 'A', 'C', 'T', 'G'];
    templateSequence.forEach((b, idx) => {
      const u = (idx + 0.5) / templateSequence.length;
      const pt = topCurve.getPoint(u);
      const sprite = createNuSprite(b, { size: 1.05, depthTest: false });
      sprite.position.set(pt.x, pt.y + 0.5, pt.z);
      sprite.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
      group.add(sprite);
    });

    // Continuous leading strand daughter synthesis (extends with progress)
    const leadingSynthesisRatio = Math.max(0.05, Math.min(1, t * 1.15));
    const leadingSynthesisPts: THREE.Vector3[] = [];
    const leadStepCount = Math.max(4, Math.floor(leadingSynthesisRatio * 24));
    for (let k = 0; k <= leadStepCount; k++) {
      const u = (k / 24) * leadingSynthesisRatio;
      const pt = topCurve.getPoint(u);
      // Daughter strand runs parallel to template with complementary offset
      leadingSynthesisPts.push(new THREE.Vector3(pt.x, pt.y - 0.7, pt.z + 0.3));
    }

    if (leadingSynthesisPts.length >= 2) {
      const leadingDaughterCurve = new THREE.CatmullRomCurve3(leadingSynthesisPts);
      const leadingDaughterMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leadingDaughterCurve, Math.max(8, leadStepCount * 2), 0.26, 12, false),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.2,
          metalness: 0.6,
          emissive: 0x0284c7,
          emissiveIntensity: 0.25
        })
      );
      leadingDaughterMesh.userData = { partInfo: REPLICATION_PARTS_INFO.leading_strand };
      group.add(leadingDaughterMesh);

      // Complementary nucleotides matching template (A matches T, C matches G...)
      const compSequence = ['A', 'C', 'T', 'G', 'A', 'C', 'T', 'G', 'A', 'C'];
      compSequence.forEach((b, idx) => {
        const u = (idx + 0.5) / templateSequence.length;
        if (u <= leadingSynthesisRatio) {
          const pt = leadingDaughterCurve.getPoint(Math.min(1, u / leadingSynthesisRatio));
          const sprite = createNuSprite(b, {
            size: 1.05,
            depthTest: false,
            borderColor: '#38bdf8'
          });
          sprite.position.set(pt.x, pt.y - 0.35, pt.z + 0.3);
          sprite.userData = { partInfo: REPLICATION_PARTS_INFO.leading_strand };
          group.add(sprite);

          // Active hydrogen bonds forming
          const tPt = topCurve.getPoint(u);
          const hLineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(tPt.x, tPt.y + 0.1, tPt.z),
            new THREE.Vector3(pt.x, pt.y, pt.z)
          ]);
          const hLineMat = new THREE.LineDashedMaterial({
            color: 0x38bdf8,
            dashSize: 0.15,
            gapSize: 0.08
          });
          const hLine = new THREE.Line(hLineGeo, hLineMat);
          hLine.computeLineDistances();
          group.add(hLine);
        }
      });

      // DNA Polymerase on leading strand (positioned right at the growing 3'-OH tip)
      const leadTip = leadingSynthesisPts[leadingSynthesisPts.length - 1];
      const leadPolyGroup = new THREE.Group();
      leadPolyGroup.position.copy(leadTip);

      const polyMain = new THREE.Mesh(
        new THREE.SphereGeometry(1.35, 20, 20),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.25,
          metalness: 0.45,
          emissive: 0x059669,
          emissiveIntensity: 0.3
        })
      );
      polyMain.userData = { partInfo: REPLICATION_PARTS_INFO.dna_poly };
      leadPolyGroup.add(polyMain);

      // Beta sliding clamp ring behind DNA Polymerase
      const clampRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.25, 12, 24),
        new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3 })
      );
      clampRing.rotation.y = Math.PI / 2;
      clampRing.position.set(-0.8, 0, 0);
      clampRing.userData = { partInfo: REPLICATION_PARTS_INFO.dna_poly };
      leadPolyGroup.add(clampRing);

      group.add(leadPolyGroup);

      // Incoming free nucleotide floating towards DNA Polymerase active site
      if (t < 0.95) {
        const freeNu = createNuSprite(compSequence[leadStepCount % compSequence.length] || 'A', {
          size: 1.1,
          depthTest: false,
          borderColor: '#10b981'
        });
        freeNu.position.set(leadTip.x + 1.2, leadTip.y + 1.8, leadTip.z + 0.8);
        freeNu.userData = { partInfo: REPLICATION_PARTS_INFO.dna_poly };
        group.add(freeNu);
      }
    }

    // 5. Lagging Strand (Bottom Branch: 5' -> 3' template, synthesized discontinuously in Okazaki fragments)
    const botTemplatePts = [
      new THREE.Vector3(forkX, -0.5, -0.2),
      new THREE.Vector3(forkX + (14 - forkX) * 0.3, -3.2, -0.8),
      new THREE.Vector3(forkX + (14 - forkX) * 0.65, -5.8, -0.4),
      new THREE.Vector3(14, -7.5, 0)
    ];
    const botCurve = new THREE.CatmullRomCurve3(botTemplatePts);
    const botTemplateMesh = new THREE.Mesh(
      new THREE.TubeGeometry(botCurve, 32, 0.28, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3 })
    );
    botTemplateMesh.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
    group.add(botTemplateMesh);

    // Template bases on lagging strand
    const lagTemplateSequence = ['A', 'C', 'T', 'G', 'A', 'C', 'T', 'G', 'A', 'C'];
    lagTemplateSequence.forEach((b, idx) => {
      const u = (idx + 0.5) / lagTemplateSequence.length;
      const pt = botCurve.getPoint(u);
      const sprite = createNuSprite(b, { size: 1.05, depthTest: false });
      sprite.position.set(pt.x, pt.y - 0.5, pt.z);
      sprite.userData = { partInfo: REPLICATION_PARTS_INFO.parent_stem };
      group.add(sprite);
    });

    // Discontinuous Okazaki fragments along lagging strand
    // Fragment 1 appears when t >= 0.15
    if (t >= 0.15) {
      const oka1Pts = [
        botCurve.getPoint(0.1),
        botCurve.getPoint(0.25),
        botCurve.getPoint(0.4)
      ].map(p => new THREE.Vector3(p.x, p.y + 0.6, p.z - 0.3));

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

      // Primer marker (teal) at 5' end of fragment
      if (t < 0.85) {
        const primer1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.48, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 })
        );
        primer1.position.copy(oka1Pts[0]);
        primer1.userData = { partInfo: REPLICATION_PARTS_INFO.lagging_strand };
        group.add(primer1);
      }

      ['U', 'G', 'A'].forEach((b, idx) => {
        const sprite = createNuSprite(b, { size: 1.05, depthTest: false, borderColor: '#ec4899' });
        sprite.position.set(oka1Pts[idx].x, oka1Pts[idx].y + 0.4, oka1Pts[idx].z);
        sprite.userData = { partInfo: REPLICATION_PARTS_INFO.lagging_strand };
        group.add(sprite);
      });
    }

    // Fragment 2 appears when t >= 0.45
    if (t >= 0.45) {
      const oka2Pts = [
        botCurve.getPoint(0.45),
        botCurve.getPoint(0.6),
        botCurve.getPoint(0.75)
      ].map(p => new THREE.Vector3(p.x, p.y + 0.6, p.z - 0.3));

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

      ['C', 'T', 'G'].forEach((b, idx) => {
        const sprite = createNuSprite(b, { size: 1.05, depthTest: false, borderColor: '#ec4899' });
        sprite.position.set(oka2Pts[idx].x, oka2Pts[idx].y + 0.4, oka2Pts[idx].z);
        sprite.userData = { partInfo: REPLICATION_PARTS_INFO.lagging_strand };
        group.add(sprite);
      });

      // DNA Polymerase on lagging strand actively synthesizing
      if (t < 0.85) {
        const lagPoly = new THREE.Mesh(
          new THREE.SphereGeometry(1.25, 18, 18),
          new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.4 })
        );
        lagPoly.position.copy(oka2Pts[1]);
        lagPoly.userData = { partInfo: REPLICATION_PARTS_INFO.dna_poly };
        group.add(lagPoly);
      }
    }

    // DNA Ligase (moves into nick between Okazaki fragments to seal phosphodiester bond)
    if (t >= 0.70) {
      const nickPt = botCurve.getPoint(0.42);
      const ligaseGroup = new THREE.Group();
      ligaseGroup.position.set(nickPt.x, nickPt.y + 0.7, nickPt.z - 0.3);

      const ligaseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 1.8, 16),
        new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          roughness: 0.2,
          metalness: 0.6,
          emissive: 0x7c3aed,
          emissiveIntensity: 0.35
        })
      );
      ligaseMesh.rotation.z = Math.PI / 4;
      ligaseMesh.userData = { partInfo: REPLICATION_PARTS_INFO.ligase };
      ligaseGroup.add(ligaseMesh);

      // Ligase catalytic energy indicator
      const ligaseHalo = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.3, 16),
        new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide })
      );
      ligaseHalo.rotation.x = Math.PI / 2;
      ligaseHalo.userData = { partInfo: REPLICATION_PARTS_INFO.ligase };
      ligaseGroup.add(ligaseHalo);

      group.add(ligaseGroup);
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
              Phòng Thí Nghiệm Tái Bản DNA 3D (Chạc Nhân Đôi Chữ Y)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kéo thanh trượt tiến trình để theo dõi trực quan liên tục từng thao tác tháo xoắn của Helicase, tổng hợp của DNA Polymerase và nối của Ligase.
          </p>
        </div>

        {/* Quick Stage Jump Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => { setProgress(10); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStage === 1 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 1 (0%)</span>
          </button>
          <button
            onClick={() => { setProgress(50); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStage === 2 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 2 (50%)</span>
          </button>
          <button
            onClick={() => { setProgress(88); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStage === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 3 (88%)</span>
          </button>
        </div>
      </div>

      {/* Interactive Process Timeline Scrubber (Thanh Trượt Tiến Trình Mượt Mà) */}
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
            className={`relative rounded-3xl border border-slate-300/80 overflow-hidden shadow-xl h-[480px] sm:h-[530px] transition-colors ${
              viewportTheme === 'deep'
                ? 'bg-[#070c18]'
                : 'bg-gradient-to-b from-emerald-50/70 via-white to-sky-100/60'
            }`}
          >
            {/* Scientific HUD Overlay */}
            <div
              className={`absolute top-3 left-3 z-10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1 shadow-md pointer-events-none ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/80 border border-slate-800 text-slate-300'
                  : 'bg-white/85 border border-emerald-100 text-slate-700'
              }`}
            >
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> THÔNG SỐ TÁI BẢN DNA
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Giai đoạn:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>{STAGES[activeStage].title.split(': ')[1]}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Nguyên tắc:</span>{' '}
                <strong className="text-amber-400">{STAGES[activeStage].principles}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Tiến độ:</span>{' '}
                <strong className="text-emerald-400">{progress.toFixed(0)}%</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-emerald-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Nhấp chuột vào Helicase, DNA Poly, chạc Y hoặc đoạn Okazaki để <strong>xem chi tiết</strong></span>
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
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl text-white">
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

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào vòng Helicase vàng, khối xanh DNA Polymerase, mạch Okazaki hồng hoặc chạc chữ Y để nhận thông tin phân tích ngắn gọn.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

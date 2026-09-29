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

interface TranscriptionStage {
  step: number;
  title: string;
  enzyme: string;
  direction: string;
  details: string;
}

const TRANSCRIPTION_STAGES: Record<1 | 2 | 3, TranscriptionStage> = {
  1: {
    step: 1,
    title: 'Giai Đoạn 1: Khởi Đầu (Initiation)',
    enzyme: 'RNA Polymerase nhận biết và bám vào vùng điều hòa (Promoter)',
    direction: 'Mở xoắn cục bộ một đoạn DNA (khoảng 20 cặp bazơ)',
    details: 'Enzyme RNA polymerase nhận biết và liên kết đặc hiệu với trình tự khởi động (Promoter) ở đầu 3\' của mạch gốc DNA. Enzyme làm tháo xoắn một đoạn ngắn DNA, làm lộ mạch khuôn 3\'→5\'.'
  },
  2: {
    step: 2,
    title: 'Giai Đoạn 2: Kéo Dài (Elongation)',
    enzyme: 'RNA Polymerase trượt dọc mạch gốc tháo xoắn & lắp ráp ribonucleotide',
    direction: 'Tổng hợp phân tử RNA theo chiều 5\' → 3\' (ngược chiều mạch khuôn)',
    details: 'RNA Polymerase di chuyển dọc theo mạch mã gốc (3\'→5\'), xúc tác các ribonucleotide tự do trong môi trường liên kết bổ sung với mạch gốc (A-U, T-A, G-C, C-G) tạo thành liên kết phosphodiester.'
  },
  3: {
    step: 3,
    title: 'Giai Đoạn 3: Kết Thúc (Termination)',
    enzyme: 'RNA Polymerase gặp tín hiệu kết thúc (Terminator)',
    direction: 'Giải phóng phân tử RNA hoàn chỉnh & DNA đóng xoắn trở lại',
    details: 'Khi enzyme di chuyển đến vùng kết thúc (Terminator), quá trình phiên mã dừng lại. Phân tử RNA vừa tổng hợp được giải phóng, enzyme RNA polymerase rời khỏi DNA, và hai mạch DNA xoắn kép lại với nhau.'
  }
};

const TRANSCRIPTION_TIMELINE_STAGES: TimelineStageMarker[] = [
  {
    id: 1,
    label: 'GĐ 1: Khởi Đầu (Initiation)',
    shortLabel: 'GĐ 1: Khởi đầu (0%)',
    range: [0, 30],
    desc: 'RNA Polymerase bám Promoter, mở xoắn cục bộ tạo bọt phiên mã.'
  },
  {
    id: 2,
    label: 'GĐ 2: Kéo Dài (Elongation)',
    shortLabel: 'GĐ 2: Kéo dài (31%)',
    range: [31, 79],
    desc: 'RNA Polymerase trượt 3\'→5\' trên mạch gốc, tổng hợp mARN 5\'→3\' (A-U, T-A, G-C, C-G).'
  },
  {
    id: 3,
    label: 'GĐ 3: Kết Thúc (Termination)',
    shortLabel: 'GĐ 3: Kết thúc (80%)',
    range: [80, 100],
    desc: 'Gặp tín hiệu kết thúc Terminator, giải phóng mARN hoàn chỉnh, DNA tái xoắn kép.'
  }
];

const getTranscriptionEventLabel = (pct: number) => {
  if (pct < 15) return 'RNA Polymerase nhận biết và liên kết đặc hiệu với Promoter (vùng khởi động TATA).';
  if (pct < 30) return 'Bọt phiên mã hình thành; RNA Polymerase tháo xoắn làm lộ mạch mã gốc 3\'→5\'.';
  if (pct < 50) return 'RNA Polymerase trượt về phía trước; ribonucleotide tự do (A, U, G, C) lắp ráp theo NTBS.';
  if (pct < 70) return 'Mạch mARN kéo dài liên tục theo chiều 5\'→3\'; phía sau enzyme, DNA lập tức tái đóng xoắn.';
  if (pct < 85) return 'RNA Polymerase tiếp cận vùng Terminator; chuỗi mARN hình thành cấu trúc kẹp tóc báo hiệu kết thúc.';
  return 'Phiên mã hoàn tất: Phân tử mARN rời khỏi nhân; RNA Poly tách rời; DNA tái lập xoắn kép hoàn toàn.';
};

const TRANSCRIPTION_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  rna_poly: {
    id: 'rna_poly',
    name: 'Enzyme RNA Polymerase',
    nameEn: 'RNA Polymerase Enzyme',
    category: 'Enzyme phiên mã',
    parentModel: 'Mô Hình Phiên Mã Tổng Hợp RNA',
    structure: 'Phức hệ protein đa tiểu đơn vị khổng lồ có khả năng tự tháo xoắn DNA, xúc tác tổng hợp RNA và tự đóng xoắn DNA phía sau.',
    functionRole: 'Trượt dọc mạch khuôn DNA theo chiều 3\' → 5\', lắp ráp các ribonucleotide tự do thành chuỗi RNA theo chiều 5\' → 3\' theo NTBS (A-U, T-A, G-C, C-G).',
    keyFact: 'Không cần đoạn mồi RNA (khác với DNA Polymerase), có thể tự khởi đầu chuỗi RNA mới.',
    colorHex: '#3b82f6'
  },
  bubble: {
    id: 'bubble',
    name: 'Bọt Phiên Mã (Transcription Bubble)',
    nameEn: 'Transcription Bubble',
    category: 'Cấu trúc mở xoắn',
    parentModel: 'Mô Hình Phiên Mã Tổng Hợp RNA',
    structure: 'Đoạn DNA xoắn kép bị tháo xoắn cục bộ dài khoảng 12 - 20 cặp nucleotide ngay trong lòng enzyme RNA Polymerase.',
    functionRole: 'Làm lộ mạch mã gốc để các ribonucleotide tự do tiếp cận và bắt cặp bổ sung chính xác với các base khuôn mẫu.',
    keyFact: 'Bọt phiên mã di chuyển tịnh tiến liên tục; phía trước tháo xoắn, phía sau hai mạch DNA lập tức tái xoắn kép lại.',
    colorHex: '#06b6d4'
  },
  promoter: {
    id: 'promoter',
    name: 'Vùng Khởi Động (Promoter Region)',
    nameEn: 'Promoter DNA Region',
    category: 'Trình tự điều hòa',
    parentModel: 'Mô Hình Phiên Mã Tổng Hợp RNA',
    structure: 'Đoạn trình tự nucleotide đặc thù (như hộp TATA ở sinh vật nhân thực) nằm ở đầu 3\' của mạch gốc gen.',
    functionRole: 'Điểm nhận biết và gắn kết chính xác của enzyme RNA Polymerase để định hướng mạch nào là mạch khuôn và khởi động phiên mã.',
    keyFact: 'Bản thân vùng promoter không được phiên mã thành RNA mà đóng vai trò công tắc kích hoạt gen.',
    colorHex: '#eab308'
  },
  mrna_transcript: {
    id: 'mrna_transcript',
    name: 'Phân Tử mARN Đang Kéo Dài',
    nameEn: 'Nascent mRNA Transcript',
    category: 'Sản phẩm phiên mã',
    parentModel: 'Mô Hình Phiên Mã Tổng Hợp RNA',
    structure: 'Chuỗi polynucleotide đơn gồm 4 loại ribonucleotide (A, U, G, C) gắn với nhau bằng liên kết phosphodiester.',
    functionRole: 'Mang bản sao thông tin di truyền từ nhân tế bào ra tế bào chất để làm khuôn tổng hợp chuỗi polypeptide tại ribosome.',
    keyFact: 'Được tổng hợp theo chiều 5\' → 3\'; đầu 5\' có nhóm triphosphate, đầu 3\' có nhóm -OH tự do.',
    colorHex: '#f43f5e'
  },
  template_strand: {
    id: 'template_strand',
    name: 'Mạch Mã Gốc (3\' → 5\')',
    nameEn: 'DNA Template Strand',
    category: 'Mạch khuôn mẫu',
    parentModel: 'Mô Hình Phiên Mã Tổng Hợp RNA',
    structure: 'Một trong hai mạch đơn của gen có chiều 3\' → 5\' làm khuôn trực tiếp cho enzyme RNA Polymerase trượt qua.',
    functionRole: 'Cung cấp trật tự nucleotide để quy định trật tự bổ sung của các ribonucleotide trên phân tử RNA.',
    keyFact: 'Chỉ có duy nhất mạch mang chiều 3\'→5\' mới được sử dụng làm mạch mã gốc trong phiên mã.',
    colorHex: '#0284c7'
  },
  coding_strand: {
    id: 'coding_strand',
    name: 'Mạch Mã Hóa / Bổ Sung (5\' → 3\')',
    nameEn: 'DNA Non-Template (Coding) Strand',
    category: 'Mạch đối song song',
    parentModel: 'Mô Hình Phiên Mã Tổng Hợp RNA',
    structure: 'Mạch đơn DNA còn lại có chiều 5\' → 3\', có trình tự nucleotide giống hệt mARN (chỉ khác T thay bằng U).',
    functionRole: 'Bảo vệ thông tin di truyền và đóng xoắn tái lập chuỗi xoắn kép ngay sau khi enzyme đi qua.',
    keyFact: 'Các nhà khoa học thường biểu diễn trình tự gen dựa trên mạch mã hóa 5\'→3\' này.',
    colorHex: '#475569'
  }
};

export const TranscriptionModel: React.FC = () => {
  const [progress, setProgress] = useState<number>(40);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewportTheme, setViewportTheme] = useState<'deep' | 'lab'>('deep');
  const [inspectedDetail, setInspectedDetail] = useState<ModelSubpartDetail | null>(null);
  const [hoveredDetail, setHoveredDetail] = useState<ModelSubpartDetail | null>(null);

  const activeStep: 1 | 2 | 3 = progress < 31 ? 1 : progress < 80 ? 2 : 3;

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
    playToneEffect(620);
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

  const allPartsList = Object.values(TRANSCRIPTION_PARTS_INFO);

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

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 0.9);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildTranscription3DScene(progress, mainGroup);

    // Raycaster for 3D interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = { x: 0, y: 0, time: 0 };

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotateRef.current && modelGroupRef.current && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.008;
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

  // Update 3D scene whenever progress scrubber changes
  useEffect(() => {
    if (modelGroupRef.current) {
      buildTranscription3DScene(progress, modelGroupRef.current);
    }
  }, [progress]);

  // Build 3D Transcription Scene dynamically based on progress (0 - 100)
  const buildTranscription3DScene = (pct: number, group: THREE.Group) => {
    group.clear();

    const t = Math.max(0, Math.min(100, pct)) / 100; // 0.0 -> 1.0
    const polyX = -9 + t * 18; // RNA Polymerase slides smoothly from -9 to +9

    // 1. Template DNA Strand (Bottom: 3' -> 5') and Coding Strand (Top: 5' -> 3')
    const tPts: THREE.Vector3[] = [];
    const ntPts: THREE.Vector3[] = [];
    for (let i = -14; i <= 14; i++) {
      const x = i;
      // Transcription bubble opens and travels with RNA Polymerase
      const distFromPoly = Math.abs(x - polyX);
      const isBubble = distFromPoly <= 3.8;
      const bubbleSpread = isBubble ? Math.cos((distFromPoly / 3.8) * (Math.PI / 2)) * 2.3 : 0;

      const y1 = -1.2 - bubbleSpread;
      const z1 = Math.sin(x * 0.3) * 1.2;

      const y2 = 1.2 + bubbleSpread;
      const z2 = Math.cos(x * 0.3) * 1.2;

      tPts.push(new THREE.Vector3(x, y1, z1));
      ntPts.push(new THREE.Vector3(x, y2, z2));
    }

    const tCurve = new THREE.CatmullRomCurve3(tPts);
    const ntCurve = new THREE.CatmullRomCurve3(ntPts);

    const templateMesh = new THREE.Mesh(
      new THREE.TubeGeometry(tCurve, 60, 0.28, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    templateMesh.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.template_strand };
    group.add(templateMesh);

    const codingMesh = new THREE.Mesh(
      new THREE.TubeGeometry(ntCurve, 60, 0.28, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3 })
    );
    codingMesh.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.coding_strand };
    group.add(codingMesh);

    // Nucleotides along DNA (template and coding)
    const dnaTemplateSequence = ['T', 'A', 'C', 'G', 'A', 'T', 'G', 'C', 'A', 'T', 'C', 'G', 'T', 'A'];
    dnaTemplateSequence.forEach((nu, idx) => {
      const x = -13 + idx * 2.0;
      const distFromPoly = Math.abs(x - polyX);
      const isBubble = distFromPoly <= 3.8;
      const bubbleSpread = isBubble ? Math.cos((distFromPoly / 3.8) * (Math.PI / 2)) * 2.3 : 0;
      const y1 = -1.2 - bubbleSpread;
      const y2 = 1.2 + bubbleSpread;
      const z = Math.sin(x * 0.3) * 1.2;

      // Template base
      const tSprite = createNuSprite(nu, { size: 1.05, depthTest: false });
      tSprite.position.set(x, y1 - 0.45, z);
      tSprite.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.template_strand };
      group.add(tSprite);

      // Coding strand base
      const compMap: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
      const codingNu = compMap[nu] || 'A';
      const cSprite = createNuSprite(codingNu, { size: 1.05, depthTest: false });
      cSprite.position.set(x, y2 + 0.45, z);
      cSprite.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.coding_strand };
      group.add(cSprite);

      // Dashed hydrogen bonds when closed outside bubble
      if (!isBubble) {
        const hLineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y1 * 0.5, z * 0.5),
          new THREE.Vector3(x, y2 * 0.5, z * 0.5)
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

    // 2. Transcription Bubble Sensor
    const bubbleSensor = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 16, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    bubbleSensor.position.set(polyX, 0, 0);
    bubbleSensor.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.bubble };
    group.add(bubbleSensor);

    // 3. RNA Polymerase Enzyme (moves smoothly along DNA)
    const polyGroup = new THREE.Group();
    polyGroup.position.set(polyX, 0, 0);

    const polyMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.2, 5.8, 24),
      new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.25,
        metalness: 0.35,
        transparent: true,
        opacity: t >= 0.9 ? 0.35 : 0.68,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.2
      })
    );
    polyMesh.rotation.z = Math.PI / 2;
    polyMesh.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.rna_poly };
    polyGroup.add(polyMesh);

    // Catalytic center sphere inside RNA Poly
    const catalyticCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        roughness: 0.2,
        metalness: 0.5,
        emissive: 0x2563eb,
        emissiveIntensity: 0.4
      })
    );
    catalyticCore.position.set(0, -0.6, 0.4);
    catalyticCore.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.rna_poly };
    polyGroup.add(catalyticCore);

    group.add(polyGroup);

    // 4. Promoter Marker on left (x = -11)
    const promoterBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 2.2, 20),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2, metalness: 0.5 })
    );
    promoterBand.position.set(-11, 0, 0);
    promoterBand.rotation.z = Math.PI / 2;
    promoterBand.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.promoter };
    group.add(promoterBand);

    // Terminator Marker on right (x = +11)
    const terminatorBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 2.0, 20),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.2, metalness: 0.5 })
    );
    terminatorBand.position.set(11, 0, 0);
    terminatorBand.rotation.z = Math.PI / 2;
    terminatorBand.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.promoter };
    group.add(terminatorBand);

    // 5. Emerging mRNA Transcript with Uracil (elongates as RNA Polymerase slides)
    if (t > 0.1) {
      const mrnaPts: THREE.Vector3[] = [];
      const mrnaStepCount = Math.max(3, Math.floor(t * 12));

      for (let s = 0; s <= mrnaStepCount; s++) {
        const u = s / mrnaStepCount;
        const x = -8 + u * (polyX - (-8));
        // Exit trajectory: threads down and out towards viewer
        const y = -1.8 - Math.sin(u * Math.PI) * 2.8 - (t >= 0.85 ? u * 3.5 : 0);
        const z = 0.6 + u * 3.2;
        mrnaPts.push(new THREE.Vector3(x, y, z));
      }

      if (mrnaPts.length >= 2) {
        const mrnaCurve = new THREE.CatmullRomCurve3(mrnaPts);
        const mrnaMesh = new THREE.Mesh(
          new THREE.TubeGeometry(mrnaCurve, Math.max(12, mrnaStepCount * 3), 0.28, 12, false),
          new THREE.MeshStandardMaterial({
            color: 0xf43f5e,
            roughness: 0.2,
            metalness: 0.5,
            emissive: 0xe11d48,
            emissiveIntensity: 0.3
          })
        );
        mrnaMesh.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.mrna_transcript };
        group.add(mrnaMesh);

        // Ribonucleotides on mRNA (A, U, G, C) - Uracil clearly shown!
        const rnaBases = ['A', 'U', 'G', 'C', 'A', 'U', 'G', 'C', 'A', 'U'];
        for (let b = 0; b < mrnaStepCount && b < rnaBases.length; b++) {
          const ratio = (b + 0.5) / mrnaStepCount;
          const pt = mrnaCurve.getPoint(ratio);
          const nuChar = rnaBases[b];
          const sprite = createNuSprite(nuChar, {
            size: 1.15,
            depthTest: false,
            bgColor: nuChar === 'U' ? '#ea580c' : undefined,
            borderColor: nuChar === 'U' ? '#fbbf24' : '#ffffff'
          });
          sprite.position.set(pt.x, pt.y + 0.4, pt.z + 0.3);
          sprite.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.mrna_transcript };
          group.add(sprite);
        }
      }
    }

    // Free incoming ribonucleotides floating into entry channel
    if (t < 0.85) {
      const freeRibos = ['U', 'A', 'G', 'C'];
      freeRibos.forEach((r, idx) => {
        const sprite = createNuSprite(r, {
          size: 1.05,
          depthTest: false,
          bgColor: r === 'U' ? '#ea580c' : undefined
        });
        sprite.position.set(
          polyX + 1.8 + idx * 0.9,
          2.6 + (idx % 2) * 1.0,
          1.2 + idx * 0.6
        );
        sprite.userData = { partInfo: TRANSCRIPTION_PARTS_INFO.rna_poly };
        group.add(sprite);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick Step Jump */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Phiên Mã Sinh Học 3D (Tổng Hợp mARN)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kéo thanh trượt để quan sát enzyme RNA Polymerase trượt mở xoắn DNA và chuỗi mARN đơn kéo dài theo NTBS (A-U, T-A, G-C, C-G).
          </p>
        </div>

        {/* Quick Stage Jump Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => { setProgress(12); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStep === 1 ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 1 (12%)</span>
          </button>
          <button
            onClick={() => { setProgress(52); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStep === 2 ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 2 (52%)</span>
          </button>
          <button
            onClick={() => { setProgress(90); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStep === 3 ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 3 (90%)</span>
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
        stages={TRANSCRIPTION_TIMELINE_STAGES}
        currentEventLabel={getTranscriptionEventLabel(progress)}
        accentColor="blue"
        title="Tiến trình phiên mã mARN"
      />

      {/* Main 3D Viewport & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Canvas */}
        <div className={`${inspectedDetail ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-8'} space-y-3 transition-all duration-300`}>
          <div
            className={`relative rounded-3xl border border-slate-300/80 overflow-hidden shadow-xl h-[480px] sm:h-[530px] transition-colors ${
              viewportTheme === 'deep'
                ? 'bg-[#070c18]'
                : 'bg-gradient-to-b from-cyan-50/70 via-white to-sky-100/60'
            }`}
          >
            {/* Scientific HUD Overlay */}
            <div
              className={`absolute top-3 left-3 z-10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1 shadow-md pointer-events-none ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/80 border border-slate-800 text-slate-300'
                  : 'bg-white/85 border border-cyan-100 text-slate-700'
              }`}
            >
              <div className="text-cyan-400 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> THÔNG SỐ PHIÊN MÃ RNA
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Giai đoạn:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>{TRANSCRIPTION_STAGES[activeStep].title.split(': ')[1]}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Chiều tổng hợp:</span>{' '}
                <strong className="text-amber-400">{TRANSCRIPTION_STAGES[activeStep].direction}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Tiến độ:</span>{' '}
                <strong className="text-cyan-400">{progress.toFixed(0)}%</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-cyan-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Nhấp chuột vào RNA Poly, bọt phiên mã, mARN hoặc promoter để <strong>xem chi tiết</strong></span>
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
                    autoRotate ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition-colors"
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
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm" />
                  <h3 className="text-base font-bold text-white">
                    {TRANSCRIPTION_STAGES[activeStep].title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-mono">
                    Enzyme xúc tác chính
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{TRANSCRIPTION_STAGES[activeStep].enzyme}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Chiều xúc tác &amp; mở xoắn
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{TRANSCRIPTION_STAGES[activeStep].direction}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-mono">
                    Diễn biến cơ chế phân tử
                  </span>
                  <p className="leading-relaxed">{TRANSCRIPTION_STAGES[activeStep].details}</p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào khối xanh RNA Polymerase, bọt phiên mã mở xoắn, dải mARN màu đỏ hoặc dải vàng Promoter để xem phân tích chi tiết.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

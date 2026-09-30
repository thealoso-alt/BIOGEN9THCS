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
  Scale
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

interface PhaseDetail {
  id: string;
  name: string;
  nameVi: string;
  events: string;
  chromosomesState: string;
  significance: string;
  stats: {
    totalN: string;
    state: string;
    chromatids: number;
    centromeres: number;
    arrangement: string;
  };
}

const MITOSIS_TIMELINE_STAGES: TimelineStageMarker[] = [
  { id: 'prophase', label: 'Kỳ Đầu (Prophase)', shortLabel: 'Kỳ Đầu (0%)', range: [0, 25], desc: 'NST kép co ngắn, màng nhân tiêu biến, thoi phân bào hình thành.' },
  { id: 'metaphase', label: 'Kỳ Giữa (Metaphase)', shortLabel: 'Kỳ Giữa (26%)', range: [26, 50], desc: 'NST co xoắn cực đại, xếp thành 1 hàng tại mặt phẳng xích đạo.' },
  { id: 'anaphase', label: 'Kỳ Sau (Anaphase)', shortLabel: 'Kỳ Sau (51%)', range: [51, 75], desc: 'Mỗi NST kép tách nhau tại tâm động, 2 NST đơn phân ly về 2 cực.' },
  { id: 'telophase', label: 'Kỳ Cuối (Telophase)', shortLabel: 'Kỳ Cuối (76%)', range: [76, 100], desc: 'NST dãn xoắn, màng nhân tái lập, màng tế bào thắt eo tạo 2 tế bào con.' }
];

const getMitosisEventLabel = (pct: number) => {
  if (pct < 15) return 'Nhiễm sắc thể kép bắt đầu đóng xoắn và co ngắn đặc trưng trong nhân.';
  if (pct < 26) return 'Màng nhân tiêu biến; thoi vô sắc hình thành đính vào tâm động của NST kép.';
  if (pct < 40) return 'Các NST kép di chuyển dần về mặt phẳng xích đạo dưới sức kéo của vi ống.';
  if (pct < 51) return 'NST kép co xoắn cực đại, xếp thành đúng một hàng trên mặt phẳng xích đạo.';
  if (pct < 65) return 'Tâm động tách đôi, 2 nhiễm sắc tử chị em (chromatid) phân ly thành 2 NST đơn.';
  if (pct < 76) return 'Các NST đơn được thoi phân bào kéo trượt nhanh về hai cực đối diện của tế bào.';
  if (pct < 90) return 'Hai bộ NST đơn về tới 2 cực bắt đầu dãn xoắn; màng nhân mới tái hình thành.';
  return 'Eo thắt phân chia tế bào chất hoàn tất, tạo thành 2 tế bào con có bộ NST 2n giống hệt nhau!';
};

const MITOSIS_PHASES: Record<'prophase' | 'metaphase' | 'anaphase' | 'telophase', PhaseDetail> = {
  prophase: {
    id: 'prophase',
    name: 'Prophase',
    nameVi: 'Kỳ Đầu (Prophase)',
    events: 'NST kép bắt đầu co ngắn và cô đặc. Màng nhân và nhân con tiêu biến. Thoi phân bào hình thành nối liền 2 trung thể ở 2 cực tế bào.',
    chromosomesState: '2n kép = 4 NST kép (8 chromatid, 4 tâm động) - Co ngắn',
    significance: 'Chuẩn bị không gian và cấu trúc để các NST di chuyển dễ dàng mà không bị rối.',
    stats: {
      totalN: '2n = 4',
      state: 'Kép',
      chromatids: 8,
      centromeres: 4,
      arrangement: 'Rải rác trong nhân, thoi vô sắc đính dần'
    }
  },
  metaphase: {
    id: 'metaphase',
    name: 'Metaphase',
    nameVi: 'Kỳ Giữa (Metaphase)',
    events: 'Các NST kép co xoắn CỰC ĐẠI, có hình thái và kích thước đặc trưng rõ nét nhất. Tập trung xếp thành MỘT HÀNG trên mặt phẳng xích đạo của thoi phân bào.',
    chromosomesState: '2n kép = 4 NST kép (8 chromatid, 4 tâm động) - Xếp 1 hàng',
    significance: 'Thời điểm lý tưởng nhất để quan sát, đếm và lập bản đồ bộ nhiễm sắc thể (karyotype).',
    stats: {
      totalN: '2n = 4',
      state: 'Kép co xoắn cực đại',
      chromatids: 8,
      centromeres: 4,
      arrangement: 'Xếp thành 1 HÀNG tại mặt phẳng xích đạo'
    }
  },
  anaphase: {
    id: 'anaphase',
    name: 'Anaphase',
    nameVi: 'Kỳ Sau (Anaphase)',
    events: 'Mỗi NST kép tách nhau tại tâm động thành 2 NST đơn riêng biệt. Dưới lực co rút của sợi thoi phân bào, các NST đơn phân ly đều về 2 cực tế bào.',
    chromosomesState: '4n đơn = 8 NST đơn (0 chromatid, 8 tâm động) - Phân ly',
    significance: 'Đảm bảo mỗi tế bào con tương lai sẽ nhận được một bộ NST đơn bội giống hệt nhau.',
    stats: {
      totalN: '4n = 8',
      state: 'Đơn (tâm động tách đôi)',
      chromatids: 0,
      centromeres: 8,
      arrangement: 'Phân ly dạng chữ V về 2 cực'
    }
  },
  telophase: {
    id: 'telophase',
    name: 'Telophase',
    nameVi: 'Kỳ Cuối & Phân Chia Tế Bào Chất',
    events: 'Các NST đơn dãn xoắn dài ra dạng sợi mảnh. Màng nhân và nhân con tái lập. Màng tế bào thắt eo ở giữa chia tế bào chất thành 2 tế bào con có bộ NST 2n giống hệt tế bào mẹ.',
    chromosomesState: 'Mỗi nhân con: 2n đơn = 4 NST đơn (0 chromatid, 4 tâm động)',
    significance: 'Hoàn tất chu kỳ phân bào, duy trì sự ổn định của bộ NST qua các thế hệ tế bào.',
    stats: {
      totalN: '2n = 4 (mỗi nhân con)',
      state: 'Đơn dãn xoắn',
      chromatids: 0,
      centromeres: 4,
      arrangement: 'Tập hợp ở 2 cực, màng nhân tái lập'
    }
  }
};

const MITOSIS_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  spindle_fibers: {
    id: 'spindle_fibers',
    name: 'Thoi Phân Bào (Thoi Vô Sắc)',
    nameEn: 'Mitotic Spindle Microtubules',
    category: 'Bộ máy vận động',
    parentModel: 'Mô Hình Phân Bào Nguyên Phân (Mitosis)',
    structure: 'Hệ thống vi ống protein tubulin hình thoi nối liền giữa 2 trung thể ở 2 cực tế bào.',
    functionRole: 'Bám vào thể động (kinetochore) tại tâm động của NST, co rút và kéo các nhiễm sắc sắc thể di chuyển chính xác về 2 cực tế bào.',
    keyFact: 'Thuốc Colchicine ức chế sự hình thành thoi phân bào, làm NST không phân ly tạo thể đa bội.',
    colorHex: '#38bdf8'
  },
  centriole: {
    id: 'centriole',
    name: 'Trung Thể & Trung Tử Ở 2 Cực',
    nameEn: 'Centrosomes & Centrioles',
    category: 'Cực phân bào',
    parentModel: 'Mô Hình Phân Bào Nguyên Phân (Mitosis)',
    structure: 'Gồm 2 trung tử xếp vuông góc nhau, nhân đôi ở pha S và di chuyển về 2 cực đối diện của tế bào ở kỳ đầu.',
    functionRole: 'Trung tâm tổ chức vi ống (MTOC), phát xạ các sợi thoi vô sắc và sao phân bào (astral rays).',
    keyFact: 'Ở tế bào thực vật bậc cao không có trung tử nhưng vẫn hình thành thoi phân bào bình thường.',
    colorHex: '#f59e0b'
  },
  chromosomes_meta: {
    id: 'chromosomes_meta',
    name: 'NST Kép Xếp Hàng Mặt Phẳng Xích Đạo',
    nameEn: 'Equatorial Metaphase Chromosomes',
    category: 'Trạng thái NST',
    parentModel: 'Mô Hình Phân Bào Nguyên Phân (Mitosis)',
    structure: 'Mỗi NST gồm 2 chromatid dính nhau ở tâm động, đạt độ co xoắn tối đa (dày 1400 nm).',
    functionRole: 'Định vị thẳng hàng trên mặt phẳng xích đạo để đảm bảo lực kéo từ 2 cực phân chia đồng đều tuyệt đối.',
    keyFact: 'Xếp thành đúng 1 hàng (khác với Giảm phân I nơi các NST kép tương đồng xếp thành 2 hàng).',
    colorHex: '#9333ea'
  },
  cleavage_furrow: {
    id: 'cleavage_furrow',
    name: 'Eo Thắt Phân Chia Tế Bào Chất',
    nameEn: 'Cleavage Furrow (Cytokinesis)',
    category: 'Màng tế bào',
    parentModel: 'Mô Hình Phân Bào Nguyên Phân (Mitosis)',
    structure: 'Vòng co rút cấu tạo từ các vi sợi actin và myosin nằm ngay bên dưới màng sinh chất ở xích đạo tế bào.',
    functionRole: 'Co thắt màng từ ngoài vào trong để chia tách khối tế bào chất thành 2 tế bào con độc lập.',
    keyFact: 'Ở tế bào thực vật, do có thành cellulose cứng nên không thắt eo mà hình thành vách ngăn tế bào từ trung tâm ra ngoài.',
    colorHex: '#10b981'
  }
};

export const MitosisModel: React.FC = () => {
  const [progress, setProgress] = useState<number>(38);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewportTheme, setViewportTheme] = useState<'deep' | 'lab'>('deep');
  const [inspectedDetail, setInspectedDetail] = useState<ModelSubpartDetail | null>(null);
  const [hoveredDetail, setHoveredDetail] = useState<ModelSubpartDetail | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const phase: 'prophase' | 'metaphase' | 'anaphase' | 'telophase' =
    progress <= 25 ? 'prophase' : progress <= 50 ? 'metaphase' : progress <= 75 ? 'anaphase' : 'telophase';

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
    playToneEffect(580);
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

  const allPartsList = Object.values(MITOSIS_PARTS_INFO);

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

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.9);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildMitosis3DScene(progress, mainGroup);

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
      buildMitosis3DScene(progress, modelGroupRef.current);
    }
  }, [progress]);

  // Build 3D Mitosis Scene continuously according to progress (0% - 100%)
  const buildMitosis3DScene = (pct: number, group: THREE.Group) => {
    group.clear();
    const t = Math.max(0, Math.min(100, pct)) / 100; // 0.0 to 1.0

    // 1. Cell Membrane & Cleavage Furrow Dynamics
    if (t < 0.65) {
      // Single smooth oval cell
      const cellMesh = new THREE.Mesh(
        new THREE.SphereGeometry(12, 32, 24),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.12,
          roughness: 0.4,
          wireframe: true
        })
      );
      cellMesh.userData = { partInfo: MITOSIS_PARTS_INFO.cleavage_furrow };
      group.add(cellMesh);
    } else {
      // Cleavage furrow in cytokinesis: two budding lobes that pinch at the equator (y = 0)
      const furrowFactor = (t - 0.65) / 0.35; // 0.0 -> 1.0
      const lobeY = 3.5 + furrowFactor * 3.2;
      const lobeRadius = 8.5 - furrowFactor * 0.8;

      const topLobe = new THREE.Mesh(
        new THREE.SphereGeometry(lobeRadius, 24, 20),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.14,
          wireframe: true
        })
      );
      topLobe.position.set(0, lobeY, 0);
      topLobe.userData = { partInfo: MITOSIS_PARTS_INFO.cleavage_furrow };
      group.add(topLobe);

      const botLobe = new THREE.Mesh(
        new THREE.SphereGeometry(lobeRadius, 24, 20),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.14,
          wireframe: true
        })
      );
      botLobe.position.set(0, -lobeY, 0);
      botLobe.userData = { partInfo: MITOSIS_PARTS_INFO.cleavage_furrow };
      group.add(botLobe);

      // Contractile ring at the equator (actin-myosin furrow)
      const ringRadius = Math.max(0.6, 9.5 * (1 - furrowFactor * 0.9));
      const furrowRing = new THREE.Mesh(
        new THREE.TorusGeometry(ringRadius, 0.3, 12, 32),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.2,
          emissive: 0x059669,
          emissiveIntensity: 0.4
        })
      );
      furrowRing.rotation.x = Math.PI / 2;
      furrowRing.userData = { partInfo: MITOSIS_PARTS_INFO.cleavage_furrow };
      group.add(furrowRing);
    }

    // 2. Centrioles & Aster Rays at Two Poles
    const poleY = 9.0;
    const poleTop = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.6 })
    );
    poleTop.position.set(0, poleY, 0);
    poleTop.userData = { partInfo: MITOSIS_PARTS_INFO.centriole };
    group.add(poleTop);

    const poleBot = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.6 })
    );
    poleBot.position.set(0, -poleY, 0);
    poleBot.userData = { partInfo: MITOSIS_PARTS_INFO.centriole };
    group.add(poleBot);

    // Glowing aster rays radiating from centrioles
    for (let r = 0; r < 8; r++) {
      const angle = (r * Math.PI * 2) / 8;
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, poleY, 0),
        new THREE.Vector3(Math.cos(angle) * 2.2, poleY + Math.sin(angle) * 1.5, 0)
      ]);
      const rayLine = new THREE.Line(
        rayGeo,
        new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.4 })
      );
      group.add(rayLine);

      const rayGeo2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -poleY, 0),
        new THREE.Vector3(Math.cos(angle) * 2.2, -poleY - Math.sin(angle) * 1.5, 0)
      ]);
      const rayLine2 = new THREE.Line(
        rayGeo2,
        new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.4 })
      );
      group.add(rayLine2);
    }

    // 3. Prophase Nuclear Envelope (gradually dissolves: 0 -> 25%)
    if (t < 0.25) {
      const nucOpacity = 0.35 * (1 - t / 0.25);
      const nucMembrane = new THREE.Mesh(
        new THREE.SphereGeometry(6.2, 24, 20),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: nucOpacity,
          roughness: 0.3
        })
      );
      group.add(nucMembrane);
    }

    // 4. Telophase Daughter Nuclear Envelopes (gradually form: 75% -> 100%)
    if (t > 0.75) {
      const nucOpacity = 0.38 * ((t - 0.75) / 0.25);
      const topNuc = new THREE.Mesh(
        new THREE.SphereGeometry(4.2, 20, 16),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: nucOpacity,
          roughness: 0.3
        })
      );
      topNuc.position.set(0, 6.2, 0);
      group.add(topNuc);

      const botNuc = new THREE.Mesh(
        new THREE.SphereGeometry(4.2, 20, 16),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: nucOpacity,
          roughness: 0.3
        })
      );
      botNuc.position.set(0, -6.2, 0);
      group.add(botNuc);
    }

    // 5. Four Chromosome Pairs (2 Large purple, 2 Medium pink)
    const chromoMetaPositions = [-4.5, -1.5, 1.5, 4.5];
    const chromoColors = [0x9333ea, 0xec4899, 0x9333ea, 0xec4899];
    const chromoSizes = [3.6, 2.8, 3.6, 2.8];

    chromoMetaPositions.forEach((xAlign, idx) => {
      const chromColor = chromoColors[idx];
      const armLength = chromoSizes[idx];

      if (t <= 0.25) {
        // --- PROPHASE (0% - 25%): Chromosomes condense from scattered positions toward equator
        const u = t / 0.25; // 0.0 -> 1.0
        const startX = (idx - 1.5) * 3.5 + Math.sin(idx * 2) * 1.5;
        const startY = Math.cos(idx * 1.8) * 3.2;
        const curX = startX + (xAlign - startX) * u;
        const curY = startY + (0 - startY) * u;
        const curRot = (1 - u) * (idx * 0.8 + 0.4);

        // Chromosome X shape
        const arm1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, armLength, 14),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
        );
        arm1.position.set(curX, curY, 0);
        arm1.rotation.z = Math.PI / 4 + curRot;
        arm1.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(arm1);

        const arm2 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, armLength, 14),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
        );
        arm2.position.set(curX, curY, 0);
        arm2.rotation.z = -Math.PI / 4 + curRot;
        arm2.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(arm2);

        // Centromere dot
        const centDot = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 })
        );
        centDot.position.set(curX, curY, 0);
        centDot.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(centDot);

      } else if (t <= 0.50) {
        // --- METAPHASE (26% - 50%): Aligned precisely on equator (y = 0), maximum coiling
        const arm1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.42, armLength, 16),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3, metalness: 0.2 })
        );
        arm1.position.set(xAlign, 0, 0);
        arm1.rotation.z = Math.PI / 4;
        arm1.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(arm1);

        const arm2 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.42, armLength, 16),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3, metalness: 0.2 })
        );
        arm2.position.set(xAlign, 0, 0);
        arm2.rotation.z = -Math.PI / 4;
        arm2.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(arm2);

        // Kinetochore / Centromere dot
        const centDot = new THREE.Mesh(
          new THREE.SphereGeometry(0.55, 14, 14),
          new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            roughness: 0.2,
            emissive: 0xeab308,
            emissiveIntensity: 0.3
          })
        );
        centDot.position.set(xAlign, 0, 0);
        centDot.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(centDot);

        // Kinetochore spindle fibers anchored directly to poles
        const fibTop = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, poleY, 0),
          new THREE.Vector3(xAlign, 0, 0)
        ]);
        group.add(
          new THREE.Line(
            fibTop,
            new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
          )
        );

        const fibBot = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -poleY, 0),
          new THREE.Vector3(xAlign, 0, 0)
        ]);
        group.add(
          new THREE.Line(
            fibBot,
            new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
          )
        );

      } else if (t <= 0.75) {
        // --- ANAPHASE (51% - 75%): Centromeres split! V-shaped daughter chromosomes glide to poles
        const u = (t - 0.50) / 0.25; // 0.0 -> 1.0
        const yTop = u * 6.0;
        const yBot = -u * 6.0;

        // Dynamic V-shape trailing arms: vertex at y, arms drag backwards
        // Top V (Vertex at yTop pointing UP toward pole):
        const leftArmPtsTop = [
          new THREE.Vector3(xAlign, yTop, 0),
          new THREE.Vector3(xAlign - 0.8, yTop - armLength * 0.45, 0)
        ];
        const rightArmPtsTop = [
          new THREE.Vector3(xAlign, yTop, 0),
          new THREE.Vector3(xAlign + 0.8, yTop - armLength * 0.45, 0)
        ];
        const leftMeshTop = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftArmPtsTop), 8, 0.36, 10, false),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
        );
        leftMeshTop.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(leftMeshTop);

        const rightMeshTop = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightArmPtsTop), 8, 0.36, 10, false),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
        );
        rightMeshTop.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(rightMeshTop);

        // Kinetochore dot at vertex
        const centTop = new THREE.Mesh(
          new THREE.SphereGeometry(0.48, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 })
        );
        centTop.position.set(xAlign, yTop, 0);
        centTop.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(centTop);

        // Shortening spindle fiber pulling top kinetochore
        const fibTop = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, poleY, 0),
          new THREE.Vector3(xAlign, yTop, 0)
        ]);
        group.add(
          new THREE.Line(
            fibTop,
            new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
          )
        );

        // Bottom V (Vertex at yBot pointing DOWN toward pole):
        const leftArmPtsBot = [
          new THREE.Vector3(xAlign, yBot, 0),
          new THREE.Vector3(xAlign - 0.8, yBot + armLength * 0.45, 0)
        ];
        const rightArmPtsBot = [
          new THREE.Vector3(xAlign, yBot, 0),
          new THREE.Vector3(xAlign + 0.8, yBot + armLength * 0.45, 0)
        ];
        const leftMeshBot = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftArmPtsBot), 8, 0.36, 10, false),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
        );
        leftMeshBot.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(leftMeshBot);

        const rightMeshBot = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightArmPtsBot), 8, 0.36, 10, false),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.3 })
        );
        rightMeshBot.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(rightMeshBot);

        const centBot = new THREE.Mesh(
          new THREE.SphereGeometry(0.48, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 })
        );
        centBot.position.set(xAlign, yBot, 0);
        centBot.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(centBot);

        const fibBot = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -poleY, 0),
          new THREE.Vector3(xAlign, yBot, 0)
        ]);
        group.add(
          new THREE.Line(
            fibBot,
            new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
          )
        );

      } else {
        // --- TELOPHASE (76% - 100%): Chromosomes cluster at poles and decondense into chromatin
        const u = (t - 0.75) / 0.25; // 0.0 -> 1.0
        const yTop = 6.2 + u * 0.5;
        const yBot = -6.2 - u * 0.5;
        const decondenseSpread = 0.5 + u * 1.5;

        // Upper chromosome thread
        const topPts = [
          new THREE.Vector3(xAlign * 0.7, yTop - decondenseSpread, Math.sin(idx) * 0.8),
          new THREE.Vector3(xAlign * 0.7 + Math.sin(idx * 2) * 0.6, yTop, 0),
          new THREE.Vector3(xAlign * 0.7, yTop + decondenseSpread, Math.cos(idx) * 0.8)
        ];
        const topThread = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(topPts), 12, 0.28, 8, false),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.4 })
        );
        topThread.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(topThread);

        // Lower chromosome thread
        const botPts = [
          new THREE.Vector3(xAlign * 0.7, yBot - decondenseSpread, Math.sin(idx) * 0.8),
          new THREE.Vector3(xAlign * 0.7 + Math.sin(idx * 2) * 0.6, yBot, 0),
          new THREE.Vector3(xAlign * 0.7, yBot + decondenseSpread, Math.cos(idx) * 0.8)
        ];
        const botThread = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(botPts), 12, 0.28, 8, false),
          new THREE.MeshStandardMaterial({ color: chromColor, roughness: 0.4 })
        );
        botThread.userData = { partInfo: MITOSIS_PARTS_INFO.chromosomes_meta };
        group.add(botThread);
      }
    });

    // 6. Polar non-kinetochore fibers connecting poles through center (in prophase/metaphase/early anaphase)
    if (t < 0.75) {
      [-2.5, 2.5].forEach((fx) => {
        const fiberPts = [
          new THREE.Vector3(0, poleY, 0),
          new THREE.Vector3(fx * 2.8, 0, 1.5),
          new THREE.Vector3(0, -poleY, 0)
        ];
        const polarFiber = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fiberPts), 16, 0.08, 6, false),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
        );
        polarFiber.userData = { partInfo: MITOSIS_PARTS_INFO.spindle_fibers };
        group.add(polarFiber);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Phân Bào Nguyên Phân 3D (Mitosis)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kéo thanh trượt tiến trình mượt mà để quan sát liên tục 4 kỳ phân chia: Kỳ đầu ──→ Kỳ giữa ──→ Kỳ sau ──→ Kỳ cuối &amp; Phân chia tế bào chất
          </p>
        </div>

        {/* Action Buttons: Compare Mitosis & Meiosis + Quick Phase Select */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-pink-500/10 to-purple-500/10 hover:from-sky-500/20 hover:to-pink-500/20 border border-sky-300/80 text-sky-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="Mở bảng so sánh chuyên sâu Nguyên phân vs Giảm phân"
          >
            <Scale className="h-4 w-4 text-sky-600" />
            <span>So sánh với Giảm phân</span>
          </button>
        </div>
      </div>

      {/* Phase Quick Jump Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
          Chuyển nhanh kỳ:
        </span>
        {[
          { id: 'prophase', label: '1. Kỳ Đầu (12%)', pct: 12 },
          { id: 'metaphase', label: '2. Kỳ Giữa (38%)', pct: 38 },
          { id: 'anaphase', label: '3. Kỳ Sau (63%)', pct: 63 },
          { id: 'telophase', label: '4. Kỳ Cuối (88%)', pct: 88 }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => {
              setProgress(p.pct);
              setInspectedDetail(null);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              phase === p.id
                ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{p.label}</span>
          </button>
        ))}
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
        stages={MITOSIS_TIMELINE_STAGES}
        currentEventLabel={getMitosisEventLabel(progress)}
        accentColor="blue"
        title="Tiến trình nguyên phân (Mitosis)"
      />

      {/* Real-time Biological Chromosome HUD Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs">
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-sky-400 font-mono block">Kỳ phân bào:</span>
          <strong className="text-white text-[12px] block truncate">
            {MITOSIS_PHASES[phase].nameVi}
          </strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-sky-400 font-mono block">Số NST:</span>
          <strong className="text-white text-[12px] block truncate">
            {MITOSIS_PHASES[phase].stats.totalN}
          </strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-amber-400 font-mono block">Trạng thái NST:</span>
          <strong className="text-amber-300 text-[12px] block truncate">
            {MITOSIS_PHASES[phase].stats.state}
          </strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-purple-400 font-mono block">Chromatid:</span>
          <strong className="text-purple-300 text-[12px] block">
            {MITOSIS_PHASES[phase].stats.chromatids} sợi
          </strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-emerald-400 font-mono block">Tâm động:</span>
          <strong className="text-emerald-300 text-[12px] block">
            {MITOSIS_PHASES[phase].stats.centromeres} điểm
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
                : 'bg-gradient-to-b from-sky-50/70 via-white to-purple-100/40'
            }`}
          >
            {/* Scientific HUD Overlay */}
            <div
              className={`absolute top-3 left-3 z-10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1 shadow-md pointer-events-none ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/80 border border-slate-800 text-slate-300'
                  : 'bg-white/85 border border-sky-100 text-slate-700'
              }`}
            >
              <div className="text-sky-400 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> NGUYÊN PHÂN 3D
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Kỳ phân bào:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>{MITOSIS_PHASES[phase].nameVi}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Trạng thái NST:</span>{' '}
                <strong className="text-purple-400">{MITOSIS_PHASES[phase].chromosomesState}</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-sky-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>Nhấp chuột vào NST, sợi thoi vô sắc, trung tử hoặc màng tế bào để <strong>xem chi tiết</strong></span>
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
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewportTheme(t => (t === 'deep' ? 'lab' : 'deep'))}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
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
                  <div className="w-3 h-3 rounded-full bg-sky-400 shadow-sm" />
                  <h3 className="text-base font-bold text-white">
                    {MITOSIS_PHASES[phase].nameVi}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-mono">
                    Diễn biến sự kiện chính
                  </span>
                  <p className="leading-relaxed">{MITOSIS_PHASES[phase].events}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Trạng thái nhiễm sắc thể
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{MITOSIS_PHASES[phase].chromosomesState}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-mono">
                    Ý nghĩa sinh học
                  </span>
                  <p className="leading-relaxed">{MITOSIS_PHASES[phase].significance}</p>
                </div>

                <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 text-sky-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào các thanh NST tím/hồng, sợi thoi xanh hay trung tử vàng để mở thẻ phân tích chi tiết.
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
        initialTopic="mitosis"
      />
    </div>
  );
};

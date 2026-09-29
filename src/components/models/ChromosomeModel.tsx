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
  NU_COLORS
} from './ModelInspectionHUD';

interface ChromosomeLevel {
  id: string;
  name: string;
  nameVi: string;
  diameter: string;
  structure: string;
  role: string;
}

const CHROMO_LEVELS: Record<'x_shape' | 'nucleosome' | 'fiber_30' | 'dna_helix', ChromosomeLevel> = {
  x_shape: {
    id: 'x_shape',
    name: 'Metaphase Chromosome',
    nameVi: 'NST Kép Hình Chữ X (Kỳ Giữa)',
    diameter: '1400 nm (mỗi cromatit 700 nm)',
    structure: 'Gồm 2 chromatid chị em giống hệt nhau, dính nhau ở tâm động (centromere) và bảo vệ bởi 2 đầu mút (telomere). Đây là lúc NST co xoắn cực đại, có hình thái rõ nét nhất.',
    role: 'Giúp phân chia vật chất di truyền đồng đều và chính xác về hai tế bào con trong quá trình phân bào.'
  },
  nucleosome: {
    id: 'nucleosome',
    name: 'Nucleosome Core',
    nameVi: 'Đơn Vị Cấu Trúc Nucleosome',
    diameter: '11 nm',
    structure: 'Gồm một lõi gồm 8 phân tử protein Histone (octamer: 2 H2A, 2 H2B, 2 H3, 2 H4) được một đoạn DNA dài khoảng 146 cặp nucleotide quấn quanh 1 ¾ vòng.',
    role: 'Gói gọn phân tử DNA dài hàng mét vào không gian nhân tế bào chỉ vài micromet.'
  },
  fiber_30: {
    id: 'fiber_30',
    name: 'Solenoid Fiber',
    nameVi: 'Sợi Nhiễm Sắc & Vùng Siêu Xoắn',
    diameter: '30 nm → 300 nm',
    structure: 'Các hạt nucleosome xếp cuộn xoắn lại nhờ liên kết với Histone H1 tạo thành sợi chất nhiễm sắc (30 nm), sau đó cuộn gập thành các quai lặp (300 nm).',
    role: 'Nâng cao mức độ cô đặc vật chất di truyền trước khi bước vào phân bào.'
  },
  dna_helix: {
    id: 'dna_helix',
    name: 'DNA Double Helix',
    nameVi: 'Sợi Phân Tử DNA Kép 2.0 nm',
    diameter: '2.0 nm (20 Å)',
    structure: 'Chuỗi xoắn kép gồm 2 mạch polynucleotide đối song song theo mô hình Watson - Crick mang toàn bộ thông tin di truyền.',
    role: 'Lưu trữ và bảo quản thông tin di truyền của loài.'
  }
};

const CHROMO_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  centromere: {
    id: 'centromere',
    name: 'Tâm Động (Centromere) & Thể Động',
    nameEn: 'Centromere & Kinetochore',
    category: 'Vùng eo thắt NST',
    parentModel: 'Mô Hình Nhiễm Sắc Thể 3D',
    structure: 'Vị trí eo thắt sơ cấp (primary constriction) chứa phức hợp protein thể động (kinetochore) đính 2 chromatid chị em với nhau.',
    functionRole: 'Điểm bám của các vi ống thoi phân bào giúp kéo các chromatid chị em phân ly chính xác về 2 cực tế bào trong nguyên phân và giảm phân.',
    keyFact: 'Nếu NST mất tâm động sẽ không di chuyển được trong phân bào và bị tiêu biến trong tế bào chất.',
    colorHex: '#ec4899'
  },
  telomere: {
    id: 'telomere',
    name: 'Đầu Mút Nhiễm Sắc Thể (Telomere)',
    nameEn: 'Telomere Caps',
    category: 'Vùng tận cùng NST',
    parentModel: 'Mô Hình Nhiễm Sắc Thể 3D',
    structure: 'Trình tự nucleotide lặp lại đặc thù (ở động vật có vú là TTAGGG) kết hợp với phức hợp protein shelterin bao bọc hai đầu tận cùng.',
    functionRole: 'Bảo vệ phân tử DNA không bị thoái hóa, ngăn chặn các NST dính vào nhau và đóng vai trò đồng hồ sinh học đếm số lần phân bào.',
    keyFact: 'Mỗi lần phân bào telomere bị ngắn lại một đoạn; enzyme telomerase hoạt động mạnh ở tế bào gốc và tế bào ung thư để duy trì telomere.',
    colorHex: '#38bdf8'
  },
  chromatid: {
    id: 'chromatid',
    name: 'Nhiễm Sắc Tử Chị Em (Sister Chromatid)',
    nameEn: 'Sister Chromatids',
    category: 'Nhánh nhiễm sắc',
    parentModel: 'Mô Hình Nhiễm Sắc Thể 3D',
    structure: 'Mỗi NST kép gồm 2 chromatid giống hệt nhau sinh ra từ sự tự nhân đôi của DNA ở pha S của chu kỳ tế bào.',
    functionRole: 'Mang bản sao nguyên vẹn của thông tin di truyền để sẵn sàng phân chia đồng đều cho 2 tế bào con ở kỳ sau.',
    keyFact: 'Đường kính mỗi chromatid ở kỳ giữa đạt khoảng 700 nm, tạo độ cô đặc vật chất di truyền cực đại (gấp 10.000 lần chiều dài DNA thẳng).',
    colorHex: '#9333ea'
  },
  nucleosome_core: {
    id: 'nucleosome_core',
    name: 'Hạt Nucleosome & Bát Tử Histone',
    nameEn: 'Nucleosome Histone Core',
    category: 'Đơn vị cấu trúc siêu hiển vi',
    parentModel: 'Mô Hình Nhiễm Sắc Thể 3D',
    structure: 'Lõi gồm 8 phân tử protein Histone (2 H2A, 2 H2B, 2 H3, 2 H4) được một đoạn DNA dài khoảng 146 cặp nucleotide quấn quanh 1 ¾ vòng.',
    functionRole: 'Đơn vị đóng gói cơ bản nhất của chất nhiễm sắc, giúp giảm chiều dài phân tử DNA xuống khoảng 7 lần.',
    keyFact: 'Protein Histone tích điện dương mạnh nhờ giàu lysine và arginine, liên kết chặt chẽ với khung phosphate tích điện âm của DNA.',
    colorHex: '#10b981'
  },
  linker_dna: {
    id: 'linker_dna',
    name: 'Đoạn DNA Nối & Histone H1',
    nameEn: 'Linker DNA & Histone H1',
    category: 'Đoạn nối liên hạt',
    parentModel: 'Mô Hình Nhiễm Sắc Thể 3D',
    structure: 'Đoạn DNA dài khoảng 15 - 55 cặp nucleotide nối giữa 2 hạt nucleosome liên tiếp, được khóa cố định bởi phân tử Histone H1.',
    functionRole: 'Giúp chuỗi nucleosome dạng "chuỗi hạt cườm" cuộn xoắn tiếp thành sợi nhiễm sắc 30 nm (solenoid fiber).',
    keyFact: 'Histone H1 đóng vai trò như chiếc kẹp khóa giữ cho vòng xoắn DNA không bị tuột khỏi lõi bát tử.',
    colorHex: '#f59e0b'
  }
};

export const ChromosomeModel: React.FC = () => {
  const [viewMode, setViewMode] = useState<'x_shape' | 'nucleosome' | 'fiber_30' | 'dna_helix'>('x_shape');
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewportTheme, setViewportTheme] = useState<'deep' | 'lab'>('deep');
  const [inspectedDetail, setInspectedDetail] = useState<ModelSubpartDetail | null>(null);
  const [hoveredDetail, setHoveredDetail] = useState<ModelSubpartDetail | null>(null);

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

  const handleSelectDetail = (detail: ModelSubpartDetail) => {
    setAutoRotate(false);
    autoRotateRef.current = false;
    setInspectedDetail(detail);
    playToneEffect(560);
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

  const allPartsList = Object.values(CHROMO_PARTS_INFO);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xa855f7, 1.2);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildChromosome3DScene(viewMode, mainGroup);

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
  }, [viewMode]);

  // Build 3D Chromosome Scenes with rich interactive UserData
  const buildChromosome3DScene = (mode: 'x_shape' | 'nucleosome' | 'fiber_30' | 'dna_helix', group: THREE.Group) => {
    group.clear();

    if (mode === 'x_shape') {
      // 1. Metaphase X-shaped Duplicated Chromosome 3D
      // Chromatid 1 (Left arm)
      const c1Pts = [
        new THREE.Vector3(-4, 9, 0),
        new THREE.Vector3(-1.8, 4, 0.4),
        new THREE.Vector3(0, 0, 0), // Centromere
        new THREE.Vector3(-2.2, -5, 0.4),
        new THREE.Vector3(-4.5, -10, 0)
      ];
      // Chromatid 2 (Right arm)
      const c2Pts = [
        new THREE.Vector3(4, 9, 0),
        new THREE.Vector3(1.8, 4, 0.4),
        new THREE.Vector3(0, 0, 0), // Centromere
        new THREE.Vector3(2.2, -5, 0.4),
        new THREE.Vector3(4.5, -10, 0)
      ];

      const c1Curve = new THREE.CatmullRomCurve3(c1Pts);
      const c2Curve = new THREE.CatmullRomCurve3(c2Pts);

      const armMat = new THREE.MeshStandardMaterial({
        color: 0x9333ea,
        roughness: 0.35,
        metalness: 0.3
      });

      const m1 = new THREE.Mesh(new THREE.TubeGeometry(c1Curve, 40, 1.4, 16, false), armMat);
      const m2 = new THREE.Mesh(new THREE.TubeGeometry(c2Curve, 40, 1.4, 16, false), armMat);
      m1.userData = { partInfo: CHROMO_PARTS_INFO.chromatid };
      m2.userData = { partInfo: CHROMO_PARTS_INFO.chromatid };
      group.add(m1);
      group.add(m2);

      // Centromere constriction node
      const centromereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2, metalness: 0.6 })
      );
      centromereMesh.position.set(0, 0, 0);
      centromereMesh.userData = { partInfo: CHROMO_PARTS_INFO.centromere };
      group.add(centromereMesh);

      // Telomeres (Caps on 4 ends) in bright cyan
      const endPositions = [
        new THREE.Vector3(-4, 9, 0),
        new THREE.Vector3(4, 9, 0),
        new THREE.Vector3(-4.5, -10, 0),
        new THREE.Vector3(4.5, -10, 0)
      ];
      endPositions.forEach(p => {
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.5 })
        );
        cap.position.copy(p);
        cap.userData = { partInfo: CHROMO_PARTS_INFO.telomere };
        group.add(cap);
      });

    } else if (mode === 'nucleosome') {
      // 2. Nucleosome Core (Histone Octamer + DNA wrapping 1.75 turns)
      const octamerGroup = new THREE.Group();
      const histoneColors = [0xec4899, 0xa855f7, 0x3b82f6, 0x10b981];
      for (let layer = 0; layer < 2; layer++) {
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const hSphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.6, 20, 20),
            new THREE.MeshStandardMaterial({ color: histoneColors[i], roughness: 0.3 })
          );
          hSphere.position.set(Math.cos(angle) * 1.8, (layer - 0.5) * 2.2, Math.sin(angle) * 1.8);
          hSphere.userData = { partInfo: CHROMO_PARTS_INFO.nucleosome_core };
          octamerGroup.add(hSphere);
        }
      }
      group.add(octamerGroup);

      // DNA wrap around core (1.75 turns)
      const wrapPts: THREE.Vector3[] = [];
      const turns = 1.75;
      const totalPts = 60;
      for (let i = 0; i <= totalPts; i++) {
        const t = (i / totalPts) * turns * Math.PI * 2;
        const x = Math.cos(t) * 3.8;
        const y = (i / totalPts) * 3.5 - 1.75;
        const z = Math.sin(t) * 3.8;
        wrapPts.push(new THREE.Vector3(x, y, z));
      }
      // Entry & Exit strands
      wrapPts.unshift(new THREE.Vector3(-7, -3.5, 4));
      wrapPts.push(new THREE.Vector3(7, 3.5, 4));

      const wrapCurve = new THREE.CatmullRomCurve3(wrapPts);
      const dnaWrap = new THREE.Mesh(
        new THREE.TubeGeometry(wrapCurve, 70, 0.45, 12, false),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.5 })
      );
      dnaWrap.userData = { partInfo: CHROMO_PARTS_INFO.linker_dna };
      group.add(dnaWrap);

    } else if (mode === 'fiber_30') {
      // 3. Solenoid 30nm Fiber (Helical array of nucleosomes)
      for (let i = 0; i < 18; i++) {
        const t = i * 0.7;
        const x = Math.cos(t) * 4.2;
        const y = (i - 9) * 1.2;
        const z = Math.sin(t) * 4.2;

        const nMesh = new THREE.Mesh(
          new THREE.SphereGeometry(1.3, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 })
        );
        nMesh.position.set(x, y, z);
        nMesh.userData = { partInfo: CHROMO_PARTS_INFO.nucleosome_core };
        group.add(nMesh);
      }
    } else {
      // 4. DNA Double Helix 2nm with clear Nucleotide Base Pairs (A-T, G-C)
      const pts1: THREE.Vector3[] = [];
      const pts2: THREE.Vector3[] = [];
      const pairs = [
        { left: 'A', right: 'T' },
        { left: 'T', right: 'A' },
        { left: 'G', right: 'C' },
        { left: 'C', right: 'G' },
        { left: 'A', right: 'T' },
        { left: 'G', right: 'C' },
        { left: 'T', right: 'A' },
        { left: 'C', right: 'G' },
        { left: 'A', right: 'T' },
        { left: 'G', right: 'C' },
        { left: 'T', right: 'A' },
        { left: 'C', right: 'G' },
      ];

      for (let i = 0; i < 24; i++) {
        const a = i * 0.55;
        const y = (i - 12) * 1.0;
        const x1 = Math.cos(a) * 3.2;
        const z1 = Math.sin(a) * 3.2;
        const x2 = Math.cos(a + Math.PI) * 3.2;
        const z2 = Math.sin(a + Math.PI) * 3.2;

        pts1.push(new THREE.Vector3(x1, y, z1));
        pts2.push(new THREE.Vector3(x2, y, z2));

        if (i % 2 === 0 && i / 2 < pairs.length) {
          const pair = pairs[i / 2];

          // Left base sprite
          const s1 = createNuSprite(pair.left, { size: 1.15, depthTest: false });
          s1.position.set(x1 * 0.65, y, z1 * 0.65);
          s1.userData = { partInfo: CHROMO_PARTS_INFO.linker_dna };
          group.add(s1);

          // Right base sprite
          const s2 = createNuSprite(pair.right, { size: 1.15, depthTest: false });
          s2.position.set(x2 * 0.65, y, z2 * 0.65);
          s2.userData = { partInfo: CHROMO_PARTS_INFO.linker_dna };
          group.add(s2);

          // Connecting hydrogen bond line
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1 * 0.5, y, z1 * 0.5),
            new THREE.Vector3(x2 * 0.5, y, z2 * 0.5)
          ]);
          const lineMat = new THREE.LineDashedMaterial({
            color: 0xfacc15,
            dashSize: 0.15,
            gapSize: 0.1,
          });
          const line = new THREE.Line(lineGeo, lineMat);
          line.computeLineDistances();
          group.add(line);
        }
      }
      const c1 = new THREE.CatmullRomCurve3(pts1);
      const c2 = new THREE.CatmullRomCurve3(pts2);
      const m1 = new THREE.Mesh(new THREE.TubeGeometry(c1, 50, 0.28, 12, false), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
      const m2 = new THREE.Mesh(new THREE.TubeGeometry(c2, 50, 0.28, 12, false), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      m1.userData = { partInfo: CHROMO_PARTS_INFO.linker_dna };
      m2.userData = { partInfo: CHROMO_PARTS_INFO.linker_dna };
      group.add(m1);
      group.add(m2);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Nhiễm Sắc Thể 3D (Cấu Trúc Siêu Hiển Vi)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khảo sát các mức cuộn xoắn từ DNA (2nm) ──→ Nucleosome (11nm) ──→ Sợi 30nm ──→ NST Kép hình chữ X (1400nm)
          </p>
        </div>

        {/* Level Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          {[
            { id: 'x_shape', label: '1. NST Kép Chữ X' },
            { id: 'nucleosome', label: '2. Hạt Nucleosome' },
            { id: 'fiber_30', label: '3. Sợi Cuộn 30nm' },
            { id: 'dna_helix', label: '4. Sợi DNA 2nm' }
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => {
                setViewMode(lvl.id as any);
                setInspectedDetail(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                viewMode === lvl.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{lvl.label}</span>
            </button>
          ))}
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
                : 'bg-gradient-to-b from-purple-50/60 via-white to-purple-100/40'
            }`}
          >
            {/* Scientific HUD Overlay */}
            <div
              className={`absolute top-3 left-3 z-10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1 shadow-md pointer-events-none ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/80 border border-slate-800 text-slate-300'
                  : 'bg-white/85 border border-purple-100 text-slate-700'
              }`}
            >
              <div className="text-purple-400 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> CẤU TRÚC SIÊU HIỂN VI NST
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Mức cuộn xoắn:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>{CHROMO_LEVELS[viewMode].nameVi}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Đường kính không gian:</span>{' '}
                <strong className="text-purple-400">{CHROMO_LEVELS[viewMode].diameter}</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-purple-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Nhấp chuột vào tâm động hồng, đầu mút xanh hoặc chromatid để <strong>xem chi tiết</strong></span>
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
                    autoRotate ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
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
                  <div className="w-3 h-3 rounded-full bg-purple-400 shadow-sm" />
                  <h3 className="text-base font-bold text-white">
                    {CHROMO_LEVELS[viewMode].nameVi}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-purple-400 uppercase tracking-wider block font-mono">
                    Đường kính không gian
                  </span>
                  <p className="text-white font-semibold">{CHROMO_LEVELS[viewMode].diameter}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Cấu trúc chi tiết
                  </span>
                  <p className="leading-relaxed">{CHROMO_LEVELS[viewMode].structure}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-mono">
                    Chức năng sinh học
                  </span>
                  <p className="leading-relaxed">{CHROMO_LEVELS[viewMode].role}</p>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào bất kỳ phần nào trên mô hình 3D (tâm động, đầu mút, cromatit...) để mở thẻ phân tích cấu tạo &amp; vai trò sinh học.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

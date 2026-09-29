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
  AlertTriangle
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

interface MutationTypeInfo {
  id: string;
  name: string;
  nameVi: string;
  effectLength: string;
  effectHBonds: string;
  effectReadingFrame: string;
  consequences: string;
}

const MUTATIONS: Record<'sub' | 'del' | 'ins', MutationTypeInfo> = {
  sub: {
    id: 'sub',
    name: 'Substitution',
    nameVi: 'Đột Biến Thay Thế 1 Cặp Nucleotide',
    effectLength: 'Chiều dài không đổi (L không đổi)',
    effectHBonds: 'Thay đổi (tăng 1 lk nếu A-T → G-C; giảm 1 lk nếu G-C → A-T)',
    effectReadingFrame: 'Chỉ ảnh hưởng tới 1 bộ ba chứa cặp Nu bị thay thế',
    consequences: 'Có thể là đột biến đồng nghĩa (không đổi axit amin), đột biến sai nghĩa (thay 1 axit amin), hoặc đột biến vô nghĩa (tạo codon kết thúc sớm làm chuỗi ngắn lại).'
  },
  del: {
    id: 'del',
    name: 'Deletion',
    nameVi: 'Đột Biến Mất 1 Cặp Nucleotide',
    effectLength: 'Giảm 3.4 Å (0.34 nm), mất 2 Nu',
    effectHBonds: 'Giảm 2 (nếu mất A-T) hoặc giảm 3 (nếu mất G-C)',
    effectReadingFrame: 'Dịch khung đọc dịch mã từ vị trí đột biến về sau',
    consequences: 'Thay đổi toàn bộ trình tự axit amin từ điểm đột biến đến cuối chuỗi polypeptide, thường làm mất hoàn toàn hoạt tính sinh học của protein.'
  },
  ins: {
    id: 'ins',
    name: 'Insertion',
    nameVi: 'Đột Biến Thêm 1 Cặp Nucleotide',
    effectLength: 'Tăng thêm 3.4 Å (0.34 nm), thêm 2 Nu',
    effectHBonds: 'Tăng 2 (nếu thêm A-T) hoặc tăng 3 (nếu thêm G-C)',
    effectReadingFrame: 'Dịch khung đọc dịch mã từ vị trí đột biến về sau',
    consequences: 'Làm xáo trộn trật tự đọc codon từ điểm thêm đến hết gen, thường dẫn đến chuỗi polypeptide dị thường hoặc kết thúc sớm.'
  }
};

const GENE_MUTATION_PARTS: Record<string, ModelSubpartDetail> = {
  mutated_pair: {
    id: 'mutated_pair',
    name: 'Vị Trí Cặp Nucleotide Đột Biến',
    nameEn: 'Mutated Base Pair Locus',
    category: 'Vùng biến đổi gen',
    parentModel: 'Mô Hình Đột Biến Gen 3D',
    structure: 'Vị trí một cặp base bị thay thế bằng cặp khác, hoặc bị mất đi, hoặc được chèn thêm vào chuỗi xoắn kép.',
    functionRole: 'Làm biến đổi trật tự nucleotide trên mạch gốc gen, từ đó thay đổi codon trên mARN và có thể biến đổi amino acid trên protein.',
    keyFact: 'Đột biến điểm (point mutation) chỉ liên quan đến 1 cặp nucleotide duy nhất.',
    colorHex: '#ef4444'
  },
  normal_pair: {
    id: 'normal_pair',
    name: 'Cặp Nucleotide Bình Thường (A-T / G-C)',
    nameEn: 'Wild-Type Base Pair',
    category: 'Trình tự nguyên bản',
    parentModel: 'Mô Hình Đột Biến Gen 3D',
    structure: 'Các cặp base bắt cặp đúng theo nguyên tắc bổ sung (A liên kết T bằng 2 lk H, G liên kết C bằng 3 lk H).',
    functionRole: 'Bảo tồn thông tin di truyền nguyên bản của gen bình thường (kiểu dại).',
    keyFact: 'Giữ cho đường kính phân tử DNA luôn không đổi bằng đúng 2.0 nm (20 Å).',
    colorHex: '#0284c7'
  },
  reading_frame: {
    id: 'reading_frame',
    name: 'Khung Đọc Dịch Mã (Reading Frame)',
    nameEn: 'Triplet Reading Frame',
    category: 'Quy tắc dịch mã',
    parentModel: 'Mô Hình Đột Biến Gen 3D',
    structure: 'Tập hợp các bộ ba nucleotide kế tiếp nhau liên tục, không gối lên nhau bắt đầu từ codon mở đầu.',
    functionRole: 'Quy định trật tự chính xác của từng amino acid; đột biến mất hoặc thêm làm dịch khung đọc (frameshift).',
    keyFact: 'Đột biến mất/thêm 1 hoặc 2 cặp Nu gây dịch khung nghiêm trọng; mất/thêm 3 cặp Nu chỉ làm mất/thêm 1 amino acid.',
    colorHex: '#f59e0b'
  },
  dna_backbone: {
    id: 'dna_backbone',
    name: 'Khung Đường - Phosphate DNA',
    nameEn: 'Sugar-Phosphate Backbone',
    category: 'Khung phân tử',
    parentModel: 'Mô Hình Đột Biến Gen 3D',
    structure: 'Chuỗi liên kết phosphodiester giữa đường Deoxyribose (C₅H₁₀O₄) và gốc Phosphate (PO₄³⁻).',
    functionRole: 'Cố định trật tự của các bazơ nitơ hướng vào trong trục xoắn kép.',
    keyFact: 'Đột biến có thể làm thay đổi chiều dài tổng thể của khung nếu là dạng mất hoặc thêm nucleotide.',
    colorHex: '#38bdf8'
  }
};

export const GeneMutationModel: React.FC = () => {
  const [mutationType, setMutationType] = useState<'sub' | 'del' | 'ins'>('sub');
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
    playToneEffect(500);
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

  const allPartsList = Object.values(GENE_MUTATION_PARTS);

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

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xef4444, 0.9);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildMutation3DScene(mutationType, mainGroup);

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
  }, [mutationType]);

  // Build 3D Gene Mutation Scene with rich interactive UserData
  const buildMutation3DScene = (type: 'sub' | 'del' | 'ins', group: THREE.Group) => {
    group.clear();

    const numPairs = type === 'del' ? 9 : type === 'ins' ? 11 : 10;
    const mutateIdx = 4; // Central pair undergoes mutation
    const radius = 4.2;
    const heightStep = 1.6;
    const angleStep = 0.6;
    const startY = -((numPairs - 1) * heightStep) / 2;

    const baseSequence: { left: string; right: string; mutated?: boolean }[] = [
      { left: 'A', right: 'T' },
      { left: 'G', right: 'C' },
      { left: 'T', right: 'A' },
      { left: 'C', right: 'G' },
      // Index 4: Mutated locus
      type === 'sub'
        ? { left: 'G', right: 'C', mutated: true } // Substituted: A-T replaced with G-C
        : type === 'ins'
        ? { left: 'C', right: 'G', mutated: true } // Newly inserted C-G
        : { left: 'T', right: 'A' },
      { left: 'T', right: 'A' },
      { left: 'C', right: 'G' },
      { left: 'G', right: 'C' },
      { left: 'A', right: 'T' },
      { left: 'T', right: 'A' },
      { left: 'G', right: 'C' },
    ];

    const pts1: THREE.Vector3[] = [];
    const pts2: THREE.Vector3[] = [];

    for (let i = 0; i < numPairs; i++) {
      const y = startY + i * heightStep;
      const angle = i * angleStep;
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      pts1.push(new THREE.Vector3(x1, y, z1));
      pts2.push(new THREE.Vector3(x2, y, z2));

      const isMutated = (type === 'sub' || type === 'ins') && i === mutateIdx;
      const isDeletedGap = type === 'del' && i === mutateIdx;

      if (!isDeletedGap) {
        const pair = baseSequence[i] || { left: 'A', right: 'T' };

        // Base bar spanning center
        const barCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x1 * 0.7, y, z1 * 0.7),
          new THREE.Vector3(x2 * 0.7, y, z2 * 0.7)
        ]);
        const barMesh = new THREE.Mesh(
          new THREE.TubeGeometry(barCurve, 10, isMutated ? 0.38 : 0.22, 12, false),
          new THREE.MeshStandardMaterial({
            color: isMutated ? 0xef4444 : 0x0284c7,
            roughness: 0.25,
            metalness: isMutated ? 0.5 : 0.2
          })
        );
        barMesh.userData = {
          partInfo: isMutated
            ? {
                ...GENE_MUTATION_PARTS.mutated_pair,
                name: `Điểm Đột Biến: Cặp Số ${i + 1} (${MUTATIONS[type].nameVi})`,
                keyFact: MUTATIONS[type].effectHBonds
              }
            : GENE_MUTATION_PARTS.normal_pair
        };
        group.add(barMesh);

        // Left Nucleotide Letter Sprite
        const leftSprite = createNuSprite(pair.left, {
          size: isMutated ? 1.45 : 1.18,
          depthTest: false,
          bgColor: isMutated ? '#ef4444' : undefined,
          borderColor: isMutated ? '#fef08a' : '#ffffff'
        });
        leftSprite.position.set(x1 * 0.65, y, z1 * 0.65);
        leftSprite.userData = { partInfo: isMutated ? GENE_MUTATION_PARTS.mutated_pair : GENE_MUTATION_PARTS.normal_pair };
        group.add(leftSprite);

        // Right Nucleotide Letter Sprite
        const rightSprite = createNuSprite(pair.right, {
          size: isMutated ? 1.45 : 1.18,
          depthTest: false,
          bgColor: isMutated ? '#ef4444' : undefined,
          borderColor: isMutated ? '#fef08a' : '#ffffff'
        });
        rightSprite.position.set(x2 * 0.65, y, z2 * 0.65);
        rightSprite.userData = { partInfo: isMutated ? GENE_MUTATION_PARTS.mutated_pair : GENE_MUTATION_PARTS.normal_pair };
        group.add(rightSprite);

        // Mutated glowing marker beacon
        if (isMutated) {
          const beacon = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.1, metalness: 0.8, emissive: 0xdc2626, emissiveIntensity: 0.6 })
          );
          beacon.position.set(0, y, 0);
          beacon.userData = {
            partInfo: {
              ...GENE_MUTATION_PARTS.mutated_pair,
              name: `Tâm Điểm Đột Biến: ${MUTATIONS[type].nameVi}`,
              keyFact: MUTATIONS[type].effectReadingFrame
            }
          };
          group.add(beacon);
        }
      } else {
        // Deleted gap indicator: dashed indicator showing where the pair was lost
        const gapRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.6, 0.12, 12, 24),
          new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.4 })
        );
        gapRing.position.set(0, y, 0);
        gapRing.rotation.x = Math.PI / 2;
        gapRing.userData = {
          partInfo: {
            ...GENE_MUTATION_PARTS.mutated_pair,
            name: 'Điểm Mất Cặp Nucleotide (Deletion Gap)',
            keyFact: 'Mất 1 cặp Nu làm chuỗi gen ngắn đi 3.4 Å (0.34 nm) và dịch khung đọc về sau.'
          }
        };
        group.add(gapRing);
      }
    }

    // Double helix backbone tubes
    const c1 = new THREE.CatmullRomCurve3(pts1);
    const c2 = new THREE.CatmullRomCurve3(pts2);
    const m1 = new THREE.Mesh(new THREE.TubeGeometry(c1, 50, 0.35, 12, false), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }));
    const m2 = new THREE.Mesh(new THREE.TubeGeometry(c2, 50, 0.35, 12, false), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 }));
    m1.userData = { partInfo: GENE_MUTATION_PARTS.dna_backbone };
    m2.userData = { partInfo: GENE_MUTATION_PARTS.dna_backbone };
    group.add(m1);
    group.add(m2);
  };

  return (
    <div className="space-y-4">
      {/* Header & Mutation Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Đột Biến Gen 3D (Biến Đổi Cấu Trúc Gen)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mô phỏng 3 dạng đột biến điểm: Thay thế 1 cặp Nu, Mất 1 cặp Nu và Thêm 1 cặp Nu
          </p>
        </div>

        {/* Mutation Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          {[
            { id: 'sub', label: '1. Thay Thế 1 Cặp' },
            { id: 'del', label: '2. Mất 1 Cặp' },
            { id: 'ins', label: '3. Thêm 1 Cặp' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                setMutationType(m.id as any);
                setInspectedDetail(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                mutationType === m.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{m.label}</span>
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
                : 'bg-gradient-to-b from-rose-50/70 via-white to-sky-100/60'
            }`}
          >
            {/* Scientific HUD Overlay */}
            <div
              className={`absolute top-3 left-3 z-10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1 shadow-md pointer-events-none ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/80 border border-slate-800 text-slate-300'
                  : 'bg-white/85 border border-rose-100 text-slate-700'
              }`}
            >
              <div className="text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> ĐỘT BIẾN ĐIỂM GEN
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Loại đột biến:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>{MUTATIONS[mutationType].nameVi}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Chiều dài gen:</span>{' '}
                <strong className="text-rose-400">{MUTATIONS[mutationType].effectLength}</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-rose-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span>Nhấp chuột vào vị trí đột biến màu đỏ hoặc cặp Nu bình thường để <strong>xem chi tiết</strong></span>
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
                    autoRotate ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
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
                  <div className="w-3 h-3 rounded-full bg-rose-400 shadow-sm" />
                  <h3 className="text-base font-bold text-white">
                    {MUTATIONS[mutationType].nameVi}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-mono">
                    Tác động tới số liên kết hydrogen
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{MUTATIONS[mutationType].effectHBonds}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Ảnh hưởng khung đọc bộ ba (Reading Frame)
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{MUTATIONS[mutationType].effectReadingFrame}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-mono">
                    Hậu quả sinh học đối với protein
                  </span>
                  <p className="leading-relaxed">{MUTATIONS[mutationType].consequences}</p>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào khối cầu đỏ ở giữa chuỗi xoắn kép để xem biến đổi chi tiết của cặp nucleotide bị đột biến.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

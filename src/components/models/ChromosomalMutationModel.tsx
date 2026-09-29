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
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Box
} from 'lucide-react';
import {
  ModelSubpartDetail,
  ModelDetailCard,
  ModelHoverPill,
  ModelPartsChipsList,
  playToneEffect
} from './ModelInspectionHUD';

interface MutationDetail {
  id: string;
  name: string;
  nameVi: string;
  mechanism: string;
  exampleVi: string;
  consequence: string;
  significance: string;
}

const STRUCTURAL_MUTATIONS: Record<'mat_doan' | 'lap_doan' | 'dao_doan' | 'chuyen_doan', MutationDetail> = {
  mat_doan: {
    id: 'mat_doan',
    name: 'Deletion (Deficiency)',
    nameVi: 'Mất Đoạn Nhiễm Sắc Thể',
    mechanism: 'Một đoạn NST bị đứt gãy và tiêu biến đi trong quá trình phân bào hoặc do tác nhân phóng xạ, hóa chất.',
    exampleVi: 'Mất đoạn nhánh ngắn NST số 5 ở người gây hội chứng tiếng mèo kêu (Cri du chat); mất đoạn nhỏ NST số 21 gây bệnh ung thư máu.',
    consequence: 'Làm giảm số lượng gene trên NST, thường làm giảm sức sống hoặc gây chết ở sinh vật mang đột biến.',
    significance: 'Được ứng dụng trong việc lập bản đồ gene và loại bỏ các gene có hại ra khỏi giống cây trồng.'
  },
  lap_doan: {
    id: 'lap_doan',
    name: 'Duplication',
    nameVi: 'Lặp Đoạn Nhiễm Sắc Thể',
    mechanism: 'Một đoạn NST được lặp lại một hoặc nhiều lần do sự tiếp hợp và trao đổi chéo không cân giữa các cromatit.',
    exampleVi: 'Ở ruồi giấm, lặp đoạn 16A trên NST X làm mắt lồi thành mắt dẹt; lặp đoạn ở đại mạch làm tăng hoạt tính enzyme amylase có lợi cho sản xuất bia.',
    consequence: 'Làm tăng số lượng bản sao của gene, gia tăng hoặc suy giảm cường độ biểu hiện của tính trạng.',
    significance: 'Cơ chế quan trọng tạo ra các gene mới trong quá trình tiến hóa phân tử của sinh giới.'
  },
  dao_doan: {
    id: 'dao_doan',
    name: 'Inversion',
    nameVi: 'Đảo Đoạn Nhiễm Sắc Thể',
    mechanism: 'Một đoạn NST bị đứt rời ra, sau đó quay 180° rồi gắn nối lại vào vị trí cũ (có thể chứa hoặc không chứa tâm động).',
    exampleVi: 'Các nòi ruồi giấm hoang dại phân biệt nhau bởi các đột biến đảo đoạn giúp chúng thích nghi với các điều kiện nhiệt độ khác nhau.',
    consequence: 'Không làm thay đổi số lượng gene nhưng làm thay đổi trật tự sắp xếp của các locus gene, có thể làm thay đổi mức độ hoạt động của gene (hiệu ứng vị trí).',
    significance: 'Góp phần tạo ra sự đa dạng di truyền phong phú giữa các chủng loài và ngăn chặn trao đổi chéo.'
  },
  chuyen_doan: {
    id: 'chuyen_doan',
    name: 'Translocation',
    nameVi: 'Chuyển Đoạn Nhiễm Sắc Thể',
    mechanism: 'Sự trao đổi đoạn NST giữa hai NST không tương đồng (chuyển đoạn tương hỗ) hoặc một đoạn NST gắn sang một NST khác (không tương hỗ).',
    exampleVi: 'Chuyển đoạn giữa NST số 9 và số 22 tạo NST Philadelphia (BCR-ABL) gây bệnh bạch cầu mạn dòng tủy (CML) ở người.',
    consequence: 'Làm thay đổi nhóm gene liên kết, giảm khả năng sinh sản (bán bất thụ) do giảm phân tạo giao tử mang đột biến thiếu hoặc thừa đoạn.',
    significance: 'Ứng dụng trong phòng trừ sâu hại bằng phương pháp di truyền (thả con đực mang chuyển đoạn).'
  }
};

const CHROM_MUTATION_PARTS: Record<string, ModelSubpartDetail> = {
  mutated_segment: {
    id: 'mutated_segment',
    name: 'Đoạn Nhiễm Sắc Thể Bị Đột Biến (Mất / Lặp / Đảo / Chuyển)',
    nameEn: 'Mutated Chromosomal Segment',
    category: 'Vùng tái cấu trúc NST',
    parentModel: 'Đột Biến Cấu Trúc Nhiễm Sắc Thể 3D',
    structure: 'Đoạn mang nhiều locus gen bị đứt gãy, lặp lại, đảo chiều 180° hoặc chuyển vị sang NST không tương đồng khác.',
    functionRole: 'Làm thay đổi cấu trúc, số lượng gen hoặc trật tự gen trong nhóm liên kết, dẫn đến các biến dị kiểu hình sâu sắc.',
    keyFact: 'Ảnh hưởng đến đồng thời nhiều gen cùng lúc, thường gây hậu quả nghiêm trọng hơn đột biến gen điểm.',
    colorHex: '#ef4444'
  },
  centromere: {
    id: 'centromere',
    name: 'Tâm Động Của NST Đột Biến',
    nameEn: 'Centromere of Mutated Chromosome',
    category: 'Cấu trúc định vị',
    parentModel: 'Đột Biến Cấu Trúc Nhiễm Sắc Thể 3D',
    structure: 'Điểm thắt đính thoi phân bào; đột biến đảo đoạn có thể chứa tâm động (pericentric) hoặc không chứa tâm động (paracentric).',
    functionRole: 'Giúp duy trì sự di chuyển của đoạn NST mang tâm động về cực tế bào trong phân bào.',
    keyFact: 'Nếu đoạn đứt không chứa tâm động (đoạn vô tâm) thì sẽ bị tiêu biến trong tế bào chất qua các lần phân bào.',
    colorHex: '#ec4899'
  },
  normal_arm: {
    id: 'normal_arm',
    name: 'Cánh NST Không Bị Đột Biến (Nguyên Vẹn)',
    nameEn: 'Intact Chromosome Arm',
    category: 'Cấu trúc nguyên bản',
    parentModel: 'Đột Biến Cấu Trúc Nhiễm Sắc Thể 3D',
    structure: 'Đoạn chromatid giữ nguyên trật tự gen ban đầu của kiểu dại.',
    functionRole: 'Làm chuẩn đối chiếu hình thái và kích thước với đoạn bị đột biến biến đổi.',
    keyFact: 'Khi tiếp hợp ở kỳ đầu giảm phân I, NST đột biến và NST bình thường sẽ uốn cong tạo quai vòng đặc trưng.',
    colorHex: '#38bdf8'
  }
};

export const ChromosomalMutationModel: React.FC = () => {
  const [mutationType, setMutationType] = useState<'mat_doan' | 'lap_doan' | 'dao_doan' | 'chuyen_doan'>('mat_doan');
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

  const allPartsList = Object.values(CHROM_MUTATION_PARTS);

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

    buildChromMutation3DScene(mutationType, mainGroup);

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

  // Build 3D Chromosome Mutation Scene with rich interactive UserData
  const buildChromMutation3DScene = (type: 'mat_doan' | 'lap_doan' | 'dao_doan' | 'chuyen_doan', group: THREE.Group) => {
    group.clear();

    // Left: Normal Chromosome (Wild type)
    const normalMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 12, 20),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.3 })
    );
    normalMesh.position.set(-3.5, 0, 0);
    normalMesh.userData = { partInfo: CHROM_MUTATION_PARTS.normal_arm };
    group.add(normalMesh);

    // Normal centromere
    const cent1 = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2, metalness: 0.6 })
    );
    cent1.position.set(-3.5, 0, 0);
    cent1.userData = { partInfo: CHROM_MUTATION_PARTS.centromere };
    group.add(cent1);

    // Right: Mutated Chromosome
    if (type === 'mat_doan') {
      // Deletion: shorter chromosome (height = 8 instead of 12)
      const mutMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 8, 20),
        new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.25, metalness: 0.3 })
      );
      mutMesh.position.set(3.5, -2, 0);
      mutMesh.userData = {
        partInfo: {
          ...CHROM_MUTATION_PARTS.mutated_segment,
          name: 'Đoạn NST Bị Mất (Deletion)',
          keyFact: 'Giảm số lượng gen, NST bị ngắn đi rõ rệt.'
        }
      };
      group.add(mutMesh);

      // Lost ghost fragment hovering away in red
      const lostFrag = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 3.5, 16),
        new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.6, roughness: 0.3 })
      );
      lostFrag.position.set(6.0, 4.5, 0);
      lostFrag.rotation.z = Math.PI / 6;
      lostFrag.userData = { partInfo: CHROM_MUTATION_PARTS.mutated_segment };
      group.add(lostFrag);

    } else if (type === 'lap_doan') {
      // Duplication: longer chromosome with duplicated red band
      const mutMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 14, 20),
        new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.25, metalness: 0.3 })
      );
      mutMesh.position.set(3.5, 0, 0);
      mutMesh.userData = { partInfo: CHROM_MUTATION_PARTS.normal_arm };
      group.add(mutMesh);

      // Duplicated segment band in bright red
      const dupBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 3.0, 20),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.6, emissive: 0xdc2626, emissiveIntensity: 0.4 })
      );
      dupBand.position.set(3.5, 3.5, 0);
      dupBand.userData = {
        partInfo: {
          ...CHROM_MUTATION_PARTS.mutated_segment,
          name: 'Đoạn Lặp (Duplication Block)',
          keyFact: 'Lặp lại 2 lần làm tăng số lượng bản sao gen.'
        }
      };
      group.add(dupBand);

    } else if (type === 'dao_doan') {
      // Inversion: segment inverted 180° highlighted with ring markers
      const mutMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 12, 20),
        new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.25, metalness: 0.3 })
      );
      mutMesh.position.set(3.5, 0, 0);
      mutMesh.userData = { partInfo: CHROM_MUTATION_PARTS.normal_arm };
      group.add(mutMesh);

      // Inverted block in amber
      const invBlock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 4.0, 20),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.6 })
      );
      invBlock.position.set(3.5, 3.0, 0);
      invBlock.userData = {
        partInfo: {
          ...CHROM_MUTATION_PARTS.mutated_segment,
          name: 'Đoạn Đảo 180° (Inversion)',
          keyFact: 'Quay ngược 180 độ làm thay đổi trật tự phân bố gen.'
        }
      };
      group.add(invBlock);

    } else {
      // Translocation: foreign segment in green attached to top of chromosome
      const mutMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 9, 20),
        new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.25, metalness: 0.3 })
      );
      mutMesh.position.set(3.5, -1.5, 0);
      mutMesh.userData = { partInfo: CHROM_MUTATION_PARTS.normal_arm };
      group.add(mutMesh);

      // Foreign translocated block in emerald
      const transBlock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 4.5, 20),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.6 })
      );
      transBlock.position.set(3.5, 4.5, 0);
      transBlock.userData = {
        partInfo: {
          ...CHROM_MUTATION_PARTS.mutated_segment,
          name: 'Đoạn Chuyển Vị Tương Hỗ (Translocation)',
          keyFact: 'Trao đổi đoạn với NST không tương đồng khác.'
        }
      };
      group.add(transBlock);
    }

    // Mutated centromere
    const cent2 = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2, metalness: 0.6 })
    );
    cent2.position.set(3.5, 0, 0);
    cent2.userData = { partInfo: CHROM_MUTATION_PARTS.centromere };
    group.add(cent2);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Đột Biến Cấu Trúc Nhiễm Sắc Thể 3D
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khảo sát 4 dạng đột biến cấu trúc NST: Mất đoạn ──→ Lặp đoạn ──→ Đảo đoạn ──→ Chuyển đoạn
          </p>
        </div>

        {/* Mutation Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          {[
            { id: 'mat_doan', label: '1. Mất Đoạn' },
            { id: 'lap_doan', label: '2. Lặp Đoạn' },
            { id: 'dao_doan', label: '3. Đảo Đoạn' },
            { id: 'chuyen_doan', label: '4. Chuyển Đoạn' }
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
                : 'bg-gradient-to-b from-rose-50/70 via-white to-purple-100/40'
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
                <AlertTriangle className="h-3 w-3" /> ĐỘT BIẾN CẤU TRÚC NST
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Dạng đột biến:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>{STRUCTURAL_MUTATIONS[mutationType].nameVi}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Hậu quả kiểu hình:</span>{' '}
                <strong className="text-amber-400">{STRUCTURAL_MUTATIONS[mutationType].consequence}</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-rose-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span>Nhấp chuột vào đoạn đột biến màu đỏ/vàng/xanh để <strong>xem chi tiết</strong></span>
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
                    {STRUCTURAL_MUTATIONS[mutationType].nameVi}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-mono">
                    Cơ chế phát sinh
                  </span>
                  <p className="leading-relaxed">{STRUCTURAL_MUTATIONS[mutationType].mechanism}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Ví dụ thực tế SGK
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{STRUCTURAL_MUTATIONS[mutationType].exampleVi}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-mono">
                    Ý nghĩa trong tiến hóa &amp; chọn giống
                  </span>
                  <p className="leading-relaxed">{STRUCTURAL_MUTATIONS[mutationType].significance}</p>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào đoạn NST đột biến bên phải hoặc đoạn NST bình thường bên trái để mở thẻ thông tin chi tiết.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  GitCompare,
  Box
} from 'lucide-react';
import {
  ModelSubpartDetail,
  ModelDetailCard,
  ModelHoverPill,
  ModelPartsChipsList,
  playToneEffect
} from './ModelInspectionHUD';

const LINKAGE_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  locus_B: {
    id: 'locus_B',
    name: 'Locus Gen Màu Thân (B / b)',
    nameEn: 'Body Color Gene (B / b)',
    category: 'Vị trí gen liên kết',
    parentModel: 'Di Truyền Liên Kết Morgan (Ruồi Giấm)',
    structure: 'Nằm tại vị trí 48.5 cM trên nhánh dài của NST số II ở ruồi giấm (Drosophila melanogaster).',
    functionRole: 'Quy định sắc tố vỏ cơ thể: Alen B quy định thân xám (trội hoàn toàn), alen b quy định thân đen (lặn).',
    keyFact: 'Cùng nằm trên 1 phân tử DNA với gen quy định chiều dài cánh (V/v), do đó có xu hướng di truyền cùng nhau.',
    colorHex: '#38bdf8'
  },
  locus_V: {
    id: 'locus_V',
    name: 'Locus Gen Chiều Dài Cánh (V / v)',
    nameEn: 'Wing Length Gene (V / v)',
    category: 'Vị trí gen liên kết',
    parentModel: 'Di Truyền Liên Kết Morgan (Ruồi Giấm)',
    structure: 'Nằm tại vị trí 67.0 cM trên cùng NST số II, cách locus B một khoảng bản đồ bằng 18.5 cM.',
    functionRole: 'Quy định hình thái cánh: Alen V quy định cánh dài (trội), alen v quy định cánh cụt (lặn).',
    keyFact: 'Khoảng cách 18.5 cM tương ứng với tần số hoán vị gen tối đa f = 17% - 18.5% khi xảy ra trao đổi chéo ở ruồi giấm cái.',
    colorHex: '#a855f7'
  },
  centromere: {
    id: 'centromere',
    name: 'Tâm Động & Eo Thắt NST Số II',
    nameEn: 'Chromosome II Centromere',
    category: 'Cấu trúc NST',
    parentModel: 'Di Truyền Liên Kết Morgan (Ruồi Giấm)',
    structure: 'Vị trí eo thắt đính 2 cromatit của NST số II với nhau.',
    functionRole: 'Đảm bảo sự phân ly chính xác của nhóm gen liên kết về cùng một tế bào con trong giảm phân.',
    keyFact: 'Nhóm gen liên kết: Toàn bộ các gen nằm trên cùng một NST tạo thành một nhóm gen liên kết (số nhóm gen liên kết = n = 4 ở ruồi giấm).',
    colorHex: '#ec4899'
  },
  chiasma: {
    id: 'chiasma',
    name: 'Điểm Trao Đổi Chéo & Hoán Vị Gen',
    nameEn: 'Chiasma & Recombination Point',
    category: 'Cơ chế hoán vị',
    parentModel: 'Di Truyền Liên Kết Morgan (Ruồi Giấm)',
    structure: 'Vị trí tiếp hợp và bắt chéo giữa 2 cromatit khác nguồn trong đoạn giữa locus B và locus V ở kỳ đầu giảm phân I.',
    functionRole: 'Tạo ra 2 loại giao tử hoán vị mới (Bv và bV) bên cạnh 2 loại giao tử liên kết gốc (BV và bv).',
    keyFact: 'Ở ruồi giấm đực, liên kết gen là hoàn toàn (f = 0%), hiện tượng hoán vị gen CHỈ XẢY RA Ở RUỒI CÁI.',
    colorHex: '#f59e0b'
  }
};

export const GeneticLinkageModel: React.FC = () => {
  const [modelMode, setModelMode] = useState<'linkage' | 'crossover'>('linkage');
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

  const allPartsList = Object.values(LINKAGE_PARTS_INFO);

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

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.9);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildLinkage3DScene(modelMode, mainGroup);

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
  }, [modelMode]);

  // Build 3D Linkage Scene with rich interactive UserData
  const buildLinkage3DScene = (mode: 'linkage' | 'crossover', group: THREE.Group) => {
    group.clear();

    // Two homologous chromosomes of pair II
    // Chromosome 1: Carries Alleles B (top) and V (bottom)
    const c1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 12, 20),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.3 })
    );
    c1.position.set(-2.5, 0, 0);
    c1.userData = { partInfo: LINKAGE_PARTS_INFO.centromere };
    group.add(c1);

    // Locus B allele band (Top: y = 3.5)
    const locusBBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 1.2, 20),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.1, metalness: 0.8, emissive: 0xeab308, emissiveIntensity: 0.5 })
    );
    locusBBand.position.set(-2.5, 3.5, 0);
    locusBBand.userData = { partInfo: LINKAGE_PARTS_INFO.locus_B };
    group.add(locusBBand);

    // Locus V allele band (Bottom: y = -3.5)
    const locusVBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 1.2, 20),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.1, metalness: 0.8, emissive: 0x9333ea, emissiveIntensity: 0.5 })
    );
    locusVBand.position.set(-2.5, -3.5, 0);
    locusVBand.userData = { partInfo: LINKAGE_PARTS_INFO.locus_V };
    group.add(locusVBand);

    // Centromere 1 (Center: y = 0)
    const cent1 = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2, metalness: 0.6 })
    );
    cent1.position.set(-2.5, 0, 0);
    cent1.userData = { partInfo: LINKAGE_PARTS_INFO.centromere };
    group.add(cent1);

    // Chromosome 2: Carries Alleles b (top) and v (bottom)
    const c2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 12, 20),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.25, metalness: 0.3 })
    );
    c2.position.set(2.5, 0, 0);
    c2.userData = { partInfo: LINKAGE_PARTS_INFO.centromere };
    group.add(c2);

    // Locus b allele band
    const locusbBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 1.2, 20),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.5 })
    );
    locusbBand.position.set(2.5, 3.5, 0);
    locusbBand.userData = {
      partInfo: {
        ...LINKAGE_PARTS_INFO.locus_B,
        name: 'Alen b (Thân đen - Lặn)',
        keyFact: 'Cùng nằm trên NST số II đối ứng trong cặp tương đồng.'
      }
    };
    group.add(locusbBand);

    // Locus v allele band
    const locusvBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 1.2, 20),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.5 })
    );
    locusvBand.position.set(2.5, -3.5, 0);
    locusvBand.userData = {
      partInfo: {
        ...LINKAGE_PARTS_INFO.locus_V,
        name: 'Alen v (Cánh cụt - Lặn)',
        keyFact: 'Alen lặn liên kết với b trên cùng 1 NST.'
      }
    };
    group.add(locusvBand);

    // Centromere 2
    const cent2 = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2, metalness: 0.6 })
    );
    cent2.position.set(2.5, 0, 0);
    cent2.userData = { partInfo: LINKAGE_PARTS_INFO.centromere };
    group.add(cent2);

    // Chiasma crossing-over bridge in crossover mode
    if (mode === 'crossover') {
      const bridgePts = [
        new THREE.Vector3(-2.5, -1.8, 0),
        new THREE.Vector3(0, -2.0, 0.8),
        new THREE.Vector3(2.5, -1.8, 0)
      ];
      const bridgeMesh = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bridgePts), 20, 0.45, 12, false),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, emissive: 0xeab308, emissiveIntensity: 0.6 })
      );
      bridgeMesh.userData = { partInfo: LINKAGE_PARTS_INFO.chiasma };
      group.add(bridgeMesh);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Di Truyền Liên Kết 3D (Morgan - Ruồi Giấm)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khảo sát các locus gen B (thân xám/đen) và V (cánh dài/cụt) cùng nằm trên NST số II và hiện tượng hoán vị gen
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => {
              setModelMode('linkage');
              setInspectedDetail(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              modelMode === 'linkage'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>1. Liên Kết Gen Hoàn Toàn</span>
          </button>
          <button
            onClick={() => {
              setModelMode('crossover');
              setInspectedDetail(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              modelMode === 'crossover'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>2. Trao Đổi Chéo (Hoán Vị Gen)</span>
          </button>
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
                : 'bg-gradient-to-b from-cyan-50/70 via-white to-purple-100/40'
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
                <Activity className="h-3 w-3" /> DI TRUYỀN MORGAN 3D
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Cặp NST khảo sát:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>NST số II (Ruồi giấm 2n=8)</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Khoảng cách gen:</span>{' '}
                <strong className="text-amber-400">18.5 cM (Tần số f = 17% - 18.5%)</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-cyan-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Nhấp chuột vào vạch gen B (vàng), gen V (tím) hoặc tâm động để <strong>xem chi tiết</strong></span>
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
                    {modelMode === 'linkage' ? 'Quy Luật Di Truyền Liên Kết' : 'Hiện Tượng Hoán Vị Gen'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-mono">
                    Khái niệm nhóm gen liên kết
                  </span>
                  <p className="leading-relaxed">
                    Các gen phân bố dọc theo chiều dài của NST và cùng phân li với nhau trong quá trình phân bào tạo thành một <strong className="text-white">nhóm gen liên kết</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Ý nghĩa thực tiễn
                  </span>
                  <p className="leading-relaxed font-semibold text-white">
                    Cho phép chọn giống duy trì các nhóm tính trạng tốt luôn đi liền với nhau; lập bản đồ di truyền xác định vị trí tương đối của các gen trên NST.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào vạch gen B (vàng), gen V (tím) hoặc cầu trao đổi chéo để xem giải thích chi tiết.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

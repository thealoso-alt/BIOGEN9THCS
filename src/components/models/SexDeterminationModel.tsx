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
  playToneEffect
} from './ModelInspectionHUD';

const SEX_FEATURES_INFO: Record<string, ModelSubpartDetail> = {
  sry: {
    id: 'sry',
    name: 'Gen SRY (Vùng Xác Định Giới Tính Nam Trên Y)',
    nameEn: 'SRY Gene (Sex-determining Region Y)',
    category: 'Gen then chốt',
    parentModel: 'Cơ Chế Xác Định Giới Tính (XX / XY)',
    structure: 'Nằm trên nhánh ngắn của NST Y (vị trí Yp11.2) gần vùng giả tương đồng PAR1.',
    functionRole: 'Mã hóa yếu tố tinh hoàn hóa TDF (Testis-determining factor), kích hoạt biệt hóa tuyến sinh dục phôi thai thành tinh hoàn ở tuần thứ 6 - 8.',
    keyFact: 'Nếu đột biến hoặc mất gen SRY, cá thể mang cặp XY vẫn phát triển kiểu hình nữ (Hội chứng Swyer).',
    colorHex: '#06b6d4'
  },
  x_inactivation: {
    id: 'x_inactivation',
    name: 'Bất Hoạt NST X (Thể Barr)',
    nameEn: 'X-Chromosome Inactivation (Barr Body)',
    category: 'Cơ chế biểu sinh',
    parentModel: 'Cơ Chế Xác Định Giới Tính (XX / XY)',
    structure: 'Một trong hai NST X ở tế bào sinh dưỡng nữ (XX) bị ngưng kết đặc biệt và co đặc thành một khối đậm màu sát màng nhân.',
    functionRole: 'Cân bằng liều lượng gen giữa cá thể XX (nữ) và cá thể XY (nam), đảm bảo lượng protein do NST X tạo ra là tương đương nhau.',
    keyFact: 'Sự bất hoạt diễn ra ngẫu nhiên ở giai đoạn phôi sớm và duy trì suốt đời tế bào (ví dụ: tạo màu lông tam thể ở mèo cái).',
    colorHex: '#ec4899'
  },
  par_region: {
    id: 'par_region',
    name: 'Vùng Giả Tương Đồng (PAR1 & PAR2)',
    nameEn: 'Pseudoautosomal Regions',
    category: 'Vùng đầu mút tương đồng',
    parentModel: 'Cơ Chế Xác Định Giới Tính (XX / XY)',
    structure: 'Các đoạn trình tự tương đồng nằm ở hai đầu mút của NST X và NST Y.',
    functionRole: 'Cho phép NST X và Y tiếp hợp và bắt cặp với nhau bình thường trong kỳ đầu giảm phân I ở nam giới.',
    keyFact: 'Đảm bảo sự phân ly đồng đều 50% tinh trùng mang X : 50% tinh trùng mang Y.',
    colorHex: '#f59e0b'
  },
  xy_pairing: {
    id: 'xy_pairing',
    name: 'Cặp NST Giới Tính XY Ở Nam Giới',
    nameEn: 'Heteromorphic XY Sex Pair',
    category: 'Cặp NST giới tính',
    parentModel: 'Cơ Chế Xác Định Giới Tính (XX / XY)',
    structure: 'Gồm 1 chiếc X lớn mang hàng nghìn gen và 1 chiếc Y nhỏ hơn nhiều chỉ mang số ít gen chuyên biệt.',
    functionRole: 'Tạo cơ chế dị giao tử ở nam giới, thụ tinh ngẫu nhiên với trứng (X) duy trì tỉ lệ xấp xỉ 1 nam : 1 nữ ở đời con.',
    keyFact: 'Ở một số loài như chim, bướm, dâu tây: con cái là ZW (dị giao tử), con đực là ZZ (đồng giao tử).',
    colorHex: '#38bdf8'
  }
};

export const SexDeterminationModel: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'karyotype' | 'fertilization'>('karyotype');
  const [pairType, setPairType] = useState<'XX' | 'XY'>('XY');
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

  const allPartsList = Object.values(SEX_FEATURES_INFO);

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

    const dirLight2 = new THREE.DirectionalLight(0xec4899, 0.9);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildSexChrom3DScene(pairType, mainGroup);

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
  }, [pairType]);

  // Build 3D Sex Chromosomes Scene with rich interactive UserData
  const buildSexChrom3DScene = (type: 'XX' | 'XY', group: THREE.Group) => {
    group.clear();

    // Left Chromosome: Always X (Red/Pink, long)
    const xMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 12, 20),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.25, metalness: 0.3 })
    );
    xMesh.position.set(-3.2, 0, 0);
    xMesh.userData = { partInfo: SEX_FEATURES_INFO.xy_pairing };
    group.add(xMesh);

    // PAR1 & PAR2 caps on X
    const parXTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.6 })
    );
    parXTop.position.set(-3.2, 6.0, 0);
    parXTop.userData = { partInfo: SEX_FEATURES_INFO.par_region };
    group.add(parXTop);

    const parXBot = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.6 })
    );
    parXBot.position.set(-3.2, -6.0, 0);
    parXBot.userData = { partInfo: SEX_FEATURES_INFO.par_region };
    group.add(parXBot);

    if (type === 'XX') {
      // Right Chromosome: Second X (in female)
      const x2Mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 12, 20),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.25, metalness: 0.3 })
      );
      x2Mesh.position.set(3.2, 0, 0);
      x2Mesh.userData = { partInfo: SEX_FEATURES_INFO.x_inactivation };
      group.add(x2Mesh);

      // Barr body beacon
      const barrBeacon = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 0.6 })
      );
      barrBeacon.position.set(3.2, 0, 1.2);
      barrBeacon.userData = { partInfo: SEX_FEATURES_INFO.x_inactivation };
      group.add(barrBeacon);

    } else {
      // Right Chromosome: Y Chromosome (Cyan, shorter)
      const yMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 5.5, 20),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.25, metalness: 0.4 })
      );
      yMesh.position.set(3.2, -2.5, 0);
      yMesh.userData = { partInfo: SEX_FEATURES_INFO.sry };
      group.add(yMesh);

      // SRY Gene Band (Bright yellow marker on short arm of Y)
      const sryBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 1.2, 20),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.1, metalness: 0.8, emissive: 0xeab308, emissiveIntensity: 0.7 })
      );
      sryBand.position.set(3.2, -0.6, 0);
      sryBand.userData = { partInfo: SEX_FEATURES_INFO.sry };
      group.add(sryBand);

      // PAR region on Y
      const parY = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.6 })
      );
      parY.position.set(3.2, 0.2, 0);
      parY.userData = { partInfo: SEX_FEATURES_INFO.par_region };
      group.add(parY);
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
              Phòng Thí Nghiệm Xác Định Giới Tính 3D (Cặp NST XX &amp; XY)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khảo sát cấu trúc không gian của NST X và Y, vị trí gen SRY và cơ chế duy trì tỉ lệ 1 : 1
          </p>
        </div>

        {/* Pair Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => {
              setPairType('XX');
              setInspectedDetail(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              pairType === 'XX'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👩 Cặp Nữ Giới (XX)</span>
          </button>
          <button
            onClick={() => {
              setPairType('XY');
              setInspectedDetail(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              pairType === 'XY'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨 Cặp Nam Giới (XY)</span>
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
                : 'bg-gradient-to-b from-cyan-50/70 via-white to-pink-100/40'
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
                <Activity className="h-3 w-3" /> NST GIỚI TÍNH 3D
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Cặp khảo sát:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>
                  {pairType === 'XX' ? 'Nữ giới (XX - Đồng hình)' : 'Nam giới (XY - Dị hình)'}
                </strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Vùng then chốt:</span>{' '}
                <strong className={pairType === 'XY' ? 'text-cyan-400' : 'text-rose-400'}>
                  {pairType === 'XY' ? 'Gen SRY trên nhánh ngắn của Y' : 'Bất hoạt 1 NST X (thể Barr)'}
                </strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-cyan-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Nhấp chuột vào gen SRY vàng, nhánh NST X hoặc vùng PAR để <strong>xem chi tiết</strong></span>
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
                    {pairType === 'XX' ? 'Cấu Trúc Cặp XX (Nữ Giới)' : 'Cấu Trúc Cặp XY (Nam Giới)'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-mono">
                    Đặc điểm hình thái
                  </span>
                  <p className="leading-relaxed">
                    {pairType === 'XY'
                      ? 'Cặp XY là cặp dị hình: NST X dài hơn chứa hàng trăm gen; NST Y ngắn hơn mang gen biệt hóa giới tính nam SRY.'
                      : 'Cặp XX là cặp đồng hình: Gồm 2 NST X giống hệt nhau về hình dạng và kích thước.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Cơ chế xác định giới tính ở người
                  </span>
                  <p className="leading-relaxed font-semibold text-white">
                    Mẹ (XX) chỉ tạo 1 loại trứng mang X; Bố (XY) tạo 2 loại tinh trùng mang X và Y với tỉ lệ ngang nhau (1:1). Giới tính của con do tinh trùng của bố quyết định khi thụ tinh.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào dải gen SRY màu vàng trên NST Y hoặc vùng mút PAR để xem thông tin sinh học chi tiết.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

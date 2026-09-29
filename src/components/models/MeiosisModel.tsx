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

const MEIOSIS_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  crossing_over: {
    id: 'crossing_over',
    name: 'Hiện Tượng Trao Đổi Chéo (Crossing Over)',
    nameEn: 'Crossing Over (Genetic Recombination)',
    category: 'Cơ chế biến dị',
    parentModel: 'Mô Hình Phân Bào Giảm Phân (Meiosis)',
    structure: 'Xảy ra ở kỳ đầu I (Prophase I) giữa 2 trong 4 cromatit khác nguồn gốc của cặp NST kép tương đồng.',
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
    keyFact: 'Tần số hoán vị gen phụ thuộc vào khoảng cách giữa các gen trên NST (càng xa nhau càng dễ bắt chéo).',
    colorHex: '#f59e0b'
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
    colorHex: '#38bdf8'
  },
  gametes: {
    id: 'gametes',
    name: 'Bốn Giao Tử Đơn Bội (n)',
    nameEn: 'Haploid Gametes (n)',
    category: 'Sản phẩm giảm phân',
    parentModel: 'Mô Hình Phân Bào Giảm Phân (Meiosis)',
    structure: 'Ở giới đực phát triển thành 4 tinh trùng (n); ở giới cái tạo thành 1 trứng (n) lớn và 3 thể cực (thể định hướng tiêu biến).',
    functionRole: 'Tham gia vào quá trình thụ tinh kết hợp vật chất di truyền của hai cá thể bố và mẹ.',
    keyFact: 'Mỗi giao tử mang một tổ hợp gen độc nhất vô nhị nhờ sự phân ly độc lập và trao đổi chéo.',
    colorHex: '#10b981'
  }
};

export const MeiosisModel: React.FC = () => {
  const [activeStage, setActiveStage] = useState<'meiosis1' | 'meiosis2'>('meiosis1');
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
    cameraRef.current.position.z = Math.max(10, Math.min(65, cameraRef.current.position.z * factor));
  };

  const allPartsList = Object.values(MEIOSIS_PARTS_INFO);

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

    buildMeiosis3DScene(activeStage, mainGroup);

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
  }, [activeStage]);

  // Build 3D Meiosis Scene with rich interactive UserData
  const buildMeiosis3DScene = (stage: 'meiosis1' | 'meiosis2', group: THREE.Group) => {
    group.clear();

    if (stage === 'meiosis1') {
      // GIẢM PHÂN I: Cặp NST kép tương đồng tiếp hợp và trao đổi chéo (Chiasma)
      // Chromosome 1 (Blue from Father)
      const c1Pts = [
        new THREE.Vector3(-1.8, 7.5, 0),
        new THREE.Vector3(-1.2, 3.2, 0.4),
        new THREE.Vector3(-0.4, 0, 0.2), // Cross over contact
        new THREE.Vector3(-1.2, -3.2, 0.4),
        new THREE.Vector3(-1.8, -7.5, 0)
      ];
      const m1 = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c1Pts), 30, 0.65, 16, false),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
      );
      m1.userData = { partInfo: MEIOSIS_PARTS_INFO.crossing_over };
      group.add(m1);

      // Chromosome 2 (Pink from Mother)
      const c2Pts = [
        new THREE.Vector3(1.8, 7.5, 0),
        new THREE.Vector3(1.2, 3.2, 0.4),
        new THREE.Vector3(0.4, 0, 0.2), // Cross over contact
        new THREE.Vector3(1.2, -3.2, 0.4),
        new THREE.Vector3(1.8, -7.5, 0)
      ];
      const m2 = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c2Pts), 30, 0.65, 16, false),
        new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 })
      );
      m2.userData = { partInfo: MEIOSIS_PARTS_INFO.crossing_over };
      group.add(m2);

      // Chiasma contact zone highlight
      const chiasmaDot = new THREE.Mesh(
        new THREE.SphereGeometry(1.3, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.7, emissive: 0xeab308, emissiveIntensity: 0.4 })
      );
      chiasmaDot.position.set(0, 0, 0.2);
      chiasmaDot.userData = { partInfo: MEIOSIS_PARTS_INFO.chiasma };
      group.add(chiasmaDot);

    } else {
      // GIẢM PHÂN II: 4 tế bào con đơn bội (n) với các nhiễm sắc thể tái tổ hợp
      const cellPositions = [
        { x: -5, y: 4.5, color: 0x0284c7 },
        { x: 5, y: 4.5, color: 0x38bdf8 },
        { x: -5, y: -4.5, color: 0xec4899 },
        { x: 5, y: -4.5, color: 0xf43f5e }
      ];

      cellPositions.forEach((pos, idx) => {
        // Cell boundary
        const cSphere = new THREE.Mesh(
          new THREE.SphereGeometry(3.6, 24, 24),
          new THREE.MeshStandardMaterial({
            color: 0x64748b,
            transparent: true,
            opacity: 0.25,
            wireframe: true
          })
        );
        cSphere.position.set(pos.x, pos.y, 0);
        cSphere.userData = { partInfo: MEIOSIS_PARTS_INFO.gametes };
        group.add(cSphere);

        // Single chromosome inside each gamete
        const chrom = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 3.5, 16),
          new THREE.MeshStandardMaterial({ color: pos.color, roughness: 0.3 })
        );
        chrom.position.set(pos.x, pos.y, 0);
        chrom.userData = {
          partInfo: {
            ...MEIOSIS_PARTS_INFO.gametes,
            name: `Giao Tử Số ${idx + 1} (n)`,
            keyFact: 'Mang tổ hợp alen đơn bội độc nhất vô nhị.'
          }
        };
        group.add(chrom);
      });
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
              Phòng Thí Nghiệm Giảm Phân 3D (Tiếp Hợp &amp; Trao Đổi Chéo)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khảo sát cơ chế giảm nhiễm qua 2 lần phân bào: Giảm phân I (tiếp hợp chiasma) &amp; Giảm phân II (tạo 4 giao tử n)
          </p>
        </div>

        {/* Stage Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => {
              setActiveStage('meiosis1');
              setInspectedDetail(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStage === 'meiosis1'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>1. Giảm Phân I (Tiếp Hợp & Chéo)</span>
          </button>
          <button
            onClick={() => {
              setActiveStage('meiosis2');
              setInspectedDetail(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStage === 'meiosis2'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>2. Giảm Phân II (4 Giao Tử n)</span>
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
                : 'bg-gradient-to-b from-pink-50/70 via-white to-purple-100/40'
            }`}
          >
            {/* Scientific HUD Overlay */}
            <div
              className={`absolute top-3 left-3 z-10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1 shadow-md pointer-events-none ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/80 border border-slate-800 text-slate-300'
                  : 'bg-white/85 border border-pink-100 text-slate-700'
              }`}
            >
              <div className="text-pink-400 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> GIẢM PHÂN TẠO GIAO TỬ
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Giai đoạn:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>
                  {activeStage === 'meiosis1' ? 'Giảm phân I (Phân chia giảm nhiễm)' : 'Giảm phân II (Phân chia nguyên nhiễm)'}
                </strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Hiện tượng cốt lõi:</span>{' '}
                <strong className="text-amber-400">
                  {activeStage === 'meiosis1' ? 'Tiếp hợp & Trao đổi chéo tại Chiasma' : 'Tạo 4 tế bào con đơn bội (n)'}
                </strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-pink-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                <span>Nhấp chuột vào điểm bắt chéo vàng, nhánh NST hoặc tế bào giao tử để <strong>xem chi tiết</strong></span>
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
                    {activeStage === 'meiosis1' ? 'Cơ Chế Giảm Phân I' : 'Cơ Chế Giảm Phân II'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-pink-400 uppercase tracking-wider block font-mono">
                    Bản chất sinh học
                  </span>
                  <p className="leading-relaxed">
                    Giảm phân là hình thức phân bào có thoi của các tế bào sinh dục chín, biến đổi tế bào sinh dục 2n thành các giao tử đơn bội (n).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Nguồn gốc biến dị tổ hợp
                  </span>
                  <p className="leading-relaxed font-semibold text-white">
                    Sự tiếp hợp và trao đổi chéo giữa các cromatit khác nguồn kết hợp với sự phân ly độc lập của các NST tạo ra nguồn biến dị phong phú cho tiến hóa và chọn giống.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-pink-950/40 border border-pink-800/60 text-pink-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào điểm tiếp hợp màu vàng giữa 2 nhánh NST hoặc các tế bào giao tử để xem thông tin ngắn gọn.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

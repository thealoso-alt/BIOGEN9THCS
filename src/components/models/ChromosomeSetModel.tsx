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

const CHROMOSOME_SET_PARTS: Record<string, ModelSubpartDetail> = {
  autosomes: {
    id: 'autosomes',
    name: 'Nhiễm Sắc Thể Thường (Autosomes 1 - 22)',
    nameEn: 'Autosomes (Pairs 1 to 22)',
    category: 'NST thường',
    parentModel: 'Bộ Nhiễm Sắc Thể Người (2n = 46)',
    structure: 'Gồm 22 cặp NST tương đồng giống nhau ở cả nam và nữ; sắp xếp theo thứ tự kích thước giảm dần từ cặp số 1 (lớn nhất) đến cặp số 22 (nhỏ nhất).',
    functionRole: 'Mang các gen quy định các tính trạng sinh dưỡng (màu mắt, nhóm máu, hình dạng cơ thể...) không liên quan trực tiếp đến giới tính.',
    keyFact: 'Mỗi cặp gồm 1 chiếc có nguồn gốc từ bố (qua tinh trùng) và 1 chiếc từ mẹ (qua trứng).',
    colorHex: '#38bdf8'
  },
  chrom_x: {
    id: 'chrom_x',
    name: 'Nhiễm Sắc Thể Giới Tính X',
    nameEn: 'X Sex Chromosome',
    category: 'NST giới tính',
    parentModel: 'Bộ Nhiễm Sắc Thể Người (2n = 46)',
    structure: 'Kích thước lớn (khoảng 155 triệu cặp base), tâm động lệch, chứa khoảng 800 - 900 gen chức năng.',
    functionRole: 'Quy định giới tính nữ (khi ở trạng thái XX) và mang nhiều gen thiết yếu như gen đông máu (máu khó đông), thụ thể sắc giác (mù màu).',
    keyFact: 'Ở nữ giới (XX), một trong hai NST X bị bất hoạt ngẫu nhiên thành thể Barr trong nhân tế bào.',
    colorHex: '#f43f5e'
  },
  chrom_y: {
    id: 'chrom_y',
    name: 'Nhiễm Sắc Thể Giới Tính Y',
    nameEn: 'Y Sex Chromosome',
    category: 'NST giới tính',
    parentModel: 'Bộ Nhiễm Sắc Thể Người (2n = 46)',
    structure: 'Kích thước rất nhỏ (khoảng 59 triệu cặp base), chỉ bằng khoảng 1/3 kích thước của NST X; chứa khoảng 50 - 60 gen.',
    functionRole: 'Mang gen SRY (Sex-determining Region Y) biệt hóa tinh hoàn, quyết định phát triển giới tính nam (XY).',
    keyFact: 'Hầu hết các gen trên nhánh không tương đồng của Y chỉ di truyền thẳng từ bố cho con trai.',
    colorHex: '#06b6d4'
  },
  nuclear_membrane: {
    id: 'nuclear_membrane',
    name: 'Màng Nhân & Khoang Nhân Tế Bào',
    nameEn: 'Nuclear Envelope & Nucleoplasm',
    category: 'Cấu trúc tế bào',
    parentModel: 'Bộ Nhiễm Sắc Thể Người (2n = 46)',
    structure: 'Màng kép phospholipid đục lỗ bởi các phức hợp lỗ nhân (nuclear pores), bao bọc toàn bộ chất nhiễm sắc.',
    functionRole: 'Bảo vệ bộ gen nguyên vẹn khỏi các enzyme thủy phân trong tế bào chất và kiểm soát sự vận chuyển phân tử ra vào nhân.',
    keyFact: 'Màng nhân tiêu biến ở kỳ đầu phân bào và tái hình thành ở kỳ cuối quanh các bộ NST con.',
    colorHex: '#64748b'
  }
};

export const ChromosomeSetModel: React.FC = () => {
  const [gender, setGender] = useState<'female' | 'male'>('female');
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

  const allPartsList = Object.values(CHROMOSOME_SET_PARTS);

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

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 0.9);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildKaryotype3DScene(gender, mainGroup);

    // Raycaster for 3D interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = { x: 0, y: 0, time: 0 };

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotateRef.current && modelGroupRef.current && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.007;
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
  }, [gender]);

  // Build 3D Karyotype in Nuclear Space with rich interactive UserData
  const buildKaryotype3DScene = (g: 'female' | 'male', group: THREE.Group) => {
    group.clear();

    // Semi-transparent 3D Nuclear envelope
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(14, 32, 24),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.12,
        roughness: 0.5,
        wireframe: true
      })
    );
    nucleus.userData = { partInfo: CHROMOSOME_SET_PARTS.nuclear_membrane };
    group.add(nucleus);

    // 8 representative homologous pairs in 3D sphere layout
    const pairCount = 7;
    for (let i = 0; i < pairCount; i++) {
      const angle = (i / pairCount) * Math.PI * 2;
      const radius = 8.5;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(i * 1.2) * 4.5;
      const pz = Math.sin(angle) * radius;

      const pairGroup = new THREE.Group();
      pairGroup.position.set(px, py, pz);

      const len = 4.2 - i * 0.3;
      const c1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, len, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 })
      );
      c1.position.set(-0.55, 0, 0);

      const c2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, len, 16),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
      );
      c2.position.set(0.55, 0, 0);

      const pairDetail: ModelSubpartDetail = {
        ...CHROMOSOME_SET_PARTS.autosomes,
        name: `Cặp NST Tương Đồng Số ${i + 1}`,
        keyFact: `Gồm 2 chiếc tương đồng cùng hình dạng và kích thước, 1 từ bố và 1 từ mẹ.`
      };

      c1.userData = { partInfo: pairDetail };
      c2.userData = { partInfo: pairDetail };
      pairGroup.userData = { partInfo: pairDetail };

      pairGroup.add(c1);
      pairGroup.add(c2);
      group.add(pairGroup);
    }

    // 23rd Sex Chromosome Pair in Center
    const sexGroup = new THREE.Group();
    sexGroup.position.set(0, 0, 0);

    // X chromosome
    const xChrom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 5.5, 16),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.2, metalness: 0.4 })
    );
    xChrom.position.set(-1.2, 0, 0);
    xChrom.userData = { partInfo: CHROMOSOME_SET_PARTS.chrom_x };
    sexGroup.add(xChrom);

    if (g === 'female') {
      // Second X
      const xChrom2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 5.5, 16),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.2, metalness: 0.4 })
      );
      xChrom2.position.set(1.2, 0, 0);
      xChrom2.userData = { partInfo: CHROMOSOME_SET_PARTS.chrom_x };
      sexGroup.add(xChrom2);
      sexGroup.userData = { partInfo: CHROMOSOME_SET_PARTS.chrom_x };
    } else {
      // Y chromosome (smaller)
      const yChrom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 2.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.4 })
      );
      yChrom.position.set(1.2, -1.5, 0);
      yChrom.userData = { partInfo: CHROMOSOME_SET_PARTS.chrom_y };
      sexGroup.add(yChrom);
      sexGroup.userData = { partInfo: CHROMOSOME_SET_PARTS.chrom_y };
    }

    group.add(sexGroup);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Bộ Nhiễm Sắc Thể 3D (Karyotype)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khảo sát 23 cặp NST trong nhân tế bào: 22 cặp NST thường (Autosomes) + cặp số 23 giới tính (XX / XY)
          </p>
        </div>

        {/* Gender Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => {
              setGender('female');
              setInspectedDetail(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              gender === 'female'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👩 Nữ Giới (44A + XX)</span>
          </button>
          <button
            onClick={() => {
              setGender('male');
              setInspectedDetail(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              gender === 'male'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨 Nam Giới (44A + XY)</span>
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
                : 'bg-gradient-to-b from-sky-50/70 via-white to-sky-100/60'
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
                <Activity className="h-3 w-3" /> BỘ NST NGƯỜI (2n = 46)
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Giới tính:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>
                  {gender === 'female' ? 'Nữ giới (44A + XX)' : 'Nam giới (44A + XY)'}
                </strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Cặp số 23 ở trung tâm:</span>{' '}
                <strong className={gender === 'female' ? 'text-rose-400' : 'text-cyan-400'}>
                  {gender === 'female' ? 'XX (Đồng giao tử)' : 'XY (Dị giao tử)'}
                </strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-sky-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>Nhấp chuột vào bất kỳ cặp NST nào để <strong>xem chi tiết</strong></span>
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
                    {gender === 'female' ? 'Bộ NST Nữ Giới (44A + XX)' : 'Bộ NST Nam Giới (44A + XY)'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-mono">
                    Số lượng &amp; Cấu trúc
                  </span>
                  <p className="leading-relaxed">
                    Tế bào sinh dưỡng (soma) của người chứa <strong className="text-white">2n = 46 nhiễm sắc thể</strong>, gồm 22 cặp NST thường và 1 cặp NST giới tính.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Đặc trưng loài
                  </span>
                  <p className="leading-relaxed font-semibold text-white">
                    Mỗi loài sinh vật có một bộ NST đặc trưng về số lượng, hình thái và cấu trúc (ruồi giấm 2n=8, đậu Hà Lan 2n=14, tinh tinh 2n=48).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 text-sky-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào cặp NST thường xung quanh hoặc cặp NST giới tính ở giữa để xem thông tin ngắn gọn.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

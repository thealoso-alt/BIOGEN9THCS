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

interface TranslationStage {
  step: number;
  title: string;
  location: string;
  details: string;
}

const TRANSLATION_STAGES: Record<1 | 2 | 3, TranslationStage> = {
  1: {
    step: 1,
    title: 'Giai Đoạn 1: Mở Đầu (Initiation)',
    location: 'Tiểu đơn vị bé nhận biết mARN tại Codon AUG',
    details: 'Tiểu đơn vị bé của ribosome gắn với mARN tại vị trí nhận biết đặc hiệu gần codon mở đầu AUG. Phân tử phức hợp tARN mang axit amin mở đầu (Met ở sinh vật nhân thực hoặc fMet ở sinh vật nhân sơ) tiến vào vị trí P với anticodon 3\'-UAC-5\' khớp bổ sung với 5\'-AUG-3\'. Sau đó tiểu đơn vị lớn gắn vào tạo ribosome hoàn chỉnh.'
  },
  2: {
    step: 2,
    title: 'Giai Đoạn 2: Kéo Dài Chuỗi Polypeptide (Elongation)',
    location: 'Hình thành liên kết peptide & dịch chuyển ribosome',
    details: 'tARN thứ nhất mang aa1 đi vào vị trí A. Enzyme peptidyl transferase xúc tác hình thành liên kết peptide giữa Met và aa1. Ribosome dịch chuyển sang codon tiếp theo theo chiều 5\'→3\' đúng một bộ ba (translocation), tARN rỗng chuyển sang vị trí E và rời đi, nhường vị trí A cho tARN tiếp theo.'
  },
  3: {
    step: 3,
    title: 'Giai Đoạn 3: Kết Thúc (Termination)',
    location: 'Gặp codon kết thúc (UAA, UAG hoặc UGA)',
    details: 'Khi ribosome tiếp xúc với một trong ba codon kết thúc (UAA, UAG, UGA), không có tARN nào vào được mà yếu tố giải phóng (Release factor) gắn vào vị trí A. Chuỗi polypeptide được tách rời, enzyme cắt bỏ axit amin mở đầu Met, hai tiểu phần ribosome tách rời nhau.'
  }
};

const TRANSLATION_TIMELINE_STAGES: TimelineStageMarker[] = [
  {
    id: 1,
    label: 'GĐ 1: Mở Đầu (Initiation)',
    shortLabel: 'GĐ 1: Mở đầu (0%)',
    range: [0, 25],
    desc: 'Tiểu đơn vị bé quét tìm codon AUG; tARN-Met vào vị trí P; tiểu đơn vị lớn gắn kết.'
  },
  {
    id: 2,
    label: 'GĐ 2: Kéo Dài (Elongation)',
    shortLabel: 'GĐ 2: Kéo dài (26%)',
    range: [26, 79],
    desc: 'tARN vào vị trí A, tạo liên kết peptide, Ribosome dịch chuyển 1 codon (5\'→3\').'
  },
  {
    id: 3,
    label: 'GĐ 3: Kết Thúc (Termination)',
    shortLabel: 'GĐ 3: Kết thúc (80%)',
    range: [80, 100],
    desc: 'Gặp codon kết thúc (UAA), yếu tố giải phóng gắn vào, tách giải phóng chuỗi polypeptide.'
  }
];

const getTranslationEventLabel = (pct: number) => {
  if (pct < 15) return 'Tiểu đơn vị bé (40S) bám vào đầu 5\' mARN, quét tìm codon mở đầu 5\'-AUG-3\'.';
  if (pct < 26) return 'tARN mang Met (anticodon 3\'-UAC-5\') tiến vào vị trí P; tiểu đơn vị lớn (60S) ráp vào hoàn chỉnh.';
  if (pct < 45) return 'tARN-aa1 tiến vào vị trí A; Peptidyl transferase xúc tác tạo liên kết peptide giữa Met và aa1.';
  if (pct < 65) return 'Ribosome dịch chuyển (translocation) 1 bộ ba sang codon tiếp theo; tARN rỗng rời vị trí E.';
  if (pct < 80) return 'Chuỗi polypeptide kéo dài liên tục thò ra ngoài qua đường hầm tiểu đơn vị lớn.';
  if (pct < 92) return 'Ribosome tiếp xúc codon kết thúc (UAA); Yếu tố giải phóng (Release Factor) gắn vào vị trí A.';
  return 'Dịch mã hoàn tất: Chuỗi polypeptide được giải phóng tự do cuộn gập thành protein; 2 tiểu phần tách rời.';
};

const TRANSLATION_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  large_subunit: {
    id: 'large_subunit',
    name: 'Tiểu Đơn Vị Lớn Ribosome (60S / 50S)',
    nameEn: 'Ribosome Large Subunit',
    category: 'Cấu trúc bào quan',
    parentModel: 'Mô Hình Dịch Mã Chuỗi Polypeptide',
    structure: 'Gồm các phân tử rARN (28S, 5.8S, 5S ở nhân thực) kết hợp với khoảng 49 phân tử protein, tạo thành khối vòm mang 3 vị trí chức năng E, P, A.',
    functionRole: 'Chứa trung tâm xúc tác Peptidyl Transferase hình thành liên kết peptide giữa các amino acid và có đường hầm giải phóng chuỗi polypeptide.',
    keyFact: 'Chỉ kết hợp với tiểu đơn vị bé khi đã có phức hợp khởi đầu (mARN + tARN-Met) hoàn tất.',
    colorHex: '#3b82f6'
  },
  small_subunit: {
    id: 'small_subunit',
    name: 'Tiểu Đơn Vị Bé Ribosome (40S / 30S)',
    nameEn: 'Ribosome Small Subunit',
    category: 'Cấu trúc bào quan',
    parentModel: 'Mô Hình Dịch Mã Chuỗi Polypeptide',
    structure: 'Gồm rARN 18S (ở sinh vật nhân thực) hoặc 16S (ở sinh vật nhân sơ) phối hợp với khoảng 33 phân tử protein.',
    functionRole: 'Nhận biết mũ 5\' của mARN, quét tìm codon mở đầu 5\'-AUG-3\' và kiểm tra tính chính xác của sự bắt cặp codon - anticodon.',
    keyFact: 'Đóng vai trò người gác cổng đảm bảo sự dịch mã chính xác theo đúng khung đọc mở (ORF).',
    colorHex: '#6366f1'
  },
  trna_anticodon: {
    id: 'trna_anticodon',
    name: 'Phân Tử tARN & Bộ Ba Đối Mã (Anticodon)',
    nameEn: 'tRNA & Anticodon Loop',
    category: 'Phân tử vận chuyển',
    parentModel: 'Mô Hình Dịch Mã Chuỗi Polypeptide',
    structure: 'Chuỗi RNA cuộn gập thành hình cỏ 3 lá; một đầu mang amino acid đặc hiệu (đầu 3\' CCA), đầu kia mang bộ ba đối mã (anticodon).',
    functionRole: 'Vận chuyển chính xác amino acid đến ribosome và bắt cặp bổ sung đối song song với codon tương ứng trên mARN (ví dụ codon AUG khớp với anticodon UAC).',
    keyFact: 'Mỗi loại tARN chỉ gắn với đúng một loại amino acid nhờ enzyme aminoacyl-tRNA synthetase.',
    colorHex: '#10b981'
  },
  polypeptide_chain: {
    id: 'polypeptide_chain',
    name: 'Chuỗi Polypeptide Đang Kéo Dài',
    nameEn: 'Nascent Polypeptide Chain',
    category: 'Sản phẩm dịch mã',
    parentModel: 'Mô Hình Dịch Mã Chuỗi Polypeptide',
    structure: 'Chuỗi thẳng các amino acid được nối với nhau qua liên kết peptide (-CO-NH-), nhô ra ngoài qua đường hầm thoát của tiểu đơn vị lớn.',
    functionRole: 'Tiền thân của protein chức năng; sau khi giải phóng sẽ tự cuộn gập thành cấu trúc không gian bậc 2, 3 để thực hiện chức năng sinh học.',
    keyFact: 'Amino acid đầu tiên luôn là Methionine (Met) ở sinh vật nhân thực hoặc Formyl-Methionine (fMet) ở sinh vật nhân sơ (sau đó sẽ bị cắt bỏ).',
    colorHex: '#f59e0b'
  },
  mrna_template: {
    id: 'mrna_template',
    name: 'Khuôn Mẫu mARN & Các Codon (Bộ Ba)',
    nameEn: 'mRNA Template & Codons',
    category: 'Khuôn dịch mã',
    parentModel: 'Mô Hình Dịch Mã Chuỗi Polypeptide',
    structure: 'Chuỗi đơn ribonucleotide trượt qua khe hẹp giữa hai tiểu phần ribosome theo chiều 5\' → 3\'.',
    functionRole: 'Cứ 3 nucleotide liên tiếp tạo thành 1 codon quy định 1 amino acid (hoặc tín hiệu kết thúc).',
    keyFact: 'Mã di truyền có tính thoái hóa (nhiều bộ ba cùng mã hóa 1 amino acid) và tính phổ biến khắp sinh giới.',
    colorHex: '#ef4444'
  },
  a_p_e_sites: {
    id: 'a_p_e_sites',
    name: 'Các Vị Trí Chức Năng A - P - E',
    nameEn: 'Ribosomal A, P, E Sites',
    category: 'Vùng xúc tác',
    parentModel: 'Mô Hình Dịch Mã Chuỗi Polypeptide',
    structure: 'Ba hốc tiếp nhận tARN: Vị trí A (Aminoacyl), vị trí P (Peptidyl), vị trí E (Exit).',
    functionRole: 'A đón nhận tARN mang amino acid mới; P giữ tARN mang chuỗi peptide; E giải phóng tARN rỗng sau khi đã chuyển giao amino acid.',
    keyFact: 'Ribosome dịch chuyển đúng một bộ ba (3 nucleotide) sau mỗi lần hình thành liên kết peptide.',
    colorHex: '#a855f7'
  }
};

export const TranslationModel: React.FC = () => {
  const [progress, setProgress] = useState<number>(35);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewportTheme, setViewportTheme] = useState<'deep' | 'lab'>('deep');
  const [inspectedDetail, setInspectedDetail] = useState<ModelSubpartDetail | null>(null);
  const [hoveredDetail, setHoveredDetail] = useState<ModelSubpartDetail | null>(null);

  const activeStep: 1 | 2 | 3 = progress < 26 ? 1 : progress < 80 ? 2 : 3;

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
    playToneEffect(660);
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

  const allPartsList = Object.values(TRANSLATION_PARTS_INFO);

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

    buildTranslation3DScene(progress, mainGroup);

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
      buildTranslation3DScene(progress, modelGroupRef.current);
    }
  }, [progress]);

  // Build 3D Ribosome Translation Scene dynamically according to scrubbing progress (0 - 100)
  const buildTranslation3DScene = (pct: number, group: THREE.Group) => {
    group.clear();

    const t = Math.max(0, Math.min(100, pct)) / 100; // 0.0 -> 1.0
    const riboX = -6 + t * 11; // Ribosome steps smoothly along mRNA from -6 to +5
    const isTerminating = t >= 0.82;
    const splitOffset = isTerminating ? (t - 0.82) * 8 : 0;

    // 1. Ribosome Large Subunit (Top domed shape)
    const largeSubunit = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.7),
      new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.35,
        metalness: 0.2,
        transparent: isTerminating,
        opacity: isTerminating ? Math.max(0.3, 1 - (t - 0.82) * 2.5) : 1
      })
    );
    largeSubunit.position.set(riboX, 2.5 + splitOffset, 0);
    largeSubunit.rotation.x = Math.PI;
    largeSubunit.userData = { partInfo: TRANSLATION_PARTS_INFO.large_subunit };
    group.add(largeSubunit);

    // 2. Ribosome Small Subunit (Bottom base)
    const smallSubunit = new THREE.Mesh(
      new THREE.CylinderGeometry(4.8, 4.0, 2.4, 32),
      new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.35,
        metalness: 0.2,
        transparent: isTerminating,
        opacity: isTerminating ? Math.max(0.3, 1 - (t - 0.82) * 2.5) : 1
      })
    );
    smallSubunit.position.set(riboX, -2.8 - splitOffset, 0);
    smallSubunit.userData = { partInfo: TRANSLATION_PARTS_INFO.small_subunit };
    group.add(smallSubunit);

    // 3. mRNA Strand passing horizontally
    const rnaPts: THREE.Vector3[] = [];
    for (let i = -14; i <= 14; i++) {
      const x = i;
      const y = -0.4;
      const z = Math.sin(i * 0.25) * 1.5;
      rnaPts.push(new THREE.Vector3(x, y, z));
    }
    const rnaCurve = new THREE.CatmullRomCurve3(rnaPts);
    const rnaMesh = new THREE.Mesh(
      new THREE.TubeGeometry(rnaCurve, 60, 0.28, 12, false),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25, metalness: 0.5 })
    );
    rnaMesh.userData = { partInfo: TRANSLATION_PARTS_INFO.mrna_template };
    group.add(rnaMesh);

    // 4. Codon Markers and Individual Nucleotides on mRNA
    const codonsOnMrna = [
      { codon: 'AUG', startX: -6.0, name: 'Codon 1: Mở Đầu (Met)' },
      { codon: 'GUC', startX: -2.5, name: 'Codon 2: Valine (Val)' },
      { codon: 'AAG', startX: 1.0, name: 'Codon 3: Lysine (Lys)' },
      { codon: 'UUU', startX: 4.5, name: 'Codon 4: Phenylalanine (Phe)' },
      { codon: 'CCU', startX: 8.0, name: 'Codon 5: Proline (Pro)' },
      { codon: 'UAA', startX: 11.5, name: 'Codon 6: Kết Thúc (Stop)' },
    ];

    codonsOnMrna.forEach((cItem) => {
      for (let charIdx = 0; charIdx < cItem.codon.length; charIdx++) {
        const char = cItem.codon[charIdx];
        const nuX = cItem.startX + charIdx * 0.6;
        const sprite = createNuSprite(char, {
          size: 0.95,
          depthTest: false,
          bgColor: char === 'U' ? '#ea580c' : char === 'A' ? '#dc2626' : char === 'G' ? '#059669' : '#d97706'
        });
        sprite.position.set(nuX, -0.9, 1.4);
        sprite.userData = {
          partInfo: {
            ...TRANSLATION_PARTS_INFO.mrna_template,
            name: `${cItem.name} · Nu ${char}`,
            keyFact: `Nucleotide ${char} thuộc bộ ba mã hóa trên phân tử mARN.`
          }
        };
        group.add(sprite);
      }
    });

    // 5. tRNA docked at P site
    const trnaP = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 4.0, 16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 })
    );
    trnaP.position.set(riboX - 0.4, 1.0 + (isTerminating ? splitOffset * 0.5 : 0), 1.2);
    trnaP.userData = { partInfo: TRANSLATION_PARTS_INFO.trna_anticodon };
    group.add(trnaP);

    // Anticodon triplet on tRNA P: 3'-UAC-5'
    const anticodonP = ['U', 'A', 'C'];
    anticodonP.forEach((char, idx) => {
      const nuX = riboX - 1.0 + idx * 0.6;
      const sprite = createNuSprite(char, {
        size: 0.95,
        depthTest: false,
        bgColor: char === 'U' ? '#ea580c' : char === 'A' ? '#dc2626' : '#d97706'
      });
      sprite.position.set(nuX, -0.3 + (isTerminating ? splitOffset * 0.5 : 0), 1.55);
      sprite.userData = {
        partInfo: {
          ...TRANSLATION_PARTS_INFO.trna_anticodon,
          name: `Đối Mã Anticodon P: ${char}`,
          keyFact: 'Khớp bổ sung đối song song (A-U, U-A, G-C) tại vị trí P.'
        }
      };
      group.add(sprite);
    });

    // 6. tRNA docked at A site (active during elongation 20% - 80%)
    if (t >= 0.20 && t < 0.80) {
      const trnaA = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 4.0, 16),
        new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.3 })
      );
      trnaA.position.set(riboX + 2.2, 1.0, 1.2);
      trnaA.userData = { partInfo: TRANSLATION_PARTS_INFO.trna_anticodon };
      group.add(trnaA);

      // Anticodon triplet on tRNA A: 3'-CAG-5'
      const anticodonA = ['C', 'A', 'G'];
      anticodonA.forEach((char, idx) => {
        const nuX = riboX + 1.6 + idx * 0.6;
        const sprite = createNuSprite(char, {
          size: 0.95,
          depthTest: false,
          bgColor: char === 'C' ? '#d97706' : char === 'A' ? '#dc2626' : '#059669'
        });
        sprite.position.set(nuX, -0.3, 1.55);
        sprite.userData = {
          partInfo: {
            ...TRANSLATION_PARTS_INFO.trna_anticodon,
            name: `Đối Mã Anticodon A: ${char}`,
            keyFact: 'Khớp bổ sung đối song song tại vị trí A.'
          }
        };
        group.add(sprite);
      });
    }

    // Release Factor at A-site upon termination
    if (t >= 0.80) {
      const rfGroup = new THREE.Group();
      rfGroup.position.set(riboX + 2.2, 1.0, 1.2);

      const rfMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.25,
          metalness: 0.4,
          emissive: 0xd97706,
          emissiveIntensity: 0.3
        })
      );
      rfMesh.userData = {
        partInfo: {
          id: 'release_factor',
          name: 'Yếu Tố Giải Phóng (Release Factor)',
          category: 'Protein kết thúc',
          parentModel: 'Mô Hình Dịch Mã',
          structure: 'Protein đặc hiệu có cấu trúc không gian mô phỏng phân tử tARN.',
          functionRole: 'Nhận biết codon kết thúc (UAA, UAG, UGA) tại vị trí A, kích hoạt phản ứng thủy phân giải phóng chuỗi peptide.',
          colorHex: '#f59e0b'
        }
      };
      rfGroup.add(rfMesh);
      group.add(rfGroup);
    }

    // 7. Growing Polypeptide Chain emerging from large subunit top
    const aminoAcidColors = [
      { name: 'Methionine (Met - Mở đầu)', color: 0xef4444 },
      { name: 'Valine (Val)', color: 0x3b82f6 },
      { name: 'Lysine (Lys)', color: 0x10b981 },
      { name: 'Phenylalanine (Phe)', color: 0x8b5cf6 },
      { name: 'Proline (Pro)', color: 0xec4899 },
      { name: 'Leucine (Leu)', color: 0xf59e0b }
    ];

    const activeAAsCount = Math.max(1, Math.min(aminoAcidColors.length, Math.floor(1 + t * 5)));
    const peptidePts: THREE.Vector3[] = [];

    for (let k = 0; k < activeAAsCount; k++) {
      const u = k / Math.max(1, activeAAsCount - 1);
      const px = riboX - 0.4 + Math.sin(k * 1.2) * 0.8 + (isTerminating ? (k + 1) * 0.8 : 0);
      const py = 4.0 + (isTerminating ? 2.5 : 0) + k * 1.5;
      const pz = 0.5 + Math.cos(k * 1.2) * 0.8;
      peptidePts.push(new THREE.Vector3(px, py, pz));
    }

    if (peptidePts.length >= 2) {
      const peptideCurve = new THREE.CatmullRomCurve3(peptidePts);
      const peptideMesh = new THREE.Mesh(
        new THREE.TubeGeometry(peptideCurve, peptidePts.length * 8, 0.32, 12, false),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.2,
          metalness: 0.35,
          emissive: 0xd97706,
          emissiveIntensity: 0.25
        })
      );
      peptideMesh.userData = { partInfo: TRANSLATION_PARTS_INFO.polypeptide_chain };
      group.add(peptideMesh);
    }

    // Amino acid beads along peptide chain
    peptidePts.forEach((p, idx) => {
      const aaInfo = aminoAcidColors[idx] || aminoAcidColors[0];
      const aaBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.68, 16, 16),
        new THREE.MeshStandardMaterial({
          color: aaInfo.color,
          roughness: 0.2,
          metalness: 0.3
        })
      );
      aaBall.position.copy(p);
      aaBall.userData = {
        partInfo: {
          ...TRANSLATION_PARTS_INFO.polypeptide_chain,
          name: aaInfo.name,
          keyFact: `Amino acid số ${idx + 1} trên chuỗi polypeptide, nối qua liên kết peptide (-CO-NH-).`
        }
      };
      group.add(aaBall);
    });
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick Step Jump */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Dịch Mã Sinh Học 3D (Ribosome &amp; tARN)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kéo thanh trượt để quan sát Ribosome trượt dịch chuyển từng codon trên mARN và chuỗi polypeptide kéo dài liên tục.
          </p>
        </div>

        {/* Quick Stage Jump Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => { setProgress(10); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStep === 1 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 1 (10%)</span>
          </button>
          <button
            onClick={() => { setProgress(50); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStep === 2 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>GĐ 2 (50%)</span>
          </button>
          <button
            onClick={() => { setProgress(90); setInspectedDetail(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeStep === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
        stages={TRANSLATION_TIMELINE_STAGES}
        currentEventLabel={getTranslationEventLabel(progress)}
        accentColor="indigo"
        title="Tiến trình dịch mã protein"
      />

      {/* Main 3D Viewport & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Canvas */}
        <div className={`${inspectedDetail ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-8'} space-y-3 transition-all duration-300`}>
          <div
            className={`relative rounded-3xl border border-slate-300/80 overflow-hidden shadow-xl h-[480px] sm:h-[530px] transition-colors ${
              viewportTheme === 'deep'
                ? 'bg-[#070c18]'
                : 'bg-gradient-to-b from-indigo-50/70 via-white to-sky-100/60'
            }`}
          >
            {/* Scientific HUD Overlay */}
            <div
              className={`absolute top-3 left-3 z-10 p-3 rounded-2xl backdrop-blur-md text-[11px] font-mono space-y-1 shadow-md pointer-events-none ${
                viewportTheme === 'deep'
                  ? 'bg-slate-950/80 border border-slate-800 text-slate-300'
                  : 'bg-white/85 border border-indigo-100 text-slate-700'
              }`}
            >
              <div className="text-indigo-400 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> CƠ CHẾ DỊCH MÃ PROTEIN
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Giai đoạn:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>{TRANSLATION_STAGES[activeStep].title.split(': ')[1]}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Đặc điểm:</span>{' '}
                <strong className="text-amber-400">{TRANSLATION_STAGES[activeStep].location}</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Tiến độ:</span>{' '}
                <strong className="text-indigo-400">{progress.toFixed(0)}%</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-indigo-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>Nhấp chuột vào Ribosome, tARN, codon mARN hoặc chuỗi peptide để <strong>xem chi tiết</strong></span>
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
                    autoRotate ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
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
                  <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-sm" />
                  <h3 className="text-base font-bold text-white">
                    {TRANSLATION_STAGES[activeStep].title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-mono">
                    Vị trí diễn ra sự kiện
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{TRANSLATION_STAGES[activeStep].location}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Diễn biến chi tiết
                  </span>
                  <p className="leading-relaxed">{TRANSLATION_STAGES[activeStep].details}</p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào nắp bán cầu tiểu phần lớn, đế tiểu phần bé, tARN màu xanh lá, chuỗi amino acid hoặc dải mARN để mở bảng thông tin chi tiết.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  BookOpen,
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

const RNA_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  nu_A: {
    id: 'nu_A',
    name: 'Adenine Ribonucleotide (A)',
    nameEn: 'Adenine Ribonucleotide',
    category: 'Đơn phân Purine',
    parentModel: 'Mô Hình Phân Tử RNA',
    structure: 'Gồm bazơ nitơ Adenine (2 vòng dị vòng thơm), đường Ribose (C₅H₁₀O₅) và gốc phosphate (PO₄³⁻).',
    functionRole: 'Bắt cặp bổ sung với Uracil (U) bằng 2 liên kết hydrogen trong cấu trúc cuộn cục bộ hoặc trong phiên mã/dịch mã.',
    keyFact: 'Khối lượng phân tử 347.2 Da; là thành phần của ATP (đồng tiền năng lượng của tế bào).',
    colorHex: '#ef4444'
  },
  nu_U: {
    id: 'nu_U',
    name: 'Uracil Ribonucleotide (U)',
    nameEn: 'Uracil Ribonucleotide',
    category: 'Đơn phân Pyrimidine',
    parentModel: 'Mô Hình Phân Tử RNA',
    structure: 'Bazơ nitơ Pyrimidine 1 vòng 6 cạnh, đường Ribose và gốc phosphate; không có nhóm methyl (-CH₃) như Thymine.',
    functionRole: 'Đơn phân ĐẶC TRƯNG CHỈ CÓ Ở RNA (thay thế Thymine của DNA); bắt cặp bổ sung với Adenine (A) qua 2 liên kết hydrogen.',
    keyFact: 'Giúp tế bào nhận diện và phân biệt giữa phân tử RNA truyền tin và phân tử DNA lưu trữ bền vững.',
    colorHex: '#f59e0b'
  },
  nu_G: {
    id: 'nu_G',
    name: 'Guanine Ribonucleotide (G)',
    nameEn: 'Guanine Ribonucleotide',
    category: 'Đơn phân Purine',
    parentModel: 'Mô Hình Phân Tử RNA',
    structure: 'Bazơ nitơ Guanine nhóm Purine vòng kép, gắn vào vị trí C1\' của đường Ribose.',
    functionRole: 'Bắt cặp bổ sung với Cytosine (C) bằng 3 liên kết hydrogen bền vững, tạo độ ổn định cấu trúc cho các vùng cuộn gập của tARN và rARN.',
    keyFact: 'Vùng RNA giàu G-C có nhiệt độ biến tính cao hơn do năng lượng của 3 liên kết hydro.',
    colorHex: '#eab308'
  },
  nu_C: {
    id: 'nu_C',
    name: 'Cytosine Ribonucleotide (C)',
    nameEn: 'Cytosine Ribonucleotide',
    category: 'Đơn phân Pyrimidine',
    parentModel: 'Mô Hình Phân Tử RNA',
    structure: 'Bazơ nitơ Pyrimidine 1 vòng 6 cạnh, kết hợp với đường Ribose và gốc phosphate.',
    functionRole: 'Bắt cặp bổ sung với Guanine (G) qua 3 liên kết hydrogen; có mặt ở cả phân tử DNA và RNA.',
    keyFact: 'Đóng vai trò quan trọng trong việc tạo các nút kẹp tóc (hairpin loops) trong RNA chức năng.',
    colorHex: '#10b981'
  },
  phosphate_group: {
    id: 'phosphate_group',
    name: 'Gốc Phosphate (PO₄³⁻ / H₃PO₄)',
    nameEn: 'Phosphate Group',
    category: 'Cầu nối liên kết',
    parentModel: 'Mô Hình Phân Tử RNA',
    structure: 'Nhóm vô cơ tích điện âm gắn vào nguyên tử carbon C5\' của đường Ribose.',
    functionRole: 'Tạo liên kết este với nhóm 3\'-OH của ribonucleotide kế tiếp, tạo nên trục phosphodiester bền vững.',
    keyFact: 'Điện tích âm của các gốc phosphate giúp phân tử RNA tan tốt trong nước và tạo điện thế âm bề mặt.',
    colorHex: '#f59e0b'
  },
  ribose_sugar: {
    id: 'ribose_sugar',
    name: 'Đường Pentose Ribose (C₅H₁₀O₅)',
    nameEn: 'Ribose Sugar (Pentose)',
    category: 'Thành phần đường',
    parentModel: 'Mô Hình Phân Tử RNA',
    structure: 'Đường 5 carbon dạng vòng furanose, có nhóm hydroxyl (-OH) tự do tại vị trí carbon C2\'.',
    functionRole: 'Khung cấu trúc trung tâm gắn gốc phosphate ở C5\' và bazơ nitơ ở C1\'.',
    keyFact: 'Chính nhóm -OH ở vị trí C2\' khiến phân tử RNA kém bền vững hơn DNA và dễ bị thủy phân trong môi trường kiềm.',
    colorHex: '#06b6d4'
  },
  trna_cca: {
    id: 'trna_cca',
    name: 'Đầu Gắn Axit Amin (Đầu 3\'-CCA)',
    nameEn: 'tRNA Amino Acid Acceptor Stem',
    category: 'Cấu trúc tARN',
    parentModel: 'tARN Cỏ Ba Lá (Transfer RNA)',
    structure: 'Đoạn tận cùng của đầu 3\' mang bộ ba ribonucleotide bất biến -C-C-A-3\'-OH.',
    functionRole: 'Vị trí tạo liên kết este hóa với nhóm carboxyl (-COOH) của amino acid tương ứng nhờ enzyme aminoacyl-tRNA synthetase.',
    keyFact: 'Amino acid được nạp vào đầu CCA tiêu tốn 1 phân tử ATP để hoạt hóa thành aminoacyl-tRNA.',
    colorHex: '#f43f5e'
  },
  trna_anticodon: {
    id: 'trna_anticodon',
    name: 'Thùy Đối Mã (Anticodon Loop)',
    nameEn: 'Anticodon Loop',
    category: 'Cấu trúc tARN',
    parentModel: 'tARN Cỏ Ba Lá (Transfer RNA)',
    structure: 'Vòng đơn gồm 7 ribonucleotide nằm ở cực đối diện với đầu gắn axit amin, chứa bộ ba đối mã (anticodon).',
    functionRole: 'Khớp bổ sung đối song song với bộ ba mã sao (codon) trên phân tử mARN trong quá trình dịch mã tại ribosome.',
    keyFact: 'Ví dụ: Anticodon 3\'-UAC-5\' khớp bổ sung với Codon mở đầu 5\'-AUG-3\'.',
    colorHex: '#eab308'
  },
  rrna_complex: {
    id: 'rrna_complex',
    name: 'Phức Hợp Hạt Ribosome (rARN + Protein)',
    nameEn: 'Ribosomal Complex (rRNA & Proteins)',
    category: 'Bào quan dịch mã',
    parentModel: 'Hạt Ribosome & rARN',
    structure: 'Gồm 2 tiểu đơn vị (lớn và bé) cấu thành từ các chuỗi rARN cuộn gập phức tạp với hàng chục protein cấu trúc.',
    functionRole: 'Nơi diễn ra quá trình dịch mã tổng hợp protein; phân tử rARN giữ vai trò ribozyme xúc tác tạo liên kết peptide.',
    keyFact: 'Chiếm đến 80% tổng lượng RNA có trong một tế bào sống.',
    colorHex: '#3b82f6'
  }
};

export const RnaModel: React.FC = () => {
  const [rnaMode, setRnaMode] = useState<'strand' | 'trna' | 'ribosome'>('strand');
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

  const getModeParts = (): ModelSubpartDetail[] => {
    if (rnaMode === 'strand') {
      return [
        RNA_PARTS_INFO.nu_A,
        RNA_PARTS_INFO.nu_U,
        RNA_PARTS_INFO.nu_G,
        RNA_PARTS_INFO.nu_C,
        RNA_PARTS_INFO.phosphate_group,
        RNA_PARTS_INFO.ribose_sugar
      ];
    }
    if (rnaMode === 'trna') {
      return [
        RNA_PARTS_INFO.trna_cca,
        RNA_PARTS_INFO.trna_anticodon,
        RNA_PARTS_INFO.nu_U,
        RNA_PARTS_INFO.nu_A,
        RNA_PARTS_INFO.nu_C
      ];
    }
    return [
      RNA_PARTS_INFO.rrna_complex,
      RNA_PARTS_INFO.nu_U,
      RNA_PARTS_INFO.nu_A,
      RNA_PARTS_INFO.phosphate_group
    ];
  };

  const currentParts = getModeParts();

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 30);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.3);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.9);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    build3DScene(rnaMode, mainGroup);

    // Raycaster for 3D interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = { x: 0, y: 0, time: 0 };

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotateRef.current && modelGroupRef.current && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.009;
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
  }, [rnaMode]);

  // Build 3D Geometries with rich interactive UserData
  const build3DScene = (mode: 'strand' | 'trna' | 'ribosome', group: THREE.Group) => {
    group.clear();

    if (mode === 'strand') {
      const rnaSequence: ('A' | 'U' | 'G' | 'C')[] = [
        'A', 'U', 'G', 'C', 'C', 'G', 'U', 'A', 'U', 'C', 'G', 'A', 'U', 'G'
      ];
      const count = rnaSequence.length;
      const radius = 4.0;
      const heightStep = 1.35;
      const angleStep = 0.55;

      const backbonePoints: THREE.Vector3[] = [];
      const sphereGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const sugarGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 5);
      const slabGeo = new THREE.BoxGeometry(2.2, 0.32, 0.7);

      const phosphateMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.4 });
      const riboseMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.2 });

      const baseMats: Record<'A' | 'U' | 'G' | 'C', THREE.MeshStandardMaterial> = {
        A: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.3 }),
        U: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.3 }),
        G: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3, metalness: 0.3 }),
        C: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.3 })
      };

      const basePartMap = {
        A: RNA_PARTS_INFO.nu_A,
        U: RNA_PARTS_INFO.nu_U,
        G: RNA_PARTS_INFO.nu_G,
        C: RNA_PARTS_INFO.nu_C,
      };

      const startY = -((count - 1) * heightStep) / 2;

      for (let i = 0; i < count; i++) {
        const base = rnaSequence[i];
        const angle = i * angleStep;
        const y = startY + i * heightStep;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        backbonePoints.push(new THREE.Vector3(x, y, z));

        // Phosphate node
        const pMesh = new THREE.Mesh(sphereGeo, phosphateMat);
        pMesh.position.set(x, y, z);
        pMesh.userData = { partInfo: RNA_PARTS_INFO.phosphate_group };
        group.add(pMesh);

        // Ribose sugar node
        const sMesh = new THREE.Mesh(sugarGeo, riboseMat);
        const sx = Math.cos(angle + 0.12) * (radius - 0.5);
        const sz = Math.sin(angle + 0.12) * (radius - 0.5);
        sMesh.position.set(sx, y + 0.15, sz);
        sMesh.rotation.y = angle;
        sMesh.userData = { partInfo: RNA_PARTS_INFO.ribose_sugar };
        group.add(sMesh);

        // Nitrogenous base pointing inward
        const bMesh = new THREE.Mesh(slabGeo, baseMats[base]);
        const bx = Math.cos(angle) * (radius - 1.6);
        const bz = Math.sin(angle) * (radius - 1.6);
        bMesh.position.set(bx, y, bz);
        bMesh.rotation.y = -angle;
        bMesh.userData = { partInfo: basePartMap[base] };
        group.add(bMesh);

        // Bold High-Contrast Nucleotide Letter Sprite
        const sprite = createNuSprite(base, {
          size: 1.4,
          depthTest: false,
          bgColor: basePartMap[base].colorHex
        });
        sprite.position.set(bx, y, bz);
        sprite.userData = { partInfo: basePartMap[base] };
        group.add(sprite);
      }

      // Smooth backbone curve
      const curve = new THREE.CatmullRomCurve3(backbonePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.22, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.3,
        metalness: 0.6
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.userData = { partInfo: RNA_PARTS_INFO.ribose_sugar };
      group.add(tubeMesh);

    } else if (mode === 'trna') {
      // 2. tRNA Cloverleaf 3D Model
      // Stem
      const stemPoints = [new THREE.Vector3(0, 7, 0), new THREE.Vector3(0, 2, 0)];
      const stemCurve = new THREE.CatmullRomCurve3(stemPoints);
      const stemMesh = new THREE.Mesh(
        new THREE.TubeGeometry(stemCurve, 20, 0.45, 12, false),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.4 })
      );
      stemMesh.userData = { partInfo: RNA_PARTS_INFO.trna_cca };
      group.add(stemMesh);

      // 3' CCA amino acid acceptor stem - Distinct C-C-A-3' nucleotides
      const ccaBases = [
        { letter: 'C', y: 7.8, info: RNA_PARTS_INFO.nu_C },
        { letter: 'C', y: 8.8, info: RNA_PARTS_INFO.nu_C },
        { letter: 'A', y: 9.8, info: RNA_PARTS_INFO.nu_A },
      ];
      ccaBases.forEach((item, idx) => {
        const s = new THREE.Mesh(
          new THREE.SphereGeometry(0.55, 16, 16),
          new THREE.MeshStandardMaterial({
            color: item.letter === 'A' ? 0xef4444 : 0xd97706,
            roughness: 0.25
          })
        );
        s.position.set(0, item.y, 0);
        s.userData = { partInfo: item.info };
        group.add(s);

        const nuSprite = createNuSprite(item.letter, {
          size: 1.1,
          depthTest: false,
          bgColor: item.letter === 'A' ? '#ef4444' : '#d97706'
        });
        nuSprite.position.set(0, item.y, 0.5);
        nuSprite.userData = { partInfo: item.info };
        group.add(nuSprite);
      });

      // Amino acid attached at top (Methionine sphere)
      const aaSphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.2, metalness: 0.4 })
      );
      aaSphere.position.set(0, 11.2, 0);
      aaSphere.userData = { partInfo: RNA_PARTS_INFO.trna_cca };
      group.add(aaSphere);

      // Anticodon loop
      const aLoop = new THREE.Mesh(
        new THREE.TorusGeometry(2.5, 0.38, 12, 32, Math.PI * 1.5),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.4 })
      );
      aLoop.position.set(0, -3.8, 0);
      aLoop.rotation.z = Math.PI;
      aLoop.userData = { partInfo: RNA_PARTS_INFO.trna_anticodon };
      group.add(aLoop);

      // Anticodon triplet spheres (U-A-C) with explicit Nu letters
      const triplet = [
        { b: 'U', info: RNA_PARTS_INFO.nu_U, color: 0xea580c, hexBg: '#ea580c' },
        { b: 'A', info: RNA_PARTS_INFO.nu_A, color: 0xdc2626, hexBg: '#dc2626' },
        { b: 'C', info: RNA_PARTS_INFO.nu_C, color: 0xd97706, hexBg: '#d97706' }
      ];
      triplet.forEach((item, idx) => {
        const xPos = (idx - 1) * 1.4;
        const s = new THREE.Mesh(
          new THREE.SphereGeometry(0.55, 16, 16),
          new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.25 })
        );
        s.position.set(xPos, -6.6, 0);
        s.userData = { partInfo: item.info };
        group.add(s);

        const sprite = createNuSprite(item.b, {
          size: 1.25,
          depthTest: false,
          bgColor: item.hexBg
        });
        sprite.position.set(xPos, -6.6, 0.4);
        sprite.userData = { partInfo: item.info };
        group.add(sprite);
      });

    } else {
      // 3. rRNA & Ribosome Complex
      const largeSubunit = new THREE.Mesh(
        new THREE.SphereGeometry(4.8, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.7),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.2 })
      );
      largeSubunit.position.set(0, 2.2, 0);
      largeSubunit.rotation.x = Math.PI;
      largeSubunit.userData = { partInfo: RNA_PARTS_INFO.rrna_complex };
      group.add(largeSubunit);

      const smallSubunit = new THREE.Mesh(
        new THREE.CylinderGeometry(4.5, 3.8, 2.2, 32),
        new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.4, metalness: 0.3 })
      );
      smallSubunit.position.set(0, -2.6, 0);
      smallSubunit.userData = { partInfo: RNA_PARTS_INFO.rrna_complex };
      group.add(smallSubunit);

      const rnaPoints = [
        new THREE.Vector3(-9, -0.4, 0),
        new THREE.Vector3(-4, -0.4, 1.2),
        new THREE.Vector3(0, -0.4, 1.5),
        new THREE.Vector3(4, -0.4, 1.2),
        new THREE.Vector3(9, -0.4, 0),
      ];
      const rnaCurve = new THREE.CatmullRomCurve3(rnaPoints);
      const rnaMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rnaCurve, 40, 0.28, 12, false),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.5 })
      );
      rnaMesh.userData = { partInfo: RNA_PARTS_INFO.nu_U };
      group.add(rnaMesh);

      // mRNA Codon Nucleotides traversing through the ribosome
      const mrnaNuList: { b: string; x: number; z: number }[] = [
        { b: 'A', x: -6.0, z: 0.6 },
        { b: 'U', x: -4.0, z: 1.2 },
        { b: 'G', x: -2.0, z: 1.4 },
        { b: 'C', x: 0.0, z: 1.5 },
        { b: 'A', x: 2.0, z: 1.4 },
        { b: 'U', x: 4.0, z: 1.2 },
        { b: 'G', x: 6.0, z: 0.6 },
      ];
      mrnaNuList.forEach(item => {
        const sprite = createNuSprite(item.b, {
          size: 1.1,
          depthTest: false
        });
        sprite.position.set(item.x, -0.4, item.z + 0.3);
        const part =
          item.b === 'A'
            ? RNA_PARTS_INFO.nu_A
            : item.b === 'U'
            ? RNA_PARTS_INFO.nu_U
            : item.b === 'G'
            ? RNA_PARTS_INFO.nu_G
            : RNA_PARTS_INFO.nu_C;
        sprite.userData = { partInfo: part };
        group.add(sprite);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm RNA 3D Tương Tác
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khảo sát chuỗi đơn RNA 3D, phân tử tARN cỏ ba lá và phức hệ hạt Ribosome (rARN + protein)
          </p>
        </div>

        {/* 3D Mode Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          {[
            { id: 'strand', label: '1. Chuỗi đơn RNA 3D' },
            { id: 'trna', label: '2. tARN Cỏ 3 Lá' },
            { id: 'ribosome', label: '3. Ribosome & rARN' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                setRnaMode(m.id as any);
                setInspectedDetail(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                rnaMode === m.id
                  ? 'bg-amber-600 text-white shadow-xs'
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
        {/* Left Column: 3D Canvas Viewport */}
        <div className={`${inspectedDetail ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-8'} space-y-3 transition-all duration-300`}>
          <div
            className={`relative rounded-3xl border border-slate-300/80 overflow-hidden shadow-xl h-[480px] sm:h-[530px] transition-colors ${
              viewportTheme === 'deep'
                ? 'bg-[#070c18]'
                : 'bg-gradient-to-b from-amber-50/70 via-white to-sky-100/60'
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
              <div className="text-amber-400 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> THÔNG SỐ KHÔNG GIAN RNA
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Cấu trúc:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>Mạch đơn (Single-stranded)</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Đường pentose:</span>{' '}
                <strong className="text-cyan-400">Ribose (C₅H₁₀O₅, có -OH ở C2')</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Bazơ đặc trưng:</span>{' '}
                <strong className="text-amber-400">Uracil (U) thay thế Thymine (T)</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-amber-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Nhấp chuột vào nucleotide A, U, G, C, gốc phosphate hoặc đường ribose để <strong>xem chi tiết</strong></span>
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
                    autoRotate ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  {viewportTheme === 'deep' ? '☀️ Phông Sáng' : '🌌 Phông Tối'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Component Selection Buttons */}
          <ModelPartsChipsList
            parts={currentParts}
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
              allParts={currentParts}
            />
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                  <h3 className="text-base font-bold text-white">
                    {rnaMode === 'strand' && 'Cấu Trúc Chuỗi Đơn RNA'}
                    {rnaMode === 'trna' && 'tARN Cỏ Ba Lá (Transfer RNA)'}
                    {rnaMode === 'ribosome' && 'Hạt Ribosome & rARN'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Đặc điểm chuỗi RNA đơn
                  </span>
                  <p className="leading-relaxed">
                    Khác với DNA chuỗi xoắn kép, RNA hầu hết tồn tại ở dạng <strong className="text-white">mạch đơn</strong>, kích thước ngắn hơn nhiều và có tính mềm dẻo cao để thực hiện chức năng truyền đạt hoặc vận chuyển thông tin di truyền.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-mono">
                    So sánh DNA và RNA
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    <li>• <strong className="text-white">Đường:</strong> Ribose (C₅H₁₀O₅) thay vì Deoxyribose.</li>
                    <li>• <strong className="text-white">Bazơ:</strong> Uracil (U) thay thế cho Thymine (T).</li>
                    <li>• <strong className="text-white">Số mạch:</strong> 1 mạch đơn (trừ một số virus có RNA kép).</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp vào bất kỳ khối nucleotide A, U, G, C, gốc phosphate vàng hoặc hạt ribose xanh để mở bảng giải thích chi tiết.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

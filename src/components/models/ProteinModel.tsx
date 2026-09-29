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

interface ProteinLevelDetail {
  level: number;
  name: string;
  nameVi: string;
  bonds: string;
  characteristics: string;
  examples: string;
  colorHex: string;
}

const PROTEIN_LEVELS: Record<1 | 2 | 3 | 4, ProteinLevelDetail> = {
  1: {
    level: 1,
    name: 'Primary Structure',
    nameVi: 'Cấu Trúc Bậc 1 (Chuỗi Tuyến Tính)',
    bonds: 'Liên kết peptide đồng hóa trị (-CO-NH-)',
    characteristics: 'Trình tự sắp xếp các amino acid theo chuỗi mạch thẳng. Quy định toàn bộ cấu trúc không gian bậc 2, 3, 4 và tính đặc thù của phân tử protein.',
    examples: 'Chuỗi polypeptide ban đầu vừa tổng hợp xong tại ribosome.',
    colorHex: '#38bdf8'
  },
  2: {
    level: 2,
    name: 'Secondary Structure',
    nameVi: 'Cấu Trúc Bậc 2 (Xoắn α & Gấp nếp β)',
    bonds: 'Liên kết Hydrogen giữa các nhóm -C=O và -N-H của các liên kết peptide lân cận',
    characteristics: 'Chuỗi polypeptide cuộn xoắn dạng lò xo xoắn phải (Alpha-helix) hoặc gấp nếp song song lượn sóng (Beta-pleated sheet).',
    examples: 'Keratin (tóc, móng) dạng xoắn α; Fibroin (tơ tằm) dạng phiến gấp β.',
    colorHex: '#a855f7'
  },
  3: {
    level: 3,
    name: 'Tertiary Structure',
    nameVi: 'Cấu Trúc Bậc 3 (Không Gian 3 Chiều Hoàn Chỉnh)',
    bonds: 'Cầu nối Disulfide (-S-S-), liên kết ion, tương tác kỵ nước, liên kết hydrogen',
    characteristics: 'Cấu trúc bậc 2 tiếp tục cuộn gập thành hình cầu (globular) hoặc dạng sợi không gian 3 chiều đặc thù, tạo nên trung tâm hoạt động của enzyme.',
    examples: 'Myoglobin (dự trữ oxy trong cơ), enzyme lysozyme, kháng thể đơn phân.',
    colorHex: '#f59e0b'
  },
  4: {
    level: 4,
    name: 'Quaternary Structure',
    nameVi: 'Cấu Trúc Bậc 4 (Phức Hệ Đa Chuỗi)',
    bonds: 'Tương tác phi cộng hóa trị (kỵ nước, ion, hydrogen) giữa các chuỗi polypeptide',
    characteristics: 'Gồm từ hai hay nhiều chuỗi polypeptide (tiểu đơn vị) liên kết phối hợp với nhau tạo thành một phức hệ protein hoàn chỉnh có hoạt tính sinh học.',
    examples: 'Hemoglobin (gồm 2 chuỗi α + 2 chuỗi β quanh 4 nhân Heme chứa Fe²⁺).',
    colorHex: '#ef4444'
  }
};

const PROTEIN_PARTS_INFO: Record<string, ModelSubpartDetail> = {
  peptide_bond: {
    id: 'peptide_bond',
    name: 'Liên Kết Peptide (-CO-NH-)',
    nameEn: 'Peptide Bond',
    category: 'Liên kết hóa học',
    parentModel: 'Cấu Trúc Bậc 1 Protein',
    structure: 'Liên kết cộng hóa trị bền vững tạo thành giữa nhóm carboxyl (-COOH) của amino acid này với nhóm amino (-NH₂) của amino acid kế tiếp, đồng thời giải phóng 1 phân tử nước (H₂O).',
    functionRole: 'Khung xương hóa học liên kết các đơn phân amino acid thành chuỗi polypeptide mạch dài, quyết định tính bền vững của protein.',
    keyFact: 'Khoảng cách liên kết C-N ngắn hơn bình thường (1.32 Å) do mang một phần đặc tính của liên kết đôi, không thể tự do quay quanh trục.',
    colorHex: '#ffffff'
  },
  amino_acid: {
    id: 'amino_acid',
    name: 'Đơn Phân Amino Acid',
    nameEn: 'Amino Acid Residue',
    category: 'Đơn vị cấu trúc',
    parentModel: 'Cấu Trúc Bậc 1 Protein',
    structure: 'Gồm 1 nguyên tử carbon trung tâm (Cα) liên kết với nhóm amino (-NH₂), nhóm carboxyl (-COOH), 1 nguyên tử H và gốc biến tính R đặc thù (có 20 loại amino acid khác nhau).',
    functionRole: 'Đơn phân cấu tạo nên protein; trình tự sắp xếp các amino acid do trình tự các nucleotide trên gen quy định.',
    keyFact: 'Cơ thể người có 9 amino acid thiết yếu không thể tự tổng hợp mà phải lấy từ thức ăn.',
    colorHex: '#38bdf8'
  },
  alpha_helix: {
    id: 'alpha_helix',
    name: 'Cấu Trúc Xoắn Alpha (α-Helix)',
    nameEn: 'Alpha Helix',
    category: 'Cấu trúc bậc 2',
    parentModel: 'Cấu Trúc Bậc 2 Protein',
    structure: 'Chuỗi polypeptide cuộn xoắn theo hình lò xo xoắn phải đều đặn. Cứ mỗi vòng xoắn gồm khoảng 3.6 gốc amino acid với bước xoắn 0.54 nm.',
    functionRole: 'Được giữ vững nhờ các liên kết hydrogen nội chuỗi giữa nhóm C=O của amino acid thứ n với nhóm N-H của amino acid thứ n+4.',
    keyFact: 'Rất phong phú trong cấu trúc các protein dạng sợi như keratin (tóc, móng tay, lông sừng).',
    colorHex: '#38bdf8'
  },
  beta_sheet: {
    id: 'beta_sheet',
    name: 'Phiến Gấp Nếp Beta (β-Pleated Sheet)',
    nameEn: 'Beta-Pleated Sheet',
    category: 'Cấu trúc bậc 2',
    parentModel: 'Cấu Trúc Bậc 2 Protein',
    structure: 'Các đoạn mạch polypeptide xếp song song hoặc đối song song với nhau, tạo thành các nếp gấp lượn sóng ziczac trong không gian.',
    functionRole: 'Liên kết hydrogen hình thành vuông góc giữa các mạch lân cận, tạo độ bền cơ học cao và tính mềm dẻo.',
    keyFact: 'Thành phần cấu tạo chủ yếu của tơ tằm (fibroin), mạng nhện và màng sinh chất.',
    colorHex: '#a855f7'
  },
  h_bonds_sec: {
    id: 'h_bonds_sec',
    name: 'Liên Kết Hydrogen Bậc 2',
    nameEn: 'Secondary Hydrogen Bonds',
    category: 'Liên kết thứ cấp',
    parentModel: 'Cấu Trúc Bậc 2 Protein',
    structure: 'Lực hút tĩnh điện yếu giữa nguyên tử H tích điện dương một phần (-NH-) và nguyên tử O tích điện âm một phần (-C=O).',
    functionRole: 'Duy trì hình thái xoắn α và phiến gấp β ổn định, tuy yếu đơn lẻ nhưng tập hợp với số lượng lớn tạo liên kết bền.',
    keyFact: 'Dễ bị phá vỡ khi nhiệt độ tăng cao dẫn đến hiện tượng biến tính protein.',
    colorHex: '#f1f5f9'
  },
  disulfide_bridge: {
    id: 'disulfide_bridge',
    name: 'Cầu Nối Disulfide (-S-S-)',
    nameEn: 'Disulfide Bridge',
    category: 'Cấu trúc bậc 3',
    parentModel: 'Cấu Trúc Bậc 3 Protein',
    structure: 'Liên kết cộng hóa trị giữa 2 nhóm sulfhydryl (-SH) của hai gốc amino acid Cysteine nằm ở các vị trí khác nhau trong chuỗi.',
    functionRole: 'Khóa chặt các vòng cuộn gập không gian 3D, giúp protein chịu nhiệt và chống lại sự phân hủy sinh học.',
    keyFact: 'Cực kỳ bền vững, chỉ bị bẻ gãy bởi các chất khử mạnh như beta-mercaptoethanol.',
    colorHex: '#eab308'
  },
  active_site: {
    id: 'active_site',
    name: 'Trung Tâm Hoạt Động (Active Site)',
    nameEn: 'Enzyme Active Site',
    category: 'Vùng chức năng',
    parentModel: 'Cấu Trúc Bậc 3 Protein',
    structure: 'Vùng khe lõm hoặc túi đặc thù trên bề mặt protein hình cầu, tạo bởi sự cuộn gập phối hợp của các amino acid đặc hiệu.',
    functionRole: 'Nơi gắn đặc hiệu với cơ chất (substrate) để xúc tác phản ứng sinh hóa theo cơ chế chìa khóa - ổ khóa.',
    keyFact: 'Nếu cấu trúc không gian bậc 3 bị biến đổi (biến tính), trung tâm hoạt động bị mất hình dạng khiến enzyme mất hoàn toàn hoạt tính.',
    colorHex: '#f59e0b'
  },
  heme_group: {
    id: 'heme_group',
    name: 'Nhóm Heme Chứa Fe²⁺',
    nameEn: 'Heme Prosthetic Group',
    category: 'Nhóm ngoại sinh học',
    parentModel: 'Cấu Trúc Bậc 4 (Hemoglobin)',
    structure: 'Vòng porphyrin phẳng mang 1 nguyên tử sắt hóa trị hai (Fe²⁺) nằm ở trung tâm của mỗi tiểu đơn vị polypeptide.',
    functionRole: 'Nguyên tử Fe²⁺ liên kết phối trí thuận nghịch với 1 phân tử oxy (O₂), cho phép Hemoglobin vận chuyển O₂ từ phổi đến tế bào.',
    keyFact: 'Mỗi phân tử Hemoglobin có 4 nhân Heme, do đó có thể vận chuyển tối đa 4 phân tử khí O₂.',
    colorHex: '#ef4444'
  },
  subunit_alpha: {
    id: 'subunit_alpha',
    name: 'Tiểu Đơn Vị Chuỗi Polypeptide α',
    nameEn: 'Alpha Globin Subunit',
    category: 'Cấu trúc bậc 4',
    parentModel: 'Cấu Trúc Bậc 4 (Hemoglobin)',
    structure: 'Gồm 141 amino acid cuộn xoắn bậc 3 đặc trưng, liên kết chặt chẽ với nhân Heme.',
    functionRole: 'Phối hợp với chuỗi beta tạo thành tứ phân tử (tetramer) Hemoglobin hoàn chỉnh.',
    keyFact: 'Có 2 chuỗi alpha trong một phân tử Hemoglobin bình thường (HbA).',
    colorHex: '#38bdf8'
  },
  subunit_beta: {
    id: 'subunit_beta',
    name: 'Tiểu Đơn Vị Chuỗi Polypeptide β',
    nameEn: 'Beta Globin Subunit',
    category: 'Cấu trúc bậc 4',
    parentModel: 'Cấu Trúc Bậc 4 (Hemoglobin)',
    structure: 'Gồm 146 amino acid cuộn bậc 3, nơi xảy ra đột biến điểm ở codon số 6 gây bệnh hồng cầu hình liềm.',
    functionRole: 'Phối hợp hiệu ứng dị lập thể (cooperativity) giúp tăng cường khả năng bắt nhả oxy hiệu quả.',
    keyFact: 'Có 2 chuỗi beta trong phân tử Hemoglobin người lớn (HbA: α₂β₂).',
    colorHex: '#a855f7'
  }
};

export const ProteinModel: React.FC = () => {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
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

  // Get relevant parts for current level
  const getCurrentLevelParts = (): ModelSubpartDetail[] => {
    if (level === 1) return [PROTEIN_PARTS_INFO.peptide_bond, PROTEIN_PARTS_INFO.amino_acid];
    if (level === 2) return [PROTEIN_PARTS_INFO.alpha_helix, PROTEIN_PARTS_INFO.beta_sheet, PROTEIN_PARTS_INFO.h_bonds_sec];
    if (level === 3) return [PROTEIN_PARTS_INFO.disulfide_bridge, PROTEIN_PARTS_INFO.active_site, PROTEIN_PARTS_INFO.alpha_helix];
    return [PROTEIN_PARTS_INFO.heme_group, PROTEIN_PARTS_INFO.subunit_alpha, PROTEIN_PARTS_INFO.subunit_beta];
  };

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

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.9);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    modelGroupRef.current = mainGroup;

    buildProtein3DScene(level, mainGroup);

    // Raycaster for 3D interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = { x: 0, y: 0, time: 0 };

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotateRef.current && modelGroupRef.current && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.009;
        modelGroupRef.current.rotation.x += 0.002;
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
        // Hover raycasting
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
  }, [level]);

  // Build 3D Geometries for 4 Protein Levels with detailed interactive UserData
  const buildProtein3DScene = (lvl: 1 | 2 | 3 | 4, group: THREE.Group) => {
    group.clear();

    if (lvl === 1) {
      // BẬC 1: Chuỗi amino acid 3D lượn sóng liên kết peptide (-CO-NH-)
      const aminoAcids = [
        { code: 'Met', color: 0xef4444, name: 'Methionine (Mở đầu)' },
        { code: 'Ala', color: 0x3b82f6, name: 'Alanine' },
        { code: 'Gly', color: 0x10b981, name: 'Glycine' },
        { code: 'Leu', color: 0xf59e0b, name: 'Leucine' },
        { code: 'Val', color: 0x8b5cf6, name: 'Valine' },
        { code: 'Ser', color: 0x06b6d4, name: 'Serine' },
        { code: 'His', color: 0xec4899, name: 'Histidine' },
        { code: 'Pro', color: 0x14b8a6, name: 'Proline' },
        { code: 'Phe', color: 0xeab308, name: 'Phenylalanine' },
        { code: 'Tyr', color: 0x6366f1, name: 'Tyrosine' }
      ];

      const points: THREE.Vector3[] = [];
      aminoAcids.forEach((aa, i) => {
        const x = (i - 4.5) * 2.2;
        const y = Math.sin(i * 0.8) * 2.5;
        const z = Math.cos(i * 0.8) * 2.0;
        points.push(new THREE.Vector3(x, y, z));

        // Sphere for amino acid
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.75, 24, 24),
          new THREE.MeshStandardMaterial({ color: aa.color, roughness: 0.25, metalness: 0.3 })
        );
        sphere.position.set(x, y, z);
        sphere.userData = {
          partInfo: {
            ...PROTEIN_PARTS_INFO.amino_acid,
            name: `Amino Acid: ${aa.name} (${aa.code})`,
            keyFact: `Vị trí thứ ${i + 1} trong chuỗi polypeptide. Mã hóa bởi bộ ba tương ứng trên phân tử mARN.`
          }
        };
        group.add(sphere);

        // Label sprite
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(aa.code, 64, 32);

        const tex = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
        sprite.position.set(x, y + 1.2, z);
        sprite.scale.set(1.5, 0.75, 1);
        sprite.userData = {
          partInfo: {
            ...PROTEIN_PARTS_INFO.amino_acid,
            name: `Gốc amino acid ${aa.code}`
          }
        };
        group.add(sprite);
      });

      // Peptide bond backbone tube
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeMesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 60, 0.22, 12, false),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.6 })
      );
      tubeMesh.userData = { partInfo: PROTEIN_PARTS_INFO.peptide_bond };
      group.add(tubeMesh);

    } else if (lvl === 2) {
      // BẬC 2: Alpha-Helix (Xoắn lò xo 3D) và Beta-Sheet (Phiến gấp ziczac 3D)
      // 1. Alpha-Helix Spiral on left
      const helixPoints: THREE.Vector3[] = [];
      const turns = 4.5;
      const pointsPerTurn = 16;
      const totalPoints = turns * pointsPerTurn;
      for (let i = 0; i < totalPoints; i++) {
        const t = (i / totalPoints) * turns * Math.PI * 2;
        const x = -5.5 + Math.cos(t) * 2.2;
        const y = (i / totalPoints) * 14 - 7;
        const z = Math.sin(t) * 2.2;
        helixPoints.push(new THREE.Vector3(x, y, z));
      }
      const helixCurve = new THREE.CatmullRomCurve3(helixPoints);
      const helixMesh = new THREE.Mesh(
        new THREE.TubeGeometry(helixCurve, 100, 0.42, 16, false),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.5 })
      );
      helixMesh.userData = { partInfo: PROTEIN_PARTS_INFO.alpha_helix };
      group.add(helixMesh);

      // Hydrogen bonds inside helix
      for (let i = 0; i < totalPoints - 8; i += 6) {
        const p1 = helixPoints[i];
        const p2 = helixPoints[i + 6];
        const rodPoints = [p1, p2];
        const rodCurve = new THREE.CatmullRomCurve3(rodPoints);
        const rodMesh = new THREE.Mesh(
          new THREE.TubeGeometry(rodCurve, 10, 0.08, 8, false),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        rodMesh.userData = { partInfo: PROTEIN_PARTS_INFO.h_bonds_sec };
        group.add(rodMesh);
      }

      // 2. Beta-Sheet Pleated Ribbons on right
      for (let strand = 0; strand < 3; strand++) {
        const sheetPoints: THREE.Vector3[] = [];
        const zOffset = (strand - 1) * 2.0;
        for (let i = 0; i < 9; i++) {
          const x = 3.5 + (i % 2 === 0 ? 0.7 : -0.7);
          const y = (i / 8) * 13 - 6.5;
          const z = zOffset;
          sheetPoints.push(new THREE.Vector3(x, y, z));
        }
        const sheetCurve = new THREE.CatmullRomCurve3(sheetPoints);
        const strandMesh = new THREE.Mesh(
          new THREE.TubeGeometry(sheetCurve, 30, 0.35, 12, false),
          new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3, metalness: 0.5 })
        );
        strandMesh.userData = { partInfo: PROTEIN_PARTS_INFO.beta_sheet };
        group.add(strandMesh);
      }

    } else if (lvl === 3) {
      // BẬC 3: Cuộn gập không gian 3 chiều hoàn chỉnh (Globular Fold)
      const knotPoints: THREE.Vector3[] = [];
      const numPts = 120;
      for (let i = 0; i <= numPts; i++) {
        const t = (i / numPts) * Math.PI * 4;
        const x = Math.sin(t) * 4.2 + Math.cos(2 * t) * 1.8;
        const y = Math.cos(t) * 4.2 + Math.sin(3 * t) * 1.5;
        const z = Math.sin(3 * t) * 2.8;
        knotPoints.push(new THREE.Vector3(x, y, z));
      }
      const knotCurve = new THREE.CatmullRomCurve3(knotPoints);
      const knotMesh = new THREE.Mesh(
        new THREE.TubeGeometry(knotCurve, 120, 0.42, 16, false),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.4 })
      );
      knotMesh.userData = { partInfo: PROTEIN_PARTS_INFO.alpha_helix };
      group.add(knotMesh);

      // Cầu nối Disulfide (-S-S-)
      const disBridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 3.6, 12),
        new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2, metalness: 0.6 })
      );
      disBridge.position.set(0, 1.2, 0);
      disBridge.rotation.z = Math.PI / 3;
      disBridge.userData = { partInfo: PROTEIN_PARTS_INFO.disulfide_bridge };
      group.add(disBridge);

      // Active site cleft sphere
      const activePocket = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.85 })
      );
      activePocket.position.set(1.5, -1.8, 1.2);
      activePocket.userData = { partInfo: PROTEIN_PARTS_INFO.active_site };
      group.add(activePocket);

    } else {
      // BẬC 4: Phức hệ đa chuỗi Hemoglobin (4 tiểu đơn vị + 4 nhân Heme Fe²⁺)
      const subunitPositions = [
        { x: -3.5, y: 3.2, z: -1.0, color: 0x38bdf8, info: PROTEIN_PARTS_INFO.subunit_alpha },
        { x: 3.5, y: 3.2, z: 1.0, color: 0x38bdf8, info: PROTEIN_PARTS_INFO.subunit_alpha },
        { x: -3.5, y: -3.2, z: 1.0, color: 0xa855f7, info: PROTEIN_PARTS_INFO.subunit_beta },
        { x: 3.5, y: -3.2, z: -1.0, color: 0xa855f7, info: PROTEIN_PARTS_INFO.subunit_beta }
      ];

      subunitPositions.forEach(sub => {
        // Globular subunit cluster
        const subMesh = new THREE.Mesh(
          new THREE.SphereGeometry(3.0, 24, 24),
          new THREE.MeshStandardMaterial({ color: sub.color, roughness: 0.4, metalness: 0.2, transparent: true, opacity: 0.88 })
        );
        subMesh.position.set(sub.x, sub.y, sub.z);
        subMesh.userData = { partInfo: sub.info };
        group.add(subMesh);

        // Heme group disk
        const hemeMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.1, 1.1, 0.35, 20),
          new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2, metalness: 0.6 })
        );
        hemeMesh.position.set(sub.x * 0.7, sub.y * 0.7, sub.z * 0.7);
        hemeMesh.rotation.x = Math.PI / 4;
        hemeMesh.userData = { partInfo: PROTEIN_PARTS_INFO.heme_group };
        group.add(hemeMesh);

        // Fe2+ iron ion in center
        const feIon = new THREE.Mesh(
          new THREE.SphereGeometry(0.42, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.1, metalness: 0.8 })
        );
        feIon.position.set(sub.x * 0.7, sub.y * 0.7, sub.z * 0.7);
        feIon.userData = { partInfo: PROTEIN_PARTS_INFO.heme_group };
        group.add(feIon);
      });
    }
  };

  const currentParts = getCurrentLevelParts();

  return (
    <div className="space-y-4">
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h3 className="text-lg font-black text-slate-900">
              Phòng Thí Nghiệm Protein 3D (4 Bậc Cấu Trúc Không Gian)
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              MÔ HÌNH 3D WEBGL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khảo sát cấu trúc bậc 1 (chuỗi peptide) ──→ bậc 2 (α-helix, β-sheet) ──→ bậc 3 (cầu disulfide) ──→ bậc 4 (Hemoglobin)
          </p>
        </div>

        {/* Level Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs shrink-0">
          {([1, 2, 3, 4] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                setInspectedDetail(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                level === lvl
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Bậc {lvl}</span>
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
                : 'bg-gradient-to-b from-sky-50/80 via-white to-sky-100/60'
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
                <Activity className="h-3 w-3" /> CẤU TRÚC PROTEIN 3D
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Mức cấu trúc:</span>{' '}
                <strong className={viewportTheme === 'deep' ? 'text-white' : 'text-slate-900'}>Bậc {level} ({PROTEIN_LEVELS[level].nameVi.split(' (')[0]})</strong>
              </div>
              <div>
                <span className={viewportTheme === 'deep' ? 'text-slate-400' : 'text-slate-500'}>Liên kết duy trì:</span>{' '}
                <strong className="text-amber-400">{PROTEIN_LEVELS[level].bonds}</strong>
              </div>
            </div>

            {/* Top Prompt / Status Pill */}
            {!inspectedDetail ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-sky-400/50 text-white text-[11px] backdrop-blur-md shadow-lg animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>Nhấp chuột vào bất kỳ chi tiết nào trên mô hình để <strong>xem giải thích ngắn gọn</strong></span>
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
                  <div className="w-3 h-3 rounded-full bg-sky-400 shadow-sm" />
                  <h3 className="text-base font-bold text-white">
                    {PROTEIN_LEVELS[level].nameVi}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-mono">
                    Đặc điểm cấu tạo
                  </span>
                  <p className="leading-relaxed">{PROTEIN_LEVELS[level].characteristics}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">
                    Liên kết hóa học duy trì
                  </span>
                  <p className="leading-relaxed font-semibold text-white">{PROTEIN_LEVELS[level].bonds}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-mono">
                    Ví dụ sinh học điển hình
                  </span>
                  <p className="leading-relaxed">{PROTEIN_LEVELS[level].examples}</p>
                </div>

                <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 text-sky-200">
                  <span className="font-bold block mb-1">Mẹo tương tác 3D:</span>
                  Nhấp trực tiếp chuột vào các chi tiết (liên kết peptide, xoắn α, nếp β, cầu disulfide, nhân heme...) để mở thông tin phân tích ngắn gọn.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

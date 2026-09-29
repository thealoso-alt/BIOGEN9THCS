import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, Info, Volume2, CheckCircle2, Box } from 'lucide-react';
import { ModelSubpartDetail, ModelDetailCard, HoverTooltip, QuickPartsBar, speakScientificTerm, playToneEffect } from './ModelInspectionHUD';

const GENE_DETAILS: Record<string, ModelSubpartDetail> = {
  nu_a: {
    id: 'nu_a',
    name: 'Nucleotide Adenine (A)',
    nameEn: 'Adenine Nucleotide',
    category: 'Nitrogenous Base · Purine',
    parentModel: 'Cấu trúc Phân tử DNA / Gene',
    structure: 'Gồm gốc Phosphate (C5\'), đường Deoxyribose (C5H10O4) và bazơ Adenine (Purine vòng kép 2 dị vòng).',
    functionRole: 'Lưu trữ thông tin di truyền, tạo 2 liên kết hydrogen đặc hiệu bắt cặp bổ sung với Thymine (A = T).',
    keyFact: 'A chiếm tỷ lệ đúng bằng T theo NTBS (A = T; A + G = T + C).',
    colorHex: '#ef4444'
  },
  nu_t: {
    id: 'nu_t',
    name: 'Nucleotide Thymine (T)',
    nameEn: 'Thymine Nucleotide',
    category: 'Nitrogenous Base · Pyrimidine',
    parentModel: 'Cấu trúc Phân tử DNA / Gene',
    structure: 'Bazơ nitơ loại Pyrimidine 1 vòng 6 cạnh, chỉ xuất hiện ở phân tử DNA (trong RNA là Uracil).',
    functionRole: 'Bắt cặp bổ sung với Adenine qua 2 liên kết hydrogen, duy trì bán kính 1.0 nm của chuỗi xoắn kép.',
    keyFact: 'T liên kết bổ sung với A qua 2 liên kết hydrogen yếu nhưng rất linh hoạt khi nhân đôi.',
    colorHex: '#3b82f6'
  },
  nu_g: {
    id: 'nu_g',
    name: 'Nucleotide Guanine (G)',
    nameEn: 'Guanine Nucleotide',
    category: 'Nitrogenous Base · Purine',
    parentModel: 'Cấu trúc Phân tử DNA / Gene',
    structure: 'Bazơ nitơ kích thước lớn thuộc nhóm Purine (vòng kép gồm 1 vòng 6 cạnh và 1 vòng 5 cạnh).',
    functionRole: 'Tạo 3 liên kết hydrogen bền chắc với Cytosine (G ≡ C), tăng độ bền nhiệt và tính ổn định hệ gene.',
    keyFact: 'Gene có tỷ lệ (G+C) càng cao thì nhiệt độ nóng chảy (Tm) của phân tử DNA càng cao.',
    colorHex: '#eab308'
  },
  nu_c: {
    id: 'nu_c',
    name: 'Nucleotide Cytosine (C)',
    nameEn: 'Cytosine Nucleotide',
    category: 'Nitrogenous Base · Pyrimidine',
    parentModel: 'Cấu trúc Phân tử DNA / Gene',
    structure: 'Bazơ nitơ nhỏ thuộc nhóm Pyrimidine (vòng 6 cạnh đơn), có mặt ở cả DNA và RNA.',
    functionRole: 'Bắt cặp đặc hiệu với Guanine qua 3 liên kết hydrogen (C ≡ G), tham gia cơ chế điều hòa methyl hóa.',
    keyFact: 'Theo NTBS: số nucleotide loại C luôn luôn bằng số nucleotide loại G trong DNA mạch kép (G = C).',
    colorHex: '#22c55e'
  },
  backbone_deoxyribose: {
    id: 'backbone_deoxyribose',
    name: 'Đường Deoxyribose (C5H10O4)',
    nameEn: 'Deoxyribose Sugar',
    category: 'Khung phân tử DNA',
    parentModel: 'Cấu trúc Phân tử DNA / Gene',
    structure: 'Đường pentose 5 carbon mất 1 nguyên tử oxy ở vị trí carbon C2\' (so với đường Ribose của RNA).',
    functionRole: 'Liên kết với gốc phosphate ở C5\' và C3\', gắn với bazơ nitơ tại C1\' để tạo xương sống cho chuỗi polynucleotide.',
    keyFact: 'Cacbon C3\' mang nhóm -OH tự do là vị trí kéo dài chuỗi khi DNA polymerase tổng hợp mạch mới (chiều 5\'→3\').',
    colorHex: '#0284c7'
  },
  backbone_phosphate: {
    id: 'backbone_phosphate',
    name: 'Gốc Phosphate (PO4³⁻)',
    nameEn: 'Phosphate Group',
    category: 'Khung phân tử DNA',
    parentModel: 'Cấu trúc Phân tử DNA / Gene',
    structure: 'Gốc axit photphoric tích điện âm mạnh ở điều kiện pH sinh lý, gắn vào C5\' của đường qua liên kết este.',
    functionRole: 'Tạo liên kết cộng hóa trị phosphodiester giữa 2 nucleotide kế tiếp, mang điện tích âm giúp DNA hòa tan và bền vững.',
    keyFact: 'Tích điện âm cho toàn bộ chuỗi DNA, giúp tương tác tĩnh điện với protein Histone kiềm tính trong nhiễm sắc thể.',
    colorHex: '#6366f1'
  },
  hydrogen_bonds: {
    id: 'hydrogen_bonds',
    name: 'Liên kết Hydrogen giữa 2 mạch',
    nameEn: 'Hydrogen Bonds (Base Pairing)',
    category: 'Liên kết phân tử',
    parentModel: 'Cấu trúc Phân tử DNA / Gene',
    structure: 'Liên kết yếu hình thành giữa nguyên tử hydro phân cực và các nguyên tử âm điện (O, N) của hai bazơ đối diện.',
    functionRole: 'Giữ 2 mạch đơn song song ngược chiều liên kết thành chuỗi xoắn kép; dễ dàng đứt gãy dưới tác dụng của enzyme helicase.',
    keyFact: 'A-T có 2 liên kết H; G-C có 3 liên kết H. Tổng liên kết H của gene = 2A + 3G.',
    colorHex: '#f59e0b'
  },
  helix_structure: {
    id: 'helix_structure',
    name: 'Chuỗi Xoắn Kép Watson - Crick',
    nameEn: 'Double Helix Conformation',
    category: 'Cấu trúc không gian',
    parentModel: 'Cấu trúc Phân tử DNA / Gene',
    structure: 'Gồm hai chuỗi polynucleotide song song ngược chiều (5\'→3\' và 3\'→5\'), xoắn đều đặn quanh một trục theo chiều kim đồng hồ.',
    functionRole: 'Bảo vệ thông tin di truyền ở lõi trong, bề mặt ngoài tiếp xúc dung môi tế bào.',
    keyFact: 'Đường kính xoắn: 2 nm (20 Å); Chu kỳ xoắn: 3.4 nm (34 Å) gồm 10 cặp nucleotide; Khoảng cách 2 cặp kế tiếp: 0.34 nm.',
    colorHex: '#06b6d4'
  }
};

interface NucleotideProps {
  position: [number, number, number];
  color: string;
  label: string;
  name: string;
  detailId: string;
  onSelect: (detail: ModelSubpartDetail) => void;
  onHover: (detail: ModelSubpartDetail | null, mouseEvent?: { x: number; y: number }) => void;
}

const NucleotidePill: React.FC<NucleotideProps> = ({
  position,
  color,
  label,
  name,
  detailId,
  onSelect,
  onHover
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const detail = GENE_DETAILS[detailId] || {
    id: detailId,
    name: `${label} - ${name}`,
    category: 'Nucleotide',
    parentModel: 'Mô hình Gene',
    structure: `Thành phần nucleotide ${name} trong phân tử DNA.`,
    functionRole: 'Tham gia cấu tạo mã di truyền theo nguyên tắc bổ sung.',
    colorHex: color
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(detail, { x: e.clientX, y: e.clientY });
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          onHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          playToneEffect(620);
          onSelect(detail);
        }}
        scale={hovered ? 1.18 : 1}
      >
        <cylinderGeometry args={[0.22, 0.22, 1.3, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.2}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.45 : 0}
        />
      </mesh>
      
      {/* 3D Always-facing Billboard Label */}
      <Billboard position={[0, 0, 0]}>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.26, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.23, 24]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <Text
          position={[0, 0, 0.04]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
};

const HelixScene: React.FC<{
  onSelect: (detail: ModelSubpartDetail) => void;
  onHover: (detail: ModelSubpartDetail | null, mouseEvent?: { x: number; y: number }) => void;
}> = ({ onSelect, onHover }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  const basePairs = [
    { left: 'A', right: 'T', leftColor: '#ef4444', rightColor: '#3b82f6', leftName: 'Adenine', rightName: 'Thymine', leftId: 'nu_a', rightId: 'nu_t' },
    { left: 'T', right: 'A', leftColor: '#3b82f6', rightColor: '#ef4444', leftName: 'Thymine', rightName: 'Adenine', leftId: 'nu_t', rightId: 'nu_a' },
    { left: 'G', right: 'C', leftColor: '#eab308', rightColor: '#22c55e', leftName: 'Guanine', rightName: 'Cytosine', leftId: 'nu_g', rightId: 'nu_c' },
    { left: 'C', right: 'G', leftColor: '#22c55e', rightColor: '#eab308', leftName: 'Cytosine', rightName: 'Guanine', leftId: 'nu_c', rightId: 'nu_g' },
    { left: 'A', right: 'T', leftColor: '#ef4444', rightColor: '#3b82f6', leftName: 'Adenine', rightName: 'Thymine', leftId: 'nu_a', rightId: 'nu_t' },
    { left: 'G', right: 'C', leftColor: '#eab308', rightColor: '#22c55e', leftName: 'Guanine', rightName: 'Cytosine', leftId: 'nu_g', rightId: 'nu_c' },
    { left: 'T', right: 'A', leftColor: '#3b82f6', rightColor: '#ef4444', leftName: 'Thymine', rightName: 'Adenine', leftId: 'nu_t', rightId: 'nu_a' },
    { left: 'C', right: 'G', leftColor: '#22c55e', rightColor: '#eab308', leftName: 'Cytosine', rightName: 'Guanine', leftId: 'nu_c', rightId: 'nu_g' },
  ];

  return (
    <group ref={groupRef}>
      {basePairs.map((pair, idx) => {
        const y = (idx - basePairs.length / 2) * 0.85;
        const angle = idx * 0.55;
        const radius = 1.3;
        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = -Math.cos(angle) * radius;
        const z2 = -Math.sin(angle) * radius;

        return (
          <group key={idx}>
            {/* Left base */}
            <group position={[x1 * 0.5, y, z1 * 0.5]} rotation={[0, -angle, Math.PI / 2]}>
              <NucleotidePill
                position={[0, 0, 0]}
                color={pair.leftColor}
                label={pair.left}
                name={pair.leftName}
                detailId={pair.leftId}
                onSelect={onSelect}
                onHover={onHover}
              />
            </group>

            {/* Right base */}
            <group position={[x2 * 0.5, y, z2 * 0.5]} rotation={[0, -angle, Math.PI / 2]}>
              <NucleotidePill
                position={[0, 0, 0]}
                color={pair.rightColor}
                label={pair.right}
                name={pair.rightName}
                detailId={pair.rightId}
                onSelect={onSelect}
                onHover={onHover}
              />
            </group>

            {/* Backbone spheres - Deoxyribose */}
            <mesh
              position={[x1, y, z1]}
              onClick={(e) => {
                e.stopPropagation();
                playToneEffect(580);
                onSelect(GENE_DETAILS.backbone_deoxyribose);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHover(GENE_DETAILS.backbone_deoxyribose, { x: e.clientX, y: e.clientY });
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                onHover(null);
              }}
            >
              <sphereGeometry args={[0.26, 16, 16]} />
              <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Backbone spheres - Phosphate */}
            <mesh
              position={[x2, y, z2]}
              onClick={(e) => {
                e.stopPropagation();
                playToneEffect(580);
                onSelect(GENE_DETAILS.backbone_phosphate);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHover(GENE_DETAILS.backbone_phosphate, { x: e.clientX, y: e.clientY });
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                onHover(null);
              }}
            >
              <sphereGeometry args={[0.26, 16, 16]} />
              <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const R3FGeneCanvas: React.FC = () => {
  const [selectedDetail, setSelectedDetail] = useState<ModelSubpartDetail | null>(null);
  const [hoverDetail, setHoverDetail] = useState<ModelSubpartDetail | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const allParts = Object.values(GENE_DETAILS);

  const handleHover = (detail: ModelSubpartDetail | null, pos?: { x: number; y: number }) => {
    setHoverDetail(detail);
    if (pos) setTooltipPos(pos);
  };

  return (
    <div className="relative w-full space-y-3">
      <div className="relative w-full h-[360px] sm:h-[440px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center gap-2">
          <span className="text-[11px] font-mono tracking-wider text-sky-400 bg-sky-950/70 border border-sky-500/30 px-2.5 py-1 rounded-full uppercase">
            React Three Fiber & Drei 3D Engine
          </span>
          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Chạm vào từng chi tiết để xem thông tin
          </span>
        </div>

        <div className="absolute bottom-3 right-4 z-10 pointer-events-none text-slate-400 text-xs bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-700/60 backdrop-blur-xs">
          Kéo chuột xoay • Cuộn để Zoom • Nhấp để xem thông tin
        </div>

        <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -5]} intensity={0.8} color="#38bdf8" />
          
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
            <HelixScene
              onSelect={(detail) => setSelectedDetail(detail)}
              onHover={handleHover}
            />
          </Float>

          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>

        {hoverDetail && (
          <HoverTooltip
            name={hoverDetail.name}
            category={hoverDetail.category}
            summary={hoverDetail.structure}
            colorHex={hoverDetail.colorHex}
            x={tooltipPos?.x}
            y={tooltipPos?.y}
          />
        )}
      </div>

      {/* Quick selectable chips */}
      <QuickPartsBar
        parts={allParts}
        selectedId={selectedDetail?.id}
        onSelect={(part) => {
          setSelectedDetail(part);
          playToneEffect(600);
        }}
      />

      {/* Detail inspection card popup */}
      {selectedDetail && (
        <ModelDetailCard
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onSelectDetail={(part) => setSelectedDetail(part)}
          allParts={allParts}
        />
      )}
    </div>
  );
};

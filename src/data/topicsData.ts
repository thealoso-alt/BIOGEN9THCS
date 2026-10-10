import { useState, useEffect } from 'react';
import { GeneticsTopic } from '../types/genetics';
export type { GeneticsTopic };

/**
 * Danh sách 7 Chủ đề Di truyền học chuẩn theo chương trình và hình ảnh yêu cầu:
 * 1. Chủ đề 1. Nucleic acid và gene.
 * 2. Chủ đề 2. Tái bản DNA và phiên mã tạo RNA
 * 3. Chủ đề 3. Dịch mã và mối quan hệ giữa gene và tính trạng.
 * 4. Chủ đề 4. Đột biến gene.
 * 5. Chủ đề 5. Nhiễm sắc thể và bộ nhiễm sắc thể.
 * 6. Chủ đề 6. Nguyên phân và giảm phân.
 * 7. Chủ đề 7. Nhiễm sắc thể giới tính và cơ chế xác định giới tính.
 */
export const DEFAULT_GENETICS_TOPICS: GeneticsTopic[] = [
  // MODULE A – DI TRUYỀN PHÂN TỬ (MOLECULAR GENETICS)
  {
    id: 'nucleic_acid_gene',
    order: 1,
    module: 'molecular',
    titleVi: 'Chủ đề 1. Nucleic acid và gene.',
    titleEn: 'Nucleic Acid & Gene',
    slug: 'nucleic-acid-va-gene',
    descriptionVi: 'Khám phá đại phân tử sinh học nucleic acid (DNA và RNA), mô hình xoắn kép Watson - Crick, các nucleotide A, T, G, C, U và bản chất hóa học, cấu trúc của gene.',
    keyConcepts: [
      'Nucleic acid (DNA & RNA)',
      'Nucleotide (A, T, G, C, U)',
      'Mô hình xoắn kép & Nguyên tắc bổ sung',
      'Khái niệm & Cấu trúc của Gene',
      'Mã di truyền (Codon)',
    ],
    interactiveType: 'dna_helix',
    xpReward: 150,
    estimatedMinutes: 25,
  },
  {
    id: 'dna_replication_transcription',
    order: 2,
    module: 'molecular',
    titleVi: 'Chủ đề 2. Tái bản DNA và phiên mã tạo RNA',
    titleEn: 'DNA Replication & RNA Transcription',
    slug: 'tai-ban-dna-va-phien-ma-tao-rna',
    descriptionVi: 'Quá trình tự nhân đôi (tái bản) của DNA theo nguyên tắc bán bảo tồn và bổ sung, cùng cơ chế phiên mã tổng hợp các phân tử RNA (mARN, tARN, rARN) nhờ RNA polymerase.',
    keyConcepts: [
      'Tái bản DNA (Pha S của chu kỳ tế bào)',
      'Nguyên tắc bán bảo tồn (Semi-conservative)',
      'Enzyme DNA Polymerase & RNA Polymerase',
      'Cơ chế phiên mã (Transcription)',
      'Tổng hợp các loại RNA (mARN, tARN, rARN)',
    ],
    interactiveType: 'replication',
    xpReward: 150,
    estimatedMinutes: 25,
    prerequisiteId: 'nucleic_acid_gene',
  },
  {
    id: 'translation_gene_trait',
    order: 3,
    module: 'molecular',
    titleVi: 'Chủ đề 3. Dịch mã và mối quan hệ giữa gene và tính trạng.',
    titleEn: 'Translation & Gene-to-Trait Expression',
    slug: 'dich-ma-va-moi-quan-he-giua-gene-va-tinh-trang',
    descriptionVi: 'Cơ chế dịch mã tổng hợp chuỗi polypeptide tại ribosome và dòng lưu chuyển thông tin di truyền: Gene (DNA) → mARN → Protein → Tính trạng.',
    keyConcepts: [
      'Dịch mã (Translation tại Ribosome)',
      'Codon trên mARN & Anticodon trên tARN',
      'Amino acid mở đầu & Liên kết peptide',
      'Cấu trúc & Vai trò biểu hiện của Protein',
      'Sơ đồ: Gene → mARN → Protein → Tính trạng',
    ],
    interactiveType: 'translation',
    xpReward: 150,
    estimatedMinutes: 25,
    prerequisiteId: 'dna_replication_transcription',
  },
  {
    id: 'gene_mutation',
    order: 4,
    module: 'molecular',
    titleVi: 'Chủ đề 4. Đột biến gene.',
    titleEn: 'Gene Mutation',
    slug: 'dot-bien-gene',
    descriptionVi: 'Những biến đổi trong cấu trúc hóa học của gene liên quan đến một hoặc một số cặp nucleotide: mất cặp, thêm cặp, thay thế cặp và ý nghĩa sinh học.',
    keyConcepts: [
      'Khái niệm đột biến gene & Đột biến điểm',
      'Dạng mất, thêm, thay thế cặp nucleotide',
      'Tác nhân vật lý, hóa học và sinh học',
      'Hậu quả & Ý nghĩa trong tiến hóa và chọn giống',
    ],
    interactiveType: 'general',
    xpReward: 150,
    estimatedMinutes: 20,
    prerequisiteId: 'translation_gene_trait',
  },

  // MODULE B – DI TRUYỀN TẾ BÀO (CELLULAR GENETICS)
  {
    id: 'chromosome_and_set',
    order: 5,
    module: 'cellular',
    titleVi: 'Chủ đề 5. Nhiễm sắc thể và bộ nhiễm sắc thể.',
    titleEn: 'Chromosomes & Chromosome Sets',
    slug: 'nhiem-sac-the-va-bo-nhiem-sac-the',
    descriptionVi: 'Hình thái, cấu trúc siêu hiển vi của nhiễm sắc thể (phân tử DNA cuộn quanh hạt protein histone tạo nucleosome) và đặc trưng của bộ NST 2n, n của loài.',
    keyConcepts: [
      'Cấu trúc siêu hiển vi của NST',
      'Nucleosome & Mức độ xoắn',
      'Cromatit & Tâm động (Centromere)',
      'Bộ NST lưỡng bội 2n & Đơn bội n',
      'Tính đặc trưng hình thái, số lượng bộ NST',
    ],
    interactiveType: 'chromosome',
    xpReward: 150,
    estimatedMinutes: 20,
  },
  {
    id: 'mitosis_meiosis',
    order: 6,
    module: 'cellular',
    titleVi: 'Chủ đề 6. Nguyên phân và giảm phân.',
    titleEn: 'Mitosis & Meiosis Cell Division',
    slug: 'nguyen-phan-va-giam-phan',
    descriptionVi: 'Diễn biến các kỳ của nguyên phân và giảm phân, sự tự nhân đôi, đóng xoắn, phân ly của nhiễm sắc thể và ý nghĩa duy trì tính ổn định của loài.',
    keyConcepts: [
      'Nguyên phân (Kỳ đầu, giữa, sau, cuối)',
      'Giảm phân I (Trao đổi chéo, tiếp hợp NST)',
      'Giảm phân II & Tạo 4 giao tử đơn bội (n)',
      'So sánh Nguyên phân và Giảm phân',
      'Ý nghĩa sinh học và thực tiễn chọn giống',
    ],
    interactiveType: 'mitosis',
    xpReward: 200,
    estimatedMinutes: 30,
    prerequisiteId: 'chromosome_and_set',
  },
  {
    id: 'sex_determination',
    order: 7,
    module: 'cellular',
    titleVi: 'Chủ đề 7. Nhiễm sắc thể giới tính và cơ chế xác định giới tính.',
    titleEn: 'Sex Chromosomes & Sex Determination',
    slug: 'nhiem-sac-the-gioi-tinh-va-co-che-xac-dinh-gioi-tinh',
    descriptionVi: 'Đặc điểm cặp NST giới tính (XX, XY), cơ chế phân ly tổ hợp trong thụ tinh xác định tỉ lệ đực : cái 1:1 và các yếu tố môi trường ảnh hưởng phân hóa giới tính.',
    keyConcepts: [
      'Nhiễm sắc thể giới tính (XX, XY, XO)',
      'Cơ chế phân ly & tổ hợp trong thụ tinh',
      'Tỉ lệ giới tính xấp xỉ 1 đực : 1 cái',
      'Yếu tố bên trong & Môi trường ngoài ảnh hưởng',
      'Ứng dụng điều khiển giới tính trong nông nghiệp',
    ],
    interactiveType: 'general',
    xpReward: 150,
    estimatedMinutes: 20,
    prerequisiteId: 'mitosis_meiosis',
  },
];

/**
 * Storage key version for the 7 official curriculum topics
 */
const LOCAL_STORAGE_TOPICS_KEY = 'biogen9_curriculum_topics_7_v1';

/**
 * Helper to map legacy topic IDs or aliases to canonical 7 topics
 */
export function getEquivalentTopicIds(topicId: string): string[] {
  switch (topicId) {
    case 'nucleic_acid_gene':
    case 'dna':
    case 'gene':
    case 'rna':
      return ['nucleic_acid_gene', 'dna', 'gene', 'rna'];
    case 'dna_replication_transcription':
    case 'dna_replication':
    case 'transcription':
      return ['dna_replication_transcription', 'dna_replication', 'transcription'];
    case 'translation_gene_trait':
    case 'translation':
    case 'protein':
      return ['translation_gene_trait', 'translation', 'protein'];
    case 'gene_mutation':
      return ['gene_mutation'];
    case 'chromosome_and_set':
    case 'chromosome':
    case 'chromosome_set':
      return ['chromosome_and_set', 'chromosome', 'chromosome_set'];
    case 'mitosis_meiosis':
    case 'mitosis':
    case 'meiosis':
      return ['mitosis_meiosis', 'mitosis', 'meiosis'];
    case 'sex_determination':
    case 'sex_chromosome_determination':
      return ['sex_determination', 'sex_chromosome_determination'];
    default:
      return [topicId];
  }
}

function loadStoredTopics(): GeneticsTopic[] {
  try {
    // Clean up outdated storage key if it had 15 topics
    if (typeof localStorage !== 'undefined') {
      const oldRaw = localStorage.getItem('biogen9_custom_topics_v1');
      if (oldRaw) {
        localStorage.removeItem('biogen9_custom_topics_v1');
      }
    }

    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOPICS_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 7) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load stored topics, using default 7 topics:', e);
  }
  return DEFAULT_GENETICS_TOPICS;
}

// Active array exported and kept updated in place
export const GENETICS_TOPICS: GeneticsTopic[] = [...loadStoredTopics()];

/**
 * Returns current topics
 */
export function getGeneticsTopics(): GeneticsTopic[] {
  return [...GENETICS_TOPICS];
}

/**
 * Saves and emits topic update event
 */
export function saveGeneticsTopics(newTopics: GeneticsTopic[]): void {
  GENETICS_TOPICS.splice(0, GENETICS_TOPICS.length, ...newTopics);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_TOPICS_KEY, JSON.stringify(newTopics));
    }
  } catch (e) {
    console.warn('Failed to persist topics:', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('biogen9_topics_changed', { detail: newTopics }));
  }
}

/**
 * Update an existing topic by ID
 */
export function updateGeneticsTopic(id: string, updates: Partial<GeneticsTopic>): boolean {
  const current = getGeneticsTopics();
  const idx = current.findIndex(t => t.id === id);
  if (idx === -1) return false;
  current[idx] = { ...current[idx], ...updates };
  saveGeneticsTopics(current);
  return true;
}

/**
 * Delete a topic by ID
 */
export function deleteGeneticsTopic(id: string): boolean {
  const current = getGeneticsTopics();
  const filtered = current.filter(t => t.id !== id);
  if (filtered.length === current.length) return false;
  // Re-number order
  const reordered = filtered.map((t, index) => ({
    ...t,
    order: index + 1,
  }));
  saveGeneticsTopics(reordered);
  return true;
}

/**
 * Add a new topic
 */
export function addGeneticsTopic(topic: GeneticsTopic): boolean {
  const current = getGeneticsTopics();
  if (current.some(t => t.id === topic.id)) return false;
  const newOrder = topic.order || current.length + 1;
  const newTopic: GeneticsTopic = {
    ...topic,
    order: newOrder,
  };
  saveGeneticsTopics([...current, newTopic]);
  return true;
}

/**
 * Reset topics to the 7 curriculum default topics
 */
export function resetGeneticsTopicsToDefault(): void {
  saveGeneticsTopics(DEFAULT_GENETICS_TOPICS);
}

/**
 * React Hook for dynamic topic updates across all pages
 */
export function useGeneticsTopics() {
  const [topics, setTopics] = useState<GeneticsTopic[]>(() => getGeneticsTopics());

  useEffect(() => {
    const handler = () => {
      setTopics(getGeneticsTopics());
    };
    window.addEventListener('biogen9_topics_changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('biogen9_topics_changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return {
    topics,
    updateTopic: updateGeneticsTopic,
    deleteTopic: deleteGeneticsTopic,
    addTopic: addGeneticsTopic,
    resetToDefault: resetGeneticsTopicsToDefault,
    saveTopics: saveGeneticsTopics,
  };
}

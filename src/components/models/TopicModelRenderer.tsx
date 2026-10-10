import React, { useState } from 'react';
import { DnaInteractiveLab } from '../DnaInteractiveLab';
import { GeneModel } from './GeneModel';
import { RnaModel } from './RnaModel';
import { ProteinModel } from './ProteinModel';
import { ReplicationModel } from './ReplicationModel';
import { TranscriptionModel } from './TranscriptionModel';
import { TranslationModel } from './TranslationModel';
import { GeneMutationModel } from './GeneMutationModel';
import { ChromosomeModel } from './ChromosomeModel';
import { ChromosomeSetModel } from './ChromosomeSetModel';
import { MitosisModel } from './MitosisModel';
import { MeiosisModel } from './MeiosisModel';
import { SexDeterminationModel } from './SexDeterminationModel';
import { Sparkles, Dna, Layers, GitBranch, ShieldAlert } from 'lucide-react';

interface TopicModelRendererProps {
  topicId: string;
}

export const TopicModelRenderer: React.FC<TopicModelRendererProps> = ({ topicId }) => {
  // Sub-tab state for combined curriculum topics
  const [nucleicSubTab, setNucleicSubTab] = useState<'dna' | 'gene' | 'rna'>('dna');
  const [repTransSubTab, setRepTransSubTab] = useState<'replication' | 'transcription'>('replication');
  const [transTraitSubTab, setTransTraitSubTab] = useState<'translation' | 'protein'>('translation');
  const [chromSubTab, setChromSubTab] = useState<'chromosome' | 'set'>('chromosome');
  const [divisionSubTab, setDivisionSubTab] = useState<'mitosis' | 'meiosis'>('mitosis');

  // CHỦ ĐỀ 1: NUCLEIC ACID VÀ GENE
  if (topicId === 'nucleic_acid_gene' || topicId === 'dna') {
    return (
      <div className="space-y-4">
        {/* Sub-model selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 px-3 text-cyan-400 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Phân Hệ 3D Chủ Đề 1 (Nucleic Acid & Gene)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setNucleicSubTab('dna')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                nucleicSubTab === 'dna'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <Dna className="h-3.5 w-3.5" />
              <span>1. Xoắn Kép DNA</span>
            </button>
            <button
              onClick={() => setNucleicSubTab('gene')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                nucleicSubTab === 'gene'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>2. Cấu Trúc Gene</span>
            </button>
            <button
              onClick={() => setNucleicSubTab('rna')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                nucleicSubTab === 'rna'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>3. Phân Tử RNA</span>
            </button>
          </div>
        </div>

        {nucleicSubTab === 'dna' && <DnaInteractiveLab />}
        {nucleicSubTab === 'gene' && <GeneModel />}
        {nucleicSubTab === 'rna' && <RnaModel />}
      </div>
    );
  }

  // CHỦ ĐỀ 2: TÁI BẢN DNA VÀ PHIÊN MÃ TẠO RNA
  if (topicId === 'dna_replication_transcription' || topicId === 'dna_replication' || topicId === 'transcription') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 px-3 text-cyan-400 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Phân Hệ 3D Chủ Đề 2 (Tái Bản & Phiên Mã)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRepTransSubTab('replication')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                repTransSubTab === 'replication'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>⚡ 1. Tái Bản DNA (Nhân đôi)</span>
            </button>
            <button
              onClick={() => setRepTransSubTab('transcription')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                repTransSubTab === 'transcription'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>⚡ 2. Phiên Mã Tạo RNA</span>
            </button>
          </div>
        </div>

        {repTransSubTab === 'replication' && <ReplicationModel />}
        {repTransSubTab === 'transcription' && <TranscriptionModel />}
      </div>
    );
  }

  // CHỦ ĐỀ 3: DỊCH MÃ VÀ MỐI QUAN HỆ GIỮA GENE VÀ TÍNH TRẠNG
  if (topicId === 'translation_gene_trait' || topicId === 'translation' || topicId === 'protein') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 px-3 text-cyan-400 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Phân Hệ 3D Chủ Đề 3 (Dịch Mã & Protein)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTransTraitSubTab('translation')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                transTraitSubTab === 'translation'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>🔬 1. Dịch Mã Tại Ribosome</span>
            </button>
            <button
              onClick={() => setTransTraitSubTab('protein')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                transTraitSubTab === 'protein'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>🧪 2. Cấu Trúc Protein & Tính Trạng</span>
            </button>
          </div>
        </div>

        {transTraitSubTab === 'translation' && <TranslationModel />}
        {transTraitSubTab === 'protein' && <ProteinModel />}
      </div>
    );
  }

  // CHỦ ĐỀ 4: ĐỘT BIẾN GENE
  if (topicId === 'gene_mutation') {
    return <GeneMutationModel />;
  }

  // CHỦ ĐỀ 5: NHIỄM SẮC THỂ VÀ BỘ NHIỄM SẮC THỂ
  if (topicId === 'chromosome_and_set' || topicId === 'chromosome' || topicId === 'chromosome_set') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 px-3 text-purple-400 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Phân Hệ 3D Chủ Đề 5 (NST & Bộ NST)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setChromSubTab('chromosome')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chromSubTab === 'chromosome'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>🔬 1. Cấu Trúc Siêu Hiển Vi NST</span>
            </button>
            <button
              onClick={() => setChromSubTab('set')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chromSubTab === 'set'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>🔬 2. Bộ NST Lưỡng Bội (2n, n)</span>
            </button>
          </div>
        </div>

        {chromSubTab === 'chromosome' && <ChromosomeModel />}
        {chromSubTab === 'set' && <ChromosomeSetModel />}
      </div>
    );
  }

  // CHỦ ĐỀ 6: NGUYÊN PHÂN VÀ GIẢM PHÂN
  if (topicId === 'mitosis_meiosis' || topicId === 'mitosis' || topicId === 'meiosis') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 px-3 text-purple-400 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Phân Hệ 3D Chủ Đề 6 (Phân Bào Tế Bào)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDivisionSubTab('mitosis')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                divisionSubTab === 'mitosis'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>🔄 1. Nguyên Phân (Mitosis)</span>
            </button>
            <button
              onClick={() => setDivisionSubTab('meiosis')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                divisionSubTab === 'meiosis'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>🔄 2. Giảm Phân (Meiosis)</span>
            </button>
          </div>
        </div>

        {divisionSubTab === 'mitosis' && <MitosisModel />}
        {divisionSubTab === 'meiosis' && <MeiosisModel />}
      </div>
    );
  }

  // CHỦ ĐỀ 7: NHIỄM SẮC THỂ GIỚI TÍNH VÀ CƠ CHẾ XÁC ĐỊNH GIỚI TÍNH
  if (topicId === 'sex_determination' || topicId === 'sex_chromosome_determination') {
    return <SexDeterminationModel />;
  }

  // Default fallback
  return <DnaInteractiveLab />;
};

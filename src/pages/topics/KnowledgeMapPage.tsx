import React, { useState } from 'react';
import { GENETICS_TOPICS } from '../../data/topicsData';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { TopicCard } from '../../components/TopicCard';
import { Dna, Atom, Compass, ArrowDown, Sparkles, CheckCircle2, Lock, Play } from 'lucide-react';

export const KnowledgeMapPage: React.FC = () => {
  const { userProgress } = useAuth();
  const { openTopic } = useNavigation();

  const [activeModule, setActiveModule] = useState<'all' | 'molecular' | 'cellular'>('all');

  const molecularTopics = GENETICS_TOPICS.filter(t => t.module === 'molecular');
  const cellularTopics = GENETICS_TOPICS.filter(t => t.module === 'cellular');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 mb-1">
            <Compass className="h-4 w-4" />
            <span>LỘ TRÌNH CHUẨN GDPT SINH HỌC 9</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bản Đồ Kiến Thức Di Truyền Học (Knowledge Map)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Theo dõi tiến trình học tập qua 15 chủ đề chuyên sâu: từ cấp độ phân tử (DNA) đến cấp độ tế bào (Nhiễm sắc thể)
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveModule('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeModule === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả (15 Topics)
          </button>
          <button
            onClick={() => setActiveModule('molecular')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeModule === 'molecular'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Module A: Phân tử (8)
          </button>
          <button
            onClick={() => setActiveModule('cellular')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeModule === 'cellular'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Module B: Tế bào (7)
          </button>
        </div>
      </div>

      {/* Visual Roadmap Diagram for Module A (Section 8) */}
      {(activeModule === 'all' || activeModule === 'molecular') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/25">
              <Dna className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-sky-600 uppercase">MODULE A</span>
              <h2 className="text-lg font-black text-slate-900">Di truyền Phân tử (Molecular Genetics)</h2>
            </div>
          </div>

          {/* Visual Concept Flow Pipeline (Section 8) */}
          <div className="hidden lg:flex items-center justify-between p-4 rounded-2xl bg-white border border-sky-100 shadow-sm text-xs font-mono font-bold overflow-x-auto">
            <div className="flex items-center gap-2 text-sky-600">
              <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">1. DNA</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-sky-600">
              <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">2. GENE</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-sky-600">
              <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">3. RNA</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-sky-600">
              <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">4. PROTEIN</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-sky-600">
              <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">5. REPLICATION</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-sky-600">
              <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">6. TRANSCRIPTION</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-sky-600">
              <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">7. TRANSLATION</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-amber-600">
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">8. MUTATION</span>
            </div>
          </div>

          {/* Grid of Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {molecularTopics.map(topic => {
              const prog = userProgress[topic.id]?.progressPercent || 0;
              const status = userProgress[topic.id]?.status || 'available';
              return (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  status={status}
                  progressPercent={prog}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Roadmap Diagram for Module B (Section 8) */}
      {(activeModule === 'all' || activeModule === 'cellular') && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/25">
              <Atom className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-purple-600 uppercase">MODULE B</span>
              <h2 className="text-lg font-black text-slate-900">Di truyền Tế bào (Cellular Genetics)</h2>
            </div>
          </div>

          {/* Visual Concept Flow Pipeline (Section 8) */}
          <div className="hidden lg:flex items-center justify-between p-4 rounded-2xl bg-white border border-purple-100 shadow-sm text-xs font-mono font-bold overflow-x-auto">
            <div className="flex items-center gap-2 text-purple-600">
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">1. CHROMOSOME</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">2. PLOIDY (2n, n)</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">3. MITOSIS</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">4. MEIOSIS</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">5. SEX DETERMINATION</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">6. LINKAGE</span>
              <span>──→</span>
            </div>
            <div className="flex items-center gap-2 text-amber-600">
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">7. CHR MUTATION</span>
            </div>
          </div>

          {/* Grid of Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cellularTopics.map(topic => {
              const prog = userProgress[topic.id]?.progressPercent || 0;
              const status = userProgress[topic.id]?.status || 'available';
              return (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  status={status}
                  progressPercent={prog}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

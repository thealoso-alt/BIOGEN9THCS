import React from 'react';
import { GeneticsTopic, TopicStatus } from '../types/genetics';
import { useNavigation } from '../hooks/useNavigation';
import { ProgressBar } from './ProgressBar';
import { Dna, Clock, Sparkles, ChevronRight, Lock, CheckCircle2, Play } from 'lucide-react';

interface TopicCardProps {
  topic: GeneticsTopic;
  status?: TopicStatus;
  progressPercent?: number;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  status = 'available',
  progressPercent = 0,
}) => {
  const { openTopic } = useNavigation();

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed' || status === 'mastered';

  const getStatusBadge = () => {
    switch (status) {
      case 'mastered':
        return <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Thành thạo</span>;
      case 'completed':
        return <span className="text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-sky-600" /> Hoàn thành</span>;
      case 'in_progress':
        return <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1"><Play className="h-3 w-3 text-amber-600" /> Đang học ({progressPercent}%)</span>;
      case 'locked':
        return <span className="text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-medium text-[11px] flex items-center gap-1"><Lock className="h-3 w-3 text-slate-400" /> Chưa mở khóa</span>;
      default:
        return <span className="text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full font-bold text-[11px]">Sẵn sàng học</span>;
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-200 ${
        isLocked
          ? 'border-slate-200 bg-slate-50/60 opacity-60'
          : 'border-sky-100 bg-white hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/60'
      }`}
    >
      <div>
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sky-600 font-extrabold">Chủ đề {topic.order}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-medium text-slate-600">{topic.module === 'molecular' ? 'Di truyền phân tử' : 'Di truyền tế bào'}</span>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
          {topic.titleVi}
        </h3>
        <p className="text-xs font-semibold text-sky-600/90 font-mono mt-0.5">
          {topic.titleEn}
        </p>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {topic.descriptionVi}
        </p>

        {/* Key Concepts */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {topic.keyConcepts.slice(0, 3).map((concept, idx) => (
            <span
              key={idx}
              className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg"
            >
              {concept}
            </span>
          ))}
          {topic.keyConcepts.length > 3 && (
            <span className="text-[11px] text-slate-400 font-medium self-center">
              +{topic.keyConcepts.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-5 pt-3.5 border-t border-slate-100">
        {!isLocked && (
          <div className="mb-3">
            <ProgressBar value={progressPercent} color={isCompleted ? 'emerald' : 'cyan'} height="sm" />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5 text-sky-500" />
              <span>{topic.estimatedMinutes}p</span>
            </span>
            <span className="flex items-center gap-1 text-amber-600 font-mono font-bold">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>+{topic.xpReward} XP</span>
            </span>
          </div>

          <button
            onClick={() => !isLocked && openTopic(topic.id)}
            disabled={isLocked}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              isLocked
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-600/25 hover:scale-105 active:scale-95'
            }`}
          >
            <span>{isCompleted ? 'Ôn tập' : progressPercent > 0 ? 'Tiếp tục' : 'Bắt đầu'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

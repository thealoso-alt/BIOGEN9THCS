import React from 'react';
import { Badge } from '../types/gamification';
import { Dna, Atom, FileCode2, Boxes, CircleDot, Sparkles, Trophy, Award, Lock } from 'lucide-react';

interface BadgeItemProps {
  badge: Badge;
  isUnlocked?: boolean;
}

export const BadgeItem: React.FC<BadgeItemProps> = ({ badge, isUnlocked = false }) => {
  const getIcon = () => {
    switch (badge.icon) {
      case 'Dna':
        return <Dna className="h-6 w-6" />;
      case 'Atom':
        return <Atom className="h-6 w-6" />;
      case 'FileCode2':
        return <FileCode2 className="h-6 w-6" />;
      case 'Boxes':
        return <Boxes className="h-6 w-6" />;
      case 'CircleDot':
        return <CircleDot className="h-6 w-6" />;
      case 'Sparkles':
        return <Sparkles className="h-6 w-6" />;
      case 'Trophy':
        return <Trophy className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  return (
    <div
      className={`relative flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
        isUnlocked
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900 shadow-md shadow-amber-950/20'
          : 'border-slate-800 bg-slate-900/40 opacity-60'
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          isUnlocked
            ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20'
            : 'bg-slate-800 text-slate-500'
        }`}
      >
        {isUnlocked ? getIcon() : <Lock className="h-5 w-5" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs font-bold text-white truncate">{badge.titleVi}</h4>
          {isUnlocked && (
            <span className="text-[10px] font-mono font-medium text-amber-400 shrink-0">ĐÃ MỞ</span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{badge.descriptionVi}</p>
        <div className="mt-1 text-[10px] text-slate-500 font-mono">
          {badge.name}
        </div>
      </div>
    </div>
  );
};

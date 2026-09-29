import React from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../hooks/useAuth';
import { Home, BookOpen, Swords, Sparkles, Bot, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { currentView, navigate } = useNavigation();
  const { role } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      <button
        onClick={() => navigate('landing')}
        className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === 'landing' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Home className="h-5 w-5" />
        <span>Trang chủ</span>
      </button>

      <button
        onClick={() => navigate('knowledge_map')}
        className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === 'knowledge_map' || currentView === 'topic_detail'
            ? 'text-sky-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <BookOpen className="h-5 w-5" />
        <span>Kiến thức</span>
      </button>

      <button
        onClick={() => navigate('challenges')}
        className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === 'challenges' || currentView === 'live_battle'
            ? 'text-rose-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Swords className="h-5 w-5" />
        <span>Đấu trường</span>
      </button>

      <button
        onClick={() => navigate('english_bio')}
        className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === 'english_bio' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Sparkles className="h-5 w-5" />
        <span>Từ vựng</span>
      </button>

      <button
        onClick={() => navigate('bio_bot')}
        className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === 'bio_bot' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Bot className="h-5 w-5" />
        <span>Bio-Bot</span>
      </button>

      <button
        onClick={() => navigate(role === 'teacher' ? 'teacher_dashboard' : 'student_dashboard')}
        className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === 'student_dashboard' || currentView === 'teacher_dashboard'
            ? 'text-purple-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <User className="h-5 w-5" />
        <span>{role === 'teacher' ? 'GV' : 'Học tập'}</span>
      </button>
    </nav>
  );
};

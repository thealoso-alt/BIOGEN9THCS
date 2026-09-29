import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { GENETICS_TOPICS } from '../../data/topicsData';
import { DEMO_BADGES } from '../../data/mockSeedData';
import { ProgressBar } from '../../components/ProgressBar';
import { BadgeItem } from '../../components/BadgeItem';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  Play,
  KeyRound,
  Swords,
  Bot,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, classes, userProgress, resetProgressToZero } = useAuth();
  const { navigate, openTopic, openJoinClassModal } = useNavigation();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg text-center py-20 px-4">
        <p className="text-slate-400 mb-4">Vui lòng đăng nhập để xem thông tin học tập cá nhân.</p>
        <button
          onClick={() => navigate('login')}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Calculate overall stats
  const totalTopics = GENETICS_TOPICS.length;
  const completedTopicsCount = Object.values(userProgress).filter(
    p => p.status === 'completed' || p.status === 'mastered'
  ).length;
  const overallProgressPercent = Math.round((completedTopicsCount / totalTopics) * 100);

  // Determine current active topic (last studied or first in-progress or dna)
  const currentTopicId = Object.keys(userProgress).find(
    k => userProgress[k].status === 'in_progress'
  ) || 'dna';
  const currentTopic = GENETICS_TOPICS.find(t => t.id === currentTopicId) || GENETICS_TOPICS[0];
  const currentTopicProg = userProgress[currentTopicId]?.progressPercent || 0;

  // Current class name
  const currentClass = classes.find(c => user.classIds.includes(c.id)) || classes[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-cyan-400">Bảng tin Học tập THCS</span>
              <span aria-hidden="true">·</span>
              <span>{currentClass ? `${currentClass.name} (${currentClass.code})` : 'Chưa tham gia lớp'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Xin chào, {user.fullName}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Chào mừng bạn quay lại với hành trình giải mã phân tử di truyền học và cơ chế di truyền tế bào.
              Tiếp tục giữ vững chuỗi ngày học để mở khóa huy hiệu mới nhé!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => openTopic(currentTopic.id)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Tiếp tục bài học: {currentTopic.titleVi}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={openJoinClassModal}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-900/40 transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="h-4 w-4" />
                <span>Tham gia lớp học khác</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập và XP về 0% không?')) {
                    resetProgressToZero();
                  }
                }}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
                title="Đặt lại toàn bộ tiến độ học tập về 0%"
              >
                <span>Reset 0%</span>
              </button>
            </div>
          </div>

          {/* Gamification Stats Card */}
          <div className="lg:col-span-4 rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Cấp độ hiện tại
                </span>
                <span className="text-2xl font-black text-white font-mono">
                  Level {user.level}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-xl text-amber-300 font-mono text-xs font-bold">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>{user.xp} XP</span>
              </div>
            </div>

            <ProgressBar
              value={(user.xp % 500) / 5}
              label="Tiến độ lên Level tiếp theo"
              color="amber"
              height="sm"
            />

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400 shrink-0" />
                <span>Chuỗi {user.streakDays} ngày học</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{user.badges.length} Huy hiệu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Learning Hub Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Continue Learning & Knowledge Map */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Lesson Card (Section 33: Continue Learning) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Bài học Đang tiếp diễn (Continue Learning)</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                {currentTopicProg}% hoàn thành
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-slate-400">
                  {currentTopic.module === 'molecular' ? 'Module A: Di truyền Phân tử' : 'Module B: Di truyền Tế bào'}
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">{currentTopic.titleVi}</h4>
                <p className="text-xs text-slate-400 font-mono">{currentTopic.titleEn}</p>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 max-w-xl">
                  {currentTopic.descriptionVi}
                </p>
              </div>

              <button
                onClick={() => openTopic(currentTopic.id)}
                className="shrink-0 px-5 py-3 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-900/30 flex items-center gap-2 self-start sm:self-center"
              >
                <span>Vào bài học</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <ProgressBar value={currentTopicProg} color="cyan" height="md" />
            </div>
          </div>

          {/* Knowledge Map Progress summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Bản đồ Tiến độ Toàn khóa</h3>
                <p className="text-xs text-slate-400">Tổng quan 15 chủ đề Di truyền học lớp 9</p>
              </div>
              <button
                onClick={() => navigate('knowledge_map')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Xem bản đồ chi tiết</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Module A status */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-white">Module A: Di truyền Phân tử</span>
                  <span className="font-mono text-cyan-400 font-medium">8 Chủ đề</span>
                </div>
                <ProgressBar
                  value={
                    Math.round(
                      (GENETICS_TOPICS.filter(t => t.module === 'molecular' && (userProgress[t.id]?.status === 'completed' || userProgress[t.id]?.status === 'mastered')).length / 8) * 100
                    )
                  }
                  color="cyan"
                  height="sm"
                />
              </div>

              {/* Module B status */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-white">Module B: Di truyền Tế bào</span>
                  <span className="font-mono text-indigo-400 font-medium">7 Chủ đề</span>
                </div>
                <ProgressBar
                  value={
                    Math.round(
                      (GENETICS_TOPICS.filter(t => t.module === 'cellular' && (userProgress[t.id]?.status === 'completed' || userProgress[t.id]?.status === 'mastered')).length / 7) * 100
                    )
                  }
                  color="purple"
                  height="sm"
                />
              </div>
            </div>

            {/* Quick list of first 4 topics */}
            <div className="mt-5 space-y-2">
              {GENETICS_TOPICS.slice(0, 4).map(topic => {
                const prog = userProgress[topic.id]?.progressPercent || 0;
                const isComp = userProgress[topic.id]?.status === 'completed';
                return (
                  <div
                    key={topic.id}
                    onClick={() => openTopic(topic.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isComp ? 'bg-emerald-400' : prog > 0 ? 'bg-amber-400' : 'bg-slate-600'}`} />
                      <div>
                        <p className="text-xs font-semibold text-white">{topic.titleVi}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{topic.titleEn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">{prog}%</span>
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: English Biology, Badges & AI Tutor */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Tutor Bio-Bot Card */}
          <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-slate-900 to-emerald-950/20 p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI Tutor – Bio-Bot</h4>
                <p className="text-[11px] text-slate-400">Trợ lý gia sư Sinh học 9 thông minh</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Cần giải đáp về cấu trúc nucleotide, cơ chế nhân đôi bán bảo tồn hay thoi vô sắc phân bào? Bio-Bot luôn sẵn sàng hỗ trợ!
            </p>
            <button
              onClick={() => navigate('bio_bot')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/40 flex items-center justify-center gap-2 transition-colors"
            >
              <Bot className="h-4 w-4" />
              <span>Bắt đầu hỏi Bio-Bot</span>
            </button>
          </div>

          {/* English Biology Quick Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">English Biology Hub</h4>
              </div>
              <button
                onClick={() => navigate('english_bio')}
                className="text-xs text-cyan-400 hover:underline"
              >
                Mở từ điển
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Luyện thuật ngữ chuyên ngành Sinh học kèm phát âm chuẩn IPA:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Double Helix</span>
                  <span className="text-[11px] text-slate-400">Cấu trúc xoắn kép</span>
                </div>
                <span className="font-mono text-[10px] text-cyan-400">/ˈdʌb.əl ˈhiː.lɪks/</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Mitosis</span>
                  <span className="text-[11px] text-slate-400">Nguyên phân</span>
                </div>
                <span className="font-mono text-[10px] text-cyan-400">/maɪˈtoʊ.sɪs/</span>
              </div>
            </div>
          </div>

          {/* Badges / Achievements */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Huy hiệu Thành tích</h4>
              </div>
              <span className="text-xs font-mono text-amber-400 font-semibold">
                {user.badges.length}/{DEMO_BADGES.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {DEMO_BADGES.slice(0, 3).map(badge => (
                <BadgeItem
                  key={badge.id}
                  badge={badge}
                  isUnlocked={user.badges.includes(badge.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import {
  Dna,
  BookOpen,
  Sparkles,
  Bot,
  User,
  LogOut,
  LogIn,
  KeyRound,
  Menu,
  X,
  Swords,
  GraduationCap,
  School,
  Flame,
  RotateCcw,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout, switchRole, resetProgressToZero } = useAuth();
  const { currentView, navigate, openJoinClassModal } = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-100/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex min-h-14 py-1.5 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-teal-500 shadow-sm shadow-sky-500/30 group-hover:scale-105 transition-transform">
              <Dna className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-baseline gap-1 leading-tight">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900">BIOGEN</span>
                <span className="font-mono font-black text-sky-600 text-base">9</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 tracking-tight leading-tight mt-0.5 whitespace-normal sm:whitespace-nowrap">
                Tác giả: Cô Nguyễn Thị Phương - Trường THCS Trương Quang Trọng
              </span>
            </div>
          </button>

          {/* Compact Nav Links (Item 9) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => navigate('knowledge_map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'knowledge_map'
                  ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/60'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-sky-500" />
              <span>Kiến thức</span>
            </button>

            <button
              onClick={() => navigate('english_bio')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'english_bio'
                  ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200 shadow-xs'
                  : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50/60'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>English Bio</span>
            </button>

            <button
              onClick={() => navigate('challenges')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'challenges' || currentView === 'live_battle'
                  ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-xs'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/60'
              }`}
            >
              <Swords className="h-3.5 w-3.5 text-rose-500" />
              <span>Đấu trường</span>
            </button>

            <button
              onClick={() => navigate('bio_bot')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'bio_bot'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/60'
              }`}
            >
              <Bot className="h-3.5 w-3.5 text-emerald-500" />
              <span>Bio-Bot AI</span>
            </button>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200/80 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => switchRole('student')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
                role === 'student' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="h-3 w-3" />
              <span>Học sinh</span>
            </button>
            <button
              onClick={() => switchRole('teacher')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
                role === 'teacher' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="h-3 w-3" />
              <span>Giáo viên</span>
            </button>
          </div>

          {/* Quick Reset 0% Button (Item 1) */}
          <button
            onClick={() => {
              resetProgressToZero();
              alert('Đã đặt lại toàn bộ tiến độ học tập và điểm XP về 0% cho tài khoản sạch!');
            }}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors shadow-2xs"
            title="Đặt lại toàn bộ tiến độ học tập 0%"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset 0%</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-2.5 py-1 hover:border-sky-300 transition-colors focus:outline-none shadow-2xs"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-500 to-teal-500 text-white font-bold text-[11px]">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-semibold text-slate-800 leading-tight max-w-[100px] truncate">{user.fullName}</p>
                </div>
              </button>

              {userMenuOpen && (
                <div
                  onMouseLeave={() => setUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs text-slate-700"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">@{user.username}</p>
                    <p className="text-[11px] text-amber-600 font-mono font-semibold mt-0.5">
                      {user.xp} XP · Level {user.level}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate(role === 'teacher' ? 'teacher_dashboard' : 'student_dashboard');
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <User className="h-4 w-4 text-sky-500" />
                    <span>{role === 'teacher' ? 'Bảng điều khiển Giáo viên' : 'Khu vực Học tập'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      resetProgressToZero();
                      alert('Đã reset toàn bộ tiến độ 0%!');
                    }}
                    className="w-full text-left px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset tiến độ về 0%</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      openJoinClassModal();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <KeyRound className="h-4 w-4 text-sky-500" />
                    <span>Tham gia lớp bằng mã</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('landing');
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors flex items-center gap-1"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Đăng nhập</span>
              </button>
              <button
                onClick={() => navigate('register')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs transition-colors hidden sm:block"
              >
                Đăng ký
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-2 text-xs text-slate-700 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Vai trò:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => switchRole('student')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${role === 'student' ? 'bg-sky-500 text-white' : 'text-slate-600 bg-slate-100'}`}
              >
                Học sinh
              </button>
              <button
                onClick={() => switchRole('teacher')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${role === 'teacher' ? 'bg-purple-600 text-white' : 'text-slate-600 bg-slate-100'}`}
              >
                Giáo viên
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('knowledge_map');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors"
          >
            <BookOpen className="h-4 w-4 text-sky-500" />
            <span>Bản đồ Kiến thức</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('english_bio');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>English Biology</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('challenges');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
          >
            <Swords className="h-4 w-4 text-rose-500" />
            <span>Đấu trường Live Battle</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('bio_bot');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
          >
            <Bot className="h-4 w-4 text-emerald-500" />
            <span>Bio-Bot AI</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              resetProgressToZero();
              alert('Đã reset toàn bộ tiến độ về 0%!');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-amber-700 bg-amber-50/70 hover:bg-amber-100 rounded-xl transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <span>Reset tiến độ về 0%</span>
          </button>
        </div>
      )}
    </header>
  );
};

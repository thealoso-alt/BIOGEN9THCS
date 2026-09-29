import React from 'react';
import { Navbar } from '../components/Navbar';
import { BottomNavigation } from '../components/BottomNavigation';
import { JoinClassModal } from '../components/JoinClassModal';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-emerald-50/30 text-slate-800 flex flex-col selection:bg-sky-500/20 selection:text-sky-900">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-8">
        {children}
      </main>
      <BottomNavigation />
      <JoinClassModal />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-sm py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 hidden md:block">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="font-bold text-slate-800">BIOGEN 9</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-700 font-semibold">Tác giả: Cô Nguyễn Thị Phương – Trường THCS Trương Quang Trọng</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
              Chương trình KHTN 9
            </span>
          </div>
          <p className="text-slate-500">
            Mô hình 3D tương tác &amp; Hệ thống bài giảng chuẩn SGK Kết Nối Tri Thức / Cánh Diều.
          </p>
        </div>
      </footer>
    </div>
  );
};

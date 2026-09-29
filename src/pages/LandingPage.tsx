import React from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../hooks/useAuth';
import { InteractiveDnaModel } from '../components/InteractiveDnaModel';
import {
  Dna,
  BookOpen,
  Sparkles,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Atom,
  Boxes,
  School,
  GraduationCap,
  Bot,
  Swords,
  Flame,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate, openJoinClassModal, openTopic } = useNavigation();
  const { user, role } = useAuth();

  return (
    <div className="space-y-16 py-6 md:py-10">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-100/70 border border-sky-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <span>Chương trình GDPT Sinh học 9 Mới · Di truyền học số</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              BIOGEN <span className="bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">9</span>
              <span className="block text-2xl sm:text-3xl lg:text-3xl font-extrabold text-slate-600 mt-2">
                Digital Genetics Learning Hub
              </span>
            </h1>

            {/* Author Attribution */}
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-200/90 px-3.5 py-1.5 rounded-xl shadow-xs">
              <span className="text-sky-600 font-extrabold">Tác giả:</span>
              <span>Cô Nguyễn Thị Phương – Trường THCS Trương Quang Trọng</span>
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Nền tảng học tập Di truyền học thông minh dành cho học sinh và giáo viên THCS.
              Kết hợp mô hình không gian 3D trực quan, thuật ngữ tiếng Anh chuyên ngành, thử thách cá nhân và phòng thi đấu trực tiếp.
            </p>

            {/* Core Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('knowledge_map')}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <BookOpen className="h-4 w-4" />
                <span>Bản đồ 15 Bài học Di truyền</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={openJoinClassModal}
                className="px-5 py-3.5 rounded-2xl font-bold text-sm text-sky-700 bg-white border border-sky-200 hover:bg-sky-50 hover:border-sky-300 shadow-sm flex items-center gap-2 transition-all"
              >
                <KeyRound className="h-4 w-4 text-sky-600" />
                <span>Tham gia Lớp</span>
              </button>

              {!user && (
                <button
                  onClick={() => navigate('login')}
                  className="px-5 py-3.5 rounded-2xl font-bold text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            {/* Feature highlights without pills */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/80 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-sky-100 shadow-xs">
                <span className="block font-mono text-sky-600 font-extrabold text-base">15 Topics</span>
                <span className="text-slate-500 font-medium">Phân tử &amp; Tế bào</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-emerald-100 shadow-xs">
                <span className="block font-mono text-emerald-600 font-extrabold text-base">English Bio</span>
                <span className="text-slate-500 font-medium">Thuật ngữ chuẩn IPA</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-amber-100 shadow-xs">
                <span className="block font-mono text-amber-600 font-extrabold text-base">Bio-Bot</span>
                <span className="text-slate-500 font-medium">AI Tutor hướng dẫn</span>
              </div>
            </div>
          </div>

          {/* Interactive DNA Model Hero Element */}
          <div className="lg:col-span-6">
            <InteractiveDnaModel />
          </div>
        </div>
      </section>

      {/* 2 Core Modules Overview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-1 rounded-full mb-3">
            <span>CHƯƠNG TRÌNH KHTN 9 - GDPT 2018</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hai Trục Kiến thức Di truyền Trọng tâm
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Thiết kế bám sát chương trình Giáo dục Phổ thông Sinh học 9 với lộ trình học tuần tự, tương tác trực quan 3D
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module A Card */}
          <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-7 shadow-lg shadow-sky-100/50 relative overflow-hidden flex flex-col justify-between hover:border-sky-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-500/20">
                    <Dna className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-600 uppercase">MODULE A</span>
                    <h3 className="text-lg font-black text-slate-900">Di truyền Phân tử (Molecular Genetics)</h3>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 font-normal">
                Khám phá cấu trúc hóa học của DNA, RNA, Protein, các cơ chế nhân đôi DNA bán bảo tồn, phiên mã tổng hợp mRNA, dịch mã tạo chuỗi polypeptide và các dạng đột biến gene.
              </p>

              <div className="space-y-2 mb-6">
                {[
                  { id: 'dna', title: '1. DNA - Cấu trúc xoắn kép & Nucleotide' },
                  { id: 'gene', title: '2. Gene & Bản chất hóa học' },
                  { id: 'rna', title: '3. Cấu trúc & Các loại RNA' },
                  { id: 'protein', title: '4. Protein & Biểu hiện tính trạng' },
                  { id: 'dna_replication', title: '5. Nhân đôi DNA (Bán bảo tồn)' },
                  { id: 'transcription', title: '6. Phiên mã (Tổng hợp RNA)' },
                  { id: 'translation', title: '7. Dịch mã (Ribosome & Polypeptide)' },
                  { id: 'gene_mutation', title: '8. Đột biến Gene (Mất, thêm, thay thế)' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => openTopic(item.id)}
                    className="w-full text-left text-xs font-semibold text-slate-700 hover:text-sky-600 bg-slate-50 hover:bg-sky-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/80 hover:border-sky-200 flex items-center justify-between group transition-all"
                  >
                    <span>{item.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('knowledge_map')}
              className="w-full py-3 rounded-2xl text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 text-center transition-colors shadow-xs"
            >
              Xem toàn bộ lộ trình Module A ──→
            </button>
          </div>

          {/* Module B Card */}
          <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-7 shadow-lg shadow-purple-100/50 relative overflow-hidden flex flex-col justify-between hover:border-purple-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20">
                    <Atom className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-purple-600 uppercase">MODULE B</span>
                    <h3 className="text-lg font-black text-slate-900">Di truyền Tế bào (Cellular Genetics)</h3>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 font-normal">
                Nghiên cứu nhiễm sắc thể, bộ NST lưỡng bội 2n và đơn bội n, cơ chế phân bào nguyên phân, giảm phân tạo giao tử, quy định giới tính và quy luật di truyền phân li độc lập, di truyền liên kết.
              </p>

              <div className="space-y-2 mb-6">
                {[
                  { id: 'chromosome', title: '1. Nhiễm sắc thể & Cấu trúc siêu hiển vi' },
                  { id: 'chromosome_set', title: '2. Bộ Nhiễm sắc thể (2n, n)' },
                  { id: 'mitosis', title: '3. Nguyên phân (4 kỳ & Tế bào chất)' },
                  { id: 'meiosis', title: '4. Giảm phân (Giảm phân I, II)' },
                  { id: 'sex_determination', title: '5. Cơ chế xác định giới tính (XX/XY)' },
                  { id: 'genetic_linkage', title: '6. Di truyền liên kết (Morgan)' },
                  { id: 'chromosomal_mutation', title: '7. Đột biến NST (Cấu trúc & Số lượng)' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => openTopic(item.id)}
                    className="w-full text-left text-xs font-semibold text-slate-700 hover:text-purple-600 bg-slate-50 hover:bg-purple-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/80 hover:border-purple-200 flex items-center justify-between group transition-all"
                  >
                    <span>{item.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('knowledge_map')}
              className="w-full py-3 rounded-2xl text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-center transition-colors shadow-xs"
            >
              Xem toàn bộ lộ trình Module B ──→
            </button>
          </div>
        </div>
      </section>

      {/* Role Feature Comparison Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-10 shadow-lg shadow-sky-100/40">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Trải nghiệm Chuyên biệt cho Học Sinh &amp; Giáo Viên</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Phân quyền trực quan phù hợp với hoạt động dạy và học môn KHTN 9</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student perspective */}
            <div className="space-y-5 p-6 rounded-2xl bg-gradient-to-br from-sky-50/50 via-white to-sky-50/30 border border-sky-100 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/25">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">ROLE: HỌC SINH THCS (STUDENT)</h4>
                    <p className="text-[11px] text-slate-500">Tự do khám phá không gian 3D, làm bài luyện tập và thi đấu</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Tham gia lớp học nhanh chóng bằng Mã lớp giáo viên cung cấp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Thao tác trực tiếp trên các mô hình 3D sinh học xoay 360°</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Học thuật ngữ English Biology chuẩn IPA kèm mini-game chấm điểm</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Hỏi đáp tư duy cùng trợ lý ảo AI Tutor Bio-Bot</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Tham gia Thử thách đơn 15 câu &amp; Phòng thi đấu trực tiếp 1v1</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('student_dashboard')}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/25 transition-all"
              >
                Vào Bảng Học Tập Học Sinh
              </button>
            </div>

            {/* Teacher perspective */}
            <div className="space-y-5 p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 border border-purple-100 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/25">
                    <School className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">ROLE: GIÁO VIÊN BỘ MÔN (TEACHER)</h4>
                    <p className="text-[11px] text-slate-500">Quản lý lớp học, cấp mã phòng thi đấu và theo dõi tiến độ</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                    <span><strong>Tải danh sách học sinh lên</strong> và hệ thống <strong>tự động sinh TK &amp; MK</strong> cho toàn bộ lớp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>Tạo lớp học Sinh học 9, tự động cấp mã tham gia cho học sinh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>Xuất bảng điểm Excel UTF-8 và in phiếu cấp tài khoản cho học sinh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>Duyệt ngân hàng câu hỏi AI và mở phòng thi đấu trực tiếp (Live Battle)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>Theo dõi bảng xếp hạng thi đua và tiến độ học tập chi tiết</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => navigate('register')}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 transition-all text-center"
                >
                  Đăng Ký Tài Khoản Giáo Viên
                </button>
                <button
                  onClick={() => navigate('teacher_dashboard')}
                  className="py-3 px-4 rounded-xl text-xs font-bold text-purple-700 bg-purple-100/70 hover:bg-purple-200/70 transition-all text-center"
                >
                  Vào Bảng Điều Khiển
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

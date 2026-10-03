import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { UserRole } from '../types/auth';
import {
  Dna,
  Lock,
  User,
  Mail,
  GraduationCap,
  School,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Users,
  FileSpreadsheet,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { navigate } = useNavigation();

  const [role, setRole] = useState<UserRole>('teacher'); // Highlight Teacher registration as requested
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [initialClassName, setInitialClassName] = useState('Lớp 9A1');
  const [classCode, setClassCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !username.trim() || !password) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role,
        schoolName: role === 'teacher' ? schoolName.trim() || 'Trường THCS' : undefined,
        initialClassName: role === 'teacher' ? initialClassName.trim() || 'Lớp 9A1' : undefined,
        classCode: role === 'student' ? classCode.trim() : undefined,
      });

      if (res.success) {
        if (role === 'teacher') {
          navigate('teacher_dashboard');
        } else {
          navigate('student_dashboard');
        }
      } else {
        setErrorMsg(res.message || 'Đăng ký không thành công.');
      }
    } catch {
      setErrorMsg('Đã xảy ra lỗi trong quá trình đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-9 shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-sky-600 to-teal-500 text-white shadow-md shadow-sky-500/25 mb-3">
            <Dna className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đăng Ký Tài Khoản BIOGEN 9</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nền tảng Di truyền học số &amp; Quản lý lớp học thông minh THCS
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setRole('teacher');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'teacher'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="h-4 w-4" />
            <span>Dành cho Giáo viên</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'student'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Dành cho Học sinh</span>
          </button>
        </div>

        {/* Teacher Highlights Banner */}
        {role === 'teacher' && (
          <div className="mb-6 rounded-2xl bg-purple-50/70 border border-purple-200/70 p-4 text-xs text-purple-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-800 text-xs sm:text-sm">
              <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Đặc quyền dành cho Giáo viên bộ môn Sinh học:</span>
            </div>
            <ul className="space-y-1.5 text-purple-800/90 pl-1">
              <li className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span><strong>Tải danh sách học sinh lên</strong> và hệ thống <strong>tự động tạo TK &amp; MK</strong> cho cả lớp.</span>
              </li>
              <li className="flex items-center gap-2">
                <FileSpreadsheet className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span>Xuất file Excel danh sách tài khoản hoặc in phiếu cấp phát cho phụ huynh / học sinh.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span>Tạo câu hỏi AI, duyệt đề thi và tổ chức thi đấu Live Battle trực tiếp.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Student Advice */}
        {role === 'student' && (
          <div className="mb-5 rounded-2xl bg-sky-50 border border-sky-200 p-3.5 text-xs text-sky-800 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lưu ý cho Học sinh:</p>
              <p className="mt-0.5 text-sky-700">
                Nếu Thầy/Cô bộ môn đã tạo danh sách lớp, bạn đã có sẵn Tên đăng nhập và Mật khẩu. Bạn không cần đăng ký mới, hãy bấm{' '}
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="font-bold underline text-sky-900 hover:text-sky-700"
                >
                  Đăng nhập tại đây
                </button>
                .
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 flex items-start gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {role === 'teacher' ? 'Họ và tên Giáo viên' : 'Họ và tên Học sinh'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={role === 'teacher' ? 'Thầy/Cô Nguyễn Văn A' : 'Nguyễn Minh Anh'}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên đăng nhập (Username) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder={role === 'teacher' ? 'huong_bio9' : 'minhanh9a1'}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:outline-none font-mono transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {role === 'teacher' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Đơn vị công tác / Tên trường THCS <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <School className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    placeholder="ví dụ: THCS Chu Văn An"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên lớp khởi tạo ban đầu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Users className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={initialClassName}
                    onChange={e => setInitialClassName(e.target.value)}
                    placeholder="ví dụ: Lớp 9A1"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Địa chỉ Email {role === 'student' ? '(Tùy chọn)' : <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === 'teacher' ? 'giaovien.sinhhoc9@thcs.edu.vn' : 'hocsinh@thcs.edu.vn'}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
                required={role === 'teacher'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Xác nhận Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mã lớp học tham gia (Tùy chọn)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={classCode}
                  onChange={e => setClassCode(e.target.value.toUpperCase())}
                  placeholder="ví dụ: BIO9A1 (có thể bổ sung sau)"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-sky-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none font-mono uppercase transition-all"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                role === 'teacher'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                  : 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/30'
              }`}
            >
              {isLoading ? (
                <span>Đang khởi tạo tài khoản...</span>
              ) : (
                <>
                  <span>
                    {role === 'teacher'
                      ? 'Đăng ký Tài khoản Giáo viên & Vào Quản trị'
                      : 'Hoàn tất Đăng ký Học sinh'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          Đã có tài khoản trên hệ thống?{' '}
          <button
            onClick={() => navigate('login')}
            className="font-bold text-sky-600 hover:text-sky-700 underline underline-offset-2 ml-1"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};

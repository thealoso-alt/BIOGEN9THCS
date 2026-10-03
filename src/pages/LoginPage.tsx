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
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const { navigate } = useNavigation();

  const [role, setRole] = useState<UserRole>('student');
  const [method, setMethod] = useState<'username' | 'email'>('username');
  const [identifier, setIdentifier] = useState('minhanh9a1');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleRoleToggle = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'teacher') {
      setIdentifier('');
      setPassword('');
    } else {
      setIdentifier(method === 'username' ? 'minhanh9a1' : 'nguyen.minhanh@student.edu.vn');
      setPassword('123456');
    }
    setErrorMsg(null);
  };

  const handleMethodToggle = (selectedMethod: 'username' | 'email') => {
    setMethod(selectedMethod);
    if (role === 'teacher') {
      setIdentifier('');
    } else {
      setIdentifier(selectedMethod === 'username' ? 'minhanh9a1' : 'nguyen.minhanh@student.edu.vn');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập hoặc email.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const isTryingAdmin = identifier.trim().toLowerCase() === 'admin';
      const res = await login(identifier, password, isTryingAdmin ? undefined : role);
      if (res.success) {
        if (isTryingAdmin) {
          navigate('admin_dashboard');
        } else if (role === 'teacher') {
          navigate('teacher_dashboard');
        } else {
          navigate('student_dashboard');
        }
      } else {
        setErrorMsg(res.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
      }
    } catch {
      setErrorMsg('Không thể kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (targetRole: UserRole) => {
    loginAsDemo(targetRole);
    if (targetRole === 'teacher') {
      navigate('teacher_dashboard');
    } else {
      navigate('student_dashboard');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-14">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-500 text-white shadow-md shadow-sky-500/30 mb-3">
            <Dna className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đăng nhập vào BIOGEN 9</h2>
          <p className="text-xs text-slate-500 mt-1">Cổng học tập &amp; quản trị Di truyền học số THCS</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 mb-5">
          <button
            type="button"
            onClick={() => handleRoleToggle('student')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'student'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Học sinh</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle('teacher')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'teacher'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="h-4 w-4" />
            <span>Giáo viên</span>
          </button>
        </div>

        {/* Helpful Tip for Students */}
        {role === 'student' && (
          <div className="mb-4 rounded-xl bg-sky-50 border border-sky-200/80 p-3 text-[11px] text-sky-800 leading-relaxed">
            <span className="font-bold">💡 Học sinh lưu ý:</span> Tên đăng nhập và Mật khẩu do Thầy/Cô bộ môn Sinh học cấp sau khi tải danh sách lớp lên hệ thống.
          </div>
        )}

        {/* Method Selector */}
        <div className="flex items-center justify-between text-xs text-slate-500 pb-2.5 border-b border-slate-100 mb-4">
          <span className="font-medium">Đăng nhập bằng:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMethodToggle('username')}
              className={`font-semibold transition-colors ${
                method === 'username' ? 'text-sky-600 underline underline-offset-4' : 'hover:text-slate-800'
              }`}
            >
              Username
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => handleMethodToggle('email')}
              className={`font-semibold transition-colors ${
                method === 'email' ? 'text-sky-600 underline underline-offset-4' : 'hover:text-slate-800'
              }`}
            >
              Email
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {method === 'username' ? 'Tên đăng nhập (Username)' : 'Địa chỉ Email'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                {method === 'username' ? <User className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              </span>
              <input
                type={method === 'username' ? 'text' : 'email'}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={
                  method === 'username'
                    ? role === 'teacher'
                      ? 'ví dụ: teacher_huong'
                      : 'ví dụ: minhanh9a1 hoặc anh.nm.9a1'
                    : 'ví dụ: email@thcs.edu.vn'
                }
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
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
              <span>Đang kiểm tra đăng nhập...</span>
            ) : (
              <>
                <span>Đăng nhập với vai trò {role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Prompts */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          Chưa có tài khoản Giáo viên?{' '}
          <button
            type="button"
            onClick={() => navigate('register')}
            className="font-bold text-purple-600 hover:text-purple-700 underline underline-offset-2 cursor-pointer"
          >
            Đăng ký tài khoản Giáo viên ngay
          </button>
        </div>

        {/* Cổng Quản trị viên Hệ thống */}
        <div className="mt-4 pt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIdentifier('admin');
              setPassword('admin');
              setErrorMsg(null);
            }}
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
            title="Đăng nhập tài khoản Quản trị viên Hệ thống (admin/admin)"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Đăng nhập Cổng Quản trị viên (admin)</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Quên Mật Khẩu?</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              <strong>Đối với Học sinh:</strong> Vui lòng liên hệ Giáo viên bộ môn Sinh học. Giáo viên có thể xem hoặc đổi lại mật khẩu cho bạn bất cứ lúc nào trong Bảng điều khiển lớp học.
              <br /><br />
              <strong>Đối với Giáo viên:</strong> Thầy/Cô có thể liên hệ quản trị trường hoặc kiểm tra email đăng ký.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

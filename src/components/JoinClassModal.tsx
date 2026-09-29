import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { KeyRound, X, CheckCircle2, AlertCircle, School } from 'lucide-react';

export const JoinClassModal: React.FC = () => {
  const { isJoinClassOpen, closeJoinClassModal, navigate } = useNavigation();
  const { joinClass, user, role } = useAuth();
  const [classCode, setClassCode] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isJoinClassOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập mã lớp học (Ví dụ: BIO9A1).' });
      return;
    }

    if (!user) {
      setStatusMsg({ type: 'error', text: 'Bạn cần đăng nhập trước khi tham gia lớp.' });
      setTimeout(() => {
        closeJoinClassModal();
        navigate('login');
      }, 1200);
      return;
    }

    const res = joinClass(classCode.trim());
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setStatusMsg(null);
        setClassCode('');
        closeJoinClassModal();
        navigate('student_dashboard');
      }, 1000);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <button
          onClick={closeJoinClassModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Tham gia Lớp học</h3>
            <p className="text-xs text-slate-400">Nhập mã lớp do giáo viên bộ môn cung cấp</p>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`mb-4 flex items-start gap-2 rounded-xl p-3 text-xs font-medium ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mã lớp học (Class Code)
            </label>
            <div className="relative">
              <input
                type="text"
                value={classCode}
                onChange={e => {
                  setClassCode(e.target.value.toUpperCase());
                  setStatusMsg(null);
                }}
                placeholder="Ví dụ: BIO9A1 hoặc BIO9A2"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 font-mono font-bold tracking-wider text-cyan-300 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none uppercase"
                autoFocus
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Gợi ý mã thử nghiệm:</span>
              <button
                type="button"
                onClick={() => setClassCode('BIO9A1')}
                className="font-mono text-cyan-400 underline hover:text-cyan-300"
              >
                BIO9A1
              </button>
              <span>hoặc</span>
              <button
                type="button"
                onClick={() => setClassCode('BIO9A2')}
                className="font-mono text-cyan-400 underline hover:text-cyan-300"
              >
                BIO9A2
              </button>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeJoinClassModal}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md shadow-cyan-900/40 transition-colors"
            >
              Tham gia ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

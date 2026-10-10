import React, { useState, useEffect } from 'react';
import { UserAccountCredential } from '../../../types/auth';
import { School, X, Check, Key } from 'lucide-react';

interface EditTeacherModalProps {
  isOpen: boolean;
  teacher: UserAccountCredential | null;
  onClose: () => void;
  onSave: (teacherUid: string, data: Partial<UserAccountCredential>) => void;
}

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({
  isOpen,
  teacher,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (teacher) {
      setFullName(teacher.fullName || '');
      setUsername(teacher.username || '');
      setTeacherCode(teacher.teacherCode || '');
      setEmail(teacher.email || '');
      setSchoolName(teacher.schoolName || '');
      setNewPassword('');
    }
  }, [teacher]);

  if (!isOpen || !teacher) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Tên đăng nhập!');
      return;
    }

    const payload: Partial<UserAccountCredential> = {
      fullName: fullName.trim(),
      username: username.trim(),
      teacherCode: teacherCode.trim() || teacher.teacherCode,
      email: email.trim(),
      schoolName: schoolName.trim(),
    };

    if (newPassword.trim()) {
      if (newPassword.trim().length < 4) {
        alert('Mật khẩu mới cần tối thiểu 4 ký tự!');
        return;
      }
      payload.password = newPassword.trim();
    }

    onSave(teacher.uid, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <School className="h-5 w-5 text-purple-600" />
            <span>Chỉnh Sửa Thông Tin Giáo Viên</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mã Giáo Viên (Teacher Code)</label>
            <input
              type="text"
              value={teacherCode}
              onChange={(e) => setTeacherCode(e.target.value)}
              placeholder="Ví dụ: GV-800001"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-purple-700 font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Họ và Tên Giáo Viên *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Thầy Trần Quang Huy"
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên Đăng Nhập (Username) *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="thayhuy.bio9"
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Công Tác</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="thayhuy@school.edu.vn"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Trường THCS Công Tác</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Ví dụ: THCS Chu Văn An"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Key className="h-3 w-3 text-amber-600" />
              <span>Đổi Mật Khẩu (Để trống nếu giữ nguyên mật khẩu cũ)</span>
            </label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Để trống nếu không đổi..."
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

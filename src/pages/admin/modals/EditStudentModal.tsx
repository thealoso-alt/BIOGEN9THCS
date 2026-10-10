import React, { useState, useEffect } from 'react';
import { StudentAccount, ClassRoom } from '../../../types/auth';
import { GraduationCap, X, Check, Key } from 'lucide-react';

interface EditStudentModalProps {
  isOpen: boolean;
  student: StudentAccount | null;
  classesList: ClassRoom[];
  onClose: () => void;
  onSave: (studentUid: string, data: Partial<StudentAccount & { password?: string; classId?: string }>) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  student,
  classesList,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState('');
  const [notes, setNotes] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (student) {
      setFullName(student.fullName || '');
      setStudentCode(student.studentCode || '');
      setUsername(student.username || '');
      setEmail(student.email || '');
      setClassId(student.classId || '');
      setNotes(student.notes || '');
      setNewPassword('');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Vui lòng nhập Họ và Tên học sinh!');
      return;
    }

    const payload: Partial<StudentAccount & { password?: string; classId?: string }> = {
      fullName: fullName.trim(),
      studentCode: studentCode.trim() || student.studentCode,
      username: username.trim() || student.username,
      email: email.trim(),
      classId: classId || student.classId,
      notes: notes.trim(),
    };

    if (newPassword.trim()) {
      if (newPassword.trim().length < 4) {
        alert('Mật khẩu mới cần tối thiểu 4 ký tự!');
        return;
      }
      payload.password = newPassword.trim();
    }

    onSave(student.uid, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            <span>Chỉnh Sửa Thông Tin Học Sinh</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mã Học Sinh (Student Code) *</label>
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="HS-900001"
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono font-bold text-emerald-700 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Họ và Tên Học Sinh *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Minh Anh"
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên Đăng Nhập (Username)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="minhanh9a1"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lớp Học Phân Công</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="">-- Chưa vào lớp nào --</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) - {c.teacherName || 'Chưa có GV'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Liên Hệ</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="minhanh@student.edu.vn"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi Chú Học Sinh</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú về học sinh, thành tích..."
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Lưu Học Sinh</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

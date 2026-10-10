import React, { useState, useEffect } from 'react';
import { ClassRoom, UserAccountCredential } from '../../../types/auth';
import { Layers, X, Check } from 'lucide-react';

interface EditClassModalProps {
  isOpen: boolean;
  classItem: ClassRoom | null;
  teachersList: UserAccountCredential[];
  onClose: () => void;
  onSave: (classId: string, data: Partial<ClassRoom>) => void;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({
  isOpen,
  classItem,
  teachersList,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [subject, setSubject] = useState('Sinh học 9 (Di truyền học)');
  const [schoolYear, setSchoolYear] = useState('2026–2027');
  const [teacherUid, setTeacherUid] = useState('');

  useEffect(() => {
    if (classItem) {
      setName(classItem.name || '');
      setCode(classItem.code || '');
      setSubject(classItem.subject || 'Sinh học 9 (Di truyền học)');
      setSchoolYear(classItem.schoolYear || '2026–2027');
      setTeacherUid(classItem.teacherId || '');
    }
  }, [classItem]);

  if (!isOpen || !classItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên lớp học!');
      return;
    }

    const selectedTeacher = teachersList.find(t => t.uid === teacherUid);

    const payload: Partial<ClassRoom> = {
      name: name.trim(),
      code: (code.trim() || classItem.code).toUpperCase(),
      subject: subject.trim(),
      schoolYear: schoolYear.trim(),
      teacherId: teacherUid || classItem.teacherId,
      teacherName: selectedTeacher?.fullName || classItem.teacherName,
      teacherCode: selectedTeacher?.teacherCode || classItem.teacherCode,
    };

    onSave(classItem.id, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-600" />
            <span>Chỉnh Sửa Thông Tin Lớp Học</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mã Lớp Học (Code)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="BIO9A1"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono uppercase font-bold text-sky-700 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên Lớp Học *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Lớp 9A1"
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Môn Học</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sinh học 9 (Di truyền học)"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Niên Khóa</label>
            <input
              type="text"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              placeholder="2026–2027"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Giáo Viên Phụ Trách</label>
            <select
              value={teacherUid}
              onChange={(e) => setTeacherUid(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="">-- Chưa gán giáo viên --</option>
              {teachersList.map((t) => (
                <option key={t.uid} value={t.uid}>
                  {t.fullName} ({t.teacherCode || 'GV'}) - @{t.username}
                </option>
              ))}
            </select>
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
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Lưu Lớp Học</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

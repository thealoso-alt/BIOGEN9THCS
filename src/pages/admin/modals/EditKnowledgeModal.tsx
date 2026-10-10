import React, { useState, useEffect } from 'react';
import { CloudTopicKnowledge } from '../../../firebase/knowledgeService';
import { BookOpen, X, Check, Plus, Trash2 } from 'lucide-react';

interface EditKnowledgeModalProps {
  isOpen: boolean;
  topicTitleVi: string;
  knowledge: CloudTopicKnowledge | null;
  onClose: () => void;
  onSave: (updatedKnowledge: CloudTopicKnowledge) => void;
}

export const EditKnowledgeModal: React.FC<EditKnowledgeModalProps> = ({
  isOpen,
  topicTitleVi,
  knowledge,
  onClose,
  onSave,
}) => {
  const [sections, setSections] = useState<CloudTopicKnowledge['sections']>([]);

  useEffect(() => {
    if (knowledge && Array.isArray(knowledge.sections)) {
      setSections(JSON.parse(JSON.stringify(knowledge.sections)));
    }
  }, [knowledge]);

  if (!isOpen || !knowledge) return null;

  const handleUpdateHeading = (idx: number, val: string) => {
    setSections(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], heading: val };
      return copy;
    });
  };

  const handleUpdateParagraphs = (idx: number, val: string) => {
    setSections(prev => {
      const copy = [...prev];
      // Split by double newline or newline
      copy[idx] = {
        ...copy[idx],
        paragraphs: val.split('\n\n').filter(p => p.trim().length > 0)
      };
      return copy;
    });
  };

  const handleUpdateBullets = (idx: number, val: string) => {
    setSections(prev => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        bulletPoints: val.split('\n').filter(b => b.trim().length > 0)
      };
      return copy;
    });
  };

  const handleUpdateHighlight = (idx: number, val: string) => {
    setSections(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], highlightBox: val };
      return copy;
    });
  };

  const handleAddSection = () => {
    setSections(prev => [
      ...prev,
      {
        heading: `${prev.length + 1}. Mục Kiến Thức Mới`,
        paragraphs: ['Nội dung kiến thức chuẩn sách giáo khoa mới được bổ sung...'],
        bulletPoints: ['Điểm cốt lõi 1', 'Điểm cốt lõi 2'],
      }
    ]);
  };

  const handleRemoveSection = (idx: number) => {
    if (sections.length <= 1) {
      alert('Chuyên đề cần ít nhất 1 mục kiến thức!');
      return;
    }
    if (window.confirm(`Xác nhận xóa mục "${sections[idx].heading}"?`)) {
      setSections(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSaveAll = () => {
    const updated: CloudTopicKnowledge = {
      ...knowledge,
      sections,
      lastUpdatedBy: 'ADMIN',
      lastUpdatedByName: 'Quản trị viên Hệ thống',
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-4xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span>Chỉnh Sửa Toàn Diện Kiến Thức SGK: {topicTitleVi}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã chuyên đề: <code className="font-mono text-indigo-700 font-bold">{knowledge.topicId}</code>. Thay đổi sẽ cập nhật trực tuyến tới tất cả học sinh và giáo viên.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Editor */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {sections.map((sec, idx) => (
            <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs font-mono">
                  MỤC #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSection(idx)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  title="Xóa mục này"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Heading */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu Đề Mục *</label>
                <input
                  type="text"
                  value={sec.heading}
                  onChange={(e) => handleUpdateHeading(idx, e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-900 focus:outline-none"
                />
              </div>

              {/* Paragraphs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội Dung Đoạn Văn (Phân cách các đoạn bằng 2 lần xuống dòng)
                </label>
                <textarea
                  rows={3}
                  value={(sec.paragraphs || []).join('\n\n')}
                  onChange={(e) => handleUpdateParagraphs(idx, e.target.value)}
                  placeholder="Nhập nội dung các đoạn văn lý thuyết..."
                  className="w-full rounded-xl bg-white border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:outline-none"
                />
              </div>

              {/* Bullet Points */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Các Gạch Đầu Dòng Trọng Tâm (Mỗi dòng 1 gạch đầu dòng)
                </label>
                <textarea
                  rows={3}
                  value={(sec.bulletPoints || []).join('\n')}
                  onChange={(e) => handleUpdateBullets(idx, e.target.value)}
                  placeholder="Mỗi dòng là một ý trọng tâm..."
                  className="w-full rounded-xl bg-white border border-slate-200 p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none"
                />
              </div>

              {/* Highlight Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hộp Ghi Chú / Nhận Định Quan Trọng (Highlight Box)
                </label>
                <input
                  type="text"
                  value={sec.highlightBox || ''}
                  onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                  placeholder="Ví dụ: Hệ quả nguyên tắc bổ sung: A = T, G = C..."
                  className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-amber-900 bg-amber-50/50 focus:outline-none"
                />
              </div>
            </div>
          ))}

          {/* Add Section Button */}
          <button
            type="button"
            onClick={handleAddSection}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Mục Kiến Thức Mới Cho Chuyên Đề Này</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Lưu &amp; Cập Nhật Kiến Thức Trực Tuyến</span>
          </button>
        </div>
      </div>
    </div>
  );
};

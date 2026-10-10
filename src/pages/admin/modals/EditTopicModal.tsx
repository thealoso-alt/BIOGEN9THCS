import React, { useState, useEffect } from 'react';
import { GeneticsTopic, ModuleType } from '../../../types/genetics';
import { Sparkles, X, Check } from 'lucide-react';

interface EditTopicModalProps {
  isOpen: boolean;
  topic: GeneticsTopic | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<GeneticsTopic>) => void;
}

export const EditTopicModal: React.FC<EditTopicModalProps> = ({
  isOpen,
  topic,
  onClose,
  onSave,
}) => {
  const [titleVi, setTitleVi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionVi, setDescriptionVi] = useState('');
  const [module, setModule] = useState<ModuleType>('molecular');
  const [order, setOrder] = useState<number>(1);
  const [interactiveType, setInteractiveType] = useState<GeneticsTopic['interactiveType']>('general');
  const [xpReward, setXpReward] = useState<number>(100);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(20);

  useEffect(() => {
    if (topic) {
      setTitleVi(topic.titleVi || '');
      setTitleEn(topic.titleEn || '');
      setDescriptionVi(topic.descriptionVi || '');
      setModule(topic.module || 'molecular');
      setOrder(topic.order || 1);
      setInteractiveType(topic.interactiveType || 'general');
      setXpReward(topic.xpReward || 100);
      setEstimatedMinutes(topic.estimatedMinutes || 20);
    }
  }, [topic]);

  if (!isOpen || !topic) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleVi.trim()) {
      alert('Vui lòng nhập Tên chủ đề Tiếng Việt!');
      return;
    }

    onSave(topic.id, {
      titleVi: titleVi.trim(),
      titleEn: titleEn.trim() || topic.titleEn,
      descriptionVi: descriptionVi.trim(),
      module,
      order: Number(order) || topic.order,
      interactiveType,
      xpReward: Number(xpReward) || 100,
      estimatedMinutes: Number(estimatedMinutes) || 20,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span>Chỉnh Sửa &amp; Đổi Tên Chủ Đề</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã định danh (ID): <code className="font-mono text-indigo-700 font-bold">{topic.id}</code>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tên Chủ Đề Tiếng Việt (Hiển thị chính trong hệ thống) *
            </label>
            <input
              type="text"
              value={titleVi}
              onChange={(e) => setTitleVi(e.target.value)}
              placeholder="Ví dụ: Cấu trúc & Chức năng DNA"
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 font-bold text-slate-900 text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên Tiếng Anh (Title English)</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Ví dụ: DNA Structure & Function"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phân Loại Module</label>
              <select
                value={module}
                onChange={(e) => setModule(e.target.value as ModuleType)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none"
              >
                <option value="molecular">Module A: Di truyền Phân tử</option>
                <option value="cellular">Module B: Di truyền Tế bào</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Thứ Tự Hiển Thị (#)</label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mô Hình Tương Tác 3D Không Gian</label>
            <select
              value={interactiveType}
              onChange={(e) => setInteractiveType(e.target.value as any)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none"
            >
              <option value="dna_helix">Xoắn kép DNA (Watson-Crick 3D Lab)</option>
              <option value="replication">Nhân đôi DNA (Replication Fork 3D)</option>
              <option value="transcription">Phiên mã (Transcription 3D)</option>
              <option value="translation">Dịch mã Polypeptide (Translation 3D)</option>
              <option value="mitosis">Nguyên phân tế bào (Mitosis 3D)</option>
              <option value="meiosis">Giảm phân tạo giao tử (Meiosis 3D)</option>
              <option value="chromosome">Cấu trúc Nhiễm sắc thể (Chromosome 3D)</option>
              <option value="general">Mô hình Phân tử Tương tác Chung</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mô Tả Ngắn Tóm Tắt Chủ Đề</label>
            <textarea
              rows={3}
              value={descriptionVi}
              onChange={(e) => setDescriptionVi(e.target.value)}
              placeholder="Tóm tắt ngắn gọn mục tiêu bài học..."
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800 focus:bg-white focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Thưởng XP Khi Hoàn Thành</label>
              <input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Thời Lượng Ước Tính (Phút)</label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none"
              />
            </div>
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Lưu Cập Nhật Chủ Đề</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

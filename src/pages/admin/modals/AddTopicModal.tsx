import React, { useState } from 'react';
import { GeneticsTopic, ModuleType } from '../../../types/genetics';
import { Plus, X, Check } from 'lucide-react';

interface AddTopicModalProps {
  isOpen: boolean;
  existingTopics: GeneticsTopic[];
  onClose: () => void;
  onAdd: (topic: GeneticsTopic) => void;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({
  isOpen,
  existingTopics,
  onClose,
  onAdd,
}) => {
  const [id, setId] = useState('');
  const [titleVi, setTitleVi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionVi, setDescriptionVi] = useState('');
  const [module, setModule] = useState<ModuleType>('molecular');
  const [order, setOrder] = useState<number>(existingTopics.length + 1);
  const [interactiveType, setInteractiveType] = useState<GeneticsTopic['interactiveType']>('general');
  const [xpReward, setXpReward] = useState<number>(100);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(20);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanId || !titleVi.trim()) {
      alert('Vui lòng nhập Mã định danh và Tên chủ đề!');
      return;
    }

    if (existingTopics.some(t => t.id === cleanId)) {
      alert(`Mã định danh "${cleanId}" đã tồn tại! Vui lòng chọn mã khác.`);
      return;
    }

    const newTopic: GeneticsTopic = {
      id: cleanId,
      slug: cleanId.replace(/_/g, '-'),
      order: Number(order) || existingTopics.length + 1,
      module,
      titleVi: titleVi.trim(),
      titleEn: titleEn.trim() || titleVi.trim(),
      descriptionVi: descriptionVi.trim() || 'Chủ đề sinh học chuyên sâu theo chuẩn chương trình.',
      keyConcepts: ['Khái niệm cốt lõi 1', 'Khái niệm cốt lõi 2'],
      interactiveType,
      xpReward: Number(xpReward) || 100,
      estimatedMinutes: Number(estimatedMinutes) || 20,
    };

    onAdd(newTopic);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-600" />
            <span>Thêm Chủ Đề Di Truyền Mới</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mã Định Danh (ID - chữ thường, không dấu) *
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Ví dụ: mendel hoặc quy_luat_di_truyen"
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-indigo-700 font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tên Chủ Đề Tiếng Việt *
            </label>
            <input
              type="text"
              value={titleVi}
              onChange={(e) => setTitleVi(e.target.value)}
              placeholder="Ví dụ: Các Quy Luật Di Truyền Của Menđen"
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 font-bold text-slate-900 text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên Tiếng Anh</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Mendelian Laws of Inheritance"
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
              <option value="general">Mô hình Phân tử Tương tác Chung</option>
              <option value="dna_helix">Xoắn kép DNA (Watson-Crick 3D Lab)</option>
              <option value="replication">Nhân đôi DNA (Replication Fork 3D)</option>
              <option value="transcription">Phiên mã (Transcription 3D)</option>
              <option value="translation">Dịch mã Polypeptide (Translation 3D)</option>
              <option value="mitosis">Nguyên phân tế bào (Mitosis 3D)</option>
              <option value="meiosis">Giảm phân tạo giao tử (Meiosis 3D)</option>
              <option value="chromosome">Cấu trúc Nhiễm sắc thể (Chromosome 3D)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mô Tả Chủ Đề</label>
            <textarea
              rows={3}
              value={descriptionVi}
              onChange={(e) => setDescriptionVi(e.target.value)}
              placeholder="Mô tả nội dung trọng tâm của chủ đề..."
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800 focus:bg-white focus:outline-none leading-relaxed"
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Thêm Vào Hệ Thống</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { QuestionItem, QuestionDifficulty, QuestionStatus } from '../../../types/question';
import { GeneticsTopic } from '../../../types/genetics';
import { HelpCircle, X, Check } from 'lucide-react';

interface EditQuestionModalProps {
  isOpen: boolean;
  question: QuestionItem | null;
  topics: GeneticsTopic[];
  onClose: () => void;
  onSave: (question: QuestionItem) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  question,
  topics,
  onClose,
  onSave,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [topicId, setTopicId] = useState(topics[0]?.id || 'nucleic_acid_gene');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('easy');
  const [status, setStatus] = useState<QuestionStatus>('published');
  const [explanation, setExplanation] = useState('');
  const [englishTerm, setEnglishTerm] = useState('');
  const [options, setOptions] = useState<{ id: string; text: string }[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    if (question) {
      setQuestionText(question.question || '');
      setTopicId(question.topicId || (topics[0]?.id || 'nucleic_acid_gene'));
      setDifficulty(question.difficulty || 'easy');
      setStatus(question.status || 'published');
      setExplanation(question.explanation || '');
      setEnglishTerm(question.englishTerm || '');
      setCorrectAnswer(
        Array.isArray(question.correctAnswer)
          ? question.correctAnswer[0] || ''
          : question.correctAnswer || (question.options?.[0]?.id || '')
      );
    }
  }, [question]);

  if (!isOpen || !question) return null;

  const handleOptionChange = (idx: number, text: string) => {
    setOptions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], text };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    const updated: QuestionItem = {
      ...question,
      question: questionText.trim(),
      topicId,
      difficulty,
      status,
      explanation: explanation.trim(),
      englishTerm: englishTerm.trim(),
      options: options.map(opt => ({
        ...opt,
        isCorrect: opt.id === correctAnswer
      })),
      correctAnswer,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            <span>Chỉnh Sửa Câu Hỏi Trong Ngân Hàng</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Question Text */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nội Dung Câu Hỏi *</label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 font-bold leading-relaxed focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Topic Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chủ Đề Áp Dụng</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
              >
                {topics.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.titleVi} ({t.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mức Độ Nhận Thức</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="easy">Dễ (Nhận biết)</option>
                <option value="medium">Trung bình (Thông hiểu)</option>
                <option value="hard">Khó (Vận dụng cao)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Trạng Thái Xuất Bản</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuestionStatus)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="published">Đã Duyệt (Xuất bản)</option>
                <option value="draft">Bản Nháp (Chưa duyệt)</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">
              Các Phương Án Lựa Chọn (Tích tròn chọn đáp án đúng):
            </label>
            {options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="radio"
                  name="correctAnswerChoice"
                  checked={correctAnswer === opt.id}
                  onChange={() => setCorrectAnswer(opt.id)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-bold text-slate-500 font-mono w-6">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Lời Giải Thích Chi Tiết SGK</label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích vì sao đáp án này đúng theo SGK..."
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          {/* English Term */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Thuật Ngữ Tiếng Anh Đi Kèm (Tùy chọn)</label>
            <input
              type="text"
              value={englishTerm}
              onChange={(e) => setEnglishTerm(e.target.value)}
              placeholder="Ví dụ: DNA Polymerase (Enzyme nhân đôi)"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Lưu Câu Hỏi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

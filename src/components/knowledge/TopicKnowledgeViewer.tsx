import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { TopicKnowledgeContent, TOPICS_KNOWLEDGE_BASE } from '../../data/topicsKnowledgeData';
import {
  subscribeToTopicKnowledge,
  saveTopicKnowledgeToCloud,
  resetTopicKnowledgeToDefault,
  CloudTopicKnowledge,
} from '../../firebase/knowledgeService';
import { syncKnowledgeToGoogleSheet } from '../../services/googleSheetService';
import {
  Pencil,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Info,
  CheckCircle2,
  BookOpen,
  Cloud,
  X,
  Sparkles,
} from 'lucide-react';

interface TopicKnowledgeViewerProps {
  topicId: string;
  topicTitleVi: string;
}

export const TopicKnowledgeViewer: React.FC<TopicKnowledgeViewerProps> = ({
  topicId,
  topicTitleVi,
}) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [knowledgeData, setKnowledgeData] = useState<CloudTopicKnowledge>(() => {
    const fallback = TOPICS_KNOWLEDGE_BASE[topicId] || TOPICS_KNOWLEDGE_BASE['dna'];
    return { ...fallback, topicId };
  });

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [draftSections, setDraftSections] = useState<TopicKnowledgeContent['sections']>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Subscribe to real-time Cloud updates so students get the latest edits instantly
  useEffect(() => {
    setIsEditing(false);
    const unsubscribe = subscribeToTopicKnowledge(topicId, (updated) => {
      setKnowledgeData(updated);
    });
    return () => unsubscribe();
  }, [topicId]);

  const handleStartEdit = () => {
    // Deep clone current sections into draft
    setDraftSections(JSON.parse(JSON.stringify(knowledgeData.sections || [])));
    setIsEditing(true);
    setSaveSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftSections([]);
  };

  const handleSaveToCloud = async () => {
    if (draftSections.length === 0) {
      alert('Vui lòng thêm ít nhất một phần kiến thức!');
      return;
    }

    setIsSaving(true);
    try {
      const payload: TopicKnowledgeContent = {
        topicId,
        sections: draftSections,
      };

      await saveTopicKnowledgeToCloud(payload, {
        uid: user?.uid || 'teacher',
        fullName: user?.fullName || 'Giáo viên',
      });

      // Synchronize customized standard knowledge to Google Sheet
      syncKnowledgeToGoogleSheet({
        teacherCode: user?.teacherCode || 'GV-ONLINE',
        teacherName: user?.fullName || 'Giáo viên',
        topicId,
        topicTitle: topicTitleVi,
        sectionCount: draftSections.length,
        summary: draftSections.map(s => s.heading).join('; '),
        updatedAt: new Date().toISOString(),
      }).catch(err => console.warn('Could not sync knowledge to Google Sheet:', err));

      setIsEditing(false);
      setSaveSuccessMsg('Đã lưu và xuất bản trực tuyến lên Cloud Firestore & Google Sheet! Tất cả học sinh sẽ thấy nội dung mới nhất ngay lập tức.');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Lỗi khi lưu kiến thức lên Cloud:', err);
      alert('Có lỗi khi lưu lên Cloud. Dữ liệu đã được lưu tạm trên máy này.');
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = async () => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn khôi phục về nội dung gốc SGK ban đầu? Mọi tùy chỉnh trước đó sẽ bị hoàn tác.')) {
      setIsSaving(true);
      try {
        await resetTopicKnowledgeToDefault(topicId);
        const fallback = TOPICS_KNOWLEDGE_BASE[topicId] || TOPICS_KNOWLEDGE_BASE['dna'];
        setKnowledgeData({ ...fallback, topicId });
        setIsEditing(false);
        setSaveSuccessMsg('Đã khôi phục nội dung chuẩn SGK thành công.');
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Section manipulation helpers
  const handleUpdateHeading = (idx: number, heading: string) => {
    const copy = [...draftSections];
    copy[idx].heading = heading;
    setDraftSections(copy);
  };

  const handleUpdateParagraphsText = (idx: number, text: string) => {
    const copy = [...draftSections];
    const paras = text.split('\n\n').map(p => p.trim()).filter(Boolean);
    copy[idx].paragraphs = paras.length > 0 ? paras : undefined;
    setDraftSections(copy);
  };

  const handleUpdateBulletPointsText = (idx: number, text: string) => {
    const copy = [...draftSections];
    const bullets = text.split('\n').map(b => b.trim()).filter(Boolean);
    copy[idx].bulletPoints = bullets.length > 0 ? bullets : undefined;
    setDraftSections(copy);
  };

  const handleUpdateHighlightBox = (idx: number, text: string) => {
    const copy = [...draftSections];
    copy[idx].highlightBox = text.trim() ? text.trim() : undefined;
    setDraftSections(copy);
  };

  const handleUpdateFormulaBox = (idx: number, title: string, formulasText: string) => {
    const copy = [...draftSections];
    const formulas = formulasText.split('\n').map(f => f.trim()).filter(Boolean);
    if (formulas.length > 0 || title.trim()) {
      copy[idx].formulaBox = {
        title: title.trim() || 'Hệ thống công thức trọng tâm',
        formulas,
      };
    } else {
      copy[idx].formulaBox = undefined;
    }
    setDraftSections(copy);
  };

  const handleAddSection = () => {
    setDraftSections(prev => [
      ...prev,
      {
        heading: `${prev.length + 1}. Tiêu đề phần kiến thức mới`,
        paragraphs: ['Nội dung lý thuyết trọng tâm...'],
        bulletPoints: ['Ý chính 1', 'Ý chính 2'],
      },
    ]);
  };

  const handleDeleteSection = (idx: number) => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa phần kiến thức này?')) {
      setDraftSections(prev => prev.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Teacher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold font-mono">
              PHẦN 2: KIẾN THỨC CHUẨN
            </span>
            {knowledgeData.updatedAt && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Đã biên soạn &amp; đồng bộ Cloud bởi {knowledgeData.lastUpdatedByName || 'Giáo viên'}</span>
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Nội dung lý thuyết &amp; Công thức: {topicTitleVi}
          </h2>
        </div>

        {/* Action button: If teacher or previewing */}
        <div className="flex items-center gap-2 shrink-0">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/20 transition-all cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Chỉnh sửa nội dung cho HS</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleResetDefault}
                disabled={isSaving}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                title="Khôi phục nguyên bản SGK"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Khôi phục SGK</span>
              </button>
              <button
                onClick={handleSaveToCloud}
                disabled={isSaving}
                className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu Cloud...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="h-3.5 w-3.5" />
                    <span>Lưu &amp; Xuất bản Online</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* VIEW MODE: For Students and Teachers */}
      {!isEditing && (
        <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 space-y-6 shadow-sm text-slate-800">
          <div className="max-w-4xl space-y-6">
            {knowledgeData.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3 pb-6 border-b border-slate-100 last:border-b-0">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-sky-500 rounded-full" />
                  <span>{sec.heading}</span>
                </h3>

                {sec.paragraphs?.map((p, pIdx) => (
                  <p key={pIdx} className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {p}
                  </p>
                ))}

                {sec.bulletPoints && (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pl-3">
                    {sec.bulletPoints.map((bp, bpIdx) => (
                      <li key={bpIdx} className="flex items-start gap-2">
                        <span className="text-sky-500 font-bold mt-0.5 shrink-0">•</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {sec.formulaBox && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 shadow-xs">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      {sec.formulaBox.title}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono font-bold text-amber-900">
                      {sec.formulaBox.formulas.map((f, fIdx) => (
                        <div key={fIdx} className="p-2.5 rounded-xl bg-white border border-amber-200 shadow-xs">
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sec.highlightBox && (
                  <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/80 text-xs sm:text-sm text-sky-900 flex items-start gap-2.5">
                    <Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                    <span className="leading-relaxed font-medium">{sec.highlightBox}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT MODE: Teacher Interactive Live Editor */}
      {isEditing && (
        <div className="rounded-3xl border-2 border-purple-300 bg-purple-50/30 p-6 sm:p-8 space-y-6 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-purple-200">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" />
                CHẾ ĐỘ BIÊN TẬP NỘI DUNG ONLINE (DÀNH CHO GIÁO VIÊN)
              </span>
              <p className="text-xs text-slate-600">
                Thầy/Cô có thể chỉnh sửa tiêu đề, đoạn văn, danh sách ý chính và hệ thống công thức sao cho phù hợp nhất với năng lực học sinh lớp mình.
              </p>
            </div>
            <button
              onClick={handleAddSection}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Thêm mục mới</span>
            </button>
          </div>

          <div className="space-y-6">
            {draftSections.map((sec, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-4 relative"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Tiêu đề Mục #{idx + 1}
                    </label>
                    <input
                      type="text"
                      value={sec.heading}
                      onChange={e => handleUpdateHeading(idx, e.target.value)}
                      placeholder="ví dụ: 1. Tính chất hóa học & Nguyên tắc đa phân..."
                      className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSection(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all self-end"
                    title="Xóa mục này"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Paragraphs */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Đoạn văn lý thuyết (Cách nhau 2 lần xuống dòng để tạo đoạn mới)
                  </label>
                  <textarea
                    value={sec.paragraphs ? sec.paragraphs.join('\n\n') : ''}
                    onChange={e => handleUpdateParagraphsText(idx, e.target.value)}
                    placeholder="Nhập nội dung đoạn văn..."
                    rows={3}
                    className="w-full p-3 text-xs leading-relaxed text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Bullet Points */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Các ý chính / Gạch đầu dòng (Mỗi dòng một ý)
                  </label>
                  <textarea
                    value={sec.bulletPoints ? sec.bulletPoints.join('\n') : ''}
                    onChange={e => handleUpdateBulletPointsText(idx, e.target.value)}
                    placeholder="Ý gạch đầu dòng 1&#10;Ý gạch đầu dòng 2..."
                    rows={3}
                    className="w-full p-3 text-xs leading-relaxed text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Formula Box (Optional) */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                  <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Hệ thống Công thức (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={sec.formulaBox?.title || ''}
                    onChange={e => handleUpdateFormulaBox(idx, e.target.value, sec.formulaBox?.formulas?.join('\n') || '')}
                    placeholder="Tiêu đề hộp công thức (ví dụ: Hệ thống công thức toán sinh DNA)..."
                    className="w-full px-3 py-1.5 text-xs font-bold text-amber-900 bg-white border border-amber-300 rounded-lg focus:outline-none"
                  />
                  <textarea
                    value={sec.formulaBox?.formulas ? sec.formulaBox.formulas.join('\n') : ''}
                    onChange={e => handleUpdateFormulaBox(idx, sec.formulaBox?.title || '', e.target.value)}
                    placeholder="Mỗi dòng một công thức, ví dụ:&#10;N = 2A + 2G&#10;L = (N / 2) × 3,4 Å"
                    rows={3}
                    className="w-full p-2.5 text-xs font-mono font-bold text-amber-950 bg-white border border-amber-300 rounded-lg focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Highlight Box (Optional) */}
                <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-2">
                  <label className="block text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                    Hộp lưu ý trọng tâm / Ghi chú đặc biệt (Tùy chọn)
                  </label>
                  <textarea
                    value={sec.highlightBox || ''}
                    onChange={e => handleUpdateHighlightBox(idx, e.target.value)}
                    placeholder="Ghi chú quan trọng cần nhấn mạnh với học sinh..."
                    rows={2}
                    className="w-full p-2.5 text-xs text-sky-950 bg-white border border-sky-300 rounded-lg focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            ))}

            {/* Add Section Button Bottom */}
            <button
              type="button"
              onClick={handleAddSection}
              className="w-full py-3 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl text-purple-700 hover:text-purple-900 text-xs font-bold flex items-center justify-center gap-1.5 bg-white transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Thêm một phần kiến thức mới vào chuyên đề</span>
            </button>

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 italic">
                * Bấm &quot;Lưu &amp; Xuất bản Online&quot; để cập nhật ngay lập tức cho toàn bộ học sinh trên mọi thiết bị.
              </span>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-900/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang đồng bộ Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4" />
                      <span>Lưu &amp; Xuất bản Online lên Cloud</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

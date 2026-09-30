import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { GENETICS_TOPICS } from '../../data/topicsData';
import { DEMO_QUESTIONS } from '../../data/mockSeedData';
import { QuestionItem, QuestionStatus, QuestionType, QuestionDifficulty } from '../../types/question';
import { ClassRoom, StudentAccount } from '../../types/auth';
import { StudentBatchImportModal } from '../../components/teacher/StudentBatchImportModal';
import { exportAccountsToCsv, generateStudentPassword } from '../../utils/accountGenerator';
import {
  subscribeToQuestionBank,
  saveQuestionToCloud,
  deleteQuestionFromCloud,
  getCachedQuestions,
} from '../../firebase/questionBankService';
import {
  School,
  Users,
  BookOpen,
  Sparkles,
  Swords,
  Plus,
  KeyRound,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  Bot,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Search,
  Download,
  Printer,
  Copy,
  Lock,
  RotateCcw,
  Sparkle,
  Pencil,
  Filter,
  X,
  Cloud,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    user,
    classes,
    addClass,
    getStudentsByClass,
    updateStudentPassword,
    deleteStudent,
  } = useAuth();
  const { navigate } = useNavigation();

  // Active teacher tabs: overview, classes, students, questions, ai_generator, analytics
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'students' | 'questions' | 'ai_generator' | 'analytics'>('overview');

  // Question bank state (synchronized with Firestore Cloud Database & local storage)
  const [questions, setQuestions] = useState<QuestionItem[]>(() => getCachedQuestions());

  useEffect(() => {
    const unsubscribe = subscribeToQuestionBank((cloudQuestions) => {
      if (cloudQuestions && cloudQuestions.length > 0) {
        setQuestions(cloudQuestions);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter state for Question Bank
  const [qSearchQuery, setQSearchQuery] = useState('');
  const [qTopicFilter, setQTopicFilter] = useState('all');
  const [qTypeFilter, setQTypeFilter] = useState('all');
  const [qStatusFilter, setQStatusFilter] = useState('all');
  const [qDifficultyFilter, setQDifficultyFilter] = useState('all');

  // Add / Edit Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [formTopicId, setFormTopicId] = useState('dna');
  const [formQuestionType, setFormQuestionType] = useState<QuestionType>('mcq');
  const [formPrompt, setFormPrompt] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formTrueFalseAnswer, setFormTrueFalseAnswer] = useState(true);
  const [formExplanation, setFormExplanation] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>('medium');
  const [formStatus, setFormStatus] = useState<QuestionStatus>('published');
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // New Class Form Modal
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('Sinh học 9 (Di truyền học)');
  const [newClassYear, setNewClassYear] = useState('2026–2027');
  const [newClassCode, setNewClassCode] = useState('');

  // Batch Student Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importClassId, setImportClassId] = useState<string>('');

  // Selected Class for Roster view
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<string>(() => classes[0]?.id || 'class_9a1');

  // Student Search Query in Roster
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Visibility map for student passwords
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Single Student Password Reset Modal
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Generator Form
  const [aiTopicId, setAiTopicId] = useState('dna_replication');
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiType, setAiType] = useState<QuestionType>('mcq');
  const [aiIncludeEnglish, setAiIncludeEnglish] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Question review modal state
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const generatedCode = newClassCode.trim() || `BIO${newClassName.replace(/\s+/g, '').toUpperCase()}`;
    const created = addClass({
      name: newClassName.trim(),
      code: generatedCode.toUpperCase(),
      subject: newClassSubject.trim(),
      schoolYear: newClassYear.trim(),
      teacherId: user?.uid || 'teacher_1',
      teacherName: user?.fullName || 'Giáo viên',
      description: `Lớp học ${newClassName.trim()} - Năm học ${newClassYear.trim()}`,
    });

    setNewClassName('');
    setNewClassCode('');
    setIsAddClassOpen(false);
    setSelectedClassForRoster(created.id);
    triggerToast(`Đã tạo thành công lớp ${created.name} (${created.code})!`);
  };

  const handleOpenImportModal = (classId?: string) => {
    setImportClassId(classId || selectedClassForRoster || classes[0]?.id || '');
    setIsImportModalOpen(true);
  };

  // Current class roster
  const currentClassObj = classes.find(c => c.id === selectedClassForRoster) || classes[0];
  const currentRoster = currentClassObj ? getStudentsByClass(currentClassObj.id) : [];

  const filteredRoster = currentRoster.filter(st => {
    if (!studentSearchQuery.trim()) return true;
    const q = studentSearchQuery.toLowerCase();
    return st.fullName.toLowerCase().includes(q) || st.username.toLowerCase().includes(q);
  });

  const togglePasswordVisibility = (uid: string) => {
    setShowPasswordMap(prev => ({ ...prev, [uid]: !prev[uid] }));
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Đã sao chép ${label}: ${text}`);
  };

  const handleOpenResetPassword = (student: StudentAccount) => {
    setEditingStudent(student);
    setNewPasswordInput(generateStudentPassword('secure_random'));
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !newPasswordInput.trim()) return;
    const ok = updateStudentPassword(editingStudent.uid, newPasswordInput.trim());
    if (ok) {
      triggerToast(`Đã cập nhật mật khẩu mới cho ${editingStudent.fullName}!`);
      setEditingStudent(null);
      setNewPasswordInput('');
    }
  };

  const handleDeleteStudentAction = (student: StudentAccount) => {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${student.fullName}" khỏi lớp ${student.className}?`)) {
      deleteStudent(student.uid, student.classId);
      triggerToast(`Đã xóa học sinh ${student.fullName} khỏi danh sách.`);
    }
  };

  const handleExportRosterCsv = (classId: string) => {
    const targetC = classes.find(c => c.id === classId);
    if (!targetC) return;
    const list = getStudentsByClass(classId);
    if (list.length === 0) {
      alert(`Lớp ${targetC.name} hiện chưa có học sinh nào.`);
      return;
    }
    const formatted = list.map((a, i) => ({
      stt: i + 1,
      fullName: a.fullName,
      username: a.username,
      password: a.password,
      className: targetC.name,
      classCode: targetC.code,
      email: a.email,
    }));
    exportAccountsToCsv(formatted, `Danh_sach_tai_khoan_lop_${targetC.name.replace(/\s+/g, '_')}.csv`);
  };

  const handlePrintCards = (classId: string) => {
    const targetC = classes.find(c => c.id === classId);
    if (!targetC) return;
    const list = getStudentsByClass(classId);
    if (list.length === 0) {
      alert(`Lớp ${targetC.name} hiện chưa có học sinh nào để in.`);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép popup để mở phiếu in.');
      return;
    }

    const cardsHtml = list
      .map(
        (acc, i) => `
        <div class="card">
          <div class="card-header">
            <span class="badge">BIOGEN 9 · THCS</span>
            <span class="class-tag">${targetC.name}</span>
          </div>
          <div class="student-name">${i + 1}. ${acc.fullName}</div>
          <div class="credential-box">
            <div class="cred-row">
              <span class="cred-label">Tên đăng nhập:</span>
              <span class="cred-val">${acc.username}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Mật khẩu:</span>
              <span class="cred-val">${acc.password}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Mã lớp:</span>
              <span class="cred-val">${targetC.code}</span>
            </div>
          </div>
          <div class="card-footer">
            <span>Website học tập: BIOGEN 9 Learning Hub</span>
          </div>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Thẻ Tài Khoản Học Sinh - ${targetC.name}</title>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #111; margin: 0; padding: 10px; }
          .title { text-align: center; margin-bottom: 20px; }
          .title h2 { margin: 0 0 5px 0; font-size: 18px; color: #1e293b; }
          .title p { margin: 0; font-size: 12px; color: #64748b; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .card { border: 1.5px dashed #94a3b8; border-radius: 10px; padding: 12px 14px; page-break-inside: avoid; background: #f8fafc; }
          .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
          .badge { font-weight: 800; font-size: 11px; color: #0284c7; }
          .class-tag { background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; }
          .student-name { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
          .credential-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; font-size: 12px; }
          .cred-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .cred-row:last-child { margin-bottom: 0; }
          .cred-label { color: #64748b; font-weight: 500; }
          .cred-val { font-family: monospace; font-weight: 700; color: #0f172a; font-size: 12px; }
          .card-footer { margin-top: 8px; font-size: 10px; color: #94a3b8; text-align: right; }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: right;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
            🖨️ In Trang Này (Cắt phát cho học sinh)
          </button>
        </div>
        <div class="title">
          <h2>THẺ TÀI KHOẢN HỌC TẬP - LỚP ${targetC.name.toUpperCase()}</h2>
          <p>Mã tham gia lớp: <strong>${targetC.code}</strong></p>
        </div>
        <div class="grid">${cardsHtml}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyZaloRoster = (classId: string) => {
    const targetC = classes.find(c => c.id === classId);
    if (!targetC) return;
    const list = getStudentsByClass(classId);
    if (list.length === 0) {
      alert(`Lớp ${targetC.name} chưa có học sinh nào.`);
      return;
    }
    let text = `DANH SÁCH TÀI KHOẢN HỌC TẬP BIOGEN 9 - ${targetC.name.toUpperCase()}\n`;
    text += `Mã vào lớp: ${targetC.code}\n`;
    text += `----------------------------------------\n`;
    list.forEach((acc, i) => {
      text += `${i + 1}. ${acc.fullName}\n   - Tên đăng nhập: ${acc.username}\n   - Mật khẩu: ${acc.password}\n`;
    });
    navigator.clipboard.writeText(text);
    triggerToast(`Đã sao chép danh sách lớp ${targetC.name} để gửi Zalo!`);
  };

  // AI Question Generation Simulation
  const handleAiGenerate = () => {
    setIsGenerating(true);
    setAiSuccessMsg(null);

    setTimeout(() => {
      const targetTopic = GENETICS_TOPICS.find(t => t.id === aiTopicId) || GENETICS_TOPICS[0];
      const newDraftQuestion: QuestionItem = {
        id: 'q_ai_' + Date.now(),
        topicId: aiTopicId,
        question: `[AI DRAFT] Trong cơ chế ${targetTopic.titleVi.toLowerCase()}, hiện tượng nào đảm bảo tính chính xác và đặc thù của quá trình?`,
        type: aiType,
        options: [
          { id: 'opt_a', text: 'Nguyên tắc bổ sung và hoạt tính đọc sửa của enzyme' },
          { id: 'opt_b', text: 'Sự phân ly ngẫu nhiên của các nhiễm sắc thể' },
          { id: 'opt_c', text: 'Quá trình tháo xoắn không hồi phục' },
          { id: 'opt_d', text: 'Tác động ngẫu nhiên của nhiệt độ môi trường' },
        ],
        correctAnswer: 'opt_a',
        explanation: 'Nguyên tắc bổ sung giữa các bazơ nitric kết hợp cùng hoạt tính hiệu đính của enzyme giúp duy trì độ chính xác tối đa trong quá trình di truyền.',
        difficulty: aiDifficulty,
        language: aiIncludeEnglish ? 'bilingual' : 'vi',
        englishTerm: aiIncludeEnglish ? `${targetTopic.titleEn} Mechanism` : undefined,
        createdBy: user?.uid || 'teacher_demo_1',
        createdByName: user?.fullName || 'Cô Nguyễn Thu Hương',
        status: 'draft',
        isAiGenerated: true,
        aiModel: 'Gemini 2.5 Flash',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setQuestions(prev => [newDraftQuestion, ...prev]);
      saveQuestionToCloud(newDraftQuestion).catch(err => console.warn('Could not save AI question to cloud:', err));
      setIsGenerating(false);
      setAiSuccessMsg(`Đã tạo thành công câu hỏi ở trạng thái BẢN NHÁP (DRAFT) và lưu lên Cloud. Vui lòng duyệt trước khi xuất bản.`);
    }, 1200);
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setFormTopicId(qTopicFilter !== 'all' ? qTopicFilter : 'dna');
    setFormQuestionType('mcq');
    setFormPrompt('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormTrueFalseAnswer(true);
    setFormExplanation('');
    setFormDifficulty('medium');
    setFormStatus('published');
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: QuestionItem) => {
    setEditingQuestionId(q.id);
    setFormTopicId(q.topicId);
    setFormQuestionType(q.type);
    setFormPrompt(q.question);
    if (q.type === 'mcq') {
      const opts = q.options.map(o => o.text.replace(/^[A-D]\.\s*/i, ''));
      while (opts.length < 4) opts.push('');
      setFormOptions(opts.slice(0, 4));

      let cIdx = 0;
      if (typeof q.correctAnswer === 'string' && q.correctAnswer.startsWith('opt_')) {
        cIdx = parseInt(q.correctAnswer.replace('opt_', ''), 10) || 0;
      }
      setFormCorrectIndex(cIdx);
    } else {
      let isTrue = true;
      if (q.correctAnswer === 'opt_false' || q.correctAnswer === 'false') isTrue = false;
      setFormTrueFalseAnswer(isTrue);
      setFormOptions(['', '', '', '']);
    }
    setFormExplanation(q.explanation);
    setFormDifficulty(q.difficulty);
    setFormStatus(q.status);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestionForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    setIsSavingQuestion(true);

    let savedQuestion: QuestionItem;
    if (formQuestionType === 'mcq') {
      const letters = ['A. ', 'B. ', 'C. ', 'D. '];
      const validOptions = formOptions.map((opt, idx) => ({
        id: `opt_${idx}`,
        text: `${letters[idx]}${opt.trim() || `Phương án ${letters[idx].trim()}`}`,
        isCorrect: idx === formCorrectIndex,
      }));

      savedQuestion = {
        id: editingQuestionId || `custom_q_${Date.now()}`,
        topicId: formTopicId,
        question: formPrompt.trim(),
        type: 'mcq',
        options: validOptions,
        correctAnswer: `opt_${formCorrectIndex}`,
        explanation: formExplanation.trim() || 'Lời giải chi tiết theo chương trình Sinh học 9.',
        difficulty: formDifficulty,
        language: 'vi',
        createdBy: user?.uid || 'teacher_1',
        createdByName: user?.fullName || 'Giáo viên',
        status: formStatus,
        createdAt: editingQuestionId ? (questions.find(q => q.id === editingQuestionId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      savedQuestion = {
        id: editingQuestionId || `custom_q_${Date.now()}`,
        topicId: formTopicId,
        question: formPrompt.trim(),
        type: 'true_false',
        options: [
          { id: 'opt_true', text: 'Đúng', isCorrect: formTrueFalseAnswer === true },
          { id: 'opt_false', text: 'Sai', isCorrect: formTrueFalseAnswer === false },
        ],
        correctAnswer: formTrueFalseAnswer ? 'opt_true' : 'opt_false',
        explanation: formExplanation.trim() || 'Phân tích nhận định tính đúng/sai.',
        difficulty: formDifficulty,
        language: 'vi',
        createdBy: user?.uid || 'teacher_1',
        createdByName: user?.fullName || 'Giáo viên',
        status: formStatus,
        createdAt: editingQuestionId ? (questions.find(q => q.id === editingQuestionId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      await saveQuestionToCloud(savedQuestion);
      setQuestions(prev => {
        const idx = prev.findIndex(q => q.id === savedQuestion.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = savedQuestion;
          return next;
        }
        return [savedQuestion, ...prev];
      });
      setIsQuestionModalOpen(false);
      triggerToast(editingQuestionId ? 'Đã cập nhật câu hỏi và đồng bộ Cloud thành công!' : 'Đã thêm câu hỏi mới vào Ngân hàng và đồng bộ Cloud!');
    } catch (err) {
      console.warn('Could not save to cloud:', err);
      triggerToast('Đã lưu cục bộ, kết nối Cloud đang đồng bộ lại.');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleApproveAndPublish = async (qId: string) => {
    const target = questions.find(q => q.id === qId);
    if (!target) return;
    const updated: QuestionItem = {
      ...target,
      status: 'published',
      updatedAt: new Date().toISOString()
    };
    setQuestions(prev =>
      prev.map(q => (q.id === qId ? updated : q))
    );
    try {
      await saveQuestionToCloud(updated);
      triggerToast('Đã xuất bản câu hỏi lên Cloud! Học sinh ở mọi thiết bị có thể làm ngay.');
    } catch (err) {
      console.warn('Could not publish to cloud:', err);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    const targetQ = questions.find(q => q.id === qId);
    if (!targetQ) return;
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi Ngân hàng không?`)) {
      setQuestions(prev => prev.filter(q => q.id !== qId));
      if (previewQuestion?.id === qId) setPreviewQuestion(null);
      try {
        await deleteQuestionFromCloud(qId);
        triggerToast('Đã xóa câu hỏi khỏi Ngân hàng và Cloud Firestore thành công.');
      } catch (err) {
        console.warn('Could not delete question from cloud:', err);
      }
    }
  };

  const filteredQuestions: QuestionItem[] = questions.filter(q => {
    if (qTopicFilter !== 'all' && q.topicId !== qTopicFilter) return false;
    if (qTypeFilter !== 'all' && q.type !== qTypeFilter) return false;
    if (qStatusFilter !== 'all' && q.status !== qStatusFilter) return false;
    if (qDifficultyFilter !== 'all' && q.difficulty !== qDifficultyFilter) return false;
    if (qSearchQuery.trim()) {
      const term = qSearchQuery.toLowerCase();
      const matchText = (q.question || '').toLowerCase().includes(term);
      const matchExpl = (q.explanation || '').toLowerCase().includes(term);
      const matchOpt = (q.options || []).some(o => (o.text || '').toLowerCase().includes(term));
      if (!matchText && !matchExpl && !matchOpt) return false;
    }
    return true;
  });

  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 shadow-xl text-xs font-bold animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Teacher Top Header */}
      <div className="rounded-3xl border border-purple-900/40 bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold">
              <School className="h-4 w-4" />
              <span>BẢNG ĐIỀU KHIỂN GIÁO VIÊN SINH HỌC 9</span>
              {user?.schoolName && (
                <span className="text-slate-400">· {user.schoolName}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Xin chào, {user?.fullName || 'Giáo viên'}! 🔬
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Quản lý lớp học, tải lên danh sách học sinh và tự động tạo TK/MK, duyệt câu hỏi do AI tạo (Draft → Review → Publish), và theo dõi tiến độ học tập.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => handleOpenImportModal()}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Tải DS &amp; Tạo TK Học Sinh</span>
            </button>

            <button
              onClick={() => setIsAddClassOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-900/40 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo Lớp Mới</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_generator')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 hover:bg-cyan-900/40 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>AI Tạo Câu Hỏi</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div
            onClick={() => setActiveTab('students')}
            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-600/60 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Users className="h-3.5 w-3.5 text-purple-400" />
              <span>Tổng học sinh</span>
            </div>
            <span className="text-2xl font-black text-white font-mono">{totalStudents}</span>
          </div>

          <div
            onClick={() => setActiveTab('classes')}
            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-600/60 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <School className="h-3.5 w-3.5 text-cyan-400" />
              <span>Số lớp phụ trách</span>
            </div>
            <span className="text-2xl font-black text-white font-mono">{classes.length}</span>
          </div>

          <div
            onClick={() => setActiveTab('questions')}
            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-600/60 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span>Ngân hàng câu hỏi</span>
            </div>
            <span className="text-2xl font-black text-white font-mono">{questions.length}</span>
          </div>

          <div
            onClick={() => setActiveTab('questions')}
            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-600/60 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Câu hỏi chờ duyệt (Draft)</span>
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {questions.filter(q => q.status === 'draft').length}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs - High Contrast, Crystal Clear Pill Nav */}
      <div className="bg-slate-900/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border-2 border-slate-700 shadow-xl flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-900/40 border border-purple-400/40 ring-1 ring-white/20'
              : 'text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <BookOpen className={`h-4 w-4 ${activeTab === 'overview' ? 'text-white' : 'text-purple-400'}`} />
          <span>Tổng quan &amp; Hoạt động</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeTab === 'students'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-900/40 border border-purple-400/40 ring-1 ring-white/20'
              : 'text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <Users className={`h-4 w-4 ${activeTab === 'students' ? 'text-white' : 'text-emerald-400'}`} />
          <span>Học sinh &amp; Cấp TK</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'students' ? 'bg-purple-950/80 text-purple-200 border border-purple-300/40' : 'bg-slate-900 text-emerald-300 border border-slate-600'
          }`}>
            {totalStudents}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeTab === 'classes'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-900/40 border border-purple-400/40 ring-1 ring-white/20'
              : 'text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <School className={`h-4 w-4 ${activeTab === 'classes' ? 'text-white' : 'text-amber-400'}`} />
          <span>Quản lý Lớp học</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'classes' ? 'bg-purple-950/80 text-purple-200 border border-purple-300/40' : 'bg-slate-900 text-amber-300 border border-slate-600'
          }`}>
            {classes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeTab === 'questions'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-900/40 border border-purple-400/40 ring-1 ring-white/20'
              : 'text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <CheckCircle2 className={`h-4 w-4 ${activeTab === 'questions' ? 'text-white' : 'text-sky-400'}`} />
          <span>Ngân hàng Câu hỏi</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'questions' ? 'bg-purple-950/80 text-purple-200 border border-purple-300/40' : 'bg-slate-900 text-sky-300 border border-slate-600'
          }`}>
            {questions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ai_generator')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeTab === 'ai_generator'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-900/40 border border-purple-400/40 ring-1 ring-white/20'
              : 'text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <Sparkles className={`h-4 w-4 ${activeTab === 'ai_generator' ? 'text-white' : 'text-cyan-400'}`} />
          <span>AI Question Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-xs ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-900/40 border border-purple-400/40 ring-1 ring-white/20'
              : 'text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <FileSpreadsheet className={`h-4 w-4 ${activeTab === 'analytics' ? 'text-white' : 'text-emerald-400'}`} />
          <span>Báo cáo &amp; Xuất dữ liệu</span>
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Class Cards */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Lớp học Đang phụ trách</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenImportModal()}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Tải danh sách học sinh</span>
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => setIsAddClassOpen(true)}
                    className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm lớp</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classes.map(cls => (
                  <div
                    key={cls.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-purple-400 font-semibold">{cls.schoolYear}</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 font-mono text-xs font-bold border border-cyan-800/50">
                          <KeyRound className="h-3 w-3" />
                          <span>{cls.code}</span>
                        </div>
                      </div>
                      <h4 className="text-base font-bold text-white">{cls.name}</h4>
                      <p className="text-xs text-slate-400">{cls.subject}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                      <span>{cls.studentCount} Học sinh</span>
                      <button
                        onClick={() => {
                          setSelectedClassForRoster(cls.id);
                          setActiveTab('students');
                        }}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Quản lý HS ──→
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions Pending Review */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Quy trình Duyệt Câu hỏi (Teacher Review)</h3>
                  <p className="text-xs text-slate-400">Draft ──→ Teacher Review ──→ Edit ──→ Publish</p>
                </div>
                <button
                  onClick={() => setActiveTab('questions')}
                  className="text-xs text-purple-400 hover:underline"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="space-y-3">
                {questions.filter(q => q.status === 'draft').map(q => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-950 border border-amber-800/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-mono text-[10px] font-bold">
                          DRAFT (BẢN NHÁP)
                        </span>
                        {q.isAiGenerated && (
                          <span className="flex items-center gap-1 text-[11px] text-cyan-400">
                            <Bot className="h-3 w-3" /> Gemini AI
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">Độ khó: {q.difficulty}</span>
                    </div>

                    <p className="text-xs font-semibold text-white">{q.question}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Xem chi tiết &amp; đáp án</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApproveAndPublish(q.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Duyệt &amp; Xuất bản</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Fast Batch Import & AI Generator */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-emerald-900/50 bg-gradient-to-br from-slate-900 to-emerald-950/30 p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                <UserPlus className="h-5 w-5" />
                <span>Nhập Danh Sách Học Sinh Nhanh</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tải lên file danh sách hoặc dán danh sách tên học sinh. Hệ thống sẽ tự động tạo tên đăng nhập, cấp mật khẩu khởi tạo và xuất file Excel cho bạn.
              </p>
              <button
                onClick={() => handleOpenImportModal()}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/40 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Mở công cụ nạp học sinh</span>
              </button>
            </div>

            <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-slate-900 to-cyan-950/20 p-5">
              <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm mb-2">
                <Sparkles className="h-5 w-5" />
                <span>AI Question Generator</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Sinh tự động bộ câu hỏi theo chuẩn kiến thức Sinh học 9. Câu hỏi được khởi tạo ở trạng thái Bản nháp (Draft) để giáo viên thẩm định trước khi đưa vào ngân hàng đề thi.
              </p>
              <button
                onClick={() => setActiveTab('ai_generator')}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-900/40 transition-colors"
              >
                Mở công cụ sinh câu hỏi
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm mb-2">
                <Swords className="h-5 w-5" />
                <span>Live Battle Arena (Trực tiếp)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Khởi tạo phòng đấu kiến thức thời gian thực cho lớp học: chia đội thi đấu tính điểm XP theo từng câu hỏi.
              </p>
              <button
                onClick={() => navigate('live_battle')}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-900/40 transition-colors"
              >
                Tạo trận Live Battle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Students & Account Management (Core Feature requested by User) */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Top Control Bar for Selected Class */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold mb-1">
                  <Users className="h-4 w-4" />
                  <span>QUẢN LÝ HỌC SINH &amp; CẤP PHÁT TÀI KHOẢN TỰ ĐỘNG</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Danh sách Học sinh {currentClassObj?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mã tham gia lớp:{' '}
                  <span className="font-mono text-cyan-400 font-bold">{currentClassObj?.code}</span> · Sĩ số:{' '}
                  <span className="font-bold text-white">{currentRoster.length} học sinh</span>
                </p>
              </div>

              {/* Class Switcher & Big Action */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedClassForRoster}
                  onChange={e => setSelectedClassForRoster(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) - {c.studentCount} HS
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleOpenImportModal(selectedClassForRoster)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>+ Tải Lên Danh Sách Mới</span>
                </button>
              </div>
            </div>

            {/* Quick Export Tools */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={e => setStudentSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên học sinh hoặc username..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportRosterCsv(selectedClassForRoster)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  title="Tải tệp Excel / CSV để lưu trữ"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Xuất Excel (.csv)</span>
                </button>

                <button
                  onClick={() => handlePrintCards(selectedClassForRoster)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  title="In phiếu tài khoản cắt phát cho học sinh"
                >
                  <Printer className="h-3.5 w-3.5 text-sky-400" />
                  <span>In Thẻ Học Sinh</span>
                </button>

                <button
                  onClick={() => handleCopyZaloRoster(selectedClassForRoster)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  title="Sao chép văn bản gửi Zalo nhóm lớp"
                >
                  <Copy className="h-3.5 w-3.5 text-purple-400" />
                  <span>Sao Chép Zalo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4">Họ và Tên Học Sinh</th>
                    <th className="py-3 px-4">Tên Đăng Nhập (Username)</th>
                    <th className="py-3 px-4">Mật Khẩu Cấp Phát</th>
                    <th className="py-3 px-4 text-center">XP Tích Lũy</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRoster.length > 0 ? (
                    filteredRoster.map((st, idx) => (
                      <tr key={st.uid} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                              {st.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{st.fullName}</p>
                              {st.email && (
                                <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{st.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                              @{st.username}
                            </span>
                            <button
                              onClick={() => handleCopyText(st.username, 'Tên đăng nhập')}
                              className="p-1 rounded text-slate-400 hover:text-white"
                              title="Sao chép tên đăng nhập"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                              {showPasswordMap[st.uid] ? st.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(st.uid)}
                              className="p-1 rounded text-slate-400 hover:text-white"
                              title={showPasswordMap[st.uid] ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                            >
                              {showPasswordMap[st.uid] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                            <button
                              onClick={() => handleCopyText(st.password, 'Mật khẩu')}
                              className="p-1 rounded text-slate-400 hover:text-white"
                              title="Sao chép mật khẩu"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-amber-400">
                            {st.xp || 0} XP
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenResetPassword(st)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                              title="Đổi mật khẩu cho học sinh"
                            >
                              <Lock className="h-3 w-3 text-purple-400" />
                              <span>Đổi MK</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStudentAction(st)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors"
                              title="Xóa học sinh khỏi lớp"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                        <p className="font-bold text-white text-sm">Chưa có học sinh nào trong lớp này</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Bấm nút <strong>&quot;Tải Lên Danh Sách Mới&quot;</strong> để nhập danh sách và hệ thống sẽ tự động tạo tài khoản &amp; mật khẩu cho toàn bộ lớp!
                        </p>
                        <button
                          onClick={() => handleOpenImportModal(selectedClassForRoster)}
                          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Tải danh sách học sinh ngay</span>
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Class Management */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Quản lý Lớp học (Class Management)</h3>
              <p className="text-xs text-slate-400">Danh sách các lớp, mã tham gia và sĩ số học sinh</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenImportModal()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                <span>Nhập Học Sinh Hàng Loạt</span>
              </button>
              <button
                onClick={() => setIsAddClassOpen(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo Lớp Mới</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map(cls => (
              <div
                key={cls.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-purple-400 font-semibold">{cls.schoolYear}</span>
                    <h4 className="text-xl font-bold text-white">{cls.name}</h4>
                    <p className="text-xs text-slate-400">{cls.subject}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">MÃ LỚP</span>
                    <span className="font-mono text-base font-black text-cyan-400">{cls.code}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{cls.description}</p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Sĩ số học sinh:</span>
                  <span className="font-mono font-bold text-white">{cls.studentCount} học sinh</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setSelectedClassForRoster(cls.id);
                      setActiveTab('students');
                    }}
                    className="py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-center truncate"
                  >
                    Xem DS Học sinh
                  </button>
                  <button
                    onClick={() => handleOpenImportModal(cls.id)}
                    className="py-2 px-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-semibold text-center truncate"
                  >
                    + Nạp DS &amp; Tạo TK
                  </button>
                  <button
                    onClick={() => handleCopyText(cls.code, 'Mã lớp')}
                    className="py-2 px-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-semibold text-center truncate"
                  >
                    Sao chép mã
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: AI Generator */}
      {activeTab === 'ai_generator' && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
              <Sparkles className="h-4 w-4" />
              <span>GEMINI AI QUESTION ENGINE</span>
            </div>
            <h3 className="text-xl font-bold text-white">Khởi tạo Câu hỏi Tự động bằng AI</h3>
            <p className="text-xs text-slate-300 mt-1">
              Lưu ý bắt buộc: Mọi câu hỏi do AI tạo đều được gán nhãn <strong>BẢN NHÁP (DRAFT)</strong>. Giáo viên cần duyệt lại nội dung trước khi xuất bản ra học sinh.
            </p>
          </div>

          {aiSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{aiSuccessMsg}</p>
                <button
                  onClick={() => setActiveTab('questions')}
                  className="mt-1 text-cyan-300 underline font-semibold"
                >
                  Chuyển sang Ngân hàng câu hỏi để duyệt ngay ──→
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Chủ đề Di truyền (Topic)
              </label>
              <select
                value={aiTopicId}
                onChange={e => setAiTopicId(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {GENETICS_TOPICS.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    Chủ đề {topic.order}: {topic.titleVi} ({topic.titleEn})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Số lượng câu hỏi
                </label>
                <select
                  value={aiCount}
                  onChange={e => setAiCount(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value={5}>5 câu</option>
                  <option value={10}>10 câu</option>
                  <option value={15}>15 câu</option>
                  <option value={20}>20 câu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mức độ nhận thức
                </label>
                <select
                  value={aiDifficulty}
                  onChange={e => setAiDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="easy">Nhận biết (Easy)</option>
                  <option value="medium">Thông hiểu (Medium)</option>
                  <option value="hard">Vận dụng cao (Hard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dạng câu hỏi
                </label>
                <select
                  value={aiType}
                  onChange={e => setAiType(e.target.value as QuestionType)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="mcq">Trắc nghiệm 4 lựa chọn</option>
                  <option value="true_false">Đúng / Sai</option>
                  <option value="fill_blank">Điền thuật ngữ</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="includeEnglish"
                checked={aiIncludeEnglish}
                onChange={e => setAiIncludeEnglish(e.target.checked)}
                className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-cyan-600 focus:ring-0"
              />
              <label htmlFor="includeEnglish" className="text-xs text-slate-300 cursor-pointer">
                Tích hợp thuật ngữ English Biology chuyên ngành vào câu hỏi
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all"
              >
                {isGenerating ? (
                  <span>Đang kết nối Gemini và sinh câu hỏi...</span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Tạo {aiCount} Câu hỏi Nháp (DRAFT)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Question Bank */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Header & Main Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black text-white">Ngân hàng Câu hỏi Di truyền học 9</h3>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Đồng bộ Cloud Firestore
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Nguồn câu hỏi gốc cho toàn bộ bài học, luyện tập và thi đua của học sinh. Lưu trữ trên Cloud để học sinh làm online ở bất kỳ máy tính/điện thoại nào.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleOpenAddQuestion}
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer ring-1 ring-white/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Thêm câu hỏi mới</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai_generator')}
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 flex items-center gap-1.5 shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Tạo thêm bằng AI</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
              {/* Search input */}
              <div className="lg:col-span-4 relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={qSearchQuery}
                  onChange={e => setQSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm nội dung, từ khóa, lời giải..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
                {qSearchQuery && (
                  <button
                    onClick={() => setQSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Topic selector */}
              <div className="lg:col-span-3">
                <select
                  value={qTopicFilter}
                  onChange={e => setQTopicFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-purple-500 focus:outline-none font-medium"
                >
                  <option value="all">📚 Tất cả chuyên đề ({questions.length})</option>
                  {GENETICS_TOPICS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.titleVi} ({questions.filter(q => q.topicId === t.id).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type selector */}
              <div className="lg:col-span-2">
                <select
                  value={qTypeFilter}
                  onChange={e => setQTypeFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-purple-500 focus:outline-none font-medium"
                >
                  <option value="all">Dạng: Tất cả</option>
                  <option value="mcq">Trắc nghiệm 4 đáp án</option>
                  <option value="true_false">Đúng / Sai</option>
                </select>
              </div>

              {/* Difficulty selector */}
              <div className="lg:col-span-2">
                <select
                  value={qDifficultyFilter}
                  onChange={e => setQDifficultyFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-purple-500 focus:outline-none font-medium"
                >
                  <option value="all">Độ khó: Tất cả</option>
                  <option value="easy">Dễ (Nhận biết)</option>
                  <option value="medium">Trung bình (Thông hiểu)</option>
                  <option value="hard">Khó (Vận dụng)</option>
                </select>
              </div>

              {/* Status selector */}
              <div className="lg:col-span-1">
                <select
                  value={qStatusFilter}
                  onChange={e => setQStatusFilter(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-purple-500 focus:outline-none font-medium"
                >
                  <option value="all">Tất cả</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <span>Hiển thị: <strong className="text-white">{filteredQuestions.length}</strong> / {questions.length} câu</span>
                <span>·</span>
                <span className="text-emerald-400">Đã xuất bản: {questions.filter(q => q.status === 'published').length}</span>
                <span>·</span>
                <span className="text-amber-400">Bản nháp: {questions.filter(q => q.status === 'draft').length}</span>
              </div>
              {(qTopicFilter !== 'all' || qTypeFilter !== 'all' || qStatusFilter !== 'all' || qDifficultyFilter !== 'all' || qSearchQuery) && (
                <button
                  onClick={() => {
                    setQTopicFilter('all');
                    setQTypeFilter('all');
                    setQStatusFilter('all');
                    setQDifficultyFilter('all');
                    setQSearchQuery('');
                  }}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="h-3 w-3" />
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Question List */}
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <AlertCircle className="h-10 w-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Không tìm thấy câu hỏi nào phù hợp với bộ lọc</p>
              <button
                onClick={handleOpenAddQuestion}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                + Thêm câu hỏi mới vào chuyên đề này
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredQuestions.map((q, idx) => {
                const topicObj = GENETICS_TOPICS.find(t => t.id === q.topicId);
                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl bg-slate-900 border transition-all shadow-md ${
                      q.status === 'draft'
                        ? 'border-amber-600/50 bg-amber-950/15'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Card Top Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-slate-400 font-bold px-2 py-0.5 bg-slate-950 rounded-md border border-slate-800">
                          #{idx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-800/80">
                          {topicObj ? topicObj.titleVi : q.topicId.toUpperCase()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            q.status === 'draft'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          }`}
                        >
                          {q.status === 'draft' ? 'BẢN NHÁP (DRAFT)' : 'ĐÃ XUẤT BẢN'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60">
                          {q.type === 'mcq' ? 'Trắc nghiệm 4 lựa chọn' : 'Đúng / Sai'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/60' :
                          q.difficulty === 'hard' ? 'text-rose-400 bg-rose-950/50 border border-rose-800/60' :
                          'text-amber-400 bg-amber-950/50 border border-amber-800/60'
                        }`}>
                          Độ khó: {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
                        </span>
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <p className="text-sm font-bold text-white mb-3 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3.5">
                      {q.options.map(opt => {
                        const isCorrect =
                          opt.id === q.correctAnswer ||
                          opt.isCorrect ||
                          (q.type === 'true_false' && ((q.correctAnswer === 'opt_true' && opt.id === 'opt_true') || (q.correctAnswer === 'opt_false' && opt.id === 'opt_false')));
                        return (
                          <div
                            key={opt.id}
                            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border transition-all ${
                              isCorrect
                                ? 'bg-emerald-950/70 text-emerald-200 border-emerald-600 font-bold shadow-xs'
                                : 'bg-slate-950/90 text-slate-300 border-slate-800/90'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-400">{opt.id.replace('opt_', '').toUpperCase()}:</span>
                              <span>{opt.text}</span>
                            </div>
                            {isCorrect && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 whitespace-nowrap">
                                ✓ ĐÁP ÁN ĐÚNG
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Card Footer: Explanation & Actions */}
                    <div className="pt-3 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
                        <strong className="text-slate-300">Lời giải chi tiết:</strong> {q.explanation}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {q.status === 'draft' && (
                          <button
                            onClick={() => handleApproveAndPublish(q.id)}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1 shadow-sm transition-all"
                            title="Xuất bản để học sinh làm online"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Duyệt &amp; Xuất bản</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                          title="Chỉnh sửa nội dung hoặc đáp án"
                        >
                          <Pencil className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Sửa câu</span>
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-900/60 border border-slate-800 hover:border-rose-700 transition-all"
                          title="Xóa câu hỏi khỏi Ngân hàng"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Analytics & Data Export */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FileSpreadsheet className="h-5 w-5" />
                <span>Báo Cáo &amp; Xuất Dữ Liệu Excel (Section 26)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Dữ liệu được lưu trữ trực tiếp và có thể trích xuất ra file bảng tính Excel UTF-8 đầy đủ dấu tiếng Việt để phục vụ báo cáo nhà trường và gửi phụ huynh học sinh.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => handleExportRosterCsv(selectedClassForRoster)}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-600 text-left text-xs transition-colors space-y-1"
              >
                <span className="font-bold text-white block">1. Danh Sách Tài Khoản Học Sinh</span>
                <span className="text-[11px] text-slate-400 block">
                  Xuất tên đăng nhập, mật khẩu, mã lớp của {currentClassObj?.name}
                </span>
              </button>

              <button
                onClick={() => alert(`Đang chuẩn bị dữ liệu tiến độ 15 chuyên đề Di truyền học của lớp ${currentClassObj?.name}...`)}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-600 text-left text-xs transition-colors space-y-1"
              >
                <span className="font-bold text-white block">2. Báo Cáo Tiến Độ Chủ Đề</span>
                <span className="text-[11px] text-slate-400 block">
                  Tỷ lệ hoàn thành Module A &amp; B của học sinh
                </span>
              </button>

              <button
                onClick={() => alert(`Đang chuẩn bị báo cáo điểm English Biology & Live Battle của lớp ${currentClassObj?.name}...`)}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-600 text-left text-xs transition-colors space-y-1"
              >
                <span className="font-bold text-white block">3. Kết Quả English Biology</span>
                <span className="text-[11px] text-slate-400 block">
                  Điểm mini-game và từ vựng chuyên ngành
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Tạo Lớp Học Sinh học Mới</h3>
            <p className="text-xs text-slate-400 mb-4">Mã lớp tự động sinh ra cho học sinh tham gia</p>

            <form onSubmit={handleCreateClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên lớp (Class Name)
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="ví dụ: 9A3 hoặc 9A4"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Môn học
                </label>
                <input
                  type="text"
                  value={newClassSubject}
                  onChange={e => setNewClassSubject(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Niên khóa
                </label>
                <input
                  type="text"
                  value={newClassYear}
                  onChange={e => setNewClassYear(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mã lớp tùy chỉnh (Tùy chọn, để trống sẽ tự sinh)
                </label>
                <input
                  type="text"
                  value={newClassCode}
                  onChange={e => setNewClassCode(e.target.value.toUpperCase())}
                  placeholder="ví dụ: BIO9A3"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-cyan-300 focus:border-purple-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl"
                >
                  Xác nhận Tạo Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Student Import Modal */}
      <StudentBatchImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        defaultClassId={importClassId || selectedClassForRoster}
        onSuccess={() => {
          setActiveTab('students');
        }}
      />

      {/* Reset Student Password Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Đổi Mật Khẩu Cho Học Sinh</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Học sinh: <span className="text-white font-bold">{editingStudent.fullName}</span> (@{editingStudent.username})
              </p>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">Mật khẩu mới</label>
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput(generateStudentPassword('secure_random'))}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Sinh ngẫu nhiên</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-purple-300 font-mono font-bold focus:border-purple-500 focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl"
                >
                  Lưu Mật Khẩu Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Question Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Chi tiết Câu hỏi Nháp</h3>
            <p className="text-xs font-semibold text-slate-200">{previewQuestion.question}</p>
            <div className="space-y-1.5">
              {previewQuestion.options.map(o => (
                <div
                  key={o.id}
                  className={`p-2.5 rounded-lg text-xs ${
                    o.id === previewQuestion.correctAnswer
                      ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-400'
                  }`}
                >
                  {o.id.toUpperCase()}: {o.text} {o.id === previewQuestion.correctAnswer && '(Đáp án đúng)'}
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <strong>Giải thích:</strong> {previewQuestion.explanation}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleApproveAndPublish(previewQuestion.id);
                  setPreviewQuestion(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
              >
                Duyệt &amp; Xuất bản ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  <span>{editingQuestionId ? 'Chỉnh sửa Câu hỏi Ngân hàng' : 'Thêm Câu hỏi Mới vào Ngân hàng'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tự động đồng bộ lên Cloud Firestore để học sinh làm bài tập online trên mọi thiết bị.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestionForm} className="space-y-4 text-xs">
              {/* Row 1: Topic & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Chuyên đề Di truyền học *
                  </label>
                  <select
                    value={formTopicId}
                    onChange={e => setFormTopicId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:border-purple-500 focus:outline-none"
                  >
                    {GENETICS_TOPICS.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.titleVi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Dạng câu hỏi *
                  </label>
                  <select
                    value={formQuestionType}
                    onChange={e => setFormQuestionType(e.target.value as QuestionType)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:border-purple-500 focus:outline-none"
                  >
                    <option value="mcq">Trắc nghiệm 4 lựa chọn (A, B, C, D)</option>
                    <option value="true_false">Nhận định Đúng / Sai</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Difficulty & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Độ khó
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={e => setFormDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:border-purple-500 focus:outline-none"
                  >
                    <option value="easy">Dễ (Nhận biết)</option>
                    <option value="medium">Trung bình (Thông hiểu)</option>
                    <option value="hard">Khó (Vận dụng / Vận dụng cao)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Trạng thái xuất bản
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as QuestionStatus)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:border-purple-500 focus:outline-none"
                  >
                    <option value="published">Xuất bản ngay (Học sinh làm được ngay)</option>
                    <option value="draft">Lưu bản nháp (Giáo viên duyệt sau)</option>
                  </select>
                </div>
              </div>

              {/* Question Prompt */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Nội dung câu hỏi *
                </label>
                <textarea
                  value={formPrompt}
                  onChange={e => setFormPrompt(e.target.value)}
                  placeholder="Nhập câu hỏi sinh học..."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Options */}
              {formQuestionType === 'mcq' ? (
                <div className="space-y-2">
                  <label className="block text-slate-300 font-bold">
                    4 Phương án trả lời (Tích chọn tròn để đặt làm đáp án đúng) *
                  </label>
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <div
                      key={letter}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                        formCorrectIndex === idx
                          ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/40'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctAnswerOption"
                        id={`opt_radio_${idx}`}
                        checked={formCorrectIndex === idx}
                        onChange={() => setFormCorrectIndex(idx)}
                        className="h-4 w-4 text-emerald-600 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor={`opt_radio_${idx}`} className="font-mono font-bold text-slate-300 cursor-pointer w-6">
                        {letter}.
                      </label>
                      <input
                        type="text"
                        value={formOptions[idx]}
                        onChange={e => {
                          const next = [...formOptions];
                          next[idx] = e.target.value;
                          setFormOptions(next);
                        }}
                        placeholder={`Nhập phương án ${letter}...`}
                        required
                        className="flex-1 py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:border-emerald-500 focus:outline-none"
                      />
                      {formCorrectIndex === idx && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                          ✓ ĐÚNG
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-slate-300 font-bold">
                    Đáp án đúng cho nhận định trên *
                  </label>
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-400">
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={formTrueFalseAnswer === true}
                        onChange={() => setFormTrueFalseAnswer(true)}
                        className="h-4 w-4 text-emerald-600 focus:ring-0"
                      />
                      <span>ĐÚNG (Chính xác)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-400">
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={formTrueFalseAnswer === false}
                        onChange={() => setFormTrueFalseAnswer(false)}
                        className="h-4 w-4 text-rose-600 focus:ring-0"
                      />
                      <span>SAI (Không chính xác)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Lời giải chi tiết &amp; Hướng dẫn (Hiển thị khi học sinh nộp bài)
                </label>
                <textarea
                  value={formExplanation}
                  onChange={e => setFormExplanation(e.target.value)}
                  placeholder="Giải thích cơ chế di truyền hoặc lý do vì sao đáp án đúng..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white text-xs transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="px-5 py-2.5 rounded-xl font-black text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/30 flex items-center gap-2 text-xs transition-all disabled:opacity-50"
                >
                  {isSavingQuestion ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu lên Cloud Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{editingQuestionId ? 'Cập nhật câu hỏi lên Cloud' : 'Lưu câu hỏi mới vào Ngân hàng'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

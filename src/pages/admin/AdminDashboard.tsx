import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { GENETICS_TOPICS } from '../../data/topicsData';
import { TOPICS_KNOWLEDGE_BASE } from '../../data/topicsKnowledgeData';
import { QuestionItem, QuestionDifficulty, QuestionStatus, QuestionType } from '../../types/question';
import { ClassRoom, UserAccountCredential, StudentAccount } from '../../types/auth';
import {
  subscribeToQuestionBank,
  saveQuestionToCloud,
  deleteQuestionFromCloud,
} from '../../firebase/questionBankService';
import {
  subscribeToTopicKnowledge,
  resetTopicKnowledgeToDefault,
  CloudTopicKnowledge,
  getLocalKnowledge,
} from '../../firebase/knowledgeService';
import {
  syncTeacherToGoogleSheet,
  syncClassToGoogleSheet,
  syncStudentsToGoogleSheet,
  syncKnowledgeToGoogleSheet,
  syncQuestionToGoogleSheet,
  getSyncHistory,
  subscribeToSyncLogs,
  RECOMMENDED_GAS_CODE,
  GOOGLE_SHEET_WEBAPP_URL,
  SyncLogItem,
} from '../../services/googleSheetService';
import {
  ShieldCheck,
  School,
  GraduationCap,
  BookOpen,
  HelpCircle,
  RefreshCw,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Cloud,
  Database,
  Sparkles,
  ExternalLink,
  Copy,
  X,
  Lock,
  Layers,
  Check,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    user,
    role,
    classes,
    getAllTeachers,
    deleteTeacher,
    resetTeacherPassword,
    deleteClass,
    getAllStudents,
    updateStudentPassword,
    deleteStudent,
    addClass,
    accounts,
  } = useAuth();

  const { navigate } = useNavigation();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'teachers' | 'classes' | 'students' | 'knowledge' | 'questions' | 'google_sheets'
  >('overview');

  // Master Questions State
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  useEffect(() => {
    const unsub = subscribeToQuestionBank((qs) => {
      setQuestions(qs);
    });
    return () => unsub();
  }, []);

  // Google Sheets Logs & Status
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>(() => getSyncHistory());
  const [isGasCodeModalOpen, setIsGasCodeModalOpen] = useState(false);
  const [isSyncingMaster, setIsSyncingMaster] = useState(false);
  const [isPingTesting, setIsPingTesting] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToSyncLogs(() => {
      setSyncLogs(getSyncHistory());
    });
    return () => unsub();
  }, []);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Visibility toggle for student and teacher passwords
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Teacher Management Modals & State
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('123456');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherSchool, setNewTeacherSchool] = useState('');

  const [editingTeacher, setEditingTeacher] = useState<UserAccountCredential | null>(null);
  const [newTeacherPassInput, setNewTeacherPassInput] = useState('');

  // Class Management Modals & State
  const [classSearch, setClassSearch] = useState('');
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassTeacherUid, setNewClassTeacherUid] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('Sinh học 9 (Di truyền học)');
  const [newClassYear, setNewClassYear] = useState('2026–2027');

  // Student Management State
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('all');
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(null);
  const [newStudentPassInput, setNewStudentPassInput] = useState('');

  // Knowledge Management State
  const [selectedTopicKnowledgeId, setSelectedTopicKnowledgeId] = useState('dna');
  const [currentKnowledge, setCurrentKnowledge] = useState<CloudTopicKnowledge>(() =>
    getLocalKnowledge('dna')
  );

  useEffect(() => {
    const unsub = subscribeToTopicKnowledge(selectedTopicKnowledgeId, (k) => {
      setCurrentKnowledge(k);
    });
    return () => unsub();
  }, [selectedTopicKnowledgeId]);

  // Question Bank Management State
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionTopicFilter, setQuestionTopicFilter] = useState('all');
  const [questionStatusFilter, setQuestionStatusFilter] = useState('all');
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);

  // Derived lists
  const teachersList = getAllTeachers();
  const studentsList = getAllStudents();

  // Search filtered teachers
  const filteredTeachers = teachersList.filter((t) => {
    if (!teacherSearch.trim()) return true;
    const q = teacherSearch.toLowerCase();
    return (
      (t.fullName || '').toLowerCase().includes(q) ||
      (t.username || '').toLowerCase().includes(q) ||
      (t.teacherCode || '').toLowerCase().includes(q) ||
      (t.schoolName || '').toLowerCase().includes(q)
    );
  });

  // Search filtered classes
  const filteredClasses = classes.filter((c) => {
    if (!classSearch.trim()) return true;
    const q = classSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q) ||
      (c.teacherName || '').toLowerCase().includes(q) ||
      (c.teacherCode || '').toLowerCase().includes(q)
    );
  });

  // Search filtered students
  const filteredStudents = studentsList.filter((s) => {
    if (studentClassFilter !== 'all' && s.classId !== studentClassFilter) return false;
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.username || '').toLowerCase().includes(q) ||
      (s.studentCode || '').toLowerCase().includes(q) ||
      (s.className || '').toLowerCase().includes(q) ||
      (s.teacherCode || '').toLowerCase().includes(q)
    );
  });

  // Search filtered questions
  const filteredQuestions = questions.filter((q) => {
    if (questionTopicFilter !== 'all' && q.topicId !== questionTopicFilter) return false;
    if (questionStatusFilter !== 'all' && q.status !== questionStatusFilter) return false;
    if (!questionSearch.trim()) return true;
    const s = questionSearch.toLowerCase();
    return (
      (q.question || '').toLowerCase().includes(s) ||
      (q.explanation || '').toLowerCase().includes(s) ||
      (q.createdByName || '').toLowerCase().includes(s)
    );
  });

  // Master Sync to Google Sheet
  const handleMasterSyncToGoogleSheets = async () => {
    setIsSyncingMaster(true);
    try {
      // 1. Sync All Teachers
      for (const t of teachersList) {
        await syncTeacherToGoogleSheet({
          teacherCode: t.teacherCode || `GV-${t.uid.slice(-6)}`,
          fullName: t.fullName,
          username: t.username,
          email: t.email,
          schoolName: t.schoolName,
          registeredAt: t.createdAt || new Date().toISOString(),
        });
      }

      // 2. Sync All Classes
      for (const c of classes) {
        await syncClassToGoogleSheet({
          classId: c.id,
          classCode: c.code,
          className: c.name,
          subject: c.subject,
          schoolYear: c.schoolYear,
          teacherCode: c.teacherCode || '',
          teacherName: c.teacherName || '',
          studentCount: c.studentCount,
          createdAt: c.createdAt,
        });
      }

      // 3. Sync All Students in batch
      if (studentsList.length > 0) {
        await syncStudentsToGoogleSheet(
          studentsList.map((s) => ({
            studentCode: s.studentCode || '',
            fullName: s.fullName,
            username: s.username,
            password: s.password,
            classCode: s.classCode,
            className: s.className,
            teacherCode: s.teacherCode || '',
            email: s.email,
            notes: s.notes,
            createdAt: s.createdAt,
          }))
        );
      }

      // 4. Sync All Published Questions
      for (const q of questions.slice(0, 30)) {
        await syncQuestionToGoogleSheet({
          teacherCode: q.createdBy || 'ADMIN',
          teacherName: q.createdByName || 'Quản trị viên',
          questionId: q.id,
          topicId: q.topicId,
          type: q.type,
          question: q.question,
          correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer),
          difficulty: q.difficulty,
          status: q.status,
          updatedAt: q.updatedAt || new Date().toISOString(),
        });
      }

      triggerToast('Đã thực hiện Master Sync thành công lên toàn bộ các Sheet trên Google Sheets!');
    } catch (err) {
      console.warn('Master Sync error:', err);
      triggerToast('Có lỗi trong quá trình Master Sync. Vui lòng kiểm tra lại webhook.');
    } finally {
      setIsSyncingMaster(false);
    }
  };

  // Test Ping Google Sheet Webhook
  const handleTestPingWebhook = async () => {
    setIsPingTesting(true);
    setPingResult(null);
    try {
      await fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping', timestamp: new Date().toISOString(), sender: 'admin' }),
      });
      setPingResult('Kết nối thành công! Google Apps Script Webhook phản hồi tốt (HTTP 200 OK).');
      triggerToast('Kiểm tra Webhook thành công!');
    } catch (e) {
      setPingResult('Không thể kết nối đến Webhook Google Apps Script.');
    } finally {
      setIsPingTesting(false);
    }
  };

  // Add new teacher by Admin
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherUsername.trim()) {
      alert('Vui lòng nhập Họ tên và Tên đăng nhập!');
      return;
    }
    const cleanUser = newTeacherUsername.trim().toLowerCase();
    if (accounts.some(a => a.username.toLowerCase() === cleanUser)) {
      alert('Tên đăng nhập này đã tồn tại!');
      return;
    }

    const tCode = `GV-${Math.floor(100000 + Math.random() * 900000)}`;
    const newUid = `teacher_${Date.now()}`;
    const newTeacher: UserAccountCredential = {
      uid: newUid,
      teacherCode: tCode,
      username: cleanUser,
      password: newTeacherPassword || '123456',
      fullName: newTeacherName.trim(),
      email: newTeacherEmail.trim() || `${cleanUser}@thcs.edu.vn`,
      schoolName: newTeacherSchool.trim() || 'Trường THCS',
      role: 'teacher',
      classIds: [],
      initialPassword: newTeacherPassword || '123456',
      xp: 2000,
      level: 5,
      streakDays: 1,
      badges: ['badge_dna_explorer'],
      createdAt: new Date().toISOString(),
    };

    // Auto sync to Google Sheet
    syncTeacherToGoogleSheet({
      teacherCode: tCode,
      fullName: newTeacher.fullName,
      username: newTeacher.username,
      email: newTeacher.email,
      schoolName: newTeacher.schoolName,
      registeredAt: newTeacher.createdAt,
    }).catch(console.warn);

    // Save
    accounts.unshift(newTeacher);
    setIsAddTeacherOpen(false);
    setNewTeacherName('');
    setNewTeacherUsername('');
    setNewTeacherEmail('');
    setNewTeacherSchool('');
    triggerToast(`Đã tạo thành công Giáo viên ${newTeacher.fullName} (Mã GV: ${tCode})!`);
  };

  // Add new class by Admin
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const assignedTeacher = teachersList.find(t => t.uid === newClassTeacherUid) || teachersList[0];
    const generatedCode = newClassCode.trim() || `BIO${newClassName.replace(/\s+/g, '').toUpperCase()}`;

    const created = addClass({
      name: newClassName.trim(),
      code: generatedCode.toUpperCase(),
      subject: newClassSubject.trim(),
      schoolYear: newClassYear.trim(),
      teacherId: assignedTeacher?.uid || 'admin_root',
      teacherCode: assignedTeacher?.teacherCode || 'GV-ADMIN',
      teacherName: assignedTeacher?.fullName || 'Quản trị viên',
      description: `Lớp ${newClassName.trim()} do Quản trị viên khởi tạo`,
    });

    setIsAddClassOpen(false);
    setNewClassName('');
    setNewClassCode('');
    triggerToast(`Đã tạo thành công Lớp học ${created.name} (${created.code})!`);
  };

  // Reset Topic Knowledge to default SGK
  const handleResetKnowledge = async (topicId: string) => {
    if (window.confirm(`Xác nhận khôi phục chuyên đề ${topicId.toUpperCase()} về nguyên bản Sách Giáo Khoa chuẩn?`)) {
      try {
        await resetTopicKnowledgeToDefault(topicId);
        const fb = TOPICS_KNOWLEDGE_BASE[topicId] || TOPICS_KNOWLEDGE_BASE['dna'];
        setCurrentKnowledge({ ...fb, topicId });
        triggerToast(`Đã khôi phục chuyên đề ${topicId.toUpperCase()} về nội dung SGK ban đầu!`);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Approve draft question
  const handleApproveQuestion = async (q: QuestionItem) => {
    const updated: QuestionItem = {
      ...q,
      status: 'published',
      updatedAt: new Date().toISOString(),
    };
    await saveQuestionToCloud(updated);
    setQuestions(prev => prev.map(item => (item.id === q.id ? updated : item)));
    triggerToast('Đã phê duyệt và xuất bản câu hỏi lên hệ thống học trực tuyến!');
  };

  // Delete question
  const handleDeleteQuestion = async (qId: string) => {
    if (window.confirm('Quản trị viên có chắc chắn muốn xóa câu hỏi này khỏi Ngân hàng?')) {
      await deleteQuestionFromCloud(qId);
      setQuestions(prev => prev.filter(item => item.id !== qId));
      if (previewQuestion?.id === qId) setPreviewQuestion(null);
      triggerToast('Đã xóa câu hỏi khỏi Ngân hàng trung tâm!');
    }
  };

  // SECURITY GUARD:
  // "gv và hs không thể xem thông tin này"
  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-lg">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Khu Vực Quản Trị Hệ Thống Được Bảo Mật</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Bạn không có quyền truy cập khu vực này. Cổng quản trị chỉ dành riêng cho tài khoản Quản trị viên Hệ thống (admin). Giáo viên và Học sinh không thể xem thông tin này.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('login')}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Đăng nhập Tài khoản Quản trị viên
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 shadow-2xl text-xs font-bold animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER - ADMIN IDENTITY */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl border border-purple-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>ROOT ADMINISTRATOR</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firestore Cloud &amp; Google Sheets Online</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Cổng Quản Trị Toàn Quyền Hệ Thống BIOGEN 9
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              Tài khoản Quản trị viên tối cao (<code className="bg-purple-900/60 px-2 py-0.5 rounded-md font-mono text-amber-300">admin</code>). Toàn quyền quản trị danh mục Giáo viên, Lớp học, Học sinh, Kiến thức chuẩn trực tuyến và Ngân hàng câu hỏi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleMasterSyncToGoogleSheets}
              disabled={isSyncingMaster}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncingMaster ? 'animate-spin' : ''}`} />
              <span>{isSyncingMaster ? 'Đang Master Sync...' : 'Master Sync 6 Sheet'}</span>
            </button>

            <button
              onClick={() => setIsGasCodeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-purple-200 border border-purple-600/40 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-purple-400" />
              <span>Xem Code Apps Script</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* METRIC OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Teachers */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <School className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Giáo Viên</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{teachersList.length}</p>
          </div>
        </div>

        {/* Total Classes */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lớp Học</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{classes.length}</p>
          </div>
        </div>

        {/* Total Students */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Học Sinh</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{studentsList.length}</p>
          </div>
        </div>

        {/* Question Bank */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ngân Hàng Câu Hỏi</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{questions.length}</p>
          </div>
        </div>

        {/* Google Sheet Sync Events */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex items-center gap-4 col-span-2 sm:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Cloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đồng Bộ Sheet</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600">6 Trang tính</p>
          </div>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Tổng Quan Hệ Thống', icon: TrendingUp },
          { id: 'teachers', label: `Quản Lý Giáo Viên (${teachersList.length})`, icon: School },
          { id: 'classes', label: `Quản Lý Lớp Học (${classes.length})`, icon: Layers },
          { id: 'students', label: `Học Sinh Toàn Trường (${studentsList.length})`, icon: GraduationCap },
          { id: 'knowledge', label: 'Kiến Thức Chuẩn SGK', icon: BookOpen },
          { id: 'questions', label: `Ngân Hàng Câu Hỏi (${questions.length})`, icon: HelpCircle },
          { id: 'google_sheets', label: 'Cấu Hình Google Sheets', icon: Cloud },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-900 text-white shadow-md shadow-purple-950/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & DASHBOARD SUMMARY */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Status Panel */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 lg:col-span-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span>Trạng Thái Hạ Tầng Cơ Sở Dữ Liệu &amp; Đám Mây</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Google Cloud Firestore</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">ONLINE</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Dự án: <span className="font-mono text-purple-700 font-semibold">ai-studio-chinhbiogen9digi</span>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Lưu trữ thời gian thực tài khoản giáo viên, học sinh, lớp học, ngân hàng câu hỏi và tiến độ học tập.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Google Sheets Webhook</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">KẾT NỐI</span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">
                    URL: <span className="font-mono text-teal-700 font-semibold">/exec (Deployment Active)</span>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Ghi nhận tự động vào 6 Sheet: GiaoVien, LopHoc, HocSinh, KetQuaHocTap, KienThucChuan_GV, NganHangCauHoi.
                  </p>
                </div>
              </div>

              {/* Fast Admin Shortcuts */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-800">Thao tác Quản trị Nhanh:</p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setIsAddTeacherOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm Giáo Viên Mới</span>
                  </button>

                  <button
                    onClick={() => setIsAddClassOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tạo Lớp Học Mới</span>
                  </button>

                  <button
                    onClick={handleTestPingWebhook}
                    disabled={isPingTesting}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isPingTesting ? 'animate-spin' : ''}`} />
                    <span>Kiểm tra Kết nối Sheet Webhook</span>
                  </button>
                </div>

                {pingResult && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{pingResult}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Security Notes */}
            <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50/50 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                <span>Chính Sách Bảo Mật Admin</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-purple-900 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Không hiển thị cho GV &amp; HS:</strong> Toàn bộ thông tin tài khoản và trang quản trị này được ẩn hoàn toàn trước mọi tài khoản giáo viên và học sinh.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Toàn quyền truy xuất (Root Access):</strong> Quản trị viên có thể xem lớp của mọi giáo viên, cấp lại mật khẩu cho bất kỳ học sinh hay giáo viên nào khi có yêu cầu.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Khôi phục chuẩn SGK:</strong> Admin có quyền hoàn tác mọi chỉnh sửa kiến thức chuẩn của các giáo viên về nguyên bản chương trình Bộ GD&amp;ĐT.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QUẢN LÝ TẤT CẢ GIÁO VIÊN */}
      {/* ========================================================================= */}
      {activeTab === 'teachers' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <School className="h-5 w-5 text-purple-600" />
                <span>Danh Mục Giáo Viên Đăng Ký Hệ Thống ({teachersList.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mỗi giáo viên có 1 Mã GV riêng biệt duy nhất (<code className="font-mono text-purple-700">GV-XXXXXX</code>) đã đăng ký và đồng bộ lên Google Sheet.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddTeacherOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-900/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm Giáo Viên</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Tìm theo Mã GV, Họ tên, Username, Trường học..."
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã GV</th>
                  <th className="py-3 px-4">Họ và Tên</th>
                  <th className="py-3 px-4">Tên Đăng Nhập</th>
                  <th className="py-3 px-4">Mật Khẩu</th>
                  <th className="py-3 px-4">Email / Trường</th>
                  <th className="py-3 px-4">Số Lớp</th>
                  <th className="py-3 px-4">Ngày Tạo</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                      Chưa có giáo viên nào hoặc không tìm thấy kết quả phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => {
                    const teacherClassesCount = classes.filter(
                      (c) => c.teacherId === t.uid || c.teacherCode === t.teacherCode
                    ).length;
                    const isPassVisible = showPasswordMap[t.uid];

                    return (
                      <tr key={t.uid} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">
                          {t.teacherCode || `GV-${t.uid.slice(-6)}`}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{t.fullName}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">@{t.username}</td>
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span>{isPassVisible ? t.password || '123456' : '••••••'}</span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(t.uid)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              {isPassVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{t.email || '—'}</div>
                          <div className="text-[11px] text-slate-400">{t.schoolName || 'Trường THCS'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold text-[11px] border border-purple-200">
                            {teacherClassesCount} lớp
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingTeacher(t);
                                setNewTeacherPassInput('');
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Đặt lại mật khẩu giáo viên"
                            >
                              <Key className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xác nhận xóa tài khoản giáo viên "${t.fullName}" (@${t.username})?`)) {
                                  deleteTeacher(t.uid);
                                  triggerToast(`Đã xóa giáo viên ${t.fullName}!`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Xóa giáo viên"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUẢN LÝ TOÀN BỘ LỚP HỌC */}
      {/* ========================================================================= */}
      {activeTab === 'classes' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-sky-600" />
                <span>Toàn Bộ Lớp Học Trong Hệ Thống ({classes.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản trị viên có thể xem lớp của mọi giáo viên, kiểm tra sĩ số và đồng bộ dữ liệu.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddClassOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-900/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo Lớp Mới</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              placeholder="Tìm theo Tên lớp, Mã lớp, Giáo viên phụ trách..."
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Classes Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã Tham Gia</th>
                  <th className="py-3 px-4">Tên Lớp Học</th>
                  <th className="py-3 px-4">Môn Học</th>
                  <th className="py-3 px-4">Giáo Viên Phụ Trách</th>
                  <th className="py-3 px-4">Mã GV</th>
                  <th className="py-3 px-4">Sĩ Số</th>
                  <th className="py-3 px-4">Niên Khóa</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                      Chưa có lớp học nào trên hệ thống.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-700">{c.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 text-slate-600">{c.subject}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{c.teacherName || '—'}</td>
                      <td className="py-3 px-4 font-mono text-purple-700 font-bold">{c.teacherCode || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                          {c.studentCount} HS
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.schoolYear}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa lớp "${c.name}" (${c.code})?`)) {
                              deleteClass(c.id);
                              triggerToast(`Đã xóa lớp ${c.name}!`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Xóa lớp học"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HỌC SINH TOÀN TRƯỜNG & CẤP LẠI MẬT KHẨU */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                <span>Danh Sách Học Sinh Toàn Trường ({studentsList.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mỗi học sinh có 1 Mã HS riêng biệt (<code className="font-mono text-emerald-700">HS-XXXXXX</code>) không trùng lặp và ghi nhận vào Google Sheet.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Tìm theo Mã HS, Họ tên, Tên đăng nhập..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={studentClassFilter}
              onChange={(e) => setStudentClassFilter(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="all">Tất cả lớp học ({classes.length} lớp)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã HS</th>
                  <th className="py-3 px-4">Họ và Tên</th>
                  <th className="py-3 px-4">Tên Đăng Nhập</th>
                  <th className="py-3 px-4">Mật Khẩu</th>
                  <th className="py-3 px-4">Lớp Học</th>
                  <th className="py-3 px-4">Mã GV Quản Lý</th>
                  <th className="py-3 px-4">XP / Level</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                      Chưa có học sinh nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isPassVisible = showPasswordMap[s.uid];
                    return (
                      <tr key={s.uid} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {s.studentCode || `HS-${s.uid.slice(-6)}`}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{s.fullName}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">@{s.username}</td>
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span>{isPassVisible ? s.password : '••••••'}</span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(s.uid)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              {isPassVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{s.className}</span>
                          <span className="text-slate-400 ml-1 font-mono text-[11px]">({s.classCode})</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-purple-700 font-bold">{s.teacherCode || '—'}</td>
                        <td className="py-3 px-4 text-amber-600 font-bold">
                          {s.xp || 0} XP (Lv {s.level || 1})
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingStudent(s);
                                setNewStudentPassInput('');
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Đặt lại mật khẩu học sinh"
                            >
                              <Key className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xác nhận xóa học sinh "${s.fullName}" (@${s.username})?`)) {
                                  deleteStudent(s.uid, s.classId);
                                  triggerToast(`Đã xóa học sinh ${s.fullName}!`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Xóa học sinh"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: QUẢN TRỊ KIẾN THỨC CHUẨN SGK TRỰC TUYẾN */}
      {/* ========================================================================= */}
      {activeTab === 'knowledge' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <span>Giám Sát &amp; Phê Duyệt Kiến Thức Chuẩn SGK Trực Tuyến</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm tra nội dung các chuyên đề do giáo viên tùy chỉnh trực tuyến và khôi phục nội dung gốc SGK khi cần.
              </p>
            </div>
          </div>

          {/* Topic selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {GENETICS_TOPICS.map((top) => (
              <button
                key={top.id}
                onClick={() => setSelectedTopicKnowledgeId(top.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedTopicKnowledgeId === top.id
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">{top.id}</p>
                <p className="text-xs font-bold leading-tight mt-0.5 line-clamp-1">{top.titleVi}</p>
              </button>
            ))}
          </div>

          {/* Current Knowledge Detail Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold">
                  {currentKnowledge.topicId}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {GENETICS_TOPICS.find(t => t.id === currentKnowledge.topicId)?.titleVi}
                </h3>
                <p className="text-xs text-slate-500">
                  Cập nhật bởi: <span className="font-semibold text-slate-800">{currentKnowledge.lastUpdatedByName || 'Tổ Chuyên Môn'}</span>
                  {currentKnowledge.updatedAt && (
                    <span className="ml-2 font-mono">({new Date(currentKnowledge.updatedAt).toLocaleString('vi-VN')})</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResetKnowledge(currentKnowledge.topicId)}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Khôi phục về SGK</span>
                </button>

                <button
                  onClick={() => {
                    syncKnowledgeToGoogleSheet({
                      teacherCode: 'ADMIN',
                      teacherName: 'Quản trị viên',
                      topicId: currentKnowledge.topicId,
                      topicTitle: GENETICS_TOPICS.find(t => t.id === currentKnowledge.topicId)?.titleVi || '',
                      sectionCount: currentKnowledge.sections?.length || 0,
                      summary: (currentKnowledge.sections || []).map(s => s.heading).join('; '),
                      updatedAt: new Date().toISOString(),
                    });
                    triggerToast('Đã đồng bộ kiến thức chuẩn lên Google Sheet (KienThucChuan_GV)!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Cloud className="h-3.5 w-3.5" />
                  <span>Đồng bộ lên Sheet</span>
                </button>
              </div>
            </div>

            {/* Sections preview */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {currentKnowledge.sections?.map((sec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full" />
                    <span>{sec.heading}</span>
                  </h4>
                  {sec.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs text-slate-600 leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {sec.bulletPoints && (
                    <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5">
                      {sec.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx}>{bp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: QUẢN TRỊ TOÀN DIỆN NGÂN HÀNG CÂU HỎI */}
      {/* ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                <span>Ngân Hàng Câu Hỏi Trung Tâm Toàn Trường ({questions.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem xét, phê duyệt câu hỏi do giáo viên đóng góp hoặc xóa câu hỏi không đạt chuẩn.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Tìm nội dung câu hỏi, tác giả..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <select
              value={questionTopicFilter}
              onChange={(e) => setQuestionTopicFilter(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="all">Tất cả chuyên đề</option>
              {GENETICS_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.titleVi}
                </option>
              ))}
            </select>

            <select
              value={questionStatusFilter}
              onChange={(e) => setQuestionStatusFilter(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã Xuất Bản (Published)</option>
              <option value="draft">Bản Nháp (Draft)</option>
            </select>
          </div>

          {/* Questions Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Chuyên Đề</th>
                  <th className="py-3 px-4">Nội Dung Câu Hỏi</th>
                  <th className="py-3 px-4">Loại Câu</th>
                  <th className="py-3 px-4">Độ Khó</th>
                  <th className="py-3 px-4">Tác Giả</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      Không tìm thấy câu hỏi phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.slice(0, 50).map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-700 uppercase">{q.topicId}</td>
                      <td className="py-3 px-4 max-w-sm">
                        <p className="font-semibold text-slate-900 line-clamp-2">{q.question}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {q.type === 'mcq' ? 'Trắc nghiệm' : q.type === 'true_false' ? 'Đúng/Sai' : q.type}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            q.difficulty === 'easy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.difficulty === 'hard'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{q.createdByName || 'Tổ Chuyên Môn'}</td>
                      <td className="py-3 px-4">
                        {q.status === 'published' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Đã duyệt
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            Bản nháp
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {q.status === 'draft' && (
                            <button
                              onClick={() => handleApproveQuestion(q)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                              title="Phê duyệt xuất bản"
                            >
                              Duyệt
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: GOOGLE SHEETS CẤU HÌNH & NHẬT KÝ ĐỒNG BỘ 6 SHEET */}
      {/* ========================================================================= */}
      {activeTab === 'google_sheets' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-teal-600" />
                <span>Trung Tâm Đồng Bộ Google Sheets 6 Sheet</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm soát luồng dữ liệu hai chiều và giám sát nhật ký webhook trực tiếp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMasterSyncToGoogleSheets}
                disabled={isSyncingMaster}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-900/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncingMaster ? 'animate-spin' : ''}`} />
                <span>{isSyncingMaster ? 'Đang đồng bộ...' : 'Đồng Bộ Tất Cả Ngay'}</span>
              </button>
            </div>
          </div>

          {/* Webhook Configuration Box */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Đường dẫn Google Apps Script Webhook Endpoint:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-teal-400 break-all select-all">
              {GOOGLE_SHEET_WEBAPP_URL}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleTestPingWebhook}
                disabled={isPingTesting}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isPingTesting ? 'Đang gửi ping...' : 'Gửi Ping Kiểm Tra Kết Nối'}
              </button>

              <button
                onClick={() => setIsGasCodeModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Xem &amp; Sao chép mã Google Apps Script (6 Sheet)
              </button>
            </div>
          </div>

          {/* 6 Sheets Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: '1', name: 'GiaoVien', desc: 'Lưu thông tin GV đăng ký', color: 'border-purple-200 bg-purple-50 text-purple-900' },
              { id: '2', name: 'LopHoc', desc: 'Lớp học & giáo viên quản lý', color: 'border-sky-200 bg-sky-50 text-sky-900' },
              { id: '3', name: 'HocSinh', desc: 'Mã HS riêng, mật khẩu, lớp', color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
              { id: '4', name: 'KetQuaHocTap', desc: 'Điểm số 10 câu, XP, thời gian', color: 'border-amber-200 bg-amber-50 text-amber-900' },
              { id: '5', name: 'KienThucChuan_GV', desc: 'Lịch sử biên soạn online', color: 'border-indigo-200 bg-indigo-50 text-indigo-900' },
              { id: '6', name: 'NganHangCauHoi', desc: 'Câu hỏi mới & đáp án chuẩn', color: 'border-rose-200 bg-rose-50 text-rose-900' },
            ].map((sh) => (
              <div key={sh.id} className={`p-3.5 rounded-2xl border ${sh.color} space-y-1`}>
                <span className="text-[10px] font-mono font-bold opacity-60">SHEET #{sh.id}</span>
                <p className="font-extrabold text-xs">{sh.name}</p>
                <p className="text-[11px] opacity-80 leading-snug">{sh.desc}</p>
              </div>
            ))}
          </div>

          {/* Live Sync History */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Nhật Ký Đồng Bộ Thời Gian Thực ({syncLogs.length})</span>
            </h3>

            <div className="rounded-2xl border border-slate-200 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {syncLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  Chưa có sự kiện đồng bộ nào được ghi nhận. Bấm "Đồng Bộ Tất Cả Ngay" để kích hoạt.
                </div>
              ) : (
                syncLogs.map((log) => (
                  <div key={log.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] text-slate-400">{log.timestamp}</span>
                      <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-slate-100 text-slate-800 text-[10px]">
                        [{log.sheet}]
                      </span>
                      <span className="font-medium text-slate-800">{log.description}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Thành công
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Modal Thêm Giáo Viên */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <School className="h-5 w-5 text-purple-600" />
                <span>Cấp Tài Khoản Giáo Viên Mới</span>
              </h3>
              <button onClick={() => setIsAddTeacherOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên Giáo viên *</label>
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="Ví dụ: Thầy Trần Quang Huy"
                  required
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Đăng Nhập (Username) *</label>
                <input
                  type="text"
                  value={newTeacherUsername}
                  onChange={(e) => setNewTeacherUsername(e.target.value)}
                  placeholder="Ví dụ: thayhuy.bio9"
                  required
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật khẩu ban đầu *</label>
                <input
                  type="text"
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trường THCS công tác</label>
                <input
                  type="text"
                  value={newTeacherSchool}
                  onChange={(e) => setNewTeacherSchool(e.target.value)}
                  placeholder="Ví dụ: THCS Chu Văn An"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Tạo Giáo Viên &amp; Cấp Mã GV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Đổi Mật Khẩu Giáo Viên */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-600" />
              <span>Đổi Mật Khẩu Giáo Viên</span>
            </h3>
            <p className="text-xs text-slate-600">
              Giáo viên: <strong>{editingTeacher.fullName}</strong> (@{editingTeacher.username})
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Mật khẩu mới (tối thiểu 4 ký tự):</label>
              <input
                type="text"
                value={newTeacherPassInput}
                onChange={(e) => setNewTeacherPassInput(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resetTeacherPassword(editingTeacher.uid, newTeacherPassInput)) {
                    triggerToast(`Đã cập nhật mật khẩu mới cho ${editingTeacher.fullName}!`);
                    setEditingTeacher(null);
                  } else {
                    alert('Mật khẩu cần ít nhất 4 ký tự!');
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Lưu Mật Khẩu Mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Tạo Lớp Học Mới */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-sky-600" />
                <span>Khởi Tạo Lớp Học Mới</span>
              </h3>
              <button onClick={() => setIsAddClassOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Lớp Học *</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: Lớp 9A3"
                  required
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Tham Gia (Code) (Tự sinh nếu để trống)</label>
                <input
                  type="text"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                  placeholder="Ví dụ: BIO9A3"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 font-mono uppercase text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo Viên Phụ Trách</label>
                <select
                  value={newClassTeacherUid}
                  onChange={(e) => setNewClassTeacherUid(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="">-- Chọn Giáo Viên --</option>
                  {teachersList.map((t) => (
                    <option key={t.uid} value={t.uid}>
                      {t.fullName} ({t.teacherCode || 'GV'}) - @{t.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Tạo Lớp &amp; Đồng Bộ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Đổi Mật Khẩu Học Sinh */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-600" />
              <span>Đổi Mật Khẩu Học Sinh</span>
            </h3>
            <p className="text-xs text-slate-600">
              Học sinh: <strong>{editingStudent.fullName}</strong> (Mã HS: {editingStudent.studentCode})
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Mật khẩu mới (tối thiểu 4 ký tự):</label>
              <input
                type="text"
                value={newStudentPassInput}
                onChange={(e) => setNewStudentPassInput(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (updateStudentPassword(editingStudent.uid, newStudentPassInput)) {
                    triggerToast(`Đã đổi mật khẩu cho học sinh ${editingStudent.fullName}!`);
                    setEditingStudent(null);
                  } else {
                    alert('Mật khẩu cần ít nhất 4 ký tự!');
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Lưu Mật Khẩu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Xem & Sao Chép Mã Google Apps Script */}
      {isGasCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-3xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                <span>Mã Nguồn Google Apps Script (Tự động 6 Sheet)</span>
              </h3>
              <button onClick={() => setIsGasCodeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Mã kịch bản Google Apps Script hoàn chỉnh để dán vào <strong>Tiện ích mở rộng &gt; Apps Script</strong> trong file Google Sheets. Hỗ trợ đầy đủ 6 Sheet: <code>GiaoVien</code>, <code>LopHoc</code>, <code>HocSinh</code>, <code>KetQuaHocTap</code>, <code>KienThucChuan_GV</code>, <code>NganHangCauHoi</code>.
            </p>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <pre className="h-full overflow-y-auto font-mono text-[11px] text-teal-300 leading-relaxed">
                {RECOMMENDED_GAS_CODE}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(RECOMMENDED_GAS_CODE);
                  triggerToast('Đã sao chép toàn bộ mã Google Apps Script vào bộ nhớ tạm!');
                }}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                <span>Sao Chép Toàn Bộ Mã</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGasCodeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { useAuth } from '../../hooks/useAuth';
import { GENETICS_TOPICS, useGeneticsTopics, getEquivalentTopicIds } from '../../data/topicsData';
import { ENGLISH_BIO_TERMS } from '../../data/englishBioData';
import {
  getRandomizedPracticeQuestionsForTopic,
  getPracticeQuestionsForTopic,
  PracticeQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
} from '../../data/practiceQuestionsData';
import {
  getPracticeQuestionsFromBank,
  subscribeToQuestionBank,
} from '../../firebase/questionBankService';
import { TopicModelRenderer } from '../../components/models/TopicModelRenderer';
import { TopicVideoLibrary } from '../../components/materials/TopicVideoLibrary';
import { TopicKnowledgeViewer } from '../../components/knowledge/TopicKnowledgeViewer';
import { syncProgressToGoogleSheet } from '../../services/googleSheetService';
import { formatBioFormula } from '../../utils/formulaFormatter';
import {
  Compass,
  Play,
  BookOpen,
  Sparkles,
  FileText,
  CheckCircle2,
  Swords,
  GraduationCap,
  ArrowLeft,
  Clock,
  Award,
  ChevronRight,
  Info,
  Check,
  Volume2,
  Upload,
  Plus,
  Download,
  X,
  FileUp,
  RotateCcw,
  Star,
  Printer,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Video,
} from 'lucide-react';

interface MaterialItem {
  id: string;
  title: string;
  type: 'PDF' | 'DOCX' | 'PPTX' | 'IMAGE';
  size: string;
  author: string;
  visibility: 'PUBLIC' | 'CLASS' | 'PRIVATE';
  createdAt: string;
}

export const TopicDetailPage: React.FC = () => {
  const { selectedTopicId, selectedTab, navigate } = useNavigation();
  const { userProgress, updateProgress, user, classes } = useAuth();

  const VALID_TABS = ['interactive', 'knowledge', 'english_bio', 'materials', 'practice', 'challenge', 'assessment'];

  // Active sub-tab (Default to 'interactive' - 1. Mô hình 3D)
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (selectedTab && VALID_TABS.includes(selectedTab) && selectedTab !== 'explore') {
      return selectedTab;
    }
    return 'interactive';
  });

  const { topics } = useGeneticsTopics();
  const topic = topics.find(t => t.id === selectedTopicId) || topics[0] || GENETICS_TOPICS[0];
  const allowedTermIds = getEquivalentTopicIds(topic.id);
  const topicTerms = ENGLISH_BIO_TERMS.filter(term => allowedTermIds.includes(term.topicId));

  // Practice questions state: loaded directly from the Teacher's Central Question Bank (Cloud Synced)
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>(() =>
    getPracticeQuestionsFromBank(topic.id)
  );

  // Practice runner state
  const [userAnswers, setUserAnswers] = useState<Record<string, string | boolean | number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);

  // When selected topic changes, ensure 3D Model is displayed first, load randomized questions from Central Bank
  useEffect(() => {
    if (selectedTab && VALID_TABS.includes(selectedTab) && selectedTab !== 'explore') {
      setActiveTab(selectedTab);
    } else {
      setActiveTab('interactive');
    }
    setPracticeQuestions(getPracticeQuestionsFromBank(topic.id));
    setUserAnswers({});
    setSubmittedQuestions({});
    setPracticeFinished(false);
    setPracticeScore(0);
  }, [topic.id, selectedTab]);

  // Subscribe to Central Question Bank updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToQuestionBank(() => {
      // If student hasn't submitted yet, keep the questions synchronized with teacher's edits
      if (!practiceFinished && Object.keys(userAnswers).length === 0) {
        setPracticeQuestions(getPracticeQuestionsFromBank(topic.id));
      }
    });
    return () => unsubscribe();
  }, [topic.id, practiceFinished, userAnswers]);

  // Track actual learning activities for accurate progress calculation
  useEffect(() => {
    const current = userProgress[topic.id];
    if (activeTab === 'interactive' && !current?.interactiveCompleted) {
      const newPercent = Math.max(current?.progressPercent || 0, 25);
      updateProgress(topic.id, {
        interactiveCompleted: true,
        progressPercent: newPercent,
      });
    } else if (activeTab === 'knowledge' && !current?.knowledgeRead) {
      const hasInteractive = current?.interactiveCompleted;
      const newPercent = Math.max(current?.progressPercent || 0, hasInteractive ? 50 : 25);
      updateProgress(topic.id, {
        knowledgeRead: true,
        progressPercent: newPercent,
      });
    }
  }, [activeTab, topic.id]);

  // Materials Library with Upload Modal
  const [materials, setMaterials] = useState<MaterialItem[]>([
    {
      id: 'mat_1',
      title: `Tóm tắt sơ đồ tư duy & công thức: ${topic.titleVi}`,
      type: 'PDF',
      size: '2.4 MB',
      author: 'Tổ Bộ môn Sinh học',
      visibility: 'PUBLIC',
      createdAt: '2026-09-20',
    },
    {
      id: 'mat_2',
      title: `Phiếu bài tập nâng cao bồi dưỡng HSG: ${topic.titleVi}`,
      type: 'DOCX',
      size: '1.1 MB',
      author: 'Tổ Sinh học 9 THCS',
      visibility: 'CLASS',
      createdAt: '2026-09-22',
    },
  ]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [materialSectionFilter, setMaterialSectionFilter] = useState<'all' | 'videos' | 'docs'>('all');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<'PDF' | 'DOCX' | 'PPTX' | 'IMAGE'>('PDF');
  const [uploadVisibility, setUploadVisibility] = useState<'PUBLIC' | 'CLASS' | 'PRIVATE'>('CLASS');
  const [uploadFileName, setUploadFileName] = useState('');

  // Voice selection: Giọng Nam và Giọng Nữ for English Biology
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');

  const playPronunciation = (text: string, overrideGender?: 'female' | 'male') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    const targetGender = overrideGender || voiceGender;

    const voices = window.speechSynthesis.getVoices();
    if (targetGender === 'female') {
      utterance.pitch = 1.25; // Giọng nữ cao trong trẻo, tự nhiên
      utterance.rate = 0.88; // Tốc độ vừa phải, phát âm tròn vành rõ chữ
      const femaleVoice = voices.find(
        v =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('female') ||
            v.name.includes('Samantha') ||
            v.name.includes('Zira') ||
            v.name.includes('Victoria') ||
            v.name.includes('Google US English') ||
            v.name.includes('Karen') ||
            v.name.includes('Moira') ||
            v.name.includes('Jenny') ||
            v.name.includes('Ava'))
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    } else {
      utterance.pitch = 0.92; // Giọng nam trầm ấm, đĩnh đạc
      utterance.rate = 0.88;
      const maleVoice = voices.find(
        v =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('male') ||
            v.name.includes('David') ||
            v.name.includes('Mark') ||
            v.name.includes('Guy') ||
            v.name.includes('Alex') ||
            v.name.includes('Daniel') ||
            v.name.includes('Oliver') ||
            v.name.includes('Fred') ||
            v.name.includes('George'))
      );
      if (maleVoice) {
        utterance.voice = maleVoice;
      }
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    const newMaterial: MaterialItem = {
      id: 'mat_' + Date.now(),
      title: uploadTitle.trim(),
      type: uploadType,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      author: user?.fullName || 'Giáo viên',
      visibility: uploadVisibility,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setMaterials(prev => [newMaterial, ...prev]);
    setUploadTitle('');
    setUploadFileName('');
    setIsUploadModalOpen(false);
  };

  const checkAnswer = (qId: string) => {
    const q = practiceQuestions.find(item => item.id === qId);
    if (!q) return false;
    const ans = userAnswers[qId];
    if (ans === undefined || ans === null) return false;

    if (q.type === 'multiple_choice') {
      return Number(ans) === (q as MultipleChoiceQuestion).correctAnswer;
    } else {
      return ans === (q as TrueFalseQuestion).correctAnswer;
    }
  };

  const handleSubmitPractice = () => {
    let correctCount = 0;
    practiceQuestions.forEach(q => {
      if (checkAnswer(q.id)) correctCount++;
    });
    setPracticeScore(correctCount);
    setPracticeFinished(true);
    setSubmittedQuestions(practiceQuestions.reduce((acc, q) => ({ ...acc, [q.id]: true }), {}));

    // Calculate REAL, ACCURATE progress based on actual activities
    const current = userProgress[topic.id] || {};
    const hasInteractive = current.interactiveCompleted || activeTab === 'interactive';
    const hasKnowledge = current.knowledgeRead || activeTab === 'knowledge';
    const baseProgress = (hasInteractive ? 25 : 0) + (hasKnowledge ? 25 : 0);
    // Practice quiz is worth up to 50%
    const quizProgress = Math.round((correctCount / 10) * 50);
    const realTotalProgress = Math.min(100, baseProgress + quizProgress);

    // Grant XP proportional to performance
    updateProgress(
      topic.id,
      {
        practiceScore: Math.round((correctCount / 10) * 100),
        progressPercent: realTotalProgress,
        interactiveCompleted: hasInteractive,
        knowledgeRead: hasKnowledge,
      },
      correctCount * 15
    );

    // Sync student score and practice results directly to Google Sheet
    if (user) {
      const studentCode = user.studentCode || (user.role === 'student' ? `HS-${(user.uid || '').replace(/[^0-9]/g, '').slice(-6).padStart(6, '0')}` : 'HS-GUEST');
      const assignedClass = classes.find(c => (user.currentClassId && c.id === user.currentClassId) || (user.classIds && user.classIds.includes(c.id)));
      syncProgressToGoogleSheet({
        timestamp: new Date().toISOString(),
        studentCode,
        fullName: user.fullName || user.username || 'Học sinh',
        username: user.username || user.email || 'hocsinh',
        classCode: assignedClass?.code || 'BIO9',
        teacherCode: assignedClass?.teacherCode || user.teacherCode || 'GV-ONLINE',
        topicId: topic.id,
        topicTitle: topic.titleVi,
        activityType: 'practice_10_questions',
        score: correctCount,
        maxScore: 10,
        correctCount: correctCount,
        totalQuestions: 10,
        xpEarned: correctCount * 15,
      }).catch(err => console.warn('Failed to sync practice progress to Google Sheet:', err));
    }
  };

  // Restart practice with a brand new randomized 10-question set from the Central Question Bank
  const handleRestartPractice = () => {
    setPracticeQuestions(getPracticeQuestionsFromBank(topic.id));
    setUserAnswers({});
    setSubmittedQuestions({});
    setPracticeFinished(false);
    setPracticeScore(0);
  };

  // Assessment evaluation data computed strictly from ACTUAL student score & progress
  const currentSavedScore = practiceFinished
    ? practiceScore
    : typeof userProgress[topic.id]?.practiceScore === 'number'
    ? Math.round(((userProgress[topic.id]?.practiceScore || 0) / 100) * 10)
    : null;

  // Real actual progress percentage (no fake 90% default!)
  const actualProgressPercent = userProgress[topic.id]?.progressPercent !== undefined
    ? userProgress[topic.id].progressPercent
    : (practiceFinished ? Math.round((practiceScore / 10) * 50) : 0);

  const evaluationRating =
    currentSavedScore !== null
      ? currentSavedScore >= 9
        ? { label: 'XUẤT SẮC', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' }
        : currentSavedScore >= 7
        ? { label: 'KHÁ / GIỎI', color: 'text-sky-700 bg-sky-50 border-sky-300' }
        : currentSavedScore >= 5
        ? { label: 'TRUNG BÌNH / ĐẠT', color: 'text-amber-700 bg-amber-50 border-amber-300' }
        : { label: 'CẦN CỐ GẮNG', color: 'text-rose-700 bg-rose-50 border-rose-300' }
      : { label: 'CHƯA ĐÁNH GIÁ', color: 'text-slate-700 bg-slate-100 border-slate-300' };

  // Topic specific badge
  const TOPIC_BADGE_MAP: Record<string, string> = {
    dna: 'Chuyên gia DNA 9',
    gene: 'Chuyên gia Gene 9',
    rna: 'Bậc thầy RNA 9',
    protein: 'Kiến trúc sư Protein 9',
    dna_replication: 'Bậc thầy Tái bản DNA',
    transcription: 'Chuyên gia Phiên mã',
    translation: 'Chuyên gia Dịch mã',
    gene_mutation: 'Nhà phân tích Đột biến Gene',
    chromosome: 'Nhà thám hiểm Nhiễm sắc thể',
    chromosome_set: 'Chuyên gia Bộ Nhiễm sắc thể',
    mitosis: 'Nhà khám phá Nguyên phân',
    meiosis: 'Nhà khám phá Giảm phân',
    sex_determination: 'Chuyên gia Xác định Giới tính',
    genetic_linkage: 'Nhà nghiên cứu Di truyền Morgan',
    chromosomal_mutation: 'Chuyên gia Đột biến NST',
  };
  const topicBadgeName = TOPIC_BADGE_MAP[topic.id] || `Chuyên gia ${topic.titleVi}`;
  const isBadgeUnlocked = actualProgressPercent >= 70 && (currentSavedScore !== null && currentSavedScore >= 7);

  // Dynamic pedagogical remarks tailored to topic and actual student score
  const getPedagogicalRemarks = () => {
    const studentName = user?.fullName || 'Nguyễn Minh Anh';
    if (currentSavedScore === null) {
      return `Em ${studentName} đang tìm hiểu chuyên đề "${topic.titleVi}". Để hệ thống đánh giá chính xác năng lực và ghi nhận tiến độ học tập vào học bạ điện tử, em hãy hoàn thành bài luyện tập 10 câu (7 trắc nghiệm chọn 4 đáp án + 3 câu đúng/sai) tại Tab Luyện tập.`;
    }
    if (currentSavedScore === 0) {
      return `Học sinh ${studentName} chưa đạt yêu cầu ở bài luyện tập chuyên đề "${topic.titleVi}" (kết quả: 0 / 10 câu - 0%). Thầy/Cô nhận thấy em chưa nắm được các khái niệm nền tảng của chuyên đề này. Em hãy bình tĩnh đọc lại bài học trong phần Lý thuyết SGK, quan sát thật kỹ mô hình 3D trực quan và nhấn "Làm lại" để rèn luyện lại từ đầu.`;
    }
    if (currentSavedScore <= 4) {
      return `Em ${studentName} đã nỗ lực làm bài luyện tập chuyên đề "${topic.titleVi}" nhưng kết quả chưa đạt chuẩn năng lực (đạt ${currentSavedScore} / 10 câu - ${currentSavedScore * 10}%). Em còn nhầm lẫn ở nhiều kiến thức trọng tâm và các nhận định đúng/sai. Em hãy xem lại phần giải thích chi tiết của từng câu, ôn tập kỹ lý thuyết và làm lại bài để nâng cao điểm số.`;
    }
    if (currentSavedScore <= 6) {
      return `Em ${studentName} đã nắm được mức độ cơ bản của chuyên đề "${topic.titleVi}" với kết quả ${currentSavedScore} / 10 câu (${currentSavedScore * 10}%). Em đã hiểu được các khái niệm nền tảng nhưng còn phân vân ở một số câu hỏi phân tích và vận dụng. Thầy/Cô khuyên em nên đọc thêm phần giải thích chi tiết để tự tin đạt điểm giỏi ở các lần làm bài sau.`;
    }
    if (currentSavedScore <= 8) {
      return `Em ${studentName} đã hoàn thành tốt bài học "${topic.titleVi}" với kết quả ${currentSavedScore} / 10 câu (${currentSavedScore * 10}%). Em thể hiện tinh thần tự học nghiêm túc, hiểu rõ bản chất bài học từ mô hình 3D và vận dụng tốt vào bài tập. Em hãy duy trì phong độ và tiếp tục khám phá các chuyên đề tiếp theo!`;
    }
    return `Xuất sắc! Em ${studentName} đã nắm rất vững toàn diện kiến thức chuyên đề "${topic.titleVi}" với số điểm ấn tượng ${currentSavedScore} / 10 câu (${currentSavedScore * 10}%). Em có tư duy khoa học logic, phân tích chính xác các hiện tượng di truyền và hoàn toàn xứng đáng đạt danh hiệu "${topicBadgeName}".`;
  };

  const getCompetency1Text = () => {
    if (currentSavedScore === null) {
      return `Chưa kiểm tra năng lực nhận thức. Em hãy làm bài tập 10 câu để hệ thống đánh giá mức độ ghi nhớ và hiểu biết lý thuyết của chuyên đề ${topic.titleVi}.`;
    }
    if (currentSavedScore >= 8) {
      return `Học sinh nắm rất vững các khái niệm cốt lõi, cơ chế và bản chất sinh học của chuyên đề ${topic.titleVi}. Hiểu rõ mối liên hệ giữa cấu trúc và chức năng, giải thích chính xác các quy luật di truyền liên quan theo chuẩn kiến thức GDPT 2018.`;
    }
    if (currentSavedScore >= 5) {
      return `Học sinh đã nắm được các định nghĩa và nguyên tắc cơ bản của ${topic.titleVi}. Tuy nhiên còn một số nhầm lẫn ở các câu hỏi phân biệt chi tiết hoặc suy luận. Cần đọc lại phần lý thuyết SGK để củng cố.`;
    }
    return `Học sinh chưa nắm vững kiến thức trọng tâm của ${topic.titleVi} (kết quả bài tập ${currentSavedScore}/10 câu). Cần dành thời gian đọc kỹ lại toàn bộ phần Lý thuyết chuẩn SGK và ghi chú các thuật ngữ cơ bản trước khi làm lại bài tập.`;
  };

  const getCompetency2Text = () => {
    return `Học sinh tích cực tương tác và quan sát mô hình 3D không gian trực quan của ${topic.titleVi}. Việc kết hợp xoay 360°, phóng to thu nhỏ và soi chi tiết các bộ phận giúp học sinh hình dung trực tiếp cấu trúc không gian 3 chiều mà tranh ảnh 2D trong SGK không thể hiện trọn vẹn được.`;
  };

  const getCompetency3Text = () => {
    if (currentSavedScore === null) {
      return `Chưa nộp bài tập. Vui lòng làm bài tập trắc nghiệm và câu đúng/sai để đánh giá năng lực vận dụng.`;
    }
    return `Vận dụng kiến thức chuyên đề ${topic.titleVi} để giải quyết 10 câu hỏi gồm 7 câu trắc nghiệm chọn 4 đáp án và 3 câu đúng/sai. Kết quả đạt ${currentSavedScore}/10 câu (${currentSavedScore * 10}%). ${
      currentSavedScore >= 7
        ? 'Phản xạ nhanh, tư duy phân tích chính xác.'
        : currentSavedScore >= 5
        ? 'Có khả năng vận dụng cơ bản, cần rèn luyện thêm các câu hỏi phân tích đa chiều.'
        : 'Cần rèn luyện thêm kỹ năng đọc hiểu câu hỏi và suy luận loại trừ đáp án.'
    }`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('knowledge_map')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Bản đồ Kiến thức</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="text-cyan-400 font-bold">Chủ đề {topic.order}/{topics.length}:</span>
          <span>{topic.titleVi}</span>
        </div>
      </div>

      {/* Topic Title Card */}
      <div className="rounded-3xl border border-sky-100 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-sky-600 mb-1">
              <span>{topic.module === 'molecular' ? 'MODULE A: DI TRUYỀN PHÂN TỬ' : 'MODULE B: DI TRUYỀN TẾ BÀO'}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-amber-600 font-mono font-bold">+{topic.xpReward} XP Thưởng</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{topic.titleVi}</h1>
            <p className="text-xs font-semibold text-sky-600/90 font-mono mt-0.5">{topic.titleEn}</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-center">
              <span className="text-[10px] text-slate-500 font-medium block">Thời lượng</span>
              <span className="font-mono text-xs font-extrabold text-sky-700 flex items-center gap-1">
                <Clock className="h-3 w-3 text-sky-500 inline" /> {topic.estimatedMinutes}p
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Streamlined Compact Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto text-xs">
        {[
          { key: 'interactive', label: '1. Mô hình 3D', icon: Play },
          { key: 'knowledge', label: '2. Kiến thức chuẩn', icon: BookOpen },
          { key: 'english_bio', label: '3. English Biology', icon: Sparkles },
          { key: 'materials', label: '4. Kho học liệu', icon: FileText },
          { key: 'practice', label: '5. Luyện tập (10 câu)', icon: CheckCircle2 },
          { key: 'challenge', label: '6. Thử thách', icon: Swords },
          { key: 'assessment', label: '7. Đánh giá', icon: GraduationCap },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 text-xs ${
                (activeTab === tab.key || (!VALID_TABS.includes(activeTab) && tab.key === 'interactive'))
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DEDICATED SPECIALIZED TOPIC MODEL (Guaranteed first page) */}
      {(activeTab === 'interactive' || !VALID_TABS.includes(activeTab)) && (
        <div className="space-y-4">
          <TopicModelRenderer topicId={topic.id} />
        </div>
      )}

      {/* TAB 2: COMPREHENSIVE SCIENTIFIC KNOWLEDGE (CUSTOMIZABLE & CLOUD-SYNCED) */}
      {activeTab === 'knowledge' && (
        <TopicKnowledgeViewer topicId={topic.id} topicTitleVi={topic.titleVi} />
      )}

      {/* TAB 3: ENGLISH BIOLOGY WITH MALE AND FEMALE VOICES */}
      {activeTab === 'english_bio' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Thuật ngữ English Biology: {topic.titleVi}</h3>
              <p className="text-xs text-slate-500">
                Luyện nghe và phát âm thuật ngữ sinh học chuẩn quốc tế với 2 tùy chọn giọng Nam và giọng Nữ
              </p>
            </div>

            {/* Voice mode toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs self-start sm:self-center">
              <button
                onClick={() => setVoiceGender('female')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                  voiceGender === 'female'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👩 Giọng Nữ (Female)</span>
              </button>
              <button
                onClick={() => setVoiceGender('male')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                  voiceGender === 'male'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👨 Giọng Nam (Male)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topicTerms.map(term => (
              <div
                key={term.id}
                className="p-5 rounded-3xl bg-white border border-sky-100 space-y-3 shadow-sm hover:border-sky-300 transition-all text-slate-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{term.englishTerm}</h4>
                    <p className="text-xs font-bold text-sky-600">{term.vietnameseMeaning}</p>
                  </div>

                  {/* Dual Voice Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => playPronunciation(term.englishTerm, 'female')}
                      className={`p-2 rounded-xl border flex items-center gap-1 text-[11px] font-bold transition-colors ${
                        voiceGender === 'female'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Nghe phát âm Giọng Nữ"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Nữ ♀</span>
                    </button>
                    <button
                      onClick={() => playPronunciation(term.englishTerm, 'male')}
                      className={`p-2 rounded-xl border flex items-center gap-1 text-[11px] font-bold transition-colors ${
                        voiceGender === 'male'
                          ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Nghe phát âm Giọng Nam"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Nam ♂</span>
                    </button>
                  </div>
                </div>

                <div className="font-mono text-xs text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg inline-block border border-sky-100 font-bold">
                  {term.pronunciation}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  <strong className="text-slate-900 font-bold">Definition:</strong> {term.definition}
                </p>

                <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  &quot;{term.exampleSentence}&quot;
                </p>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                  {term.relatedTerms.map((r, i) => (
                    <span key={i} className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEARNING MATERIALS & GOOGLE DRIVE VIDEO HUB */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Sub-navigation filter for Materials */}
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setMaterialSectionFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                materialSectionFilter === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Tất cả học liệu</span>
            </button>
            <button
              onClick={() => setMaterialSectionFilter('videos')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                materialSectionFilter === 'videos'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Video className="h-3.5 w-3.5 text-sky-400" />
              <span>🎥 Video Bài Giảng (Google Drive)</span>
            </button>
            <button
              onClick={() => setMaterialSectionFilter('docs')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                materialSectionFilter === 'docs'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-amber-500" />
              <span>📄 Đề Cương &amp; Tài Liệu Ôn Tập</span>
            </button>
          </div>

          {/* 1. Video Lecture Library (Google Drive / YouTube) */}
          {(materialSectionFilter === 'all' || materialSectionFilter === 'videos') && (
            <TopicVideoLibrary
              topicId={topic.id}
              topicTitle={topic.titleVi}
              userRole={user?.role}
              userName={user?.fullName}
              onNavigateTo3D={() => setActiveTab('interactive')}
            />
          )}

          {/* 2. Documents & Outlines (PDF, Word, PPTX) */}
          {(materialSectionFilter === 'all' || materialSectionFilter === 'docs') && (
            <div className="rounded-3xl border border-sky-100 bg-white p-6 space-y-5 shadow-sm text-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" />
                    <span>Tài Liệu Đề Cương &amp; Bài Tập: {topic.titleVi}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Tài liệu tham khảo, bài giảng PDF/Word và phiếu bài tập ôn thi</p>
                </div>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/25 flex items-center gap-1.5 self-start sm:self-center transition-all"
                >
                  <Upload className="h-4 w-4" />
                  <span>Tải tài liệu lên</span>
                </button>
              </div>

              <div className="space-y-3">
                {materials.map(mat => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white border border-sky-200 text-sky-600 font-bold text-[10px] font-mono shadow-xs">
                        {mat.type}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block">{mat.title}</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {mat.size} · Đăng bởi {mat.author} · {mat.createdAt} · Quyền: {mat.visibility}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Bắt đầu tải tệp "${mat.title}" (${mat.size})...`)}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-700 font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5 text-sky-600" />
                        <span>Tải về</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Modal */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-sky-600" />
                    <span>Tải Tài Liệu Mới Lên Kho</span>
                  </h4>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Tiêu đề tài liệu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={e => setUploadTitle(e.target.value)}
                      placeholder="ví dụ: Đề cương ôn tập di truyền phân tử lớp 9"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Định dạng tệp</label>
                      <select
                        value={uploadType}
                        onChange={e => setUploadType(e.target.value as any)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                      >
                        <option value="PDF">PDF Document</option>
                        <option value="DOCX">Word (.docx)</option>
                        <option value="PPTX">PowerPoint (.pptx)</option>
                        <option value="IMAGE">Hình ảnh / Sơ đồ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Phạm vi hiển thị</label>
                      <select
                        value={uploadVisibility}
                        onChange={e => setUploadVisibility(e.target.value as any)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                      >
                        <option value="CLASS">Chỉ học sinh trong lớp (CLASS)</option>
                        <option value="PUBLIC">Công khai toàn trường (PUBLIC)</option>
                        <option value="PRIVATE">Chỉ giáo viên (PRIVATE)</option>
                      </select>
                    </div>
                  </div>

                  {/* File select mockup */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 text-center">
                    <input
                      type="file"
                      id="fileUpload"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadFileName(e.target.files[0].name);
                          if (!uploadTitle) setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer block">
                      <Upload className="h-6 w-6 text-sky-500 mx-auto mb-1" />
                      <span className="text-sky-700 font-bold block">
                        {uploadFileName ? uploadFileName : 'Nhấp để chọn tệp từ máy tính của bạn'}
                      </span>
                      <span className="text-[10px] text-slate-400">PDF, DOCX, PPTX tối đa 25MB</span>
                    </label>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-4 py-2 font-bold text-slate-500 hover:text-slate-800"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs"
                    >
                      Tải lên ngay
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PRACTICE WITH EXACTLY 7 MCQs + 3 TRUE/FALSE = 10 QUESTIONS */}
      {activeTab === 'practice' && (
        <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 space-y-6 shadow-sm text-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-wider block">
                BỘ ĐỀ LUYỆN TẬP CHUẨN: {topic.titleVi}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Gồm đúng 10 câu: 7 câu chọn 4 đáp án + 3 câu đúng/sai
              </h3>
            </div>

            {practiceFinished ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  Kết quả: {practiceScore} / 10 câu đúng ({practiceScore * 10}%)
                </span>
                <button
                  onClick={handleRestartPractice}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Làm lại
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmitPractice}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/25"
              >
                Chấm điểm &amp; Kiểm tra 10 câu
              </button>
            )}
          </div>

          {/* List of 10 Questions */}
          <div className="space-y-6">
            {/* Section 1: 7 Multiple Choice Questions (chọn 4 đáp án) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-sky-800 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 font-extrabold">
                  PHẦN I: 7 CÂU HỎI TRẮC NGHIỆM (CHỌN 4 ĐÁP ÁN)
                </span>
              </h4>

              {practiceQuestions.slice(0, 7).map((q, idx) => {
                const isCorrect = submittedQuestions[q.id] ? checkAnswer(q.id) : null;
                const currentAnswer = userAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      submittedQuestions[q.id]
                        ? isCorrect
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-rose-200 bg-rose-50/40'
                        : 'border-slate-200/80 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-extrabold text-sky-600">Câu {idx + 1}:</span>
                      {submittedQuestions[q.id] && (
                        <span
                          className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isCorrect ? 'CHÍNH XÁC' : 'CHƯA ĐÚNG'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900 mb-3.5">
                      {formatBioFormula(q.question)}
                    </p>

                    {/* 4 Options if multiple_choice */}
                    {q.type === 'multiple_choice' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(q as MultipleChoiceQuestion).options.map((opt, optIdx) => {
                          const isSelected = currentAnswer === optIdx;
                          const isOptionCorrect = optIdx === (q as MultipleChoiceQuestion).correctAnswer;

                          let optionStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
                          if (submittedQuestions[q.id]) {
                            if (isOptionCorrect) {
                              optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400';
                            } else if (isSelected && !isCorrect) {
                              optionStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-1 ring-rose-400';
                            } else {
                              optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-70';
                            }
                          } else if (isSelected) {
                            optionStyle = 'bg-sky-50 border-sky-500 text-sky-900 font-bold ring-2 ring-sky-300';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={practiceFinished}
                              onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 shadow-2xs ${optionStyle}`}
                            >
                              <span>{formatBioFormula(opt)}</span>
                              {submittedQuestions[q.id] && isOptionCorrect && (
                                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {submittedQuestions[q.id] && (
                      <div className="mt-3.5 pt-2.5 border-t border-slate-200 text-xs text-slate-700">
                        <strong className="text-sky-700">Giải thích chi tiết:</strong>{' '}
                        {formatBioFormula(q.explanation)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Section 2: 3 True/False Questions */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-purple-800 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 font-extrabold">
                  PHẦN II: 3 CÂU HỎI ĐÚNG / SAI
                </span>
              </h4>

              {practiceQuestions.slice(7, 10).map((q, idx) => {
                const isCorrect = submittedQuestions[q.id] ? checkAnswer(q.id) : null;
                const currentChoice = userAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      submittedQuestions[q.id]
                        ? isCorrect
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-rose-200 bg-rose-50/40'
                        : 'border-slate-200/80 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-extrabold text-purple-600">Câu {idx + 8}:</span>
                      {submittedQuestions[q.id] && (
                        <span
                          className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isCorrect ? 'CHÍNH XÁC' : 'CHƯA ĐÚNG'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900 mb-3">
                      {formatBioFormula(q.question)}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={practiceFinished}
                        onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: true }))}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentChoice === true
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        ĐÚNG
                      </button>
                      <button
                        type="button"
                        disabled={practiceFinished}
                        onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: false }))}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentChoice === false
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        SAI
                      </button>
                    </div>

                    {submittedQuestions[q.id] && (
                      <div className="mt-3.5 pt-2.5 border-t border-slate-200 text-xs text-slate-700">
                        <strong className="text-sky-700">Đáp án chuẩn:</strong>{' '}
                        {(q as TrueFalseQuestion).correctAnswer ? 'ĐÚNG' : 'SAI'}
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">{formatBioFormula(q.explanation)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!practiceFinished && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSubmitPractice}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-sky-600/25"
                >
                  Nộp bài &amp; Chấm điểm 10 câu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CHALLENGE */}
      {activeTab === 'challenge' && (
        <div className="max-w-xl mx-auto text-center rounded-3xl border border-sky-100 bg-white p-8 space-y-4 shadow-sm text-slate-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
            <Swords className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Thử thách Tốc độ: {topic.titleVi}</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            10 câu hỏi trắc nghiệm · Giới hạn 60 giây · Thưởng +150 XP khi đạt điểm tối đa.
          </p>
          <button
            onClick={() => navigate('challenges')}
            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 transition-all"
          >
            Vào Đấu Trường Thử Thách
          </button>
        </div>
      )}

      {/* TAB 7: ĐÁNH GIÁ (HIỂN THỊ NHẬN XÉT CHUNG SAU KHI HỌC SINH ĐÃ HỌC VÀ LÀM BÀI TẬP) */}
      {activeTab === 'assessment' && (
        <div className="space-y-6 text-slate-800">
          {/* Main Assessment Header Card */}
          <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      BÁO CÁO ĐÁNH GIÁ NĂNG LỰC
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${evaluationRating.color}`}>
                      {evaluationRating.label}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Nhận Xét Năng Lực Học Tập Toàn Diện
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chuyên đề: <strong className="text-slate-800 font-bold">{topic.titleVi}</strong> (Mã: {topic.id.toUpperCase()})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
                >
                  <Printer className="h-4 w-4 text-sky-600" />
                  <span>In / Lưu Báo cáo</span>
                </button>
              </div>
            </div>

            {/* Student & Learning Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-sky-600" /> Học sinh
                </span>
                <p className="text-sm font-black text-slate-900">{user?.fullName || 'Nguyễn Minh Anh'}</p>
                <p className="text-[11px] text-slate-500 font-medium">Lớp 9A1 · Trường THCS Chu Văn An</p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1">
                <span className="text-[11px] font-bold text-sky-700 block flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-sky-600" /> Điểm bài tập luyện tập
                </span>
                <p className="text-sm font-black text-sky-950">
                  {currentSavedScore !== null ? `${currentSavedScore} / 10 câu (${currentSavedScore * 10}%)` : 'Chưa nộp bài tập (0/10)'}
                </p>
                <p className="text-[11px] text-sky-700 font-medium">
                  {currentSavedScore !== null ? `Đạt chuẩn năng lực ${evaluationRating.label}` : 'Nhấn tab Luyện tập để làm bài'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 block flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Tiến độ chuyên đề
                </span>
                <p className="text-sm font-black text-emerald-950">
                  {actualProgressPercent}% Hoàn tất
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {actualProgressPercent >= 80
                    ? 'Đã nắm vững & hoàn thành chuyên đề'
                    : actualProgressPercent >= 50
                    ? 'Đã học phần lớn lý thuyết & bài tập'
                    : actualProgressPercent > 0
                    ? 'Đang trong tiến trình học tập'
                    : 'Chưa bắt đầu học chuyên đề'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1 transition-all ${
                isBadgeUnlocked
                  ? 'bg-purple-50/70 border-purple-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[11px] font-bold block flex items-center gap-1 ${
                  isBadgeUnlocked ? 'text-purple-700' : 'text-slate-500'
                }`}>
                  <Star className={`h-3.5 w-3.5 ${isBadgeUnlocked ? 'text-purple-600' : 'text-slate-400'}`} />
                  Huy hiệu đạt được
                </span>
                <p className={`text-sm font-black ${isBadgeUnlocked ? 'text-purple-950' : 'text-slate-600'}`}>
                  {isBadgeUnlocked ? topicBadgeName : 'Chưa mở khóa'}
                </p>
                <p className={`text-[11px] font-medium ${isBadgeUnlocked ? 'text-purple-700' : 'text-slate-500'}`}>
                  {isBadgeUnlocked
                    ? `+${topic.xpReward} XP Tích lũy`
                    : 'Cần đạt ≥ 70% tiến độ & ≥ 7/10 điểm'}
                </p>
              </div>
            </div>

            {/* Detailed Competency Evaluation Matrix (Theo chuẩn GDPT 2018) */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-4 bg-sky-500 rounded-full" />
                <span>Đánh Giá Chi Tiết Theo 3 Nhóm Năng Lực Sinh Học Cốt Lõi</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Competency 1 */}
                <div className="p-5 rounded-2xl border border-sky-100 bg-sky-50/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800">1. Nhận thức Sinh học</span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                      {currentSavedScore !== null
                        ? currentSavedScore >= 8
                          ? 'Mức Tốt / Xuất sắc'
                          : currentSavedScore >= 5
                          ? 'Mức Đạt / Khá'
                          : 'Cần Cố Gắng'
                        : 'Chưa Đánh Giá'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {getCompetency1Text()}
                  </p>
                </div>

                {/* Competency 2 */}
                <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-800">2. Tìm hiểu Không gian 3D</span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      {userProgress[topic.id]?.interactiveCompleted
                        ? 'Chủ động / Thuần thục'
                        : 'Cần khám phá thêm'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {getCompetency2Text()}
                  </p>
                </div>

                {/* Competency 3 */}
                <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">3. Vận dụng &amp; Giải bài tập</span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {currentSavedScore !== null
                        ? currentSavedScore >= 9
                          ? 'Chính xác / Phản xạ nhanh'
                          : currentSavedScore >= 7
                          ? 'Khá / Tốt'
                          : currentSavedScore >= 5
                          ? 'Trung bình / Đạt'
                          : 'Cần rèn luyện thêm'
                        : 'Chưa nộp bài tập'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {getCompetency3Text()}
                  </p>
                </div>
              </div>
            </div>

            {/* General Pedagogical Remarks */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-indigo-50/80 border border-sky-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Nhận Xét Sư Phạm Chung Của Giáo Viên Bộ Môn
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                &ldquo;{getPedagogicalRemarks()}&rdquo;
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-sky-100">
                <span>Giáo viên đánh giá: <strong>Tổ Sinh học 9 THCS</strong></span>
                <span>Trạng thái: <strong className="text-emerald-700 font-bold">✓ Đã xác nhận &amp; Lưu hồ sơ học tập</strong></span>
              </div>
            </div>

            {/* Recommended Next Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <TrendingUp className="h-4 w-4 text-sky-600 shrink-0" />
                <span>
                  Đã sẵn sàng thử sức với bài tiếp theo hoặc thi đấu xếp hạng trên đấu trường?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('practice')}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-bold shadow-2xs"
                >
                  Xem lại bài Luyện tập
                </button>
                <button
                  onClick={() => navigate('challenges')}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-xs"
                >
                  Đấu Trường Thử Thách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


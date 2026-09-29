import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  SOLO_CHALLENGE_QUESTIONS,
  BATTLE_QUESTIONS_POOL,
  SoloChallengeQuestion,
  BattlePoolQuestion,
} from '../../data/challengeQuestionsData';
import {
  Swords,
  Clock,
  Sparkles,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Flame,
  Award,
  Copy,
  Check,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Send,
  UserCheck,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChallengesPage: React.FC = () => {
  const { user, updateProgress } = useAuth();
  const [activeTab, setActiveTab] = useState<'solo_challenge' | 'live_battle'>('solo_challenge');

  // =========================================================================
  // 1. PHẦN THỬ THÁCH ĐƠN (SOLO CHALLENGE: 15 CÂU = 10 MCQ + 5 TRUE/FALSE)
  // =========================================================================
  const [soloCurrentIndex, setSoloCurrentIndex] = useState(0);
  const [soloUserAnswers, setSoloUserAnswers] = useState<Record<string, string | boolean>>({});
  const [soloSubmitted, setSoloSubmitted] = useState(false);
  const [soloScore, setSoloScore] = useState(0);
  const [soloXpAwarded, setSoloXpAwarded] = useState(false);

  const currentSoloQuestion: SoloChallengeQuestion = SOLO_CHALLENGE_QUESTIONS[soloCurrentIndex];

  const handleSelectSoloMCQ = (questionId: string, optionId: 'A' | 'B' | 'C' | 'D') => {
    if (soloSubmitted) return;
    setSoloUserAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSelectSoloTF = (questionId: string, answer: boolean) => {
    if (soloSubmitted) return;
    setSoloUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitSolo = () => {
    let correctCount = 0;
    SOLO_CHALLENGE_QUESTIONS.forEach(q => {
      const userAns = soloUserAnswers[q.id];
      if (userAns !== undefined && userAns === q.correctAnswer) {
        correctCount += 1;
      }
    });

    setSoloScore(correctCount);
    setSoloSubmitted(true);
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });

    // Award XP based on correct count (e.g. 10 XP per question + 50 bonus if >= 12)
    if (!soloXpAwarded && user) {
      const earnedXp = correctCount * 10 + (correctCount >= 12 ? 50 : 0);
      updateProgress('dna', {}, earnedXp);
      setSoloXpAwarded(true);
    }
  };

  const handleResetSolo = () => {
    setSoloUserAnswers({});
    setSoloSubmitted(false);
    setSoloCurrentIndex(0);
    setSoloScore(0);
    setSoloXpAwarded(false);
  };

  // =========================================================================
  // 2. PHẦN THI ĐẤU (LIVE BATTLE 1 VS 1 - GV CẤP MÃ, 2 HS ĐẠI DIỆN, ĐIỂM ĐẦU = 0)
  // =========================================================================
  // Room code provided by teacher
  const [roomCode, setRoomCode] = useState('BIO9-888');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [isTeacherCodeSet, setIsTeacherCodeSet] = useState(true);

  // 2 Representative Students
  const [student1Name, setStudent1Name] = useState(
    user?.fullName || 'Học sinh 1 (Đội Xanh)'
  );
  const [student2Name, setStudent2Name] = useState('Trần Minh Quân (Đội Đỏ)');

  // Battle match states
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleQuestions, setBattleQuestions] = useState<BattlePoolQuestion[]>([]);
  const [battleCurrentQIndex, setBattleCurrentQIndex] = useState(0);
  const [battleTimeLeft, setBattleTimeLeft] = useState(20); // 20 seconds
  const [isBattleTimeUp, setIsBattleTimeUp] = useState(false);
  const [battleFinished, setBattleFinished] = useState(false);

  // Scores start strictly at 0
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);

  // Answers in current round
  const [student1Answer, setStudent1Answer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [student2Answer, setStudent2Answer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [student1EarnedPoints, setStudent1EarnedPoints] = useState<number | null>(null);
  const [student2EarnedPoints, setStudent2EarnedPoints] = useState<number | null>(null);

  // Round history
  const [roundHistory, setRoundHistory] = useState<
    {
      qIndex: number;
      s1Answer: string | null;
      s2Answer: string | null;
      s1Points: number;
      s2Points: number;
      correctAnswer: string;
    }[]
  >([]);

  // Active question in battle
  const currentBattleQ: BattlePoolQuestion | undefined = battleQuestions[battleCurrentQIndex];

  // Helper sound effect using Web Audio API
  const playTone = (type: 'tick' | 'correct' | 'wrong' | 'timeout' | 'finish') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'timeout') {
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'finish') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // AudioContext fallback
    }
  };

  // Generate random room code
  const handleGenerateNewRoomCode = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    let code = 'BIO9-';
    for (let i = 0; i < 3; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 2; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    setRoomCode(code);
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Start battle with random questions
  const handleStartBattleMatch = () => {
    // Pick 5 to 7 random questions from pool
    const shuffled = [...BATTLE_QUESTIONS_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    setBattleQuestions(selected);
    setBattleCurrentQIndex(0);
    setTeamAScore(0); // STRICTLY 0 AT START
    setTeamBScore(0); // STRICTLY 0 AT START
    setBattleTimeLeft(20);
    setIsBattleTimeUp(false);
    setStudent1Answer(null);
    setStudent2Answer(null);
    setStudent1EarnedPoints(null);
    setStudent2EarnedPoints(null);
    setRoundHistory([]);
    setBattleFinished(false);
    setBattleStarted(true);

    playTone('correct');
  };

  // Countdown timer for 20 seconds
  useEffect(() => {
    if (!battleStarted || battleFinished || isBattleTimeUp) return;

    if (battleTimeLeft <= 0) {
      handleBattleTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setBattleTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleBattleTimeExpired();
          return 0;
        }
        if (prev <= 5) {
          playTone('tick');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [battleStarted, battleFinished, isBattleTimeUp, battleTimeLeft]);

  // When 20 seconds expire
  const handleBattleTimeExpired = () => {
    setIsBattleTimeUp(true);
    playTone('timeout');

    // Rule: "hết giờ k trả lời thì 0 điểm"
    if (student1Answer === null) {
      setStudent1EarnedPoints(0);
    }
    if (student2Answer === null) {
      setStudent2EarnedPoints(0);
    }
  };

  // Rule: "thời gian trả lời 20 giây, giảm 1 giây trừ 2 điểm. hết giờ k trả lời thì 0 điểm"
  // Formula: Max base = 40 points (20s * 2). If answered at remaining T seconds: Points = T * 2.
  // (Alternatively: 100 base - (20 - T)*2). Using the direct 40 - (20 - T)*2 = 2 * T points.
  const calculatePoints = (remainingSeconds: number, isCorrect: boolean): number => {
    if (!isCorrect || remainingSeconds <= 0) return 0;
    // Điểm tối đa 40 điểm (20s * 2). Mỗi giây giảm trừ 2 điểm: Points = remainingSeconds * 2.
    return Math.max(0, remainingSeconds * 2);
  };

  // Student 1 answer action
  const handleStudent1SubmitAnswer = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (!currentBattleQ || student1Answer !== null || isBattleTimeUp) return;

    setStudent1Answer(opt);
    const isCorrect = opt === currentBattleQ.correct;
    const points = calculatePoints(battleTimeLeft, isCorrect);
    setStudent1EarnedPoints(points);

    if (points > 0) {
      setTeamAScore(prev => prev + points);
      playTone('correct');
    } else {
      playTone('wrong');
    }

    // If both students have answered, end round early
    if (student2Answer !== null) {
      setIsBattleTimeUp(true);
    }
  };

  // Student 2 answer action
  const handleStudent2SubmitAnswer = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (!currentBattleQ || student2Answer !== null || isBattleTimeUp) return;

    setStudent2Answer(opt);
    const isCorrect = opt === currentBattleQ.correct;
    const points = calculatePoints(battleTimeLeft, isCorrect);
    setStudent2EarnedPoints(points);

    if (points > 0) {
      setTeamBScore(prev => prev + points);
      playTone('correct');
    } else {
      playTone('wrong');
    }

    // If both students have answered, end round early
    if (student1Answer !== null) {
      setIsBattleTimeUp(true);
    }
  };

  // Move to next question in battle
  const handleNextBattleQuestion = () => {
    if (!currentBattleQ) return;

    // Record round
    setRoundHistory(prev => [
      ...prev,
      {
        qIndex: battleCurrentQIndex + 1,
        s1Answer: student1Answer,
        s2Answer: student2Answer,
        s1Points: student1EarnedPoints ?? 0,
        s2Points: student2EarnedPoints ?? 0,
        correctAnswer: currentBattleQ.correct,
      },
    ]);

    if (battleCurrentQIndex < battleQuestions.length - 1) {
      setBattleCurrentQIndex(prev => prev + 1);
      setBattleTimeLeft(20);
      setIsBattleTimeUp(false);
      setStudent1Answer(null);
      setStudent2Answer(null);
      setStudent1EarnedPoints(null);
      setStudent2EarnedPoints(null);
    } else {
      // Battle finished
      setBattleFinished(true);
      playTone('finish');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

      // Award XP to user if participating
      if (user) {
        updateProgress('dna', {}, 200);
      }
    }
  };

  // Keyboard shortcut listener for live buzzer battle
  useEffect(() => {
    if (!battleStarted || battleFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Next question shortcut
      if (isBattleTimeUp) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleNextBattleQuestion();
        }
        return;
      }

      const key = e.key.toLowerCase();

      // Student 1 (Đội Xanh): keys 1, 2, 3, 4 or q, w, e, r
      if (key === '1' || key === 'q') handleStudent1SubmitAnswer('A');
      else if (key === '2' || key === 'w') handleStudent1SubmitAnswer('B');
      else if (key === '3' || key === 'e') handleStudent1SubmitAnswer('C');
      else if (key === '4' || key === 'r') handleStudent1SubmitAnswer('D');

      // Student 2 (Đội Đỏ): keys 7, 8, 9, 0 or u, i, o, p
      if (key === '7' || key === 'u') handleStudent2SubmitAnswer('A');
      else if (key === '8' || key === 'i') handleStudent2SubmitAnswer('B');
      else if (key === '9' || key === 'o') handleStudent2SubmitAnswer('C');
      else if (key === '0' || key === 'p') handleStudent2SubmitAnswer('D');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    battleStarted,
    battleFinished,
    isBattleTimeUp,
    student1Answer,
    student2Answer,
    battleTimeLeft,
    currentBattleQ,
    battleCurrentQIndex,
    battleQuestions.length,
  ]);

  const handleRestartBattleLobby = () => {
    setBattleStarted(false);
    setBattleFinished(false);
    setBattleQuestions([]);
    setBattleCurrentQIndex(0);
    setTeamAScore(0);
    setTeamBScore(0);
    setStudent1Answer(null);
    setStudent2Answer(null);
    setStudent1EarnedPoints(null);
    setStudent2EarnedPoints(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 mb-1">
            <Swords className="h-4 w-4" />
            <span>HỆ THỐNG THỬ THÁCH &amp; ĐẤU TRƯỜNG SINH HỌC 9</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Trung Tâm Thử Thách &amp; Thi Đấu Trực Tiếp
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phần thử thách đơn (15 câu độc lập) &amp; Phần thi đấu trực tiếp (GV cấp mã phòng, 2 học sinh đại diện)
          </p>
        </div>

        {/* Tab switch between Solo Challenge & Live Battle */}
        <div className="flex items-center p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('solo_challenge')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'solo_challenge'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Thử Thách Đơn (15 Câu)</span>
          </button>
          <button
            onClick={() => setActiveTab('live_battle')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'live_battle'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Swords className="h-4 w-4" />
            <span>Thi Đấu 1 vs 1 (GV Cấp Mã)</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. GIAO DIỆN THỬ THÁCH ĐƠN (15 CÂU = 10 MCQ + 5 TRUE/FALSE) */}
      {/* =================================================================== */}
      {activeTab === 'solo_challenge' && (
        <div className="space-y-6">
          {/* Solo challenge header overview */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200">
                  Thử Thách Cá Nhân
                </span>
                <span className="text-xs text-slate-500 font-mono font-medium">
                  15 câu hỏi · Không liên kết đến phần thi đấu
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Bộ Đề Kiểm Tra Năng Lực Di Truyền Học Toàn Diện
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Gồm <strong>10 câu hỏi trắc nghiệm 4 đáp án</strong> (A, B, C, D) và <strong>5 câu hỏi Đúng / Sai</strong> kiểm tra tư duy khoa học chuẩn SGK KHTN 9.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono font-bold">ĐÃ HOÀN THÀNH</span>
                <span className="text-lg font-mono font-black text-sky-600">
                  {Object.keys(soloUserAnswers).length} / 15
                </span>
              </div>
              {!soloSubmitted ? (
                <button
                  onClick={handleSubmitSolo}
                  disabled={Object.keys(soloUserAnswers).length === 0}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>Nộp Bài Thử Thách</span>
                </button>
              ) : (
                <button
                  onClick={handleResetSolo}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Làm Lại Lượt Mới</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Navigator Pill Grid */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-slate-500 font-mono font-bold px-2 shrink-0">
              Câu:
            </span>
            {SOLO_CHALLENGE_QUESTIONS.map((q, idx) => {
              const isAnswered = soloUserAnswers[q.id] !== undefined;
              const isCurrent = soloCurrentIndex === idx;
              const isCorrect = soloSubmitted && soloUserAnswers[q.id] === q.correctAnswer;
              const isWrong = soloSubmitted && soloUserAnswers[q.id] !== undefined && !isCorrect;

              return (
                <button
                  key={q.id}
                  onClick={() => setSoloCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
                    isCurrent
                      ? 'ring-2 ring-sky-500 ring-offset-2 scale-105'
                      : ''
                  } ${
                    soloSubmitted
                      ? isCorrect
                        ? 'bg-emerald-600 text-white'
                        : isWrong
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                      : isAnswered
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`Câu ${idx + 1}: ${q.topicTitle} (${q.type === 'multiple_choice' ? '4 Đáp án' : 'Đúng/Sai'})`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Result Banner if submitted */}
          {soloSubmitted && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-700/80 text-white space-y-3 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      KẾT QUẢ THỬ THÁCH ĐƠN: {soloScore} / 15 CÂU ĐÚNG
                    </h3>
                    <p className="text-xs text-emerald-300">
                      Tỉ lệ chính xác: {Math.round((soloScore / 15) * 100)}% · Đã cộng +{soloScore * 10 + (soloScore >= 12 ? 50 : 0)} XP vào tài khoản cá nhân!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetSolo}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow"
                  >
                    Làm lại bài kiểm tra
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Current Question Card */}
          <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sky-700 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200">
                  CÂU {currentSoloQuestion.questionNumber} / 15
                </span>
                <span className="text-slate-600 font-medium">
                  {currentSoloQuestion.topicTitle}
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  currentSoloQuestion.type === 'multiple_choice'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {currentSoloQuestion.type === 'multiple_choice'
                  ? 'Trắc nghiệm 4 đáp án'
                  : 'Câu hỏi Đúng / Sai'}
              </span>
            </div>

            {/* Question prompt */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentSoloQuestion.question}
            </h3>

            {/* MCQ Options (Questions 1 - 10) */}
            {currentSoloQuestion.type === 'multiple_choice' && (
              <div className="grid grid-cols-1 gap-3 pt-2">
                {currentSoloQuestion.options.map(opt => {
                  const isSelected = soloUserAnswers[currentSoloQuestion.id] === opt.id;
                  const isCorrect = currentSoloQuestion.correctAnswer === opt.id;

                  let optionStyle = 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50';

                  if (soloSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-300';
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50/40 text-slate-400';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-300 shadow-sm';
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={soloSubmitted}
                      onClick={() => handleSelectSoloMCQ(currentSoloQuestion.id, opt.id)}
                      className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold text-left transition-all flex items-start gap-3 ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold shrink-0 mt-0.5 text-xs ${
                        isSelected ? 'bg-sky-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                      }`}>
                        {opt.id}
                      </span>
                      <span className="leading-relaxed flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* True / False Options (Questions 11 - 15) */}
            {currentSoloQuestion.type === 'true_false' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { value: true, label: 'ĐÚNG', sub: 'Nhận định này hoàn toàn chính xác' },
                  { value: false, label: 'SAI', sub: 'Nhận định này chưa chính xác' },
                ].map(opt => {
                  const isSelected = soloUserAnswers[currentSoloQuestion.id] === opt.value;
                  const isCorrect = currentSoloQuestion.correctAnswer === opt.value;

                  let btnStyle = 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50';

                  if (soloSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-300';
                    } else {
                      btnStyle = 'border-slate-200 bg-slate-50/40 text-slate-400';
                    }
                  } else if (isSelected) {
                    btnStyle = opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300 shadow-sm'
                      : 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300 shadow-sm';
                  }

                  return (
                    <button
                      key={String(opt.value)}
                      disabled={soloSubmitted}
                      onClick={() => handleSelectSoloTF(currentSoloQuestion.id, opt.value)}
                      className={`p-5 rounded-2xl border text-center transition-all ${btnStyle}`}
                    >
                      <span className="text-lg font-black font-mono block mb-1">
                        {opt.label}
                      </span>
                      <span className="text-xs opacity-80 block">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Explanation card after submit */}
            {soloSubmitted && (
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  {soloUserAnswers[currentSoloQuestion.id] === currentSoloQuestion.correctAnswer ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Bạn đã trả lời chính xác!
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-rose-600" /> Chưa chính xác! Đáp án đúng là:{' '}
                      <strong className="underline ml-1">
                        {currentSoloQuestion.type === 'multiple_choice'
                          ? currentSoloQuestion.correctAnswer
                          : currentSoloQuestion.correctAnswer
                          ? 'ĐÚNG'
                          : 'SAI'}
                      </strong>
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed pl-4 border-l-2 border-sky-400">
                  {currentSoloQuestion.explanation}
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <button
                disabled={soloCurrentIndex === 0}
                onClick={() => setSoloCurrentIndex(prev => prev - 1)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Câu trước</span>
              </button>

              <span className="font-mono text-slate-500 font-bold">
                {soloCurrentIndex + 1} / 15
              </span>

              {soloCurrentIndex < SOLO_CHALLENGE_QUESTIONS.length - 1 ? (
                <button
                  onClick={() => setSoloCurrentIndex(prev => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                !soloSubmitted && (
                  <button
                    onClick={handleSubmitSolo}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Nộp bài</span>
                    <Send className="h-4 w-4" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. GIAO DIỆN PHẦN THI ĐẤU (LIVE BATTLE 1 VS 1 - GV CẤP MÃ PHÒNG) */}
      {/* =================================================================== */}
      {activeTab === 'live_battle' && (
        <div className="space-y-6">
          {/* LOBBY / PREPARATION STATE */}
          {!battleStarted && !battleFinished && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* TEACHER CODE PROVISION PANEL (lg:col-span-5) */}
              <div className="lg:col-span-5 rounded-3xl border border-rose-900/60 bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/30 p-6 space-y-5 shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Giáo Viên Cung Cấp Mã Phòng</h3>
                    <span className="text-[10px] text-rose-400 font-mono">Teacher Battle Room Manager</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Mã phòng thi đấu hiện tại (GV cấp cho 2 HS):
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono font-black text-xl tracking-widest text-cyan-300">
                      {roomCode}
                    </div>
                    <button
                      onClick={handleCopyRoomCode}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
                      title="Sao chép mã phòng"
                    >
                      {codeCopied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleGenerateNewRoomCode}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Đổi mã phòng ngẫu nhiên mới</span>
                    </button>
                  </div>
                </div>

                {/* Rules Recap */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-rose-900/40 text-xs space-y-2 text-slate-300">
                  <span className="text-[11px] font-bold text-rose-400 font-mono uppercase block">
                    📜 Thể Lệ Trận Đấu 1 vs 1:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-400 list-disc pl-4">
                    <li>
                      <strong className="text-white">Điểm ban đầu:</strong> Mỗi đội khởi đầu từ đúng{' '}
                      <span className="text-cyan-400 font-bold">0 điểm</span>.
                    </li>
                    <li>
                      <strong className="text-white">Thời gian:</strong> 20 giây cho mỗi câu hỏi.
                    </li>
                    <li>
                      <strong className="text-white">Quy tắc điểm:</strong>{' '}
                      <span className="text-amber-300 font-bold">Giảm 1 giây trừ 2 điểm</span>. Trả lời đúng ở giây thứ T nhận{' '}
                      <span className="text-emerald-400 font-bold">T × 2 điểm</span>.
                    </li>
                    <li>
                      <strong className="text-white">Hết giờ:</strong> Hết 20 giây không trả lời tính{' '}
                      <span className="text-rose-400 font-bold">0 điểm</span>.
                    </li>
                    <li>
                      <strong className="text-white">Nội dung câu hỏi:</strong> Ngẫu nhiên từ ngân hàng câu hỏi di truyền KHTN 9.
                    </li>
                  </ul>
                </div>
              </div>

              {/* 2 REPRESENTATIVE STUDENTS ENTRY (lg:col-span-7) */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="h-5 w-5 text-rose-400" />
                    <h3 className="text-lg font-black text-white">
                      2 Học Sinh Đại Diện Tham Gia Đấu Trực Tiếp
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    2 bạn đại diện sử dụng tài khoản cá nhân, nhập mã phòng do GV cung cấp để vào so tài đối kháng.
                  </p>
                </div>

                {/* Room code entry verification */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Học sinh nhập mã phòng đấu từ giáo viên:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputRoomCode}
                      onChange={e => setInputRoomCode(e.target.value.toUpperCase())}
                      placeholder={`Nhập mã phòng (Ví dụ: ${roomCode})`}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 uppercase tracking-widest focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setInputRoomCode(roomCode)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Dùng mã GV
                    </button>
                  </div>
                </div>

                {/* 2 Students Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student 1 (Blue) */}
                  <div className="p-4 rounded-2xl bg-cyan-950/40 border-2 border-cyan-600/80 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-cyan-600 text-white font-bold text-[10px]">
                        ĐẠI DIỆN ĐỘI XANH
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">0 điểm</span>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Học sinh 1 (Tài khoản cá nhân):
                      </label>
                      <input
                        type="text"
                        value={student1Name}
                        onChange={e => setStudent1Name(e.target.value)}
                        className="w-full bg-slate-900 border border-cyan-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                      />
                    </div>
                    <div className="text-[11px] text-cyan-300/80 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>{user?.email || 'Tài khoản cá nhân sẵn sàng'}</span>
                    </div>
                  </div>

                  {/* Student 2 (Red) */}
                  <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-600/80 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                        ĐẠI DIỆN ĐỘI ĐỎ
                      </span>
                      <span className="text-[10px] text-rose-400 font-mono">0 điểm</span>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Học sinh 2 (Tài khoản đối thủ):
                      </label>
                      <input
                        type="text"
                        value={student2Name}
                        onChange={e => setStudent2Name(e.target.value)}
                        className="w-full bg-slate-900 border border-rose-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                      />
                    </div>
                    <div className="text-[11px] text-rose-300/80 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>quan.tran@student.edu.vn</span>
                    </div>
                  </div>
                </div>

                {/* Big Launch Button */}
                <button
                  onClick={handleStartBattleMatch}
                  className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 shadow-xl shadow-rose-900/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Play className="h-5 w-5 fill-white" />
                  <span>BẮT ĐẦU TRẬN ĐẤU ĐỐI KHÁNG 1 VS 1</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE BATTLE RUNNING STATE */}
          {battleStarted && !battleFinished && currentBattleQ && (
            <div className="space-y-6">
              {/* TOP LIVE SCOREBOARD - STARTS STRICTLY AT 0 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Student 1 Score (Col 5) */}
                <div className="md:col-span-5 p-4 rounded-3xl bg-cyan-950/60 border-2 border-cyan-500 text-center shadow-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-cyan-600 text-white font-bold text-[10px]">
                      ĐỘI XANH
                    </span>
                    <span className="text-[11px] text-cyan-300 font-mono">
                      {student1Answer ? 'Đã bấm chọn' : 'Đang suy nghĩ...'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{student1Name}</h4>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-300">
                    {teamAScore} <span className="text-xs text-cyan-500 font-sans">điểm</span>
                  </div>
                  {student1EarnedPoints !== null && (
                    <span
                      className={`text-xs font-bold block ${
                        student1EarnedPoints > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {student1EarnedPoints > 0 ? `+${student1EarnedPoints} đ` : '0 đ'}
                    </span>
                  )}
                </div>

                {/* Central Timer & Points Ticker (Col 2) */}
                <div className="md:col-span-2 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-lg">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                    Thời Gian Còn
                  </span>
                  <div
                    className={`text-3xl font-black font-mono my-1 ${
                      battleTimeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                    }`}
                  >
                    {battleTimeLeft}s
                  </div>
                  <div className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 text-[10px] font-mono font-bold">
                    {battleTimeLeft > 0 ? `+${battleTimeLeft * 2} điểm nếu đúng` : 'Hết giờ (0đ)'}
                  </div>
                </div>

                {/* Student 2 Score (Col 5) */}
                <div className="md:col-span-5 p-4 rounded-3xl bg-rose-950/60 border-2 border-rose-500 text-center shadow-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-rose-300 font-mono">
                      {student2Answer ? 'Đã bấm chọn' : 'Đang suy nghĩ...'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                      ĐỘI ĐỎ
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{student2Name}</h4>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-rose-300">
                    {teamBScore} <span className="text-xs text-rose-500 font-sans">điểm</span>
                  </div>
                  {student2EarnedPoints !== null && (
                    <span
                      className={`text-xs font-bold block ${
                        student2EarnedPoints > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {student2EarnedPoints > 0 ? `+${student2EarnedPoints} đ` : '0 đ'}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar of current 20s time */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-1000 ${
                    battleTimeLeft > 10 ? 'bg-cyan-500' : battleTimeLeft > 5 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${(battleTimeLeft / 20) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-mono text-cyan-400 font-bold">
                    CÂU HỎI {battleCurrentQIndex + 1} / {battleQuestions.length} (Ngẫu nhiên)
                  </span>
                  <span className="text-slate-400 font-mono">Chủ đề: {currentBattleQ.topic}</span>
                </div>

                <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed text-center py-2">
                  {currentBattleQ.question}
                </h3>

                {/* 4 Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {currentBattleQ.options.map(opt => {
                    const isCorrect = isBattleTimeUp && opt.id === currentBattleQ.correct;

                    return (
                      <div
                        key={opt.id}
                        className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-start gap-3 ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-950/70 text-emerald-200 ring-2 ring-emerald-500'
                            : 'border-slate-800 bg-slate-950 text-slate-200'
                        }`}
                      >
                        <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold shrink-0">
                          {opt.id}
                        </span>
                        <span className="leading-relaxed flex-1 mt-0.5">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* DUAL PLAYER ANSWER PADS (Cho 2 học sinh đại diện bấm trực tiếp) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  {/* Student 1 Pad (Blue) */}
                  <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/60 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-300">Bàn Phím: {student1Name}</span>
                        <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                          Phím 1, 2, 3, 4
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {student1Answer ? `Đã chọn: ${student1Answer}` : 'Bấm chọn đáp án'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: 'A', hotkey: '1 / Q' },
                        { key: 'B', hotkey: '2 / W' },
                        { key: 'C', hotkey: '3 / E' },
                        { key: 'D', hotkey: '4 / R' },
                      ].map(item => (
                        <button
                          key={item.key}
                          disabled={student1Answer !== null || isBattleTimeUp}
                          onClick={() => handleStudent1SubmitAnswer(item.key as 'A' | 'B' | 'C' | 'D')}
                          className={`py-3 rounded-xl font-mono transition-all flex flex-col items-center justify-center ${
                            student1Answer === item.key
                              ? 'bg-cyan-500 text-slate-950 shadow-lg scale-105'
                              : 'bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed'
                          }`}
                        >
                          <span className="font-black text-sm">{item.key}</span>
                          <span className="text-[9px] opacity-70 font-sans mt-0.5">{item.hotkey}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Student 2 Pad (Red) */}
                  <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-rose-300">Bàn Phím: {student2Name}</span>
                        <span className="text-[10px] text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                          Phím 7, 8, 9, 0
                        </span>
                      </div>
                      <span className="text-[10px] text-rose-400 font-mono">
                        {student2Answer ? `Đã chọn: ${student2Answer}` : 'Bấm chọn đáp án'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: 'A', hotkey: '7 / U' },
                        { key: 'B', hotkey: '8 / I' },
                        { key: 'C', hotkey: '9 / O' },
                        { key: 'D', hotkey: '0 / P' },
                      ].map(item => (
                        <button
                          key={item.key}
                          disabled={student2Answer !== null || isBattleTimeUp}
                          onClick={() => handleStudent2SubmitAnswer(item.key as 'A' | 'B' | 'C' | 'D')}
                          className={`py-3 rounded-xl font-mono transition-all flex flex-col items-center justify-center ${
                            student2Answer === item.key
                              ? 'bg-rose-500 text-slate-950 shadow-lg scale-105'
                              : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 disabled:opacity-40 disabled:cursor-not-allowed'
                          }`}
                        >
                          <span className="font-black text-sm">{item.key}</span>
                          <span className="text-[9px] opacity-70 font-sans mt-0.5">{item.hotkey}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Round Result & Next Button */}
                {isBattleTimeUp && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-emerald-400 block">
                          Đáp án chính xác: {currentBattleQ.correct}
                        </span>
                        <p className="text-slate-400 mt-0.5">{currentBattleQ.explanation}</p>
                      </div>

                      <button
                        onClick={handleNextBattleQuestion}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-md shrink-0 flex items-center gap-1.5"
                      >
                        <span>
                          {battleCurrentQIndex < battleQuestions.length - 1
                            ? 'Câu hỏi tiếp theo'
                            : 'Xem kết quả chung cuộc'}
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FINAL BATTLE PODIUM & SUMMARY */}
          {battleFinished && (
            <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 text-center shadow-2xl animate-in zoom-in-95">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-2xl animate-bounce">
                <Trophy className="h-10 w-10" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  KẾT QUẢ THI ĐẤU ĐỐI KHÁNG TRỰC TIẾP
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {teamAScore > teamBScore
                    ? `🎉 ${student1Name} (ĐỘI XANH) CHIẾN THẮNG!`
                    : teamBScore > teamAScore
                    ? `🎉 ${student2Name} (ĐỘI ĐỎ) CHIẾN THẮNG!`
                    : '🤝 KẾT QUẢ HÒA CÂN TÀI CÂN SỨC!'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mã phòng đấu: <strong className="font-mono text-cyan-300">{roomCode}</strong>
                </p>
              </div>

              {/* Dual Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-5 rounded-2xl border text-center ${
                    teamAScore >= teamBScore
                      ? 'border-cyan-500 bg-cyan-950/60 ring-2 ring-cyan-500/40'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <span className="text-xs text-cyan-400 font-bold block truncate">
                    {student1Name}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1">
                    {teamAScore} <span className="text-xs text-cyan-400 font-sans">điểm</span>
                  </div>
                  {teamAScore > teamBScore && (
                    <span className="text-[10px] text-amber-300 font-bold mt-1 block">🏆 Quán Quân</span>
                  )}
                </div>

                <div
                  className={`p-5 rounded-2xl border text-center ${
                    teamBScore >= teamAScore
                      ? 'border-rose-500 bg-rose-950/60 ring-2 ring-rose-500/40'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <span className="text-xs text-rose-400 font-bold block truncate">
                    {student2Name}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1">
                    {teamBScore} <span className="text-xs text-rose-400 font-sans">điểm</span>
                  </div>
                  {teamBScore > teamAScore && (
                    <span className="text-[10px] text-amber-300 font-bold mt-1 block">🏆 Quán Quân</span>
                  )}
                </div>
              </div>

              {/* Round details table */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                <span className="text-[11px] font-mono font-bold text-slate-400 block uppercase">
                  Chi tiết từng vòng đấu:
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {roundHistory.map(r => (
                    <div
                      key={r.qIndex}
                      className="p-2 rounded-lg bg-slate-900 flex items-center justify-between text-slate-300"
                    >
                      <span>Vòng {r.qIndex} (Đáp án: {r.correctAnswer})</span>
                      <div className="flex gap-4">
                        <span className={r.s1Points > 0 ? 'text-cyan-400' : 'text-slate-500'}>
                          HS 1: +{r.s1Points}đ
                        </span>
                        <span className={r.s2Points > 0 ? 'text-rose-400' : 'text-slate-500'}>
                          HS 2: +{r.s2Points}đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleStartBattleMatch}
                  className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/40 flex items-center gap-2"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Tái đấu trận mới (Câu hỏi ngẫu nhiên mới)</span>
                </button>
                <button
                  onClick={handleRestartBattleLobby}
                  className="px-5 py-3 rounded-xl font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Về phòng chờ
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

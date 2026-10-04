import React, { useState } from 'react';
import { ENGLISH_BIO_TERMS } from '../../data/englishBioData';
import { useAuth } from '../../hooks/useAuth';
import { syncProgressToGoogleSheet } from '../../services/googleSheetService';
import { Sparkles, Volume2, Search, CheckCircle2, RotateCcw, Award, Play } from 'lucide-react';

export const EnglishBioPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'molecular' | 'cellular'>('all');
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');

  // Mini-game state (Section 13)
  const [gameActive, setGameActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);

  // Filtered terms for glossary
  const filteredTerms = ENGLISH_BIO_TERMS.filter(term => {
    const matchesSearch =
      term.englishTerm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.vietnameseMeaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const playPronunciation = (text: string, overrideGender?: 'female' | 'male') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      const activeGender = overrideGender || voiceGender;

      const voices = window.speechSynthesis.getVoices();
      if (activeGender === 'female') {
        utterance.pitch = 1.25; // Giọng nữ cao trong trẻo, dễ nghe
        utterance.rate = 0.88; // Tốc độ vừa vặn, rõ ràng âm tiết
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
        utterance.pitch = 0.92; // Giọng nam trầm ấm, rõ ràng
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
    }
  };

  // Mini-game questions based on English terms
  const currentTerm = ENGLISH_BIO_TERMS[currentQuestionIdx % ENGLISH_BIO_TERMS.length];
  // 4 choices (1 correct, 3 distractors)
  const choices = [
    currentTerm.vietnameseMeaning,
    ...ENGLISH_BIO_TERMS.filter(t => t.id !== currentTerm.id)
      .slice(0, 3)
      .map(t => t.vietnameseMeaning),
  ].sort();

  const handleSelectAnswer = (choice: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(choice);
    setIsAnswerChecked(true);

    if (choice === currentTerm.vietnameseMeaning) {
      setGameScore(prev => prev + 10);
    }
  };

  const handleNextGameQuestion = () => {
    if (currentQuestionIdx >= 4) {
      setIsGameFinished(true);
      if (user) {
        const studentCode = user.studentCode || (user.role === 'student' ? `HS-${(user.uid || '').replace(/[^0-9]/g, '').slice(-6).padStart(6, '0')}` : 'HS-GUEST');
        const correctCount = Math.round(gameScore / 10);
        syncProgressToGoogleSheet({
          timestamp: new Date().toISOString(),
          studentCode,
          fullName: user.fullName || user.username || 'Học sinh',
          username: user.username || 'hocsinh',
          classCode: 'BIO9',
          teacherCode: user.teacherCode || 'GV-ONLINE',
          topicId: 'english_bio_quiz',
          topicTitle: 'Thuật ngữ Sinh học tiếng Anh (English Biology)',
          activityType: 'english_bio',
          score: gameScore,
          maxScore: 50,
          correctCount,
          totalQuestions: 5,
          xpEarned: gameScore * 2,
        }).catch(err => console.warn('Could not auto-sync English Bio to Google Sheet:', err));
      }
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    }
  };

  const handleRestartGame = () => {
    setCurrentQuestionIdx(0);
    setGameScore(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsGameFinished(false);
    setGameActive(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Sparkles className="h-4 w-4" />
            <span>ENGLISH BIOLOGY GLOSSARY & MINI-GAMES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Thuật Ngữ Sinh Học Bằng Tiếng Anh (English Biology)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Xây dựng vốn từ vựng chuyên ngành chuẩn IPA giúp tự tin tra cứu tài liệu quốc tế
          </p>
        </div>

        <button
          onClick={() => {
            setGameActive(true);
            setIsGameFinished(false);
          }}
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 shadow-md shadow-amber-500/20 flex items-center gap-2 self-start sm:self-center transition-all"
        >
          <Play className="h-4 w-4 fill-slate-950" />
          <span>Chơi Mini-Game Ghép Thuật Ngữ</span>
        </button>
      </div>

      {/* Mini-Game Modal / In-Page Arena (Section 13) */}
      {gameActive && (
        <div className="rounded-3xl border border-amber-800/60 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                Mini-Game: English ↔ Vietnamese (Câu {currentQuestionIdx + 1}/5)
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Chọn nghĩa tiếng Việt chính xác của thuật ngữ:
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950 px-3 py-1 rounded-lg border border-amber-800/60">
                Điểm: {gameScore} XP
              </span>
              <button
                onClick={() => setGameActive(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Đóng game
              </button>
            </div>
          </div>

          {!isGameFinished ? (
            <div className="max-w-xl mx-auto space-y-6 text-center">
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-sans block">
                  {currentTerm.englishTerm}
                </span>
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400">
                  <span>{currentTerm.pronunciation}</span>
                  <button
                    onClick={() => playPronunciation(currentTerm.englishTerm)}
                    className="p-1 rounded bg-slate-900 text-cyan-400 hover:text-white"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(choice)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedOption === choice
                        ? choice === currentTerm.vietnameseMeaning
                          ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-md'
                          : 'border-rose-500 bg-rose-950/60 text-rose-300'
                        : isAnswerChecked && choice === currentTerm.vietnameseMeaning
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{choice}</span>
                  </button>
                ))}
              </div>

              {isAnswerChecked && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextGameQuestion}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500"
                  >
                    {currentQuestionIdx >= 4 ? 'Xem kết quả' : 'Câu tiếp theo ──→'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center space-y-4 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-xl">
                <Award className="h-10 w-10" />
              </div>
              <h4 className="text-xl font-black text-white">Xuất sắc hoàn thành!</h4>
              <p className="text-xs text-slate-300">
                Bạn đã đạt được <strong className="text-amber-400 font-mono text-sm">{gameScore} XP</strong> từ mini-game thuật ngữ English Biology!
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartGame}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Chơi lại</span>
                </button>
                <button
                  onClick={() => setGameActive(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo thuật ngữ Anh hoặc Việt..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs shrink-0 self-start sm:self-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              selectedCategory === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSelectedCategory('molecular')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              selectedCategory === 'molecular' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Di truyền Phân tử
          </button>
          <button
            onClick={() => setSelectedCategory('cellular')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              selectedCategory === 'cellular' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Di truyền Tế bào
          </button>
        </div>
      </div>

      {/* Glossary Term Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTerms.map(term => (
          <div
            key={term.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-4 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">{term.englishTerm}</h3>
                  <p className="text-xs font-semibold text-cyan-400 mt-0.5">{term.vietnameseMeaning}</p>
                </div>
                <button
                  onClick={() => playPronunciation(term.englishTerm)}
                  className="p-2 rounded-xl bg-slate-950 text-cyan-400 hover:text-white border border-slate-800 shrink-0"
                  title="Nghe phát âm IPA"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              <div className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded mt-2 inline-block">
                {term.pronunciation}
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                <strong className="text-slate-400 font-medium">Định nghĩa:</strong> {term.definitionVi}
              </p>

              <div className="mt-2 text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                &quot;{term.exampleSentence}&quot;
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
              {term.relatedTerms.map((r, i) => (
                <span key={i} className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">
                  #{r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

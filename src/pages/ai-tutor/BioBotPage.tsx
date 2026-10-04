import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bot, Send, Sparkles, MessageSquare, Lightbulb, CheckCircle2, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  mode?: 'ask' | 'guided';
  timestamp: string;
}

export const BioBotPage: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'ask' | 'guided'>('guided');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `Xin chào ${user?.fullName || 'bạn'}! Mình là Bio-Bot – trợ lý học tập Sinh học lớp 9 của bạn.\n\nHiện tại mình đang ở chế độ [HƯỚNG DẪN TƯ DUY] (Guided Learning). Thay vì đưa ngay đáp án, mình sẽ đặt các câu hỏi gợi mở để giúp bạn tự tìm ra bản chất của quy luật di truyền! Bạn muốn cùng thảo luận chủ đề nào hôm nay?`,
      mode: 'guided',
      timestamp: '14:00',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI Response calibrated for Grade 9 pedagogy
    setTimeout(() => {
      let botResponse = '';
      const lower = userMsg.text.toLowerCase();

      if (mode === 'guided') {
        // MODE 2: Guided learning - pedagogical steps (ask back, hint, check reasoning)
        if (lower.includes('nhân đôi') || lower.includes('replication') || lower.includes('tái bản')) {
          botResponse = `Câu hỏi rất hay về nhân đôi DNA! Trước khi xét toàn bộ quá trình, hãy cùng nhớ lại:\n\n1. Theo nguyên tắc bổ sung của Watson - Crick, nếu mạch khuôn có trình tự bazơ là A-T-G-C thì mạch mới sẽ lắp ráp các nucleotide tự do tương ứng như thế nào?\n2. Vì sao người ta gọi đây là nguyên tắc "bán bảo tồn" (semi-conservative)? Hãy thử giải nghĩa từ "bán" xem nào!`;
        } else if (lower.includes('nguyên phân') || lower.includes('mitosis')) {
          botResponse = `Về quá trình nguyên phân, bạn có nhớ điểm khác biệt quan trọng nhất ở Kỳ giữa (Metaphase) không?\n\n💡 Gợi ý: Hãy quan sát cách các nhiễm sắc thể kép tập trung trên mặt phẳng xích đạo của thoi vô sắc (thành 1 hàng hay 2 hàng)?`;
        } else if (lower.includes('đáp án') || lower.includes('kết quả')) {
          botResponse = `Tư duy của bạn rất sát rồi đấy! Cụ thể trong chương trình Sinh học 9: Một phân tử DNA mẹ tự nhân đôi k lần sẽ tạo ra 2ᵏ phân tử DNA con, trong đó luôn có đúng 2 phân tử DNA mang 1 mạch cũ của DNA mẹ.`;
        } else {
          botResponse = `Một câu hỏi thú vị! Để giải quyết vấn đề này theo phương pháp tư duy Sinh học 9:\n\n• Bước 1: Hãy xác định đối tượng đang ở cấp độ phân tử (DNA/RNA/Protein) hay cấp độ tế bào (Nhiễm sắc thể)?\n• Bước 2: Theo bạn hiện tượng này tuân theo quy luật nào đã học?`;
        }
      } else {
        // MODE 1: Direct knowledge explanation
        botResponse = `Dưới đây là phần giải đáp kiến thức chuẩn chương trình Sinh học lớp 9:\n\n${
          lower.includes('dna')
            ? 'DNA (Axit đêôxiribônuclêic) là chuỗi xoắn kép gồm 2 mạch polynucleotide. Đơn phân là nucleotide (A, T, G, C). Nguyên tắc bổ sung quy định: A liên kết với T bằng 2 liên kết H, G liên kết với C bằng 3 liên kết H.'
            : 'Vật chất di truyền được truyền đạt ổn định qua các thế hệ tế bào nhờ cơ chế nhân đôi DNA kết hợp cùng sự phân ly đồng đều của các nhiễm sắc thể trong nguyên phân.'
        }\n\nBạn có muốn mình giải thích thêm thuật ngữ English Biology tương ứng không?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: botResponse,
          mode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Bot className="h-4 w-4" />
            <span>AI TUTOR SINH HỌC 9</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Bio-Bot – Trợ Lý Học Tập Di Truyền Học
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hỗ trợ giải đáp thắc mắc, phân tích bản chất cơ chế sinh học theo chuẩn sư phạm THCS
          </p>
        </div>

        {/* Mode Selector (Section 18 & 43) */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs shrink-0 self-start sm:self-center">
          <button
            onClick={() => setMode('guided')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mode === 'guided'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Chế độ 2: Hướng dẫn tư duy</span>
          </button>
          <button
            onClick={() => setMode('ask')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mode === 'ask'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chế độ 1: Hỏi đáp trực tiếp</span>
          </button>
        </div>
      </div>

      {/* Mode Description Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
        <span>
          {mode === 'guided'
            ? 'Đang bật [Chế độ Hướng dẫn tư duy]: Bio-Bot sẽ không đưa đáp án ngay mà gợi ý từng bước để bạn tự suy luận.'
            : 'Đang bật [Chế độ Hỏi đáp trực tiếp]: Bio-Bot sẽ giải thích cụ thể định nghĩa và lý thuyết Sinh học 9.'}
        </span>
      </div>

      {/* Chat Window */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col h-[520px] shadow-2xl overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-5 w-5" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
                <div
                  className={`mt-1.5 text-[10px] font-mono ${
                    msg.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <Bot className="h-4 w-4 text-emerald-400 animate-spin" />
              <span>Bio-Bot đang suy nghĩ gợi ý sư phạm...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={
              mode === 'guided'
                ? 'Nhập câu hỏi hoặc suy luận của bạn (Ví dụ: Tại sao nhân đôi DNA cần nguyên tắc bổ sung?)...'
                : 'Đặt câu hỏi Sinh học 9 cần giải đáp...'
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/40"
          >
            <span>Gửi</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

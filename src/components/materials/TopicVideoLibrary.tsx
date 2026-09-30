import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Clock,
  User,
  Share2,
  HelpCircle,
  Info,
  Sparkles,
  X,
  AlertCircle,
  Eye,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Cloud,
} from 'lucide-react';
import {
  subscribeToTopicVideos,
  saveVideoToCloud,
  deleteVideoFromCloud
} from '../../firebase/videoService';

export interface TopicVideoItem {
  id: string;
  topicId: string;
  title: string;
  description: string;
  shareUrl: string;
  embedUrl: string;
  provider: 'gdrive' | 'youtube' | 'direct';
  durationMinutes: number;
  authorName: string;
  gradeLevel: string;
  createdAt: string;
  viewsCount: number;
  keyTimestamps?: { time: string; label: string }[];
  isCustom?: boolean;
}

export interface ParsedVideoInfo {
  provider: 'gdrive' | 'youtube' | 'direct';
  embedUrl: string;
  originalUrl: string;
  fileId?: string;
  isValid: boolean;
  errorMessage?: string;
}

export function parseVideoShareUrl(url: string): ParsedVideoInfo {
  const trimmed = url.trim();
  if (!trimmed) {
    return {
      provider: 'gdrive',
      embedUrl: '',
      originalUrl: '',
      isValid: false,
      errorMessage: 'Vui lòng nhập đường liên kết'
    };
  }

  // 1. Google Drive: /file/d/FILE_ID/
  const gdriveRegex1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match1 = trimmed.match(gdriveRegex1);
  if (match1 && match1[1]) {
    const fileId = match1[1];
    return {
      provider: 'gdrive',
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      originalUrl: trimmed,
      isValid: true
    };
  }

  // 2. Google Drive: id=FILE_ID
  const gdriveRegex2 = /drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/;
  const match2 = trimmed.match(gdriveRegex2);
  if (match2 && match2[1]) {
    const fileId = match2[1];
    return {
      provider: 'gdrive',
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      originalUrl: trimmed,
      isValid: true
    };
  }

  // 3. YouTube: watch?v=ID or youtu.be/ID or embed/ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      provider: 'youtube',
      fileId: ytId,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
      originalUrl: trimmed,
      isValid: true
    };
  }

  // 4. Direct video URL (.mp4, .webm)
  if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.endsWith('.ogg')) {
    return {
      provider: 'direct',
      embedUrl: trimmed,
      originalUrl: trimmed,
      isValid: true
    };
  }

  // 5. Fallback for generic drive.google.com links
  if (trimmed.includes('drive.google.com')) {
    const cleanPreview = trimmed.replace(/\/view(\?.*)?$/, '/preview');
    return {
      provider: 'gdrive',
      embedUrl: cleanPreview,
      originalUrl: trimmed,
      isValid: true
    };
  }

  return {
    provider: 'gdrive',
    embedUrl: trimmed,
    originalUrl: trimmed,
    isValid: false,
    errorMessage: 'Định dạng chưa chính xác. Vui lòng dán link chia sẻ từ Google Drive hoặc YouTube.'
  };
}

// Sample default educational videos for topics
const DEFAULT_TOPIC_VIDEOS: Record<string, TopicVideoItem[]> = {
  mitosis: [
    {
      id: 'vid_mitosis_1',
      topicId: 'mitosis',
      title: 'Bài Giảng 3D: Chi Tiết 4 Kỳ Phân Bào Nguyên Phân (Mitosis)',
      description: 'Quan sát sự biến đổi hình thái nhiễm sắc thể, thoi vô sắc và vòng co thắt phân chia tế bào chất ở tế bào nhân thực.',
      shareUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
      embedUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
      provider: 'gdrive',
      durationMinutes: 14,
      authorName: 'Thầy Lê Anh Tuấn (Tổ Sinh học 9)',
      gradeLevel: 'Sinh học 9 - 10 THPT',
      createdAt: '2026-09-24',
      viewsCount: 342,
      keyTimestamps: [
        { time: '01:30', label: 'Kỳ đầu: NST kép co ngắn, màng nhân biến mất' },
        { time: '04:45', label: 'Kỳ giữa: NST co xoắn cực đại, xếp 1 hàng xích đạo' },
        { time: '08:15', label: 'Kỳ sau: Tách tâm động, 2 NST đơn về 2 cực' },
        { time: '11:50', label: 'Kỳ cuối & Thắt eo phân chia tế bào chất' }
      ]
    },
    {
      id: 'vid_mitosis_2',
      topicId: 'mitosis',
      title: 'Thực Hành: Hướng Dẫn Làm Tiêu Bản & Quan Sát Nguyên Phân Tế Bào Rễ Hành',
      description: 'Kỹ thuật nhuộm axetocacmin và đếm số lượng NST dưới kính hiển vi quang học độ phóng đại 400x.',
      shareUrl: 'https://www.youtube.com/watch?v=L61UpC_0GvA',
      embedUrl: 'https://www.youtube.com/embed/L61UpC_0GvA?autoplay=1&rel=0',
      provider: 'youtube',
      durationMinutes: 10,
      authorName: 'Cô Nguyễn Thu Hương',
      gradeLevel: 'Thực hành Sinh học',
      createdAt: '2026-09-21',
      viewsCount: 218,
      keyTimestamps: [
        { time: '00:45', label: 'Xử lý mẫu rễ hành trong dung dịch cố định' },
        { time: '03:20', label: 'Nhuộm màu và ép phiến kính' },
        { time: '06:10', label: 'Nhận diện kỳ giữa và kỳ sau dưới kính hiển vi' }
      ]
    }
  ],
  meiosis: [
    {
      id: 'vid_meiosis_1',
      topicId: 'meiosis',
      title: 'Video Bài Giảng: Cơ Chế Tiếp Hợp & Trao Đổi Chéo Tại Chiasma (Kỳ Đầu I)',
      description: 'Minh họa cơ chế hoán vị gen giữa các chromatid phi chị em và hiện tượng phân ly độc lập của các cặp tương đồng ở Giảm phân I.',
      shareUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
      embedUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
      provider: 'gdrive',
      durationMinutes: 16,
      authorName: 'Thầy Lê Anh Tuấn (Tổ Sinh học 9)',
      gradeLevel: 'Sinh học 9 - 10 THPT',
      createdAt: '2026-09-25',
      viewsCount: 420,
      keyTimestamps: [
        { time: '02:10', label: 'Kỳ đầu I: Tiếp hợp thể tứ tử & Bắt chéo Chiasma' },
        { time: '06:30', label: 'Kỳ giữa I: Xếp 2 hàng song song tại xích đạo' },
        { time: '09:40', label: 'Kỳ sau I: Phân ly độc lập của nguyên chiếc NST kép' },
        { time: '13:15', label: 'Giảm phân II: Tách tâm động tạo 4 giao tử đơn bội n' }
      ]
    },
    {
      id: 'vid_meiosis_2',
      topicId: 'meiosis',
      title: 'So Sánh Trực Quan: Sự Khác Nhau Giữa Nguyên Phân & Giảm Phân',
      description: 'Tổng kết 3 điểm then chốt giúp học sinh không bao giờ nhầm lẫn trong bài kiểm tra và bài thi vào 10 chuyên.',
      shareUrl: 'https://www.youtube.com/watch?v=toWK0fE4b28',
      embedUrl: 'https://www.youtube.com/embed/toWK0fE4b28?autoplay=1&rel=0',
      provider: 'youtube',
      durationMinutes: 12,
      authorName: 'Cô Hoàng Minh Châu',
      gradeLevel: 'Chuyên đề Ôn thi',
      createdAt: '2026-09-26',
      viewsCount: 512,
      keyTimestamps: [
        { time: '01:15', label: 'Điểm khác 1: Số lần phân bào và số lần nhân đôi ADN' },
        { time: '04:50', label: 'Điểm khác 2: Cách xếp hàng ở Kỳ giữa (1 hàng vs 2 hàng)' },
        { time: '08:20', label: 'Điểm khác 3: Hành vi tâm động ở Kỳ sau' }
      ]
    }
  ],
  dna: [
    {
      id: 'vid_dna_1',
      topicId: 'dna',
      title: 'Mô Hình Không Gian 3D Cấu Trúc Xoắn Kép ADN (Watson - Crick)',
      description: 'Khám phá liên kết hydro giữa các cặp bazơ nitơ bổ sung (A-T: 2 lk, G-C: 3 lk) và chuỗi xoắn kép ngược chiều 5\' - 3\'.',
      shareUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
      embedUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
      provider: 'gdrive',
      durationMinutes: 15,
      authorName: 'Tổ Chuyên Môn Sinh Học',
      gradeLevel: 'Sinh học 9 - 10',
      createdAt: '2026-09-20',
      viewsCount: 610
    }
  ],
  dna_replication: [
    {
      id: 'vid_rep_1',
      topicId: 'dna_replication',
      title: 'Cơ Chế Nhân Đôi ADN: Hoạt Động Của Helicase, DNA Poly III & Đoạn Okazaki',
      description: 'Mô phỏng chi tiết chẽ ba tái bản, tổng hợp liên tục trên mạch dẫn đầu và gián đoạn trên mạch theo sau.',
      shareUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
      embedUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
      provider: 'gdrive',
      durationMinutes: 18,
      authorName: 'Thầy Lê Anh Tuấn',
      gradeLevel: 'Sinh học 9 - 12',
      createdAt: '2026-09-22',
      viewsCount: 475
    }
  ]
};

interface TopicVideoLibraryProps {
  topicId: string;
  topicTitle: string;
  userRole?: 'teacher' | 'student';
  userName?: string;
  onNavigateTo3D?: () => void;
}

export const TopicVideoLibrary: React.FC<TopicVideoLibraryProps> = ({
  topicId,
  topicTitle,
  userRole = 'teacher',
  userName = 'Giáo viên',
  onNavigateTo3D
}) => {
  const storageKey = `biogen9_topic_videos_${topicId}`;

  // Load custom videos from localStorage or fallback to defaults
  const [videos, setVideos] = useState<TopicVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved videos', e);
    }
    return DEFAULT_TOPIC_VIDEOS[topicId] || [
      {
        id: `vid_${topicId}_sample`,
        topicId: topicId,
        title: `Video Bài Giảng Điện Tử Trọng Tâm: ${topicTitle}`,
        description: `Video hướng dẫn kiến thức và phân tích quy luật trọng tâm bài ${topicTitle} của giáo viên trường.`,
        shareUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
        embedUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
        provider: 'gdrive',
        durationMinutes: 15,
        authorName: userName || 'Giáo viên Bộ môn Sinh học',
        gradeLevel: 'Sinh học THCS - THPT',
        createdAt: '2026-09-25',
        viewsCount: 180
      }
    ];
  });

  // Save to localStorage when videos change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(videos));
    } catch (e) {
      console.error('Error saving videos to localStorage', e);
    }
  }, [videos, storageKey]);

  // Cloud Database state
  const [cloudSynced, setCloudSynced] = useState<boolean>(true);
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);

  // Real-time synchronization with Firebase Firestore Cloud Database
  // When teacher adds a video, all students on any device / Vercel link receive it immediately
  useEffect(() => {
    const defaultList = DEFAULT_TOPIC_VIDEOS[topicId] || [];

    const unsubscribe = subscribeToTopicVideos(
      topicId,
      (cloudVideos) => {
        if (cloudVideos && cloudVideos.length > 0) {
          // Merge cloud videos with default presets (cloud videos take precedence)
          const cloudIds = new Set(cloudVideos.map(v => v.id));
          const merged = [
            ...cloudVideos,
            ...defaultList.filter(v => !cloudIds.has(v.id))
          ];
          setVideos(merged);
        }
        setCloudSynced(true);
      },
      (error) => {
        console.warn('Real-time cloud sync notice, fallback to local storage:', error);
        setCloudSynced(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [topicId]);

  // Active video player modal state
  const [activeVideo, setActiveVideo] = useState<TopicVideoItem | null>(null);

  // Add Video Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [inputDuration, setInputDuration] = useState('12');
  const [inputAuthor, setInputAuthor] = useState(userName || 'Thầy/Cô Giáo');
  const [inputTimestamps, setInputTimestamps] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedVideoInfo | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Role preview switcher for testing
  const [previewRole, setPreviewRole] = useState<'teacher' | 'student'>(userRole);

  // Re-parse URL whenever input changes
  useEffect(() => {
    if (!inputUrl.trim()) {
      setParsedPreview(null);
      return;
    }
    const res = parseVideoShareUrl(inputUrl);
    setParsedPreview(res);
  }, [inputUrl]);

  const handleOpenAddModal = () => {
    setInputUrl('');
    setInputTitle('');
    setInputDescription('');
    setInputDuration('15');
    setInputAuthor(userName || 'Giáo viên Bộ môn');
    setInputTimestamps('');
    setParsedPreview(null);
    setIsAddModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedPreview || !parsedPreview.isValid) {
      alert('Vui lòng nhập đường liên kết video Google Drive hoặc YouTube hợp lệ!');
      return;
    }
    if (!inputTitle.trim()) {
      alert('Vui lòng nhập tiêu đề cho video bài giảng!');
      return;
    }

    // Parse timestamps if provided (format: "02:15 - Nội dung")
    const timestamps = inputTimestamps
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split('-');
        if (parts.length >= 2) {
          return { time: parts[0].trim(), label: parts.slice(1).join('-').trim() };
        }
        return { time: '00:00', label: line };
      });

    const newVideo: TopicVideoItem = {
      id: 'vid_' + Date.now(),
      topicId,
      title: inputTitle.trim(),
      description: inputDescription.trim() || `Video bài giảng điện tử chủ đề ${topicTitle} chia sẻ từ Google Drive của giáo viên.`,
      shareUrl: parsedPreview.originalUrl,
      embedUrl: parsedPreview.embedUrl,
      provider: parsedPreview.provider,
      durationMinutes: parseInt(inputDuration, 10) || 12,
      authorName: inputAuthor.trim() || 'Giáo viên',
      gradeLevel: 'Sinh học 9 - 10',
      createdAt: new Date().toISOString().split('T')[0],
      viewsCount: 1,
      keyTimestamps: timestamps.length > 0 ? timestamps : undefined,
      isCustom: true
    };

    setIsSavingCloud(true);
    // 1. Optimistic local update
    setVideos(prev => [newVideo, ...prev.filter(v => v.id !== newVideo.id)]);
    setIsAddModalOpen(false);

    // 2. Persist to Firestore Cloud Database (syncs across all devices and Vercel)
    try {
      await saveVideoToCloud(newVideo);
      setCloudSynced(true);
    } catch (err) {
      console.warn('Saved locally, cloud sync pending:', err);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa video "${title}" khỏi Kho học liệu không?`)) {
      setVideos(prev => prev.filter(v => v.id !== id));
      if (activeVideo?.id === id) {
        setActiveVideo(null);
      }
      try {
        await deleteVideoFromCloud(id);
      } catch (err) {
        console.warn('Could not delete from cloud:', err);
      }
    }
  };

  const handleCopyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Video Library Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-sky-900/90 via-slate-900 to-indigo-950 border border-sky-700/50 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-sky-500 text-white shadow-md">
              <Video className="h-5 w-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-wide flex flex-wrap items-center gap-2">
              <span>Video Bài Giảng Điện Tử (Google Drive)</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {videos.length} VIDEO SẴN SÀNG
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đồng bộ Cloud Firestore
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Giáo viên lưu video trên Google Drive cá nhân và dán link chia sẻ vào kho. Học sinh nhấp để <strong>xem trực tiếp mượt mà ngay trên App</strong> mà không bị chuyển trang.
          </p>
        </div>

        {/* Action Buttons: Add Video & Role Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] font-bold">
            <span className="text-slate-400 px-2 hidden sm:inline">Xem với vai:</span>
            <button
              onClick={() => setPreviewRole('teacher')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                previewRole === 'teacher' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              👩‍🏫 Giáo viên
            </button>
            <button
              onClick={() => setPreviewRole('student')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                previewRole === 'student' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              👨‍🎓 Học sinh
            </button>
          </div>

          {previewRole === 'teacher' && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all hover:scale-102 active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>+ Thêm Video (Google Drive)</span>
            </button>
          )}
        </div>
      </div>

      {/* Guide Card for Teachers: How to share link from Google Drive */}
      {previewRole === 'teacher' && (
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl bg-sky-100 text-sky-700 mt-0.5">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <strong className="font-bold text-sky-900 block text-xs">
                3 Bước đưa video bài giảng từ Google Drive của thầy/cô vào kho:
              </strong>
              <span className="text-slate-600 text-[11px] leading-relaxed">
                <strong>Bước 1:</strong> Tải video lên Drive của thầy/cô ➔ <strong>Bước 2:</strong> Chuột phải vào video, chọn <em>Chia sẻ</em> ➔ Chọn quyền <em>&quot;Bất kỳ ai có đường liên kết đều có thể xem&quot;</em> ➔ <strong>Bước 3:</strong> Bấm <em>Sao chép liên kết</em> và dán vào nút <strong>&quot;+ Thêm Video&quot;</strong>.
              </span>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1.5 rounded-xl bg-white border border-sky-300 text-sky-700 font-bold hover:bg-sky-50 text-[11px] whitespace-nowrap shadow-xs"
          >
            Thử dán link ngay
          </button>
        </div>
      )}

      {/* Video Cards Grid */}
      {videos.length === 0 ? (
        <div className="p-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-3">
          <Video className="h-10 w-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">Chưa có video bài giảng nào cho chủ đề này</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thầy cô có thể tải video lên Google Drive và dán đường link chia sẻ để học sinh theo dõi bài học trực tiếp.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
          >
            + Thêm video đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="group rounded-3xl border border-slate-200 bg-white hover:border-sky-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden text-slate-800"
            >
              {/* Card Top: Thumbnail Mockup with Play Overlay */}
              <div
                onClick={() => setActiveVideo(vid)}
                className="relative aspect-video w-full bg-gradient-to-tr from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center cursor-pointer overflow-hidden group-hover:opacity-95 transition-opacity"
              >
                {/* Background decorative grid/glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0,transparent_70%)]" />

                {/* Big Center Play Icon */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-sky-500/90 group-hover:bg-sky-400 group-hover:scale-110 text-white flex items-center justify-center shadow-xl transition-all">
                  <Play className="h-7 w-7 fill-current ml-1" />
                </div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold z-10">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 text-sky-300 backdrop-blur-md border border-sky-400/30 flex items-center gap-1.5">
                    {vid.provider === 'gdrive' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Google Drive Video</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span>YouTube Video</span>
                      </>
                    )}
                  </span>

                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 text-white font-mono backdrop-blur-md flex items-center gap-1">
                    <Clock className="h-3 w-3 text-sky-400" />
                    <span>{vid.durationMinutes}:00</span>
                  </span>
                </div>

                {/* Bottom subtle bar */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-300 z-10">
                  <span className="font-mono bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {vid.gradeLevel}
                  </span>
                  <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    <Eye className="h-3 w-3" /> {vid.viewsCount} lượt xem
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h4
                    onClick={() => setActiveVideo(vid)}
                    className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 cursor-pointer"
                  >
                    {vid.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {vid.description}
                  </p>
                </div>

                {/* Author & Timestamps preview */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{vid.authorName}</span>
                  </div>
                  <span className="font-mono shrink-0">{vid.createdAt}</span>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveVideo(vid)}
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Xem trực tiếp trên App</span>
                  </button>

                  <a
                    href={vid.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-600 transition-colors"
                    title="Mở tab mới trên Google Drive"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  {previewRole === 'teacher' && (
                    <button
                      onClick={() => handleDeleteVideo(vid.id, vid.title)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Xóa video khỏi kho"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. IN-APP VIDEO PLAYER MODAL (XEM TRỰC TIẾP VIDEO TRÊN APP) */}
      {/* ============================================================== */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[94vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/90">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                  <Video className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-extrabold text-white truncate">
                    {activeVideo.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span>Đăng bởi: {activeVideo.authorName}</span>
                    <span>•</span>
                    <span className="text-sky-400 font-mono">
                      {activeVideo.provider === 'gdrive' ? 'Google Drive Player' : 'YouTube Player'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button & Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopyShareLink(activeVideo.shareUrl)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Sao chép link chia sẻ"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{copiedLink ? 'Đã chép' : 'Sao chép link'}</span>
                </button>

                <a
                  href={activeVideo.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Mở trong tab mới"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>

                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Đóng video"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded Video Player + Sidebar */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Left / Top: Responsive 16:9 Video Player Frame */}
              <div className="lg:col-span-8 bg-black flex items-center justify-center min-h-[320px] sm:min-h-[420px] relative">
                <iframe
                  src={activeVideo.embedUrl}
                  className="w-full h-full min-h-[320px] sm:min-h-[440px] border-0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={activeVideo.title}
                />
              </div>

              {/* Right: Notes, Timestamps & Interactive 3D Link */}
              <div className="lg:col-span-4 p-4 sm:p-5 bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-slate-800 space-y-4 text-xs">
                {/* Topic context */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-sky-400 font-mono uppercase tracking-wider block font-bold">
                    Chủ đề bài học
                  </span>
                  <p className="font-extrabold text-white text-xs">{topicTitle}</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {activeVideo.description}
                  </p>
                </div>

                {/* Key Timestamps (Mốc thời gian quan trọng) */}
                {activeVideo.keyTimestamps && activeVideo.keyTimestamps.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
                      <Clock className="h-3.5 w-3.5 text-sky-400" />
                      <span>Mốc thời gian trọng tâm:</span>
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeVideo.keyTimestamps.map((ts, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-300 hover:border-sky-500/40 transition-colors"
                        >
                          <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-md border border-sky-400/20 shrink-0">
                            {ts.time}
                          </span>
                          <span className="leading-snug">{ts.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link to 3D Simulation */}
                {onNavigateTo3D && (
                  <button
                    onClick={() => {
                      setActiveVideo(null);
                      onNavigateTo3D();
                    }}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold flex items-center justify-between shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Mở Mô Hình 3D Thực Hành</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {/* Drive Sharing Hint */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Lưu ý về quyền xem:</span>
                  </div>
                  <p className="leading-relaxed">
                    Video được phát trực tiếp từ Google Drive của giáo viên. Nếu video báo lỗi quyền truy cập, vui lòng liên hệ giáo viên mở quyền <em>&quot;Bất kỳ ai có liên kết đều có thể xem&quot;</em>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MODAL THÊM VIDEO MỚI TỪ GOOGLE DRIVE CHO GIÁO VIÊN */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[92vh] bg-white border border-sky-100 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col overflow-hidden text-slate-800 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-sky-50 text-sky-600">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Thêm Video Bài Giảng Từ Google Drive
                  </h4>
                  <p className="text-xs text-slate-500">
                    Chủ đề: <strong className="text-sky-600">{topicTitle}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVideo} className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
              {/* Step Guide Banner */}
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 space-y-2 text-sky-900">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1.5 text-[11px] text-sky-800">
                    <CheckCircle2 className="h-4 w-4 text-sky-600" />
                    Hướng dẫn lấy link chia sẻ trên Google Drive:
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Đồng bộ Cloud Online
                  </span>
                </div>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-slate-600">
                  <li>Tải video bài giảng lên Google Drive của thầy/cô (không tốn dung lượng máy chủ).</li>
                  <li>Chuột phải vào video ➔ chọn <strong>Chia sẻ (Share)</strong>.</li>
                  <li>Chuyển quyền truy cập chung thành: <strong>&quot;Bất kỳ ai có đường liên kết đều có thể xem&quot;</strong>.</li>
                  <li>Bấm <strong>Sao chép đường liên kết</strong> và dán vào ô dưới đây.</li>
                </ol>
                <div className="text-[10px] text-sky-700 bg-white/80 p-2 rounded-xl border border-sky-200/60 leading-relaxed">
                  💡 <strong>Lưu trữ đám mây tự động:</strong> Khi thầy/cô bấm lưu, link được đẩy lên Firebase Cloud Database. Toàn bộ học sinh mở trên link Vercel hay bất kỳ thiết bị nào đều thấy ngay lập tức mà không cần thầy/cô gửi link thủ công!
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1">
                <label className="block text-slate-800 font-bold">
                  Đường liên kết chia sẻ từ Google Drive (hoặc YouTube) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none font-mono text-xs"
                  required
                />
                {parsedPreview && (
                  <div className={`flex items-center gap-1.5 text-[11px] font-bold ${parsedPreview.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {parsedPreview.isValid ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Đã nhận diện: {parsedPreview.provider === 'gdrive' ? 'Video Google Drive hợp lệ' : 'Video YouTube hợp lệ'}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{parsedPreview.errorMessage}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="block text-slate-800 font-bold">
                  Tiêu đề video bài giảng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={e => setInputTitle(e.target.value)}
                  placeholder="Ví dụ: Bài giảng chi tiết các kỳ nguyên phân & giảm phân"
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none font-medium text-xs"
                  required
                />
              </div>

              {/* Two columns: Duration & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-800 font-bold">Thời lượng ước tính (phút)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={inputDuration}
                    onChange={e => setInputDuration(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-800 font-bold">Giáo viên phụ trách / Tổ bộ môn</label>
                  <input
                    type="text"
                    value={inputAuthor}
                    onChange={e => setInputAuthor(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="block text-slate-800 font-bold">
                  Mô tả bài giảng &amp; Lưu ý cho học sinh
                </label>
                <textarea
                  rows={2}
                  value={inputDescription}
                  onChange={e => setInputDescription(e.target.value)}
                  placeholder="Học sinh chú ý theo dõi giai đoạn phân ly NST ở phút thứ 05:00..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none text-xs resize-none"
                />
              </div>

              {/* Key Timestamps (Optional) */}
              <div className="space-y-1">
                <label className="block text-slate-800 font-bold">
                  Các mốc thời gian quan trọng (tùy chọn - mỗi dòng một mốc dạng: <code>02:30 - Tên mốc</code>)
                </label>
                <textarea
                  rows={2}
                  value={inputTimestamps}
                  onChange={e => setInputTimestamps(e.target.value)}
                  placeholder="01:15 - Kỳ đầu&#10;04:30 - Kỳ giữa&#10;08:00 - Kỳ sau"
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none font-mono text-xs resize-none"
                />
              </div>

              {/* Live Preview If URL is valid */}
              {parsedPreview && parsedPreview.isValid && (
                <div className="p-3 rounded-2xl bg-slate-950 text-white space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-sky-400">
                    <span>Xem thử trình phát nhúng:</span>
                    <span>{parsedPreview.provider === 'gdrive' ? 'Google Drive Embed' : 'YouTube Embed'}</span>
                  </div>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={parsedPreview.embedUrl}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      title="Xem thử video"
                    />
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900 text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!parsedPreview || !parsedPreview.isValid || isSavingCloud}
                  className="px-5 py-2 font-extrabold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-sky-600/20 text-xs transition-all flex items-center gap-1.5"
                >
                  {isSavingCloud ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu lên Cloud...</span>
                    </>
                  ) : (
                    <span>Lưu video lên Cloud (Đồng bộ mọi thiết bị)</span>
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

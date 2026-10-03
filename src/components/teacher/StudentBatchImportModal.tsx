import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ClassRoom, StudentAccount } from '../../types/auth';
import {
  parseRawStudentList,
  exportAccountsToCsv,
  UsernamePattern,
  PasswordPattern,
  generateStudentUsername,
  generateStudentPassword,
} from '../../utils/accountGenerator';
import {
  X,
  Upload,
  ClipboardList,
  Sparkles,
  KeyRound,
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Users,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
  onSuccess?: () => void;
}

const SAMPLE_STUDENTS_TEXT = `1. Nguyễn Minh Anh
2. Trần Bảo Nam
3. Lê Thu Trang
4. Hoàng Gia Bảo
5. Phạm Thùy Linh
6. Vũ Tuấn Kiệt
7. Đặng Thảo My
8. Bùi Quang Huy
9. Đỗ Ngọc Diệp
10. Ngô Khánh An`;

export const StudentBatchImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultClassId,
  onSuccess,
}) => {
  const { user, classes, batchImportStudents } = useAuth();

  // Only classes belonging to this teacher
  const teacherClasses = classes.filter(c =>
    c.teacherId === user?.uid ||
    (user?.teacherCode && c.teacherCode === user.teacherCode) ||
    (user?.classIds && user.classIds.includes(c.id))
  );
  const availableClasses = teacherClasses.length > 0 ? teacherClasses : classes;

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (defaultClassId && availableClasses.some(c => c.id === defaultClassId)) return defaultClassId;
    return availableClasses[0]?.id || '';
  });

  const [inputMethod, setInputMethod] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [usernamePattern, setUsernamePattern] = useState<UsernamePattern>('name_class');
  const [passwordPattern, setPasswordPattern] = useState<PasswordPattern>('secure_random');
  const [fixedPassword, setFixedPassword] = useState('Bio9@2026');

  // Result state after batch creation
  const [createdAccounts, setCreatedAccounts] = useState<StudentAccount[] | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Parse raw text into students list
  const parsedStudents = useMemo(() => {
    return parseRawStudentList(rawText);
  }, [rawText]);

  // Preview generated credentials for the first 50 students
  const previewList = useMemo(() => {
    if (!targetClass || parsedStudents.length === 0) return [];
    return parsedStudents.map((st, idx) => {
      const username = generateStudentUsername(
        st.fullName,
        targetClass.name,
        idx + 1,
        usernamePattern
      );
      const password = generateStudentPassword(passwordPattern, fixedPassword);
      return {
        stt: idx + 1,
        fullName: st.fullName,
        username,
        password,
        email: st.email,
        notes: st.notes,
      };
    });
  }, [parsedStudents, targetClass, usernamePattern, passwordPattern, fixedPassword]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        setRawText(text);
        setInputMethod('paste'); // Switch to view parsed content
      }
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc tệp tin. Vui lòng thử lại hoặc dán văn bản trực tiếp.');
    };
    reader.readAsText(file);
  };

  const handleFillSample = () => {
    setRawText(SAMPLE_STUDENTS_TEXT);
    setErrorMsg(null);
  };

  const handleDownloadSampleCsv = () => {
    const sampleAccounts = [
      { stt: 1, fullName: 'Nguyễn Minh Anh', username: 'anh.nm.9a1', password: 'Bio@1234', className: '9A1', classCode: 'BIO9A1' },
      { stt: 2, fullName: 'Trần Bảo Nam', username: 'nam.tb.9a1', password: 'Bio@5678', className: '9A1', classCode: 'BIO9A1' },
      { stt: 3, fullName: 'Lê Thu Trang', username: 'trang.lt.9a1', password: 'Bio@9012', className: '9A1', classCode: 'BIO9A1' },
    ];
    exportAccountsToCsv(sampleAccounts, 'Mau_nhap_danh_sach_hoc_sinh.csv');
  };

  const handleExecuteImport = () => {
    if (!selectedClassId) {
      setErrorMsg('Vui lòng chọn lớp học để thêm học sinh.');
      return;
    }
    if (parsedStudents.length === 0) {
      setErrorMsg('Danh sách học sinh trống. Vui lòng nhập hoặc dán danh sách tên học sinh.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = batchImportStudents(selectedClassId, parsedStudents, {
        usernamePattern,
        passwordPattern,
        fixedPassword,
      });

      if (res.success && res.createdAccounts.length > 0) {
        setCreatedAccounts(res.createdAccounts);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Có lỗi xảy ra khi tạo tài khoản.');
      }
    } catch {
      setErrorMsg('Đã xảy ra lỗi trong quá trình tạo tài khoản hàng loạt.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = () => {
    if (!createdAccounts || !targetClass) return;
    const formatted = createdAccounts.map((a, i) => ({
      stt: i + 1,
      fullName: a.fullName,
      username: a.username,
      password: a.password,
      className: targetClass.name,
      classCode: targetClass.code,
      email: a.email,
    }));
    exportAccountsToCsv(formatted, `Danh_sach_tai_khoan_lop_${targetClass.name.replace(/\s+/g, '_')}.csv`);
  };

  const handleCopyZaloList = () => {
    if (!createdAccounts || !targetClass) return;
    let text = `DANH SÁCH TÀI KHOẢN HỌC TẬP BIOGEN 9 - ${targetClass.name.toUpperCase()}\n`;
    text += `Mã vào lớp: ${targetClass.code}\n`;
    text += `Website đăng nhập: https://ais-pre-3cvsr5f546e7qbjzfjivfz-565225755807.asia-southeast1.run.app\n`;
    text += `----------------------------------------\n`;
    createdAccounts.forEach((acc, i) => {
      text += `${i + 1}. ${acc.fullName}\n   - Tên đăng nhập: ${acc.username}\n   - Mật khẩu: ${acc.password}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handlePrintSlips = () => {
    if (!createdAccounts || !targetClass) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép popup để mở phiếu in tài khoản.');
      return;
    }

    const cardsHtml = createdAccounts
      .map(
        (acc, i) => `
        <div class="card">
          <div class="card-header">
            <span class="badge">BIOGEN 9 · THCS</span>
            <span class="class-tag">${targetClass.name}</span>
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
              <span class="cred-label">Mã lớp học:</span>
              <span class="cred-val">${targetClass.code}</span>
            </div>
          </div>
          <div class="card-footer">
            <span>Học tập &amp; làm bài tại: BIOGEN 9</span>
          </div>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phiếu Cấp Tài Khoản Học Sinh - ${targetClass.name}</title>
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
            🖨️ In trang này (Cắt gửi học sinh)
          </button>
        </div>
        <div class="title">
          <h2>THẺ TÀI KHOẢN HỌC TẬP SINH HỌC 9 - LỚP ${targetClass.name.toUpperCase()}</h2>
          <p>Mã tham gia lớp: <strong>${targetClass.code}</strong> · Năm học 2026–2027</p>
        </div>
        <div class="grid">${cardsHtml}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Tải Lên Danh Sách &amp; Tự Động Tạo TK/MK Học Sinh</h2>
              <p className="text-xs text-purple-100">
                Tự động sinh Tên đăng nhập chuẩn hóa, cấp Mật khẩu ngẫu nhiên &amp; xuất file bàn giao
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* SUCCESS SCREEN */}
          {createdAccounts ? (
            <div className="space-y-6 py-2">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950">
                    Khởi tạo Thành Công {createdAccounts.length} Tài Khoản Học Sinh!
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Học sinh lớp <strong>{targetClass?.name}</strong> (Mã lớp:{' '}
                    <span className="font-mono font-bold text-emerald-950">{targetClass?.code}</span>) đã được cập
                    nhật vào hệ thống. Các em có thể đăng nhập ngay bằng Tên đăng nhập và Mật khẩu được cấp.
                  </p>
                </div>
              </div>

              {/* Action Cards for Distribution */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleExportCsv}
                  className="p-4 rounded-2xl border-2 border-emerald-200 bg-white hover:bg-emerald-50/50 hover:border-emerald-400 text-left transition-all group flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Download className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
                      Excel / CSV
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">1. Tải File Excel / CSV</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bảng mã UTF-8 đầy đủ dấu tiếng Việt, lưu trữ trên máy tính
                    </p>
                  </div>
                </button>

                <button
                  onClick={handlePrintSlips}
                  className="p-4 rounded-2xl border-2 border-sky-200 bg-white hover:bg-sky-50/50 hover:border-sky-400 text-left transition-all group flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-700 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      <Printer className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase bg-sky-100 px-2 py-0.5 rounded-full">
                      In thẻ học sinh
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">2. In Phiếu Cấp Tài Khoản</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mẫu thẻ cắt sẵn từng học sinh, gửi phụ huynh hoặc phát tại lớp
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleCopyZaloList}
                  className="p-4 rounded-2xl border-2 border-purple-200 bg-white hover:bg-purple-50/50 hover:border-purple-400 text-left transition-all group flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-700 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      {copiedText ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-100 px-2 py-0.5 rounded-full">
                      {copiedText ? 'Đã chép!' : 'Copy Zalo'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">3. Sao Chép Gửi Zalo</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Định dạng sẵn văn bản, dán thẳng vào nhóm lớp Zalo
                    </p>
                  </div>
                </button>
              </div>

              {/* Roster of Created Accounts */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Danh Sách {createdAccounts.length} Tài Khoản Vừa Tạo
                  </span>
                  <span className="text-xs font-mono text-slate-500">Lớp: {targetClass?.name}</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {createdAccounts.map((acc, idx) => (
                    <div key={acc.uid} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400 font-bold text-[11px] w-6">#{idx + 1}</span>
                        <div>
                          <p className="font-bold text-slate-900">{acc.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">@{acc.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-mono text-xs text-purple-700 font-bold">
                          MK: {acc.password}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setCreatedAccounts(null);
                    setRawText('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                >
                  Tải thêm danh sách khác
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                >
                  Hoàn tất &amp; Đóng
                </button>
              </div>
            </div>
          ) : (
            /* INPUT & CONFIGURATION FORM */
            <div className="space-y-6">
              {/* Step 1: Target Class */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-purple-950 mb-1">
                    1. Chọn Lớp Học Nhận Danh Sách:
                  </label>
                  <p className="text-[11px] text-purple-700">
                    Học sinh sẽ được gán vào lớp này và sinh tên đăng nhập theo mã lớp.
                  </p>
                </div>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="rounded-xl border border-purple-300 bg-white px-3 py-2 text-xs font-bold text-purple-950 focus:outline-none focus:border-purple-600 shadow-xs"
                >
                  {availableClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) - Hiện có {c.studentCount} HS
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Input Method */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">2. Nhập Danh Sách Học Sinh:</span>
                    <span className="text-xs text-slate-500">({parsedStudents.length} học sinh đã nhận dạng)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFillSample}
                      className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Điền mẫu 10 học sinh</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadSampleCsv}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>File mẫu CSV</span>
                    </button>
                  </div>
                </div>

                {/* Input Method Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setInputMethod('paste')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                      inputMethod === 'paste'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span>Dán danh sách văn bản / Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMethod('file')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                      inputMethod === 'file'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Tải tệp tin (.txt, .csv)</span>
                  </button>
                </div>

                {inputMethod === 'paste' ? (
                  <div>
                    <textarea
                      rows={6}
                      value={rawText}
                      onChange={e => setRawText(e.target.value)}
                      placeholder="Dán danh sách học sinh tại đây (mỗi học sinh một dòng hoặc copy cả cột từ Excel)...&#10;Ví dụ:&#10;1. Nguyễn Minh Anh&#10;2. Trần Bảo Nam&#10;3. Lê Thu Trang"
                      className="w-full rounded-2xl border border-slate-300 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>💡 Hỗ trợ tự động lọc bỏ số thứ tự: &quot;1. &quot;, &quot;01 - &quot;, &quot;1/ &quot;.</span>
                      {rawText && (
                        <button
                          type="button"
                          onClick={() => setRawText('')}
                          className="text-rose-500 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Xóa trắng</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/30 p-8 text-center">
                    <Upload className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800">Kéo thả tệp CSV / Text hoặc chọn tệp từ máy tính</p>
                    <p className="text-[11px] text-slate-500 mt-1 mb-4">Hỗ trợ tệp định dạng .csv hoặc .txt mã hóa UTF-8</p>
                    <label className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs">
                      <span>Chọn tệp tin...</span>
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Step 3: Account Generation Rules */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900">
                  3. Cấu Hình Quy Tắc Tự Động Sinh Tên Đăng Nhập &amp; Mật Khẩu:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username Pattern */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Định dạng Tên đăng nhập (Username):
                    </label>
                    <div className="space-y-2 text-xs">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="usernamePattern"
                          value="name_class"
                          checked={usernamePattern === 'name_class'}
                          onChange={() => setUsernamePattern('name_class')}
                          className="mt-0.5 text-purple-600 focus:ring-0"
                        />
                        <div>
                          <span className="font-semibold text-slate-800">
                            [Tên].[Họ lót].[Lớp] (Khuyên dùng)
                          </span>
                          <span className="block text-[11px] text-slate-500 font-mono">
                            Ví dụ: anh.nm.9a1, nam.tb.9a1
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="usernamePattern"
                          value="full_name"
                          checked={usernamePattern === 'full_name'}
                          onChange={() => setUsernamePattern('full_name')}
                          className="mt-0.5 text-purple-600 focus:ring-0"
                        />
                        <div>
                          <span className="font-semibold text-slate-800">
                            [Họ và tên][Lớp] liền nhau
                          </span>
                          <span className="block text-[11px] text-slate-500 font-mono">
                            Ví dụ: nguyenminhanh9a1
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="usernamePattern"
                          value="class_index"
                          checked={usernamePattern === 'class_index'}
                          onChange={() => setUsernamePattern('class_index')}
                          className="mt-0.5 text-purple-600 focus:ring-0"
                        />
                        <div>
                          <span className="font-semibold text-slate-800">
                            [Lớp]_[Số thứ tự STT]
                          </span>
                          <span className="block text-[11px] text-slate-500 font-mono">
                            Ví dụ: 9a1_hs01, 9a1_hs02
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Password Pattern */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Định dạng Mật khẩu khởi tạo:
                    </label>
                    <div className="space-y-2 text-xs">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="passwordPattern"
                          value="secure_random"
                          checked={passwordPattern === 'secure_random'}
                          onChange={() => setPasswordPattern('secure_random')}
                          className="mt-0.5 text-purple-600 focus:ring-0"
                        />
                        <div>
                          <span className="font-semibold text-slate-800">
                            Ngẫu nhiên bảo mật cao (An toàn nhất)
                          </span>
                          <span className="block text-[11px] text-slate-500 font-mono">
                            Ví dụ: Bio@8492, Gen#4173
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="passwordPattern"
                          value="pin6"
                          checked={passwordPattern === 'pin6'}
                          onChange={() => setPasswordPattern('pin6')}
                          className="mt-0.5 text-purple-600 focus:ring-0"
                        />
                        <div>
                          <span className="font-semibold text-slate-800">Mã PIN 6 chữ số (Dễ nhớ)</span>
                          <span className="block text-[11px] text-slate-500 font-mono">Ví dụ: 682914, 730192</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="passwordPattern"
                          value="fixed"
                          checked={passwordPattern === 'fixed'}
                          onChange={() => setPasswordPattern('fixed')}
                          className="mt-0.5 text-purple-600 focus:ring-0"
                        />
                        <div>
                          <span className="font-semibold text-slate-800">Mật khẩu chung cả lớp</span>
                        </div>
                      </label>

                      {passwordPattern === 'fixed' && (
                        <div className="pl-6 pt-1">
                          <input
                            type="text"
                            value={fixedPassword}
                            onChange={e => setFixedPassword(e.target.value)}
                            placeholder="Nhập mật khẩu chung (ví dụ: Bio9@2026)"
                            className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Live Preview Table */}
              {previewList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      4. Xem Trước Tài Khoản &amp; Mật Khẩu Sẽ Được Tạo:
                    </span>
                    <span className="text-[11px] text-purple-700 font-bold">
                      Tổng số: {previewList.length} tài khoản
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 grid grid-cols-12 text-[11px] font-bold text-slate-600">
                      <span className="col-span-1 text-center">STT</span>
                      <span className="col-span-4">Họ và tên</span>
                      <span className="col-span-4">Tên đăng nhập dự kiến</span>
                      <span className="col-span-3 text-right">Mật khẩu dự kiến</span>
                    </div>

                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs">
                      {previewList.slice(0, 30).map(item => (
                        <div key={item.stt} className="px-3 py-2 grid grid-cols-12 items-center hover:bg-purple-50/30">
                          <span className="col-span-1 text-center font-mono text-slate-400 font-bold text-[11px]">
                            {item.stt}
                          </span>
                          <span className="col-span-4 font-bold text-slate-900 truncate">
                            {item.fullName}
                          </span>
                          <span className="col-span-4 font-mono text-purple-700 font-bold truncate">
                            {item.username}
                          </span>
                          <span className="col-span-3 text-right font-mono text-slate-700 font-semibold text-[11px]">
                            {item.password}
                          </span>
                        </div>
                      ))}
                    </div>

                    {previewList.length > 30 && (
                      <div className="bg-slate-50 px-3 py-1.5 text-center text-[11px] text-slate-500 border-t border-slate-200">
                        ... và {previewList.length - 30} học sinh khác nữa
                      </div>
                    )}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={isProcessing || parsedStudents.length === 0}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span>Đang sinh tài khoản &amp; mật khẩu...</span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>
                        Xác Nhận Tạo {parsedStudents.length > 0 ? `${parsedStudents.length} ` : ''}Tài Khoản &amp; Mật Khẩu
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

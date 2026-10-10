/**
 * Service to synchronize teacher, class, student, and learning progress data
 * to the Teacher's Google Sheet via Google Apps Script Web App.
 *
 * Web App URL: https://script.google.com/macros/s/AKfycbxKAUbXXYwuY4BP9GIV8qU5LGXYBlRLH-Uk5fmTnqNEv9En7imMqn4kElY9Wxe8D5Kl/exec
 */

export const DEFAULT_GOOGLE_SHEET_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbxKAUbXXYwuY4BP9GIV8qU5LGXYBlRLH-Uk5fmTnqNEv9En7imMqn4kElY9Wxe8D5Kl/exec';

const WEBAPP_URL_STORAGE_KEY = 'biogen9_custom_gas_webhook_url';

export function getGoogleSheetWebhookUrl(): string {
  try {
    const custom = localStorage.getItem(WEBAPP_URL_STORAGE_KEY);
    if (custom && custom.trim().startsWith('http')) return custom.trim();
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_GOOGLE_SHEET_WEBAPP_URL;
}

export function setGoogleSheetWebhookUrl(url: string): void {
  try {
    if (!url || !url.trim() || url.trim() === DEFAULT_GOOGLE_SHEET_WEBAPP_URL) {
      localStorage.removeItem(WEBAPP_URL_STORAGE_KEY);
    } else {
      localStorage.setItem(WEBAPP_URL_STORAGE_KEY, url.trim());
    }
  } catch (e) {
    console.warn(e);
  }
}

export const GOOGLE_SHEET_WEBAPP_URL = DEFAULT_GOOGLE_SHEET_WEBAPP_URL;

export interface TeacherSheetPayload {
  teacherCode: string;
  fullName: string;
  username: string;
  email?: string;
  schoolName?: string;
  registeredAt: string;
}

export interface ClassSheetPayload {
  classId: string;
  classCode: string;
  className: string;
  subject: string;
  schoolYear: string;
  teacherCode: string;
  teacherName: string;
  studentCount: number;
  createdAt: string;
}

export interface StudentSheetPayload {
  studentCode: string;
  fullName: string;
  username: string;
  password?: string;
  classCode: string;
  className: string;
  teacherCode: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface LearningProgressSheetPayload {
  timestamp: string;
  studentCode: string;
  fullName: string;
  username: string;
  classCode: string;
  teacherCode: string;
  topicId: string;
  topicTitle: string;
  activityType: 'practice_10_questions' | 'challenge_battle' | 'model_exploration' | 'english_bio';
  score: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
}

export interface KnowledgeSheetPayload {
  teacherCode: string;
  teacherName: string;
  topicId: string;
  topicTitle: string;
  sectionCount: number;
  summary: string;
  updatedAt: string;
}

export interface QuestionSheetPayload {
  teacherCode: string;
  teacherName: string;
  questionId: string;
  topicId: string;
  type: string;
  question: string;
  correctAnswer: string;
  difficulty: string;
  status: string;
  updatedAt: string;
}

// In-memory sync log history for teacher dashboard
export interface SyncLogItem {
  id: string;
  timestamp: string;
  action: string;
  sheet: string;
  description: string;
  success: boolean;
}

const syncHistory: SyncLogItem[] = [];
const syncListeners: Array<() => void> = [];

export function getSyncHistory(): SyncLogItem[] {
  return [...syncHistory];
}

export function subscribeToSyncLogs(listener: () => void): () => void {
  syncListeners.push(listener);
  return () => {
    const idx = syncListeners.indexOf(listener);
    if (idx >= 0) syncListeners.splice(idx, 1);
  };
}

function recordSyncLog(action: string, sheet: string, description: string, success: boolean) {
  syncHistory.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    action,
    sheet,
    description,
    success,
  });
  if (syncHistory.length > 50) syncHistory.pop();
  syncListeners.forEach(fn => {
    try { fn(); } catch (e) { console.warn(e); }
  });
}

/**
 * Universal sender to Google Apps Script.
 * Uses mode: 'no-cors' with text/plain payload to bypass browser preflight restrictions.
 */
async function sendToGoogleSheet(payload: Record<string, unknown>, description = ''): Promise<boolean> {
  const action = String(payload.action || 'sync');
  const sheet = String(payload.sheet || 'Default');
  try {
    const bodyStr = JSON.stringify(payload);

    const endpoint = getGoogleSheetWebhookUrl();
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: bodyStr,
    });

    recordSyncLog(action, sheet, description || `Đồng bộ tới Sheet [${sheet}]`, true);
    console.info('[GoogleSheetSync] Sent payload successfully to Google Sheet:', payload.action);
    return true;
  } catch (err) {
    recordSyncLog(action, sheet, `Lỗi gửi tới Sheet [${sheet}]`, false);
    console.warn('[GoogleSheetSync] Could not reach Google Sheet endpoint:', err);
    return false;
  }
}

/**
 * Record Teacher Registration to Sheet "GiaoVien"
 */
export async function syncTeacherToGoogleSheet(data: TeacherSheetPayload): Promise<boolean> {
  return sendToGoogleSheet({
    action: 'registerTeacher',
    sheet: 'GiaoVien',
    data: {
      teacherCode: data.teacherCode,
      fullName: data.fullName,
      username: data.username,
      email: data.email || '',
      schoolName: data.schoolName || '',
      registeredAt: data.registeredAt,
    },
  });
}

/**
 * Record Class Creation to Sheet "LopHoc"
 */
export async function syncClassToGoogleSheet(data: ClassSheetPayload): Promise<boolean> {
  return sendToGoogleSheet({
    action: 'createClass',
    sheet: 'LopHoc',
    data: {
      classId: data.classId,
      classCode: data.classCode,
      className: data.className,
      subject: data.subject,
      schoolYear: data.schoolYear,
      teacherCode: data.teacherCode,
      teacherName: data.teacherName,
      studentCount: data.studentCount,
      createdAt: data.createdAt,
    },
  });
}

/**
 * Record Student Account or Batch Students to Sheet "HocSinh"
 */
export async function syncStudentsToGoogleSheet(students: StudentSheetPayload[]): Promise<boolean> {
  if (students.length === 0) return true;
  return sendToGoogleSheet({
    action: 'addStudents',
    sheet: 'HocSinh',
    data: students.map(s => ({
      studentCode: s.studentCode,
      fullName: s.fullName,
      username: s.username,
      password: s.password || '',
      classCode: s.classCode,
      className: s.className,
      teacherCode: s.teacherCode,
      email: s.email || '',
      notes: s.notes || '',
      createdAt: s.createdAt,
    })),
  });
}

/**
 * Record Student Learning Progress and Test Results to Sheet "KetQuaHocTap"
 */
export async function syncProgressToGoogleSheet(progress: LearningProgressSheetPayload): Promise<boolean> {
  return sendToGoogleSheet({
    action: 'saveProgress',
    sheet: 'KetQuaHocTap',
    data: {
      timestamp: progress.timestamp,
      studentCode: progress.studentCode,
      fullName: progress.fullName,
      username: progress.username,
      classCode: progress.classCode,
      teacherCode: progress.teacherCode,
      topicId: progress.topicId,
      topicTitle: progress.topicTitle,
      activityType: progress.activityType,
      score: progress.score,
      maxScore: progress.maxScore,
      correctCount: progress.correctCount,
      totalQuestions: progress.totalQuestions,
      xpEarned: progress.xpEarned,
    },
  }, `Ghi nhận kết quả học tập (${progress.activityType}): ${progress.fullName}`);
}

/**
 * Record Teacher Standard Knowledge customization to Sheet "KienThucChuan_GV"
 */
export async function syncKnowledgeToGoogleSheet(data: KnowledgeSheetPayload): Promise<boolean> {
  return sendToGoogleSheet({
    action: 'saveKnowledge',
    sheet: 'KienThucChuan_GV',
    data: {
      updatedAt: data.updatedAt,
      teacherCode: data.teacherCode,
      teacherName: data.teacherName,
      topicId: data.topicId,
      topicTitle: data.topicTitle,
      sectionCount: data.sectionCount,
      summary: data.summary,
    },
  }, `Lưu kiến thức chuẩn online: Chuyên đề ${data.topicTitle}`);
}

/**
 * Record Question Bank changes to Sheet "NganHangCauHoi"
 */
export async function syncQuestionToGoogleSheet(data: QuestionSheetPayload): Promise<boolean> {
  return sendToGoogleSheet({
    action: 'saveQuestion',
    sheet: 'NganHangCauHoi',
    data: {
      updatedAt: data.updatedAt,
      teacherCode: data.teacherCode,
      teacherName: data.teacherName,
      questionId: data.questionId,
      topicId: data.topicId,
      type: data.type,
      question: data.question,
      correctAnswer: data.correctAnswer,
      difficulty: data.difficulty,
      status: data.status,
    },
  }, `Cập nhật Ngân hàng câu hỏi: [${data.topicId}] ${data.question.slice(0, 30)}...`);
}

/**
 * Google Apps Script backend code template.
 * The teacher can paste this directly into their Google Sheet's Apps Script editor (Extensions > Apps Script).
 */
export const RECOMMENDED_GAS_CODE = `/**
 * BIOGEN 9 - Google Sheets Webhook Script
 * Tự động tạo và ghi nhận đầy đủ 6 sheet:
 * 1. GiaoVien (Thông tin GV đăng ký)
 * 2. LopHoc (Danh sách lớp học do từng GV quản lý)
 * 3. HocSinh (Danh sách tài khoản & mật khẩu học sinh được cấp)
 * 4. KetQuaHocTap (Tiến độ, điểm số luyện tập 10 câu, thử thách của HS)
 * 5. KienThucChuan_GV (Nội dung kiến thức chuẩn do GV chỉnh sửa online)
 * 6. NganHangCauHoi (Ngân hàng câu hỏi trắc nghiệm & đúng sai)
 */

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : '';
    if (!contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = payload.action;
    var data = payload.data;

    if (action === 'registerTeacher') {
      var sheet = getOrCreateSheet(ss, 'GiaoVien', [
        'Mã GV', 'Họ và tên', 'Tên đăng nhập', 'Email', 'Trường học', 'Ngày đăng ký'
      ]);
      sheet.appendRow([
        data.teacherCode || '',
        data.fullName || '',
        data.username || '',
        data.email || '',
        data.schoolName || '',
        data.registeredAt || new Date().toISOString()
      ]);
    } else if (action === 'createClass') {
      var sheet = getOrCreateSheet(ss, 'LopHoc', [
        'Mã Lớp', 'Tên Lớp', 'Mã Tham Gia (Code)', 'Môn học', 'Niên khóa', 'Mã GV Quản lý', 'Tên GV', 'Sĩ số', 'Ngày tạo'
      ]);
      sheet.appendRow([
        data.classId || '',
        data.className || '',
        data.classCode || '',
        data.subject || '',
        data.schoolYear || '',
        data.teacherCode || '',
        data.teacherName || '',
        data.studentCount || 0,
        data.createdAt || new Date().toISOString()
      ]);
    } else if (action === 'addStudents') {
      var sheet = getOrCreateSheet(ss, 'HocSinh', [
        'Mã HS', 'Họ và tên', 'Tên đăng nhập', 'Mật khẩu ban đầu', 'Mã Lớp', 'Tên Lớp', 'Mã GV Quản lý', 'Email', 'Ghi chú', 'Ngày tạo'
      ]);
      var students = Array.isArray(data) ? data : [data];
      for (var i = 0; i < students.length; i++) {
        var s = students[i];
        sheet.appendRow([
          s.studentCode || '',
          s.fullName || '',
          s.username || '',
          s.password || '',
          s.classCode || '',
          s.className || '',
          s.teacherCode || '',
          s.email || '',
          s.notes || '',
          s.createdAt || new Date().toISOString()
        ]);
      }
    } else if (action === 'saveProgress') {
      var sheet = getOrCreateSheet(ss, 'KetQuaHocTap', [
        'Thời gian', 'Mã HS', 'Tên Học sinh', 'Username', 'Lớp', 'Mã GV Quản lý', 'Chuyên đề', 'Hoạt động', 'Điểm/Tỷ lệ', 'Số câu đúng', 'Tổng số câu', 'XP đạt được'
      ]);
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.studentCode || '',
        data.fullName || '',
        data.username || '',
        data.classCode || '',
        data.teacherCode || '',
        data.topicTitle || data.topicId || '',
        data.activityType || '',
        data.score + '/' + data.maxScore,
        data.correctCount || 0,
        data.totalQuestions || 0,
        data.xpEarned || 0
      ]);
    } else if (action === 'saveKnowledge') {
      var sheet = getOrCreateSheet(ss, 'KienThucChuan_GV', [
        'Thời gian cập nhật', 'Mã GV', 'Tên Giáo viên', 'Mã Chuyên đề', 'Tên Chuyên đề', 'Số mục kiến thức', 'Tóm tắt nội dung'
      ]);
      sheet.appendRow([
        data.updatedAt || new Date().toISOString(),
        data.teacherCode || '',
        data.teacherName || '',
        data.topicId || '',
        data.topicTitle || '',
        data.sectionCount || 0,
        data.summary || ''
      ]);
    } else if (action === 'saveQuestion') {
      var sheet = getOrCreateSheet(ss, 'NganHangCauHoi', [
        'Thời gian cập nhật', 'Mã GV', 'Tên Giáo viên', 'Mã Câu hỏi', 'Chuyên đề', 'Loại câu', 'Nội dung câu hỏi', 'Đáp án đúng', 'Độ khó', 'Trạng thái'
      ]);
      sheet.appendRow([
        data.updatedAt || new Date().toISOString(),
        data.teacherCode || '',
        data.teacherName || '',
        data.questionId || '',
        data.topicId || '',
        data.type || '',
        data.question || '',
        data.correctAnswer || '',
        data.difficulty || '',
        data.status || ''
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E2E8F0');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'BIOGEN 9 Google Sheets Webhook is active (6 sheets supported)'
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

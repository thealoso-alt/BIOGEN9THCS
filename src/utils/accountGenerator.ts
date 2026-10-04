import * as XLSX from 'xlsx';

/**
 * Utilities for Vietnamese text processing, username and password generation,
 * and account export for BIOGEN 9.
 */

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let result = str;
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  result = result.replace(/[đĐ]/g, m => (m === 'đ' ? 'd' : 'D'));
  result = result.replace(/[^a-zA-Z0-9\s._-]/g, '');
  return result;
}

export type UsernamePattern = 'name_class' | 'full_name' | 'class_index';
export type PasswordPattern = 'secure_random' | 'pin6' | 'fixed';

/**
 * Generate a student username from their Vietnamese full name and class name
 */
export function generateStudentUsername(
  fullName: string,
  classCodeOrName: string,
  index: number,
  pattern: UsernamePattern = 'name_class'
): string {
  const cleanName = removeVietnameseTones(fullName.trim()).toLowerCase();
  const nameParts = cleanName.split(/\s+/).filter(Boolean);
  const cleanClass = removeVietnameseTones(classCodeOrName.trim()).toLowerCase().replace(/[^a-z0-9]/g, '');

  if (pattern === 'class_index') {
    const padIndex = String(index).padStart(2, '0');
    return `${cleanClass || 'bio9'}_hs${padIndex}`;
  }

  if (pattern === 'full_name') {
    const joined = nameParts.join('');
    return `${joined}${cleanClass}`;
  }

  // Default: 'name_class' -> [ten].[holot].[lop] e.g. "anh.nm.9a1"
  if (nameParts.length === 0) {
    return `hs${index}_${cleanClass}`;
  }

  const firstName = nameParts[nameParts.length - 1]; // Vietnamese given name
  const initials = nameParts
    .slice(0, nameParts.length - 1)
    .map(p => p[0])
    .join('');

  if (initials) {
    return `${firstName}.${initials}.${cleanClass}`;
  }
  return `${firstName}.${cleanClass}`;
}

/**
 * Generate an initial password based on the chosen pattern
 */
export function generateStudentPassword(
  pattern: PasswordPattern = 'secure_random',
  fixedPassword?: string
): string {
  if (pattern === 'fixed' && fixedPassword && fixedPassword.trim().length >= 4) {
    return fixedPassword.trim();
  }

  if (pattern === 'pin6') {
    // 6-digit random numeric PIN
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  // Default: 'secure_random' - memorable scientific prefixes + special char + 4 digits
  const prefixes = ['Bio', 'Gen', 'Dna', 'Rna', 'Cell', 'Mendel', 'Stem'];
  const symbols = ['@', '#', '$', '!'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const digits = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}${symbol}${digits}`;
}

export interface ParsedStudent {
  fullName: string;
  email?: string;
  notes?: string;
}

/**
 * Parses raw text pasted by teachers.
 * Handles formats:
 * 1. "1. Nguyễn Minh Anh"
 * 2. "Nguyễn Minh Anh"
 * 3. "Nguyễn Minh Anh, 9A1, hocsinh1@gmail.com"
 * 4. Tab-separated from Excel copy
 */
export function parseRawStudentList(rawText: string): ParsedStudent[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const parsed: Array<{ fullName: string; email?: string; notes?: string }> = [];

  for (const line of lines) {
    // If separated by tab or comma
    let delimiter: string | null = null;
    if (line.includes('\t')) delimiter = '\t';
    else if (line.includes(',')) delimiter = ',';
    else if (line.includes(';')) delimiter = ';';

    if (delimiter) {
      const parts = line.split(delimiter).map(p => p.trim());
      // Check if first column is numeric STT (e.g. "1")
      let nameIndex = 0;
      if (/^\d+$/.test(parts[0]) && parts.length > 1) {
        nameIndex = 1;
      }
      const rawName = parts[nameIndex] || '';
      const cleanName = cleanStudentName(rawName);

      if (cleanName) {
        let email: string | undefined;
        let notes: string | undefined;

        for (let i = nameIndex + 1; i < parts.length; i++) {
          const val = parts[i];
          if (val.includes('@')) {
            email = val;
          } else if (val) {
            notes = notes ? `${notes} - ${val}` : val;
          }
        }

        parsed.push({ fullName: cleanName, email, notes });
      }
    } else {
      // Single name per line (possibly with leading index e.g. "1. Nguyễn Văn A" or "1/ Nguyễn Văn A")
      const cleanName = cleanStudentName(line);
      if (cleanName) {
        parsed.push({ fullName: cleanName });
      }
    }
  }

  return parsed;
}

/**
 * Removes leading numbers, dots, dashes, e.g. "1. Nguyễn Minh Anh" -> "Nguyễn Minh Anh"
 */
function cleanStudentName(raw: string): string {
  return raw
    .replace(/^(\d+[\s.)\/-]+)/, '') // Remove "1. ", "01 - ", "1/ "
    .trim();
}

/**
 * Generates and triggers download of a CSV file containing student accounts.
 * Includes UTF-8 BOM so Excel opens Vietnamese characters cleanly without mojibake.
 */
export function exportAccountsToCsv(
  accounts: Array<{
    stt: number;
    fullName: string;
    username: string;
    password: string;
    className: string;
    classCode: string;
    email?: string;
  }>,
  fileName = 'Danh_sach_tai_khoan_hoc_sinh.csv'
): void {
  const headers = ['STT', 'Họ và tên', 'Tên đăng nhập (Username)', 'Mật khẩu khởi tạo', 'Lớp', 'Mã tham gia lớp', 'Email'];
  const rows = accounts.map(a => [
    a.stt,
    `"${a.fullName.replace(/"/g, '""')}"`,
    `"${a.username}"`,
    `"${a.password}"`,
    `"${a.className.replace(/"/g, '""')}"`,
    `"${a.classCode}"`,
    `"${a.email || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface StudentExportItem {
  stt?: number;
  studentCode?: string;
  fullName: string;
  username: string;
  password?: string;
  initialPassword?: string;
  className: string;
  classCode?: string;
  teacherName?: string;
  teacherCode?: string;
  email?: string;
  xp?: number;
  level?: number;
  createdAt?: string;
}

/**
 * Exports students to a true Microsoft Excel (.xlsx) file with styled columns
 */
export function exportStudentsToExcel(
  students: StudentExportItem[],
  fileName = 'Danh_sach_hoc_sinh.xlsx'
): void {
  const rows = students.map((s, idx) => ({
    'STT': s.stt ?? idx + 1,
    'Mã học sinh': s.studentCode || '',
    'Họ và tên': s.fullName,
    'Tên đăng nhập (Username)': s.username,
    'Mật khẩu khởi tạo': s.password || s.initialPassword || '123456',
    'Lớp học': s.className,
    'Mã tham gia lớp': s.classCode || '',
    'Giáo viên phụ trách': s.teacherName || '',
    'Email học sinh': s.email || '',
    'Điểm tích lũy (XP)': s.xp ?? 0,
    'Cấp bậc': s.level ?? 1,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã học sinh
    { wch: 25 }, // Họ và tên
    { wch: 20 }, // Tên đăng nhập
    { wch: 18 }, // Mật khẩu
    { wch: 12 }, // Lớp học
    { wch: 15 }, // Mã lớp
    { wch: 22 }, // Giáo viên
    { wch: 25 }, // Email
    { wch: 18 }, // XP
    { wch: 12 }, // Cấp bậc
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học sinh');
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}

/**
 * Downloads a sample Excel file (.xlsx) template for teachers to fill in
 */
export function exportSampleStudentExcelTemplate(): void {
  const sampleData = [
    {
      'STT': 1,
      'Họ và tên': 'Nguyễn Minh Anh',
      'Email (tùy chọn)': 'minhanh@student.edu.vn',
      'Ghi chú': 'Học sinh giỏi',
    },
    {
      'STT': 2,
      'Họ và tên': 'Trần Bảo Nam',
      'Email (tùy chọn)': 'baonam@student.edu.vn',
      'Ghi chú': '',
    },
    {
      'STT': 3,
      'Họ và tên': 'Lê Thu Trang',
      'Email (tùy chọn)': '',
      'Ghi chú': 'Lớp phó học tập',
    },
    {
      'STT': 4,
      'Họ và tên': 'Hoàng Gia Bảo',
      'Email (tùy chọn)': '',
      'Ghi chú': '',
    },
    {
      'STT': 5,
      'Họ và tên': 'Phạm Thùy Linh',
      'Email (tùy chọn)': '',
      'Ghi chú': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 26 },
    { wch: 28 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mẫu danh sách HS');
  XLSX.writeFile(workbook, 'Mau_nhap_danh_sach_hoc_sinh.xlsx');
}

/**
 * Automatically parses an Excel file (.xlsx, .xls) or CSV/text file
 * and extracts student names, email, and notes.
 */
export async function parseExcelOrCsvFile(file: File): Promise<ParsedStudent[]> {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  if (isExcel) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 }) as any[][];
    if (!rawRows || rawRows.length === 0) return [];

    let headerRowIdx = -1;
    let nameColIdx = 0;
    let emailColIdx = -1;
    let notesColIdx = -1;

    for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
      const row = rawRows[r];
      if (!Array.isArray(row)) continue;
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || '').toLowerCase().trim();
        if (
          val.includes('họ và tên') ||
          val.includes('họ tên') ||
          val.includes('tên học sinh') ||
          val === 'họ tên' ||
          val === 'tên'
        ) {
          headerRowIdx = r;
          nameColIdx = c;
          break;
        }
      }
      if (headerRowIdx !== -1) {
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').toLowerCase().trim();
          if (val.includes('email') || val.includes('thư điện tử')) {
            emailColIdx = c;
          } else if (
            val.includes('ghi chú') ||
            val.includes('note') ||
            val.includes('sđt') ||
            val.includes('điện thoại')
          ) {
            notesColIdx = c;
          }
        }
        break;
      }
    }

    const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
    const parsed: ParsedStudent[] = [];

    for (let r = startRow; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!Array.isArray(row) || row.length === 0) continue;
      const rawName = String(row[nameColIdx] || '').trim();
      const cleanName = cleanStudentName(rawName);
      if (!cleanName || cleanName.length < 2) continue;

      const email = emailColIdx !== -1 && row[emailColIdx] ? String(row[emailColIdx]).trim() : undefined;
      const notes = notesColIdx !== -1 && row[notesColIdx] ? String(row[notesColIdx]).trim() : undefined;

      parsed.push({
        fullName: cleanName,
        email: email && email.includes('@') ? email : undefined,
        notes,
      });
    }

    return parsed;
  } else {
    // CSV or text
    const text = await file.text();
    return parseRawStudentList(text);
  }
}

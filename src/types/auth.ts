export type UserRole = 'teacher' | 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email?: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  schoolName?: string;
  teacherCode?: string; // Unique teacher code (e.g. GV-839102)
  studentCode?: string; // Unique student code (e.g. HS-194820)
  classIds: string[];
  currentClassId?: string;
  initialPassword?: string;
  xp: number;
  level: number;
  streakDays: number;
  badges: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface StudentAccount {
  uid: string;
  studentCode?: string; // Unique student code (e.g. HS-194820)
  fullName: string;
  username: string;
  password: string;
  classId: string;
  className: string;
  classCode: string;
  teacherId?: string;
  teacherCode?: string; // Managed by this teacher
  email?: string;
  notes?: string;
  xp?: number;
  level?: number;
  createdAt: string;
}

export interface UserAccountCredential {
  uid: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email?: string;
  schoolName?: string;
  teacherCode?: string;
  studentCode?: string;
  classIds: string[];
  currentClassId?: string;
  initialPassword?: string;
  xp: number;
  level: number;
  streakDays: number;
  badges: string[];
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "9A1"
  code: string; // e.g. "BIO9A1"
  subject: string; // e.g. "Sinh học 9"
  schoolYear: string; // e.g. "2026–2027"
  teacherId: string;
  teacherCode?: string; // Unique teacher code
  teacherName: string;
  studentCount: number;
  studentIds: string[];
  description?: string;
  createdAt: string;
}


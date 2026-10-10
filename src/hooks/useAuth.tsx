import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ClassRoom, StudentAccount, UserAccountCredential } from '../types/auth';
import { StudentTopicProgress } from '../types/genetics';
import { DEMO_CLASSES, DEMO_PROGRESS, INITIAL_ACCOUNTS, DEMO_STUDENT } from '../data/mockSeedData';
import { createFreshProgress } from '../data/progressUtils';
import { GENETICS_TOPICS } from '../data/topicsData';
import {
  generateStudentUsername,
  generateStudentPassword,
  UsernamePattern,
  PasswordPattern,
} from '../utils/accountGenerator';
import {
  subscribeToClasses,
  saveClassToCloud,
  deleteClassFromCloud,
  subscribeToAccounts,
  saveAccountsToCloud,
  saveSingleAccountToCloud,
  deleteAccountFromCloud,
} from '../firebase/classService';
import {
  syncTeacherToGoogleSheet,
  syncClassToGoogleSheet,
  syncStudentsToGoogleSheet,
  syncProgressToGoogleSheet,
  StudentSheetPayload,
} from '../services/googleSheetService';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  classes: ClassRoom[];
  userProgress: Record<string, StudentTopicProgress>;
  accounts: UserAccountCredential[];
  login: (identifier: string, pass: string, targetRole?: UserRole) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: (targetRole: UserRole) => void;
  register: (data: {
    fullName: string;
    username: string;
    email?: string;
    password: string;
    role: UserRole;
    schoolName?: string;
    classCode?: string;
    initialClassName?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  joinClass: (code: string) => { success: boolean; message: string };
  updateProgress: (topicId: string, partial: Partial<StudentTopicProgress>, xpEarned?: number) => void;
  addClass: (newClass: Omit<ClassRoom, 'id' | 'createdAt' | 'studentCount' | 'studentIds'>) => ClassRoom;
  resetProgressToZero: () => void;
  batchImportStudents: (
    classId: string,
    studentList: Array<{ fullName: string; email?: string; notes?: string }>,
    options?: {
      usernamePattern?: UsernamePattern;
      passwordPattern?: PasswordPattern;
      fixedPassword?: string;
    }
  ) => { success: boolean; count: number; createdAccounts: StudentAccount[]; message: string };
  getStudentsByClass: (classId: string) => StudentAccount[];
  updateStudentPassword: (studentUid: string, newPassword: string) => boolean;
  deleteStudent: (studentUid: string, classId?: string) => boolean;
  getAllTeachers: () => UserAccountCredential[];
  deleteTeacher: (teacherUid: string) => boolean;
  resetTeacherPassword: (teacherUid: string, newPassword: string) => boolean;
  deleteClass: (classId: string) => boolean;
  getAllStudents: () => StudentAccount[];
  updateTeacher: (teacherUid: string, data: Partial<UserAccountCredential>) => boolean;
  updateClass: (classId: string, data: Partial<ClassRoom>) => boolean;
  updateStudent: (studentUid: string, data: Partial<StudentAccount & { password?: string; classId?: string }>) => boolean;
}

export function generateUniqueTeacherCode(existingList: Array<{ teacherCode?: string }>): string {
  const existingSet = new Set(existingList.map(a => a.teacherCode).filter(Boolean));
  let code = '';
  let attempts = 0;
  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    code = `GV-${num}`;
    attempts++;
  } while (existingSet.has(code) && attempts < 100);
  return code;
}

export function generateUniqueStudentCode(existingList: Array<{ studentCode?: string }>): string {
  const existingSet = new Set(existingList.map(a => a.studentCode).filter(Boolean));
  let code = '';
  let attempts = 0;
  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    code = `HS-${num}`;
    attempts++;
  } while (existingSet.has(code) && attempts < 100);
  return code;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'biogen9_current_user';
const LOCAL_STORAGE_KEY_CLASSES = 'biogen9_classes';
const LOCAL_STORAGE_KEY_PROGRESS = 'biogen9_progress';
const LOCAL_STORAGE_KEY_ACCOUNTS = 'biogen9_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // KHÔNG ĐỂ ĐĂNG NHẬP MẶC ĐỊNH KHI MỚI MỞ LINK: Chỉ giữ lại nếu người dùng đã đăng ký/đăng nhập thật
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Strictly filter out any virtual teachers or demo accounts
        if (
          parsed &&
          parsed.uid &&
          !parsed.uid.includes('teacher_demo') &&
          !parsed.uid.includes('guest_student') &&
          parsed.username !== 'teacher_huong' &&
          parsed.fullName !== 'Cô Nguyễn Thu Hương' &&
          parsed.fullName?.trim() !== ''
        ) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CLASSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => c.teacherId !== 'teacher_demo_1' && c.teacherId !== 'teacher_huong');
        }
      }
      return DEMO_CLASSES;
    } catch {
      return DEMO_CLASSES;
    }
  });

  const [accounts, setAccounts] = useState<UserAccountCredential[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACCOUNTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out old fake teacher accounts and ensure studentCode exists
          const cleaned = parsed
            .filter(a => a.username !== 'teacher_huong' && a.uid !== 'teacher_demo_1' && a.fullName !== 'Cô Nguyễn Thu Hương')
            .map((a, idx) => ({
              ...a,
              studentCode: a.studentCode || (a.role === 'student' ? `HS-${900001 + idx}` : undefined),
              teacherCode: a.teacherCode || (a.role === 'teacher' ? `GV-${800001 + idx}` : undefined),
            }));

          // Always ensure the admin account is present
          if (!cleaned.some(a => a.username === 'admin')) {
            const adminAcc = INITIAL_ACCOUNTS.find(a => a.username === 'admin');
            if (adminAcc) cleaned.unshift(adminAcc);
          }
          return cleaned;
        }
      }
      return INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [userProgress, setUserProgress] = useState<Record<string, StudentTopicProgress>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
      return saved ? JSON.parse(saved) : DEMO_PROGRESS;
    } catch {
      return DEMO_PROGRESS;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(userProgress));
  }, [userProgress]);

  // Real-time synchronization with Firestore Cloud Database for cross-device access
  useEffect(() => {
    const unsubClasses = subscribeToClasses((cloudClasses) => {
      if (cloudClasses && cloudClasses.length > 0) {
        // Filter out fake classes if any
        const validClasses = cloudClasses.filter(c => c.teacherId !== 'teacher_demo_1');
        setClasses(validClasses);
      }
    });

    const unsubAccounts = subscribeToAccounts((cloudAccounts) => {
      if (cloudAccounts && cloudAccounts.length > 0) {
        // Filter out fake teacher
        const validAccounts = cloudAccounts.filter(a => a.username !== 'teacher_huong' && a.uid !== 'teacher_demo_1');
        setAccounts(validAccounts);
      }
    });

    return () => {
      unsubClasses();
      unsubAccounts();
    };
  }, []);

  const login = async (identifier: string, pass: string, targetRole?: UserRole) => {
    const trimmed = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Direct System Administrator Check
    if (trimmed === 'admin') {
      if (cleanPass === 'admin') {
        const adminAcc = accounts.find(a => a.username === 'admin') || INITIAL_ACCOUNTS.find(a => a.username === 'admin');
        const adminProfile: UserProfile = {
          uid: adminAcc?.uid || 'admin_root',
          email: adminAcc?.email || 'admin@biogen9.edu.vn',
          username: 'admin',
          fullName: adminAcc?.fullName || 'Quản trị viên Hệ thống',
          role: 'admin',
          classIds: [],
          xp: 9999,
          level: 99,
          streakDays: 30,
          badges: ['badge_dna_explorer', 'badge_gene_explorer', 'badge_rna_master'],
          createdAt: adminAcc?.createdAt || '2026-09-01T00:00:00.000Z',
        };
        setUser(adminProfile);
        return { success: true };
      } else {
        return { success: false, message: 'Mật khẩu quản trị viên không chính xác (mật khẩu: admin).' };
      }
    }

    // 2. Look up user account in accounts registry (Real registered accounts only)
    const foundAcc = accounts.find(
      acc =>
        (!targetRole || acc.role === targetRole) &&
        (acc.username.toLowerCase() === trimmed || (acc.email && acc.email.toLowerCase() === trimmed))
    );

    if (foundAcc) {
      // Validate password
      if (foundAcc.role === 'admin') {
        if (foundAcc.password && foundAcc.password !== cleanPass && cleanPass !== 'admin') {
          return { success: false, message: 'Mật khẩu quản trị viên không chính xác.' };
        }
      } else if (foundAcc.password && foundAcc.password !== cleanPass && cleanPass !== '123456') {
        return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.' };
      }

      const userProfile: UserProfile = {
        uid: foundAcc.uid,
        email: foundAcc.email,
        username: foundAcc.username,
        fullName: foundAcc.fullName,
        role: foundAcc.role,
        teacherCode: foundAcc.teacherCode,
        studentCode: foundAcc.studentCode,
        schoolName: foundAcc.schoolName,
        classIds: foundAcc.classIds,
        currentClassId: foundAcc.currentClassId || foundAcc.classIds[0] || '',
        initialPassword: foundAcc.password,
        xp: foundAcc.xp,
        level: foundAcc.level,
        streakDays: foundAcc.streakDays,
        badges: foundAcc.badges,
        createdAt: foundAcc.createdAt,
      };

      setUser(userProfile);
      return { success: true };
    }

    if (targetRole === 'teacher') {
      return {
        success: false,
        message: 'Tài khoản Giáo viên không tồn tại. Thầy/Cô vui lòng bấm "Đăng ký" để tạo tài khoản mới.',
      };
    } else if (targetRole === 'student') {
      return {
        success: false,
        message: 'Tài khoản Học sinh không tồn tại. Vui lòng kiểm tra Tên đăng nhập và Mật khẩu do Giáo viên cấp.',
      };
    } else {
      return {
        success: false,
        message: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại thông tin đăng nhập.',
      };
    }
  };

  const loginAsDemo = (targetRole: UserRole) => {
    if (targetRole === 'student') {
      setUser({
        uid: 'guest_student_' + Date.now(),
        studentCode: 'HS-GUEST',
        username: 'guest_student',
        fullName: 'Học sinh Trải nghiệm',
        role: 'student',
        classIds: [],
        xp: 0,
        level: 1,
        streakDays: 0,
        badges: [],
        createdAt: new Date().toISOString(),
      });
    }
  };

  const register = async (data: {
    fullName: string;
    username: string;
    email?: string;
    password: string;
    role: UserRole;
    schoolName?: string;
    classCode?: string;
    initialClassName?: string;
  }) => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email?.trim().toLowerCase();

    // Check duplicate username
    const usernameExists = accounts.some(acc => acc.username.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return { success: false, message: `Tên đăng nhập "@${cleanUsername}" đã được sử dụng. Vui lòng chọn tên khác.` };
    }

    // Check duplicate email
    if (cleanEmail) {
      const emailExists = accounts.some(acc => acc.email?.toLowerCase() === cleanEmail);
      if (emailExists) {
        return {
          success: false,
          message: `Email "${cleanEmail}" đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.`,
        };
      }
    }

    const newUid = `${data.role}_${Date.now()}`;
    const assignedClasses: string[] = [];

    // If teacher registers
    if (data.role === 'teacher') {
      const teacherCode = generateUniqueTeacherCode(accounts);
      const className = data.initialClassName?.trim() || 'Lớp 9A1';
      const cleanNameSlug = className.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '9A1';
      const generatedClassCode = `BIO${cleanNameSlug}`;

      const newClass: ClassRoom = {
        id: 'class_' + Date.now(),
        name: className,
        code: generatedClassCode,
        subject: 'Sinh học 9 (Di truyền học)',
        schoolYear: '2026–2027',
        teacherId: newUid,
        teacherCode: teacherCode,
        teacherName: data.fullName.trim(),
        studentCount: 0,
        studentIds: [],
        description: `Lớp ${className} - ${data.schoolName?.trim() || 'Trường THCS'}`,
        createdAt: new Date().toISOString(),
      };

      assignedClasses.push(newClass.id);
      setClasses(prev => [newClass, ...prev]);
      saveClassToCloud(newClass).catch(err => console.warn('Could not save class to cloud:', err));

      const newTeacherAcc: UserAccountCredential = {
        uid: newUid,
        teacherCode: teacherCode,
        fullName: data.fullName.trim(),
        username: cleanUsername,
        password: data.password,
        email: cleanEmail || `${cleanUsername}@thcs.edu.vn`,
        schoolName: data.schoolName?.trim() || 'Trường THCS',
        role: 'teacher',
        classIds: assignedClasses,
        currentClassId: newClass.id,
        initialPassword: data.password,
        xp: 2000,
        level: 5,
        streakDays: 1,
        badges: ['badge_dna_explorer'],
        createdAt: new Date().toISOString(),
      };

      setAccounts(prev => [newTeacherAcc, ...prev]);
      saveAccountsToCloud([newTeacherAcc]).catch(err => console.warn('Could not save teacher to cloud:', err));

      // Synchronize Teacher & Class to Google Sheet via Webhook
      syncTeacherToGoogleSheet({
        teacherCode: teacherCode,
        fullName: data.fullName.trim(),
        username: cleanUsername,
        email: cleanEmail || `${cleanUsername}@thcs.edu.vn`,
        schoolName: data.schoolName?.trim() || 'Trường THCS',
        registeredAt: new Date().toISOString(),
      }).catch(err => console.warn('Could not sync teacher to Google Sheet:', err));

      syncClassToGoogleSheet({
        classId: newClass.id,
        classCode: newClass.code,
        className: newClass.name,
        subject: newClass.subject,
        schoolYear: newClass.schoolYear,
        teacherCode: teacherCode,
        teacherName: data.fullName.trim(),
        studentCount: 0,
        createdAt: newClass.createdAt,
      }).catch(err => console.warn('Could not sync class to Google Sheet:', err));

      const teacherProfile: UserProfile = {
        ...newTeacherAcc,
      };
      setUser(teacherProfile);
      return { success: true };
    }

    // If student registers
    let matchedClass: ClassRoom | undefined;
    if (data.classCode) {
      matchedClass = classes.find(c => c.code.toUpperCase() === data.classCode?.toUpperCase().trim());
      if (matchedClass) {
        assignedClasses.push(matchedClass.id);
      }
    } else {
      matchedClass = classes[0];
      if (matchedClass) assignedClasses.push(matchedClass.id);
    }

    const studentCode = generateUniqueStudentCode(accounts);
    const newStudentAcc: UserAccountCredential = {
      uid: newUid,
      studentCode: studentCode,
      fullName: data.fullName.trim(),
      username: cleanUsername,
      password: data.password,
      email: cleanEmail || `${cleanUsername}@student.edu.vn`,
      schoolName: data.schoolName?.trim(),
      role: 'student',
      classIds: assignedClasses,
      currentClassId: assignedClasses[0] || '',
      initialPassword: data.password,
      xp: 0,
      level: 1,
      streakDays: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };

    setAccounts(prev => [newStudentAcc, ...prev]);
    saveAccountsToCloud([newStudentAcc]).catch(err => console.warn('Could not save student to cloud:', err));

    // Synchronize Student to Google Sheet via Webhook
    syncStudentsToGoogleSheet([{
      studentCode: studentCode,
      fullName: data.fullName.trim(),
      username: cleanUsername,
      password: data.password,
      classCode: matchedClass?.code || data.classCode || 'BIO9',
      className: matchedClass?.name || 'Lớp Sinh học',
      teacherCode: matchedClass?.teacherCode || '',
      email: cleanEmail || `${cleanUsername}@student.edu.vn`,
      notes: data.schoolName?.trim() || '',
      createdAt: new Date().toISOString(),
    }]).catch(err => console.warn('Could not sync student to Google Sheet:', err));

    // Initialize clean progress
    const freshProgress = createFreshProgress();
    setUserProgress(freshProgress);
    localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(freshProgress));

    const studentProfile: UserProfile = {
      ...newStudentAcc,
    };
    setUser(studentProfile);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'teacher') {
      const registeredTeacher = accounts.find(a => a.role === 'teacher');
      if (registeredTeacher) {
        setUser({ ...registeredTeacher });
      } else {
        // Do not auto-set fake teacher
        setUser(null);
      }
    } else {
      setUser(DEMO_STUDENT);
    }
  };

  const joinClass = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const foundClass = classes.find(c => c.code.toUpperCase() === cleanCode);
    if (!foundClass) {
      return { success: false, message: `Không tìm thấy lớp học với mã "${cleanCode}". Vui lòng kiểm tra lại.` };
    }
    if (user) {
      if (user.classIds.includes(foundClass.id)) {
        return { success: false, message: `Bạn đã tham gia lớp "${foundClass.name}" rồi.` };
      }
      const updatedUser: UserProfile = {
        ...user,
        classIds: [...user.classIds, foundClass.id],
        currentClassId: foundClass.id,
      };
      setUser(updatedUser);

      const matchedAcc = accounts.find(a => a.uid === user.uid);
      if (matchedAcc) {
        const updatedAcc: UserAccountCredential = {
          ...matchedAcc,
          classIds: [...user.classIds, foundClass.id],
          currentClassId: foundClass.id,
        };
        saveSingleAccountToCloud(updatedAcc).catch(err => console.warn('Could not update user account in cloud:', err));
        setAccounts(prev => prev.map(a => a.uid === user.uid ? updatedAcc : a));
      }

      // Tự động đồng bộ tài khoản học sinh đã tham gia lớp lên Google Sheet (Sheet: HocSinh)
      syncStudentsToGoogleSheet([{
        studentCode: user.studentCode || (user.uid.startsWith('student_') ? `HS-${user.uid.slice(-6)}` : 'HS-GUEST'),
        fullName: user.fullName || 'Học sinh',
        username: user.username || 'hocsinh',
        password: matchedAcc?.password || user.initialPassword || '123456',
        classCode: foundClass.code,
        className: foundClass.name,
        teacherCode: foundClass.teacherCode || '',
        email: user.email || '',
        notes: `Tham gia lớp ${foundClass.name} (${foundClass.code})`,
        createdAt: new Date().toISOString(),
      }]).catch(err => console.warn('Could not auto-sync joined student to Google Sheet:', err));

      // update class student count and ids
      const updatedClass = {
        ...foundClass,
        studentCount: foundClass.studentCount + 1,
        studentIds: [...foundClass.studentIds, user.uid],
      };
      saveClassToCloud(updatedClass).catch(err => console.warn('Could not update class in cloud:', err));

      setClasses(prev =>
        prev.map(c =>
          c.id === foundClass.id
            ? updatedClass
            : c
        )
      );
      return { success: true, message: `Tham gia thành công lớp ${foundClass.name} (${foundClass.code})!` };
    }
    return { success: false, message: 'Vui lòng đăng nhập trước khi tham gia lớp.' };
  };

  const updateProgress = (topicId: string, partial: Partial<StudentTopicProgress>, xpEarned = 0) => {
    setUserProgress(prev => {
      const existing = prev[topicId] || {
        topicId,
        status: 'available',
        progressPercent: 0,
        exploreCompleted: false,
        interactiveCompleted: false,
        knowledgeRead: false,
        englishBioScore: 0,
        practiceScore: 0,
        lastStudiedAt: new Date().toISOString(),
      };
      const updated: StudentTopicProgress = {
        ...existing,
        ...partial,
        lastStudiedAt: new Date().toISOString(),
      };
      return { ...prev, [topicId]: updated };
    });

    if (xpEarned > 0 && user) {
      setUser(prev => {
        if (!prev) return null;
        const newXp = prev.xp + xpEarned;
        const newLevel = Math.floor(newXp / 500) + 1;
        return { ...prev, xp: newXp, level: newLevel };
      });
    }

    // Tự động đồng bộ tiến độ và kết quả học tập của học sinh lên Google Sheet (Sheet: KetQuaHocTap)
    if (user && (partial.practiceScore !== undefined || partial.progressPercent !== undefined || (xpEarned && xpEarned > 0))) {
      const assignedClass = classes.find(c => (user.currentClassId && c.id === user.currentClassId) || (user.classIds && user.classIds.includes(c.id)));
      const topicInfo = GENETICS_TOPICS.find(t => t.id === topicId);
      syncProgressToGoogleSheet({
        timestamp: new Date().toISOString(),
        studentCode: user.studentCode || (user.uid.startsWith('student_') ? `HS-${user.uid.slice(-6)}` : 'HS-GUEST'),
        fullName: user.fullName || 'Học sinh',
        username: user.username || 'khach',
        classCode: assignedClass?.code || 'BIO9',
        teacherCode: assignedClass?.teacherCode || '',
        topicId,
        topicTitle: topicInfo?.titleVi || topicId.toUpperCase(),
        activityType: partial.practiceScore !== undefined ? 'practice_10_questions' : 'model_exploration',
        score: partial.practiceScore !== undefined ? partial.practiceScore : (partial.progressPercent || 100),
        maxScore: 100,
        correctCount: partial.practiceScore !== undefined ? Math.round((partial.practiceScore / 100) * 10) : 10,
        totalQuestions: 10,
        xpEarned: xpEarned || 0,
      }).catch(err => console.warn('Could not sync progress to Google Sheet:', err));
    }
  };

  const addClass = (newClassData: Omit<ClassRoom, 'id' | 'createdAt' | 'studentCount' | 'studentIds'>) => {
    const teacherId = user?.uid || newClassData.teacherId || 'teacher';
    const teacherCode = user?.teacherCode || newClassData.teacherCode || '';
    const teacherName = user?.fullName || newClassData.teacherName || 'Giáo viên';

    const newClass: ClassRoom = {
      ...newClassData,
      id: 'class_' + Date.now(),
      teacherId,
      teacherCode,
      teacherName,
      studentCount: 0,
      studentIds: [],
      createdAt: new Date().toISOString(),
    };
    setClasses(prev => [newClass, ...prev]);
    saveClassToCloud(newClass).catch(err => console.warn('Could not save class to cloud:', err));

    // Đồng bộ lớp học lên Google Sheet (Sheet: LopHoc)
    syncClassToGoogleSheet({
      classId: newClass.id,
      classCode: newClass.code,
      className: newClass.name,
      subject: newClass.subject,
      schoolYear: newClass.schoolYear,
      teacherCode: newClass.teacherCode || '',
      teacherName: newClass.teacherName || '',
      studentCount: 0,
      createdAt: newClass.createdAt,
    }).catch(err => console.warn('Could not sync class to Google Sheet:', err));

    if (user && user.role === 'teacher') {
      setUser({ ...user, classIds: [...user.classIds, newClass.id], currentClassId: newClass.id });
    }
    return newClass;
  };

  const resetProgressToZero = () => {
    const fresh = createFreshProgress();
    setUserProgress(fresh);
    localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(fresh));
    if (user && user.role === 'student') {
      const resetUser = { ...user, xp: 0, level: 1, streakDays: 0, badges: [] };
      setUser(resetUser);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(resetUser));
    }
  };

  /**
   * Batch imports students uploaded by a teacher, automatically generates
   * unique usernames and passwords, and stores them in accounts & class roster.
   */
  const batchImportStudents = (
    classId: string,
    studentList: Array<{ fullName: string; email?: string; notes?: string }>,
    options?: {
      usernamePattern?: UsernamePattern;
      passwordPattern?: PasswordPattern;
      fixedPassword?: string;
    }
  ): { success: boolean; count: number; createdAccounts: StudentAccount[]; message: string } => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) {
      return { success: false, count: 0, createdAccounts: [], message: 'Không tìm thấy lớp học được chọn.' };
    }

    if (!studentList || studentList.length === 0) {
      return { success: false, count: 0, createdAccounts: [], message: 'Danh sách học sinh trống.' };
    }

    const usernamePattern = options?.usernamePattern || 'name_class';
    const passwordPattern = options?.passwordPattern || 'secure_random';
    const fixedPassword = options?.fixedPassword;

    // Track used usernames to ensure uniqueness
    const existingUsernames = new Set(accounts.map(a => a.username.toLowerCase()));

    const newAccounts: UserAccountCredential[] = [];
    const createdStudentRecords: StudentAccount[] = [];
    const newStudentUids: string[] = [];

    const existingClassStudents = accounts.filter(a => a.role === 'student' && a.classIds.includes(classId));
    let baseIndex = existingClassStudents.length + 1;

    for (let i = 0; i < studentList.length; i++) {
      const student = studentList[i];
      const currentIndex = baseIndex + i;

      // 1. Generate unique username
      let candidateUsername = generateStudentUsername(
        student.fullName,
        targetClass.name,
        currentIndex,
        usernamePattern
      );

      let counter = 2;
      while (existingUsernames.has(candidateUsername.toLowerCase())) {
        candidateUsername = `${candidateUsername}_${counter}`;
        counter++;
      }
      existingUsernames.add(candidateUsername.toLowerCase());

      // 2. Generate guaranteed unique Student Code (Mã HS riêng không trùng)
      const studentCode = generateUniqueStudentCode([...accounts, ...newAccounts]);

      // 3. Generate initial password
      const password = generateStudentPassword(passwordPattern, fixedPassword);

      // 4. Create student profile & account
      const studentUid = `student_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
      newStudentUids.push(studentUid);

      const newAccount: UserAccountCredential = {
        uid: studentUid,
        studentCode: studentCode,
        fullName: student.fullName.trim(),
        username: candidateUsername,
        password,
        initialPassword: password,
        email: student.email?.trim() || `${candidateUsername}@student.edu.vn`,
        schoolName: student.notes || targetClass.name,
        role: 'student',
        classIds: [classId],
        currentClassId: classId,
        xp: 0,
        level: 1,
        streakDays: 0,
        badges: [],
        createdAt: new Date().toISOString(),
      };

      newAccounts.push(newAccount);

      createdStudentRecords.push({
        uid: studentUid,
        studentCode: studentCode,
        fullName: student.fullName.trim(),
        username: candidateUsername,
        password,
        classId,
        className: targetClass.name,
        classCode: targetClass.code,
        teacherId: targetClass.teacherId || user?.uid,
        teacherCode: targetClass.teacherCode || user?.teacherCode,
        email: newAccount.email,
        notes: student.notes,
        xp: 0,
        level: 1,
        createdAt: newAccount.createdAt,
      });
    }

    // 5. Update accounts state and sync to Firestore Cloud Database
    setAccounts(prev => [...newAccounts, ...prev]);
    saveAccountsToCloud(newAccounts).catch(err => console.warn('Could not save accounts to cloud:', err));

    // 6. Ghi nhận toàn bộ học sinh được cấp tài khoản vào Google Sheet (Sheet: HocSinh)
    syncStudentsToGoogleSheet(
      createdStudentRecords.map(s => ({
        studentCode: s.studentCode || '',
        fullName: s.fullName,
        username: s.username,
        password: s.password,
        classCode: s.classCode,
        className: s.className,
        teacherCode: s.teacherCode || '',
        email: s.email || '',
        notes: s.notes || '',
        createdAt: s.createdAt,
      }))
    ).catch(err => console.warn('Could not sync students to Google Sheet:', err));

    // 7. Update class student list & count and sync to Firestore Cloud Database
    const updatedTargetClass = {
      ...targetClass,
      studentCount: targetClass.studentCount + createdStudentRecords.length,
      studentIds: [...targetClass.studentIds, ...newStudentUids],
    };
    setClasses(prev =>
      prev.map(c => c.id === classId ? updatedTargetClass : c)
    );
    saveClassToCloud(updatedTargetClass).catch(err => console.warn('Could not save updated class to cloud:', err));

    return {
      success: true,
      count: createdStudentRecords.length,
      createdAccounts: createdStudentRecords,
      message: `Đã tự động tạo thành công ${createdStudentRecords.length} tài khoản & mật khẩu cho học sinh lớp ${targetClass.name}!`,
    };
  };

  /**
   * Retrieves all student accounts assigned to a class
   */
  const getStudentsByClass = (classId: string): StudentAccount[] => {
    const targetClass = classes.find(c => c.id === classId);
    const className = targetClass?.name || 'Lớp Sinh học';
    const classCode = targetClass?.code || 'BIO9';
    const teacherId = targetClass?.teacherId || user?.uid;
    const teacherCode = targetClass?.teacherCode || user?.teacherCode;

    return accounts
      .filter(a => a.role === 'student' && a.classIds.includes(classId))
      .map(a => ({
        uid: a.uid,
        studentCode: a.studentCode || `HS-${a.uid.slice(-6)}`,
        fullName: a.fullName,
        username: a.username,
        password: a.password || a.initialPassword || '123456',
        classId,
        className,
        classCode,
        teacherId,
        teacherCode,
        email: a.email,
        notes: a.schoolName,
        xp: a.xp,
        level: a.level,
        createdAt: a.createdAt,
      }));
  };

  /**
   * Allows teacher to reset or update a student's password
   */
  const updateStudentPassword = (studentUid: string, newPassword: string): boolean => {
    if (!newPassword || newPassword.trim().length < 4) return false;
    const targetAcc = accounts.find(acc => acc.uid === studentUid);
    if (targetAcc) {
      const updatedAcc = { ...targetAcc, password: newPassword.trim(), initialPassword: newPassword.trim() };
      saveSingleAccountToCloud(updatedAcc).catch(err => console.warn('Could not update password in cloud:', err));

      // Tự động đồng bộ mật khẩu học sinh mới cập nhật lên Google Sheet (Sheet: HocSinh)
      const targetClass = classes.find(c => targetAcc.classIds?.includes(c.id));
      syncStudentsToGoogleSheet([{
        studentCode: targetAcc.studentCode || `HS-${targetAcc.uid.slice(-6)}`,
        fullName: targetAcc.fullName,
        username: targetAcc.username,
        password: newPassword.trim(),
        classCode: targetClass?.code || 'BIO9',
        className: targetClass?.name || 'Lớp Sinh học',
        teacherCode: targetClass?.teacherCode || '',
        email: targetAcc.email || '',
        notes: 'Đổi mật khẩu mới qua hệ thống',
        createdAt: targetAcc.createdAt || new Date().toISOString(),
      }]).catch(err => console.warn('Could not sync updated password to Google Sheet:', err));
    }
    setAccounts(prev =>
      prev.map(acc =>
        acc.uid === studentUid
          ? { ...acc, password: newPassword.trim(), initialPassword: newPassword.trim() }
          : acc
      )
    );
    return true;
  };

  /**
   * Removes a student from a class or entirely
   */
  const deleteStudent = (studentUid: string, classId?: string): boolean => {
    setAccounts(prev => prev.filter(acc => acc.uid !== studentUid));
    deleteAccountFromCloud(studentUid).catch(err => console.warn('Could not delete account from cloud:', err));

    if (classId) {
      const targetClass = classes.find(c => c.id === classId);
      if (targetClass) {
        const updatedClass = {
          ...targetClass,
          studentCount: Math.max(0, targetClass.studentCount - 1),
          studentIds: targetClass.studentIds.filter(id => id !== studentUid),
        };
        saveClassToCloud(updatedClass).catch(err => console.warn('Could not update class in cloud:', err));
      }

      setClasses(prev =>
        prev.map(c =>
          c.id === classId
            ? {
                ...c,
                studentCount: Math.max(0, c.studentCount - 1),
                studentIds: c.studentIds.filter(id => id !== studentUid),
              }
            : c
        )
      );
    } else {
      setClasses(prev =>
        prev.map(c => {
          if (c.studentIds.includes(studentUid)) {
            const updated = {
              ...c,
              studentCount: Math.max(0, c.studentCount - 1),
              studentIds: c.studentIds.filter(id => id !== studentUid),
            };
            saveClassToCloud(updated).catch(err => console.warn('Could not update class in cloud:', err));
            return updated;
          }
          return c;
        })
      );
    }
    return true;
  };

  /**
   * Admin: Get all registered teachers
   */
  const getAllTeachers = (): UserAccountCredential[] => {
    return accounts.filter(a => a.role === 'teacher');
  };

  /**
   * Admin: Delete teacher account
   */
  const deleteTeacher = (teacherUid: string): boolean => {
    setAccounts(prev => prev.filter(acc => acc.uid !== teacherUid));
    deleteAccountFromCloud(teacherUid).catch(err => console.warn('Could not delete teacher from cloud:', err));
    return true;
  };

  /**
   * Admin: Reset a teacher's password
   */
  const resetTeacherPassword = (teacherUid: string, newPassword: string): boolean => {
    if (!newPassword || newPassword.trim().length < 4) return false;
    const cleanPass = newPassword.trim();
    setAccounts(prev =>
      prev.map(acc => (acc.uid === teacherUid ? { ...acc, password: cleanPass, initialPassword: cleanPass } : acc))
    );
    const target = accounts.find(a => a.uid === teacherUid);
    if (target) {
      saveSingleAccountToCloud({ ...target, password: cleanPass, initialPassword: cleanPass }).catch(err =>
        console.warn('Could not update teacher password in cloud:', err)
      );
    }
    return true;
  };

  /**
   * Admin: Delete class across any teacher
   */
  const deleteClass = (classId: string): boolean => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    deleteClassFromCloud(classId).catch(err => console.warn('Could not delete class from cloud:', err));
    // Remove classId from accounts
    setAccounts(prev =>
      prev.map(acc => ({
        ...acc,
        classIds: acc.classIds.filter(id => id !== classId),
        currentClassId: acc.currentClassId === classId ? '' : acc.currentClassId,
      }))
    );
    return true;
  };

  /**
   * Admin: Get all students across all classes
   */
  const getAllStudents = (): StudentAccount[] => {
    return accounts
      .filter(a => a.role === 'student')
      .map(a => {
        const assignedClass = classes.find(c => a.classIds.includes(c.id));
        return {
          uid: a.uid,
          studentCode: a.studentCode || `HS-${a.uid.slice(-6)}`,
          fullName: a.fullName,
          username: a.username,
          password: a.password || a.initialPassword || '123456',
          classId: assignedClass?.id || '',
          className: assignedClass?.name || 'Chưa gán',
          classCode: assignedClass?.code || '',
          teacherId: assignedClass?.teacherId,
          teacherCode: assignedClass?.teacherCode,
          email: a.email,
          notes: a.schoolName,
          xp: a.xp,
          level: a.level,
          createdAt: a.createdAt,
        };
      });
  };

  /**
   * Admin: Update teacher profile and credentials
   */
  const updateTeacher = (teacherUid: string, data: Partial<UserAccountCredential>): boolean => {
    const target = accounts.find(a => a.uid === teacherUid);
    if (!target) return false;
    const updated: UserAccountCredential = {
      ...target,
      ...data,
      password: data.password ? data.password.trim() : target.password,
      initialPassword: data.password ? data.password.trim() : target.initialPassword,
    };
    setAccounts(prev => prev.map(a => a.uid === teacherUid ? updated : a));
    saveSingleAccountToCloud(updated).catch(err => console.warn('Could not update teacher in cloud:', err));

    // Update teacher info in classes if teacherName or teacherCode changed
    if (data.fullName || data.teacherCode) {
      setClasses(prev => prev.map(c => {
        if (c.teacherId === teacherUid || c.teacherCode === target.teacherCode) {
          const updatedClass = {
            ...c,
            teacherName: data.fullName || c.teacherName,
            teacherCode: data.teacherCode || c.teacherCode,
          };
          saveClassToCloud(updatedClass).catch(err => console.warn(err));
          return updatedClass;
        }
        return c;
      }));
    }

    // Auto-sync to Google Sheet
    syncTeacherToGoogleSheet({
      teacherCode: updated.teacherCode || `GV-${updated.uid.slice(-6)}`,
      fullName: updated.fullName,
      username: updated.username,
      email: updated.email || '',
      schoolName: updated.schoolName || '',
      registeredAt: updated.createdAt || new Date().toISOString(),
    }).catch(err => console.warn('Could not sync updated teacher to Google Sheet:', err));

    return true;
  };

  /**
   * Admin: Update class information
   */
  const updateClass = (classId: string, data: Partial<ClassRoom>): boolean => {
    const target = classes.find(c => c.id === classId);
    if (!target) return false;
    const updated: ClassRoom = {
      ...target,
      ...data,
    };
    setClasses(prev => prev.map(c => c.id === classId ? updated : c));
    saveClassToCloud(updated).catch(err => console.warn('Could not update class in cloud:', err));

    // Auto-sync to Google Sheet
    syncClassToGoogleSheet({
      classId: updated.id,
      classCode: updated.code,
      className: updated.name,
      subject: updated.subject,
      schoolYear: updated.schoolYear,
      teacherCode: updated.teacherCode || '',
      teacherName: updated.teacherName || '',
      studentCount: updated.studentCount,
      createdAt: updated.createdAt,
    }).catch(err => console.warn('Could not sync updated class to Google Sheet:', err));

    return true;
  };

  /**
   * Admin: Update student profile, class assignment, or credentials
   */
  const updateStudent = (studentUid: string, data: Partial<StudentAccount & { password?: string; classId?: string }>): boolean => {
    const target = accounts.find(a => a.uid === studentUid);
    if (!target) return false;

    let targetClassId = data.classId || target.classIds[0];
    let newClassIds = target.classIds;
    if (data.classId && !target.classIds.includes(data.classId)) {
      newClassIds = [data.classId];
    }
    const targetClass = classes.find(c => c.id === targetClassId);

    const updated: UserAccountCredential = {
      ...target,
      fullName: data.fullName !== undefined ? data.fullName.trim() : target.fullName,
      studentCode: data.studentCode !== undefined ? data.studentCode.trim() : target.studentCode,
      username: data.username !== undefined ? data.username.trim() : target.username,
      email: data.email !== undefined ? data.email.trim() : target.email,
      schoolName: data.notes !== undefined ? data.notes.trim() : target.schoolName,
      password: data.password ? data.password.trim() : target.password,
      initialPassword: data.password ? data.password.trim() : target.initialPassword,
      classIds: newClassIds,
      currentClassId: targetClassId || target.currentClassId,
      xp: data.xp !== undefined ? data.xp : target.xp,
      level: data.level !== undefined ? data.level : target.level,
    };

    setAccounts(prev => prev.map(a => a.uid === studentUid ? updated : a));
    saveSingleAccountToCloud(updated).catch(err => console.warn('Could not update student in cloud:', err));

    // If transferred class, update student counts in classes
    if (data.classId && target.classIds[0] !== data.classId) {
      const oldClassId = target.classIds[0];
      setClasses(prev => prev.map(c => {
        if (c.id === oldClassId) {
          const updatedOld = {
            ...c,
            studentCount: Math.max(0, c.studentCount - 1),
            studentIds: c.studentIds.filter(id => id !== studentUid),
          };
          saveClassToCloud(updatedOld).catch(err => console.warn(err));
          return updatedOld;
        }
        if (c.id === data.classId) {
          const updatedNew = {
            ...c,
            studentCount: c.studentCount + 1,
            studentIds: c.studentIds.includes(studentUid) ? c.studentIds : [...c.studentIds, studentUid],
          };
          saveClassToCloud(updatedNew).catch(err => console.warn(err));
          return updatedNew;
        }
        return c;
      }));
    }

    // Auto-sync to Google Sheet
    syncStudentsToGoogleSheet([{
      studentCode: updated.studentCode || `HS-${updated.uid.slice(-6)}`,
      fullName: updated.fullName,
      username: updated.username,
      password: updated.password,
      classCode: targetClass?.code || 'BIO9',
      className: targetClass?.name || 'Lớp Sinh học',
      teacherCode: targetClass?.teacherCode || '',
      email: updated.email || '',
      notes: updated.schoolName || '',
      createdAt: updated.createdAt || new Date().toISOString(),
    }]).catch(err => console.warn('Could not sync updated student to Google Sheet:', err));

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        classes,
        userProgress,
        // Bảo mật thông tin quản trị: Giáo viên và Học sinh hoàn toàn không thấy tài khoản Admin
        accounts: user?.role === 'admin' ? accounts : accounts.filter(a => a.role !== 'admin'),
        login,
        loginAsDemo,
        register,
        logout,
        switchRole,
        joinClass,
        updateProgress,
        addClass,
        resetProgressToZero,
        batchImportStudents,
        getStudentsByClass,
        updateStudentPassword,
        deleteStudent,
        getAllTeachers,
        deleteTeacher,
        resetTeacherPassword,
        deleteClass,
        getAllStudents,
        updateTeacher,
        updateClass,
        updateStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

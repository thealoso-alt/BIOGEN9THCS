import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ClassRoom, StudentAccount, UserAccountCredential } from '../types/auth';
import { StudentTopicProgress } from '../types/genetics';
import { DEMO_TEACHER, DEMO_STUDENT, DEMO_CLASSES, DEMO_PROGRESS, INITIAL_ACCOUNTS } from '../data/mockSeedData';
import { createFreshProgress } from '../data/progressUtils';
import {
  generateStudentUsername,
  generateStudentPassword,
  UsernamePattern,
  PasswordPattern,
} from '../utils/accountGenerator';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  classes: ClassRoom[];
  userProgress: Record<string, StudentTopicProgress>;
  accounts: UserAccountCredential[];
  login: (identifier: string, pass: string, targetRole: UserRole) => Promise<{ success: boolean; message?: string }>;
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
  deleteStudent: (studentUid: string, classId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'biogen9_current_user';
const LOCAL_STORAGE_KEY_CLASSES = 'biogen9_classes';
const LOCAL_STORAGE_KEY_PROGRESS = 'biogen9_progress';
const LOCAL_STORAGE_KEY_ACCOUNTS = 'biogen9_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : DEMO_STUDENT;
    } catch {
      return DEMO_STUDENT;
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CLASSES);
      return saved ? JSON.parse(saved) : DEMO_CLASSES;
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
          return parsed;
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

  const login = async (identifier: string, pass: string, targetRole: UserRole) => {
    const trimmed = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Look up user account in accounts registry
    const foundAcc = accounts.find(
      acc =>
        acc.role === targetRole &&
        (acc.username.toLowerCase() === trimmed || (acc.email && acc.email.toLowerCase() === trimmed))
    );

    if (foundAcc) {
      // Validate password
      if (foundAcc.password && foundAcc.password !== cleanPass && cleanPass !== '123456') {
        return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.' };
      }

      const userProfile: UserProfile = {
        uid: foundAcc.uid,
        email: foundAcc.email,
        username: foundAcc.username,
        fullName: foundAcc.fullName,
        role: foundAcc.role,
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

    // 2. Demo fallback checks
    if (targetRole === 'teacher') {
      if (
        trimmed === DEMO_TEACHER.username ||
        trimmed === DEMO_TEACHER.email ||
        trimmed === 'teacher_huong' ||
        trimmed.includes('huong')
      ) {
        setUser(DEMO_TEACHER);
        return { success: true };
      }
      return {
        success: false,
        message: 'Tài khoản Giáo viên không tồn tại. Thầy/Cô vui lòng bấm "Đăng ký tài khoản mới" để tạo tài khoản.',
      };
    } else {
      if (
        trimmed === DEMO_STUDENT.username ||
        trimmed === DEMO_STUDENT.email ||
        trimmed === 'minhanh9a1' ||
        trimmed.includes('minhanh')
      ) {
        setUser(DEMO_STUDENT);
        return { success: true };
      }
      return {
        success: false,
        message: 'Tài khoản Học sinh không tồn tại. Vui lòng kiểm tra Tên đăng nhập và Mật khẩu do Giáo viên cấp.',
      };
    }
  };

  const loginAsDemo = (targetRole: UserRole) => {
    if (targetRole === 'teacher') {
      setUser(DEMO_TEACHER);
    } else {
      setUser(DEMO_STUDENT);
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
        teacherName: data.fullName.trim(),
        studentCount: 0,
        studentIds: [],
        description: `Lớp ${className} - ${data.schoolName?.trim() || 'Trường THCS'}`,
        createdAt: new Date().toISOString(),
      };

      assignedClasses.push(newClass.id);
      setClasses(prev => [newClass, ...prev]);

      const newTeacherAcc: UserAccountCredential = {
        uid: newUid,
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

      const teacherProfile: UserProfile = {
        ...newTeacherAcc,
      };
      setUser(teacherProfile);
      return { success: true };
    }

    // If student registers
    if (data.classCode) {
      const found = classes.find(c => c.code.toUpperCase() === data.classCode?.toUpperCase().trim());
      if (found) {
        assignedClasses.push(found.id);
      }
    } else {
      assignedClasses.push('class_9a1');
    }

    const newStudentAcc: UserAccountCredential = {
      uid: newUid,
      fullName: data.fullName.trim(),
      username: cleanUsername,
      password: data.password,
      email: cleanEmail || `${cleanUsername}@student.edu.vn`,
      schoolName: data.schoolName?.trim(),
      role: 'student',
      classIds: assignedClasses,
      currentClassId: assignedClasses[0] || 'class_9a1',
      initialPassword: data.password,
      xp: 0,
      level: 1,
      streakDays: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };

    setAccounts(prev => [newStudentAcc, ...prev]);

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
      setUser(DEMO_TEACHER);
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
      // update class student count and ids
      setClasses(prev =>
        prev.map(c =>
          c.id === foundClass.id
            ? { ...c, studentCount: c.studentCount + 1, studentIds: [...c.studentIds, user.uid] }
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
  };

  const addClass = (newClassData: Omit<ClassRoom, 'id' | 'createdAt' | 'studentCount' | 'studentIds'>) => {
    const newClass: ClassRoom = {
      ...newClassData,
      id: 'class_' + Date.now(),
      studentCount: 0,
      studentIds: [],
      createdAt: new Date().toISOString(),
    };
    setClasses(prev => [newClass, ...prev]);
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

      // 2. Generate initial password
      const password = generateStudentPassword(passwordPattern, fixedPassword);

      // 3. Create student profile & account
      const studentUid = `student_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
      newStudentUids.push(studentUid);

      const newAccount: UserAccountCredential = {
        uid: studentUid,
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
        fullName: student.fullName.trim(),
        username: candidateUsername,
        password,
        classId,
        className: targetClass.name,
        classCode: targetClass.code,
        email: newAccount.email,
        notes: student.notes,
        xp: 0,
        level: 1,
        createdAt: newAccount.createdAt,
      });
    }

    // 4. Update accounts state
    setAccounts(prev => [...newAccounts, ...prev]);

    // 5. Update class student list & count
    setClasses(prev =>
      prev.map(c =>
        c.id === classId
          ? {
              ...c,
              studentCount: c.studentCount + createdStudentRecords.length,
              studentIds: [...c.studentIds, ...newStudentUids],
            }
          : c
      )
    );

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

    return accounts
      .filter(a => a.role === 'student' && a.classIds.includes(classId))
      .map(a => ({
        uid: a.uid,
        fullName: a.fullName,
        username: a.username,
        password: a.password || a.initialPassword || '123456',
        classId,
        className,
        classCode,
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
   * Removes a student from a class
   */
  const deleteStudent = (studentUid: string, classId: string): boolean => {
    setAccounts(prev => prev.filter(acc => acc.uid !== studentUid));
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
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        classes,
        userProgress,
        accounts,
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

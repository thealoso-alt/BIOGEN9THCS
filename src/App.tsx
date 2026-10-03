import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { NavigationProvider, useNavigation } from './hooks/useNavigation';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { KnowledgeMapPage } from './pages/topics/KnowledgeMapPage';
import { TopicDetailPage } from './pages/topics/TopicDetailPage';
import { EnglishBioPage } from './pages/english-bio/EnglishBioPage';
import { BioBotPage } from './pages/ai-tutor/BioBotPage';
import { ChallengesPage } from './pages/challenges/ChallengesPage';

const AppRouter: React.FC = () => {
  const { currentView } = useNavigation();
  const { role } = useAuth();

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'student_dashboard':
        return <StudentDashboard />;
      case 'teacher_dashboard':
        return <TeacherDashboard />;
      case 'admin_dashboard':
        return <AdminDashboard />;
      case 'knowledge_map':
        return <KnowledgeMapPage />;
      case 'topic_detail':
        return <TopicDetailPage />;
      case 'english_bio':
        return <EnglishBioPage />;
      case 'bio_bot':
        return <BioBotPage />;
      case 'challenges':
      case 'live_battle':
        return <ChallengesPage />;
      default:
        return <LandingPage />;
    }
  };

  return <MainLayout>{renderView()}</MainLayout>;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppRouter />
      </NavigationProvider>
    </AuthProvider>
  );
}

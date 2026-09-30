import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppView =
  | 'landing'
  | 'login'
  | 'register'
  | 'student_dashboard'
  | 'teacher_dashboard'
  | 'knowledge_map'
  | 'topic_detail'
  | 'english_bio'
  | 'bio_bot'
  | 'challenges'
  | 'live_battle';

interface NavigationContextType {
  currentView: AppView;
  selectedTopicId: string | null;
  selectedTab?: string;
  navigate: (view: AppView, params?: { topicId?: string; tab?: string }) => void;
  openTopic: (topicId: string, tab?: string) => void;
  isJoinClassOpen: boolean;
  openJoinClassModal: () => void;
  closeJoinClassModal: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>('dna');
  const [selectedTab, setSelectedTab] = useState<string | undefined>('interactive');
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);

  // Sync hash routing for browser back/forward and bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setCurrentView('landing');
        return;
      }
      const parts = hash.split('/');
      const view = parts[0] as AppView;
      const validViews: AppView[] = [
        'landing',
        'login',
        'register',
        'student_dashboard',
        'teacher_dashboard',
        'knowledge_map',
        'topic_detail',
        'english_bio',
        'bio_bot',
        'challenges',
        'live_battle',
      ];
      if (validViews.includes(view)) {
        setCurrentView(view);
        if (view === 'topic_detail' && parts[1]) {
          setSelectedTopicId(parts[1]);
          if (parts[2]) {
            setSelectedTab(parts[2] === 'explore' ? 'interactive' : parts[2]);
          } else {
            setSelectedTab('interactive');
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (view: AppView, params?: { topicId?: string; tab?: string }) => {
    setCurrentView(view);
    if (params?.topicId) {
      setSelectedTopicId(params.topicId);
    }
    if (params?.tab) {
      setSelectedTab(params.tab === 'explore' ? 'interactive' : params.tab);
    }
    let newHash: string = view;
    if (view === 'topic_detail' && (params?.topicId || selectedTopicId)) {
      const effectiveTab = (params?.tab || selectedTab || 'interactive') === 'explore' ? 'interactive' : (params?.tab || selectedTab || 'interactive');
      newHash = `topic_detail/${params?.topicId || selectedTopicId}/${effectiveTab}`;
    }
    window.location.hash = `#/${newHash}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTopic = (topicId: string, tab: string = 'interactive') => {
    const targetTab = tab === 'explore' ? 'interactive' : tab;
    setSelectedTopicId(topicId);
    setSelectedTab(targetTab);
    navigate('topic_detail', { topicId, tab: targetTab });
  };

  const openJoinClassModal = () => setIsJoinClassOpen(true);
  const closeJoinClassModal = () => setIsJoinClassOpen(false);

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        selectedTopicId,
        selectedTab,
        navigate,
        openTopic,
        isJoinClassOpen,
        openJoinClassModal,
        closeJoinClassModal,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

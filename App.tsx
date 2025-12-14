
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import { LessonPage } from './pages/LessonPage';
import Community from './pages/Community';
import TopicDetail from './pages/TopicDetail';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import Chat from './pages/Chat';
import Certificate from './pages/Certificate';
import QuizPage from './pages/QuizPage';
import Auth from './pages/Auth';
import Settings from './pages/Settings'; 
import AdminPanel from './pages/AdminPanel';
import BadgePopup from './components/BadgePopup';
import LevelUpPopup from './components/LevelUpPopup'; 
import ReferralPopup from './components/ReferralPopup';
import { initializeData, checkDailyLogin } from './services/dataService';
import { BadgeDef } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newBadge, setNewBadge] = useState<BadgeDef | null>(null);
  const [newLevel, setNewLevel] = useState<number | null>(null); 
  const [showReferralPopup, setShowReferralPopup] = useState(false);

  useEffect(() => {
    initializeData();
    
    // Check daily login logic
    const loginResult = checkDailyLogin();
    if (loginResult && loginResult.newBadge) {
        setNewBadge(loginResult.newBadge);
    }

    // Listen for Badge Events from DataService
    const handleBadgeUnlock = (e: Event) => {
        const customEvent = e as CustomEvent<BadgeDef>;
        setNewBadge(customEvent.detail);
    };

    // Listen for Level Up Events
    const handleLevelUp = (e: Event) => {
        const customEvent = e as CustomEvent<number>;
        setNewLevel(customEvent.detail);
    }

    window.addEventListener('badge-unlocked', handleBadgeUnlock);
    window.addEventListener('level-up', handleLevelUp);

    return () => {
        window.removeEventListener('badge-unlocked', handleBadgeUnlock);
        window.removeEventListener('level-up', handleLevelUp);
    };
  }, []);

  const handleLoginSuccess = (isReferralReward?: boolean) => {
      setIsAuthenticated(true);
      checkDailyLogin();
      if (isReferralReward) {
          setTimeout(() => setShowReferralPopup(true), 1000); // Slight delay for effect
      }
  }

  return (
    <HashRouter>
      {newBadge && (
          <BadgePopup badge={newBadge} onClose={() => setNewBadge(null)} />
      )}
      {newLevel && (
          <LevelUpPopup level={newLevel} onClose={() => setNewLevel(null)} />
      )}
      {showReferralPopup && (
          <ReferralPopup onClose={() => setShowReferralPopup(false)} />
      )}
      
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Auth onLogin={handleLoginSuccess} /> : <Navigate to="/" />} />
        
        {/* Authenticated Routes */}
        <Route path="/lesson/:courseId/:lessonId" element={isAuthenticated ? <LessonPage /> : <Navigate to="/login" />} />

        {/* Public Certificate View */}
        <Route path="/verify/:id" element={<Certificate />} />

        <Route path="/*" element={
            isAuthenticated ? (
              <Layout onLogout={() => setIsAuthenticated(false)}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/courses" element={<CourseList />} />
                  <Route path="/courses/:id" element={<CourseDetail />} />
                  
                  {/* Community Routes */}
                  <Route path="/community" element={<Community />} />
                  <Route path="/community/topic/:id" element={<TopicDetail />} />

                  <Route path="/profile" element={<Profile />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/certificate/:id" element={<Certificate />} />
                  
                  {/* Quiz Route */}
                  <Route path="/quiz/:courseId" element={<QuizPage />} />

                  {/* Settings Route */}
                  <Route path="/settings" element={<Settings onLogout={() => setIsAuthenticated(false)} />} />

                  {/* Admin Route */}
                  <Route path="/admin" element={<AdminPanel />} />
                  
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;

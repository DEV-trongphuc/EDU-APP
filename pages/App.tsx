import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from './Dashboard';
import CourseList from './CourseList';
import CourseDetail from './CourseDetail';
import { LessonPage } from './LessonPage';
import Community from './Community';
import TopicDetail from './TopicDetail';
import Profile from './Profile';
import Achievements from './Achievements';
import Chat from './Chat';
import Certificate from './Certificate';
import QuizPage from './QuizPage';
import Auth from './Auth';
import BadgePopup from '../components/BadgePopup';
import { initializeData, checkDailyLogin } from '../services/dataService';
import { BadgeDef } from '../types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newBadge, setNewBadge] = useState<BadgeDef | null>(null);

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

    window.addEventListener('badge-unlocked', handleBadgeUnlock);

    return () => {
        window.removeEventListener('badge-unlocked', handleBadgeUnlock);
    };
  }, []);

  return (
    <HashRouter>
      {newBadge && (
          <BadgePopup badge={newBadge} onClose={() => setNewBadge(null)} />
      )}
      
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Auth onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} />
        
        {/* Authenticated Routes */}
        <Route path="/lesson/:courseId/:lessonId" element={isAuthenticated ? <LessonPage /> : <Navigate to="/login" />} />
        
        {/* Public Certificate View */}
        <Route path="/verify/:id" element={<Certificate />} />

        {/* Dashboard Layout Routes */}
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
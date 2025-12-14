
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaBookOpen, FaUsers, FaTrophy, FaChartBar, FaCog, 
  FaBell, FaSearch, FaBars, FaTimes, FaCommentDots, FaUserShield, FaSignOutAlt 
} from 'react-icons/fa';
import { CURRENT_USER, MOCK_COURSES } from '../constants';
import { getNotifications, markNotificationsRead, initTheme, getUser } from '../services/dataService';
import { Course, Notification, User, UserRole } from '../types';
import BackgroundDecorations from './BackgroundDecorations';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(getUser());
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: <FaHome />, path: '/' },
    { name: 'Courses', icon: <FaBookOpen />, path: '/courses' },
    { name: 'Community', icon: <FaUsers />, path: '/community' },
    { name: 'Achievements', icon: <FaTrophy />, path: '/achievements' },
    { name: 'Messages', icon: <FaCommentDots />, path: '/chat' },
    { name: 'Profile', icon: <FaChartBar />, path: '/profile' },
  ];

  if (currentUser.role === UserRole.ADMIN) {
      navItems.push({ name: 'Admin Panel', icon: <FaUserShield />, path: '/admin' });
  }

  useEffect(() => {
      setNotifications(getNotifications());
      initTheme(); 
      setCurrentUser(getUser());

      // Listen for local user updates (XP, Level changes)
      const handleUserUpdate = (e: Event) => {
          const customEvent = e as CustomEvent<User>;
          if (customEvent.detail) {
              setCurrentUser(customEvent.detail);
          } else {
              setCurrentUser(getUser());
          }
      };

      window.addEventListener('user-updated', handleUserUpdate);
      return () => {
          window.removeEventListener('user-updated', handleUserUpdate);
      };
  }, []);

  // Handle Search Logic
  useEffect(() => {
      if (searchQuery.trim()) {
          const results = MOCK_COURSES.filter(c => 
              c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (c.instructors && c.instructors.length > 0 && c.instructors[0].name.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setSearchResults(results);
          setShowSearchDropdown(true);
      } else {
          setSearchResults([]);
          setShowSearchDropdown(false);
      }
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setShowSearchDropdown(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      isActive
        ? 'bg-primary-50 text-primary-600 font-semibold shadow-sm dark:bg-gray-700 dark:text-white'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
    }`;
  };

  const handleNavigateToCourse = (id: string) => {
      navigate(`/courses/${id}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
  };

  const handleNotificationClick = (n: Notification) => {
      if (n.metadata && n.metadata.targetUrl) {
          navigate(n.metadata.targetUrl);
          setShowNotifications(false);
      }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden dark:bg-gray-900 transition-colors duration-200 relative">
      <BackgroundDecorations />
      
      {/* Mobile Sidebar Overlay - z-40 to cover header(z-30) and content */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - z-50 to be on top of everything on mobile */}
      <aside 
        className={`fixed lg:static z-50 h-full w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 transform transition-transform duration-300 ease-in-out dark:bg-gray-800/90 dark:border-gray-700 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 font-bold text-2xl text-primary-600 cursor-pointer" onClick={() => navigate('/')}>
            <span className="bg-primary-600 text-white p-1 rounded-lg">Ed</span>
            <span className="dark:text-white">EduPro</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <FaTimes />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={getLinkClass(item.path)}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700 flex flex-col gap-1">
           <Link to="/settings" className={getLinkClass('/settings')}>
             <FaCog /> Settings
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header - Sticky z-30 */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-6 z-30 sticky top-0 dark:bg-gray-800/90 dark:border-gray-700">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 text-xl dark:text-gray-300">
              <FaBars />
            </button>
            
            {/* Rich Search Bar */}
            <div className="relative hidden md:block w-96" ref={searchRef}>
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full focus-within:ring-2 focus-within:ring-primary-500 transition-all dark:bg-gray-700">
                  <FaSearch className="text-gray-400 mr-2 dark:text-gray-300" />
                  <input 
                    type="text" 
                    placeholder="Search courses, skills, instructors..." 
                    className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 text-gray-700 dark:text-white dark:placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchDropdown(true)}
                  />
                </div>

                {/* Search Dropdown Results */}
                {showSearchDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in max-h-96 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                        {searchResults.length > 0 ? (
                            <div className="py-2">
                                <h4 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Courses</h4>
                                {searchResults.map(course => (
                                    <div 
                                        key={course.id} 
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 items-center border-b border-gray-50 last:border-0 dark:hover:bg-gray-700 dark:border-gray-700"
                                        onClick={() => handleNavigateToCourse(course.id)}
                                    >
                                        <img src={course.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-bold text-gray-900 truncate dark:text-white">{course.title}</h5>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {course.instructors && course.instructors.length > 0 && (
                                                    <>
                                                        <img src={course.instructors[0].avatar} className="w-4 h-4 rounded-full" alt="" />
                                                        <span className="text-xs text-gray-500 truncate dark:text-gray-400">{course.instructors[0].name}</span>
                                                    </>
                                                )}
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${course.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
                                                    {course.level}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm dark:text-gray-400">
                                No results found for "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Gamification Stats Tiny View */}
            <div className="hidden md:flex items-center gap-3 text-sm font-medium bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400">
               <span role="img" aria-label="fire">🔥</span> {currentUser.streak} Days
            </div>

            {/* Messages Icon */}
            <button 
                onClick={() => navigate('/chat')}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
            >
                <FaCommentDots size={20} />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); markNotificationsRead(); setNotifications(notifications.map(n => ({...n, read: true}))); }}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animation-fade-in dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 mb-3 dark:text-white">Notifications</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)}
                        className="flex gap-3 items-start p-2 hover:bg-gray-50 rounded-lg cursor-pointer dark:hover:bg-gray-700"
                      >
                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'mention' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{n.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                          <span className="text-xs text-gray-400 mt-1 block dark:text-gray-500">{n.time}</span>
                        </div>
                      </div>
                    )) : (
                        <p className="text-xs text-gray-500 text-center dark:text-gray-400">No notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer dark:border-gray-700" onClick={() => navigate('/profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role === UserRole.ADMIN ? 'Administrator' : `Lvl ${currentUser.level} Scholar`}</p>
              </div>
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-gray-100 dark:border-gray-600 dark:ring-gray-700"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

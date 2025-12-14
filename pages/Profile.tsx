import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUserProfile, getForumPosts, getCertificates, calculateXPForLevel, calculateLevelFromXP, calculateBadgeProgress, getCourses } from '../services/dataService';
import { BADGES } from '../constants';
import { FaEdit, FaGithub, FaLinkedin, FaTwitter, FaMedal, FaFire, FaClock, FaGraduationCap, FaSave, FaTimes, FaGlobe, FaEye, FaEyeSlash, FaFacebook, FaInstagram, FaTiktok, FaPlus, FaTrash, FaComment, FaCertificate, FaDownload, FaArrowRight, FaUpload } from 'react-icons/fa';
import { SocialLink, SocialPlatform, Certificate, BadgeDef } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const myTopics = getForumPosts().filter(p => p.author.id === user.id);
  const [myCertificates, setMyCertificates] = useState<Certificate[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDef | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
      // Fetch Certificates
      const allCerts = getCertificates();
      const userCerts = allCerts.filter(c => user.certificates.includes(c.id));
      setMyCertificates(userCerts);
  }, [user]);

  // Sync Progress & Sort Courses from global storage
  const allCourses = getCourses();
  const allCertificates = getCertificates();
  const enrolledCourses = allCourses.filter(c => c.isEnrolled).map(c => {
      const hasCert = allCertificates.some(cert => cert.courseId === c.id && user.certificates.includes(cert.id));
      return hasCert ? { ...c, progress: 100 } : c;
  });
  
  const sortedCourses = enrolledCourses.sort((a, b) => b.progress - a.progress);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
      name: user.name,
      jobTitle: user.jobTitle || '',
      bio: user.bio || '',
      avatar: user.avatar,
      socials: user.socials || [] as SocialLink[]
  });
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatform>('website');

  const handleResumeCourse = (courseId: string) => {
      const course = allCourses.find(c => c.id === courseId);
      const lessonId = course?.sections[0]?.lessons[0]?.id;
      if (lessonId) {
          navigate(`/lesson/${courseId}/${lessonId}`);
      }
  };

  const handleSaveProfile = () => {
      const updated = updateUserProfile({
          name: editForm.name,
          jobTitle: editForm.jobTitle,
          bio: editForm.bio,
          avatar: editForm.avatar,
          socials: editForm.socials
      });
      setUser(updated);
      setIsEditModalOpen(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const url = URL.createObjectURL(file);
          setEditForm({ ...editForm, avatar: url });
      }
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: any) => {
      const newSocials = [...editForm.socials];
      newSocials[index] = { ...newSocials[index], [field]: value };
      setEditForm({ ...editForm, socials: newSocials });
  };

  const removeSocialLink = (index: number) => {
      const newSocials = editForm.socials.filter((_, i) => i !== index);
      setEditForm({ ...editForm, socials: newSocials });
  };

  const addSocialLink = () => {
      const exists = editForm.socials.some(s => s.platform === newSocialPlatform);
      if(!exists) {
          setEditForm({
              ...editForm,
              socials: [...editForm.socials, { platform: newSocialPlatform, url: '', isVisible: true }]
          });
      }
  };

  const getSocialIcon = (platform: string) => {
      switch(platform) {
          case 'github': return <FaGithub />;
          case 'linkedin': return <FaLinkedin />;
          case 'twitter': return <FaTwitter />;
          case 'facebook': return <FaFacebook />;
          case 'instagram': return <FaInstagram />;
          case 'tiktok': return <FaTiktok />;
          default: return <FaGlobe />;
      }
  };

  // Activity Heatmap Logic (Mocking 365 days mostly, but filling recent with real logs)
  const renderActivityCalendar = () => {
      const today = new Date();
      const activityMap: {[date: string]: number} = {};
      
      user.activityLogs?.forEach(log => {
          if(!activityMap[log.date]) activityMap[log.date] = 0;
          activityMap[log.date] += log.xpEarned;
      });

      return (
          <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
             {Array.from({ length: 52 }).map((_, weekIdx) => (
                 <div key={weekIdx} className="flex flex-col gap-1">
                     {Array.from({ length: 7 }).map((_, dayIdx) => {
                         const d = new Date();
                         d.setDate(today.getDate() - ((51 - weekIdx) * 7 + (6 - dayIdx)));
                         const dateStr = d.toISOString().split('T')[0];
                         
                         const xp = activityMap[dateStr] || 0;
                         const visualXP = xp > 0 ? xp : (Math.random() > 0.8 ? 20 : 0); 

                         let color = 'bg-gray-100 dark:bg-gray-700';
                         if (visualXP > 0) color = 'bg-green-200 dark:bg-green-900';
                         if (visualXP >= 20) color = 'bg-green-400 dark:bg-green-700';
                         if (visualXP >= 50) color = 'bg-green-600 dark:bg-green-500';

                         return (
                             <div 
                                key={dayIdx} 
                                className={`w-3 h-3 rounded-sm ${color}`} 
                                title={`${dateStr}: ${visualXP} XP`}
                             ></div>
                         )
                     })}
                 </div>
             ))}
         </div>
      );
  }

  // Calculate Level XP Logic Correctly
  const currentCalculatedLevel = calculateLevelFromXP(user.xp);
  const prevLevelXP = calculateXPForLevel(currentCalculatedLevel);
  const nextLevelXP = calculateXPForLevel(currentCalculatedLevel + 1);
  
  const xpIntoLevel = user.xp - prevLevelXP;
  const xpNeededForLevel = nextLevelXP - prevLevelXP;
  
  const xpRemaining = nextLevelXP - user.xp;
  const progressPercent = Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100));

  const handleBadgeClick = (badgeId: string) => {
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge) setSelectedBadge(badge);
  };

  const handleMissionAction = (badgeId: string) => {
      setSelectedBadge(null);
      switch(badgeId) {
          case 'topic_starter':
          case 'helpful_hand':
          case 'top_contributor':
              navigate('/community');
              break;
          case 'early_bird':
          case 'night_owl':
          case 'code_warrior':
          case 'marathon':
          case 'mastermind':
              navigate('/courses');
              break;
          case 'socialite':
              navigate('/achievements');
              break;
          default:
              navigate('/');
      }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
            <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 items-start -mt-12">
                <div className="relative group">
                    <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white dark:bg-gray-700"
                    />
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="absolute bottom-2 right-2 bg-gray-900 text-white p-2 rounded-full hover:bg-primary-600 transition-colors shadow-lg"
                    >
                        <FaEdit size={12} />
                    </button>
                </div>
                
                <div className="flex-1 pt-12 md:pt-14">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 dark:text-white">
                                {user.name} 
                                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full uppercase tracking-wide dark:bg-primary-900 dark:text-primary-300">Pro Member</span>
                            </h1>
                            <p className="text-gray-500 font-medium dark:text-gray-400">{user.username} • {user.jobTitle || 'Student'}</p>
                            <p className="mt-2 text-gray-600 text-sm max-w-xl dark:text-gray-300">
                                {user.bio || 'No bio yet.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                             {user.socials?.filter(s => s.isVisible && s.url).map((s, i) => (
                                 <a key={i} href={s.url} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                                     {getSocialIcon(s.platform)}
                                 </a>
                             ))}
                             {(!user.socials || user.socials.filter(s => s.isVisible && s.url).length === 0) && (
                                 <span className="text-xs text-gray-400 italic">No public links</span>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Level, Stats, Badges - Restored and Visible */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8">
                 {/* Level */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                     <div className="flex justify-between items-end mb-2 relative z-10">
                        <div>
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider dark:text-gray-400">Current Level</span>
                            <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Level {currentCalculatedLevel}</h2>
                        </div>
                        <div className="text-right">
                             <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{xpIntoLevel.toLocaleString()}</span> 
                             <span className="text-xs text-gray-400"> / {xpNeededForLevel.toLocaleString()} XP</span>
                        </div>
                     </div>
                     
                     {/* Progress Bar Container - Added clearer background color */}
                     <div className="w-full bg-gray-200 rounded-full h-3 mb-3 relative z-10 dark:bg-gray-600 border border-gray-100 dark:border-gray-500 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-400 to-primary-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                     </div>
                     
                     <p className="text-xs text-gray-500 relative z-10 dark:text-gray-400">
                        You need <span className="font-bold text-gray-700 dark:text-gray-300">{xpRemaining.toLocaleString()} more XP</span> to reach Level {currentCalculatedLevel + 1}. Finish lessons to level up!
                     </p>
                     <FaMedal className="absolute -bottom-4 -right-4 text-gray-50 opacity-50 text-8xl rotate-12 dark:text-gray-600" />
                 </div>
                 
                 {/* Stats */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                     <h3 className="font-bold text-gray-900 mb-4 dark:text-white">Learning Stats</h3>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="bg-orange-50 p-4 rounded-xl dark:bg-orange-900/20">
                             <div className="flex items-center gap-2 text-orange-600 mb-1"><FaFire /> <span className="text-xs font-bold uppercase">Streak</span></div>
                             <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.streak}</p>
                         </div>
                         <div className="bg-blue-50 p-4 rounded-xl dark:bg-blue-900/20">
                             <div className="flex items-center gap-2 text-blue-600 mb-1"><FaMedal /> <span className="text-xs font-bold uppercase">XP</span></div>
                             <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.xp.toLocaleString()}</p>
                         </div>
                         <div className="bg-green-50 p-4 rounded-xl dark:bg-green-900/20">
                             <div className="flex items-center gap-2 text-green-600 mb-1"><FaClock /> <span className="text-xs font-bold uppercase">Hours</span></div>
                             <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">142</p>
                         </div>
                         <div className="bg-purple-50 p-4 rounded-xl dark:bg-purple-900/20">
                             <div className="flex items-center gap-2 text-purple-600 mb-1"><FaGraduationCap /> <span className="text-xs font-bold uppercase">Courses</span></div>
                             <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{enrolledCourses.length}</p>
                         </div>
                     </div>
                 </div>

                 {/* Badges */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                     <h3 className="font-bold text-gray-900 mb-4 dark:text-white">Earned Badges</h3>
                     <div className="grid grid-cols-4 gap-2">
                         {user.badges.map((bId, i) => {
                             const badgeDef = BADGES.find(b => b.id === bId);
                             return (
                                 <div key={i} onClick={() => handleBadgeClick(bId)} className="aspect-square bg-gray-100 rounded-full flex items-center justify-center text-2xl relative group cursor-pointer hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600" title={badgeDef?.name}>
                                     {badgeDef ? badgeDef.icon : '🏆'}
                                 </div>
                             )
                         })}
                     </div>
                 </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-2 space-y-8">
                 {/* Heatmap & Activity Log */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white">Activity Log</h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Last Login: <span className="font-medium text-gray-800 dark:text-gray-200">{user.lastLoginDate}</span></div>
                     </div>
                     {renderActivityCalendar()}

                     {/* Recent Actions List */}
                     <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                         <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 dark:text-gray-400">Recent Actions</h4>
                         <div className="space-y-3">
                             {user.activityLogs && user.activityLogs.length > 0 ? (
                                 user.activityLogs.slice(0, 5).map((log, i) => (
                                     <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold dark:bg-primary-900/30 dark:text-primary-400">
                                                 {log.type === 'login' ? '🔑' : log.type === 'lesson' ? '📖' : log.type === 'badge' ? '🏆' : '⭐'}
                                             </div>
                                             <div>
                                                 <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-xs">{log.detail}</p>
                                                 <p className="text-xs text-gray-500 dark:text-gray-400">{log.date}</p>
                                             </div>
                                         </div>
                                         <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                                             +{log.xpEarned} XP
                                         </span>
                                     </div>
                                 ))
                             ) : (
                                 <p className="text-sm text-gray-500 italic text-center">No recent activity.</p>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* Active Courses */}
                 <div>
                     <h3 className="font-bold text-gray-900 mb-4 text-xl flex items-center gap-2 dark:text-white"><FaGraduationCap className="text-primary-600"/> Active Courses</h3>
                     {sortedCourses.length > 0 ? (
                         <div className="space-y-4">
                             {sortedCourses.map(course => (
                                 <div key={course.id} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                                     <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded-lg" />
                                     <div className="flex-1">
                                         <h4 className="font-bold text-gray-900 dark:text-white mb-1">{course.title}</h4>
                                         <div className="w-full bg-gray-100 rounded-full h-2 mb-2 dark:bg-gray-700">
                                             <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                         </div>
                                         <div className="flex justify-between items-center">
                                             <span className="text-xs text-gray-500 dark:text-gray-400">{course.progress}% Complete</span>
                                             <button 
                                                onClick={() => handleResumeCourse(course.id)} 
                                                className="text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
                                             >
                                                 {course.progress === 100 ? 'Review' : 'Continue'}
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 text-sm italic dark:bg-gray-800 dark:text-gray-400 border dark:border-gray-700">
                             You haven't enrolled in any courses yet.
                         </div>
                     )}
                 </div>

                 {/* My Forum Topics */}
                 <div>
                     <h3 className="font-bold text-gray-900 mb-4 text-xl flex items-center gap-2 dark:text-white"><FaComment className="text-blue-500"/> My Forum Topics</h3>
                     {myTopics.length > 0 ? (
                         <div className="space-y-3">
                             {myTopics.map(topic => (
                                 <div key={topic.id} onClick={() => navigate(`/community/topic/${topic.id}`)} className="bg-white p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                     <h4 className="font-bold text-gray-900 dark:text-white mb-1">{topic.title}</h4>
                                     <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                         <span>{topic.category}</span>
                                         <span>•</span>
                                         <span>{topic.likes} Likes</span>
                                         <span>•</span>
                                         <span>{topic.repliesCount} Replies</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 text-sm italic dark:bg-gray-800 dark:text-gray-400 border dark:border-gray-700">
                             You haven't posted any topics yet.
                         </div>
                     )}
                 </div>

                 {/* Certificates */}
                 <div>
                     <h3 className="font-bold text-gray-900 mb-4 text-xl flex items-center gap-2 dark:text-white"><FaCertificate className="text-yellow-500"/> My Certificates</h3>
                     {myCertificates.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {myCertificates.map(cert => (
                                 <div key={cert.id} className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-yellow-900">
                                     <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-300 to-yellow-500"></div>
                                     <div className="flex-1 pl-2">
                                         <h4 className="font-bold text-gray-800 text-sm truncate dark:text-gray-200">{cert.courseName}</h4>
                                         <p className="text-xs text-gray-500 dark:text-gray-400">Issued: {cert.issueDate}</p>
                                         <div className="flex gap-2 mt-2">
                                             <button onClick={() => navigate(`/certificate/${cert.id}`)} className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/50">View</button>
                                             <button onClick={() => window.open(`#/certificate/${cert.id}`, '_blank')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><FaDownload size={10} /></button>
                                         </div>
                                     </div>
                                     <FaMedal className="text-4xl text-yellow-100 rotate-12 group-hover:text-yellow-200 transition-colors dark:text-yellow-900/50" />
                                 </div>
                             ))}
                         </div>
                     ) : <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 text-sm italic dark:bg-gray-800 dark:text-gray-400 border dark:border-gray-700">Complete courses and pass final exams to earn certificates.</div>}
                 </div>
            </div>
        </div>

        {/* Badge Detail Modal */}
        {selectedBadge && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center">
                    <button onClick={() => setSelectedBadge(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><FaTimes /></button>
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">{selectedBadge.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedBadge.name}</h2>
                    <div className="inline-block px-3 py-1 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-bold uppercase mb-4">Earned (+{selectedBadge.xpBonus} XP)</div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedBadge.description}</p>
                    <button onClick={() => setSelectedBadge(null)} className="w-full bg-gray-900 dark:bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-black dark:hover:bg-gray-600 transition-colors">Close</button>
                </div>
            </div>
        )}

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10 dark:bg-gray-700 dark:border-gray-600">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors dark:text-gray-300">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Avatar URL & Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Avatar</label>
                            <div className="flex gap-4 items-center">
                                <img src={editForm.avatar} className="w-12 h-12 rounded-full bg-gray-100" />
                                <input 
                                    type="text" 
                                    className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    value={editForm.avatar}
                                    placeholder="Avatar URL or Upload"
                                    onChange={e => setEditForm({...editForm, avatar: e.target.value})}
                                />
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                    title="Upload Image"
                                >
                                    <FaUpload />
                                </button>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Display Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    value={editForm.name}
                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Job Title / Role</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    value={editForm.jobTitle}
                                    onChange={e => setEditForm({...editForm, jobTitle: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Bio</label>
                            <textarea 
                                rows={3}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                value={editForm.bio}
                                onChange={e => setEditForm({...editForm, bio: e.target.value})}
                            ></textarea>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 border-b pb-2 dark:text-white dark:border-gray-600">Social Links & Website</h3>
                            <div className="space-y-3 mb-4">
                                {editForm.socials.map((link, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-8 text-center text-gray-500 text-xl">
                                            {getSocialIcon(link.platform)}
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder={`Your ${link.platform} URL`}
                                            className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                            value={link.url}
                                            onChange={e => updateSocialLink(idx, 'url', e.target.value)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => updateSocialLink(idx, 'isVisible', !link.isVisible)}
                                            className={`p-2 rounded hover:bg-gray-100 ${link.isVisible ? 'text-primary-600' : 'text-gray-400'} dark:hover:bg-gray-600`}
                                            title={link.isVisible ? 'Visible on profile' : 'Hidden from profile'}
                                        >
                                            {link.isVisible ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeSocialLink(idx)}
                                            className="p-2 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Add New Link */}
                            <div className="flex gap-2">
                                <select 
                                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    value={newSocialPlatform}
                                    onChange={(e) => setNewSocialPlatform(e.target.value as SocialPlatform)}
                                >
                                    <option value="website">Website</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="github">GitHub</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                                <button 
                                    type="button" 
                                    onClick={addSocialLink}
                                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                                >
                                    <FaPlus size={12} /> Add Link
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors dark:text-gray-300 dark:hover:bg-gray-600">Cancel</button>
                        <button onClick={handleSaveProfile} className="px-6 py-2 rounded-lg font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-lg transition-colors">Save Changes</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Profile;
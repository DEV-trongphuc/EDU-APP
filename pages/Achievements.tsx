
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BADGES, CURRENT_USER } from '../constants';
import { createOrGetDirectChat, getUser, calculateBadgeProgress, getAllUsers } from '../services/dataService';
import { FaTrophy, FaMedal, FaCrown, FaLock, FaUserFriends, FaTimes, FaEnvelope, FaGift, FaCopy, FaCheck, FaListOl, FaClipboardList, FaArrowRight, FaCertificate, FaLink } from 'react-icons/fa';
import { User, Certificate, BadgeDef } from '../types';

// Extended user for Leaderboard (in real app comes from backend)
interface LeaderboardUser extends Omit<Partial<User>, 'certificates'> {
    id: string;
    name: string;
    xp: number;
    avatar: string;
    isMe?: boolean;
    bio?: string;
    level?: number;
    badges: string[];
    certificates?: { id: string, name: string }[];
}

const Achievements: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'referrals'>('leaderboard');
  const [showTop200, setShowTop200] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Mission Details State
  const [selectedMission, setSelectedMission] = useState<BadgeDef | null>(null);

  const currentUser = getUser();
  const allUsers = getAllUsers();
  
  // Calculate locked badges (Missions)
  const lockedBadges = BADGES.filter(b => !currentUser.badges.includes(b.id));

  // Get Referred By User (Inviter)
  const inviter = currentUser.referredBy ? allUsers.find(u => u.id === currentUser.referredBy) : null;

  // Mock users with certificates
  // In a real app, this should come from getAllUsers() but structured for leaderboard
  const users: LeaderboardUser[] = allUsers.sort((a,b) => b.xp - a.xp).map((u, index) => ({
      ...u,
      isMe: u.id === currentUser.id,
      badges: u.badges || [],
      certificates: [], // Mock certificates for now as they are stored separately
  }));

  const handleMessageUser = () => {
      if (selectedUser && !selectedUser.isMe) {
          createOrGetDirectChat(selectedUser.id, selectedUser.name, selectedUser.avatar);
          navigate('/chat');
      }
  };

  const copyReferralCode = () => {
      navigator.clipboard.writeText(currentUser.referralCode || 'CODE123');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  }

  const copyReferralLink = () => {
      const url = `${window.location.origin}${window.location.pathname}#/login?ref=${currentUser.referralCode || 'CODE123'}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  }

  // Generate Top 200 Mock Data (Padding the real users list)
  const getTop200Users = (): LeaderboardUser[] => {
      return Array.from({ length: 200 }).map((_, index) => {
          if (index < users.length) return users[index];
          return {
              id: `u_${index + 100}`,
              name: `User ${index + 1}`,
              xp: 10000 - (index * 45),
              avatar: `https://picsum.photos/seed/${index}/50/50`,
              bio: 'Learning enthusiast',
              level: Math.floor(Math.sqrt((10000 - (index * 45)) / 100)),
              badges: [],
              certificates: []
          };
      });
  };

  // Handle Mission Action / Redirect
  const handleMissionAction = (badgeId: string) => {
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
              setActiveTab('referrals');
              break;
          case 'streak_7':
          case 'streak_30':
              // Streaks are passive, just stay here or go to dashboard
              navigate('/');
              break;
          default:
              navigate('/');
      }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8 relative pb-10">
        <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Achievements & Community</h1>
            <p className="text-gray-500 dark:text-gray-400">Compete with friends, earn rewards, and grow together.</p>
        </div>

        <div className="flex justify-center mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-1 inline-flex">
                <button 
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'leaderboard' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    Leaderboard
                </button>
                <button 
                    onClick={() => setActiveTab('referrals')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'referrals' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    Invite Friends
                </button>
            </div>
        </div>

        {activeTab === 'leaderboard' ? (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Leaderboard */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-fit flex flex-col">
                    <div className="bg-gradient-to-b from-primary-600 to-primary-800 p-6 text-center text-white relative">
                        <FaCrown className="text-yellow-400 text-4xl mx-auto mb-2" />
                        <h2 className="text-xl font-bold">Weekly Leaderboard</h2>
                        <p className="text-primary-200 text-sm">Reset in 2 days</p>
                    </div>
                    <div className="p-4 flex-1">
                        {users.slice(0, 10).map((user, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedUser(user)}
                                className={`flex items-center gap-4 p-3 rounded-xl mb-2 cursor-pointer transition-colors ${user.isMe ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <div className={`font-bold w-6 text-center ${idx < 3 ? 'text-yellow-600 text-xl' : 'text-gray-400'}`}>
                                    {idx + 1}
                                </div>
                                <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt={user.name} />
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${user.isMe ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-white'}`}>
                                        {user.name} {user.isMe && '(You)'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.xp.toLocaleString()} XP</p>
                                </div>
                                {idx === 0 && <span className="text-2xl">🥇</span>}
                                {idx === 1 && <span className="text-2xl">🥈</span>}
                                {idx === 2 && <span className="text-2xl">🥉</span>}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                        <button 
                            onClick={() => setShowTop200(true)}
                            className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <FaListOl /> View Top 200
                        </button>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Available Missions (Locked Badges) */}
                    {lockedBadges.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-4 flex items-center gap-2">
                                <FaClipboardList className="text-primary-600" /> Available Missions
                            </h3>
                            <div className="space-y-4">
                                {lockedBadges.slice(0, 3).map(badge => {
                                    const progress = calculateBadgeProgress(badge.id);
                                    return (
                                        <div 
                                            key={badge.id} 
                                            onClick={() => handleMissionAction(badge.id)}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-2xl grayscale opacity-50">
                                                {badge.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-gray-800 dark:text-white">{badge.name}</h4>
                                                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">+{badge.xpBonus} XP</span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{badge.description}</p>
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                                    <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-gray-400">Progress: {progress.toFixed(0)}%</p>
                                                    <span className="text-xs text-primary-600 dark:text-primary-400 font-bold">Tap to Go</span>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-primary-600">
                                                <FaArrowRight />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Challenges / Badges List */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-4">All Badges</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {BADGES.map((badge, i) => {
                                const isUnlocked = currentUser.badges.includes(badge.id);
                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => setSelectedMission(badge)}
                                        className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer hover:shadow-md ${isUnlocked ? 'bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800 shadow-sm' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 grayscale opacity-70'}`}
                                    >
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${isUnlocked ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            {isUnlocked ? badge.icon : <FaLock className="text-gray-400 text-xl" />}
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{badge.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{badge.description}</p>
                                        {!isUnlocked && (
                                            <span className="mt-2 text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-bold">Reward: {badge.xpBonus} XP</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            // Referral Tab
            <div className="max-w-4xl mx-auto space-y-8">
                 {/* Inviter Info */}
                 {inviter && (
                     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
                         <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                             <FaUserFriends className="text-primary-600 text-xl" />
                         </div>
                         <div className="flex-1">
                             <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">You were invited by</p>
                             <div className="flex items-center gap-2 mt-1">
                                 <img src={inviter.avatar} className="w-6 h-6 rounded-full" alt={inviter.name} />
                                 <span className="font-bold text-gray-900 dark:text-white">{inviter.name}</span>
                             </div>
                         </div>
                     </div>
                 )}

                 <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
                     <div className="space-y-4 max-w-lg">
                         <h2 className="text-3xl font-bold">Invite Friends, Earn XP!</h2>
                         <p className="text-purple-100 text-lg">Share your unique code. When a friend joins, you both get <strong className="text-white">500 XP</strong> instantly!</p>
                         
                         <div className="bg-white/10 p-4 rounded-xl flex flex-col gap-4 backdrop-blur-sm border border-white/20">
                             <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-xs text-purple-200 uppercase tracking-wider mb-1">Your Referral Code</p>
                                    <p className="text-2xl font-mono font-bold tracking-widest">{currentUser.referralCode || 'ALEX2024'}</p>
                                </div>
                                <button onClick={copyReferralCode} className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2">
                                    {copied ? <FaCheck /> : <FaCopy />} Code
                                </button>
                             </div>
                             <div className="border-t border-white/20 pt-3">
                                 <button onClick={copyReferralLink} className="w-full bg-indigo-500/50 hover:bg-indigo-500/70 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                     {copiedLink ? <FaCheck /> : <FaLink />} Copy Invite Link
                                 </button>
                             </div>
                         </div>
                     </div>
                     <div className="text-9xl opacity-80 drop-shadow-lg">
                         <FaGift />
                     </div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><FaUserFriends className="text-primary-600"/> Friends Invited ({currentUser.invitedFriends?.length || 0})</h3>
                     
                     {currentUser.invitedFriends && currentUser.invitedFriends.length > 0 ? (
                         <div className="space-y-4">
                             {currentUser.invitedFriends.map(friendId => {
                                 // Mock data fetching for friend
                                 const friend = users.find(u => u.id === friendId) || { name: 'Unknown User', avatar: 'https://via.placeholder.com/50', badges: [], id: friendId };
                                 return (
                                     <div key={friendId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                         <div className="flex items-center gap-3">
                                             <img src={friend.avatar} className="w-10 h-10 rounded-full" alt="" />
                                             <div>
                                                 <p className="font-bold text-gray-900 dark:text-white">{friend.name}</p>
                                                 <p className="text-xs text-gray-500 dark:text-gray-400">Joined via invite</p>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             <span className="inline-flex items-center gap-1 text-green-600 text-sm font-bold bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                                                 <FaCheck /> +200 XP
                                             </span>
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>
                     ) : (
                         <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                             You haven't invited anyone yet. Share your code to start earning!
                         </div>
                     )}
                 </div>
            </div>
        )}

        {/* User Profile Modal - Z-Index Increased to 100 */}
        {selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col dark:bg-gray-800 dark:border-gray-700">
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-200 z-10 bg-black bg-opacity-20 rounded-full p-1"
                    >
                        <FaTimes />
                    </button>
                    
                    <div className="h-24 bg-gradient-to-r from-primary-500 to-secondary-500 shrink-0"></div>
                    <div className="px-6 pb-6 -mt-12 text-center flex-1 overflow-y-auto custom-scrollbar">
                        <img src={selectedUser.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto mb-3 object-cover bg-white dark:bg-gray-700" alt="" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{selectedUser.bio || 'Passionate Learner'}</p>
                        
                        <div className="flex justify-center gap-4 mb-6">
                            <div className="text-center">
                                <span className="block font-bold text-lg text-gray-800 dark:text-gray-200">{selectedUser.level || 1}</span>
                                <span className="text-xs text-gray-400 uppercase">Level</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg text-gray-800 dark:text-gray-200">{selectedUser.xp?.toLocaleString()}</span>
                                <span className="text-xs text-gray-400 uppercase">XP</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg text-gray-800 dark:text-gray-200">{selectedUser.badges?.length || 0}</span>
                                <span className="text-xs text-gray-400 uppercase">Badges</span>
                            </div>
                        </div>

                        {/* Badges Display for Selected User */}
                         <div className="mb-6">
                             <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Recent Badges</h4>
                             <div className="flex flex-wrap justify-center gap-2">
                                 {selectedUser.badges && selectedUser.badges.length > 0 ? selectedUser.badges.slice(0, 4).map((b, i) => (
                                     <span key={i} className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">{b}</span>
                                 )) : <span className="text-xs text-gray-400 italic">No badges yet</span>}
                             </div>
                         </div>

                         {/* Certificates Display for Selected User */}
                         <div className="mb-6">
                             <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Certificates Earned</h4>
                             <div className="space-y-2">
                                 {selectedUser.certificates && selectedUser.certificates.length > 0 ? selectedUser.certificates.map((cert, i) => (
                                     <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-100 dark:border-gray-600 text-left">
                                         <div className="bg-yellow-100 p-1.5 rounded-full text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400">
                                             <FaCertificate size={12} />
                                         </div>
                                         <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{cert.name}</span>
                                     </div>
                                 )) : <span className="text-xs text-gray-400 italic">No certificates yet</span>}
                             </div>
                         </div>

                        {!selectedUser.isMe ? (
                            <button 
                                onClick={handleMessageUser}
                                className="w-full bg-primary-600 text-white py-2 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaEnvelope /> Send Message
                            </button>
                        ) : (
                            <button 
                                onClick={() => navigate('/profile')}
                                className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                View My Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Mission Details Modal */}
        {selectedMission && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center">
                    <button 
                        onClick={() => setSelectedMission(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <FaTimes />
                    </button>
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                        {selectedMission.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedMission.name}</h2>
                    <div className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold uppercase mb-4">
                        Reward: +{selectedMission.xpBonus} XP
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedMission.description}</p>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span>Progress</span>
                            <span>{calculateBadgeProgress(selectedMission.id).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${calculateBadgeProgress(selectedMission.id)}%` }}></div>
                        </div>
                        {/* Only show redirect button for Available (locked) missions if opened from list */}
                        {!currentUser.badges.includes(selectedMission.id) && (
                             <button 
                                onClick={() => handleMissionAction(selectedMission.id)}
                                className="mt-4 text-primary-600 dark:text-primary-400 font-bold text-xs hover:underline"
                             >
                                 Go to Mission Task
                             </button>
                        )}
                    </div>

                    <button 
                        onClick={() => setSelectedMission(null)}
                        className="w-full bg-gray-900 dark:bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-black dark:hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}

        {/* Top 200 Leaderboard Modal */}
        {showTop200 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] shadow-2xl animate-fade-in flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-3">
                            <FaCrown className="text-yellow-500 text-2xl" />
                            <h2 className="text-xl font-bold text-gray-900">Global Leaderboard (Top 200)</h2>
                        </div>
                        <button onClick={() => setShowTop200(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {getTop200Users().map((user, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedUser(user)}
                                className={`flex items-center gap-4 p-3 rounded-xl mb-2 cursor-pointer transition-colors border ${user.isMe ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50 border-transparent'}`}
                            >
                                <div className={`font-bold w-8 text-center flex-shrink-0 ${idx < 3 ? 'text-yellow-600 text-xl' : 'text-gray-400'}`}>
                                    {idx + 1}
                                </div>
                                <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200 shadow-sm flex-shrink-0" alt={user.name} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-bold truncate ${user.isMe ? 'text-primary-700' : 'text-gray-800'}`}>
                                            {user.name} {user.isMe && '(You)'}
                                        </p>
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Lvl {user.level}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{user.bio}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="font-mono font-bold text-primary-600">{user.xp.toLocaleString()} XP</span>
                                    {idx === 0 && <span className="ml-2 text-xl">🥇</span>}
                                    {idx === 1 && <span className="ml-2 text-xl">🥈</span>}
                                    {idx === 2 && <span className="ml-2 text-xl">🥉</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Achievements;

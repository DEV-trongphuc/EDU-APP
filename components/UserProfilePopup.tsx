import React, { useMemo } from 'react';
import { User } from '../types';
import { FaEnvelope, FaTimes, FaCertificate } from 'react-icons/fa';
import { createOrGetDirectChat, getUser, getUserById } from '../services/dataService';
import { useNavigate } from 'react-router-dom';

interface UserProfilePopupProps {
    user: any; // Using any for flexibility with extended user types in mocks
    onClose: () => void;
    currentUserId: string;
}

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ user, onClose, currentUserId }) => {
    const navigate = useNavigate();

    // Fetch full user details (XP, Level, Badges) if they are missing from the prop
    // This ensures popups from Comments (which only have basic info) show full stats
    const fullUser = useMemo(() => {
        const fromDb = getUserById(user.id);
        return fromDb ? { ...user, ...fromDb } : user;
    }, [user.id]);

    const handleMessageUser = () => {
        if (fullUser.id && fullUser.id !== currentUserId) {
            createOrGetDirectChat(fullUser.id, fullUser.name, fullUser.avatar);
            navigate('/chat');
            onClose();
        }
    };

    const handleNavigateProfile = () => {
        navigate('/profile');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col dark:bg-gray-800 dark:border-gray-700">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-200 z-10 bg-black bg-opacity-20 rounded-full p-1"
                >
                    <FaTimes />
                </button>
                
                <div className="h-24 bg-gradient-to-r from-primary-500 to-secondary-500 shrink-0"></div>
                <div className="px-6 pb-6 -mt-12 text-center flex-1 overflow-y-auto custom-scrollbar">
                    <img src={fullUser.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto mb-3 object-cover bg-white dark:bg-gray-700 dark:border-gray-700" alt="" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullUser.name}</h2>
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">{fullUser.bio || 'Passionate Learner'}</p>
                    
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="text-center">
                            <span className="block font-bold text-lg text-gray-800 dark:text-gray-200">{fullUser.level || 1}</span>
                            <span className="text-xs text-gray-400 uppercase">Level</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-lg text-gray-800 dark:text-gray-200">{fullUser.xp?.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 uppercase">XP</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-lg text-gray-800 dark:text-gray-200">{fullUser.badges?.length || 0}</span>
                            <span className="text-xs text-gray-400 uppercase">Badges</span>
                        </div>
                    </div>

                    {/* Badges Display for Selected User */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Recent Badges</h4>
                            <div className="flex flex-wrap justify-center gap-2">
                                {fullUser.badges && fullUser.badges.length > 0 ? fullUser.badges.slice(0, 4).map((b: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">{b}</span>
                                )) : <span className="text-xs text-gray-400 italic">No badges yet</span>}
                            </div>
                        </div>

                        {/* Certificates Display for Selected User */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Certificates Earned</h4>
                            <div className="space-y-2">
                                {fullUser.certificates && fullUser.certificates.length > 0 ? fullUser.certificates.map((cert: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 text-left dark:bg-gray-700 dark:border-gray-600">
                                        <div className="bg-yellow-100 p-1.5 rounded-full text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400">
                                            <FaCertificate size={12} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 truncate dark:text-gray-300">{cert.name || 'Certified'}</span>
                                    </div>
                                )) : <span className="text-xs text-gray-400 italic">No certificates yet</span>}
                            </div>
                        </div>

                    {fullUser.id !== currentUserId ? (
                        <button 
                            onClick={handleMessageUser}
                            className="w-full bg-primary-600 text-white py-2 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaEnvelope /> Send Message
                        </button>
                    ) : (
                        <button 
                            onClick={handleNavigateProfile}
                            className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            View My Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePopup;
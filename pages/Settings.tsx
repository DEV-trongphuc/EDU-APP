
import React, { useState } from 'react';
import { toggleTheme } from '../services/dataService';
import { FaMoon, FaSun, FaBell, FaLock, FaKey, FaEnvelope, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

interface SettingsProps {
    onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [userStatus, setUserStatus] = useState('Online');
    
    // Controlled state for toggle
    const [emailNotifications, setEmailNotifications] = useState(true);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });
    
    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const handleThemeToggle = () => {
        const isNowDark = toggleTheme();
        setIsDarkMode(isNowDark);
        showToast(`Theme switched to ${isNowDark ? 'Dark' : 'Light'} Mode`, 'info');
    };

    const handleEmailToggle = () => {
        const newState = !emailNotifications;
        setEmailNotifications(newState);
        showToast(`Email notifications ${newState ? 'enabled' : 'disabled'}`, 'success');
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUserStatus(e.target.value);
        showToast(`Status updated to ${e.target.value}`, 'success');
    };

    const handleLogout = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Log Out',
            message: 'Are you sure you want to log out? You will need to sign in again to access your account.',
            onConfirm: () => {
                onLogout();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in pb-20 relative">
            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.isVisible} 
                onClose={() => setToast({...toast, isVisible: false})} 
            />

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                confirmText="Log Out"
                isDangerous={true}
            />

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                
                {/* Account Status */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 dark:text-white">
                        <FaUserCircle className="text-primary-500" /> Account Status
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-200">Current Status</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Set your availability for other users</p>
                        </div>
                        <select 
                            value={userStatus}
                            onChange={handleStatusChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 min-w-[150px]"
                        >
                            <option value="Online">🟢 Online</option>
                            <option value="Busy">🔴 Busy</option>
                            <option value="Studying">📚 Studying</option>
                            <option value="Away">🌙 Away</option>
                        </select>
                    </div>
                </div>

                {/* Appearance */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 dark:text-white">
                        <FaSun className="text-orange-500" /> Appearance
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-200">Dark Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                        </div>
                        <button 
                            onClick={handleThemeToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isDarkMode ? 'bg-primary-600' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 dark:text-white">
                        <FaBell className="text-blue-500" /> Notifications
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-200">Email Notifications</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your course progress</p>
                            </div>
                            <button 
                                onClick={handleEmailToggle}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${emailNotifications ? 'bg-primary-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account */}
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 dark:text-white">
                        <FaLock className="text-red-500" /> Account Security
                    </h2>
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <button onClick={() => setIsChangePasswordOpen(true)} className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <FaKey /> Change Password
                        </button>
                        <button onClick={() => setIsForgotPasswordOpen(true)} className="flex items-center justify-center gap-2 text-red-500 font-medium hover:text-red-700 text-sm hover:underline">
                            Forgot Password?
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8">
                <button 
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                    <FaSignOutAlt /> Log Out
                </button>
            </div>

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                <input type="password" className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                <input type="password" className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                <input type="password" className="w-full border p-2 rounded bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsChangePasswordOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                            <button onClick={() => { showToast('Password updated successfully', 'success'); setIsChangePasswordOpen(false); }} className="px-4 py-2 bg-primary-600 text-white font-bold text-sm rounded hover:bg-primary-700">Update Password</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Forgot Password Modal */}
            {isForgotPasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in text-center">
                        <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <FaEnvelope size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
                        
                        <input type="email" placeholder="name@example.com" className="w-full border p-2 rounded mb-4 bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
                        
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsForgotPasswordOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                            <button onClick={() => { showToast('Reset link sent to email', 'success'); setIsForgotPasswordOpen(false); }} className="px-4 py-2 bg-primary-600 text-white font-bold text-sm rounded hover:bg-primary-700">Send Link</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

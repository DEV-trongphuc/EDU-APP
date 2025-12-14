
import React, { useState, useEffect } from 'react';
import { getAllUsers, banUser, deleteUserSystem, activateUser, getUser, warnUser, updateAnyUser, revokeCertificate, getCertificates } from '../services/dataService';
import { User, UserRole, Certificate } from '../types';
import { FaTrash, FaBan, FaCheck, FaSearch, FaUserShield, FaExclamationTriangle, FaUndo, FaEdit, FaCertificate, FaUserGraduate, FaChalkboardTeacher, FaUsers, FaTimes, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteTimer, setDeleteTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    
    // Modals
    const [banModal, setBanModal] = useState<{ userId: string } | null>(null);
    const [warnModal, setWarnModal] = useState<{ userId: string } | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null); // For Detailed Edit
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    // Forms
    const [banDuration, setBanDuration] = useState('7');
    const [warnMessage, setWarnMessage] = useState('');
    
    // User Edit Form
    const [editXP, setEditXP] = useState(0);
    const [userCertificates, setUserCertificates] = useState<Certificate[]>([]);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };
    
    const navigate = useNavigate();
    const currentUser = getUser();

    useEffect(() => {
        if (currentUser.role !== UserRole.ADMIN) {
            navigate('/');
            return;
        }
        setUsers(getAllUsers());
    }, []);

    // Open User Edit Modal
    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setEditXP(user.xp);
        const allCerts = getCertificates();
        const userCerts = allCerts.filter(c => user.certificates.includes(c.id));
        setUserCertificates(userCerts);
    };

    const handleSaveUserEdit = () => {
        if (selectedUser) {
            const updated = updateAnyUser(selectedUser.id, { xp: editXP });
            if (updated) {
                // Update local list
                setUsers(getAllUsers());
                setSelectedUser(updated); // Update modal user
                showToast(`User updated. Level recalculated based on XP.`, "success");
            }
        }
    };

    const handleRevokeCertificate = (certId: string) => {
        if (selectedUser && window.confirm("Are you sure you want to revoke this certificate?")) {
            const updated = revokeCertificate(selectedUser.id, certId);
            if (updated) {
                // Refresh local state
                const allCerts = getCertificates();
                const newUserCerts = allCerts.filter(c => updated.certificates.includes(c.id));
                setUserCertificates(newUserCerts);
                setUsers(getAllUsers());
                setSelectedUser(updated);
                showToast("Certificate revoked.", "info");
            }
        }
    };

    const initiateDelete = (userId: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete User Account?",
            message: "Are you sure? This will initiate a permanent deletion process. You will have 5 seconds to undo after confirmation.",
            onConfirm: () => {
                setDeletingId(userId);
                const timer = setTimeout(() => {
                    const updatedUsers = deleteUserSystem(userId);
                    setUsers(updatedUsers);
                    setDeletingId(null);
                    setDeleteTimer(null);
                    showToast("User deleted permanently", "success");
                }, 5000);
                setDeleteTimer(timer);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const undoDelete = () => {
        if (deleteTimer) {
            clearTimeout(deleteTimer);
            setDeleteTimer(null);
            setDeletingId(null);
            showToast("Deletion undone", "info");
        }
    };

    const confirmBan = () => {
        if (banModal) {
            const duration = parseInt(banDuration);
            const type = duration === -1 ? 'banned_perm' : 'banned_temp';
            const updated = banUser(banModal.userId, type, duration === -1 ? undefined : duration);
            setUsers(updated);
            setBanModal(null);
            showToast("User banned", "success");
        }
    };

    const confirmWarn = () => {
        if (warnModal && warnMessage.trim()) {
            warnUser(warnModal.userId, warnMessage);
            setWarnModal(null);
            setWarnMessage('');
            showToast("Warning sent to user", "success");
        }
    };

    const handleActivate = (userId: string) => {
        const updated = activateUser(userId);
        setUsers(updated);
        showToast("User activated", "success");
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats Calculation
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === UserRole.ADMIN).length;
    const instructorCount = users.filter(u => u.role === UserRole.INSTRUCTOR).length;

    return (
        <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-10 relative">
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
            />

            {/* Undo Toast */}
            {deletingId && (
                <div className="fixed top-4 right-4 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-4 animate-slide-up">
                    <span>User deletion pending...</span>
                    <button onClick={undoDelete} className="bg-white text-gray-900 px-3 py-1 rounded font-bold text-sm hover:bg-gray-200 flex items-center gap-1">
                        <FaUndo /> UNDO
                    </button>
                </div>
            )}

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <FaUsers size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <FaUserShield size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Admins</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{adminCount}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <FaChalkboardTeacher size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Instructors</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{instructorCount}</h3>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaUserShield className="text-red-600" /> Admin User Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage user access and permissions</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full text-gray-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">ID</th>
                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">User</th>
                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Role</th>
                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map(user => (
                                <tr 
                                    key={user.id} 
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${deletingId === user.id ? 'opacity-50 bg-red-50' : ''}`}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} className="w-10 h-10 rounded-full" alt="" />
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            user.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' : 
                                            user.role === UserRole.INSTRUCTOR ? 'bg-blue-100 text-blue-700' : 
                                            'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.accountStatus === 'active' ? (
                                            <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><FaCheck /> Active</span>
                                        ) : (
                                            <div className="text-red-600 font-bold text-xs">
                                                <div className="flex items-center gap-1"><FaBan /> Banned</div>
                                                {user.banExpires && <span className="font-normal text-[10px]">Until: {new Date(user.banExpires).toLocaleDateString()}</span>}
                                                {user.accountStatus === 'banned_perm' && <span className="font-normal text-[10px]">Permanent</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex gap-2">
                                            {/* Action Buttons */}
                                            {user.role !== UserRole.ADMIN && (
                                                <>
                                                    {user.accountStatus === 'active' ? (
                                                        <button 
                                                            onClick={() => setBanModal({ userId: user.id })} 
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            title="Ban User"
                                                        >
                                                            <FaBan />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleActivate(user.id)} 
                                                            className="text-green-500 hover:text-green-700 p-1"
                                                            title="Activate User"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    )}
                                                    
                                                    <button 
                                                        onClick={() => initiateDelete(user.id)} 
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Delete User"
                                                    >
                                                        <FaTrash />
                                                    </button>

                                                    <button 
                                                        onClick={() => setWarnModal({ userId: user.id })} 
                                                        className="text-yellow-500 hover:text-yellow-700 p-1"
                                                        title="Warn User"
                                                    >
                                                        <FaExclamationTriangle />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ban Modal */}
            {banModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">Ban User</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Select ban duration:</p>
                        <select 
                            className="w-full border p-2 rounded mb-4 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                            value={banDuration}
                            onChange={(e) => setBanDuration(e.target.value)}
                        >
                            <option value="1">1 Day</option>
                            <option value="3">3 Days</option>
                            <option value="7">7 Days</option>
                            <option value="30">30 Days</option>
                            <option value="-1">Permanent</option>
                        </select>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setBanModal(null)} className="text-gray-500 font-bold text-sm">Cancel</button>
                            <button onClick={confirmBan} className="bg-red-600 text-white px-4 py-2 rounded font-bold text-sm">Ban User</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warn Modal */}
            {warnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">Warn User</h3>
                        <textarea 
                            className="w-full border p-2 rounded mb-4 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                            placeholder="Warning message..."
                            rows={3}
                            value={warnMessage}
                            onChange={(e) => setWarnMessage(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setWarnModal(null)} className="text-gray-500 font-bold text-sm">Cancel</button>
                            <button onClick={confirmWarn} className="bg-yellow-500 text-white px-4 py-2 rounded font-bold text-sm">Send Warning</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Edit User Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center gap-3">
                                <img src={selectedUser.avatar} className="w-10 h-10 rounded-full" alt="" />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedUser.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {selectedUser.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-red-500"><FaTimes /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Level</span>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.level}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
                                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Role</span>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.role}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                                    <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Status</span>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">{selectedUser.accountStatus || 'Active'}</p>
                                </div>
                            </div>

                            {/* Edit XP */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Edit User XP</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        className="flex-1 border p-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                                        value={editXP}
                                        onChange={(e) => setEditXP(parseInt(e.target.value))}
                                    />
                                    <button onClick={handleSaveUserEdit} className="bg-primary-600 text-white px-4 py-2 rounded font-bold hover:bg-primary-700 flex items-center gap-2">
                                        <FaSave /> Save
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Changing XP will automatically recalculate Level.</p>
                            </div>

                            {/* Certificates */}
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <FaCertificate className="text-yellow-500" /> Certificates ({userCertificates.length})
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {userCertificates.length > 0 ? userCertificates.map(cert => (
                                        <div key={cert.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                            <div>
                                                <p className="font-bold text-sm text-gray-800 dark:text-white">{cert.courseName}</p>
                                                <p className="text-xs text-gray-500">{cert.id}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleRevokeCertificate(cert.id)} 
                                                className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 bg-white dark:bg-gray-800 px-2 py-1 rounded"
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    )) : <p className="text-sm text-gray-500 italic">No certificates found.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPostById, addCommentToPost, getUser, formatDisplayTime, toggleLikePost, deleteComment, toggleCommentReaction, lockTopic, deleteTopic, reportContent } from '../services/dataService';
import { ForumPost, Comment, UserRole } from '../types';
import { FaArrowLeft, FaArrowUp, FaComment, FaClock, FaUser, FaReply, FaTrash, FaTimes, FaFlag, FaLock, FaLockOpen } from 'react-icons/fa';
import UserProfilePopup from '../components/UserProfilePopup';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { RichTextDisplay, RichTextEditor } from '../components/RichText';

const MOCK_USERS_FOR_TAGS = [
    { id: 'u2', name: 'Sarah Drasner', username: 'sarah_d', avatar: 'https://picsum.photos/seed/sarah/50/50' },
    { id: 'u3', name: 'Mike Smith', username: 'mike_code', avatar: 'https://picsum.photos/seed/mike/50/50' },
    { id: 'u4', name: 'Emily Rose', username: 'emily_r', avatar: 'https://picsum.photos/seed/emily/50/50' },
];
const REACTIONS = ['👍', '❤️', '😂', '😮', '💡'];

const CommentItem: React.FC<{ 
    comment: Comment; 
    onReply: (id: string, name: string) => void; 
    onDelete: (id: string) => void; 
    currentUserId: string; 
    onReact: (id: string, emoji: string) => void; 
    onShowProfile: (user: any) => void; 
    postAuthorId: string; 
    isAdmin: boolean;
    onReport: (id: string) => void; 
}> = ({ comment, onReply, onDelete, currentUserId, onReact, onShowProfile, postAuthorId, isAdmin, onReport }) => {
    
    // RichTextDisplay handles links and rendering now
    const isAuthor = comment.userId === postAuthorId;

    return (
        <div id={`comment-${comment.id}`} className="mb-4 animate-fade-in">
            <div className={`bg-white p-4 rounded-xl border flex gap-4 group hover:shadow-sm transition-shadow dark:bg-gray-800 dark:border-gray-700 ${isAuthor ? 'border-primary-200 bg-primary-50/10 dark:bg-primary-900/10' : 'border-gray-100'}`}>
                 <img 
                    src={comment.userAvatar} 
                    alt={comment.userName} 
                    className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:opacity-80"
                    onClick={() => onShowProfile({ id: comment.userId, name: comment.userName, avatar: comment.userAvatar })}
                 />
                 <div className="flex-1">
                     <div className="flex justify-between items-center mb-1">
                         <div className="flex items-center gap-2">
                             <span className="font-bold text-gray-900 dark:text-white cursor-pointer hover:underline" onClick={() => onShowProfile({ id: comment.userId, name: comment.userName, avatar: comment.userAvatar })}>{comment.userName}</span>
                             {isAuthor && <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-bold dark:bg-primary-900 dark:text-primary-300">Author</span>}
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDisplayTime(comment.timestamp)}</span>
                            {/* Allow Delete if current user is owner OR Admin */}
                            {(comment.userId === currentUserId || isAdmin) && (
                                <button onClick={() => onDelete(comment.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete">
                                    <FaTrash size={12} />
                                </button>
                            )}
                            {/* Allow Report if not owner */}
                            {(comment.userId !== currentUserId) && (
                                <button onClick={() => onReport(comment.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Report">
                                    <FaFlag size={12} />
                                </button>
                            )}
                         </div>
                     </div>
                     
                     {/* Rich Text Display */}
                     <RichTextDisplay content={comment.content} className="text-sm mb-2" />
                     
                     <div className="flex items-center gap-4">
                         <button 
                            onClick={() => onReply(comment.id, comment.userName)} 
                            className="text-xs text-primary-600 font-bold flex items-center gap-1 hover:underline dark:text-primary-400"
                        >
                             <FaReply /> Reply
                         </button>

                         {/* Reactions */}
                         <div className="flex items-center gap-1">
                             {REACTIONS.map(emoji => {
                                 const count = comment.reactions?.[emoji]?.length || 0;
                                 const isReacted = comment.reactions?.[emoji]?.includes(currentUserId);
                                 return (
                                     <button 
                                        key={emoji}
                                        onClick={() => onReact(comment.id, emoji)}
                                        className={`px-1.5 py-0.5 rounded text-xs transition-colors ${isReacted ? 'bg-primary-100 border border-primary-200 dark:bg-primary-900/30 dark:border-primary-800' : 'hover:bg-gray-100 grayscale hover:grayscale-0 dark:hover:bg-gray-700'}`}
                                     >
                                         {emoji} {count > 0 && <span className="ml-1 text-[10px] font-bold dark:text-gray-300">{count}</span>}
                                     </button>
                                 )
                             })}
                         </div>
                     </div>
                 </div>
            </div>
            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 mt-2 border-l-2 border-gray-100 pl-4 dark:border-gray-700">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply} onDelete={onDelete} currentUserId={currentUserId} onReact={onReact} onShowProfile={onShowProfile} postAuthorId={postAuthorId} isAdmin={isAdmin} onReport={onReport} />
                    ))}
                </div>
            )}
        </div>
    );
};

const TopicDetail: React.FC = () => {
    const { id } = useParams<{id: string}>();
    const navigate = useNavigate();
    const location = useLocation();
    const [post, setPost] = useState<ForumPost | undefined>(undefined);
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null);
    const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    
    // Reporting
    const [reportModal, setReportModal] = useState<{ id: string, type: 'comment' | 'topic' } | null>(null);
    const [reportReason, setReportReason] = useState('Inappropriate Content');
    const [reportDetails, setReportDetails] = useState('');

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const user = getUser();

    useEffect(() => {
        if (id) {
            const p = getPostById(id);
            setPost(p);
        }
    }, [id]);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.hash, post]); 

    const handleReply = () => {
        if (!replyText.trim() || !id || post?.isLocked) return;
        
        let content = replyText;
        if(replyingTo) {
            content = `**@${replyingTo.name}** ${content}`;
        }

        const newComment: Comment = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            content: content,
            timestamp: new Date().toISOString(),
            likes: 0,
            reactions: {},
            replies: []
        };
        
        const updatedPost = addCommentToPost(id, newComment, replyingTo?.id);
        setPost(updatedPost); 
        setReplyText('');
        setReplyingTo(null);
        showToast("Reply posted!", "success");
    };

    const handleLike = () => {
        if (id) {
            const updated = toggleLikePost(id);
            if(updated) setPost(updated);
        }
    };

    const handleCommentReaction = (commentId: string, emoji: string) => {
        if (id) {
            const updated = toggleCommentReaction(id, commentId, emoji);
            if(updated) setPost({...updated} as ForumPost);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Comment?",
            message: "Are you sure you want to delete this comment? This action cannot be undone.",
            onConfirm: () => {
                if(id) {
                    const updated = deleteComment(id, commentId);
                    if (updated) {
                        setPost({...updated}); 
                        showToast("Comment deleted", "info");
                    }
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleConfirmReport = () => {
        if (reportModal) {
            reportContent(reportModal.type, reportModal.id, reportReason, reportDetails);
            showToast("Report submitted successfully. Admins will review it.", "success");
            setReportModal(null);
            setReportDetails('');
        }
    }

    // Admin Actions
    const handleLockTopic = () => {
        if(id && post) {
            const updated = lockTopic(id, !post.isLocked);
            if(updated) {
                setPost(updated);
                showToast(updated.isLocked ? "Topic closed" : "Topic reopened", "info");
            }
        }
    }

    const handleDeleteTopic = () => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Topic?",
            message: "This will remove the topic for everyone. Are you sure?",
            onConfirm: () => {
                if(id) {
                    deleteTopic(id);
                    showToast("Topic deleted", "info");
                    setTimeout(() => navigate('/community'), 1000);
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isAuthor = post?.author.id === user.id;

    if (!post) return <div className="p-8 text-gray-500">Topic not found</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-10 relative">
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

            {selectedUserProfile && (
                <UserProfilePopup 
                    user={selectedUserProfile} 
                    onClose={() => setSelectedUserProfile(null)} 
                    currentUserId={user.id} 
                />
            )}

            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 p-4 animate-fade-in" onClick={() => setPreviewImage(null)}>
                    <button 
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-gray-800 bg-opacity-50"
                    >
                        <FaTimes size={24} />
                    </button>
                    <img 
                        src={previewImage} 
                        alt="Full Preview" 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/community')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium dark:text-gray-400 dark:hover:text-gray-200">
                    <FaArrowLeft /> Back to Community
                </button>
                <div className="flex gap-2">
                    {/* Admin OR Author Actions */}
                    {(isAdmin || isAuthor) && (
                        <>
                            <button onClick={handleLockTopic} className={`px-3 py-1 rounded text-sm font-bold flex items-center gap-1 ${post.isLocked ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                                {post.isLocked ? <><FaLockOpen /> Reopen</> : <><FaLock /> Close</>}
                            </button>
                            <button onClick={handleDeleteTopic} className="px-3 py-1 rounded text-sm font-bold flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200">
                                <FaTrash /> Delete
                            </button>
                        </>
                    )}
                    {/* Report Topic (Only if not author) */}
                    {!isAuthor && (
                        <button onClick={() => setReportModal({id: post.id, type: 'topic'})} className="px-3 py-1 rounded text-sm font-bold flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200">
                            <FaFlag /> Report
                        </button>
                    )}
                </div>
            </div>

            {/* Original Post */}
            <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden mb-6 dark:bg-gray-800 dark:border-gray-700 ${post.isLocked ? 'border-red-200' : 'border-gray-200'}`}>
                {post.isLocked && <div className="bg-red-50 text-red-600 px-6 py-2 text-sm font-bold flex items-center gap-2"><FaLock /> This topic is closed.</div>}
                <div className="p-6 md:p-8">
                    {/* ... (Post header and content remains same) ... */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase dark:bg-primary-900 dark:text-primary-300">{post.category}</span>
                        <div className="flex items-center gap-1 text-gray-400 text-sm"><FaClock size={12}/> {formatDisplayTime(post.time)}</div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 dark:text-white">{post.title}</h1>
                    
                    {/* Rich Text Display for Topic Content */}
                    <RichTextDisplay content={post.content} className="mb-6" />

                    {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {post.images.map((img, idx) => (
                                <img 
                                    key={idx} 
                                    src={img} 
                                    alt={`attachment-${idx}`} 
                                    className="rounded-xl w-full h-48 object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity dark:border-gray-600" 
                                    onClick={() => setPreviewImage(img)} 
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUserProfile(post.author)}>
                            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{post.author.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Author</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${post.isLiked ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                <FaArrowUp /> {post.likes}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Replies Area */}
            <div className="space-y-6">
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2 dark:text-white">
                    <FaComment className="text-gray-400"/> {post.comments.length} Replies
                </h3>

                <div>
                    {post.comments.map(comment => (
                        <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            onReply={(id, name) => !post.isLocked && setReplyingTo({id, name})}
                            onDelete={handleDeleteComment}
                            currentUserId={user.id}
                            isAdmin={isAdmin}
                            onReact={handleCommentReaction}
                            onShowProfile={setSelectedUserProfile}
                            postAuthorId={post.author.id}
                            onReport={(id) => setReportModal({ id, type: 'comment' })}
                        />
                    ))}
                </div>

                {/* Reply Box */}
                {!post.isLocked ? (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8 sticky bottom-4 z-10 relative dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 mb-2 dark:text-white">
                            {replyingTo ? `Replying to ${replyingTo.name}` : 'Leave a Reply'}
                            {replyingTo && <button onClick={() => setReplyingTo(null)} className="ml-2 text-xs text-red-500 underline">Cancel</button>}
                        </h3>
                        
                        <RichTextEditor 
                            value={replyText}
                            onChange={setReplyText}
                            placeholder="Share your thoughts..."
                        />
                        
                        <div className="flex justify-end mt-4">
                            <button onClick={handleReply} className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700 shadow-lg">
                                Post Reply
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl text-center text-gray-500 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-600">
                        <FaLock className="inline mr-2" /> Comments are closed for this topic.
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {reportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">Report Content</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Why are you reporting this {reportModal.type}?</p>
                        <select 
                            className="w-full border p-2 rounded mb-4 bg-white dark:bg-gray-700 dark:text-white"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        >
                            <option>Inappropriate Content</option>
                            <option>Spam</option>
                            <option>Harassment</option>
                            <option>Misinformation</option>
                        </select>
                        <textarea
                            className="w-full border p-2 rounded mb-4 bg-white dark:bg-gray-700 dark:text-white resize-none"
                            placeholder="Optional details..."
                            rows={3}
                            value={reportDetails}
                            onChange={(e) => setReportDetails(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setReportModal(null)} className="text-gray-500 font-bold text-sm">Cancel</button>
                            <button onClick={handleConfirmReport} className="bg-red-600 text-white px-4 py-2 rounded font-bold text-sm">Submit Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicDetail;

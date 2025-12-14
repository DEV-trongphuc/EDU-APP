
import React, { useState } from 'react';
import { FaStar, FaTimes, FaTrash, FaUserCircle } from 'react-icons/fa';
import { Review, UserRole, User } from '../types';
import { formatDisplayTime } from '../services/dataService';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reviews: Review[];
    courseId: string;
    currentUser: User;
    userProgress: number; // 0-100
    onAddReview: (rating: number, comment: string) => void;
    onDeleteReview: (reviewId: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
    isOpen, onClose, reviews, currentUser, userProgress, onAddReview, onDeleteReview 
}) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    
    // Check if current user already reviewed to prepopulate
    const existingReview = reviews.find(r => r.userId === currentUser.id);
    
    // Initialize state when opening if existing review found
    React.useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
        } else {
            setRating(5);
            setComment('');
        }
    }, [isOpen, existingReview]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddReview(rating, comment);
    };

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const canReview = userProgress >= 70;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Course Reviews <span className="text-sm font-normal text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">{reviews.length}</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Review Input Section - Only if eligible */}
                    {canReview ? (
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">
                                {existingReview ? 'Edit Your Review' : 'Write a Review'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                            >
                                                <FaStar />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Review</label>
                                    <textarea 
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                        rows={3}
                                        placeholder="Share your experience with this course..."
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg">
                                    {existingReview ? 'Update Review' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center text-blue-600 dark:text-blue-300 text-sm font-medium border border-blue-100 dark:border-blue-800">
                            Complete at least 70% of the course to leave a review.
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{review.userName}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex text-yellow-400 text-xs">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} className={i < review.rating ? "" : "text-gray-300 dark:text-gray-600"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-400">{formatDisplayTime(review.date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {(isAdmin || review.userId === currentUser.id) && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeleteReview(review.id); }}
                                                className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                                                title="Delete Review"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm pl-13">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400 dark:text-gray-500 italic">
                                No reviews yet. Be the first to share your thoughts!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;


import React, { useState, useEffect, useRef } from 'react';
import { getForumPosts, createForumPost, toggleLikePost, formatDisplayTime, getUser, deleteTopic, reportContent } from '../services/dataService';
import { CURRENT_USER } from '../constants';
import { ForumPost, UserRole } from '../types';
import { FaPlus, FaComment, FaEye, FaArrowUp, FaTimes, FaSearch, FaFilter, FaImage, FaUpload, FaTrash, FaLock, FaFlag, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { RichTextEditor } from '../components/RichText';

const POPULAR_TAGS = ['React', 'Design', 'Python', 'State Management', 'UI/UX', 'Career'];

const Community: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', category: 'General', content: '', tags: '', imageUrl: '' });
  const [agreedToRules, setAgreedToRules] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [reportModal, setReportModal] = useState<{ type: 'topic' | 'comment', id: string } | null>(null);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [reportDetails, setReportDetails] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'popular' | 'views'>('newest');
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
      setToast({ message, type, isVisible: true });
  };
  
  const user = getUser();

  useEffect(() => {
    setPosts(getForumPosts());
  }, []);

  const handleCreateTopic = (e: React.FormEvent) => {
      e.preventDefault();
      if (!agreedToRules) return;

      const images = newTopic.imageUrl.split(',').map(url => url.trim()).filter(url => url);
      
      const newPost: ForumPost = {
          id: Date.now().toString(),
          title: newTopic.title,
          content: newTopic.content,
          author: { id: CURRENT_USER.id, name: CURRENT_USER.name, avatar: CURRENT_USER.avatar },
          category: newTopic.category,
          repliesCount: 0,
          views: 1,
          time: new Date().toISOString(),
          tags: newTopic.tags.split(',').map(t => t.trim()).filter(t => t),
          likes: 0,
          comments: [],
          images: images,
          isLiked: false,
          isLocked: false
      };
      const updatedPosts = createForumPost(newPost);
      setPosts(updatedPosts);
      setIsModalOpen(false);
      setNewTopic({ title: '', category: 'General', content: '', tags: '', imageUrl: '' });
      setAgreedToRules(false);
      showToast("Topic created successfully!", "success");
  };

  const handleLike = (e: React.MouseEvent, postId: string) => {
      e.stopPropagation(); 
      toggleLikePost(postId);
      setPosts(getForumPosts()); 
  };

  const handleDeletePost = (e: React.MouseEvent, postId: string) => {
      e.stopPropagation();
      setConfirmModal({
          isOpen: true,
          title: "Delete Topic?",
          message: "This will permanently delete this topic and all its comments. This action cannot be undone.",
          onConfirm: () => {
              const updatedPosts = deleteTopic(postId);
              setPosts(updatedPosts);
              showToast("Topic deleted", "info");
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const handleSubmitReport = () => {
      if (reportModal) {
          reportContent(reportModal.type, reportModal.id, reportReason, reportDetails);
          showToast("Report submitted. Thank you.", "success");
          setReportModal(null);
          setReportDetails('');
          setReportReason('Inappropriate Content');
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setNewTopic(prev => ({
              ...prev,
              imageUrl: prev.imageUrl ? `${prev.imageUrl}, ${url}` : url
          }));
      }
      if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredPosts = posts.filter(post => {
      const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTag = selectedTag === 'All' || post.tags.includes(selectedTag);
      return matchSearch && matchTag;
  }).sort((a, b) => {
      if (sortOrder === 'popular') return b.likes - a.likes;
      if (sortOrder === 'views') return b.views - a.views;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto relative pb-10">
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

      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
         <div>
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Forum</h1>
             <p className="text-gray-500 dark:text-gray-400">Discuss with students and instructors</p>
         </div>
         <div className="flex items-center gap-2">
             <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                 <FaPlus /> Start New Topic
             </button>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white text-gray-900 placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-4">
              <div className="relative min-w-[150px]">
                  <FaFilter className="absolute left-3 top-3.5 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer dark:text-white text-gray-900"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                  >
                      <option value="All">All Tags</option>
                      {POPULAR_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
              </div>
              <div className="relative min-w-[150px]">
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer dark:text-white text-gray-900"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                  >
                      <option value="newest">Newest</option>
                      <option value="popular">Most Popular</option>
                      <option value="views">Most Viewed</option>
                  </select>
              </div>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         <div className="flex-1 space-y-4">
             {filteredPosts.length > 0 ? filteredPosts.map(post => (
                 <div key={post.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group" onClick={() => navigate(`/community/topic/${post.id}`)}>
                     <div className="flex justify-between items-start mb-2">
                         <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase">{post.category}</span>
                         <div className="flex items-center gap-2">
                             {post.isLocked && <span className="text-xs text-red-500 font-bold flex items-center gap-1"><FaLock /> Closed</span>}
                             <span className="text-xs text-gray-400">{formatDisplayTime(post.time)}</span>
                         </div>
                     </div>
                     <div className="flex gap-4">
                         <div className="flex-1">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                             <div className="flex gap-2 mb-4">
                                 {post.tags.map((tag, idx) => (
                                     <span key={idx} className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">#{tag}</span>
                                 ))}
                             </div>
                         </div>
                         {post.images && post.images.length > 0 && (
                             <img 
                                src={post.images[0]} 
                                alt="thumbnail" 
                                className="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" 
                                onClick={(e) => { e.stopPropagation(); setPreviewImage(post.images![0]); }}
                             />
                         )}
                     </div>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                         <div className="flex items-center gap-2">
                             <img src={post.author.avatar} alt="author" className="w-6 h-6 rounded-full" />
                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{post.author.name}</span>
                         </div>
                         <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                             <button 
                                onClick={(e) => handleLike(e, post.id)}
                                className={`flex items-center gap-1 transition-colors px-2 py-1 rounded ${post.isLiked ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                             >
                                 <FaArrowUp /> {post.likes}
                             </button>
                             <span className="flex items-center gap-1"><FaComment /> {post.repliesCount}</span>
                             <span className="flex items-center gap-1"><FaEye /> {post.views}</span>
                             
                             <button 
                                onClick={(e) => { e.stopPropagation(); setReportModal({ type: 'topic', id: post.id }); }} 
                                className="text-gray-400 hover:text-red-500 p-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Report"
                             >
                                 <FaFlag />
                             </button>

                             {(isAdmin || post.author.id === user.id) && (
                                 <button 
                                    onClick={(e) => handleDeletePost(e, post.id)} 
                                    className="text-gray-400 hover:text-red-600 p-1"
                                    title="Delete"
                                 >
                                     <FaTrash />
                                 </button>
                             )}
                         </div>
                     </div>
                 </div>
             )) : (
                 <div className="bg-white dark:bg-gray-800 p-10 rounded-xl text-center text-gray-500 dark:text-gray-400">
                     No topics found matching your filters.
                 </div>
             )}
         </div>
         
         <div className="w-full lg:w-80 space-y-6">
             <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-24">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-4">Popular Tags</h3>
                 <div className="flex flex-wrap gap-2">
                     {POPULAR_TAGS.map(tag => (
                         <span 
                            key={tag} 
                            onClick={() => setSelectedTag(tag === selectedTag ? 'All' : tag)}
                            className={`px-3 py-1 rounded-lg text-sm cursor-pointer transition-colors ${selectedTag === tag ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                         >
                            #{tag}
                         </span>
                     ))}
                 </div>
             </div>
         </div>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in overflow-hidden max-h-[90vh] overflow-y-auto dark:bg-gray-800">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 dark:bg-gray-700 sticky top-0 z-10 dark:border-gray-600">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Topic</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors dark:text-gray-300">
                          <FaTimes size={20} />
                      </button>
                  </div>
                  <form onSubmit={handleCreateTopic} className="p-6 space-y-4">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 dark:bg-blue-900/20 dark:border-blue-700">
                          <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2"><FaExclamationCircle /> Community Rules</h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-200 list-disc list-inside mt-2 space-y-1">
                              <li>Be respectful and constructive.</li>
                              <li>No spam, advertising, or self-promotion.</li>
                              <li>Use appropriate images (No NSFW/Violence).</li>
                              <li>Violations will result in an immediate ban.</li>
                          </ul>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Title</label>
                          <input 
                              type="text" 
                              required
                              className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                              placeholder="What's on your mind?"
                              value={newTopic.title}
                              onChange={e => setNewTopic({...newTopic, title: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Category</label>
                              <select 
                                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                  value={newTopic.category}
                                  onChange={e => setNewTopic({...newTopic, category: e.target.value})}
                              >
                                  <option>General</option>
                                  <option>React Ecosystem</option>
                                  <option>Frontend</option>
                                  <option>Backend</option>
                                  <option>Career Advice</option>
                                  <option>Showcase</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Tags</label>
                              <input 
                                  type="text" 
                                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                  placeholder="Comma separated"
                                  value={newTopic.tags}
                                  onChange={e => setNewTopic({...newTopic, tags: e.target.value})}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Content</label>
                          <RichTextEditor 
                              value={newTopic.content} 
                              onChange={(val) => setNewTopic({...newTopic, content: val})} 
                              placeholder="Write your topic content here..." 
                              className="min-h-[150px]"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Image URL (Optional)</label>
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                  placeholder="https://..."
                                  value={newTopic.imageUrl}
                                  onChange={e => setNewTopic({...newTopic, imageUrl: e.target.value})}
                              />
                              <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleImageUpload}
                              />
                              <button 
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              >
                                  <FaUpload />
                              </button>
                          </div>
                      </div>

                      <div className="flex items-center gap-2">
                          <input 
                              type="checkbox" 
                              id="rules" 
                              checked={agreedToRules} 
                              onChange={e => setAgreedToRules(e.target.checked)}
                              className="rounded text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor="rules" className="text-sm text-gray-600 dark:text-gray-400">I agree to the community rules and guidelines.</label>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <button 
                              type="button" 
                              onClick={() => setIsModalOpen(false)} 
                              className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit" 
                              disabled={!agreedToRules}
                              className={`px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 ${agreedToRules ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'}`}
                          >
                              Create Topic
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Report Modal */}
      {reportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl animate-fade-in">
                  <h3 className="font-bold text-lg mb-4 dark:text-white">Report Content</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Why are you reporting this?</p>
                  <select 
                      className="w-full border p-2 rounded mb-4 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                  >
                      <option>Inappropriate Content</option>
                      <option>Spam</option>
                      <option>Harassment</option>
                      <option>Misinformation</option>
                  </select>
                  <textarea
                      className="w-full border p-2 rounded mb-4 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 resize-none"
                      placeholder="Optional details..."
                      rows={3}
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setReportModal(null)} className="text-gray-500 font-bold text-sm">Cancel</button>
                      <button onClick={handleSubmitReport} className="bg-red-600 text-white px-4 py-2 rounded font-bold text-sm">Submit Report</button>
                  </div>
              </div>
          </div>
      )}

      {/* Image Preview Modal */}
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
    </div>
  );
};

export default Community;

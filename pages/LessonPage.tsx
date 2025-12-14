
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCourseById, updateLessonProgress, getUser, formatDisplayTime, getCertificates, toggleCommentReaction, deleteComment } from '../services/dataService';
import { 
  FaPlay, FaCheck, FaChevronLeft, FaDownload, 
  FaList, FaReply, FaGraduationCap, FaTrash, FaPlus, FaStickyNote, FaPause, FaCertificate, FaSmile, FaFlag, FaLock, FaClock, FaCheckCircle, FaTimesCircle, FaRedo, FaListOl, FaFileAlt, FaExternalLinkAlt, FaFilePdf, FaInfoCircle, FaFileArchive
} from 'react-icons/fa';
import { Course, Lesson, Comment, Note, QuizQuestion, UserRole } from '../types';
import UserProfilePopup from '../components/UserProfilePopup';
import Toast from '../components/Toast';

const MOCK_USERS_FOR_TAGS = [
    { id: 'u2', name: 'Sarah Drasner', username: 'sarah_d', avatar: 'https://picsum.photos/seed/sarah/50/50' },
    { id: 'u3', name: 'Mike Smith', username: 'mike_code', avatar: 'https://picsum.photos/seed/mike/50/50' },
    { id: 'u4', name: 'Emily Rose', username: 'emily_r', avatar: 'https://picsum.photos/seed/emily/50/50' },
];
const REACTIONS = ['👍', '❤️', '😂', '😮', '💡'];

const CommentItem: React.FC<{ 
    comment: Comment; 
    onReply: (id: string, name: string) => void; 
    onDelete?: (id: string) => void; 
    currentUserId?: string; 
    isAdmin?: boolean;
    onReact: (id: string, emoji: string) => void; 
    onShowProfile: (user: any) => void;
    onSeek: (time: number) => void;
}> = ({ comment, onReply, onDelete, currentUserId, isAdmin, onReact, onShowProfile, onSeek }) => {
    
    // Highlight Mentions and Timestamps
    const renderContent = (text: string) => {
        const regex = /(@\w+)|(\b\d{1,2}:\d{2}\b)/g;
        const parts = text.split(regex);
        
        return parts.map((part, index) => {
            if (!part) return null;

            if (part.startsWith('@')) {
                return (
                    <span 
                        key={index} 
                        className="text-primary-600 font-bold bg-primary-50 px-1 rounded cursor-pointer hover:bg-primary-100 hover:underline"
                        onClick={() => {
                            const username = part.substring(1);
                            const found = MOCK_USERS_FOR_TAGS.find(u => u.username === username);
                            if(found) onShowProfile(found);
                        }}
                    >
                        {part}
                    </span>
                );
            }

            if (/^\d{1,2}:\d{2}$/.test(part)) {
                return (
                    <button
                        key={index}
                        className="text-blue-600 dark:text-blue-400 font-medium hover:underline bg-blue-50 dark:bg-blue-900/30 px-1.5 rounded cursor-pointer inline-flex items-center gap-0.5 mx-0.5"
                        onClick={() => {
                            const [min, sec] = part.split(':').map(Number);
                            if (!isNaN(min) && !isNaN(sec)) {
                                onSeek(min * 60 + sec);
                            }
                        }}
                    >
                        <FaPlay size={8} /> {part}
                    </button>
                );
            }

            return part;
        });
    };

    return (
        <div id={`comment-${comment.id}`} className="mb-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 group hover:shadow-sm transition-shadow relative dark:bg-gray-800 dark:border-gray-700">
                 <img 
                    src={comment.userAvatar} 
                    alt={comment.userName} 
                    className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:opacity-80" 
                    onClick={() => onShowProfile({ id: comment.userId, name: comment.userName, avatar: comment.userAvatar })}
                 />
                 <div className="flex-1">
                     <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-gray-900 dark:text-white cursor-pointer hover:underline" onClick={() => onShowProfile({ id: comment.userId, name: comment.userName, avatar: comment.userAvatar })}>{comment.userName}</span>
                         <div className="flex items-center gap-2">
                             <span className="text-xs text-gray-500 dark:text-gray-400">{formatDisplayTime(comment.timestamp)}</span>
                             {/* Allow Admin or Owner to delete */}
                             {(currentUserId === comment.userId || isAdmin) && onDelete && (
                                 <button onClick={() => onDelete(comment.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete">
                                     <FaTrash size={12}/>
                                 </button>
                             )}
                             {currentUserId !== comment.userId && !isAdmin && (
                                 <button onClick={() => alert("Reported comment")} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Report">
                                     <FaFlag size={12} />
                                 </button>
                             )}
                         </div>
                     </div>
                     <div className="text-gray-700 text-sm mb-2 dark:text-gray-300 whitespace-pre-wrap">{renderContent(comment.content)}</div>
                     
                     <div className="flex items-center gap-4">
                         <button 
                            onClick={() => onReply(comment.id, comment.userName)} 
                            className="text-xs text-primary-600 font-bold flex items-center gap-1 hover:underline dark:text-primary-400"
                        >
                             <FaReply /> Reply
                         </button>
                         
                         <div className="flex items-center gap-1">
                             {REACTIONS.map(emoji => {
                                 const count = comment.reactions?.[emoji]?.length || 0;
                                 const isReacted = comment.reactions?.[emoji]?.includes(currentUserId || '');
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
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 mt-2 border-l-2 border-gray-100 pl-4 dark:border-gray-700">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply} onDelete={onDelete} currentUserId={currentUserId} isAdmin={isAdmin} onReact={onReact} onShowProfile={onShowProfile} onSeek={onSeek} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [currentLesson, setCurrentLesson] = useState<Lesson | undefined>(undefined);
  const [isLocked, setIsLocked] = useState(false);
  const [userCertId, setUserCertId] = useState<string | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);
  const user = getUser();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'notes'>('overview');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Quiz State
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number}>({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState(0); // Seconds

  useEffect(() => {
    if (courseId) {
        const c = getCourseById(courseId);
        setCourse(c);
        if (c && lessonId) {
            const allLessons: Lesson[] = [];
            c.sections.forEach(s => allLessons.push(...s.lessons));
            
            const currentIndex = allLessons.findIndex(l => l.id === lessonId);
            
            if (currentIndex !== -1) {
                const lesson = allLessons[currentIndex];
                setCurrentLesson(lesson);
                
                setQuizStarted(false);
                setQuizSubmitted(false);
                
                if (currentIndex > 0 && !allLessons[currentIndex - 1].completed) {
                    setIsLocked(true);
                } else {
                    setIsLocked(false);
                }
            }
        }
        const certs = getCertificates();
        const existingCert = certs.find(crt => crt.courseId === courseId && user.certificates.includes(crt.id));
        if (existingCert) setUserCertId(existingCert.id);
    }
  }, [courseId, lessonId]);

  // Timer Effect for Quiz
  useEffect(() => {
      if (quizStarted && !quizSubmitted && quizTimeLeft > 0) {
          const timer = setInterval(() => {
              setQuizTimeLeft(prev => {
                  if (prev <= 1) {
                      handleQuizSubmit();
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
          return () => clearInterval(timer);
      }
  }, [quizStarted, quizSubmitted, quizTimeLeft]);

  const handleLessonComplete = () => {
    if (courseId && lessonId) {
        updateLessonProgress(courseId, lessonId);
        const updatedCourse = getCourseById(courseId);
        setCourse(updatedCourse);
        if (updatedCourse) {
             updatedCourse.sections.forEach(s => {
                const l = s.lessons.find(l => l.id === lessonId);
                if(l) setCurrentLesson(l);
             });
        }
    }
  };

  const handleStartQuiz = () => {
      if (!currentLesson?.quizData) return;
      
      const shuffled = [...currentLesson.quizData].sort(() => 0.5 - Math.random());
      setActiveQuizQuestions(shuffled);
      
      setQuizTimeLeft(shuffled.length * 45); // 45s per question
      setQuizStarted(true);
      setQuizSubmitted(false);
      setQuizAnswers({});
      setQuizScore(0);
  };

  const handleQuizAnswer = (qId: string, optionIdx: number) => {
      if (quizSubmitted) return;
      setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleQuizSubmit = () => {
      if (!currentLesson?.quizData) return;
      let correct = 0;
      activeQuizQuestions.forEach(q => {
          if (quizAnswers[q.id] === q.correctAnswer) correct++;
      });
      const score = (correct / activeQuizQuestions.length) * 100;
      setQuizScore(score);
      setQuizSubmitted(true);
      
      if (score >= 70) {
          handleLessonComplete(); // Auto complete if pass
      }
  };

  // ... Comment handling functions (same as before) ...
  const handlePostComment = () => {
      if (!commentText.trim()) return;
      const newComment: Comment = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          content: commentText,
          timestamp: new Date().toISOString(),
          likes: 0,
          reactions: {},
          replies: []
      };

      if(replyingTo) {
          const addReply = (list: Comment[]): Comment[] => {
              return list.map(c => {
                  if(c.id === replyingTo.id) {
                      return { ...c, replies: [...(c.replies || []), newComment] };
                  }
                  if(c.replies && c.replies.length > 0) {
                      return { ...c, replies: addReply(c.replies) };
                  }
                  return c;
              });
          };
          setComments(addReply(comments));
          setReplyingTo(null);
      } else {
          setComments([newComment, ...comments]);
      }
      setCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
      if (window.confirm("Delete this comment?")) {
          const deleteRec = (list: Comment[]): Comment[] => {
              return list.filter(c => {
                 if (c.id === commentId) return false;
                 if (c.replies) c.replies = deleteRec(c.replies);
                 return true;
              });
          };
          setComments(deleteRec(comments));
      }
  };

  const handleReaction = (commentId: string, emoji: string) => {
      const updateReactionRec = (list: Comment[]): Comment[] => {
          return list.map(c => {
              if (c.id === commentId) {
                  const reactions = c.reactions || {};
                  const users = reactions[emoji] || [];
                  if (users.includes(user.id)) {
                      reactions[emoji] = users.filter(u => u !== user.id);
                  } else {
                      reactions[emoji] = [...users, user.id];
                  }
                  return { ...c, reactions };
              }
              if (c.replies) {
                  return { ...c, replies: updateReactionRec(c.replies) };
              }
              return c;
          });
      };
      setComments(updateReactionRec(comments));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setCommentText(val);
      const lastAt = val.lastIndexOf('@');
      if (lastAt !== -1) {
          const query = val.substring(lastAt + 1);
          if (!query.includes(' ')) {
              setMentionQuery(query);
              setShowMentions(true);
          } else { setShowMentions(false); }
      } else { setShowMentions(false); }
  };

  const insertMention = (username: string) => {
      const lastAt = commentText.lastIndexOf('@');
      const prefix = commentText.substring(0, lastAt);
      setCommentText(`${prefix}@${username} `);
      setShowMentions(false);
  };

  const filteredUsersForMention = MOCK_USERS_FOR_TAGS.filter(u => 
      u.name.toLowerCase().includes(mentionQuery.toLowerCase()) || 
      u.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const formatTime = (seconds: number) => {
      const min = Math.floor(seconds / 60);
      const sec = Math.floor(seconds % 60);
      return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleAddNote = () => {
      if (!currentNote.trim()) return;
      const timestamp = videoRef.current ? videoRef.current.currentTime : 0;
      const newNote: Note = {
          id: Date.now().toString(),
          timestamp: timestamp,
          displayTime: formatTime(timestamp),
          content: currentNote
      };
      setNotes([...notes, newNote].sort((a, b) => a.timestamp - b.timestamp));
      setCurrentNote('');
  };

  const seekToTime = (time: number) => {
      if(videoRef.current) {
          videoRef.current.currentTime = time;
          videoRef.current.play();
      }
  };

  if (!course || !currentLesson) return <div className="text-white p-10">Loading or Lesson not found...</div>;

  const isLastLesson = course.sections.length > 0 && course.sections[course.sections.length-1].lessons.length > 0 && course.sections[course.sections.length-1].lessons[course.sections[course.sections.length-1].lessons.length-1].id === currentLesson.id;
  
  const isPdf = currentLesson.type === 'document' && currentLesson.videoUrl && currentLesson.videoUrl.endsWith('.pdf');
  const isAdminOrInstructor = user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Navigation */}
      <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0 sticky top-0">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/courses/${courseId}`)} className="text-gray-400 hover:text-white transition-colors">
                <FaChevronLeft />
            </button>
            <h1 className="font-semibold text-sm md:text-lg truncate max-w-xs md:max-w-xl">
                {course.title} <span className="text-gray-500 mx-2">/</span> {currentLesson.title}
            </h1>
         </div>
         <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-xs bg-gray-700 px-3 py-1 rounded-full">
                <div className="w-20 bg-gray-600 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${userCertId ? 100 : course.progress}%` }}></div>
                </div>
                <span>{userCertId ? 100 : course.progress}% Completed</span>
             </div>
             
             {userCertId ? (
                 <button 
                    onClick={() => navigate(`/certificate/${userCertId}`)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-2"
                 >
                    <FaCertificate /> View Certificate
                 </button>
             ) : (isLastLesson && course.progress >= 90) ? (
                 <button 
                    onClick={() => navigate(`/quiz/${courseId}`)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-2"
                 >
                    <FaGraduationCap /> Take Final Exam
                 </button>
             ) : currentLesson.type !== 'quiz' ? (
                <button 
                    onClick={handleLessonComplete}
                    className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${currentLesson.completed ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-500'}`}
                >
                    {currentLesson.completed ? 'Completed' : 'Mark as Complete'}
                </button>
             ) : null}
         </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
            {isLocked ? (
                <div className="w-full aspect-video bg-gray-900 flex flex-col items-center justify-center text-center p-8 border-b border-gray-700">
                    <div className="bg-gray-800 p-6 rounded-full mb-4">
                        <FaLock size={40} className="text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Lesson Locked</h2>
                    <p className="text-gray-400 max-w-md">Please complete the previous lesson to unlock this content. Strict progression is enabled for this course.</p>
                </div>
            ) : currentLesson.type === 'quiz' ? (
                // QUIZ INTERFACE
                <div className="w-full min-h-[400px] bg-gray-800 flex flex-col items-center justify-center p-8 border-b border-gray-700">
                    {/* ... (Quiz Interface Code) ... */}
                    {!quizStarted ? (
                        <div className="text-center max-w-lg">
                            <FaListOl size={50} className="text-primary-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Lesson Quiz</h2>
                            <p className="text-gray-400 mb-6">Test your knowledge to complete this lesson. You need 70% to pass.</p>
                            <p className="text-sm bg-gray-700 px-4 py-2 rounded-lg inline-block mb-6">
                                <FaClock className="inline mr-2" />
                                Duration: {currentLesson.quizData?.length || 0} questions × 45s
                            </p>
                            <br />
                            <button onClick={handleStartQuiz} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">Start Quiz</button>
                        </div>
                    ) : (
                        <div className="w-full max-w-3xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Quiz in Progress</h3>
                                <div className={`flex items-center gap-2 font-mono font-bold ${quizTimeLeft < 30 ? 'text-red-500' : 'text-primary-400'}`}>
                                    <FaClock /> {Math.floor(quizTimeLeft / 60)}:{(quizTimeLeft % 60).toString().padStart(2, '0')}
                                </div>
                            </div>

                            {quizSubmitted ? (
                                <div className="bg-gray-700 p-8 rounded-2xl text-center">
                                    {quizScore >= 70 ? (
                                        <>
                                            <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                                            <h2 className="text-2xl font-bold mb-2">Quiz Passed!</h2>
                                            <p className="text-gray-300 mb-6">You scored {quizScore.toFixed(0)}%. Lesson completed.</p>
                                            <button onClick={() => {}} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold cursor-default">Completed</button>
                                        </>
                                    ) : (
                                        <>
                                            <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-4" />
                                            <h2 className="text-2xl font-bold mb-2">Quiz Failed</h2>
                                            <p className="text-gray-300 mb-6">You scored {quizScore.toFixed(0)}%. You need 70% to pass.</p>
                                            <button onClick={handleStartQuiz} className="bg-white text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-2 mx-auto">
                                                <FaRedo /> Try Again
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {activeQuizQuestions.map((q, idx) => (
                                        <div key={idx} className="bg-gray-700 p-6 rounded-xl">
                                            <p className="font-bold text-lg mb-4">{idx + 1}. {q.question}</p>
                                            <div className="space-y-2">
                                                {q.options.map((opt, oIdx) => (
                                                    <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${quizAnswers[q.id] === oIdx ? 'bg-primary-900/50 border-primary-500' : 'bg-gray-800 border-gray-600 hover:bg-gray-750'}`}>
                                                        <input 
                                                            type="radio" 
                                                            name={`q-${q.id}`} 
                                                            checked={quizAnswers[q.id] === oIdx}
                                                            onChange={() => handleQuizAnswer(q.id, oIdx)}
                                                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                                        />
                                                        <span>{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end pt-4">
                                        <button onClick={handleQuizSubmit} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg">
                                            Submit Answers
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : currentLesson.type === 'document' ? (
                // DOCUMENT INTERFACE (PDF or Text)
                <div className="w-full bg-white dark:bg-gray-800 overflow-y-auto p-0 border-b border-gray-700 flex flex-col">
                    {isPdf ? (
                        <iframe 
                            src={currentLesson.videoUrl} // Used for PDF URL
                            className="w-full h-full min-h-[600px]"
                            title={currentLesson.title}
                        ></iframe>
                    ) : (
                        <div className="max-w-3xl mx-auto prose dark:prose-invert p-8 flex-1">
                            <h1>{currentLesson.title}</h1>
                            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                                {currentLesson.content || "No content available for this document."}
                            </div>
                            <div className="mt-8 text-center pb-8">
                                <p className="text-gray-500 dark:text-gray-400 italic mb-4">Read the document above carefully.</p>
                                {!currentLesson.completed && (
                                    <button onClick={handleLessonComplete} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 transition-colors">
                                        I have read this
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // VIDEO PLAYER
                <div className="relative w-full aspect-video bg-black group">
                    <video 
                        ref={videoRef}
                        className="w-full h-full"
                        controls
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        src={currentLesson.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            {/* Content Tabs Section */}
            <div className="flex-1 bg-gray-50 text-gray-800 flex flex-col min-h-[500px] dark:bg-gray-900 dark:text-gray-100">
                {/* ... Tabs (Overview, Comments, Notes) same as before ... */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-16 z-10">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('comments')}
                        className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'comments' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Discussion
                    </button>
                    {currentLesson.type === 'video' && (
                        <button 
                            onClick={() => setActiveTab('notes')}
                            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'notes' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Notes
                        </button>
                    )}
                </div>
                
                <div className="p-6 md:p-8">
                    {activeTab === 'overview' && (
                        <div className="max-w-4xl pb-10">
                            <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${currentLesson.type === 'quiz' ? 'bg-orange-100 text-orange-700' : currentLesson.type === 'document' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {currentLesson.type === 'quiz' ? 'Quiz' : currentLesson.type === 'document' ? 'Document' : 'Video Lesson'}
                                </span>
                                <span className="text-gray-500 text-sm flex items-center gap-1"><FaClock /> {currentLesson.duration}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-lg whitespace-pre-wrap">
                                {currentLesson.overview || (currentLesson.type === 'quiz' 
                                    ? "Complete this quiz to test your understanding of the previous section. You must score at least 70% to proceed to the next lesson."
                                    : currentLesson.type === 'document' 
                                        ? "Read through the material provided above to complete this lesson."
                                        : `In this lesson, we will dive deep into ${currentLesson.title}. You will learn the core concepts, practical applications, and best practices.`
                                )}
                            </p>
                            
                            {isPdf && (
                                <div className="mb-6">
                                    <a href={currentLesson.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded text-blue-600 dark:text-blue-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-600">
                                        <FaExternalLinkAlt /> Open PDF in new tab
                                    </a>
                                </div>
                            )}

                            {/* Lesson Resources */}
                            {currentLesson.resources && currentLesson.resources.length > 0 && (
                                <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg">Lesson Resources</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {currentLesson.resources.map((res, i) => (
                                            <a href={res.url} target="_blank" rel="noreferrer" key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl hover:border-primary-500 hover:shadow-sm transition-all group">
                                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                                    {res.type === 'pdf' ? <FaFilePdf className="text-red-500" /> : res.type === 'zip' ? <FaFileArchive className="text-yellow-500" /> : <FaDownload />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-800 dark:text-white text-sm truncate">{res.title}</p>
                                                    <p className="text-xs text-gray-500 uppercase">{res.type}</p>
                                                </div>
                                                <FaExternalLinkAlt className="text-gray-300 text-xs" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* ... Comments and Notes sections remain unchanged ... */}
                    {activeTab === 'comments' && (
                        <div className="max-w-4xl space-y-6 pb-10">
                             <div className="space-y-6">
                                {comments.map(c => (
                                    <CommentItem 
                                        key={c.id} 
                                        comment={c} 
                                        onReply={(id, name) => setReplyingTo({id, name})} 
                                        onDelete={handleDeleteComment}
                                        currentUserId={user.id}
                                        isAdmin={isAdminOrInstructor} // Admin prop
                                        onReact={handleReaction}
                                        onShowProfile={setSelectedUserProfile}
                                        onSeek={seekToTime}
                                    />
                                ))}
                                {comments.length === 0 && <div className="text-center text-gray-400 text-sm">No comments yet. Start the discussion!</div>}
                            </div>

                             {/* Comment Input */}
                             <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pt-6 relative px-6 pb-6 rounded-xl mt-4 shadow-sm">
                                <div className="flex gap-4 mt-2">
                                    <img src={user.avatar} alt="Me" className="w-10 h-10 rounded-full" />
                                    <div className="flex-1 relative">
                                        {replyingTo && (
                                            <div className="text-xs text-gray-500 mb-1 flex justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                <span>Replying to {replyingTo.name}</span>
                                                <button onClick={() => setReplyingTo(null)} className="text-red-500 hover:underline">Cancel</button>
                                            </div>
                                        )}
                                        {showMentions && (
                                            <div className="absolute bottom-full left-0 mb-2 bg-white border shadow-xl rounded-lg w-64 z-20 overflow-hidden dark:bg-gray-700 dark:border-gray-600">
                                                <div className="bg-gray-50 px-3 py-1 text-xs text-gray-500 font-bold uppercase border-b dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500">Suggested Users</div>
                                                {filteredUsersForMention.length > 0 ? filteredUsersForMention.map(u => (
                                                    <div key={u.id} onClick={() => insertMention(u.username)} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 transition-colors">
                                                        <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-white">{u.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-300">@{u.username}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p className="p-2 text-xs text-gray-400 text-center">No users found</p>
                                                )}
                                            </div>
                                        )}
                                        <textarea 
                                            value={commentText}
                                            onChange={handleCommentChange}
                                            className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Ask a question... (Type @ to mention, or mm:ss for timestamp)"
                                            rows={3}
                                        ></textarea>
                                        <div className="flex justify-end mt-2">
                                            <button 
                                                onClick={handlePostComment}
                                                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-md"
                                            >
                                                Post Comment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'notes' && currentLesson.type === 'video' && (
                        <div className="max-w-4xl pb-10">
                            {/* Notes UI ... */}
                            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-6 flex gap-3 items-start dark:bg-gray-800 dark:border-gray-700">
                                <div className="bg-primary-50 text-primary-600 px-3 py-1 rounded text-xs font-mono font-bold mt-1 dark:bg-primary-900/30 dark:text-primary-400">
                                    {formatTime(currentTime)}
                                </div>
                                <div className="flex-1">
                                    <textarea 
                                        className="w-full text-sm border-none focus:ring-0 resize-none h-16 bg-transparent dark:text-white" 
                                        placeholder="Type a note at this timestamp..."
                                        value={currentNote}
                                        onChange={(e) => setCurrentNote(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddNote();
                                            }
                                        }}
                                    ></textarea>
                                    <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2 dark:border-gray-700">
                                        <span className="text-xs text-gray-400">Press Enter to save</span>
                                        <button onClick={handleAddNote} className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-black transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
                                            Add Note
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Grid */}
                            {notes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {notes.map(note => (
                                        <div 
                                            key={note.id} 
                                            onClick={() => seekToTime(note.timestamp)}
                                            className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all group relative dark:bg-gray-800 dark:border-gray-700"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="bg-yellow-200 text-yellow-800 text-xs font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1 group-hover:bg-yellow-300 transition-colors dark:bg-yellow-900/50 dark:text-yellow-400">
                                                    <FaPlay size={8} /> {note.displayTime}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 text-sm whitespace-pre-wrap break-words dark:text-gray-300">{note.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700">
                                    <FaStickyNote className="mx-auto text-gray-300 text-4xl mb-3 dark:text-gray-600" />
                                    <p className="text-gray-500 dark:text-gray-400">No notes yet. Add one while watching!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* User Profile Popup */}
            {selectedUserProfile && (
                <UserProfilePopup 
                    user={selectedUserProfile} 
                    onClose={() => setSelectedUserProfile(null)} 
                    currentUserId={user.id} 
                />
            )}
        </div>

        {/* Right Sidebar - Syllabus */}
        <div className="lg:w-96 bg-white border-l border-gray-200 flex flex-col shrink-0 dark:bg-gray-800 dark:border-gray-700">
             <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 text-lg dark:text-white">Course Content</h3>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-64px)]">
                {course.sections.map((section, idx) => (
                    <div key={section.id}>
                        <div className="bg-gray-100 px-6 py-3 text-xs font-bold text-gray-500 border-b border-gray-200 uppercase tracking-wide sticky top-0 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                            Section {idx + 1}: {section.title}
                        </div>
                        <div>
                            {section.lessons.map((lesson, lIdx) => {
                                const isLessonLocked = (idx > 0 || lIdx > 0) && !lesson.completed && !section.lessons[lIdx-1]?.completed && (lIdx === 0 ? !course.sections[idx-1]?.lessons[course.sections[idx-1].lessons.length-1]?.completed : true);
                                
                                return (
                                    <div 
                                        key={lesson.id} 
                                        onClick={() => {
                                            navigate(`/lesson/${courseId}/${lesson.id}`);
                                        }}
                                        className={`px-6 py-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 ${lesson.id === currentLesson.id ? 'bg-primary-50 border-l-4 border-l-primary-500 dark:bg-primary-900/20' : ''}`}
                                    >
                                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${lesson.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {lesson.completed ? <FaCheck size={10} /> : (lesson.type === 'quiz' ? <span className="text-[8px] font-bold text-gray-500">Q</span> : lesson.type === 'document' ? <span className="text-[8px] font-bold text-gray-500">D</span> : null)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm flex items-center justify-between ${lesson.id === currentLesson.id ? 'font-bold text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                <span className="truncate">{lesson.title}</span>
                                            </p>
                                            <span className="text-xs text-gray-400 mt-1 block">{lesson.duration}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

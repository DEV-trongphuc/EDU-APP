
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCertificates, enrollCourse, getUser, updateCourse, deleteCourse, getCourseById, notifyUser, validateCoupon, getAllUsers, addCourseReview, deleteCourseReview } from '../services/dataService';
import { 
  FaStar, FaUserTie, FaClock, FaBookOpen, FaPlayCircle, FaCheck, 
  FaShareAlt, FaGlobe, FaCertificate, FaInfinity, FaTwitter, FaLinkedin, FaYoutube, FaAward, FaUniversity, FaTimes, FaChevronDown, FaChevronUp, FaEdit, FaTrash, FaPlus, FaSave, FaVideo, FaFileAlt, FaTag, FaCalendarAlt, FaUser, FaUpload, FaMobileAlt, FaQuestionCircle, FaListOl, FaTicketAlt, FaFilePdf, FaAlignLeft, FaLink, FaFileArchive, FaDownload, FaUserPlus, FaGripVertical, FaMoneyBillWave, FaLayerGroup, FaStopwatch, FaExternalLinkAlt, FaArrowLeft, FaCommentDots
} from 'react-icons/fa';
import { UserRole, Course, Lesson, Section, Coupon, QuizQuestion, CourseResource, CourseInstructor, User } from '../types';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import ReviewModal from '../components/ReviewModal';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [user, setUser] = useState(getUser());
  
  const [activeTab, setActiveTab] = useState('curriculum');
  const [hasCertificate, setHasCertificate] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Edit Modes
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Edit Course Info State
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseTags, setEditCourseTags] = useState('');
  const [editCourseLevel, setEditCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  // Add/Edit Section Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionModalMode, setSectionModalMode] = useState<'add' | 'edit'>('add');
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [sectionTitleInput, setSectionTitleInput] = useState('');

  // Add/Edit Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonModalMode, setLessonModalMode] = useState<'add' | 'edit'>('add');
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null); // Only for edit mode

  // Lesson Form Data
  const [lessonData, setLessonData] = useState<{title: string, type: 'video' | 'document' | 'quiz', docType: 'text' | 'pdf'}>({ title: '', type: 'video', docType: 'text' });
  const [lessonContent, setLessonContent] = useState(''); // URL or Text
  const [lessonOverview, setLessonOverview] = useState('');
  const [lessonResources, setLessonResources] = useState<{id: string, title: string, url: string, type: 'pdf'|'link'|'zip'|'file'}[]>([]);
  
  // Temp Resource Input
  const [tempResTitle, setTempResTitle] = useState('');
  const [tempResUrl, setTempResUrl] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Coupon Management (Admin View)
  const [newCoupon, setNewCoupon] = useState<{code: string, type: 'percent'|'free'|'fixed', value: number, expiresAt: string, allowedUserId: string, maxUses: number}>({code: '', type: 'percent', value: 10, expiresAt: '', allowedUserId: '', maxUses: 0});
  const [showCouponManager, setShowCouponManager] = useState(false);
  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);

  // Instructor Management
  const [availableInstructors, setAvailableInstructors] = useState<User[]>([]);
  const [showInstructorAdd, setShowInstructorAdd] = useState(false);

  // Quiz Editor State
  const [isQuizEditorOpen, setIsQuizEditorOpen] = useState(false);
  const [currentQuizTarget, setCurrentQuizTarget] = useState<{type: 'lesson' | 'final', sectionId?: string, lessonId?: string} | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Temporary Question Edit
  const [tempQuestion, setTempQuestion] = useState<QuizQuestion>({ id: '', question: '', options: ['', '', '', ''], correctAnswer: 0 });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Learning Points & Resources (Course Level)
  const [learningPoints, setLearningPoints] = useState<string[]>([]);
  const [newPoint, setNewPoint] = useState('');
  const [resources, setResources] = useState<CourseResource[]>([]); // Global Course Resources
  const [newResource, setNewResource] = useState<{title: string, url: string, type: 'pdf' | 'link' | 'zip' | 'file'}>({title: '', url: '', type: 'link'});

  // Sidebar Editing
  const [editPrice, setEditPrice] = useState(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState(0);
  const [editDiscountDeadline, setEditDiscountDeadline] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');

  // Date Picker Custom Modal State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'discount' | 'coupon' | null>(null);
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<{type: 'section' | 'lesson', index: number, parentIndex?: number} | null>(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Toast & Confirm Modal State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
      setToast({ message, type, isVisible: true });
  };

  const getTodayString = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 10);
  };

  useEffect(() => {
      const c = getCourseById(id || '');
      setCourse(c);
      if(c) {
          setLearningPoints(c.learningPoints || ['Build full-stack applications', 'Understand advanced concepts', 'Deploy to production', 'Best practices and patterns']);
          setEditPrice(c.price);
          setEditOriginalPrice(c.originalPrice || 0);
          setEditDiscountDeadline(c.discountDeadline || '');
          setEditVideoUrl(c.previewVideoUrl || '');
          setEditThumbnail(c.thumbnail);
          setEditCourseTitle(c.title);
          setEditCourseTags(c.tags.join(', '));
          setEditCourseLevel(c.level);
          setResources(c.resources || []);
          if (c.sections.length > 0) setExpandedSections(new Set([c.sections[0].id]));
      }

      const certs = getCertificates();
      const certExists = certs.some(c => c.courseId === id && user.certificates.includes(c.id));
      setHasCertificate(certExists);

      // Load instructors for adding
      setAvailableInstructors(getAllUsers().filter(u => u.role === UserRole.INSTRUCTOR || u.role === UserRole.ADMIN));
  }, [id]);

  useEffect(() => {
      if (course?.discountDeadline) {
          const calculateTimeLeft = () => {
              const difference = +new Date(course.discountDeadline!) - +new Date();
              if (difference > 0) {
                  return {
                      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                      minutes: Math.floor((difference / 1000 / 60) % 60)
                  };
              }
              return null;
          };
          
          setTimeLeft(calculateTimeLeft());
          const timer = setInterval(() => {
              setTimeLeft(calculateTimeLeft());
          }, 60000); // Update every minute

          return () => clearInterval(timer);
      }
  }, [course]);

  // --- Date Picker Logic ---
  const openDatePicker = (target: 'discount' | 'coupon') => {
      setDatePickerTarget(target);
      let currentVal = '';
      if (target === 'discount') currentVal = editDiscountDeadline;
      else if (target === 'coupon') currentVal = newCoupon.expiresAt;

      if (currentVal) {
          const d = new Date(currentVal);
          setTempDate(d.toISOString().slice(0, 10));
          setTempTime(d.toTimeString().slice(0, 5));
      } else {
          setTempDate('');
          setTempTime('23:59');
      }
      setIsDatePickerOpen(true);
  };

  const handleDateConfirm = () => {
      if (tempDate) {
          const isoString = new Date(`${tempDate}T${tempTime || '00:00'}:00`).toISOString();
          if (datePickerTarget === 'discount') {
              setEditDiscountDeadline(isoString);
          } else if (datePickerTarget === 'coupon') {
              setNewCoupon({ ...newCoupon, expiresAt: isoString });
          }
      } else {
          // If cleared
          if (datePickerTarget === 'discount') setEditDiscountDeadline('');
          else if (datePickerTarget === 'coupon') setNewCoupon({ ...newCoupon, expiresAt: '' });
      }
      setIsDatePickerOpen(false);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, type: 'section' | 'lesson', index: number, parentIndex?: number) => {
      e.stopPropagation();
      setDraggedItem({ type, index, parentIndex });
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetType: 'section' | 'lesson', targetIndex: number, targetParentIndex?: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (!course || !draggedItem) return;

      const newCourse = { ...course };
      const sections = [...newCourse.sections];

      if (draggedItem.type === 'section' && targetType === 'section') {
          // Reorder Sections
          const [movedSection] = sections.splice(draggedItem.index, 1);
          sections.splice(targetIndex, 0, movedSection);
          newCourse.sections = sections;
      } else if (draggedItem.type === 'lesson' && targetType === 'lesson') {
          // Reorder Lessons (Simplified: only within same section for this demo)
          if (draggedItem.parentIndex === targetParentIndex && draggedItem.parentIndex !== undefined) {
              const section = sections[draggedItem.parentIndex];
              const lessons = [...section.lessons];
              const [movedLesson] = lessons.splice(draggedItem.index, 1);
              lessons.splice(targetIndex, 0, movedLesson);
              sections[draggedItem.parentIndex] = { ...section, lessons };
              newCourse.sections = sections;
          }
      }

      setCourse(newCourse);
      updateCourse(newCourse);
      setDraggedItem(null);
  };

  // ---

  const handleApplyCoupon = () => {
      if (!id || !course) return;
      if (couponCode.toUpperCase() === 'EDUPRO' || couponCode.toUpperCase() === 'FREE') {
           const updated = enrollCourse(id);
           if (updated) { 
               setCourse(updated); 
               setCouponCode(''); 
               showToast("Enrolled via legacy coupon!", "success");
           }
           return;
      }

      const result = validateCoupon(couponCode, id, user.id);
      
      if (result.isValid) {
          if (result.type === 'free' || (result.type === 'percent' && result.value === 100)) {
              const updated = enrollCourse(id);
              if (updated) setCourse(updated);
              showToast("Coupon applied! Course is FREE. You are now enrolled.", "success");
          } else {
              setAppliedCoupon({ code: couponCode, type: result.type || 'percent', value: result.value || 0 });
              showToast(`Coupon Applied! ${result.type === 'fixed' ? `$${result.value}` : `${result.value}%`} Discount.`, "success");
          }
          setCouponCode('');
      } else {
          showToast(result.message, "error");
      }
  };

  const handleBuyNow = () => {
      let finalPrice = course?.price || 0;
      if (appliedCoupon) {
          if (appliedCoupon.type === 'percent') {
              finalPrice = finalPrice * (1 - appliedCoupon.value / 100);
          } else if (appliedCoupon.type === 'fixed') {
              finalPrice = Math.max(0, finalPrice - appliedCoupon.value);
          }
      }
      alert(`Redirecting to payment gateway... Total: $${finalPrice.toFixed(2)}`);
      if (id) {
          const updated = enrollCourse(id);
          if (updated) setCourse(updated);
          showToast("Payment Successful! You are enrolled.", "success");
      }
  };

  const handleDeleteCourse = () => {
      if (window.confirm("Delete this course? This cannot be undone.")) {
          if (id && course) {
              notifyUser(course.instructors[0]?.id || '', "Course Deleted", `Your course "${course.title}" was deleted by an admin.`, "warning");
              deleteCourse(id);
              showToast("Course deleted", "success");
              setTimeout(() => navigate('/courses'), 1000);
          }
      }
  };

  // --- Curriculum Management ---
  const openSectionModal = (mode: 'add' | 'edit', sectionId?: string) => {
      setSectionModalMode(mode);
      if (mode === 'edit' && sectionId && course) {
          const section = course.sections.find(s => s.id === sectionId);
          if (section) {
              setCurrentSectionId(sectionId);
              setSectionTitleInput(section.title);
          }
      } else {
          setCurrentSectionId(null);
          setSectionTitleInput('');
      }
      setIsSectionModalOpen(true);
  };

  const handleSaveSection = () => {
      if (!course || !sectionTitleInput.trim()) return;

      let updatedSections = [...course.sections];

      if (sectionModalMode === 'add') {
          const newSection: Section = {
              id: `s_${Date.now()}`,
              title: sectionTitleInput,
              lessons: []
          };
          updatedSections.push(newSection);
          // Auto expand new section
          const newExpanded = new Set(expandedSections);
          newExpanded.add(newSection.id);
          setExpandedSections(newExpanded);
          showToast("Section added", "success");
      } else if (sectionModalMode === 'edit' && currentSectionId) {
          updatedSections = updatedSections.map(s => 
              s.id === currentSectionId ? { ...s, title: sectionTitleInput } : s
          );
          showToast("Section updated", "success");
      }

      const updatedCourse = { ...course, sections: updatedSections };
      setCourse(updatedCourse);
      updateCourse(updatedCourse);
      setIsSectionModalOpen(false);
  };

  const confirmDeleteSection = (sectionId: string) => {
      setConfirmModal({
          isOpen: true,
          title: "Delete Section?",
          message: "This will permanently delete the section and all its lessons. This cannot be undone.",
          onConfirm: () => {
              if (!course) return;
              const updatedSections = course.sections.filter(s => s.id !== sectionId);
              const updatedCourse = { ...course, sections: updatedSections };
              setCourse(updatedCourse);
              updateCourse(updatedCourse);
              showToast("Section deleted", "success");
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  // --- Lesson Management (Add/Edit) ---
  const openLessonModal = (mode: 'add' | 'edit', sectionId: string, lesson?: Lesson) => {
      setLessonModalMode(mode);
      setTargetSectionId(sectionId);
      
      // Load resources properly for edit mode
      if (mode === 'edit' && lesson) {
          setEditingLessonId(lesson.id);
          setLessonData({ 
              title: lesson.title, 
              type: lesson.type as any, 
              docType: lesson.videoUrl?.endsWith('.pdf') ? 'pdf' : 'text' 
          });
          setLessonContent(lesson.type === 'document' ? (lesson.videoUrl?.endsWith('.pdf') ? lesson.videoUrl : lesson.content || '') : lesson.videoUrl);
          setLessonOverview(lesson.overview || '');
          setLessonResources(lesson.resources ? [...lesson.resources] : []); // Important: Deep copy array
      } else {
          setEditingLessonId(null);
          setLessonData({ title: '', type: 'video', docType: 'text' });
          setLessonContent('');
          setLessonOverview('');
          setLessonResources([]); 
      }
      setTempResTitle('');
      setTempResUrl('');
      setIsLessonModalOpen(true);
  };

  const addTempLessonResource = () => {
      if(tempResTitle && tempResUrl) {
          setLessonResources([...lessonResources, {id: `r_${Date.now()}`, title: tempResTitle, url: tempResUrl, type: 'link'}]);
          setTempResTitle('');
          setTempResUrl('');
      }
  }

  const handleSaveLesson = () => {
      if (!course || !targetSectionId || !lessonData.title) return;

      const updatedSections = course.sections.map(s => {
          if (s.id === targetSectionId) {
              let finalContent = undefined;
              let finalVideoUrl = '';
              let finalDuration = '05:00';

              if (lessonData.type === 'document') {
                  if (lessonData.docType === 'pdf') {
                      finalVideoUrl = lessonContent; // Use videoUrl field for PDF link
                      finalDuration = 'PDF';
                  } else {
                      finalContent = lessonContent;
                      finalDuration = 'Read';
                  }
              } else if (lessonData.type === 'video') {
                  finalVideoUrl = lessonContent;
              } else if (lessonData.type === 'quiz') {
                  finalDuration = 'Quiz';
              }

              if (lessonModalMode === 'add') {
                  const newLesson: Lesson = {
                      id: `l_${Date.now()}`,
                      title: lessonData.title,
                      duration: finalDuration,
                      videoUrl: finalVideoUrl,
                      completed: false,
                      type: lessonData.type,
                      quizData: lessonData.type === 'quiz' ? [] : undefined,
                      content: finalContent,
                      overview: lessonOverview,
                      resources: lessonResources
                  };
                  return { ...s, lessons: [...s.lessons, newLesson] };
              } else if (lessonModalMode === 'edit' && editingLessonId) {
                  const updatedLessons = s.lessons.map(l => {
                      if (l.id === editingLessonId) {
                          return {
                              ...l,
                              title: lessonData.title,
                              type: lessonData.type,
                              duration: finalDuration,
                              videoUrl: finalVideoUrl,
                              content: finalContent,
                              overview: lessonOverview,
                              resources: lessonResources
                          };
                      }
                      return l;
                  });
                  return { ...s, lessons: updatedLessons };
              }
          }
          return s;
      });
      
      const updatedCourse = { ...course, sections: updatedSections };
      setCourse(updatedCourse);
      updateCourse(updatedCourse);
      showToast(lessonModalMode === 'add' ? "Lesson added" : "Lesson updated", "success");
      setIsLessonModalOpen(false);
  };

  const confirmDeleteLesson = (sectionId: string, lessonId: string) => {
      setConfirmModal({
          isOpen: true,
          title: "Delete Content?",
          message: "This item will be permanently removed.",
          onConfirm: () => {
              if (!course) return;
              const updatedSections = course.sections.map(s => {
                  if (s.id === sectionId) {
                      return { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) };
                  }
                  return s;
              });
              const updatedCourse = { ...course, sections: updatedSections };
              setCourse(updatedCourse);
              updateCourse(updatedCourse);
              showToast("Item deleted", "success");
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  // --- Quiz Management ---
  const openQuizEditor = (target: {type: 'lesson' | 'final', sectionId?: string, lessonId?: string}) => {
      if (!course) return;
      
      let existingQuestions: QuizQuestion[] = [];
      if (target.type === 'final') {
          existingQuestions = course.finalQuiz || [];
      } else if (target.type === 'lesson' && target.sectionId && target.lessonId) {
          const section = course.sections.find(s => s.id === target.sectionId);
          const lesson = section?.lessons.find(l => l.id === target.lessonId);
          if (lesson && lesson.type === 'quiz') {
              existingQuestions = lesson.quizData || [];
          }
      }

      setQuizQuestions(JSON.parse(JSON.stringify(existingQuestions))); // Deep copy
      setCurrentQuizTarget(target);
      setIsQuizEditorOpen(true);
      resetTempQuestion();
      setEditingQuestionIndex(null);
  };

  const resetTempQuestion = () => {
      setTempQuestion({
          id: '',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
      });
      setEditingQuestionIndex(null);
  };

  const handleEditQuestion = (idx: number) => {
      setTempQuestion({...quizQuestions[idx]});
      setEditingQuestionIndex(idx);
  };

  const handleSaveQuestion = () => {
      if (!tempQuestion.question || tempQuestion.options.some(o => !o)) {
          alert("Please fill in question and all options.");
          return;
      }
      
      const newQuestions = [...quizQuestions];
      if (editingQuestionIndex !== null) {
          newQuestions[editingQuestionIndex] = tempQuestion;
      } else {
          const newQ = { ...tempQuestion, id: `q_${Date.now()}` };
          newQuestions.push(newQ);
      }
      
      setQuizQuestions(newQuestions);
      resetTempQuestion();
  };

  const handleDeleteQuestion = (idx: number) => {
      if(window.confirm("Delete this question?")) {
          setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
          if(editingQuestionIndex === idx) resetTempQuestion();
      }
  };

  const handleSaveQuiz = () => {
      if (!course || !currentQuizTarget) return;

      let updatedCourse = { ...course };

      if (currentQuizTarget.type === 'final') {
          updatedCourse.finalQuiz = quizQuestions;
          showToast("Final Exam updated", "success");
      } else if (currentQuizTarget.type === 'lesson' && currentQuizTarget.sectionId && currentQuizTarget.lessonId) {
          updatedCourse.sections = updatedCourse.sections.map(s => {
              if (s.id === currentQuizTarget.sectionId) {
                  return {
                      ...s,
                      lessons: s.lessons.map(l => {
                          if (l.id === currentQuizTarget.lessonId) {
                              return { ...l, quizData: quizQuestions, duration: `${Math.ceil(quizQuestions.length * 0.75)}m` };
                          }
                          return l;
                      })
                  };
              }
              return s;
          });
          showToast("Lesson Quiz updated", "success");
      }

      setCourse(updatedCourse);
      updateCourse(updatedCourse);
      setIsQuizEditorOpen(false);
  };

  // --- Review Management ---
  const handleAddReview = (rating: number, comment: string) => {
      if(id) {
          const updatedCourse = addCourseReview(id, rating, comment);
          if (updatedCourse) {
              setCourse(updatedCourse);
              showToast("Review submitted successfully", "success");
              setIsReviewModalOpen(false);
          }
      }
  };

  const handleDeleteReview = (reviewId: string) => {
      setConfirmModal({
          isOpen: true,
          title: "Delete Review?",
          message: "Are you sure you want to delete this review? This action cannot be undone.",
          onConfirm: () => {
              if (id) {
                  const updatedCourse = deleteCourseReview(id, reviewId);
                  if (updatedCourse) {
                      setCourse(updatedCourse);
                      showToast("Review deleted", "info");
                  }
              }
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  // --- Overview & Sidebar Editing ---
  const handleSaveOverviewAndSettings = () => {
      if (course) {
          const updatedCourse = { 
              ...course, 
              title: editCourseTitle,
              tags: editCourseTags.split(',').map(t => t.trim()).filter(t => t),
              level: editCourseLevel,
              learningPoints: learningPoints,
              price: editPrice,
              originalPrice: editOriginalPrice,
              discountDeadline: editDiscountDeadline,
              previewVideoUrl: editVideoUrl,
              thumbnail: editThumbnail,
              resources: resources
          };
          updateCourse(updatedCourse);
          setCourse(updatedCourse);
          showToast("Course settings updated successfully!", "success");
          setIsEditMode(false);
      }
  };

  const addLearningPoint = () => {
      if (newPoint.trim()) {
          setLearningPoints([...learningPoints, newPoint]);
          setNewPoint('');
      }
  };

  const removeLearningPoint = (index: number) => {
      setLearningPoints(learningPoints.filter((_, i) => i !== index));
  };

  const addResource = () => {
      if(newResource.title && newResource.url) {
          setResources([...resources, { id: Date.now().toString(), ...newResource }]);
          setNewResource({title: '', url: '', type: 'link'});
      }
  };

  const removeResource = (id: string) => {
      setResources(resources.filter(r => r.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setEditVideoUrl(url);
      }
  }

  // --- Coupon Management ---
  const handleSaveCoupon = () => {
      if (!newCoupon.code || !course) return;
      
      let updatedCoupons = [...(course.coupons || [])];
      
      if (editingCouponCode) {
          updatedCoupons = updatedCoupons.map(c => c.code === editingCouponCode ? {
              code: newCoupon.code,
              type: newCoupon.type,
              value: newCoupon.value,
              expiresAt: newCoupon.expiresAt || undefined,
              allowedUserIds: newCoupon.allowedUserId ? newCoupon.allowedUserId.split(',').map(s=>s.trim()) : [],
              maxUses: newCoupon.maxUses,
              usedCount: c.usedCount // Preserve existing usage
          } : c);
          setEditingCouponCode(null);
          showToast("Coupon updated", "success");
      } else {
          updatedCoupons.push({
              code: newCoupon.code,
              type: newCoupon.type,
              value: newCoupon.value,
              expiresAt: newCoupon.expiresAt || undefined,
              allowedUserIds: newCoupon.allowedUserId ? newCoupon.allowedUserId.split(',').map(s=>s.trim()) : [],
              maxUses: newCoupon.maxUses,
              usedCount: 0
          });
          showToast("Coupon created", "success");
      }

      const updatedCourse = { ...course, coupons: updatedCoupons };
      updateCourse(updatedCourse);
      setCourse(updatedCourse);
      setNewCoupon({code: '', type: 'percent', value: 10, expiresAt: '', allowedUserId: '', maxUses: 0});
  };

  const startEditCoupon = (c: Coupon) => {
      setNewCoupon({
          code: c.code,
          type: c.type,
          value: c.value,
          expiresAt: c.expiresAt || '',
          allowedUserId: c.allowedUserIds?.join(', ') || '',
          maxUses: c.maxUses || 0
      });
      setEditingCouponCode(c.code);
  };

  const deleteCoupon = (code: string) => {
      if (!course) return;
      if (window.confirm("Delete this coupon?")) {
          const updatedCoupons = course.coupons?.filter(c => c.code !== code) || [];
          const updatedCourse = { ...course, coupons: updatedCoupons };
          updateCourse(updatedCourse);
          setCourse(updatedCourse);
          showToast("Coupon deleted", "info");
      }
  };

  // --- Instructor Management ---
  const handleAddInstructor = (instructor: User) => {
      if(!course) return;
      const exists = course.instructors.some(i => i.id === instructor.id);
      if(!exists) {
          const newInst: CourseInstructor = {
              id: instructor.id,
              name: instructor.name,
              avatar: instructor.avatar,
              bio: instructor.bio,
              rating: 0,
              coursesCount: 0,
              studentsCount: 0
          };
          const updatedCourse = { ...course, instructors: [...course.instructors, newInst] };
          setCourse(updatedCourse);
          updateCourse(updatedCourse);
          showToast("Instructor added", "success");
      }
      setShowInstructorAdd(false);
  };

  const handleRemoveInstructor = (instId: string) => {
      if(!course) return;
      if(course.instructors.length <= 1) {
          alert("Course must have at least one instructor.");
          return;
      }
      const updatedCourse = { ...course, instructors: course.instructors.filter(i => i.id !== instId) };
      setCourse(updatedCourse);
      updateCourse(updatedCourse);
      showToast("Instructor removed", "info");
  };

  const toggleSection = (sectionId: string) => {
      const newSet = new Set(expandedSections);
      if (newSet.has(sectionId)) newSet.delete(sectionId);
      else newSet.add(sectionId);
      setExpandedSections(newSet);
  };

  const toggleExpandAll = () => {
      if (!course) return;
      if (expandedSections.size === course.sections.length) setExpandedSections(new Set());
      else setExpandedSections(new Set(course.sections.map(s => s.id)));
  };

  if (!course) return <div className="p-10 text-center">Course not found</div>;

  // Safe navigation to first lesson
  const firstLessonId = course.sections.length > 0 && course.sections[0].lessons.length > 0 ? course.sections[0].lessons[0].id : '';
  
  // Check if current user is an instructor of THIS course or an Admin
  const isCourseInstructor = course.instructors.some(inst => inst.id === user.id);
  const isAdminOrInstructor = user.role === UserRole.ADMIN || (user.role === UserRole.INSTRUCTOR && isCourseInstructor);

  const instructor = course.instructors[0] || { name: 'Unknown', avatar: '', bio: '' };

  // Calculate discount percentage if original price is set
  const discountPercent = course.originalPrice && course.originalPrice > course.price 
      ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100) 
      : 0;

  const totalLessons = course.sections.reduce((acc, sec) => acc + sec.lessons.length, 0);

  return (
    <div className="animate-fade-in pb-10 relative">
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

      <div className="bg-gray-900 text-white -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-10 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-900 opacity-20"></div>
        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <button onClick={() => navigate('/courses')} className="text-primary-300 hover:text-white flex items-center gap-2 font-bold mb-4 transition-colors">
                <FaArrowLeft /> Back to Courses
            </button>
            <div className="flex items-center gap-3 text-sm font-medium text-primary-300">
               {isEditMode ? (
                   <select 
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none"
                        value={editCourseLevel}
                        onChange={(e) => setEditCourseLevel(e.target.value as any)}
                   >
                       <option value="Beginner">Beginner</option>
                       <option value="Intermediate">Intermediate</option>
                       <option value="Advanced">Advanced</option>
                   </select>
               ) : (
                   <span className="bg-primary-500/20 px-2 py-1 rounded">{course.level}</span>
               )}
               
               {isEditMode ? (
                   <input 
                       className="bg-transparent border-b border-primary-400 focus:outline-none text-white w-full"
                       value={editCourseTags}
                       onChange={(e) => setEditCourseTags(e.target.value)}
                       placeholder="Tags (comma separated)"
                   />
               ) : (
                   <span>{course.tags.join(', ')}</span>
               )}
            </div>
            {isEditMode ? (
                <input 
                    className="text-3xl md:text-5xl font-bold leading-tight bg-transparent border-b border-gray-600 focus:outline-none text-white w-full"
                    value={editCourseTitle}
                    onChange={(e) => setEditCourseTitle(e.target.value)}
                />
            ) : (
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">{course.title}</h1>
            )}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-yellow-400 cursor-pointer hover:underline" onClick={() => setIsReviewModalOpen(true)}>
                    <span className="text-lg font-bold">{course.rating}</span>
                    <div className="flex"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="text-gray-600" /></div>
                    <span className="text-gray-400 underline ml-1">({course.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaUserTie /> Created by <span className="font-bold text-white underline cursor-pointer">{instructor.name}</span>
                    {course.instructors.length > 1 && <span className="text-gray-400 text-xs">+{course.instructors.length - 1} others</span>}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
               <div className="flex items-center gap-2 text-gray-300"><FaClock /> Last updated recently</div>
               {hasCertificate && (
                   <div className="flex items-center gap-2 text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full border border-green-400/30">
                       <FaCertificate /> Certificate Earned
                   </div>
               )}
            </div>
            
            {isAdminOrInstructor && (
                <div className="flex gap-4 mt-4">
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)} 
                        className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors ${isEditMode ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isEditMode ? <><FaCheck /> Done Editing</> : <><FaEdit /> Edit Content</>}
                    </button>
                    {isEditMode && (
                        <button onClick={handleDeleteCourse} className="bg-red-600 px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-red-700">
                            <FaTrash /> Delete Course
                        </button>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 grid lg:grid-cols-3 gap-8 relative px-4 md:px-0">
         <div className="lg:col-span-2 space-y-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                    {['Curriculum', 'Overview', 'Instructors', 'Certificate'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.toLowerCase()
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'curriculum' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{course.sections.length} Sections • {course.totalDuration} Total Length</span>
                            <div className="flex gap-4">
                                <button onClick={toggleExpandAll} className="text-primary-600 font-bold">
                                    {expandedSections.size === course.sections.length ? 'Collapse All' : 'Expand All'}
                                </button>
                                {isEditMode && (
                                    <button onClick={() => openSectionModal('add')} className="text-green-600 font-bold flex items-center gap-1 hover:underline">
                                        <FaPlus /> Add Section
                                    </button>
                                )}
                            </div>
                        </div>
                        {course.sections.map((section, idx) => (
                            <div 
                                key={section.id} 
                                className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${draggedItem?.type === 'section' && draggedItem.index === idx ? 'opacity-50 border-dashed border-2' : ''}`}
                                draggable={isEditMode}
                                onDragStart={(e) => handleDragStart(e, 'section', idx)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'section', idx)}
                            >
                                <div 
                                    className="bg-gray-50 dark:bg-gray-800 px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        {isEditMode && <FaGripVertical className="text-gray-400 cursor-move" />}
                                        {expandedSections.has(section.id) ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
                                        <span className="text-gray-400 font-normal">Section {idx + 1}:</span> {section.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500">{section.lessons.length} lectures</span>
                                        {isEditMode && (
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => openSectionModal('edit', section.id)} className="text-blue-500 hover:text-blue-700"><FaEdit size={12} /></button>
                                                <button onClick={() => confirmDeleteSection(section.id)} className="text-red-500 hover:text-red-700"><FaTrash size={12} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {expandedSections.has(section.id) && (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700 animate-slide-up">
                                        {section.lessons.map((lesson, lIdx) => (
                                            <div 
                                                key={lesson.id} 
                                                className={`px-5 py-3 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors bg-white ${draggedItem?.type === 'lesson' && draggedItem.index === lIdx ? 'opacity-50 border-dashed border-b-2' : ''}`}
                                                draggable={isEditMode}
                                                onDragStart={(e) => handleDragStart(e, 'lesson', lIdx, idx)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, 'lesson', lIdx, idx)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                                        {isEditMode && <FaGripVertical className="text-gray-400 cursor-move" />}
                                                        {lesson.type === 'quiz' ? <FaQuestionCircle className="text-orange-500" /> : lesson.type === 'document' ? <FaFileAlt className="text-blue-500" /> : <FaPlayCircle className="text-gray-400" />}
                                                        <span>{lesson.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-gray-500">{lesson.duration}</span>
                                                        {isEditMode && (
                                                            <>
                                                                {lesson.type === 'quiz' && (
                                                                    <button onClick={() => openQuizEditor({type: 'lesson', sectionId: section.id, lessonId: lesson.id})} className="text-orange-500 hover:text-orange-700 text-xs font-bold border border-orange-200 px-2 py-0.5 rounded">
                                                                        Edit Quiz
                                                                    </button>
                                                                )}
                                                                {/* Edit now uses Modal for Overview/Resources */}
                                                                <button onClick={() => openLessonModal('edit', section.id, lesson)} className="text-blue-500 hover:text-blue-700"><FaEdit size={12} /></button>
                                                                <button onClick={() => confirmDeleteLesson(section.id, lesson.id)} className="text-red-500 hover:text-red-700"><FaTrash size={12} /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {isEditMode && (
                                            <div className="px-5 py-3 text-center bg-gray-50 dark:bg-gray-700">
                                                <button onClick={() => openLessonModal('add', section.id)} className="text-primary-600 font-bold text-sm flex items-center justify-center gap-1 hover:underline"><FaPlus /> Add Lesson</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                {activeTab === 'overview' && (
                    <div className="prose max-w-none text-gray-600 dark:text-gray-300">
                        {isEditMode && (
                            <div className="space-y-4 mb-6 border-b pb-4 dark:border-gray-700">
                                <h3 className="font-bold text-gray-900 dark:text-white">Course Settings</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Current Price ($)</label>
                                        <input 
                                            type="number" 
                                            className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                                            value={editPrice}
                                            onChange={e => setEditPrice(parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Original Price ($)</label>
                                        <input 
                                            type="number" 
                                            className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                                            value={editOriginalPrice}
                                            onChange={e => setEditOriginalPrice(parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold mb-1">Discount Deadline</label>
                                        <button 
                                            onClick={() => openDatePicker('discount')}
                                            className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white text-left flex justify-between items-center"
                                        >
                                            <span>{editDiscountDeadline ? new Date(editDiscountDeadline).toLocaleString() : 'Set Date & Time'}</span>
                                            <FaCalendarAlt className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 dark:text-white mt-4">What you'll learn</h3>
                                <div className="space-y-2">
                                    {learningPoints.map((point, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <FaCheck className="text-green-500" />
                                            <input 
                                                className="flex-1 border p-2 rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                                                value={point}
                                                onChange={(e) => {
                                                    const newPoints = [...learningPoints];
                                                    newPoints[index] = e.target.value;
                                                    setLearningPoints(newPoints);
                                                }}
                                            />
                                            <button onClick={() => removeLearningPoint(index)} className="text-red-500"><FaTrash /></button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-1 border p-2 rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                                            placeholder="Add new learning point"
                                            value={newPoint}
                                            onChange={(e) => setNewPoint(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addLearningPoint()}
                                        />
                                        <button onClick={addLearningPoint} className="bg-green-600 text-white px-3 rounded"><FaPlus /></button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 dark:text-white mt-4">Course Global Resources</h3>
                                <div className="space-y-2">
                                    {resources.map((res) => (
                                        <div key={res.id} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                            {res.type === 'pdf' ? <FaFilePdf className="text-red-500" /> : res.type === 'zip' ? <FaFileArchive className="text-yellow-500" /> : <FaLink className="text-blue-500" />}
                                            <a href={res.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex-1 truncate">{res.title}</a>
                                            <button onClick={() => removeResource(res.id)} className="text-red-500"><FaTrash size={12} /></button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2 items-center">
                                        <select 
                                            className="border p-2 rounded text-sm bg-white dark:bg-gray-700 dark:text-white"
                                            value={newResource.type}
                                            onChange={(e) => setNewResource({...newResource, type: e.target.value as any})}
                                        >
                                            <option value="link">Link</option>
                                            <option value="pdf">PDF</option>
                                            <option value="zip">ZIP</option>
                                            <option value="file">File</option>
                                        </select>
                                        <input 
                                            className="flex-1 border p-2 rounded text-sm bg-white dark:bg-gray-700 dark:text-white"
                                            placeholder="Resource Title"
                                            value={newResource.title}
                                            onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                                        />
                                        <input 
                                            className="flex-1 border p-2 rounded text-sm bg-white dark:bg-gray-700 dark:text-white"
                                            placeholder="URL"
                                            value={newResource.url}
                                            onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                                        />
                                        <button onClick={addResource} className="bg-green-600 text-white px-3 py-1 rounded"><FaPlus /></button>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={() => setIsEditMode(false)} className="text-gray-600 dark:text-gray-400 font-bold">Cancel</button>
                                    <button onClick={handleSaveOverviewAndSettings} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold">Save Changes</button>
                                </div>
                            </div>
                        )}
                        
                        {/* View Mode */}
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-4">Course Description</h3>
                        <p className="leading-relaxed mb-6 whitespace-pre-wrap">{course.bio || "No description provided."}</p>
                        
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-4">What you'll learn</h3>
                        <div className="grid md:grid-cols-2 gap-3 mb-8">
                            {course.learningPoints && course.learningPoints.map((point, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                                    <span className="text-sm">{point}</span>
                                </div>
                            ))}
                        </div>

                        {/* Course Global Resources (View Mode) */}
                        {course.resources && course.resources.length > 0 && (
                            <>
                                <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-4">Course Resources</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {course.resources.map(res => (
                                        <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                                            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50">
                                                {res.type === 'pdf' ? <FaFilePdf className="text-red-500" /> : res.type === 'zip' ? <FaFileArchive className="text-yellow-500" /> : <FaLink />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{res.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{res.type}</p>
                                            </div>
                                            <FaDownload className="text-gray-400 group-hover:text-primary-600" />
                                        </a>
                                    ))}
                                </div>
                            </>
                        )}
                        
                    </div>
                )}

                {activeTab === 'instructors' && (
                    <div className="space-y-6">
                        {isEditMode && (
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg dark:text-white">Manage Instructors</h3>
                                <button onClick={() => setShowInstructorAdd(!showInstructorAdd)} className="text-primary-600 text-sm font-bold flex items-center gap-1"><FaUserPlus /> Add Instructor</button>
                            </div>
                        )}
                        
                        {isEditMode && showInstructorAdd && (
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 border dark:border-gray-700">
                                <p className="text-xs text-gray-500 mb-2">Select user to add as instructor:</p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {availableInstructors.filter(u => !course.instructors.some(i => i.id === u.id)).map(u => (
                                        <div key={u.id} className="flex-shrink-0 bg-white dark:bg-gray-700 p-2 rounded shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-primary-500 w-32 text-center" onClick={() => handleAddInstructor(u)}>
                                            <img src={u.avatar} className="w-10 h-10 rounded-full mx-auto mb-1" />
                                            <p className="text-xs font-bold truncate dark:text-white">{u.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {course.instructors.map((inst, idx) => (
                                <div key={inst.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex gap-6 relative group">
                                    {isEditMode && (
                                        <button onClick={() => handleRemoveInstructor(inst.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-2"><FaTrash /></button>
                                    )}
                                    <img src={inst.avatar} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" alt={inst.name} />
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{inst.name}</h3>
                                        <p className="text-primary-600 font-medium text-sm mb-2">Instructor</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">{inst.bio || 'Experienced educator.'}</p>
                                        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1"><FaStar className="text-yellow-400"/> {inst.rating || 4.8} Rating</div>
                                            <div className="flex items-center gap-1"><FaUser /> {inst.studentsCount?.toLocaleString() || '10k'} Students</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'certificate' && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                        <div className="mb-6">
                            <FaAward className="text-6xl text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course Certificate</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                Complete all lessons and pass the final exam with 70% or higher to earn your official certificate of completion.
                            </p>
                        </div>

                        {/* Certificate Preview Card */}
                        <div className="relative bg-white text-gray-900 p-8 rounded-lg shadow-lg border-8 border-double border-gray-300 max-w-lg mx-auto text-center overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
                             <div className="flex justify-center mb-4 text-primary-800">
                                 <FaUniversity size={40} />
                             </div>
                             <h4 className="text-3xl font-serif font-bold text-gray-800 mb-1">Certificate of Completion</h4>
                             <p className="text-xs uppercase tracking-widest text-gray-500 mb-6">This certifies that</p>
                             <h2 className="text-2xl font-bold text-primary-700 italic border-b border-gray-300 pb-2 mb-2 inline-block px-8">{user.name}</h2>
                             <p className="text-sm text-gray-600 mb-4">has successfully completed the course</p>
                             <h3 className="text-xl font-bold text-gray-900 mb-6">{course.title}</h3>
                             <div className="flex justify-between items-end text-xs text-gray-500 mt-8 px-4">
                                 <div className="text-center">
                                     <div className="w-24 border-b border-gray-400 mb-1"></div>
                                     <span>Date</span>
                                 </div>
                                 <div className="text-center">
                                     <FaCertificate className="text-yellow-600 text-3xl mx-auto mb-1 opacity-80" />
                                     <span>Official Seal</span>
                                 </div>
                                 <div className="text-center">
                                     <div className="w-24 border-b border-gray-400 mb-1"></div>
                                     <span>Instructor</span>
                                 </div>
                             </div>
                        </div>

                        <div className="mt-8">
                            {hasCertificate ? (
                                <button onClick={() => navigate(`/certificate/${getCertificates().find(c => c.courseId === id)?.id}`)} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg transition-transform active:scale-95">
                                    View & Download Certificate
                                </button>
                            ) : (
                                <div className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-6 py-2 rounded-lg font-bold text-sm">
                                    Locked - Complete Course First
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
         </div>

         {/* Sidebar - Video Preview & Price */}
         <div className="lg:col-span-1 space-y-6 self-start sticky top-24 lg:-mt-32 z-20">
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                 <div className="relative aspect-video bg-black group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
                     <img src={course.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" alt="Preview" />
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                             <FaPlayCircle className="text-primary-600 text-3xl" />
                         </div>
                     </div>
                     <div className="absolute bottom-4 left-0 w-full text-center text-white font-bold text-sm">
                         Preview this course
                     </div>
                 </div>
                 
                 <div className="p-6">
                     <div className="flex items-end gap-3 mb-4">
                         {course.price === 0 ? (
                             <span className="text-4xl font-bold text-green-600 dark:text-green-400">Free</span>
                         ) : (
                             <span className="text-4xl font-bold text-gray-900 dark:text-white">${course.price}</span>
                         )}
                         
                         {course.originalPrice && course.originalPrice > course.price && (
                             <span className="text-lg text-gray-400 line-through mb-1.5">${course.originalPrice}</span>
                         )}
                         {discountPercent > 0 && (
                             <span className="mb-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                                 {discountPercent}% OFF
                             </span>
                         )}
                     </div>

                     {timeLeft && (
                         <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg mb-4 text-sm font-bold dark:bg-red-900/20 dark:text-red-400">
                             <FaStopwatch />
                             <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left at this price!</span>
                         </div>
                     )}

                     {!course.isEnrolled ? (
                         <>
                            <button onClick={handleBuyNow} className="w-full bg-primary-600 text-white py-4 text-lg rounded font-bold hover:bg-primary-700 transition-colors shadow-lg mb-3">
                                {course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                            </button>
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    placeholder="Enter Coupon" 
                                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <button onClick={handleApplyCoupon} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black dark:bg-gray-600 dark:hover:bg-gray-500">Apply</button>
                            </div>
                            {appliedCoupon && (
                                <div className="text-center text-green-600 text-sm font-bold mb-4">
                                    Coupon Applied: {appliedCoupon.code} (-{appliedCoupon.value} {appliedCoupon.type === 'percent' ? '%' : '$'})
                                </div>
                            )}
                         </>
                     ) : (
                         <>
                            <button onClick={() => firstLessonId && navigate(`/lesson/${course.id}/${firstLessonId}`)} className="w-full bg-primary-600 text-white py-4 text-lg rounded font-bold hover:bg-primary-700 transition-colors shadow-lg mb-4">
                                Go to Course
                            </button>
                            
                            {/* Rate Course Button (Only if progress > 70%) */}
                            {course.progress >= 70 && (
                                <button 
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="w-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 py-2 rounded-lg font-bold text-sm mb-4 hover:bg-yellow-200 flex items-center justify-center gap-2"
                                >
                                    <FaStar /> Rate this Course
                                </button>
                            )}
                         </>
                     )}
                     
                     <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-6">
                         <h4 className="font-bold text-gray-900 dark:text-white">This course includes:</h4>
                         <div className="flex items-center gap-3"><FaClock className="text-gray-400"/> {course.totalDuration} on-demand video</div>
                         <div className="flex items-center gap-3"><FaLayerGroup className="text-gray-400"/> {course.sections.length} sections</div>
                         <div className="flex items-center gap-3"><FaBookOpen className="text-gray-400"/> {totalLessons} lessons</div>
                         <div className="flex items-center gap-3"><FaInfinity className="text-gray-400"/> Full lifetime access</div>
                         <div className="flex items-center gap-3"><FaCertificate className="text-gray-400"/> Certificate of completion</div>
                     </div>

                     {/* Admin Coupon Management */}
                     {isAdminOrInstructor && (
                         <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                             {/* Final Exam Edit Button */}
                             <button 
                                onClick={() => openQuizEditor({type: 'final'})}
                                className="w-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 py-2 rounded-lg font-bold text-sm mb-4 hover:bg-yellow-200 flex items-center justify-center gap-2"
                             >
                                 <FaListOl /> Manage Final Exam
                             </button>

                             <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setShowCouponManager(!showCouponManager)}>
                                 <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><FaTicketAlt /> Manage Coupons</h4>
                                 {showCouponManager ? <FaChevronUp /> : <FaChevronDown />}
                             </div>
                             
                             {showCouponManager && (
                                 <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                     {course.coupons && course.coupons.map(c => (
                                         <div key={c.code} className="flex justify-between items-center text-xs bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500">
                                             <div>
                                                 <span className="font-bold block">{c.code}</span>
                                                 <span className="text-[10px] text-gray-500 dark:text-gray-300">
                                                     {c.type === 'free' ? 'FREE' : (c.type === 'fixed' ? `-$${c.value}` : `-${c.value}%`)} • {c.usedCount}/{c.maxUses || '∞'}
                                                 </span>
                                                 {c.expiresAt && <div className="text-[9px] text-red-400">Exp: {new Date(c.expiresAt).toLocaleDateString()}</div>}
                                                 {c.allowedUserIds && c.allowedUserIds.length > 0 && <div className="text-[9px] text-blue-400">Users: {c.allowedUserIds.length}</div>}
                                             </div>
                                             <div className="flex gap-2">
                                                 <button onClick={() => startEditCoupon(c)} className="text-blue-500"><FaEdit /></button>
                                                 <button onClick={() => deleteCoupon(c.code)} className="text-red-500"><FaTrash /></button>
                                             </div>
                                         </div>
                                     ))}
                                     
                                     <div className="border-t dark:border-gray-600 pt-2 mt-2">
                                         <input 
                                             className="w-full border p-1 rounded text-xs mb-1 bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500" 
                                             placeholder="Code (e.g. SUMMER20)" 
                                             value={newCoupon.code}
                                             onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                                         />
                                         <div className="flex gap-1 mb-1">
                                             <select 
                                                 className="border p-1 rounded text-xs w-1/2 bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500"
                                                 value={newCoupon.type}
                                                 onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})}
                                             >
                                                 <option value="percent">Percent Off</option>
                                                 <option value="fixed">Price Off ($)</option>
                                                 <option value="free">Free</option>
                                             </select>
                                             {newCoupon.type !== 'free' && (
                                                 <input 
                                                     type="number" 
                                                     className="border p-1 rounded text-xs w-1/2 bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500" 
                                                     placeholder={newCoupon.type === 'percent' ? "Value %" : "Amount $"} 
                                                     value={newCoupon.value}
                                                     onChange={e => setNewCoupon({...newCoupon, value: parseFloat(e.target.value)})}
                                                 />
                                             )}
                                         </div>
                                         <input 
                                             className="w-full border p-1 rounded text-xs mb-1 bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500" 
                                             placeholder="Allowed User IDs (comma sep)" 
                                             value={newCoupon.allowedUserId}
                                             onChange={e => setNewCoupon({...newCoupon, allowedUserId: e.target.value})}
                                         />
                                         <input 
                                             className="w-full border p-1 rounded text-xs mb-1 bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500" 
                                             placeholder="Max Uses (0 for unlimited)" 
                                             type="number"
                                             value={newCoupon.maxUses}
                                             onChange={e => setNewCoupon({...newCoupon, maxUses: parseInt(e.target.value)})}
                                         />
                                         <button 
                                            onClick={() => openDatePicker('coupon')} 
                                            className="w-full border p-1 rounded text-xs mb-2 bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500 text-left flex justify-between items-center"
                                         >
                                             <span>{newCoupon.expiresAt ? new Date(newCoupon.expiresAt).toLocaleDateString() : 'Set Expire Date'}</span>
                                             <FaCalendarAlt className="text-gray-400" />
                                         </button>
                                         
                                         <button onClick={handleSaveCoupon} className="w-full bg-blue-600 text-white text-xs py-1 rounded font-bold">
                                             {editingCouponCode ? 'Update Coupon' : 'Create Coupon'}
                                         </button>
                                     </div>
                                 </div>
                             )}
                         </div>
                     )}
                 </div>
             </div>
         </div>
      </div>

      {/* Review Modal */}
      {course && (
          <ReviewModal 
              isOpen={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
              reviews={course.reviews || []}
              courseId={course.id}
              currentUser={user}
              userProgress={course.progress || 0}
              onAddReview={handleAddReview}
              onDeleteReview={handleDeleteReview}
          />
      )}

      {/* Video Preview Modal - Styled */}
      {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 animate-fade-in">
              <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col">
                  <div className="relative aspect-video">
                        <button onClick={() => setIsPreviewOpen(false)} className="absolute top-4 right-4 text-white z-10 hover:text-gray-300">
                            <FaTimes size={24} />
                        </button>
                        <video 
                            src={course.previewVideoUrl} 
                            controls 
                            autoPlay 
                            className="w-full h-full"
                        >
                            Your browser does not support the video tag.
                        </video>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
                        <div className="text-gray-600 dark:text-gray-300">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">{course.title}</h4>
                            <div className="flex gap-4 text-xs mt-1">
                                <span className="flex items-center gap-1"><FaClock /> {course.totalDuration}</span>
                                <span className="flex items-center gap-1"><FaBookOpen /> {totalLessons} lessons</span>
                            </div>
                        </div>
                        
                        {!course.isEnrolled ? (
                            <button onClick={() => { setIsPreviewOpen(false); handleBuyNow(); }} className="bg-primary-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg text-sm">
                                {course.price === 0 ? 'Enroll Now' : `Buy Now $${course.price}`}
                            </button>
                        ) : (
                            <button onClick={() => { setIsPreviewOpen(false); if(firstLessonId) navigate(`/lesson/${course.id}/${firstLessonId}`); }} className="bg-primary-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg text-sm">
                                Go to Course
                            </button>
                        )}
                  </div>
              </div>
          </div>
      )}

      {/* Date Picker Custom Modal */}
      {isDatePickerOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm">
                  <h3 className="text-lg font-bold mb-4 dark:text-white">Select Date & Time</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date</label>
                          <input 
                              type="date" 
                              className="w-full border p-2 rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                              min={getTodayString()}
                              value={tempDate}
                              onChange={e => setTempDate(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Time</label>
                          <input 
                              type="time" 
                              className="w-full border p-2 rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                              value={tempTime}
                              onChange={e => setTempTime(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => { setEditDiscountDeadline(''); setNewCoupon({...newCoupon, expiresAt: ''}); setIsDatePickerOpen(false); }} className="text-red-500 text-sm font-bold">Clear</button>
                      <button onClick={() => setIsDatePickerOpen(false)} className="text-gray-500 font-bold text-sm dark:text-gray-400">Cancel</button>
                      <button onClick={handleDateConfirm} className="bg-primary-600 text-white px-4 py-2 rounded font-bold text-sm">Set</button>
                  </div>
              </div>
          </div>
      )}

      {/* ... (Other Modals) ... */}
      {/* ... (Section Modal, Lesson Modal, Quiz Editor Modal - keeping logic unchanged just ensuring component is complete) ... */}
      {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl animate-fade-in">
                  <h3 className="font-bold text-xl mb-4 dark:text-white">{sectionModalMode === 'add' ? 'Add New Section' : 'Edit Section'}</h3>
                  <input 
                      type="text" 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Section Title (e.g. Introduction)"
                      value={sectionTitleInput}
                      onChange={e => setSectionTitleInput(e.target.value)}
                      autoFocus
                  />
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setIsSectionModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancel</button>
                      <button onClick={handleSaveSection} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700">Save</button>
                  </div>
              </div>
          </div>
      )}

      {isLessonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto">
                  <h3 className="font-bold text-xl mb-4 dark:text-white">{lessonModalMode === 'add' ? 'Add New Content' : 'Edit Content'}</h3>
                  <div className="space-y-4">
                      {/* ... Lesson Fields ... */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                          <input 
                              type="text" 
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={lessonData.title}
                              onChange={e => setLessonData({...lessonData, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                          <select 
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={lessonData.type}
                              onChange={e => setLessonData({...lessonData, type: e.target.value as any})}
                          >
                              <option value="video">Video</option>
                              <option value="document">Document / PDF</option>
                              <option value="quiz">Quiz</option>
                          </select>
                      </div>
                      
                      {lessonData.type === 'document' && (
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Document Format</label>
                              <div className="flex gap-4">
                                  <label className="flex items-center gap-2">
                                      <input 
                                          type="radio" 
                                          name="docType" 
                                          checked={lessonData.docType === 'text'} 
                                          onChange={() => setLessonData({...lessonData, docType: 'text'})}
                                      /> Text Content
                                  </label>
                                  <label className="flex items-center gap-2">
                                      <input 
                                          type="radio" 
                                          name="docType" 
                                          checked={lessonData.docType === 'pdf'} 
                                          onChange={() => setLessonData({...lessonData, docType: 'pdf'})}
                                      /> PDF URL
                                  </label>
                              </div>
                          </div>
                      )}

                      {lessonData.type !== 'quiz' && (
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                  {lessonData.type === 'video' ? 'Video URL' : (lessonData.docType === 'pdf' ? 'PDF URL' : 'Content Text')}
                              </label>
                              {lessonData.type === 'document' && lessonData.docType === 'text' ? (
                                  <textarea 
                                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={lessonContent}
                                      onChange={e => setLessonContent(e.target.value)}
                                  />
                              ) : (
                                  <input 
                                      type="text" 
                                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      placeholder="https://..."
                                      value={lessonContent}
                                      onChange={e => setLessonContent(e.target.value)}
                                  />
                              )}
                          </div>
                      )}

                      {/* Lesson Overview & Resources */}
                      {lessonData.type !== 'quiz' && (
                          <>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Lesson Overview</label>
                                  <textarea 
                                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={lessonOverview}
                                      onChange={e => setLessonOverview(e.target.value)}
                                      placeholder="Brief description of this lesson..."
                                  />
                              </div>
                              <div className="border-t pt-2 mt-2 dark:border-gray-700">
                                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Lesson Resources</label>
                                  <div className="flex gap-2 mb-2">
                                      <input 
                                          className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          placeholder="Title" 
                                          value={tempResTitle} 
                                          onChange={e => setTempResTitle(e.target.value)} 
                                      />
                                      <input 
                                          className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          placeholder="URL" 
                                          value={tempResUrl} 
                                          onChange={e => setTempResUrl(e.target.value)} 
                                      />
                                      <button type="button" onClick={addTempLessonResource} className="bg-blue-600 text-white px-3 rounded text-sm"><FaPlus /></button>
                                  </div>
                                  <div className="space-y-1">
                                      {lessonResources.map((res, i) => (
                                          <div key={i} className="flex justify-between items-center text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                              <span>{res.title}</span>
                                              <button type="button" onClick={() => setLessonResources(lessonResources.filter((_, idx) => idx !== i))} className="text-red-500"><FaTimes /></button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </>
                      )}
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setIsLessonModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancel</button>
                      <button onClick={handleSaveLesson} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700">Save</button>
                  </div>
              </div>
          </div>
      )}

      {isQuizEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl animate-fade-in">
                  {/* ... Quiz Editor Content ... */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-xl dark:text-white">
                          {currentQuizTarget?.type === 'final' ? 'Edit Final Exam' : 'Edit Lesson Quiz'}
                      </h3>
                      <button onClick={() => setIsQuizEditorOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><FaTimes /></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Existing Questions List */}
                      {quizQuestions.length > 0 ? (
                          <div className="space-y-4">
                              {quizQuestions.map((q, idx) => (
                                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 relative group">
                                      <p className="font-bold mb-2 pr-16 dark:text-white">Q{idx+1}: {q.question}</p>
                                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                                          {q.options.map((opt, oIdx) => (
                                              <div key={oIdx} className={`flex items-center gap-2 ${oIdx === q.correctAnswer ? 'text-green-600 font-bold dark:text-green-400' : ''}`}>
                                                  {oIdx === q.correctAnswer && <FaCheck size={12} />} {opt}
                                              </div>
                                          ))}
                                      </div>
                                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => handleEditQuestion(idx)} className="text-blue-500 hover:text-blue-700 p-1"><FaEdit /></button>
                                          <button onClick={() => handleDeleteQuestion(idx)} className="text-red-500 hover:text-red-700 p-1"><FaTrash /></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center text-gray-500 py-4 italic">No questions added yet.</div>
                      )}

                      {/* Add/Edit Question Form */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          <h4 className="font-bold text-gray-800 dark:text-white mb-3">{editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}</h4>
                          <div className="space-y-3">
                              <input 
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  placeholder="Question Text"
                                  value={tempQuestion.question}
                                  onChange={e => setTempQuestion({...tempQuestion, question: e.target.value})}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                  {tempQuestion.options.map((opt, i) => (
                                      <input 
                                          key={i}
                                          className={`w-full border rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${tempQuestion.correctAnswer === i ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300 dark:border-gray-600'}`}
                                          placeholder={`Option ${i+1}`}
                                          value={opt}
                                          onChange={e => {
                                              const newOpts = [...tempQuestion.options];
                                              newOpts[i] = e.target.value;
                                              setTempQuestion({...tempQuestion, options: newOpts});
                                          }}
                                      />
                                  ))}
                              </div>
                              <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Correct Answer:</span>
                                  <select 
                                      className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={tempQuestion.correctAnswer}
                                      onChange={e => setTempQuestion({...tempQuestion, correctAnswer: parseInt(e.target.value)})}
                                  >
                                      <option value={0}>Option 1</option>
                                      <option value={1}>Option 2</option>
                                      <option value={2}>Option 3</option>
                                      <option value={3}>Option 4</option>
                                  </select>
                                  <button 
                                      onClick={handleSaveQuestion}
                                      className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
                                  >
                                      {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800">
                      <button onClick={() => setIsQuizEditorOpen(false)} className="text-gray-600 dark:text-gray-300 font-bold">Cancel</button>
                      <button onClick={handleSaveQuiz} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg">
                          Save All Changes
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CourseDetail;


import React, { useState, useEffect } from 'react';
import { CURRENT_USER } from '../constants';
import { FaFilter, FaStar, FaUserTie, FaClock, FaBookOpen, FaCertificate, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getCertificates, getCourses, addCourse, getUser, getAllUsers } from '../services/dataService';
import { UserRole, Course, User } from '../types';

const CourseList: React.FC = () => {
  const navigate = useNavigate();
  const [filterLevel, setFilterLevel] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [coursesWithProgress, setCoursesWithProgress] = useState(getCourses());
  const [user, setUser] = useState(getUser());
  
  // Create Course Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({ title: '', price: 0, level: 'Beginner', tags: [], thumbnail: '' });
  const [tagsInput, setTagsInput] = useState(''); // State for Tags input string
  
  // Instructor Search State
  const [instructorSearch, setInstructorSearch] = useState('');
  const [instructors, setInstructors] = useState<User[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<User | null>(null);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);

  useEffect(() => {
      // Use getCourses to get synced state from localStorage
      const allCourses = getCourses();
      const allCertificates = getCertificates();
      const updatedCourses = allCourses.map(c => {
          const hasCert = allCertificates.some(cert => cert.courseId === c.id && user.certificates.includes(cert.id));
          return hasCert ? { ...c, progress: 100, isEnrolled: true } : c;
      });
      setCoursesWithProgress(updatedCourses);
      setUser(getUser());

      // Filter Instructors
      const allUsers = getAllUsers();
      setInstructors(allUsers.filter(u => u.role === UserRole.INSTRUCTOR || u.role === UserRole.ADMIN));
  }, []);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = coursesWithProgress.filter(c => {
    const matchLevel = filterLevel === 'All' || c.level === filterLevel;
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchLevel && matchSearch;
  });

  const getCertificateId = (courseId: string) => {
      const allCertificates = getCertificates();
      const cert = allCertificates.find(c => c.courseId === courseId && user.certificates.includes(c.id));
      return cert?.id;
  };

  const getFirstLessonId = (course: any) => {
      return course.sections?.[0]?.lessons?.[0]?.id || 'l1';
  }

  const handleCreateCourse = (e: React.FormEvent) => {
      e.preventDefault();
      // Default instructor is self if not selected (or if user is instructor)
      const instr = selectedInstructor || user;

      // Parse tags
      const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

      const course: Course = {
          id: `c_${Date.now()}`,
          title: newCourse.title || 'New Course',
          thumbnail: newCourse.thumbnail || 'https://picsum.photos/seed/new/800/450',
          instructors: [{ id: instr.id, name: instr.name, avatar: instr.avatar, bio: instr.bio, rating: 5, coursesCount: 1, studentsCount: 0 }],
          rating: 0,
          reviewsCount: 0,
          totalStudents: 0,
          totalDuration: '0h 0m',
          level: newCourse.level as any,
          tags: parsedTags.length > 0 ? parsedTags : ['New'],
          progress: 0,
          sections: [],
          price: newCourse.price || 0,
          isEnrolled: false
      };
      addCourse(course);
      setCoursesWithProgress([...coursesWithProgress, course]);
      setIsCreateModalOpen(false);
      setTagsInput(''); // Reset tags
      navigate(`/courses/${course.id}`);
  };

  const canCreate = user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Courses</h1>
           <p className="text-gray-500 dark:text-gray-400">Discover new skills and advance your career</p>
        </div>
        
        <div className="flex items-center gap-3">
            {canCreate && (
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700 shadow-lg"
                >
                    <FaPlus /> New Course
                </button>
            )}
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search topics..." 
                    className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 dark:bg-gray-800 dark:border-gray-700">
                {levels.map(level => (
                    <button
                        key={level}
                        onClick={() => setFilterLevel(level)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            filterLevel === level 
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' 
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                    >
                        {level}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map(course => {
            const certId = getCertificateId(course.id);
            const isCompleted = course.progress === 100;

            return (
              <div 
                key={course.id} 
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer overflow-hidden"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                        <FaStar className="text-yellow-400" /> {course.rating}
                    </div>
                    {course.isEnrolled && (
                         <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                            {isCompleted ? 'Completed' : 'Enrolled'}
                        </div>
                    )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            course.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                            {course.level}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FaClock size={10} /> {course.totalDuration}
                        </span>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">{course.title}</h3>
                    
                    {course.instructors && course.instructors.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            <img src={course.instructors[0].avatar} alt="inst" className="w-6 h-6 rounded-full" />
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{course.instructors[0].name}</span>
                        </div>
                    )}

                    {/* Progress Bar for Enrolled Courses */}
                    {course.isEnrolled && !isCompleted && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1 text-gray-500 dark:text-gray-400">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                             <FaBookOpen /> {course.reviewsCount} lessons
                        </div>
                        
                        {isCompleted && certId ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/certificate/${certId}`); }}
                                className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 hover:underline"
                            >
                                <FaCertificate /> View Certificate
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(course.isEnrolled) {
                                        if (isCompleted) navigate(`/quiz/${course.id}`);
                                        else navigate(`/lesson/${course.id}/${getFirstLessonId(course)}`);
                                    } else {
                                        navigate(`/courses/${course.id}`);
                                    }
                                }}
                                className="font-bold text-primary-600 dark:text-primary-400 text-sm hover:underline"
                            >
                                {course.isEnrolled ? (isCompleted ? 'Take Exam' : 'Continue') : `$${course.price}`}
                            </button>
                        )}
                    </div>
                </div>
              </div>
            );
        })}
      </div>

      {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Course</h2>
                      <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                          <FaTimes />
                      </button>
                  </div>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                          <input 
                              type="text" 
                              required 
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                              value={newCourse.title}
                              onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  placeholder="https://example.com/image.jpg"
                                  value={newCourse.thumbnail}
                                  onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})}
                              />
                              <button type="button" className="bg-gray-200 dark:bg-gray-600 px-3 rounded-lg text-sm font-bold text-gray-700 dark:text-white">Upload</button>
                          </div>
                      </div>

                      {/* Instructor Search Dropdown (Admin only usually, but Instructor can see self) */}
                      {user.role === UserRole.ADMIN && (
                          <div className="relative">
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Assign Instructor</label>
                              <div className="relative">
                                  <input 
                                      type="text"
                                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                      placeholder="Search instructor..."
                                      value={instructorSearch}
                                      onFocus={() => setShowInstructorDropdown(true)}
                                      onChange={(e) => { setInstructorSearch(e.target.value); setShowInstructorDropdown(true); }}
                                  />
                                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                              </div>
                              {showInstructorDropdown && (
                                  <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto z-10">
                                      {instructors.filter(i => i.name.toLowerCase().includes(instructorSearch.toLowerCase())).map(inst => (
                                          <div 
                                            key={inst.id} 
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                                            onClick={() => { setSelectedInstructor(inst); setInstructorSearch(inst.name); setShowInstructorDropdown(false); }}
                                          >
                                              <img src={inst.avatar} className="w-6 h-6 rounded-full" />
                                              <span className="text-sm text-gray-800 dark:text-white">{inst.name}</span>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                              <input 
                                  type="number" 
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  value={newCourse.price}
                                  onChange={e => setNewCourse({...newCourse, price: parseFloat(e.target.value)})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Level</label>
                              <select 
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  value={newCourse.level}
                                  onChange={e => setNewCourse({...newCourse, level: e.target.value as any})}
                              >
                                  <option>Beginner</option>
                                  <option>Intermediate</option>
                                  <option>Advanced</option>
                              </select>
                          </div>
                      </div>

                      {/* NEW: Tags Input */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                          <input 
                              type="text" 
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                              placeholder="e.g. React, Web, CSS"
                              value={tagsInput}
                              onChange={e => setTagsInput(e.target.value)}
                          />
                      </div>

                      <button type="submit" className="w-full bg-primary-600 text-white font-bold py-2 rounded-lg hover:bg-primary-700">Create & Continue</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default CourseList;

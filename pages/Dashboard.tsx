
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, getCertificates, getCourses } from '../services/dataService';
import { FaPlayCircle, FaCheckCircle, FaFire, FaClock, FaTrophy, FaGraduationCap, FaCertificate } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();
  // Get courses from LocalStorage to ensure progress sync
  const courses = getCourses();
  const allCertificates = getCertificates();
  
  // Sync progress: If user has a certificate for a course, consider it 100% complete
  const coursesWithSync = courses.map(c => {
      const hasCert = allCertificates.some(cert => cert.courseId === c.id && user.certificates.includes(cert.id));
      return hasCert ? { ...c, progress: 100, isEnrolled: true } : c;
  });

  const activeCourse = coursesWithSync.find(c => c.progress > 0 && c.progress < 100) || coursesWithSync[0];
  const completedCount = coursesWithSync.filter(c => c.progress === 100).length;
  
  // Find valid first lesson ID
  const activeLessonId = activeCourse.sections[0]?.lessons[0]?.id || 'l1';

  // Check if certificate exists for active course
  const activeCourseCertificate = allCertificates.find(c => c.courseId === activeCourse.id && user.certificates.includes(c.id));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-primary-100 text-lg mb-8">
            You've learned for <strong>32 hours</strong> this week. Keep up the momentum to reach your Level {user.level + 1} goal.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
                onClick={() => navigate(`/lesson/${activeCourse.id}/${activeLessonId}`)}
                className="bg-white text-primary-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <FaPlayCircle /> {activeCourse.progress > 0 ? 'Continue Learning' : 'Start Learning'}
            </button>
            <button 
                onClick={() => navigate('/courses')}
                className="bg-primary-700 bg-opacity-40 border border-primary-400 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-opacity-50 transition-all"
            >
              Browse Catalog
            </button>
          </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-secondary-500 opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center dark:bg-gray-800 dark:border-gray-700">
           <div className="p-3 bg-orange-100 text-orange-600 rounded-full mb-3 dark:bg-orange-900/30 dark:text-orange-400">
             <FaFire size={20} />
           </div>
           <span className="text-2xl font-bold text-gray-800 dark:text-white">{user.streak}</span>
           <span className="text-xs text-gray-500 font-medium uppercase tracking-wide dark:text-gray-400">Day Streak</span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center dark:bg-gray-800 dark:border-gray-700">
           <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3 dark:bg-blue-900/30 dark:text-blue-400">
             <FaCheckCircle size={20} />
           </div>
           <span className="text-2xl font-bold text-gray-800 dark:text-white">{completedCount}</span>
           <span className="text-xs text-gray-500 font-medium uppercase tracking-wide dark:text-gray-400">Completed</span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center dark:bg-gray-800 dark:border-gray-700">
           <div className="p-3 bg-purple-100 text-purple-600 rounded-full mb-3 dark:bg-purple-900/30 dark:text-purple-400">
             <FaClock size={20} />
           </div>
           <span className="text-2xl font-bold text-gray-800 dark:text-white">142h</span>
           <span className="text-xs text-gray-500 font-medium uppercase tracking-wide dark:text-gray-400">Total Hours</span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center dark:bg-gray-800 dark:border-gray-700">
           <div className="p-3 bg-green-100 text-green-600 rounded-full mb-3 dark:bg-green-900/30 dark:text-green-400">
             <FaPlayCircle size={20} />
           </div>
           <span className="text-2xl font-bold text-gray-800 dark:text-white">{coursesWithSync.filter(c => c.progress > 0 && c.progress < 100).length}</span>
           <span className="text-xs text-gray-500 font-medium uppercase tracking-wide dark:text-gray-400">In Progress</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Continue Learning Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Continue Learning</h2>
            <button onClick={() => navigate('/profile')} className="text-sm text-primary-600 font-medium hover:underline dark:text-primary-400">My Courses</button>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow cursor-pointer group dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate(`/lesson/${activeCourse.id}/${activeLessonId}`)}>
            <div className="relative w-full sm:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                <img src={activeCourse.thumbnail} alt={activeCourse.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                    {activeCourse.progress === 100 ? <FaCheckCircle className="text-green-400 opacity-90" size={32} /> : <FaPlayCircle className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" size={32} />}
                </div>
                {activeCourse.progress < 100 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                        12m left
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-center flex-1">
                <span className="text-xs font-semibold text-primary-600 mb-1 dark:text-primary-400">{activeCourse.tags[0]}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight dark:text-white">{activeCourse.title}</h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2 dark:bg-gray-700">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${activeCourse.progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{activeCourse.progress}% Complete</span>
                </div>
                
                {activeCourse.progress === 100 && (
                    activeCourseCertificate ? (
                        <button 
                            onClick={(e) => {e.stopPropagation(); navigate(`/certificate/${activeCourseCertificate.id}`)}}
                            className="mt-3 w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2 text-lg"
                        >
                            <FaCertificate size={24} /> View Certificate
                        </button>
                    ) : (
                        <button 
                            onClick={(e) => {e.stopPropagation(); navigate(`/quiz/${activeCourse.id}`)}}
                            className="mt-3 w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-md flex items-center justify-center gap-2 text-lg"
                        >
                            <FaGraduationCap size={24} /> Take Final Exam
                        </button>
                    )
                )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">Recommended for you</h2>
            <div className="grid md:grid-cols-2 gap-4">
                 {coursesWithSync.filter(c => !c.isEnrolled).slice(0, 2).map(course => (
                     <div key={course.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate(`/courses/${course.id}`)}>
                         <div className="h-32 rounded-lg overflow-hidden mb-3 relative">
                             <img src={course.thumbnail} className="w-full h-full object-cover" alt={course.title} />
                             <span className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm text-gray-800">⭐ {course.rating}</span>
                         </div>
                         <h4 className="font-bold text-gray-800 truncate dark:text-white">{course.title}</h4>
                         {course.instructors && course.instructors.length > 0 && (
                             <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{course.instructors[0].name}</p>
                         )}
                         <div className="mt-3 flex items-center justify-between">
                             <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 dark:bg-gray-700 dark:text-gray-300">{course.level}</span>
                             <span className="font-bold text-primary-600 dark:text-primary-400">${course.price}</span>
                         </div>
                     </div>
                 ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Schedule & Achievements */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 dark:text-white">
                   <FaTrophy className="text-yellow-500" /> Recent Achievements
               </h3>
               <div className="space-y-4">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl dark:bg-yellow-900/30">🚀</div>
                       <div>
                           <p className="text-sm font-bold text-gray-800 dark:text-white">Fast Starter</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">Completed 3 lessons in 1 hour</p>
                       </div>
                   </div>
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl dark:bg-blue-900/30">📚</div>
                       <div>
                           <p className="text-sm font-bold text-gray-800 dark:text-white">Bookworm</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">Studied for 10 total hours</p>
                       </div>
                   </div>
               </div>
               <button onClick={() => navigate('/achievements')} className="w-full mt-4 text-sm text-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">View All Badges</button>
           </div>

           <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg">
               <h3 className="font-bold mb-2 text-white">Upgrade to Pro</h3>
               <p className="text-sm opacity-90 mb-4 text-white">Get unlimited access to all courses, certificates, and 1-on-1 mentorship.</p>
               <button className="w-full bg-white text-violet-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
                   Get Pro Access
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

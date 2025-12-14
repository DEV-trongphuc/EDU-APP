
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, issueCertificate, getUser, updateCourse } from '../services/dataService';
import { QuizQuestion, UserRole } from '../types';
import { FaClock, FaCheckCircle, FaTimesCircle, FaRedo, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

const QuizPage: React.FC = () => {
    const { courseId } = useParams<{courseId: string}>();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<{[key: string]: number}>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    
    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false);
    const [newQQuestion, setNewQQuestion] = useState('');
    const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
    const [newQCorrect, setNewQCorrect] = useState(0);

    const user = getUser();
    const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR;

    useEffect(() => {
        if(courseId) {
            const course = getCourseById(courseId);
            if(course) {
                // Logic: If no quiz questions exist, bypass quiz and issue certificate immediately
                if (!course.finalQuiz || course.finalQuiz.length === 0) {
                    if (!isEditMode) { // Only redirect if not editing
                        // Issue certificate with 100% score since there is no exam
                        const certId = issueCertificate(courseId, 100);
                        navigate(`/certificate/${certId}`, { replace: true });
                        return;
                    }
                } else {
                    setQuestions(course.finalQuiz);
                }
            }
        }
    }, [courseId, isEditMode, navigate]);

    // Timer
    useEffect(() => {
        if(submitted || questions.length === 0 || isEditMode) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if(prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [submitted, questions, isEditMode]);

    const handleSelectOption = (optionIdx: number) => {
        if(submitted || isEditMode) return;
        setAnswers({ ...answers, [questions[currentQuestionIdx].id]: optionIdx });
    };

    const handleSubmit = () => {
        let correctCount = 0;
        questions.forEach(q => {
            if(answers[q.id] === q.correctAnswer) correctCount++;
        });
        const finalScore = (correctCount / questions.length) * 100;
        setScore(finalScore);
        setSubmitted(true);
    };

    const handleClaimCertificate = () => {
        if(courseId) {
            const certId = issueCertificate(courseId, score);
            navigate(`/certificate/${certId}`);
        }
    };

    const handleTryAgain = () => {
        setSubmitted(false);
        setAnswers({});
        setCurrentQuestionIdx(0);
        setScore(0);
        setTimeLeft(300);
    };

    // --- Editing Logic ---
    const handleAddQuestion = () => {
        if(!newQQuestion || newQOptions.some(o => !o)) return;
        const newQuestion: QuizQuestion = {
            id: `q_${Date.now()}`,
            question: newQQuestion,
            options: [...newQOptions],
            correctAnswer: newQCorrect
        };
        const updatedQuestions = [...questions, newQuestion];
        setQuestions(updatedQuestions);
        saveQuiz(updatedQuestions);
        setNewQQuestion('');
        setNewQOptions(['','','','']);
    };

    const handleDeleteQuestion = (idx: number) => {
        const updatedQuestions = questions.filter((_, i) => i !== idx);
        setQuestions(updatedQuestions);
        if(currentQuestionIdx >= updatedQuestions.length) setCurrentQuestionIdx(Math.max(0, updatedQuestions.length - 1));
        saveQuiz(updatedQuestions);
    };

    const saveQuiz = (qs: QuizQuestion[]) => {
        if(courseId) {
            const course = getCourseById(courseId);
            if(course) {
                updateCourse({ ...course, finalQuiz: qs });
            }
        }
    }

    if(questions.length === 0 && !isEditMode) return <div className="p-10 text-center">Redirecting to certificate...</div>;

    const currentQ = questions[currentQuestionIdx];

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100 mt-10 animate-fade-in relative">
            {canEdit && (
                <div className="absolute top-4 right-4">
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)} 
                        className={`text-sm font-bold px-3 py-1 rounded flex items-center gap-1 ${isEditMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        <FaEdit /> {isEditMode ? 'Done Editing' : 'Edit Quiz'}
                    </button>
                </div>
            )}

            {isEditMode ? (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Edit Quiz Questions</h2>
                    <div className="space-y-4">
                        {questions.length > 0 ? questions.map((q, idx) => (
                            <div key={q.id} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50">
                                <div>
                                    <p className="font-bold">Q{idx+1}: {q.question}</p>
                                    <p className="text-sm text-green-600">Ans: {q.options[q.correctAnswer]}</p>
                                </div>
                                <button onClick={() => handleDeleteQuestion(idx)} className="text-red-500 p-2"><FaTrash /></button>
                            </div>
                        )) : <div className="text-gray-500 italic">No questions yet. Add one below.</div>}
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                        <h3 className="font-bold mb-2">Add New Question</h3>
                        <input 
                            className="w-full border p-2 rounded mb-2 bg-white text-gray-900" 
                            placeholder="Question Text" 
                            value={newQQuestion} 
                            onChange={e => setNewQQuestion(e.target.value)} 
                        />
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {newQOptions.map((opt, i) => (
                                <input 
                                    key={i} 
                                    className={`border p-2 rounded bg-white text-gray-900 ${newQCorrect === i ? 'border-green-500 ring-1 ring-green-500' : ''}`} 
                                    placeholder={`Option ${i+1}`} 
                                    value={opt} 
                                    onChange={e => {
                                        const newOpts = [...newQOptions];
                                        newOpts[i] = e.target.value;
                                        setNewQOptions(newOpts);
                                    }} 
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm">Correct Answer Index (0-3):</span>
                            <input 
                                type="number" 
                                min="0" max="3" 
                                className="border p-1 rounded w-16 bg-white text-gray-900" 
                                value={newQCorrect} 
                                onChange={e => setNewQCorrect(parseInt(e.target.value))} 
                            />
                        </div>
                        <button onClick={handleAddQuestion} className="bg-primary-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2"><FaPlus /> Add Question</button>
                    </div>
                </div>
            ) : !submitted ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-gray-800">Final Exam</h1>
                        <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-primary-600'}`}>
                            <FaClock /> {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${((currentQuestionIdx+1)/questions.length)*100}%` }}></div>
                        </div>
                    </div>

                    {currentQ ? (
                        <>
                            <h2 className="text-xl font-medium mb-6">{currentQ.question}</h2>

                            <div className="space-y-3 mb-8">
                                {currentQ.options.map((opt, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleSelectOption(idx)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            answers[currentQ.id] === idx 
                                            ? 'border-primary-500 bg-primary-50 text-primary-900 ring-2 ring-primary-200' 
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between">
                                <button 
                                    disabled={currentQuestionIdx === 0}
                                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                                    className="px-6 py-2 text-gray-600 font-bold disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {currentQuestionIdx === questions.length - 1 ? (
                                    <button onClick={handleSubmit} className="bg-green-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-green-700">
                                        Submit Exam
                                    </button>
                                ) : (
                                    <button onClick={() => setCurrentQuestionIdx(prev => prev + 1)} className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700">
                                        Next
                                    </button>
                                )}
                            </div>
                        </>
                    ) : <div>No questions available.</div>}
                </>
            ) : (
                <div className="text-center py-10">
                    {score >= 70 ? (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCheckCircle className="text-5xl text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                            <p className="text-gray-600 mb-6">You passed the exam with a score of <span className="font-bold text-green-600 text-xl">{score.toFixed(0)}%</span>.</p>
                            <button onClick={handleClaimCertificate} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 animate-bounce">
                                Claim Certificate
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTimesCircle className="text-5xl text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Failed</h2>
                            <p className="text-gray-600 mb-6">You scored {score.toFixed(0)}%. You need 70% to pass.</p>
                            <button onClick={handleTryAgain} className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-black transition-colors">
                                <FaRedo /> Try Again
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizPage;

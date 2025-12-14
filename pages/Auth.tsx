
import React, { useState, useEffect } from 'react';
import { FaGoogle, FaFacebook, FaEnvelope, FaUser, FaChalkboardTeacher, FaUserShield, FaGift } from 'react-icons/fa';
import { loginAsUser, registerUser } from '../services/dataService';
import { UserRole } from '../types';

interface AuthProps {
  onLogin: (isReferralReward?: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
      // Check for URL params
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
          setReferralCode(ref);
          setIsSignUp(true);
      }
  }, []);

  const handleDemoLogin = (role: UserRole) => {
      let userId = 'u1'; // Student (Alex)
      if (role === UserRole.INSTRUCTOR) userId = 'u2'; // Instructor (Sarah)
      if (role === UserRole.ADMIN) userId = 'u_admin'; // Admin
      
      if (loginAsUser(userId)) {
          onLogin();
      } else {
          alert('Demo user not found. Please try again.');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isSignUp) {
          if (!name || !email || !password) {
              alert("Please fill in all required fields.");
              return;
          }
          const result = registerUser(name, email, referralCode);
          if (result.success) {
              onLogin(result.rewardGiven);
          }
      } else {
          // Mock Login - in real app would check email/pass
          // For demo, we just check if it matches a demo user or just allow "any" login for non-demo users if we had real backend
          // We will fallback to logging in as Student "u1" if email matches, otherwise standard login flow (simulated)
          if (email === 'name@example.com') {
              handleDemoLogin(UserRole.STUDENT);
          } else {
              // Simulate generic login success for demo purposes
              alert("Demo Login: Logging you in as standard student.");
              handleDemoLogin(UserRole.STUDENT);
          }
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 animate-fade-in">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Visual */}
        <div className="md:w-1/2 bg-primary-600 p-10 text-white flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
           <div className="relative z-10">
               <h1 className="text-4xl font-bold mb-6">{isSignUp ? "Start your journey." : "Learn without limits."}</h1>
               <p className="text-lg text-primary-100 mb-8">Join the community of 50,000+ learners mastering design, coding, and business.</p>
               <div className="flex items-center gap-3">
                   <div className="flex -space-x-2">
                       <img className="w-8 h-8 rounded-full border-2 border-primary-600" src="https://picsum.photos/seed/a/50/50" alt="" />
                       <img className="w-8 h-8 rounded-full border-2 border-primary-600" src="https://picsum.photos/seed/b/50/50" alt="" />
                       <img className="w-8 h-8 rounded-full border-2 border-primary-600" src="https://picsum.photos/seed/c/50/50" alt="" />
                   </div>
                   <span className="text-sm font-medium">Join your friends</span>
               </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <p className="text-gray-500 mb-8">{isSignUp ? "Join us and start learning today." : "Enter your details to access your account."}</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            placeholder="John Doe" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                        type="email" 
                        placeholder="name@example.com" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                {/* Referral Code Field */}
                {isSignUp && (
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Referral Code <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="REF123" 
                                className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase tracking-widest font-mono" 
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                            />
                            <FaGift className="absolute left-3 top-3.5 text-purple-500" />
                        </div>
                        <p className="text-xs text-purple-600 mt-1">Both you and your friend get 500 XP!</p>
                    </div>
                )}

                {!isSignUp && (
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                            <span className="text-gray-600">Remember me</span>
                        </label>
                        <button type="button" onClick={() => setIsForgotPasswordOpen(true)} className="text-primary-600 font-medium hover:underline">Forgot password?</button>
                    </div>
                )}

                <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 shadow-lg transition-transform active:scale-95">
                    {isSignUp ? "Sign Up" : "Sign In"}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
                {!isSignUp && (
                    <>
                        <p className="text-xs font-bold text-gray-400 uppercase text-center mb-4 tracking-wider">Quick Demo Access</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                onClick={() => handleDemoLogin(UserRole.STUDENT)} 
                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                                title="Login as Student"
                            >
                                <FaUser className="text-gray-400 group-hover:text-primary-600 mb-1" />
                                <span className="text-xs font-bold text-gray-600 group-hover:text-primary-700">Student</span>
                            </button>
                            <button 
                                onClick={() => handleDemoLogin(UserRole.INSTRUCTOR)} 
                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                                title="Login as Instructor"
                            >
                                <FaChalkboardTeacher className="text-gray-400 group-hover:text-primary-600 mb-1" />
                                <span className="text-xs font-bold text-gray-600 group-hover:text-primary-700">Instructor</span>
                            </button>
                            <button 
                                onClick={() => handleDemoLogin(UserRole.ADMIN)} 
                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                                title="Login as Admin"
                            >
                                <FaUserShield className="text-gray-400 group-hover:text-primary-600 mb-1" />
                                <span className="text-xs font-bold text-gray-600 group-hover:text-primary-700">Admin</span>
                            </button>
                        </div>
                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-gray-400 text-sm">or continue with</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                <FaGoogle className="text-red-500" /> Google
                            </button>
                            <button className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                <FaFacebook className="text-blue-600" /> Facebook
                            </button>
                        </div>
                    </>
                )}
            </div>
            
            <p className="text-center mt-8 text-sm text-gray-500">
                {isSignUp ? "Already have an account?" : "Don't have an account?"} <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary-600 font-bold hover:underline">{isSignUp ? "Sign In" : "Sign Up"}</button>
            </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in text-center relative">
                  <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                      <FaEnvelope size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h3>
                  <p className="text-sm text-gray-500 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
                  
                  <input type="email" placeholder="name@example.com" className="w-full border border-gray-300 p-2 rounded mb-4" />
                  
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setIsForgotPasswordOpen(false)} className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded">Cancel</button>
                      <button onClick={() => { alert('Reset link sent!'); setIsForgotPasswordOpen(false); }} className="px-4 py-2 bg-primary-600 text-white font-bold text-sm rounded hover:bg-primary-700">Send Link</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Auth;

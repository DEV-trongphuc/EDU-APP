
import React, { useEffect, useState } from 'react';
import { FaTimes, FaGift, FaStar } from 'react-icons/fa';

interface ReferralPopupProps {
    onClose: () => void;
}

const ReferralPopup: React.FC<ReferralPopupProps> = ({ onClose }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-all duration-300 ${show ? 'bg-black bg-opacity-70 backdrop-blur-sm' : 'bg-transparent bg-opacity-0 pointer-events-none'}`}>
            <div 
                className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden transform transition-all duration-500 border-4 border-purple-500 ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'}`}
            >
                {/* Background Rays Effect */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 animate-spin-slow pointer-events-none">
                    <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-300 to-transparent rounded-full blur-3xl"></div>
                </div>

                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10">
                    <FaTimes size={20} />
                </button>

                <div className="mb-6 relative z-10">
                    <div className="inline-block p-6 rounded-full bg-purple-50 border-4 border-purple-200 shadow-inner mb-4 relative">
                        <FaGift className="text-6xl text-purple-500 animate-bounce block" />
                        <FaStar className="absolute -top-2 -right-2 text-yellow-400 text-2xl animate-ping" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Referral Reward!</h2>
                    <p className="text-gray-500 dark:text-gray-300 font-medium">Welcome to the community.</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 mb-6 flex items-center justify-center gap-2 border border-purple-100 dark:border-purple-800 relative z-10">
                    <span className="font-bold text-purple-700 dark:text-purple-300">Reward:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">+500 XP</span>
                </div>

                <button 
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all relative z-10"
                >
                    Claim Reward
                </button>
            </div>
        </div>
    );
};

export default ReferralPopup;

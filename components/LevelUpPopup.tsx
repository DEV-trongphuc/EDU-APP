import React, { useEffect, useState } from 'react';
import { FaTimes, FaTrophy, FaArrowUp } from 'react-icons/fa';

interface LevelUpPopupProps {
    level: number;
    onClose: () => void;
}

const LevelUpPopup: React.FC<LevelUpPopupProps> = ({ level, onClose }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-all duration-300 ${show ? 'bg-black bg-opacity-80 backdrop-blur-sm' : 'bg-transparent bg-opacity-0 pointer-events-none'}`}>
            <div 
                className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden transform transition-all duration-500 border-4 border-primary-500 ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'}`}
            >
                {/* Confetti / Ray Effect */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 animate-spin-slow pointer-events-none">
                    <div className="w-[600px] h-[600px] bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur-3xl"></div>
                </div>

                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10">
                    <FaTimes size={20} />
                </button>

                <div className="mb-6 relative z-10">
                    <div className="inline-block p-6 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg mb-4 relative">
                        <FaTrophy className="text-5xl text-white drop-shadow-md animate-bounce" />
                        <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-full border-2 border-white">
                            <FaArrowUp />
                        </div>
                    </div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 mb-2">Level Up!</h2>
                    <p className="text-gray-500 dark:text-gray-300 font-medium">You've reached a new milestone.</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-6 relative z-10 border border-gray-100 dark:border-gray-600">
                    <span className="block text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">Current Level</span>
                    <span className="block text-6xl font-black text-gray-800 dark:text-white">{level}</span>
                </div>

                <button 
                    onClick={handleClose}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all relative z-10"
                >
                    Continue Learning
                </button>
            </div>
        </div>
    );
};

export default LevelUpPopup;
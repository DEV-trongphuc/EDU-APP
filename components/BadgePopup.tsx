import React, { useEffect, useState } from 'react';
import { BadgeDef } from '../types';
import { FaTimes, FaStar } from 'react-icons/fa';

interface BadgePopupProps {
    badge: BadgeDef;
    onClose: () => void;
}

const BadgePopup: React.FC<BadgePopupProps> = ({ badge, onClose }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
        // Confetti logic or sound could go here
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    return (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${show ? 'bg-black bg-opacity-70 backdrop-blur-sm' : 'bg-transparent bg-opacity-0 pointer-events-none'}`}>
            <div 
                className={`bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden transform transition-all duration-500 ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'}`}
            >
                {/* Background Rays Effect */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 animate-spin-slow pointer-events-none">
                    <div className="w-[500px] h-[500px] bg-gradient-to-r from-yellow-300 to-transparent rounded-full blur-3xl"></div>
                </div>

                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
                    <FaTimes size={20} />
                </button>

                <div className="mb-6 relative z-10">
                    <div className="inline-block p-6 rounded-full bg-yellow-50 border-4 border-yellow-200 shadow-inner mb-4 relative">
                        <span className="text-6xl animate-bounce block">{badge.icon}</span>
                        <FaStar className="absolute -top-2 -right-2 text-yellow-400 text-2xl animate-ping" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Badge Unlocked!</h2>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2
                        ${badge.rarity === 'common' ? 'bg-gray-100 text-gray-600' : 
                          badge.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                          badge.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                          'bg-yellow-100 text-yellow-600'}`}>
                        {badge.rarity}
                    </div>
                </div>

                <div className="space-y-2 mb-8 relative z-10">
                    <h3 className="text-xl font-bold text-gray-800">{badge.name}</h3>
                    <p className="text-gray-500">{badge.description}</p>
                </div>

                <div className="bg-primary-50 rounded-xl p-4 mb-6 flex items-center justify-center gap-2 border border-primary-100 relative z-10">
                    <span className="font-bold text-primary-700">Reward:</span>
                    <span className="font-bold text-primary-600">+{badge.xpBonus} XP</span>
                </div>

                <button 
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all relative z-10"
                >
                    Awesome!
                </button>
            </div>
        </div>
    );
};

export default BadgePopup;

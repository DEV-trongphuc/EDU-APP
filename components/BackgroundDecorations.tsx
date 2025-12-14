
import React from 'react';
import { FaShapes, FaStar, FaCircle, FaSquare, FaPlay } from 'react-icons/fa';

const BackgroundDecorations: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top Left Circle */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-200 dark:bg-primary-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      {/* Bottom Right Blob */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Floating Stickers */}
      <div className="absolute top-[15%] left-[5%] text-yellow-400 opacity-10 transform rotate-12">
        <FaStar size={60} />
      </div>
      
      <div className="absolute top-[40%] right-[8%] text-blue-400 opacity-10 transform -rotate-12">
        <FaShapes size={80} />
      </div>

      <div className="absolute bottom-[20%] left-[10%] text-green-400 opacity-10 transform rotate-45">
        <FaSquare size={50} />
      </div>

      <div className="absolute bottom-[30%] right-[20%] text-red-400 opacity-10 transform -rotate-12">
        <FaPlay size={40} />
      </div>

      <div className="absolute top-[10%] right-[30%] text-indigo-300 opacity-10">
        <FaCircle size={30} />
      </div>
      
      {/* Squiggle Line (CSS) */}
      <svg className="absolute top-[60%] left-[2%] w-48 h-48 opacity-5 dark:opacity-10 text-gray-500" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FF0066" d="M47.7,-59.2C59.9,-48.9,66.9,-30.6,68.9,-11.8C70.9,7,67.9,26.2,58.3,42.3C48.7,58.4,32.5,71.3,14.6,73.6C-3.3,75.9,-23,67.6,-39.6,54.2C-56.2,40.8,-69.8,22.3,-72.1,1.9C-74.4,-18.5,-65.4,-40.8,-50.8,-51.5C-36.2,-62.2,-16,-61.3,1.3,-62.8C18.6,-64.4,35.5,-69.5,47.7,-59.2Z" transform="translate(100 100)" />
      </svg>
    </div>
  );
};

export default BackgroundDecorations;

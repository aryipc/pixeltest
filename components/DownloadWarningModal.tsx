
"use client";

import React from 'react';

interface DownloadWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadWarningModal: React.FC<DownloadWarningModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-xl p-6 max-w-sm w-full text-white text-center flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <h3 className="text-xl sm:text-2xl font-bold text-yellow-300" style={{ textShadow: '2px 2px 0px #e040fb' }}>
          Mobile Download Notice
        </h3>
        <div className="text-sm sm:text-base space-y-3 text-gray-200 leading-relaxed">
           <p>Please check the downloaded image size. The full, high-quality card should be over <strong className="text-cyan-300">400KB</strong>.</p>
           <p>If it's smaller, it's a preview. Please tap 'DOWNLOAD CARD' again for the full image.</p>
           <p className="text-xs text-gray-400 mt-2">This is due to a mobile system limitation. Thanks for your understanding!</p>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-2 px-4 py-3 bg-pink-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-pink-700 active:scale-95 text-sm sm:text-base"
          aria-label="Close download notice"
        >
          GOT IT!
        </button>
      </div>
    </div>
  );
};

export default DownloadWarningModal;

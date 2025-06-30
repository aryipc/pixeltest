"use client";

import React, { useState } from 'react';
import Loader from './Loader';

interface ImageDisplayProps {
  imageUrls: string[] | null;
  isLoading: boolean;
}

const Placeholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-sm">Your generated Pokémon cards will appear here.</p>
  </div>
);

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrls, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDownload = () => {
    if (!selectedImage) return;
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `pokemon-card-${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full p-4 bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-lg flex flex-col gap-4 h-full">
      <h2 className="text-xl text-center text-yellow-300">Output</h2>
      <div className="w-full aspect-[3/4] bg-[#131325] border-2 border-cyan-400 rounded-lg flex items-center justify-center overflow-hidden">
        {isLoading && <Loader />}
        {!isLoading && imageUrls && imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 p-2 w-full h-full">
            {imageUrls.map((url, index) => (
              <div key={index} className="w-full h-full cursor-pointer group" onClick={() => setSelectedImage(url)}>
                <img
                  src={url}
                  alt={`Generated card variation ${index + 1}`}
                  className="w-full h-full object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
        {!isLoading && (!imageUrls || imageUrls.length === 0) && <Placeholder />}
      </div>
       <div className="text-center text-xs text-gray-400 h-8 flex items-center justify-center">
        {imageUrls && !isLoading && <p>Click on a card to enlarge and download.</p>}
      </div>

      {selectedImage && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
        >
          <div className="relative bg-[#2c2c54] p-4 rounded-lg shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img 
                src={selectedImage} 
                alt="Selected Pokémon card" 
                className="w-full h-auto object-contain rounded-md" 
            />
            <div className="mt-4 flex justify-center gap-4">
               <button
                    onClick={handleDownload}
                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-green-700 active:scale-95 text-sm sm:text-base"
                >
                    DOWNLOAD
                </button>
                <button
                    onClick={() => setSelectedImage(null)}
                    className="px-6 py-2 bg-pink-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-pink-700 active:scale-95 text-sm sm:text-base"
                >
                    CLOSE
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
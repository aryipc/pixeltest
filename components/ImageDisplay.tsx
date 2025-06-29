import React from 'react';
import { Spinner } from './Spinner';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  sourceFileName: string | null;
}

const Placeholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 01-2.828 0L6 14m6-6l.01.01" />
        </svg>
        <p className="text-xl">Your generated pixel art will appear here.</p>
        <p className="text-md mt-2">Upload an image and click 'Generate Pixel Art'.</p>
    </div>
);

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading, error, sourceFileName }) => {
    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        const baseName = sourceFileName ? sourceFileName.substring(0, sourceFileName.lastIndexOf('.')) || sourceFileName : 'generated';
        link.download = `pixel-art-${baseName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

  return (
    <div className="w-full max-w-lg aspect-square bg-gray-800/50 border-4 border-dashed border-gray-700 rounded-xl flex items-center justify-center p-4 mt-8">
      {isLoading && (
        <div className="text-center">
            <Spinner />
            <p className="text-2xl text-cyan-400 mt-4">Creating your pixel art...</p>
        </div>
      )}
      {error && !isLoading && (
        <div className="text-center text-red-400 p-4">
            <h3 className="font-bold text-2xl mb-2">Error</h3>
            <p className="text-lg">{error}</p>
        </div>
      )}
      {!isLoading && !error && imageUrl && (
        <div className="relative w-full h-full">
            <img
              src={imageUrl}
              alt="Generated pixel art"
              className="w-full h-full object-contain image-render-pixelated"
            />
            <button
                onClick={handleDownload}
                className="absolute bottom-3 right-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400"
                aria-label="Download generated image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Download</span>
            </button>
        </div>
      )}
      {!isLoading && !error && !imageUrl && (
          <Placeholder />
      )}
    </div>
  );
};
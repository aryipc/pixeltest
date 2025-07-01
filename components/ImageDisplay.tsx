
"use client";

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import Loader from './Loader';
import PokemonCard from './PokemonCard';
import type { GenerationResult } from '@/services/geminiService';

interface ImageDisplayProps {
  generationResult: GenerationResult | null;
  isLoading: boolean;
}

const Placeholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-sm">Your generated Pokémon card will appear here.</p>
  </div>
);

const IosSaveModal = ({ dataUrl, onClose }: { dataUrl: string; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
        <div className="bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-xl p-6 text-center text-white w-full max-w-md">
            <h3 className="text-2xl font-bold text-yellow-300 mb-4">Save Your Card</h3>
            <p className="mb-4 text-gray-300">
                Tap the button below to open your card in a new tab. Then, tap and hold the image to save it to your Photos.
            </p>
            <a
                href={dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mb-6 px-4 py-3 bg-cyan-500 text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-cyan-600 active:scale-95 text-lg"
            >
                Open Image in New Tab
            </a>
            <p className="text-xs text-gray-400 mb-6">Alternatively, try tapping and holding the preview below to save.</p>
            <div className="mb-6">
                <img 
                    src={dataUrl} 
                    alt="Generated Pokémon Card" 
                    className="max-w-full h-auto rounded-lg shadow-lg border-2 border-cyan-400" 
                />
            </div>
            <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-pink-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-pink-700 active:scale-95 text-lg"
            >
                Close
            </button>
        </div>
    </div>
);


const ImageDisplay: React.FC<ImageDisplayProps> = ({ generationResult, isLoading }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [saveModalUrl, setSaveModalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!generationResult) {
      setIsArtworkLoaded(false);
    }
  }, [generationResult]);

  // Effect to clean up blob URLs when they are no longer needed.
  useEffect(() => {
    const urlToRevoke = saveModalUrl;
    return () => {
      if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [saveModalUrl]);

  const handleDownload = useCallback(async () => {
    const node = cardRef.current;
    if (node === null || !isArtworkLoaded || !generationResult) {
      console.warn("Download cancelled: Card element not ready or data missing.");
      return;
    }

    setIsCapturing(true);

    try {
      // Wait for React to re-render with isCapturing=true to disable animations
      await new Promise(resolve => setTimeout(resolve, 50));

      // Ensure all custom fonts are loaded and ready before capturing
      await document.fonts.ready;

      const dataUrl = await toPng(node, { 
        pixelRatio: 2, // Good balance of quality and file size
        cacheBust: true, // Helps with fresh rendering of content
      });
      
      const name = generationResult.cardData.pokemon_name || 'pokemon-card';
      const fileName = `${name.toLowerCase().replace(/\s/g, '-')}.png`;

      // Convert dataURL to Blob/File for Web Share API and fallbacks
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: blob.type });

      // Method 1: Use Web Share API if available (best experience on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Pokémon Card',
          text: `Check out my custom Pokémon card: ${name}!`,
        });
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Method 2: Fallback to a modal for iOS, using a more reliable Blob URL
        if (isIOS) {
          const blobUrl = URL.createObjectURL(blob);
          setSaveModalUrl(blobUrl);
        } else {
          // Method 3: Standard desktop download using a Blob URL
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = fileName;
          link.href = blobUrl;
          document.body.appendChild(link); // Required for Firefox
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl); // Clean up immediately
        }
      }
    } catch (err: any) {
        // Don't show error if user cancels the share dialog
        if (err.name !== 'AbortError') {
            console.error('Failed to capture or share card image:', err);
            alert('Sorry, failed to download image. This can happen if the font or artwork fails to load. Please try again.');
        }
    } finally {
      setIsCapturing(false);
    }
  }, [generationResult, isArtworkLoaded]);
  
  const handleCloseModal = () => {
    setSaveModalUrl(null); // This will also trigger the useEffect cleanup to revoke the URL
  };

  return (
    <>
      <div className="w-full p-4 bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-lg flex flex-col gap-4 h-full">
        <h2 className="text-xl text-center text-yellow-300">Output</h2>
        <div className="w-full min-h-[60vh] md:min-h-0 bg-[#131325] border-2 border-cyan-400 rounded-lg flex items-center justify-center overflow-auto p-2">
          {isLoading && <Loader />}
          {!isLoading && generationResult && (
            <div className="w-full max-w-sm mx-auto flex justify-center">
               <PokemonCard 
                  ref={cardRef} 
                  {...generationResult} 
                  onArtworkLoad={() => setIsArtworkLoaded(true)}
                  isCapturing={isCapturing}
               />
            </div>
          )}
          {!isLoading && !generationResult && <Placeholder />}
        </div>
         <div className="text-center h-10 flex items-center justify-center mt-auto pt-4">
          {generationResult && !isLoading && (
              <button
                  onClick={handleDownload}
                  disabled={!isArtworkLoaded || isCapturing}
                  className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out enabled:hover:bg-green-700 enabled:active:scale-95 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
              >
                  {isCapturing ? 'PREPARING IMAGE...' : (isArtworkLoaded ? 'DOWNLOAD CARD' : 'LOADING ARTWORK...')}
              </button>
          )}
        </div>
      </div>
      {saveModalUrl && (
        <IosSaveModal
            dataUrl={saveModalUrl}
            onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ImageDisplay;

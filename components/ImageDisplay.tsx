
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

const ImageDisplay: React.FC<ImageDisplayProps> = ({ generationResult, isLoading }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!generationResult) {
      setIsArtworkLoaded(false);
    }
  }, [generationResult]);

  const handleDownload = useCallback(async () => {
    const node = cardRef.current;
    if (node === null || !isArtworkLoaded) {
      console.warn("Download cancelled: Card element not ready or artwork not loaded.");
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

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

      if (isIOS) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <body style="margin: 0; background: #1a1a2e; color: white; font-family: sans-serif; text-align: center; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
              <div style="padding: 1rem;">
                <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Save Your Card</h1>
                <p style="margin-bottom: 2rem;">Tap and hold the image, then select "Save to Photos" or "Add to Photos".</p>
                <img src="${dataUrl}" alt="Generated Pokémon Card" style="max-width: 90vw; max-height: 70vh; border-radius: 10px; box-shadow: 0 0 20px rgba(255,255,255,0.3);" />
              </div>
            </body>
          `);
          newWindow.document.title = "Save Pokémon Card";
        } else {
          alert("Your browser blocked the new window. Please allow pop-ups for this site to save your card.");
        }
      } else {
        const link = document.createElement('a');
        const name = generationResult?.cardData?.pokemon_name || 'pokemon-card';
        link.download = `${name.toLowerCase().replace(/\s/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err: any) {
      console.error('Failed to capture card image:', err);
      alert('Sorry, failed to download image. This can happen if the font or artwork fails to load. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [generationResult, isArtworkLoaded]);

  return (
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
  );
};

export default ImageDisplay;

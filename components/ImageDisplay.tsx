
"use client";

import React, { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import Loader from './Loader';
import PokemonCard from './PokemonCard';
import type { GenerationResult } from '../services/geminiService';

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

  const handleDownload = useCallback(() => {
    const node = cardRef.current;
    if (node === null) {
      return;
    }

    toPng(node, {
        cacheBust: true,
        // Set width, height, and pixelRatio for better rendering quality,
        // especially with custom fonts.
        width: node.offsetWidth,
        height: node.offsetHeight,
        pixelRatio: 2,
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        const name = generationResult?.cardData?.pokemon_name || 'pokemon-card';
        link.download = `${name.toLowerCase().replace(/\s/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to download card image', err);
      });
  }, [generationResult]);

  return (
    <div className="w-full p-4 bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-lg flex flex-col gap-4 h-full">
      <h2 className="text-xl text-center text-yellow-300">Output</h2>
      <div className="w-full min-h-[60vh] md:min-h-0 bg-[#131325] border-2 border-cyan-400 rounded-lg flex items-center justify-center overflow-auto p-2">
        {isLoading && <Loader />}
        {!isLoading && generationResult && (
          <div className="w-full max-w-sm mx-auto flex justify-center">
             <PokemonCard ref={cardRef} {...generationResult} />
          </div>
        )}
        {!isLoading && !generationResult && <Placeholder />}
      </div>
       <div className="text-center h-10 flex items-center justify-center mt-auto pt-4">
        {generationResult && !isLoading && (
            <button
                onClick={handleDownload}
                className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out enabled:hover:bg-green-700 enabled:active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
                DOWNLOAD CARD
            </button>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;

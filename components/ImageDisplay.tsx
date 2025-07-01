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

interface PreviewModalData {
    dataUrl: string;
    file: File;
    name: string;
    fileName: string;
}

const PreviewAndSaveModal = ({ modalData, onClose }: { modalData: PreviewModalData; onClose: () => void; }) => {
    const { dataUrl, file, name, fileName } = modalData;
    const [isShareApiSupported, setIsShareApiSupported] = useState(false);

    // This effect runs on the client after the component mounts,
    // so `navigator` object is guaranteed to be available.
    useEffect(() => {
        if (navigator.share) {
            setIsShareApiSupported(true);
        }
    }, []);


    const handleShare = async () => {
        try {
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "My Pokémon Card",
                    text: `Check out my custom Pokémon card: ${name}!`,
                });
            } else {
                alert("Web Share API is not supported on your browser.");
            }
        } catch (error) {
            // Silently ignore abort errors from the user cancelling the share sheet.
            if ((error as Error).name !== 'AbortError') {
                console.error("Error sharing file:", error);
                alert("An error occurred while trying to share the card.");
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-[#2c2c54] border-2 border-purple-500 rounded-lg shadow-xl p-6 text-center text-white w-full max-w-md">
                <h3 className="text-2xl font-bold text-yellow-300 mb-2">Your Card is Ready!</h3>
                <p className="mb-4 text-gray-300 text-xs">
                    If the image below looks incomplete, close this and tap "Download" again. Browser rendering can sometimes take an extra moment.
                </p>
                <div className="mb-6">
                    <img 
                        src={dataUrl} 
                        alt="Generated Pokémon Card Preview" 
                        className="max-w-full h-auto rounded-lg shadow-lg border-2 border-cyan-400" 
                    />
                </div>
                <div className="flex flex-col gap-3">
                    {isShareApiSupported && (
                         <button
                            onClick={handleShare}
                            className="w-full px-4 py-3 bg-cyan-500 text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-cyan-600 active:scale-95 text-lg"
                        >
                            Share
                        </button>
                    )}
                    <a
                        href={dataUrl}
                        download={fileName}
                        className="block w-full px-4 py-3 bg-green-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-green-700 active:scale-95 text-lg"
                    >
                        Download Image
                    </a>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-pink-600 text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-pink-700 active:scale-95 text-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const ImageDisplay: React.FC<ImageDisplayProps> = ({ generationResult, isLoading }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewModalData, setPreviewModalData] = useState<PreviewModalData | null>(null);

  // When a new card is generated, reset the artwork loaded state.
  useEffect(() => {
    setIsArtworkLoaded(false);
  }, [generationResult]);

  // This callback is passed to PokemonCard and triggered by the artwork's `onLoad` event.
  const handleArtworkLoad = useCallback(() => {
    setIsArtworkLoaded(true);
  }, []);

  const handleDownload = useCallback(async () => {
    const node = cardRef.current;
    if (node === null || !isArtworkLoaded || !generationResult) {
      console.warn("Download cancelled: Card element not ready or data missing.");
      return;
    }

    setIsCapturing(true);

    try {
      // Small delay to ensure styles are applied and fonts are ready.
      await new Promise(resolve => setTimeout(resolve, 100));
      await document.fonts.ready;

      const dataUrl = await toPng(node, { 
        pixelRatio: 2,
        cacheBust: true,
      });
      
      const name = generationResult.cardData.pokemon_name || 'pokemon-card';
      const fileName = `${name.toLowerCase().replace(/\s/g, '-')}.png`;
      
      const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      if (isDesktop) {
          // DESKTOP: Direct download.
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          // MOBILE: Show a preview modal to confirm image is complete before saving/sharing.
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], fileName, { type: "image/png" });
          setPreviewModalData({ dataUrl, file, name, fileName });
      }
    } catch (err: any) {
        console.error('Failed to capture or share card image:', err);
        alert('Sorry, failed to download image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [generationResult, isArtworkLoaded]);
  
  const handleCloseModal = () => {
    setPreviewModalData(null);
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
                  isCapturing={isCapturing}
                  onArtworkLoad={handleArtworkLoad}
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
      {previewModalData && (
        <PreviewAndSaveModal
            modalData={previewModalData}
            onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ImageDisplay;
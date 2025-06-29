import React, { useRef, useState, useCallback } from 'react';

interface ImageUploaderProps {
  sourceImage: string | null;
  onImageSelect: (file: File) => void;
  onClearImage: () => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ sourceImage, onImageSelect, onClearImage, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
    // Reset the input value to allow re-uploading the same file
    if(event.target) event.target.value = '';
  };

  const handleAreaClick = () => {
    if (!isLoading && !sourceImage) {
        fileInputRef.current?.click();
    }
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    dragCounter.current++;
    // Only show visual feedback for files
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  }, [isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingOver(false);
    }
  }, [isLoading]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    
    setIsDraggingOver(false);
    dragCounter.current = 0;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
      if (e.dataTransfer.items) {
        e.dataTransfer.items.clear();
      } else {
        e.dataTransfer.clearData();
      }
    }
  }, [isLoading, onImageSelect]);


  const dropZoneClasses = `relative w-full aspect-video bg-gray-800/50 border-2 border-dashed rounded-lg flex items-center justify-center text-center transition-colors duration-300 ${!sourceImage && !isLoading ? 'cursor-pointer' : ''} ${isDraggingOver ? 'border-fuchsia-500 bg-gray-700/60' : 'border-gray-700 hover:border-cyan-400'}`;

  return (
    <div className="w-full p-4">
      <label className="text-lg font-bold text-cyan-400 mb-2 block">Source Image</label>
      <div 
        className={dropZoneClasses}
        onClick={handleAreaClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            disabled={isLoading}
        />
        {sourceImage ? (
          <>
            <img src={sourceImage} alt="Source preview" className="w-full h-full object-contain rounded-lg p-1" />
            <button
              onClick={(e) => { e.stopPropagation(); onClearImage(); }}
              disabled={isLoading}
              className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
              aria-label="Clear image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {isDraggingOver && (
                 <div className="absolute inset-0 bg-gray-900/70 rounded-lg flex items-center justify-center border-2 border-fuchsia-500">
                    <div className="text-center pointer-events-none">
                        <svg className="h-16 w-16 text-fuchsia-400 mb-2 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3v11.25" />
                        </svg>
                        <p className="font-bold text-xl text-fuchsia-300">Drop to replace image</p>
                    </div>
                 </div>
            )}
          </>
        ) : (
          <div className="p-4 flex flex-col items-center justify-center text-center pointer-events-none">
             {isDraggingOver ? (
                <>
                    <svg className="h-16 w-16 text-fuchsia-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3v11.25" />
                    </svg>
                    <p className="font-bold text-xl text-fuchsia-300">Drop image here</p>
                </>
             ) : (
                <>
                    <svg className="h-16 w-16 text-cyan-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="font-bold text-xl text-white">Click to upload</p>
                    <p className="text-gray-400 text-sm mt-1">or drag & drop an image</p>
                </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

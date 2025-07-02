"use client";

import React, { useCallback, useState, useEffect } from 'react';

interface PromptInputProps {
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
  inputImage: File | null;
  setInputImage: (file: File | null) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading, error, inputImage, setInputImage }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (inputImage) {
      const objectUrl = URL.createObjectURL(inputImage);
      setPreviewUrl(objectUrl);
      
      // Free memory when the component is unmounted or image changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [inputImage]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setInputImage(e.target.files[0]);
    }
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isLoading && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setInputImage(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, [setInputImage, isLoading]);

  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full p-4 bg-card-bg border-2 border-border-color rounded-lg shadow-lg flex flex-col gap-4">
      <h2 className="text-xl text-center text-solana-purple">Input</h2>
      
      <label 
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="w-full aspect-[3/4] bg-dark-bg border-2 border-dashed border-solana-green/50 rounded-md flex items-center justify-center text-center p-2 cursor-pointer hover:bg-black/20 transition-colors"
      >
        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onFileChange} disabled={isLoading} />
        {previewUrl ? (
          <img src={previewUrl} alt="Input preview" className="max-w-full max-h-full object-contain rounded-sm" />
        ) : (
          <div className="text-light-gray flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs sm:text-sm">Drop an image here or click to upload</p>
          </div>
        )}
      </label>

      <button
        onClick={onGenerate}
        disabled={isLoading || !inputImage}
        className="w-full mt-auto px-4 py-3 bg-solana-green text-black font-bold rounded-md transition-all duration-200 ease-in-out enabled:hover:bg-solana-green/80 enabled:active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
      >
        {isLoading ? 'COOKING...' : 'APE IN'}
      </button>
      {error && (
        <p className="mt-2 text-center text-degen-red text-xs sm:text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PromptInput;
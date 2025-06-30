"use client";

import React, { useState, useCallback } from 'react';
import { generatePokemonCard } from '../services/geminiService';
import Header from '../components/Header';
import PromptInput from '../components/PromptInput';
import ImageDisplay from '../components/ImageDisplay';

export default function Home() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!inputImage || isLoading) {
        setError("Please upload an image first.");
        return;
    };

    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);

    try {
      const imageUrls = await generatePokemonCard(inputImage);
      setGeneratedImages(imageUrls);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`Failed to generate image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputImage, isLoading]);

  return (
    <div className="bg-[#1a1a2e] min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <Header />
        <main className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <PromptInput
            onGenerate={handleGenerate}
            isLoading={isLoading}
            error={error}
            inputImage={inputImage}
            setInputImage={setInputImage}
          />
          <ImageDisplay
            imageUrls={generatedImages}
            isLoading={isLoading}
          />
        </main>
        <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Powered by Google Gemini & Imagen</p>
          <p>Pokémon Card Generator &copy; 2024</p>
        </footer>
      </div>
    </div>
  );
}

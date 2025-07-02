"use client";

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { generateTrenchmonCard, GenerationResult } from '@/services/geminiService';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ImageDisplay from '@/components/ImageDisplay';

export default function Home() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!inputImage || isLoading) {
        setError("Please upload an image first.");
        return;
    };

    setIsLoading(true);
    setError(null);
    setGenerationResult(null);

    try {
      const result = await generateTrenchmonCard(inputImage);
      setGenerationResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`Failed to mint card. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputImage, isLoading]);

  return (
    <div className="bg-dark-bg min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
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
            generationResult={generationResult}
            isLoading={isLoading}
          />
        </main>
        <footer className="mt-12 text-center text-xs text-light-gray">
          <div className="flex justify-center items-center gap-4 mb-2">
            <Link href="/guide" className="hover:text-solana-green transition-colors">Card Guide</Link>
            <span className="opacity-50">|</span>
            <Link href="/privacy" className="hover:text-solana-green transition-colors">Privacy Policy</Link>
            <span className="opacity-50">|</span>
            <Link href="/about" className="hover:text-solana-green transition-colors">About</Link>
          </div>
          <p>Powered by TCG TEAM &copy; 2025</p>
        </footer>
      </div>
    </div>
  );
}
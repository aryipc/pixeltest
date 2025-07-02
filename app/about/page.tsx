import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="bg-dark-bg min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col">
        <header className="text-center w-full mb-8">
          <Link href="/">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-solana-green" style={{ textShadow: '3px 3px 0px #B069FF' }}>
              Trenchmon Card Generator
            </h1>
          </Link>
        </header>
        <main className="w-full bg-card-bg border-2 border-border-color rounded-lg shadow-lg p-6 md:p-8 text-light-gray">
          <h2 className="text-2xl sm:text-3xl font-bold text-solana-green mb-6 text-center">About This Project</h2>
          <div className="space-y-4 text-sm md:text-base leading-relaxed">
            <h3 className="text-xl font-bold text-solana-purple">What is This?</h3>
            <p>Trenchmon Card Generator is a web application that transforms any image into a unique, collectible "Trenchmon" trading card. It's inspired by the fast-paced, degen culture of Solana memecoins and the classic monster-collecting games we love.</p>

            <h3 className="text-xl font-bold text-solana-purple pt-4">How It Works</h3>
            <p>We use powerful AI from Google to bring your cards to life:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li><strong>Google Gemini:</strong> Analyzes your image to creatively generate all the card's stats, attacks, and lore, infusing it with authentic crypto slang.</li>
              <li><strong>Google Imagen:</strong> Generates the unique, gritty artwork for your Trenchmon, based on Gemini's description of the subject.</li>
            </ul>
            
            <h3 className="text-xl font-bold text-solana-purple pt-4">The Mission</h3>
            <p>This project is for fun. It's a tribute to the creators, the risk-takers, and the diamond-handed HODLers of the crypto world. APE IN, have a laugh, and mint a legendary card for your collection.</p>
            <p>This is a portfolio project and is not affiliated with any official trading card game or the Solana Foundation.</p>
          </div>
          <div className="text-center mt-8">
            <Link href="/" className="w-full sm:w-auto inline-block px-6 py-3 bg-solana-purple text-white font-bold rounded-md transition-all duration-200 ease-in-out hover:bg-solana-purple/80 active:scale-95">
                Back to Generator
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AboutPage;

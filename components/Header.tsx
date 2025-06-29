import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full text-center p-6">
      <h1 className="text-4xl md:text-5xl font-press-start text-cyan-400 drop-shadow-[0_2px_2px_rgba(244,63,94,0.8)]">
        Pixel Art AI
      </h1>
      <p className="text-xl text-fuchsia-400 mt-4">
        Transform your images into pixel art
      </p>
    </header>
  );
};
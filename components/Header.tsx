import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center w-full">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-solana-green" style={{ textShadow: '3px 3px 0px #B069FF' }}>
        Trenchmon Card Generator
      </h1>
      <p className="text-solana-purple mt-2 text-xs sm:text-sm">
        APE any image into a Trenchmon Card.
      </p>
    </header>
  );
};

export default Header;

import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-solana-green">
        <svg width="80" height="80" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" stroke="#14F195" className="k-line-loader">
          <g fill="none" fillRule="evenodd" strokeWidth="2">
            <path d="M2,20 L10,20 L14,10 L20,30 L26,5 L32,20 L38,20" />
          </g>
        </svg>
        <p className="mt-4 text-sm tracking-widest">COOKING...</p>
    </div>
  );
};

export default Loader;

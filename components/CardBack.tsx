"use client";

import React from 'react';

const CardBack: React.FC = () => {
    return (
        <div className="w-full h-full p-[5px] bg-card-bg font-sans flex flex-col justify-center items-center border-[6px] border-solana-purple rounded-[20px] text-white overflow-hidden">
            <div className="w-full h-full border-2 border-solana-purple/50 rounded-[12px] flex flex-col justify-center items-center bg-dark-bg grid-background">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_5px_15px_rgba(20,241,149,0.4)]">
                    <path d="M4.26284 6.64371L12 2.25L19.7372 6.64371V15.4312L12 19.8249L4.26284 15.4312V6.64371Z" stroke="#14F195" strokeWidth="1.5"/>
                    <path d="M12 19.8249V11.0374L19.7372 6.64371" stroke="#B069FF" strokeWidth="1.5"/>
                    <path d="M12 11.0374L4.26284 6.64371" stroke="#B069FF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>

                <h1 className="title-font text-3xl mt-4 text-solana-green" style={{ textShadow: '2px 2px 0px #B069FF' }}>
                    Trenchmon
                </h1>
            </div>
        </div>
    );
};

export default CardBack;
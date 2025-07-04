"use client";

import React, { forwardRef, useRef, useEffect } from 'react';
import type { GenerationResult } from '@/services/geminiService';

const typeStyles: { [key: string]: { bg: string; symbol: string; text: string; } } = {
  Ape: { bg: 'bg-orange-600', symbol: '🦍', text: 'text-white' },
  Shill: { bg: 'bg-sky-400', symbol: '📢', text: 'text-black' },
  Rug: { bg: 'bg-red-700', symbol: '📉', text: 'text-white' },
  Whale: { bg: 'bg-blue-800', symbol: '🐳', text: 'text-white' },
  'Diamond-Hand': { bg: 'bg-cyan-300', symbol: '💎', text: 'text-black' },
  Based: { bg: 'bg-green-500', symbol: '✅', text: 'text-white' },
  Cringe: { bg: 'bg-yellow-800', symbol: '🤢', text: 'text-white' },
  default: { bg: 'bg-gray-500', symbol: '❓', text: 'text-white' },
};

const rarityStyles: { [key: string]: { border: string; text: string; shadow: string } } = {
    Common: { border: 'border-rarity-common', text: 'text-rarity-common', shadow: 'shadow-none' },
    Uncommon: { border: 'border-rarity-uncommon', text: 'text-rarity-uncommon', shadow: 'shadow-lg shadow-rarity-uncommon/20' },
    Rare: { border: 'border-rarity-rare', text: 'text-rarity-rare', shadow: 'shadow-lg shadow-rarity-rare/30' },
    Epic: { border: 'border-rarity-epic', text: 'text-rarity-epic', shadow: 'shadow-lg shadow-rarity-epic/40' },
    Legendary: { border: 'border-rarity-legendary legend-border', text: 'text-rarity-legendary', shadow: 'shadow-xl shadow-rarity-legendary/50' },
    default: { border: 'border-gray-500', text: 'text-gray-500', shadow: 'shadow-none' },
};

interface TrenchmonCardProps extends GenerationResult {
    isCapturing?: boolean;
    onArtworkLoad: () => void;
}

const PokemonCard = forwardRef<HTMLDivElement, TrenchmonCardProps>(({ cardData, artworkUrl, isCapturing, onArtworkLoad }, ref) => {
    const {
        trenchmon_name,
        mc,
        trenchmon_type,
        attack_1_name,
        attack_1_description,
        attack_1_damage,
        trench_log,
        dev,
        risk_level,
        rarity
    } = cardData;

    const typeStyle = typeStyles[trenchmon_type] || typeStyles.default;
    const rarityStyle = rarityStyles[rarity] || rarityStyles.default;
    const imageRef = useRef<HTMLImageElement>(null);

    const riskColorClass = {
        'SAFU': 'text-solana-green',
        'Low': 'text-green-400',
        'Medium': 'text-yellow-400',
        'High': 'text-orange-500',
        'DEGEN': 'text-degen-red',
    }[risk_level] || 'text-white';


    // This combined approach ensures the image load is detected on all platforms.
    // 1. The `onLoad` prop handles the standard async loading case (works for mobile).
    // 2. The `useEffect` handles the case where the image is already cached and 'complete'
    //    by the time the component mounts, which could cause `onLoad` to be missed on desktop.
    useEffect(() => {
        if (imageRef.current?.complete) {
            onArtworkLoad();
        }
    }, [artworkUrl, onArtworkLoad]);
    
    const artworkContainerClass = `mx-2.5 mt-1 border-[3px] ${rarityStyle.border} rounded-lg overflow-hidden h-[38%] grid-background flex-shrink-0`;

    // Simplify the 'dev' and 'mc' text for display
    const displayDev = dev.replace(' Dev', '');
    const displayMc = mc.replace(' MC', '');

    return (
        <div ref={ref} className={`w-full h-full p-[5px] bg-card-bg font-sans flex flex-col border-[6px] rounded-[20px] text-white overflow-hidden ${rarityStyle.border} ${rarityStyle.shadow}`}>
            
            {/* Header */}
            <div className="flex justify-between items-baseline px-2 pt-1 flex-shrink-0">
                <h2 className={`title-font font-bold ${rarityStyle.text} text-[15px] leading-tight`}>{trenchmon_name}</h2>
                <div className="flex items-center">
                    <span className="font-bold mr-2 title-font text-degen-red text-[11px]">HP {attack_1_damage}</span>
                    <div className={`w-7 h-7 rounded-full ${typeStyle.bg} flex items-center justify-center text-sm`}>
                        {typeStyle.symbol}
                    </div>
                </div>
            </div>

            {/* Artwork */}
            <div className={artworkContainerClass}>
                {artworkUrl && (
                    <img
                        ref={imageRef}
                        src={artworkUrl}
                        alt={`Artwork for ${trenchmon_name}`}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        onLoad={onArtworkLoad}
                    />
                )}
            </div>

             {/* Info Bar */}
            <div className="flex justify-between items-center text-center px-2 mt-1 text-[10px] title-font flex-shrink-0">
                <div className="flex-1">
                    <p className="text-[8px] opacity-70">DEV</p>
                    <p className="font-bold">{displayDev}</p>
                </div>
                <div className="flex-1">
                    <p className="text-[8px] opacity-70">MC</p>
                    <p className="font-bold">{displayMc}</p>
                </div>
                 <div className="flex-1">
                    <p className="text-[8px] opacity-70">RISK</p>
                    <p className={`font-bold ${riskColorClass}`}>{risk_level}</p>
                </div>
                <div className="flex-1">
                    <p className="text-[8px] opacity-70">RARITY</p>
                    <p className={`font-bold ${rarityStyle.text}`}>{rarity}</p>
                </div>
            </div>

            {/* Attacks Section & Log */}
            <div className="mx-2.5 mt-1 flex-shrink-0">
                <div className="p-1.5 border-[3px] bg-dark-bg/50 border-border-color rounded-lg flex flex-col gap-1">
                    <div className="attack">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full ${typeStyle.bg} flex items-center justify-center text-xs`}>{typeStyle.symbol}</div>
                                <h3 className="font-bold title-font text-xs">{attack_1_name}</h3>
                            </div>
                            <span className="font-bold title-font text-base">{attack_1_damage}</span>
                        </div>
                        <p className="leading-tight mt-1 text-[11px]">
                            {attack_1_description}
                        </p>
                    </div>

                    {/* Trench Log */}
                    <div className="mt-1 pt-1 border-t-2 border-dotted border-border-color">
                        <p className="italic leading-tight text-light-gray text-[10px]">
                           <span className="font-bold not-italic text-white">Trench Log: </span>{trench_log}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Spacer to push footer to the bottom */}
            <div className="flex-grow"></div>

            {/* Footer */}
            <div className="text-center mt-1 flex-shrink-0">
                <p className="title-font opacity-50 text-[7px]">Trenchmon Card Generator</p>
            </div>
        </div>
    );
});

PokemonCard.displayName = 'TrenchmonCard';
export default PokemonCard;
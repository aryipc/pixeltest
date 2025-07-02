
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

    useEffect(() => {
        const imgElement = imageRef.current;
        if (imgElement?.complete && artworkUrl) {
            onArtworkLoad();
        }
    }, [artworkUrl, onArtworkLoad]);
    
    const artworkContainerClass = `mx-[10px] mt-1 border-[3px] ${rarityStyle.border} rounded-lg overflow-hidden h-[210px] grid-background`;

    return (
        <div ref={ref} className={`w-[375px] h-[525px] p-[5px] bg-card-bg font-sans flex flex-col justify-between border-[6px] rounded-[20px] text-white overflow-hidden transition-shadow duration-300 ${rarityStyle.border} ${rarityStyle.shadow}`}>
            {/* Top Section */}
            <div>
                {/* Header */}
                <div className="flex justify-between items-baseline px-2 pt-1">
                    <h2 className="title-font font-bold" style={{fontSize: '20px'}}>{trenchmon_name}</h2>
                    <div className="flex items-center">
                        <span className="font-bold mr-2 title-font" style={{fontSize: '15px'}}>{mc}</span>
                        <div className={`w-7 h-7 rounded-full ${typeStyle.bg} flex items-center justify-center text-lg`}>
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
                            onLoad={onArtworkLoad}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                 {/* Info Bar */}
                <div className="flex justify-between items-center text-center px-2 mt-1 text-xs title-font">
                    <div className="flex-1">
                        <p className="text-[10px] opacity-70">DEV</p>
                        <p className="font-bold">{dev}</p>
                    </div>
                     <div className="flex-1">
                        <p className="text-[10px] opacity-70">RISK</p>
                        <p className="font-bold">{risk_level}</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] opacity-70">RARITY</p>
                        <p className={`font-bold ${rarityStyle.text}`}>{rarity}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col justify-end flex-grow">
                {/* Attacks Section */}
                <div className="mx-[10px] mt-1 p-2 border-[3px] bg-dark-bg/50 border-border-color rounded-lg flex flex-col gap-1">
                    <div className="attack">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${typeStyle.bg} flex items-center justify-center text-sm`}>{typeStyle.symbol}</div>
                                <h3 className="font-bold title-font" style={{fontSize: '18px'}}>{attack_1_name}</h3>
                            </div>
                            <span className="font-bold title-font" style={{fontSize: '22px'}}>{attack_1_damage}</span>
                        </div>
                        <p className="leading-tight mt-1" style={{fontSize: '13px'}}>
                            {attack_1_description}
                        </p>
                    </div>

                    {/* Trench Log */}
                    <div className="mt-2 pt-2 border-t-2 border-dotted border-border-color">
                        <p className="italic leading-tight text-light-gray" style={{fontSize: '12px'}}>
                           <span className="font-bold not-italic text-white">Trench Log: </span>{trench_log}
                        </p>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="text-center py-1 mt-1">
                    <p className="title-font opacity-50" style={{fontSize: '9px'}}>&copy;2024 Trenchmon Card Generator</p>
                </div>
            </div>
        </div>
    );
});

PokemonCard.displayName = 'TrenchmonCard';
export default PokemonCard;

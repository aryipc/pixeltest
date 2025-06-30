
"use client";

import React, { forwardRef } from 'react';
import type { GenerationResult } from '../services/geminiService';

const typeStyles: { [key: string]: { bg: string; symbol: string; text: string; } } = {
  Grass: { bg: 'bg-[#78c850]', symbol: '🌿', text: 'text-white' },
  Fire: { bg: 'bg-[#f08030]', symbol: '🔥', text: 'text-white' },
  Water: { bg: 'bg-[#6890f0]', symbol: '💧', text: 'text-white' },
  Lightning: { bg: 'bg-[#f8d030]', symbol: '⚡', text: 'text-black' },
  Psychic: { bg: 'bg-[#f85888]', symbol: '👁️', text: 'text-white' },
  Fighting: { bg: 'bg-[#c03028]', symbol: '💥', text: 'text-white' },
  Colorless: { bg: 'bg-[#a8a878]', symbol: '⭐', text: 'text-white' },
  Darkness: { bg: 'bg-[#705848]', symbol: '🌙', text: 'text-white' },
  Metal: { bg: 'bg-[#b8b8d0]', symbol: '🔩', text: 'text-black' },
  Dragon: { bg: 'bg-[#7038f8]', symbol: '🐉', text: 'text-white' },
  Fairy: { bg: 'bg-[#ee99ac]', symbol: '✨', text: 'text-white' },
  default: { bg: 'bg-gray-400', symbol: '❓', text: 'text-black' },
};

const PokemonCard = forwardRef<HTMLDivElement, GenerationResult>(({ cardData, artworkUrl }, ref) => {
    const {
        pokemon_name,
        hp,
        pokemon_type,
        attack_1_name,
        attack_1_description,
        attack_1_damage,
        pokedex_entry
    } = cardData;

    const style = typeStyles[pokemon_type] || typeStyles.default;

    return (
        <div ref={ref} className="w-full h-full p-2.5 bg-pokemon-yellow font-sans flex flex-col border-8 border-pokemon-blue rounded-2xl text-black">
            {/* Header */}
            <div className="flex justify-between items-center px-2 pt-1">
                <h2 className="text-xl font-extrabold" style={{fontFamily: "'Press Start 2P', cursive"}}>{pokemon_name}</h2>
                <div className="flex items-center">
                    <span className="text-lg font-bold mr-1">{hp} HP</span>
                    <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center text-lg`}>
                        {style.symbol}
                    </div>
                </div>
            </div>

            {/* Artwork */}
            <div className="mx-2 mt-2 border-4 border-card-b-gold flex-grow holo-background rounded-md">
                <img src={artworkUrl} alt={`Artwork for ${pokemon_name}`} className="w-full h-full object-cover" />
            </div>

             {/* Type Banner */}
            <p className="text-xs italic text-right mr-3 mt-1">Illus. Google/Imagen 3</p>

            {/* Attacks Section */}
            <div className="mx-2 mt-2 p-2 border-4 border-card-b-gold rounded-md bg-[#fdf2d4] flex-1 flex flex-col justify-around">
                <div className="attack">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full ${style.bg} flex items-center justify-center text-sm mr-2`}>{style.symbol}</div>
                            <h3 className="font-bold text-lg">{attack_1_name}</h3>
                        </div>
                        <span className="font-bold text-xl">{attack_1_damage}</span>
                    </div>
                    <p className="text-sm leading-tight">
                        {attack_1_description}
                    </p>
                </div>

                {/* Pokédex Entry */}
                <div className="mt-2 pt-2 border-t-2 border-dotted border-card-b-gold">
                    <p className="text-xs italic leading-tight">
                       {pokedex_entry}
                    </p>
                </div>
            </div>
            
             {/* Footer */}
            <div className="text-center mt-2">
                <p className="text-[10px] font-mono">&copy;2024 Pokémon Card Generator</p>
            </div>
        </div>
    );
});

PokemonCard.displayName = 'PokemonCard';
export default PokemonCard;

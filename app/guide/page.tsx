import React from 'react';
import Link from 'next/link';

const typeInfo = [
  { name: 'Ape', symbol: '🦍', color: 'bg-orange-600 text-white', description: 'All in, no questions asked. Buys the top and rides it to the trenches with unwavering conviction.', likelihood: 'Common' },
  { name: 'Shill', symbol: '📢', color: 'bg-sky-400 text-black', description: 'A master of hype. Can be found tirelessly promoting their bags across all social media platforms.', likelihood: 'Common' },
  { name: 'Rug', symbol: '📉', color: 'bg-red-700 text-white', description: 'This Trenchmon promises the moon but delivers only a swift and painful exit liquidity event.', likelihood: 'Uncommon' },
  { name: 'Whale', symbol: '🐳', color: 'bg-blue-800 text-white', description: 'A massive holder whose every move can sway the market. Sells cause dips, buys cause parabolic pumps.', likelihood: 'Rare' },
  { name: 'Diamond-Hand', symbol: '💎', color: 'bg-cyan-300 text-black', description: 'Unfazed by volatility. This Trenchmon holds through 100x gains and -99% losses without flinching.', likelihood: 'Uncommon' },
  { name: 'Based', symbol: '✅', color: 'bg-green-500 text-white', description: 'A fundamentally sound and respected entity in the ecosystem. Does things the right way.', likelihood: 'Rare' },
  { name: 'Cringe', symbol: '🤢', color: 'bg-yellow-800 text-white', description: 'Embodies awkward or out-of-touch behavior. Tries too hard to fit in with the degen culture.', likelihood: 'Common' },
];

const riskInfo = [
    { name: 'SAFU', color: 'text-solana-green', description: 'Funds are secure. Audited contracts, locked liquidity, and a based dev team.', likelihood: 'Very Rare' },
    { name: 'Low', color: 'text-green-400', description: 'Relatively safe, but this is crypto. Do your own research (DYOR).', likelihood: 'Rare' },
    { name: 'Medium', color: 'text-yellow-400', description: 'Exercise caution. The project has potential but also some red flags.', likelihood: 'Common' },
    { name: 'High', color: 'text-orange-500', description: 'Significant risk involved. High chance of getting rekt, but potential for high reward.', likelihood: 'Common' },
    { name: 'DEGEN', color: 'text-degen-red', description: 'Pure, unadulterated gambling. High likelihood of a rug pull or total collapse. Ape responsibly.', likelihood: 'Very Common' },
];

const rarityInfo = [
    { name: 'Common', color: 'text-rarity-common', description: 'Your everyday Trenchmon. Easy to find in the wild, low impact.', likelihood: 'Very High' },
    { name: 'Uncommon', color: 'text-rarity-uncommon', description: 'A bit more special than Common, with slightly better potential.', likelihood: 'High' },
    { name: 'Rare', color: 'text-rarity-rare', description: 'A valuable find. These Trenchmon often have unique and powerful abilities.', likelihood: 'Medium' },
    { name: 'Epic', color: 'text-rarity-epic', description: 'A truly formidable Trenchmon. Possesses game-changing traits and high status.', likelihood: 'Low' },
    { name: 'Legendary', color: 'text-rarity-legendary', description: 'The rarest of them all. A Trenchmon of mythic status, capable of defining an entire meta.', likelihood: 'Very Low' },
];

const GuidePage = () => {
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
          <h2 className="text-2xl sm:text-3xl font-bold text-solana-green mb-6 text-center">Card Guide</h2>
          
          {/* Trenchmon Types */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-solana-purple mb-4">Trenchmon Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeInfo.map(type => (
                <div key={type.name} className="flex items-start gap-3 p-3 bg-dark-bg/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xl ${type.color}`}>
                    {type.symbol}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{type.name}</h4>
                    <p className="text-xs leading-snug">{type.description}</p>
                    <p className="text-xs mt-2 text-light-gray"><strong className="font-semibold text-solana-purple/90">Appearance Rate:</strong> {type.likelihood}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Levels */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-solana-purple mb-4">Risk Levels</h3>
            <div className="space-y-4 text-sm">
                {riskInfo.map(risk => (
                    <div key={risk.name}>
                        <h4 className={`font-bold text-base ${risk.color}`}>{risk.name}</h4>
                        <p className="text-light-gray">{risk.description}</p>
                        <p className="text-xs mt-1 text-light-gray"><strong className="font-semibold text-solana-purple/90">Appearance Rate:</strong> {risk.likelihood}</p>
                    </div>
                ))}
            </div>
          </section>

          {/* Rarity Tiers */}
          <section>
            <h3 className="text-xl font-bold text-solana-purple mb-4">Rarity Tiers</h3>
            <div className="space-y-4 text-sm">
                {rarityInfo.map(rarity => (
                    <div key={rarity.name}>
                        <h4 className={`font-bold text-base ${rarity.color}`}>{rarity.name}</h4>
                        <p className="text-light-gray">{rarity.description}</p>
                        <p className="text-xs mt-1 text-light-gray"><strong className="font-semibold text-solana-purple/90">Appearance Rate:</strong> {rarity.likelihood}</p>
                    </div>
                ))}
            </div>
          </section>

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

export default GuidePage;
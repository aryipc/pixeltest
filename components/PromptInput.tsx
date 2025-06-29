import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };
  
  return (
    <div className="w-full p-4">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., a brave knight fighting a dragon"
          className="w-full h-24 p-4 text-lg bg-gray-800 border-2 border-cyan-400 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:outline-none transition-all duration-300 resize-none placeholder-gray-500 text-white"
          disabled={isLoading}
        />
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="absolute bottom-3 right-3 px-4 py-2 text-lg font-bold text-white bg-fuchsia-600 rounded-md hover:bg-fuchsia-700 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 disabled:transform-none"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
};
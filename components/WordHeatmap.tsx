import React from 'react';
import { WordFrequency } from '../types';

interface WordHeatmapProps {
  words: WordFrequency[];
  onWordClick?: (word: string) => void;
  selectedWord?: string | null;
}

const WordHeatmap: React.FC<WordHeatmapProps> = ({ words, onWordClick, selectedWord }) => {
  // Normalize counts to get a font size range between 0.8rem and 2.5rem
  const maxCount = Math.max(...words.map(w => w.count), 1);
  const minCount = Math.min(...words.map(w => w.count), 0);

  const getFontSize = (count: number) => {
    const minSize = 0.85;
    const maxSize = 2.0;
    const normalized = (count - minCount) / (maxCount - minCount || 1);
    return `${minSize + normalized * (maxSize - minSize)}rem`;
  };

  const getOpacity = (count: number) => {
      const normalized = (count - minCount) / (maxCount - minCount || 1);
      return 0.6 + (normalized * 0.4); // Min opacity 0.6
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center justify-between">
        <span>Sentiment Heatmap</span>
        <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded border">Click to Filter</span>
      </h3>
      <div className="flex flex-wrap gap-2 items-center justify-center min-h-[200px] content-center flex-grow">
        {words.map((w, idx) => {
          const isSelected = selectedWord === w.word;
          return (
            <span
              key={idx}
              onClick={() => onWordClick && onWordClick(w.word)}
              className={`
                  px-3 py-1 rounded-md border font-medium transition-all hover:scale-105 cursor-pointer select-none
                  ${w.sentiment === 'positive' 
                      ? (isSelected 
                          ? 'bg-noelia-600 text-white border-noelia-700 shadow-md ring-2 ring-noelia-100 scale-105' 
                          : 'bg-noelia-50 text-noelia-700 border-noelia-200 hover:bg-noelia-100') 
                      : (isSelected 
                          ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-100 scale-105' 
                          : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100')}
              `}
              style={{ 
                  fontSize: getFontSize(w.count),
                  opacity: isSelected ? 1 : getOpacity(w.count) 
              }}
              title={`${w.count} mentions - Click to filter comments`}
            >
              {w.word}
            </span>
          );
        })}
        {words.length === 0 && <p className="text-slate-400 text-sm">No word data available.</p>}
      </div>
    </div>
  );
};

export default WordHeatmap;
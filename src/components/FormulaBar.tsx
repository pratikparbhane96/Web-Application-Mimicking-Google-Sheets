
import React, { useEffect, useRef } from 'react';
import { indexToColStr } from '../utils/formulaUtils';

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  selectedCell: { row: number; col: number } | null;
  onSubmit: () => void;
}

const FormulaBar: React.FC<FormulaBarProps> = ({
  value,
  onChange,
  selectedCell,
  onSubmit,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (inputRef.current && selectedCell) {
      inputRef.current.focus();
    }
  }, [selectedCell]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };
  
  const cellReference = selectedCell 
    ? `${indexToColStr(selectedCell.col)}${selectedCell.row + 1}` 
    : '';
  
  return (
    <div className="formula-bar animate-slide-down">
      <div className="flex-shrink-0 bg-sheet-active w-10 h-6 flex items-center justify-center mr-2 rounded text-xs font-medium">
        {cellReference}
      </div>
      <div className="relative flex-1 flex items-center">
        <span className="absolute left-2 text-sheet-lightText">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h.01M6 16h.01M16 8h.01M16 16h.01M12 12h.01" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-white border border-sheet-border rounded h-7 pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Enter a value or formula starting with ="
        />
      </div>
    </div>
  );
};

export default FormulaBar;

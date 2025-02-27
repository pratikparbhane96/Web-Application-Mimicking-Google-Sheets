
import React from 'react';
import { CellFormat } from '../utils/spreadsheetUtils';

interface ToolbarProps {
  currentFormat: CellFormat;
  onFormatChange: (format: Partial<CellFormat>) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onDeleteRow: () => void;
  onDeleteColumn: () => void;
  canDeleteRow: boolean;
  canDeleteColumn: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentFormat,
  onFormatChange,
  onAddRow,
  onAddColumn,
  onDeleteRow,
  onDeleteColumn,
  canDeleteRow,
  canDeleteColumn,
}) => {
  const handleBoldClick = () => {
    onFormatChange({ bold: !currentFormat.bold });
  };
  
  const handleItalicClick = () => {
    onFormatChange({ italic: !currentFormat.italic });
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormatChange({ color: e.target.value });
  };
  
  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormatChange({ bgColor: e.target.value });
  };
  
  return (
    <div className="toolbar animate-slide-down">
      {/* Format options */}
      <button
        className={`toolbar-button ${currentFormat.bold ? 'active' : ''}`}
        onClick={handleBoldClick}
        title="Bold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6m0 8h8a4 4 0 110 8H6" />
        </svg>
      </button>
      
      <button
        className={`toolbar-button ${currentFormat.italic ? 'active' : ''}`}
        onClick={handleItalicClick}
        title="Italic"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>
      
      <div className="toolbar-divider"></div>
      
      <div className="flex items-center" title="Text Color">
        <input
          type="color"
          value={currentFormat.color || '#000000'}
          onChange={handleColorChange}
          className="w-6 h-6 rounded overflow-hidden cursor-pointer"
        />
      </div>
      
      <div className="flex items-center" title="Background Color">
        <input
          type="color"
          value={currentFormat.bgColor || '#ffffff'}
          onChange={handleBgColorChange}
          className="w-6 h-6 rounded overflow-hidden cursor-pointer"
        />
      </div>
      
      <div className="toolbar-divider"></div>
      
      {/* Row and Column Operations */}
      <button
        className="toolbar-button"
        onClick={onAddRow}
        title="Add Row"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      <button
        className="toolbar-button"
        onClick={onAddColumn}
        title="Add Column"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" transform="rotate(90 12 12)" />
        </svg>
      </button>
      
      <button
        className={`toolbar-button ${!canDeleteRow ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={canDeleteRow ? onDeleteRow : undefined}
        title="Delete Row"
        disabled={!canDeleteRow}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
        </svg>
      </button>
      
      <button
        className={`toolbar-button ${!canDeleteColumn ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={canDeleteColumn ? onDeleteColumn : undefined}
        title="Delete Column"
        disabled={!canDeleteColumn}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" transform="rotate(90 12 12)" />
        </svg>
      </button>
      
      <div className="flex-1"></div>
      
      {/* Help Button */}
      <button className="toolbar-button" title="Formula Help">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
};

export default Toolbar;

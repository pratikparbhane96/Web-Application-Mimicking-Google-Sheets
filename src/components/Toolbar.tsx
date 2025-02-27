
import React, { useState } from 'react';
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

// Color palette options
const colorPalette = {
  text: [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  ],
  background: [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  ]
};

// Pastel colors for the custom palette
const customPalette = [
  '#F2FCE2', // Soft Green
  '#FEF7CD', // Soft Yellow
  '#FEC6A1', // Soft Orange
  '#E5DEFF', // Soft Purple
  '#FFDEE2', // Soft Pink
  '#FDE1D3', // Soft Peach
  '#D3E4FD'  // Soft Blue
];

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
  const [showTextColorPalette, setShowTextColorPalette] = useState(false);
  const [showBgColorPalette, setShowBgColorPalette] = useState(false);
  
  const handleBoldClick = () => {
    onFormatChange({ bold: !currentFormat.bold });
  };
  
  const handleItalicClick = () => {
    onFormatChange({ italic: !currentFormat.italic });
  };
  
  const handleColorChange = (color: string) => {
    onFormatChange({ color });
    setShowTextColorPalette(false);
  };
  
  const handleBgColorChange = (color: string) => {
    onFormatChange({ bgColor: color });
    setShowBgColorPalette(false);
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
      
      {/* Text Color with Palette */}
      <div className="relative">
        <button 
          className="toolbar-button flex items-center" 
          onClick={() => setShowTextColorPalette(!showTextColorPalette)}
          title="Text Color"
        >
          <div 
            className="w-4 h-4 rounded border border-gray-300" 
            style={{ backgroundColor: currentFormat.color || '#000000' }}
          >
            <span className="sr-only">Text color</span>
          </div>
        </button>
        
        {showTextColorPalette && (
          <div className="absolute left-0 top-full mt-1 p-2 bg-white rounded shadow-lg z-50 w-64">
            <div className="grid grid-cols-10 gap-1 mb-2">
              {colorPalette.text.map((color, index) => (
                <button
                  key={`text-${color}-${index}`}
                  className="w-5 h-5 rounded-sm border border-gray-200 hover:border-gray-400"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                />
              ))}
            </div>
            <div className="flex justify-center space-x-1 pt-2 border-t border-gray-200">
              {customPalette.map((color, index) => (
                <button
                  key={`custom-text-${color}`}
                  className="w-6 h-6 rounded-full border border-gray-200 hover:border-gray-400"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={`Custom ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Background Color with Palette */}
      <div className="relative">
        <button 
          className="toolbar-button flex items-center" 
          onClick={() => setShowBgColorPalette(!showBgColorPalette)}
          title="Background Color"
        >
          <div 
            className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center" 
            style={{ backgroundColor: currentFormat.bgColor || '#ffffff' }}
          >
            <div className="w-3 h-0.5 bg-gray-400"></div>
          </div>
        </button>
        
        {showBgColorPalette && (
          <div className="absolute left-0 top-full mt-1 p-2 bg-white rounded shadow-lg z-50 w-64">
            <div className="grid grid-cols-10 gap-1 mb-2">
              {colorPalette.background.map((color, index) => (
                <button
                  key={`bg-${color}-${index}`}
                  className="w-5 h-5 rounded-sm border border-gray-200 hover:border-gray-400"
                  style={{ backgroundColor: color }}
                  onClick={() => handleBgColorChange(color)}
                  title={color}
                />
              ))}
            </div>
            <div className="flex justify-center space-x-1 pt-2 border-t border-gray-200">
              {customPalette.map((color, index) => (
                <button
                  key={`custom-bg-${color}`}
                  className="w-6 h-6 rounded-full border border-gray-200 hover:border-gray-400"
                  style={{ backgroundColor: color }}
                  onClick={() => handleBgColorChange(color)}
                  title={`Custom ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="toolbar-divider"></div>
      
      {/* Row and Column Operations with Text */}
      <button
        className="toolbar-button text-xs px-2 w-auto flex items-center gap-1"
        onClick={onAddRow}
        title="Add Row"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Add Row</span>
      </button>
      
      <button
        className="toolbar-button text-xs px-2 w-auto flex items-center gap-1"
        onClick={onAddColumn}
        title="Add Column"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" transform="rotate(90 12 12)" />
        </svg>
        <span>Add Column</span>
      </button>
      
      <button
        className={`toolbar-button text-xs px-2 w-auto flex items-center gap-1 ${!canDeleteRow ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={canDeleteRow ? onDeleteRow : undefined}
        title="Delete Row"
        disabled={!canDeleteRow}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
        </svg>
        <span>Delete Row</span>
      </button>
      
      <button
        className={`toolbar-button text-xs px-2 w-auto flex items-center gap-1 ${!canDeleteColumn ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={canDeleteColumn ? onDeleteColumn : undefined}
        title="Delete Column"
        disabled={!canDeleteColumn}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" transform="rotate(90 12 12)" />
        </svg>
        <span>Delete Column</span>
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

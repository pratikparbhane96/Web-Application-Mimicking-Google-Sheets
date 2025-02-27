
import React, { useEffect, useRef, useState } from 'react';
import { CellData } from '../utils/spreadsheetUtils';

interface CellProps {
  data: CellData;
  row: number;
  col: number;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (row: number, col: number) => void;
  onChange: (value: string) => void;
  onDoubleClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  width?: number;
}

const Cell: React.FC<CellProps> = ({
  data,
  row,
  col,
  isSelected,
  isEditing,
  onSelect,
  onChange,
  onDoubleClick,
  onKeyDown,
  width = 64,
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const [cellValue, setCellValue] = useState('');
  
  useEffect(() => {
    // Convert null to empty string for display
    setCellValue(data.value === null ? '' : String(data.value));
  }, [data.value]);
  
  useEffect(() => {
    if (isEditing && cellRef.current) {
      cellRef.current.focus();
      
      // Position cursor at the end of text
      const range = document.createRange();
      const sel = window.getSelection();
      if (cellRef.current.childNodes[0]) {
        range.setStart(cellRef.current.childNodes[0], cellValue.length);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [isEditing, cellValue]);
  
  const handleClick = () => {
    onSelect(row, col);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const value = e.target.innerText;
    setCellValue(value);
    onChange(value);
  };
  
  // Create classNames based on formatting
  let classNames = `cell transition-cell`;
  if (isSelected) classNames += ' selected';
  if (isEditing) classNames += ' editing';
  
  // Apply formatting if available
  const style: React.CSSProperties = {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
    height: '24px',
    minHeight: '24px',
    maxHeight: '24px',
    margin: 0,
    padding: '0 2px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  };
  
  if (data.format) {
    if (data.format.bold) style.fontWeight = 'bold';
    if (data.format.italic) style.fontStyle = 'italic';
    if (data.format.color) style.color = data.format.color;
    if (data.format.bgColor) style.backgroundColor = data.format.bgColor;
    if (data.format.fontSize) style.fontSize = `${data.format.fontSize}px`;
  }
  
  return (
    <div
      ref={cellRef}
      className={classNames}
      style={style}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      onInput={handleChange}
      tabIndex={0}
      data-row={row}
      data-col={col}
    >
      {cellValue}
    </div>
  );
};

export default Cell;


import React from 'react';
import Spreadsheet from '../components/Spreadsheet';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-2 px-4 flex items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
            <path d="M10 13H8v5h2v-5z" />
            <path d="M16 13h-2v5h2v-5z" />
          </svg>
          <h1 className="text-lg font-medium">Sheetopia</h1>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white/20 rounded-full px-4 py-1 text-sm font-medium">
            Untitled Spreadsheet
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-white/20 hover:bg-white/30 transition-colors rounded-full px-3 py-1 text-sm font-medium">
            Share
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-0">
        <Spreadsheet />
      </main>
    </div>
  );
};

export default Index;

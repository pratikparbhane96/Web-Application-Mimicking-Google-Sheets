import React, { useRef, useState } from 'react';
import Spreadsheet from '../components/Spreadsheet';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';

const Index = () => {
  const [documentName, setDocumentName] = useState('Untitled Spreadsheet');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const spreadsheetRef = useRef<any>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleRenameClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingTitle(false);
  };

  const handleRenameBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentName(e.target.value);
  };

  const handleSaveSpreadsheet = () => {
    if (!spreadsheetRef.current) return;
    
    try {
      // Get spreadsheet data
      const data = spreadsheetRef.current.getSpreadsheetData();
      
      // Convert to JSON string
      const jsonData = JSON.stringify(data);
      
      // Create a blob
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentName.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Spreadsheet Saved',
        description: `${documentName} has been saved to your downloads folder`,
      });
    } catch (error) {
      console.error('Error saving spreadsheet:', error);
      toast({
        title: 'Save Failed',
        description: 'An error occurred while saving the spreadsheet',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        if (spreadsheetRef.current) {
          spreadsheetRef.current.loadSpreadsheetData(jsonData);
          
          // Update document name based on file name
          const fileName = file.name.replace(/\.json$/, '').replace(/_/g, ' ');
          setDocumentName(fileName);
          
          toast({
            title: 'Spreadsheet Loaded',
            description: `${fileName} has been loaded successfully`,
          });
        }
      } catch (error) {
        console.error('Error loading spreadsheet:', error);
        toast({
          title: 'Load Failed',
          description: 'Invalid spreadsheet file format',
          variant: 'destructive',
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

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
          <h1 className="text-lg font-medium">Spreadsheet</h1>
        </div>
        <div className="flex-1 flex justify-center">
          {isEditingTitle ? (
            <form onSubmit={handleRenameSubmit} className="flex items-center">
              <Input
                ref={titleInputRef}
                type="text"
                value={documentName}
                onChange={handleTitleChange}
                onBlur={handleRenameBlur}
                className="bg-white/20 rounded-full px-4 py-1 text-sm font-medium text-white w-64 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </form>
          ) : (
            <button
              onClick={handleRenameClick}
              className="bg-white/20 hover:bg-white/30 transition-colors rounded-full px-4 py-1 text-sm font-medium"
            >
              {documentName}
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white/20 hover:bg-white/30 transition-colors border-none text-white">
                Charts
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chart Visualization</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm">Select a data range and chart type to create a visualization.</p>
                <div className="flex flex-col gap-2 mt-4">
                  <input type="text" placeholder="Data Range (e.g., A1:B5)" className="p-2 border rounded" />
                  <select className="p-2 border rounded">
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                  <Button className="mt-2">Generate Chart</Button>
                  <div className="h-64 bg-gray-100 flex items-center justify-center mt-4 rounded">
                    Chart Preview Area
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            className="bg-white/20 hover:bg-white/30 transition-colors border-none text-white"
            onClick={handleSaveSpreadsheet}
          >
            Save
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-white/20 hover:bg-white/30 transition-colors border-none text-white"
            onClick={handleFileInputClick}
          >
            Upload
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </header>
      
      <main className="flex-1 p-0">
        <Spreadsheet ref={spreadsheetRef} />
      </main>
    </div>
  );
};

export default Index;

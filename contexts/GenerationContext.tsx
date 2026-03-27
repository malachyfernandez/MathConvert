import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GenerationContextType {
  generatingPages: Set<string>;
  setGeneratingPage: (pageId: string, isGenerating: boolean) => void;
  isPageGenerating: (pageId: string) => boolean;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const useGeneration = () => {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};

export const GenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generatingPages, setGeneratingPages] = useState<Set<string>>(new Set());

  const setGeneratingPage = (pageId: string, isGenerating: boolean) => {
    setGeneratingPages(prev => {
      const newSet = new Set(prev);
      if (isGenerating) {
        newSet.add(pageId);
      } else {
        newSet.delete(pageId);
      }
      return newSet;
    });
  };

  const isPageGenerating = (pageId: string) => {
    return generatingPages.has(pageId);
  };

  return (
    <GenerationContext.Provider value={{ generatingPages, setGeneratingPage, isPageGenerating }}>
      {children}
    </GenerationContext.Provider>
  );
};

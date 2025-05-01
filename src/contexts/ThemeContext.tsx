import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  value?: ThemeContextType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, value }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Try to load saved preference from localStorage if no value is provided
    if (!value) {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode) {
        return savedMode === 'true';
      }
      // Otherwise, use system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Save to localStorage whenever it changes (only if no external value)
  useEffect(() => {
    if (!value) {
      localStorage.setItem('darkMode', isDarkMode.toString());
      // Add/remove dark-mode class from body
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }, [isDarkMode, value]);

  const toggleDarkMode = () => {
    if (!value) {
      setIsDarkMode((prev) => !prev);
    }
  };

  const contextValue = value || { isDarkMode, toggleDarkMode };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;

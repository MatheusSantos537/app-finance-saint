import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native'; // Hook do React Native para detectar o tema
import { lightTheme, darkTheme, Theme } from '../constants/theme';

const ThemeContext = createContext<Theme | undefined>(undefined);
type ThemeProviderProps = {
  children: ReactNode; 
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Detecta o esquema de cores do dispositivo (light, dark, ou null)
  const colorScheme = useColorScheme();

  
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
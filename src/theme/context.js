import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({ mode: 'light', toggleMode: () => {} });
const THEME_KEY = 'pitch-cricket-theme-v1';

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light') setMode(stored);
    }).catch(() => {}).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(THEME_KEY, mode).catch(() => {});
  }, [mode, ready]);

  const toggleMode = () => setMode((current) => current === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }

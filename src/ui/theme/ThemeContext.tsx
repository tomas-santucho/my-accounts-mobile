import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from './colors';

type ThemeContextType = {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
    themeMode: 'light' | 'dark' | 'system';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme_preference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme) {
                    setMode(savedTheme as 'light' | 'dark' | 'system');
                }
            } catch (error) {
                console.error('Failed to load theme preference', error);
            }
        };
        loadTheme();
    }, []);

    // Determine active theme based on mode and system preference
    const activeTheme =
        mode === 'system'
            ? (systemColorScheme === 'dark' ? darkTheme : lightTheme)
            : (mode === 'dark' ? darkTheme : lightTheme);

    const isDark = activeTheme.mode === 'dark';

    const toggleTheme = () => {
        setThemeMode(prev => {
            if (prev === 'system') {
                return systemColorScheme === 'dark' ? 'light' : 'dark';
            }
            return prev === 'dark' ? 'light' : 'dark';
        });
    };

    const setThemeMode = async (newMode: 'light' | 'dark' | 'system' | ((prev: 'light' | 'dark' | 'system') => 'light' | 'dark' | 'system')) => {
        if (typeof newMode === 'function') {
            setMode(prev => {
                const next = newMode(prev);
                AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(console.error);
                return next;
            });
        } else {
            setMode(newMode);
            try {
                await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
            } catch (error) {
                console.error('Failed to save theme preference', error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme: activeTheme, isDark, toggleTheme, setThemeMode: (m) => setThemeMode(m), themeMode: mode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

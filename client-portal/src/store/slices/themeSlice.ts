import { createSlice } from '@reduxjs/toolkit';

// Check saved preference or system theme
const getInitialTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nexus_gate_theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

interface ThemeState {
  isDark: boolean;
}

const initialState: ThemeState = {
  isDark: getInitialTheme()
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexus_gate_theme', state.isDark ? 'dark' : 'light');
        if (state.isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action: { payload: boolean }) => {
      state.isDark = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexus_gate_theme', state.isDark ? 'dark' : 'light');
        if (state.isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;

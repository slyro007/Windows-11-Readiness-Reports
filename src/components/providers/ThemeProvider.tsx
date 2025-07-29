'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline, IconButton, Box } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'

// Light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#e57373',
      dark: '#c62828',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#212121',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#212121',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#212121',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#212121',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: '#212121',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#212121',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 24px',
        },
        contained: {
          boxShadow: '0px 2px 8px rgba(25, 118, 210, 0.2)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
        },
      },
    },
  },
})

// Dark theme (improved)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#bbdefb',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#f48fb1',
      light: '#f8bbd9',
      dark: '#e91e63',
    },
    success: {
      main: '#81c784',
      light: '#a5d6a7',
      dark: '#66bb6a',
    },
    warning: {
      main: '#ffb74d',
      light: '#ffcc02',
      dark: '#ffa726',
    },
    error: {
      main: '#ef5350',
      light: '#e57373',
      dark: '#f44336',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#ffffff',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#ffffff',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#ffffff',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#ffffff',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: '#ffffff',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          backgroundImage: 'none',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 24px',
        },
        contained: {
          boxShadow: '0px 2px 8px rgba(144, 202, 249, 0.3)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(144, 202, 249, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          backgroundImage: 'none',
        },
      },
    },
  },
})

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme-mode')
    if (saved) {
      setIsDarkMode(saved === 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('theme-mode', newMode ? 'dark' : 'light')
  }

  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default,
            transition: 'background-color 0.3s ease'
          }}
        >
          {children}
        </Box>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
} 
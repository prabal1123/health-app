// src/theme.js
import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F4FAFD',     // soft blue-grey
      paper:   '#FFFFFF',     // white cards
    },
    primary: {
      main: '#00B3A6',        // turquoise accent
    },
    secondary: {
      main: '#0084FF',
    },
  },
  shape: {
    borderRadius: 18,         // soft rounded corners everywhere
  },
})

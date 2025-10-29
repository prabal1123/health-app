// // src/components/Layout.jsx
// import React from 'react';
// import { Box, CssBaseline, ThemeProvider } from '@mui/material';
// import SideNav from './SideNav'; // Assuming SideNav is in src/components/SideNav.jsx
// import { appTheme } from '../theme'; // Assuming appTheme is defined

// /**
//  * Layout component that provides a consistent navigation structure
//  * (SideNav) for application pages.
//  *
//  * @param {object} props - Component props.
//  * @param {React.ReactNode} props.children - The content of the page to be rendered within the layout.
//  */
// export default function Layout({ children }) {
//   return (
//     <ThemeProvider theme={appTheme}>
//       <CssBaseline /> {/* Apply global CSS reset and theme baseline */}
//       <Box sx={{ display: 'flex', minHeight: '100vh' }}>
//         {/* Side Navigation Bar */}
//         <SideNav />

//         {/* Main Content Area */}
//         <Box
//           component="main"
//           sx={{
//             flexGrow: 1,
//             px: { xs: 2, md: 4 }, // Responsive horizontal padding
//             py: { xs: 3, md: 5 }, // Responsive vertical padding
//             bgcolor: 'background.default', // Use theme's default background color
//           }}
//         >
//           {children} {/* Render the actual page content here */}
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// }

// src/components/Layout.jsx
import React from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Outlet } from 'react-router-dom'; // ADDED: Import Outlet
import SideNav from './SideNav';
import { appTheme } from '../theme';

/**
 * Layout component that provides a consistent navigation structure
 * (SideNav) and renders child routes within its content area.
 */
export default function Layout() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Side Navigation Bar */}
        <SideNav />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, md: 4 },
            py: { xs: 3, md: 5 },
            bgcolor: 'background.default',
          }}
        >
          <Outlet /> {/* CHANGED: Render child routes here using Outlet */}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

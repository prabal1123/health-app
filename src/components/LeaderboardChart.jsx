// // src/components/LeaderboardChart.jsx
// import React from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';
// import { Button } from '@mui/material';

// export default function LeaderboardChart({ data }) {
//   // Check if data exists and has elements
//   if (!data || data.length === 0) {
//     return (
//       <div style={{ textAlign: 'center', color: 'gray' }}>
//         No data available for the chart.
//       </div>
//     );
//   }

//   // The chart data should be an array of objects
//   // Each object represents a point in time (e.g., a day)
//   // For this simple chart, we'll assume the `data` prop is structured like this:
//   // [
//   //   { name: 'Alice', steps: 15000 },
//   //   { name: 'Bob', steps: 12000 },
//   //   ...
//   // ]
//   // A more advanced version would need historical data.
//   // For now, let's just create a static view.

//   const chartData = data.map((item) => ({
//     name: item.name,
//     Steps: item.steps,
//   }));

//   // Generate a random color for each user's line
//   const getRandomColor = () => {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//       color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
//   };
  
//   // New function to handle the download
//   const handleDownload = () => {
//     const svgElement = document.querySelector('.recharts-surface');
//     if (!svgElement) {
//       alert('Chart not found.');
//       return;
//     }
//     const svgData = new XMLSerializer().serializeToString(svgElement);
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');
//     const svgSize = svgElement.getBoundingClientRect();
//     canvas.width = svgSize.width;
//     canvas.height = svgSize.height;

//     const img = new Image();
//     img.onload = () => {
//       ctx.drawImage(img, 0, 0);
//       const pngFile = canvas.toDataURL('image/png');
//       const downloadLink = document.createElement('a');
//       downloadLink.href = pngFile;
//       downloadLink.download = 'leaderboard-chart.png';
//       document.body.appendChild(downloadLink);
//       downloadLink.click();
//       document.body.removeChild(downloadLink);
//     };

//     img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
//   };

//   return (
//     <div style={{ position: 'relative' }}>
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart
//           margin={{
//             top: 5,
//             right: 30,
//             left: 20,
//             bottom: 5,
//           }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           {/* Render a line for each user in the data */}
//           {data.map((item, index) => (
//             <Line
//               key={item.name}
//               type="monotone"
//               dataKey="Steps"
//               stroke={getRandomColor()}
//               activeDot={{ r: 8 }}
//               name={item.name}
//               data={[{ name: item.name, Steps: item.steps }]}
//             />
//           ))}
//         </LineChart>
//       </ResponsiveContainer>
//       <Button
//         onClick={handleDownload}
//         variant="contained"
//         sx={{ mt: 2, position: 'absolute', bottom: 0, right: 0 }}
//       >
//         Download Chart
//       </Button>
//     </div>
//   );
// }

import React from 'react';
import {
  BarChart, // Changed from LineChart to BarChart for a leaderboard
  Bar, // Bar for the chart
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button, Box, Typography } from '@mui/material';

export default function LeaderboardChart({ data }) {
  // Check if data exists and has elements
  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', color: 'gray', py: 5 }}>
        <Typography>No data available for the leaderboard.</Typography>
      </Box>
    );
  }

  // The data is already in a format suitable for a BarChart, with each object
  // representing a user and their steps.
  // [
  //   { name: 'Alice', steps: 15000 },
  //   { name: 'Bob', steps: 12000 },
  //   ...
  // ]

  // New function to handle the download
  const handleDownload = () => {
    // The query selector should find the SVG element created by Recharts
    const svgElement = document.querySelector('.recharts-responsive-container svg');
    if (!svgElement) {
      // Use a custom message box instead of alert()
      const messageBox = document.createElement('div');
      messageBox.innerText = 'Chart not found for download.';
      messageBox.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background-color: #f44336; color: white;
        padding: 10px; border-radius: 5px;
        z-index: 1000;
      `;
      document.body.appendChild(messageBox);
      setTimeout(() => document.body.removeChild(messageBox), 3000);
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgSize = svgElement.getBoundingClientRect();
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngFile;
      downloadLink.download = 'leaderboard-chart.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Box sx={{ position: 'relative', p: 2 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Team Leaderboard
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        {/* Use a BarChart to compare steps between different users */}
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* A single Bar component is used to display all the steps */}
          <Bar dataKey="steps" fill="#8884d8" name="Steps" />
        </BarChart>
      </ResponsiveContainer>
      <Box sx={{ textAlign: 'right', mt: 2 }}>
        <Button onClick={handleDownload} variant="contained">
          Download Chart
        </Button>
      </Box>
    </Box>
  );
}

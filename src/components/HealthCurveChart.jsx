import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  ButtonGroup,
}
 from '@mui/material';

export default function HealthCurveChart({ logs, loading }) {
  const [mode, setMode] = useState('daily');

  /**
   * Groups and formats health log data for the chart.
   * It handles data from only the manual_metrics table.
   * It combines entries by date, summing steps and averaging other metrics.
   * @param {Array} logs The raw array of log entries from the useHealthLogs hook.
   * @returns {Array} An array of formatted data objects for the Recharts component.
   */
  function groupData(logs) {
    const groups = {};

    logs.forEach((log) => {
      const d = new Date(log.date);
      let key = '';

      if (mode === 'weekly') {
        const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        date.setDate(date.getDate() - (date.getDay() || 7) + 1);
        const week = `${date.getFullYear()}-W${Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7))}`;
        key = week;
      } else if (mode === 'monthly') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = d.toISOString().slice(0, 10);
      }

      if (!groups[key]) {
        groups[key] = {
          steps: 0,
          glucose: 0,
          heartRate: 0,
          glucoseCount: 0,
          heartRateCount: 0,
        };
      }

      if (log.steps !== null && typeof log.steps !== 'undefined') {
        groups[key].steps += parseInt(log.steps);
      }
      if (log.glucose !== null && typeof log.glucose !== 'undefined') {
        groups[key].glucose += parseFloat(log.glucose);
        groups[key].glucoseCount += 1;
      }
      if (log.heart_rate !== null && typeof log.heart_rate !== 'undefined') {
        groups[key].heartRate += parseInt(log.heart_rate);
        groups[key].heartRateCount += 1;
      }
    });

    return Object.entries(groups).map(([date, group]) => {
      const avgGlucose = group.glucoseCount > 0 ? Math.round(group.glucose / group.glucoseCount) : 0;
      const avgHeartRate = group.heartRateCount > 0 ? Math.round(group.heartRate / group.heartRateCount) : 0;

      return {
        date,
        steps: group.steps,
        glucose: avgGlucose,
        heartRate: avgHeartRate,
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  const chartData = logs ? groupData(logs) : [];
  const isEmpty = chartData.length === 0;

  return (
    <Box
      sx={{
        mt: 5,
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: 1,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Your Health Trends
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          {['daily', 'weekly', 'monthly'].map((m) => (
            <Button
              key={m}
              onClick={() => setMode(m)}
              variant={mode === m ? 'contained' : 'outlined'}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : isEmpty ? (
        <Typography color="text.secondary">No health data available yet.</Typography>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="steps" stroke="#1976d2" dot={false} />
            <Line type="monotone" dataKey="glucose" stroke="#388e3c" dot={false} />
            <Line type="monotone" dataKey="heartRate" stroke="#d32f2f" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
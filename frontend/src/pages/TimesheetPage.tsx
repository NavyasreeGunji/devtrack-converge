import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { dailyLogs, developers } from '../data/mockData';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonday(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getWeekDays(mondayStr: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(mondayStr, i));
}

export default function TimesheetPage() {
  const [weekMonday, setWeekMonday] = useState(() => getMonday('2026-06-14'));
  const weekDays = getWeekDays(weekMonday);

  const prevWeek = () => setWeekMonday((m) => addDays(m, -7));
  const nextWeek = () => setWeekMonday((m) => addDays(m, 7));

  const getHours = (dev: string, date: string) =>
    dailyLogs
      .filter((l) => l.developer === dev && l.date === date)
      .reduce((sum, l) => sum + l.hours, 0);

  const getWeekTotal = (dev: string) =>
    weekDays.reduce((sum, d) => sum + getHours(dev, d), 0);

  const getDayTotal = (date: string) =>
    developers.reduce((sum, dev) => sum + getHours(dev, date), 0);

  const grandTotal = weekDays.reduce((sum, d) => sum + getDayTotal(d), 0);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={prevWeek} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 210, textAlign: 'center' }}>
          {weekDays[0]} – {weekDays[6]}
        </Typography>
        <IconButton onClick={nextWeek} size="small">
          <ChevronRightIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Total: <strong>{grandTotal}h</strong>
        </Typography>
      </Stack>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 600, minWidth: 160, fontSize: 12, color: '#64748b' }}>
                Developer
              </TableCell>
              {weekDays.map((date, i) => (
                <TableCell
                  key={date}
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 70, fontSize: 12, color: '#64748b' }}
                >
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {DAY_LABELS[i]}
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {date.slice(5)}
                    </Typography>
                  </Box>
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {developers.map((dev) => {
              const weekTotal = getWeekTotal(dev);
              return (
                <TableRow key={dev} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: '#2563EB18',
                          color: '#2563EB',
                        }}
                      >
                        {dev.split(' ').map((n) => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {dev}
                      </Typography>
                    </Box>
                  </TableCell>
                  {weekDays.map((date) => {
                    const h = getHours(dev, date);
                    return (
                      <TableCell key={date} align="center">
                        {h > 0 ? (
                          <Chip
                            label={`${h}h`}
                            size="small"
                            sx={{
                              bgcolor:
                                h >= 7
                                  ? '#dcfce7'
                                  : h >= 4
                                  ? '#dbeafe'
                                  : '#fef3c7',
                              color:
                                h >= 7
                                  ? '#16a34a'
                                  : h >= 4
                                  ? '#2563EB'
                                  : '#d97706',
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      color={weekTotal >= 35 ? 'success.main' : weekTotal > 0 ? 'text.primary' : 'text.disabled'}
                    >
                      {weekTotal > 0 ? `${weekTotal}h` : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell>
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                  Daily Total
                </Typography>
              </TableCell>
              {weekDays.map((date) => {
                const total = getDayTotal(date);
                return (
                  <TableCell key={date} align="center">
                    <Typography variant="body2" fontWeight={700}>
                      {total > 0 ? `${total}h` : '—'}
                    </Typography>
                  </TableCell>
                );
              })}
              <TableCell align="center">
                <Typography variant="body2" fontWeight={800} color="primary">
                  {grandTotal}h
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Activity Breakdown (This Week)
      </Typography>
      <Paper sx={{ p: 2.5 }}>
        {developers.map((dev) => {
          const devLogs = dailyLogs.filter((l) => l.developer === dev && weekDays.includes(l.date));
          if (devLogs.length === 0) return null;
          const total = devLogs.reduce((sum, l) => sum + l.hours, 0);
          return (
            <Box key={dev} sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                <Typography variant="body2" fontWeight={700}>
                  {dev}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {total}h this week
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {devLogs.map((l) => (
                  <Chip
                    key={l.id}
                    label={`${l.title}: ${l.hours}h`}
                    size="small"
                    sx={{
                      bgcolor: '#2563EB18',
                      color: '#2563EB',
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                ))}
              </Stack>
              <Divider sx={{ mt: 1.5 }} />
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
}

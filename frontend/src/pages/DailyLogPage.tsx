import { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import {
  DailyLog,
  Story,
  dailyLogs as initialLogs,
  initialStories,
  developers,
} from '../data/mockData';
import { useApp } from '../context/AppContext';
import { apiGetLogs, apiCreateLog, apiGetStories } from '../api/api';

const emptyForm = (): Omit<DailyLog, 'id'> => ({
  developer: '',
  date: new Date().toISOString().slice(0, 10),
  title: '',
  description: '',
  hours: 4,
});

export default function DailyLogPage() {
  const { currentUser, backendOnline, backendChecked } = useApp();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [allStories, setAllStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!backendChecked) return;
    if (backendOnline) {
      apiGetLogs().then(setLogs).catch(() => setLogs(initialLogs));
      apiGetStories().then(setAllStories).catch(() => setAllStories(initialStories));
    } else {
      setLogs(initialLogs);
      setAllStories(initialStories);
    }
  }, [backendChecked, backendOnline]);

  const [filterDev, setFilterDev] = useState(currentUser?.name ?? 'all');
  const [filterDate, setFilterDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState<Omit<DailyLog, 'id'>>({
    ...emptyForm(),
    developer: currentUser?.name ?? '',
  });

  useEffect(() => {
    if (currentUser) setFilterDev(currentUser.name);
  }, [currentUser]);

  // Stories assigned to the selected developer
  const devStories = allStories.filter((s) => s.assignee === form.developer);

  const filtered = logs
    .filter((l) => filterDev === 'all' || l.developer === filterDev)
    .filter((l) => !filterDate || l.date === filterDate)
    .sort((a, b) => b.date.localeCompare(a.date) || a.developer.localeCompare(b.developer));

  const totalHours = filtered.reduce((sum, l) => sum + l.hours, 0);

  const handleSave = async () => {
    setSaveError('');
    try {
      if (backendOnline) {
        const created = await apiCreateLog(form);
        setLogs((prev) => [...prev, created]);
      } else {
        const newId = `L-${String(logs.length + 1).padStart(3, '0')}`;
        setLogs((prev) => [...prev, { ...form, id: newId }]);
      }
      setDialogOpen(false);
      setForm({ ...emptyForm(), developer: currentUser?.name ?? '' });
    } catch (err: any) {
      setSaveError(err?.message ?? 'Save failed. Check the backend is running and try again.');
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap" useFlexGap>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Developer</InputLabel>
          <Select
            value={filterDev}
            label="Developer"
            onChange={(e) => setFilterDev(e.target.value)}
          >
            <MenuItem value="all">All Developers</MenuItem>
            {developers.map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Date"
          type="date"
          size="small"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Typography variant="body2" color="text.secondary">
          {filtered.length} entries · {totalHours}h total
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSaveError('');
            setForm({ ...emptyForm(), developer: currentUser?.name ?? '' });
            setDialogOpen(true);
          }}
        >
          Log Work
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b', textAlign: 'center', width: '12%' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b', textAlign: 'center', width: '28%' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b', textAlign: 'center', width: '48%' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b', textAlign: 'center', width: '12%' }}>Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>{log.date}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={600} sx={{ textAlign: 'center' }}>{log.title}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>{log.description}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={700} sx={{ textAlign: 'center' }}>{log.hours}h</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Daily Work</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Developer</InputLabel>
                <Select
                  value={form.developer}
                  label="Developer"
                  onChange={(e) => setForm((f) => ({ ...f, developer: e.target.value, title: '' }))}
                >
                  {developers.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                size="small"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <Autocomplete
              options={devStories}
              getOptionLabel={(s) => s.title}
              value={devStories.find((s) => s.title === form.title) ?? null}
              onChange={(_, story) => setForm((f) => ({ ...f, title: story?.title ?? '' }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Story / Task"
                  size="small"
                  placeholder={devStories.length === 0 ? 'No stories assigned to this developer' : 'Select a story…'}
                />
              )}
              noOptionsText="No stories assigned to this developer"
            />

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="What did you work on today?"
            />
            <TextField
              label="Hours"
              type="number"
              value={form.hours}
              onChange={(e) => setForm((f) => ({ ...f, hours: Number(e.target.value) }))}
              size="small"
              sx={{ width: 120 }}
              inputProps={{ min: 0.5, max: 12, step: 0.5 }}
            />
          </Stack>
        </DialogContent>
        {saveError && <Alert severity="error" sx={{ mx: 3, mb: 1 }}>{saveError}</Alert>}
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.developer || !form.title || !form.description}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

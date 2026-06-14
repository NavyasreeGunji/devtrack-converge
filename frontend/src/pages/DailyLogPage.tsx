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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import {
  DailyLog,
  dailyLogs as initialLogs,
  developers,
} from '../data/mockData';
import { useApp } from '../context/AppContext';
import { apiGetLogs, apiCreateLog } from '../api/api';

const emptyForm: Omit<DailyLog, 'id'> = {
  developer: '',
  date: new Date().toISOString().slice(0, 10),
  title: '',
  description: '',
  hours: 4,
};

export default function DailyLogPage() {
  const { currentUser, backendOnline, backendChecked } = useApp();
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    if (!backendChecked) return;
    if (backendOnline) {
      apiGetLogs().then(setLogs).catch(() => setLogs(initialLogs));
    } else {
      setLogs(initialLogs);
    }
  }, [backendChecked, backendOnline]);

  const [filterDev, setFilterDev] = useState(currentUser?.name ?? 'all');
  const [filterDate, setFilterDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState<Omit<DailyLog, 'id'>>({
    ...emptyForm,
    developer: currentUser?.name ?? '',
  });

  useEffect(() => {
    if (currentUser) {
      setFilterDev(currentUser.name);
    }
  }, [currentUser]);

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
      setForm({ ...emptyForm, developer: currentUser?.name ?? '' });
    } catch (err: any) {
      setSaveError(err?.message ?? 'Save failed. Check the backend is running and try again.');
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Developer</InputLabel>
          <Select
            value={filterDev}
            label="Developer"
            onChange={(e) => setFilterDev(e.target.value)}
          >
            <MenuItem value="all">All Developers</MenuItem>
            {developers.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
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
        <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
          {filtered.length} entries · {totalHours}h total
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSaveError('');
            setForm({ ...emptyForm, developer: currentUser?.name ?? '' });
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
              {['Date', 'Title', 'Description', 'Hours'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>
                  <Typography variant="body2">{log.date}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{log.title}</Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 360 }}>
                  <Typography variant="body2">{log.description}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>{log.hours}h</Typography>
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
            <Stack direction="row" spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Developer</InputLabel>
                <Select
                  value={form.developer}
                  label="Developer"
                  onChange={(e) => setForm((f) => ({ ...f, developer: e.target.value }))}
                >
                  {developers.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
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
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
              size="small"
              placeholder="e.g. Dashboard Analytics, Login Bug Fix"
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

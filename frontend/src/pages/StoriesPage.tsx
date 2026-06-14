import { useState, useMemo, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  LinearProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';
import { Story, initialStories, developers, StoryStatus } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { apiGetStories, apiCreateStory, apiUpdateStory } from '../api/api';

const statusOptions: { value: StoryStatus; label: string; color: 'default' | 'primary' | 'warning' | 'success' | 'secondary' }[] = [
  { value: 'backlog',        label: 'Backlog',           color: 'default' },
  { value: 'to_do',         label: 'To Do',             color: 'default' },
  { value: 'in_progress',   label: 'In Progress',       color: 'primary' },
  { value: 'in_review',     label: 'In Review',         color: 'warning' },
  { value: 'for_qe_testing',label: 'Review / Testing',  color: 'secondary' },
  { value: 'done',          label: 'Done',              color: 'success' },
  { value: 'on_hold',       label: 'On Hold',           color: 'secondary' },
];

const statusColor = (s: StoryStatus) => statusOptions.find((o) => o.value === s)?.color ?? 'default';
const statusLabel = (s: StoryStatus) => statusOptions.find((o) => o.value === s)?.label ?? s;

function getMonthKey(dateStr: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return `${parts[0]}-${parts[1]}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatMonth(key: string) {
  if (!key) return '';
  const parts = key.split('-');
  return `${MONTH_NAMES[Number(parts[1]) - 1]} ${parts[0]}`;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (teamId = '', sprintId = ''): Omit<Story, 'id'> => ({
  title: '',
  description: '',
  points: 3,
  status: 'backlog',
  reporter: '',
  assignee: '',
  createdDate: today(),
  dueDate: '',
  startedDate: '',
  completedDate: '',
  teamId,
  sprintId,
});

export default function StoriesPage() {
  const { teams, sprints, backendOnline, backendChecked } = useApp();
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!backendChecked) return;
    if (backendOnline) {
      apiGetStories().then(setStories).catch(() => setStories(initialStories));
    } else {
      setStories(initialStories);
    }
  }, [backendChecked, backendOnline]);
  const [viewBy, setViewBy] = useState<'sprint' | 'month'>('sprint');

  // Sprint view state
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedSprintId, setSelectedSprintId] = useState('');

  // Auto-select first team once teams load from backend
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams]);

  // Month view state
  const [selectedMonth, setSelectedMonth] = useState('2026-05');

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Story | null>(null);
  const [form, setForm] = useState<Omit<Story, 'id'>>(emptyForm());
  const [saveError, setSaveError] = useState('');

  const teamSprints = useMemo(
    () => sprints.filter((s) => s.teamId === selectedTeamId).sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [sprints, selectedTeamId]
  );

  // Auto-select active sprint when team changes
  const resolvedSprintId = useMemo(() => {
    if (selectedSprintId && teamSprints.find((s) => s.id === selectedSprintId)) return selectedSprintId;
    const active = teamSprints.find((s) => s.status === 'active');
    return active?.id ?? teamSprints[0]?.id ?? '';
  }, [selectedSprintId, teamSprints]);

  const availableMonths = useMemo(() => {
    const keys = new Set(['2026-04', '2026-05', '2026-06', '2026-07', '2026-08']);
    stories.forEach((s) => { const k = getMonthKey(s.createdDate); if (k) keys.add(k); });
    return Array.from(keys).sort();
  }, [stories]);

  const baseFiltered = useMemo(() => {
    if (viewBy === 'sprint') {
      return stories.filter((s) => s.teamId === selectedTeamId && s.sprintId === resolvedSprintId);
    }
    return stories.filter((s) => getMonthKey(s.createdDate) === selectedMonth);
  }, [stories, viewBy, selectedTeamId, resolvedSprintId, selectedMonth]);

  const filtered = useMemo(
    () =>
      baseFiltered
        .filter((s) => filterStatus === 'all' || s.status === filterStatus)
        .filter((s) => filterAssignee === 'all' || s.assignee === filterAssignee),
    [baseFiltered, filterStatus, filterAssignee]
  );

  const summary = useMemo(() => {
    const pts = (status: StoryStatus) =>
      baseFiltered.filter((s) => s.status === status).reduce((sum, s) => sum + s.points, 0);
    const cnt = (status: StoryStatus) => baseFiltered.filter((s) => s.status === status).length;
    const total = baseFiltered.reduce((sum, s) => sum + s.points, 0);
    return {
      total,
      done: pts('done'), doneCount: cnt('done'),
      inReview: pts('in_review'), inReviewCount: cnt('in_review'),
      inProgress: pts('in_progress'), inProgressCount: cnt('in_progress'),
      forQE: pts('for_qe_testing'), forQECount: cnt('for_qe_testing'),
      toDo: pts('to_do'), toDoCount: cnt('to_do'),
      backlog: pts('backlog'), backlogCount: cnt('backlog'),
      onHold: pts('on_hold'), onHoldCount: cnt('on_hold'),
    };
  }, [baseFiltered]);

  const completionPct = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;

  const selectedSprint = sprints.find((s) => s.id === resolvedSprintId);
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const openAdd = () => {
    setForm(emptyForm(selectedTeamId, resolvedSprintId));
    setEditTarget(null);
    setSaveError('');
    setDialogOpen(true);
  };

  const openEdit = (s: Story) => { setForm({ ...s }); setEditTarget(s); setSaveError(''); setDialogOpen(true); };

  const handleSave = async () => {
    setSaveError('');
    try {
      if (backendOnline) {
        if (editTarget) {
          const updated = await apiUpdateStory(editTarget.id, form);
          setStories((prev) => prev.map((s) => (s.id === editTarget.id ? updated : s)));
        } else {
          const created = await apiCreateStory(form);
          setStories((prev) => [...prev, created]);
        }
      } else {
        if (editTarget) {
          setStories((prev) => prev.map((s) => (s.id === editTarget.id ? { ...form, id: editTarget.id } : s)));
        } else {
          const newId = `S-${String(stories.length + 1).padStart(3, '0')}`;
          setStories((prev) => [...prev, { ...form, id: newId }]);
        }
      }
      setDialogOpen(false);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Save failed. Check the backend is running and try again.');
    }
  };

  const viewLabel = viewBy === 'sprint'
    ? `${selectedTeam?.name ?? ''} · ${selectedSprint?.name ?? ''}`
    : formatMonth(selectedMonth);

  return (
    <Box>
      {/* View toggle + selectors */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <ToggleButtonGroup
          value={viewBy}
          exclusive
          onChange={(_, v) => v && setViewBy(v)}
          size="small"
        >
          <ToggleButton value="sprint" sx={{ gap: 0.75, px: 2 }}>
            <SpeedIcon fontSize="small" /> Sprint
          </ToggleButton>
          <ToggleButton value="month" sx={{ gap: 0.75, px: 2 }}>
            <CalendarMonthIcon fontSize="small" /> Monthly
          </ToggleButton>
        </ToggleButtonGroup>

        {viewBy === 'sprint' ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Team selector */}
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Team</InputLabel>
              <Select
                value={selectedTeamId}
                label="Team"
                onChange={(e) => { setSelectedTeamId(e.target.value); setSelectedSprintId(''); }}
              >
                {teams.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sprint chips */}
            {teamSprints.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No sprints — add one in Teams</Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {teamSprints.map((sp) => {
                  const isActive = sp.id === resolvedSprintId;
                  return (
                    <Chip
                      key={sp.id}
                      label={`${sp.name}${sp.status === 'active' ? ' 🟢' : ''}`}
                      onClick={() => setSelectedSprintId(sp.id)}
                      color={isActive ? 'primary' : 'default'}
                      variant={isActive ? 'filled' : 'outlined'}
                      sx={{ fontWeight: isActive ? 700 : 400, cursor: 'pointer' }}
                    />
                  );
                })}
              </Stack>
            )}
          </Stack>
        ) : (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Select Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Select Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map((m) => (
                <MenuItem key={m} value={m}>{formatMonth(m)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          disabled={viewBy === 'sprint' && !resolvedSprintId}>
          Add Story
        </Button>
      </Stack>

      {teams.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No teams found. Go to <strong>Teams</strong> to create a team and add sprints first.
        </Alert>
      )}

      {/* Sprint goal banner */}
      {viewBy === 'sprint' && selectedSprint?.goal && (
        <Paper variant="outlined" sx={{ px: 2, py: 1.25, mb: 2, bgcolor: '#F8FAFC' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Sprint Goal:</strong> {selectedSprint.goal}
            <Chip
              label={`${selectedSprint.startDate} → ${selectedSprint.endDate}`}
              size="small"
              variant="outlined"
              sx={{ ml: 1.5 }}
            />
          </Typography>
        </Paper>
      )}

      {/* Summary bar */}
      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>{viewLabel}</Typography>
          <Typography variant="body2" color="text.secondary">
            — {baseFiltered.length} stories · {summary.total} pts
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Completion</Typography>
          <Typography variant="caption" fontWeight={700} color="success.main">{completionPct}%</Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={completionPct}
          sx={{ height: 8, borderRadius: 4, bgcolor: '#E2E8F0', mb: 2, '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: '#16a34a' } }}
        />

        <Grid container spacing={1.5}>
          {[
            { label: 'Done',           pts: summary.done,      count: summary.doneCount,    color: '#16a34a', bg: '#dcfce7', key: 'done'           as StoryStatus },
            { label: 'Review / Testing', pts: summary.forQE,    count: summary.forQECount,   color: '#0891b2', bg: '#e0f2fe', key: 'for_qe_testing' as StoryStatus },
            { label: 'In Progress',    pts: summary.inProgress, count: summary.inProgressCount, color: '#2563EB', bg: '#dbeafe', key: 'in_progress' as StoryStatus },
            { label: 'On Hold',        pts: summary.onHold,    count: summary.onHoldCount,  color: '#ea580c', bg: '#ffedd5', key: 'on_hold'        as StoryStatus },
          ].map((stat) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <Box
                sx={{
                  p: 1.5, borderRadius: 2, bgcolor: stat.bg, textAlign: 'center', cursor: 'pointer',
                  border: filterStatus === stat.key ? `2px solid ${stat.color}` : '2px solid transparent',
                }}
                onClick={() => setFilterStatus(filterStatus === stat.key ? 'all' : stat.key)}
              >
                <Typography variant="h6" fontWeight={800} sx={{ color: stat.color }}>{stat.pts}</Typography>
                <Typography variant="caption" fontWeight={600} sx={{ color: stat.color }}>{stat.label}</Typography>
                <Typography variant="caption" display="block" sx={{ color: stat.color, opacity: 0.75 }}>
                  {stat.count} {stat.count === 1 ? 'story' : 'stories'}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">All Statuses</MenuItem>
            {statusOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Assignee</InputLabel>
          <Select value={filterAssignee} label="Assignee" onChange={(e) => setFilterAssignee(e.target.value)}>
            <MenuItem value="all">All Assignees</MenuItem>
            {developers.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          Showing {filtered.length} of {baseFiltered.length} stories
        </Typography>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              {['ID', 'Title', 'Points', 'Status', 'Reporter', 'Assignee', 'Created', 'Due Date', 'Started', 'Completed', ''].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No stories found</Typography>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((story) => (
              <TableRow key={story.id} hover>
                <TableCell><Typography variant="caption" color="text.disabled" fontWeight={600}>{story.id}</Typography></TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" fontWeight={500}>{story.title}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{story.description}</Typography>
                </TableCell>
                <TableCell><Chip label={story.points} size="small" color="primary" variant="outlined" /></TableCell>
                <TableCell><Chip label={statusLabel(story.status)} size="small" color={statusColor(story.status)} /></TableCell>
                <TableCell><Typography variant="body2">{story.reporter}</Typography></TableCell>
                <TableCell><Typography variant="body2">{story.assignee}</Typography></TableCell>
                <TableCell><Typography variant="caption">{story.createdDate}</Typography></TableCell>
                <TableCell>
                  {story.dueDate ? (() => {
                    const today = new Date().toISOString().slice(0, 10);
                    const overdue = story.dueDate < today && !story.completedDate;
                    return (
                      <Typography variant="caption" sx={{ fontWeight: overdue ? 700 : 400, color: overdue ? '#dc2626' : 'text.secondary' }}>
                        {story.dueDate}
                      </Typography>
                    );
                  })() : <Typography variant="caption" color="text.disabled">—</Typography>}
                </TableCell>
                <TableCell><Typography variant="caption">{story.startedDate || '—'}</Typography></TableCell>
                <TableCell><Typography variant="caption">{story.completedDate || '—'}</Typography></TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(story)}><EditIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Story' : 'Add Story'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} fullWidth size="small" />
            <TextField label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} fullWidth size="small" multiline rows={2} />
            <Stack direction="row" spacing={2}>
              <TextField label="Story Points" type="number" value={form.points}
                onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))}
                size="small" sx={{ width: 130 }} inputProps={{ min: 1, max: 100 }} />
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.status} label="Status" onChange={(e) => {
                  const newStatus = e.target.value as StoryStatus;
                  setForm((f) => ({
                    ...f,
                    status: newStatus,
                    completedDate: newStatus === 'done'
                      ? (f.completedDate || today())
                      : f.completedDate,
                  }));
                }}>
                  {statusOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Team</InputLabel>
                <Select value={form.teamId} label="Team" onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value, sprintId: '' }))}>
                  {teams.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Sprint</InputLabel>
                <Select value={form.sprintId} label="Sprint" onChange={(e) => setForm((f) => ({ ...f, sprintId: e.target.value }))}>
                  {sprints.filter((s) => s.teamId === form.teamId).map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Reporter"
                value={form.reporter}
                onChange={(e) => setForm((f) => ({ ...f, reporter: e.target.value }))}
                size="small"
                fullWidth
                placeholder="Client or team member name"
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select value={form.assignee} label="Assignee" onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}>
                  {developers.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField label="Created Date" type="date" value={form.createdDate} onChange={(e) => setForm((f) => ({ ...f, createdDate: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} fullWidth />
                <TextField label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} fullWidth />
              </Stack>
              <TextField label="Started Date" type="date" value={form.startedDate} onChange={(e) => setForm((f) => ({ ...f, startedDate: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <TextField label="Completed Date" type="date" value={form.completedDate} onChange={(e) => setForm((f) => ({ ...f, completedDate: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} fullWidth />
          </Stack>
        </DialogContent>
        {saveError && (
          <Alert severity="error" sx={{ mx: 3, mb: 1 }}>{saveError}</Alert>
        )}
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title || !form.reporter || !form.assignee || !form.teamId || !form.sprintId}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

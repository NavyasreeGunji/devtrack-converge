import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import { DeveloperProfile, DeveloperRole, ProjectType } from '../data/mockData';
import { useApp } from '../context/AppContext';

const roleConfig: Record<DeveloperRole, { color: string; bg: string }> = {
  Developer: { color: '#2563EB', bg: '#dbeafe' },
  'QA Engineer': { color: '#7C3AED', bg: '#ede9fe' },
  DevOps: { color: '#16a34a', bg: '#dcfce7' },
  'Tech Lead': { color: '#d97706', bg: '#fef3c7' },
  Manager: { color: '#dc2626', bg: '#fee2e2' },
};

const roles: DeveloperRole[] = ['Developer', 'QA Engineer', 'DevOps', 'Tech Lead', 'Manager'];

const avatarColors = ['#2563EB', '#7C3AED', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#be185d'];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return avatarColors[hash % avatarColors.length];
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

const PROJECT_TYPES: ProjectType[] = ['Client', 'Internal'];
const ptColor: Record<ProjectType, { color: string; bg: string }> = {
  Client:   { color: '#0891b2', bg: '#e0f2fe' },
  Internal: { color: '#7C3AED', bg: '#ede9fe' },
};

const emptyForm = { name: '', email: '', role: 'Developer' as DeveloperRole, teamIds: [] as string[], projectTypes: [] as ProjectType[] };

export default function PeoplePage() {
  const { teams, developerProfiles, addDeveloper, updateDeveloper } = useApp();
  const [filterRole, setFilterRole] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DeveloperProfile | null>(null);
  const [form, setForm] = useState(emptyForm);

  const displayed = developerProfiles
    .filter((d) => filterRole === 'all' || d.role === filterRole)
    .filter((d) => filterTeam === 'all' || d.teamIds.includes(filterTeam))
    .sort((a, b) => Number(a.id.replace('DEV-', '')) - Number(b.id.replace('DEV-', '')));

  const openAdd = () => { setForm(emptyForm); setEditTarget(null); setDialogOpen(true); };
  const openEdit = (d: DeveloperProfile) => {
    setForm({ name: d.name, email: d.email, role: d.role, teamIds: [...d.teamIds], projectTypes: [...(d.projectTypes ?? [])] });
    setEditTarget(d);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editTarget) {
      await updateDeveloper({ ...editTarget, ...form });
    } else {
      const newId = `DEV-${String(developerProfiles.length + 1).padStart(3, '0')}`;
      const username = form.name.split(' ')[0].toLowerCase();
      await addDeveloper({ id: newId, ...form, username, password: 'Converge@2026' });
    }
    setDialogOpen(false);
  };

  const toggleTeam = (teamId: string) => {
    setForm((f) => ({
      ...f,
      teamIds: f.teamIds.includes(teamId)
        ? f.teamIds.filter((t) => t !== teamId)
        : [...f.teamIds, teamId],
    }));
  };

  const toggleProjectType = (pt: ProjectType) => {
    setForm((f) => ({
      ...f,
      projectTypes: f.projectTypes.includes(pt)
        ? f.projectTypes.filter((p) => p !== pt)
        : [...f.projectTypes, pt],
    }));
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap" useFlexGap>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select value={filterRole} label="Role" onChange={(e) => setFilterRole(e.target.value)}>
            <MenuItem value="all">All Roles</MenuItem>
            {roles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Team</InputLabel>
          <Select value={filterTeam} label="Team" onChange={(e) => setFilterTeam(e.target.value)}>
            <MenuItem value="all">All Teams</MenuItem>
            {teams.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          {displayed.length} {displayed.length === 1 ? 'person' : 'people'}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add Developer
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {displayed.map((dev) => {
          const rc = roleConfig[dev.role];
          const color = getAvatarColor(dev.name);
          const devTeams = teams.filter((t) => dev.teamIds.includes(t.id));
          return (
            <Grid item xs={12} sm={6} md={4} key={dev.id}>
              <Paper
                sx={{
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  position: 'relative',
                  '&:hover .edit-btn': { opacity: 1 },
                }}
              >
                <Tooltip title="Edit">
                  <IconButton
                    className="edit-btn"
                    size="small"
                    onClick={() => openEdit(dev)}
                    sx={{ position: 'absolute', top: 12, right: 12, opacity: 0, transition: 'opacity 0.15s' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 52, height: 52, bgcolor: color, fontSize: 18, fontWeight: 700 }}>
                    {initials(dev.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                      {dev.name}
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label={dev.role}
                  size="small"
                  sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 700, alignSelf: 'flex-start' }}
                />

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <EmailIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {dev.email}
                  </Typography>
                </Stack>

                {(dev.projectTypes ?? []).length > 0 && (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {(dev.projectTypes ?? []).map((pt) => (
                      <Chip key={pt} label={pt} size="small"
                        sx={{ bgcolor: ptColor[pt].bg, color: ptColor[pt].color, fontWeight: 600, fontSize: 11 }} />
                    ))}
                  </Stack>
                )}

                {devTeams.length > 0 && (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {devTeams.map((t) => (
                      <Chip key={t.id} label={t.name} size="small" variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Developer' : 'Add Developer'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth size="small"
              placeholder="e.g. John Smith"
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              fullWidth size="small"
              placeholder="john@company.com"
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                label="Role"
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as DeveloperRole }))}
              >
                {roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: roleConfig[r].color }} />
                      <span>{r}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Project Type <Typography component="span" variant="caption" color="text.secondary">(select all that apply)</Typography>
              </Typography>
              <Stack direction="row" spacing={1}>
                {PROJECT_TYPES.map((pt) => {
                  const selected = form.projectTypes.includes(pt);
                  return (
                    <Chip
                      key={pt}
                      label={pt}
                      onClick={() => toggleProjectType(pt)}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        bgcolor: selected ? ptColor[pt].bg : undefined,
                        color: selected ? ptColor[pt].color : undefined,
                        borderColor: selected ? ptColor[pt].color : undefined,
                      }}
                      variant={selected ? 'filled' : 'outlined'}
                    />
                  );
                })}
              </Stack>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Teams
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {teams.map((t) => (
                  <Chip
                    key={t.id}
                    label={t.name}
                    onClick={() => toggleTeam(t.id)}
                    color={form.teamIds.includes(t.id) ? 'primary' : 'default'}
                    variant={form.teamIds.includes(t.id) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.name || !form.email}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

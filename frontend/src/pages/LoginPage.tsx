import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Alert,
  LinearProgress, Collapse,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login, backendWaking, backendOnline, backendChecked } = useApp();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!backendWaking) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [backendWaking]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (e: any) {
      setError(e.message ?? 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Typography variant="h5" fontWeight={800} color="#1e293b" letterSpacing={0.5}>
            DevTrack
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Converge Engineering Portal
          </Typography>
        </Box>

        <Typography variant="subtitle1" fontWeight={600} color="#1e293b" sx={{ mb: 2.5 }}>
          Sign in to your account
        </Typography>

        <Collapse in={backendWaking}>
          <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden', border: '1px solid #bfdbfe', bgcolor: '#eff6ff' }}>
            <LinearProgress sx={{ height: 3 }} />
            <Box sx={{ px: 1.5, py: 1 }}>
              <Typography variant="caption" color="#1d4ed8" fontWeight={600}>
                Server is starting up… ({elapsed}s)
              </Typography>
              <Typography variant="caption" color="#3b82f6" display="block" sx={{ mt: 0.25 }}>
                This takes up to 60 seconds on first load. You can sign in once it's ready.
              </Typography>
            </Box>
          </Box>
        </Collapse>

        <Collapse in={backendChecked && !backendOnline}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Server unreachable — using offline mode. Your changes won't be saved.
          </Alert>
        </Collapse>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleLogin}
          disabled={!username || !password || loading || backendWaking}
          sx={{ fontWeight: 700 }}
        >
          {backendWaking ? `Server starting… (${elapsed}s)` : loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </Paper>
    </Box>
  );
}

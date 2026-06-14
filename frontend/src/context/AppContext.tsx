import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Team, Sprint, DeveloperProfile,
  initialTeams, initialSprints, initialDeveloperProfiles,
} from '../data/mockData';
import {
  apiLogin, apiGetDevelopers, apiCreateDeveloper, apiUpdateDeveloper,
  apiGetTeams, apiCreateTeam, apiUpdateTeam,
  apiGetSprints, apiCreateSprint, apiUpdateSprint,
} from '../api/api';

const STORAGE_KEY = 'devtrack_user';

interface AppContextType {
  teams: Team[];
  sprints: Sprint[];
  developerProfiles: DeveloperProfile[];
  currentUser: DeveloperProfile | null;
  backendOnline: boolean;
  backendChecked: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  addSprint: (sprint: Omit<Sprint, 'id'>) => Promise<void>;
  updateSprint: (sprint: Sprint) => Promise<void>;
  addDeveloper: (dev: DeveloperProfile) => Promise<void>;
  updateDeveloper: (dev: DeveloperProfile) => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

function loadUser(): DeveloperProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [developerProfiles, setDeveloperProfiles] = useState<DeveloperProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<DeveloperProfile | null>(loadUser);
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendChecked, setBackendChecked] = useState(false);

  // Probe backend; if it responds use API data, otherwise fall back to mock data
  useEffect(() => {
    Promise.all([apiGetTeams(), apiGetSprints(), apiGetDevelopers()])
      .then(([t, s, d]) => {
        setTeams(t);
        setSprints(s);
        setDeveloperProfiles(d);
        setBackendOnline(true);
        setBackendChecked(true);
      })
      .catch(() => {
        setTeams(initialTeams);
        setSprints(initialSprints);
        setDeveloperProfiles(initialDeveloperProfiles);
        setBackendOnline(false);
        setBackendChecked(true);
      });
  }, []);

  const login = async (username: string, password: string) => {
    if (backendOnline) {
      const dev = await apiLogin(username, password);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dev));
      setCurrentUser(dev);
    } else {
      // Fallback: validate against local mock data
      const match = developerProfiles.find(
        (d) => d.username === username.trim().toLowerCase() && d.password === password
      );
      if (!match) throw new Error('Invalid username or password');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
      setCurrentUser(match);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  };

  const addTeam = async (team: Omit<Team, 'id'>) => {
    if (backendOnline) {
      const created = await apiCreateTeam(team);
      setTeams((prev) => [...prev, created]);
    } else {
      const newId = `T-${String(teams.length + 1).padStart(3, '0')}`;
      setTeams((prev) => [...prev, { ...team, id: newId }]);
    }
  };

  const updateTeam = async (team: Team) => {
    if (backendOnline) {
      const updated = await apiUpdateTeam(team.id, team);
      setTeams((prev) => prev.map((t) => (t.id === team.id ? updated : t)));
    } else {
      setTeams((prev) => prev.map((t) => (t.id === team.id ? team : t)));
    }
  };

  const addSprint = async (sprint: Omit<Sprint, 'id'>) => {
    if (backendOnline) {
      const created = await apiCreateSprint(sprint);
      setSprints((prev) => [...prev, created]);
    } else {
      const newId = `SP-${String(sprints.length + 1).padStart(3, '0')}`;
      setSprints((prev) => [...prev, { ...sprint, id: newId }]);
    }
  };

  const updateSprint = async (sprint: Sprint) => {
    if (backendOnline) {
      const updated = await apiUpdateSprint(sprint.id, sprint);
      setSprints((prev) => prev.map((s) => (s.id === sprint.id ? updated : s)));
    } else {
      setSprints((prev) => prev.map((s) => (s.id === sprint.id ? sprint : s)));
    }
  };

  const addDeveloper = async (dev: DeveloperProfile) => {
    if (backendOnline) {
      const created = await apiCreateDeveloper(dev);
      setDeveloperProfiles((prev) => [...prev, created]);
    } else {
      setDeveloperProfiles((prev) => [...prev, dev]);
    }
  };

  const updateDeveloper = async (dev: DeveloperProfile) => {
    if (backendOnline) {
      const updated = await apiUpdateDeveloper(dev.id, dev);
      setDeveloperProfiles((prev) => prev.map((d) => (d.id === dev.id ? updated : d)));
    } else {
      setDeveloperProfiles((prev) => prev.map((d) => (d.id === dev.id ? dev : d)));
    }
  };

  return (
    <AppContext.Provider value={{
      teams, sprints, developerProfiles, currentUser, backendOnline, backendChecked,
      login, logout, addTeam, updateTeam, addSprint, updateSprint,
      addDeveloper, updateDeveloper,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

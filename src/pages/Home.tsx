import { useQueryClient } from '@tanstack/react-query';
import { useAppData } from '@/lib/data';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { SettingsPanel } from '@/components/SettingsPanel';
import { SessionHistory } from '@/components/SessionHistory';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { Button } from '@/lib/ui/Button';

export interface PomodoroSettings {
  id: string;
  work_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  sessions_before_long_break: number;
}

export interface PomodoroSession {
  id: string;
  session_type: 'work' | 'short_break' | 'long_break';
  duration_seconds: number;
  completed_at: string;
  was_completed: boolean;
}

const SETTINGS_KEY = 'pomodoro-settings';
const SESSIONS_KEY = 'pomodoro-sessions';

function todayIso(offsetDays = 0, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const mockSettings: PomodoroSettings = {
  id: 'settings-1',
  work_minutes: 25,
  short_break_minutes: 5,
  long_break_minutes: 15,
  sessions_before_long_break: 4,
};

const mockSessions: PomodoroSession[] = [
  { id: 's1', session_type: 'work', duration_seconds: 1500, completed_at: todayIso(0, 9, 5), was_completed: true },
  { id: 's2', session_type: 'short_break', duration_seconds: 300, completed_at: todayIso(0, 9, 32), was_completed: true },
  { id: 's3', session_type: 'work', duration_seconds: 1500, completed_at: todayIso(0, 9, 58), was_completed: true },
  { id: 's4', session_type: 'short_break', duration_seconds: 300, completed_at: todayIso(0, 10, 25), was_completed: true },
  { id: 's5', session_type: 'work', duration_seconds: 1500, completed_at: todayIso(0, 10, 52), was_completed: true },
  { id: 's6', session_type: 'work', duration_seconds: 900, completed_at: todayIso(-1, 16, 10), was_completed: false },
  { id: 's7', session_type: 'work', duration_seconds: 1500, completed_at: todayIso(-1, 11, 15), was_completed: true },
  { id: 's8', session_type: 'long_break', duration_seconds: 900, completed_at: todayIso(-1, 11, 42), was_completed: true },
];

export function Home({ showSettings, onCloseSettings }: { showSettings: boolean; onCloseSettings: () => void }) {
  const qc = useQueryClient();

  const settingsQuery = useAppData<PomodoroSettings>({
    key: SETTINGS_KEY,
    mock: mockSettings,
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  const sessionsQuery = useAppData<PomodoroSession[]>({
    key: SESSIONS_KEY,
    mock: mockSessions,
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  function saveSettings(next: PomodoroSettings) {
    qc.setQueryData([SETTINGS_KEY], next);
  }

  function logSession(session: PomodoroSession) {
    qc.setQueryData([SESSIONS_KEY], (prev: PomodoroSession[] | undefined) => [session, ...(prev ?? [])]);
  }

  if (settingsQuery.isLoading || sessionsQuery.isLoading) {
    return <CenteredSpinner label="Loading your timer" />;
  }

  if (settingsQuery.error || sessionsQuery.error) {
    const message = (settingsQuery.error as Error)?.message ?? (sessionsQuery.error as Error)?.message ?? 'Unknown error';
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn't load your data</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{message}</p>
          <Button size="sm" onClick={() => { settingsQuery.refetch(); sessionsQuery.refetch(); }}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const settings = settingsQuery.data ?? mockSettings;
  const sessions = sessionsQuery.data ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PomodoroTimer settings={settings} onLogSession={logSession} />
      {showSettings && (
        <SettingsPanel settings={settings} onSave={(next) => { saveSettings(next); onCloseSettings(); }} onCancel={onCloseSettings} />
      )}
      <SessionHistory sessions={sessions} />
    </div>
  );
}

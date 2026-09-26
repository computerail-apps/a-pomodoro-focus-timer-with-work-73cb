import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
import { Play, Pause, RotateCcw, SkipForward, Flame } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PomodoroSettings, PomodoroSession } from '@/pages/Home';

type Phase = 'work' | 'short_break' | 'long_break';

const phaseMeta: Record<Phase, { label: string; badge: 'default' | 'success' | 'warning' }> = {
  work: { label: 'Focus', badge: 'default' },
  short_break: { label: 'Short Break', badge: 'success' },
  long_break: { label: 'Long Break', badge: 'warning' },
};

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function todayCount(sessions: PomodoroSession[]): number {
  const now = new Date();
  return sessions.filter((s) => {
    if (s.session_type !== 'work' || !s.was_completed) return false;
    const d = new Date(s.completed_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length;
}

export function PomodoroTimer({
  settings,
  onLogSession,
}: {
  settings: PomodoroSettings;
  onLogSession: (session: PomodoroSession) => void;
}) {
  const durations: Record<Phase, number> = useMemo(
    () => ({
      work: settings.work_minutes * 60,
      short_break: settings.short_break_minutes * 60,
      long_break: settings.long_break_minutes * 60,
    }),
    [settings]
  );

  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(durations.work);
  const [isRunning, setIsRunning] = useState(false);
  const [workCompletedInCycle, setWorkCompletedInCycle] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(durations[phase]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durations, phase]);

  const advancePhase = useCallback(
    (completedFully: boolean) => {
      const finishedPhase = phase;
      const finishedDuration = durations[phase] - (completedFully ? 0 : secondsLeft);
      onLogSession({
        id: `local-${Date.now()}`,
        session_type: finishedPhase,
        duration_seconds: completedFully ? durations[phase] : Math.max(0, durations[phase] - secondsLeft),
        completed_at: new Date().toISOString(),
        was_completed: completedFully,
      });

      if (finishedPhase === 'work') {
        const nextCycleCount = workCompletedInCycle + 1;
        setSessionCount((c) => c + 1);
        if (nextCycleCount >= settings.sessions_before_long_break) {
          setWorkCompletedInCycle(0);
          setPhase('long_break');
        } else {
          setWorkCompletedInCycle(nextCycleCount);
          setPhase('short_break');
        }
      } else {
        setPhase('work');
      }
      setIsRunning(false);
    },
    [phase, durations, secondsLeft, workCompletedInCycle, settings.sessions_before_long_break, onLogSession]
  );

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            window.clearInterval(intervalRef.current ?? undefined);
            advancePhase(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const total = durations[phase] || 1;
  const progress = 1 - secondsLeft / total;
  const meta = phaseMeta[phase];

  function handleStartPause() {
    setIsRunning((r) => !r);
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(durations[phase]);
  }

  function handleSkip() {
    advancePhase(false);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="items-center text-center">
        <Badge variant={meta.badge}>{meta.label}</Badge>
        <CardTitle className="sr-only">Pomodoro Timer</CardTitle>
        <CardDescription>
          {phase === 'work' ? 'Stay focused until the timer runs out.' : 'Step away and recharge.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 pb-10">
        <div className="relative flex h-64 w-64 items-center justify-center md:h-72 md:w-72">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
              className={cn('transition-all duration-1000 ease-linear', phase === 'work' ? 'text-primary' : 'text-success')}
            />
          </svg>
          <div className="text-display tabular-nums">{formatTime(secondsLeft)}</div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={handleStartPause} className="min-w-32">
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button size="lg" variant="secondary" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </Button>
          <Button size="lg" variant="ghost" onClick={handleSkip}>
            <SkipForward size={16} />
            Skip
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
          <Flame size={16} className="text-primary" />
          <span className="text-small text-muted-foreground">
            <span className="tabular-nums text-foreground">{sessionCount}</span> sessions completed this visit
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export { todayCount };

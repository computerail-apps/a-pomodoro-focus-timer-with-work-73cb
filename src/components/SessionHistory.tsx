import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { EmptyState } from '@/lib/ui/EmptyState';
import { History, CheckCircle2, XCircle } from 'lucide-react';
import type { PomodoroSession } from '@/pages/Home';

const typeMeta: Record<PomodoroSession['session_type'], { label: string; variant: 'default' | 'success' | 'warning' }> = {
  work: { label: 'Focus', variant: 'default' },
  short_break: { label: 'Short Break', variant: 'success' },
  long_break: { label: 'Long Break', variant: 'warning' },
};

function relTime(iso: string): string {
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function todayCompletedWork(sessions: PomodoroSession[]): number {
  const now = new Date();
  return sessions.filter((s) => {
    if (s.session_type !== 'work' || !s.was_completed) return false;
    const d = new Date(s.completed_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length;
}

export function SessionHistory({ sessions }: { sessions: PomodoroSession[] }) {
  const todayTotal = todayCompletedWork(sessions);
  const recent = sessions.slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="inline-flex items-center gap-2">
            <History size={18} />
            History
          </CardTitle>
          <CardDescription>Your recent sessions, logged automatically.</CardDescription>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-h2 tabular-nums text-foreground">{todayTotal}</span>
          <span className="text-micro text-muted-foreground">focus sessions today</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recent.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState
              icon={<History size={20} />}
              title="No sessions yet"
              description="Complete a focus session to start building your history."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-6 py-3">
                <Badge variant={typeMeta[s.session_type].variant}>{typeMeta[s.session_type].label}</Badge>
                <span className="text-small tabular-nums text-muted-foreground">
                  {Math.round(s.duration_seconds / 60)} min
                </span>
                {s.was_completed ? (
                  <CheckCircle2 size={14} className="text-success" />
                ) : (
                  <XCircle size={14} className="text-destructive" />
                )}
                <span className="ml-auto text-small text-muted-foreground">{relTime(s.completed_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

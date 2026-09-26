import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/lib/ui/Card';
import { Input } from '@/lib/ui/Input';
import { Button } from '@/lib/ui/Button';
import { Settings as SettingsIcon } from 'lucide-react';
import type { PomodoroSettings } from '@/pages/Home';

export function SettingsPanel({
  settings,
  onSave,
  onCancel,
}: {
  settings: PomodoroSettings;
  onSave: (next: PomodoroSettings) => void;
  onCancel: () => void;
}) {
  const [workMinutes, setWorkMinutes] = useState(settings.work_minutes);
  const [shortBreak, setShortBreak] = useState(settings.short_break_minutes);
  const [longBreak, setLongBreak] = useState(settings.long_break_minutes);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(settings.sessions_before_long_break);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...settings,
      work_minutes: Math.max(1, workMinutes),
      short_break_minutes: Math.max(1, shortBreak),
      long_break_minutes: Math.max(1, longBreak),
      sessions_before_long_break: Math.max(1, sessionsBeforeLong),
    });
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <SettingsIcon size={18} />
          Timer settings
        </CardTitle>
        <CardDescription>Adjust durations to fit your rhythm. Saved for future sessions.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-small text-muted-foreground">Work minutes</span>
            <Input
              type="number"
              min={1}
              max={180}
              value={workMinutes}
              onChange={(e) => setWorkMinutes(Number(e.target.value))}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-small text-muted-foreground">Short break minutes</span>
            <Input
              type="number"
              min={1}
              max={60}
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-small text-muted-foreground">Long break minutes</span>
            <Input
              type="number"
              min={1}
              max={90}
              value={longBreak}
              onChange={(e) => setLongBreak(Number(e.target.value))}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-small text-muted-foreground">Sessions before long break</span>
            <Input
              type="number"
              min={1}
              max={12}
              value={sessionsBeforeLong}
              onChange={(e) => setSessionsBeforeLong(Number(e.target.value))}
            />
          </label>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save settings</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

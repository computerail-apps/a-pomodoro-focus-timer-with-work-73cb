import { Nav, NavLink } from '@/lib/ui/Nav';
import { Container } from '@/lib/ui/Container';
import { Timer as TimerIcon, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { Home } from '@/pages/Home';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen">
      <Nav
        brand={
          <span className="inline-flex items-center gap-2">
            <TimerIcon size={20} className="text-primary" />
            Tomatino
          </span>
        }
        actions={
          <NavLink href="#" active={showSettings} onClick={() => setShowSettings((s) => !s)}>
            <SettingsIcon size={14} className="mr-2" />
            Settings
          </NavLink>
        }
      />
      <main className="py-8 md:py-12">
        <Container>
          <Home showSettings={showSettings} onCloseSettings={() => setShowSettings(false)} />
        </Container>
      </main>
    </div>
  );
}

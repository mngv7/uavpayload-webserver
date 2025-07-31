import { useState } from 'react';
import '../assets/Navbar.css';
import Settings from './Settings';

export function Navbar() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <nav className="navbar">
        <a href="/">Dashboard</a>
        <a href="/live-feed">Live Feed</a>
        <a href="/logs">Logs</a>
        <button onClick={() => setShowSettings(!showSettings)}>Settings</button>
      </nav>

      {showSettings && (
        <div className="settings-popup">
          <Settings />
        </div>
      )}
    </>
  );
}

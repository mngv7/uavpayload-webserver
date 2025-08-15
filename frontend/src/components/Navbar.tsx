import { useState } from 'react';
import '../assets/Navbar.css';
import Settings from './Settings';

import { FaTachometerAlt, FaVideo, FaListAlt, FaCog } from 'react-icons/fa';

export function Navbar() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <a className="brand" href="/">
            UAV Payload
          </a>
          <div className="nav-links">
            <a href="/">
              <FaTachometerAlt style={{ marginRight: 6 }} /> Dashboard
            </a>
            <a href="/live-feed">
              <FaVideo style={{ marginRight: 6 }} /> Live Feed
            </a>
            <a href="/logs">
              <FaListAlt style={{ marginRight: 6 }} /> Logs
            </a>
            <button onClick={() => setShowSettings(!showSettings)}>
              <FaCog style={{ marginRight: 6 }} /> Settings
            </button>
          </div>
        </div>
      </nav>

      {showSettings && (
        <div className="settings-popup">
          <Settings />
        </div>
      )}
    </>
  );
}

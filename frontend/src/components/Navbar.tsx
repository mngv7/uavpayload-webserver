import { useState } from 'react';
import '../assets/Navbar.css';
import Settings from './Settings';

import {
  FaTachometerAlt, FaVideo, FaListAlt, FaCog
} from 'react-icons/fa';
// FaFlask, FaThermometerHalf, FaTint, FaMapMarkerAlt, FaQrcode, FaDrill, FaDrone,

export function Navbar() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <nav className="navbar">
        <a href="/"><FaTachometerAlt />   Dashboard</a>
        <a href="/live-feed"><FaVideo />   Live Feed</a>
        <a href="/logs"><FaListAlt />   Logs</a>
        <button onClick={() => setShowSettings(!showSettings)}><FaCog />   Settings</button>
      </nav>

      {showSettings && (
        <div className="settings-popup">
          <Settings />
        </div>
      )}
    </>
  );
}

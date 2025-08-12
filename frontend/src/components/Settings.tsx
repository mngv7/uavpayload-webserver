import { useState } from 'react'
import '../assets/Settings.css'
import ConnectionStatus from './ConnectionStatus';
import { connectToWebsocket } from '../services/api';

function Settings() {
    const [serverAddress, setServerAddress] = useState('');
    const [socketNumber, setsocketNumber] = useState('');
    const [connectedAddress, setConnectedAddress] = useState('');
    const [connectedSocket, setConnectedSocket] = useState('');
    const [connectionStatus, setConnectionStatus] = useState(false);

    const handleConnect = async () => {
        try {
            const data = await connectToWebsocket({ serverAddress, socketNumber });
            if (data.message === 'WebSocket connection started.') {
                setConnectionStatus(true);
                setConnectedAddress(serverAddress);
                setConnectedSocket(socketNumber);
            } else {
                setConnectionStatus(false);
            }
            setServerAddress('');
            setsocketNumber('');
        } catch (error) {
            console.error('Error connecting to backend:', error);
        }
    };

    return (
        <>
            <ConnectionStatus connectionStatus={connectionStatus} ipAddress={connectedAddress} socketNumber={connectedSocket}/>
            <div className="form-row">
                <input type="text" id="server-address" value={serverAddress} placeholder="Server Address" onChange={(e) => setServerAddress(e.target.value)}/>
                <input type="text" id="socket-number" value={socketNumber} placeholder="Socket" onChange={(e) => {setsocketNumber(e.target.value)}}/>
                <button id="connect-button" onClick={handleConnect}>Connect</button>
            </div>
        </>
    )
}

export default Settings;
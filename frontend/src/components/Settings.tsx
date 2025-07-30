import { useState } from 'react'
import '../assets/Settings.css'

export function Settings() {
    const [serverAddress, setServerAddress] = useState('');
    const [socketNumber, setsocketNumber] = useState('');

    const handleConnect = async () => {
        try {
        const response = await fetch('http://localhost:5000/connect', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            serverAddress,
            socketNumber
            })
        });
        const data = await response.json();
        console.log('Response from backend:', data);
        } catch (error) {
        console.error('Error connecting to backend:', error);
        }
    };

    return (
        <>
            <div className="form-row">
                <input type="text" id="server-address" placeholder="Server Address" onChange={(e) => setServerAddress(e.target.value)}/>
                <input type="text" id="socket-number" placeholder="Socket" onChange={(e) => {setsocketNumber(e.target.value)}}/>
                <button id="connect-button" onClick={handleConnect}>Connect</button>
            </div>
        </>
    )
}
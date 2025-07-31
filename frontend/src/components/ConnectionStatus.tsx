
interface ConnectionStatusProps {
    connectionStatus: boolean;
    ipAddress: string;
    socketNumber: string;
}

function ConnectionStatus({ connectionStatus, ipAddress, socketNumber }: ConnectionStatusProps) {
    if (connectionStatus) {
        return (
            <p>Connected to {ipAddress}:{socketNumber}</p>
        )
    } else {
        return (
            <p>Disconnected</p>
        )
    }
}

export default ConnectionStatus
import '../assets/Settings.css'

export function Settings() {
    return (
        <>
            <div className="form-row">
                <input type="text" id="server-address" placeholder="Server Address"></input>
                <input type="text" id="socket-number" placeholder="Socket"></input>
                <button id="connect-button">Connect</button>
            </div>
        </>
    )
}
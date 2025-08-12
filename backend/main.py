import os
import sys
import signal
import subprocess
import threading
from pathlib import Path


def _stream_output(proc: subprocess.Popen, name: str):
    """Read a process' stdout and stderr and print with a prefix."""
    def reader(stream, prefix):
        for line in iter(stream.readline, ""):
            print(f"[{prefix}] {line}", end="", flush=True)
    t_out = threading.Thread(target=reader, args=(proc.stdout, name), daemon=True)
    t_err = threading.Thread(target=reader, args=(proc.stderr, f"{name}:ERR"), daemon=True)
    t_out.start(); t_err.start()
    return t_out, t_err


def main():
    here = Path(__file__).resolve().parent
    py = sys.executable or "python3"

    procs = {}
    threads = []

    # Load .env from repo root (and backend) if present
    def load_dotenv_like(path: Path):
        if not path.exists():
            return
        try:
            for raw in path.read_text().splitlines():
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                # Do not override if already set
                if key and key not in os.environ:
                    os.environ[key] = val
        except Exception as e:
            print(f"[main] Warning: failed to load {path}: {e}")

    repo_root = here.parent
    load_dotenv_like(repo_root / ".env")
    load_dotenv_like(here / ".env")

    def launch(script: str, tag: str):
        p = subprocess.Popen(
            [py, "-u", str(here / script)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        procs[tag] = p
        threads.extend(_stream_output(p, tag))

    # Launch both services
    launch("sensor_rcv.py", "sensors")
    launch("stream_rcv.py", "video")

    # Graceful shutdown handling
    shutting_down = threading.Event()

    def terminate_all():
        if shutting_down.is_set():
            return
        shutting_down.set()
        for tag, p in procs.items():
            if p.poll() is None:
                try:
                    print(f"[main] Terminating {tag} (pid {p.pid})", flush=True)
                    p.terminate()
                except Exception:
                    pass
        # Give them a moment, then kill if needed
        for tag, p in procs.items():
            try:
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                try:
                    print(f"[main] Killing {tag} (pid {p.pid})", flush=True)
                    p.kill()
                except Exception:
                    pass

    def on_signal(signum, frame):
        print(f"[main] Caught signal {signum}, shutting down...", flush=True)
        terminate_all()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            signal.signal(sig, on_signal)
        except Exception:
            pass

    # Monitor children; if any exits, shut down the rest
    exit_code = 0
    try:
        while True:
            any_running = False
            for tag, p in list(procs.items()):
                rc = p.poll()
                if rc is None:
                    any_running = True
                    continue
                # A child exited; adopt its code if non-zero
                print(f"[main] Process '{tag}' exited with code {rc}", flush=True)
                if rc and exit_code == 0:
                    exit_code = rc
            if not any_running:
                break
            # If one died, start shutdown of others
            if any(p.poll() is not None for p in procs.values()) and not shutting_down.is_set():
                terminate_all()
            # Small sleep without importing time by waiting on a pipe
            try:
                # Wait a bit by reading nothing; or simply join one thread briefly
                threads[0].join(0.1)
            except Exception:
                pass
    finally:
        terminate_all()

    sys.exit(exit_code)


if __name__ == "__main__":
    main()

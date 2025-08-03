import socket
import sys
import json

HOST = '192.168.86.46'
PORT = 5001

class Buffer:
    def __init__(self, sock):
        self.sock = sock
        self.buffer = b''
    def get_line(self):
        while b'\r\n' not in self.buffer:
            data = self.sock.recv(1024)
            if not data:
                return None
            self.buffer += data
        line, sep, self.buffer = self.buffer.partition(b'\r\n')
        return line.decode('utf-8')
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))
while True:
    b = Buffer(s)
    while True:
        line = b.get_line()
        if line is None:
            break
        print(line)
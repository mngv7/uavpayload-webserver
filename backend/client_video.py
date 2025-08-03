import socket
import sys
import cv2
import numpy as np
import struct
import pickle

HOST = '192.168.86.46'
PORT = 5000

data = b''
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))
payload_size = struct.calcsize("Q")
while True:
    while len(data) < payload_size:
        packet = s.recv(4096)
        data += packet
    packed_msg_size = data[:payload_size]
    data = data[payload_size:]
    msg_size = struct.unpack("Q", packed_msg_size)[0]
    while len(data) < msg_size:
        data += s.recv(4096)
    frame_data = data[:msg_size]
    data = data[msg_size:]
    frame = pickle.loads(frame_data)
    cv2.imshow("Received Frame", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

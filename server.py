"""
Game server
"""

import socket
import json

RECV_BUFFER = 1024


class UnoServer(object):
    """
    Game server
    """

    def __init__(self):
        self.sock = None
        self.players = []
        self.num_players = 0
        # TODO: generate deck

    def create_socket(self, port):
        """
        Open a socket
        """
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind(('', port))
        self.sock.listen(5)

    def accept_players(self, num_players):
        """
        Wait for num_players connections
        """
        self.num_players = num_players
        while len(self.players) < self.num_players:
            sock, _ = self.sock.accept()
            player = json.loads(self.sock.recv(RECV_BUFFER).decode())
            player['socket'] = sock
            self.players.append(player)

    def run_game(self):
        """
        Run game until someone wins
        """
        pass

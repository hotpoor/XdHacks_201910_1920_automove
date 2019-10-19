# -*- coding: utf-8 -*-
import sys
import os
import os.path
import uuid
import time
import random
import string
import hashlib
import urllib
import copy
from functools import partial
import logging
import datetime

import tornado
import tornado.web
import tornado.escape
import tornado.websocket
import tornado.httpclient
import tornado.gen
from tornado.escape import json_encode, json_decode

# from user_agents import parse as uaparse #早年KJ用来判断设备使用

# import nomagic
# from nomagic.cache import get_user, get_users, update_user, get_doc, get_docs, update_doc, get_aim, get_aims, update_aim, get_entity, get_entities, update_entity
# from nomagic.cache import BIG_CACHE
# from setting import settings
# from setting import conn

from base import WebRequest
from base import WebSocket
class DataWebSocket(WebSocket):
    clients = set()
    h_clients = {}
    free_room_ids = ["HACKATHON","TAGWORDS","VIDEODEMO","MAGICCRYSTAL","AGORAIO"]
    @staticmethod
    def join_more_rooms(self, message):
        info = json_decode(message)
        if len(info) == 4:
            if info[0] == "JOINMOREROOMS":
                for aim_id in info[3]:
                    if not (aim_id in DataWebSocket.free_room_ids):
                        return
                    h_clients_base = set()
                    h_clients_now = DataWebSocket.h_clients.get(aim_id,[])
                    h_clients_base = h_clients_base | set(h_clients_now)
                    h_clients_base.add(self)
                    DataWebSocket.h_clients[aim_id] = h_clients_base
                self.aim_ids = self.aim_ids | set(info[3])

    @staticmethod
    def send_to_all(message):
        info = json_decode(message)
        if len(info) == 3:
            for c in DataWebSocket.h_clients.get(info[2],[]):
                c.write_message(message)

    def open(self):
        self.aim_id = self.get_argument("aim_id","")
        # if not self.current_user:
        #     return
        self.aim_ids = set([self.aim_id])
        h_clients_base = set()
        h_clients_now = DataWebSocket.h_clients.get(self.aim_id,[])
        h_clients_base = h_clients_base | set(h_clients_now)
        h_clients_base.add(self)
        DataWebSocket.h_clients[self.aim_id] = h_clients_base
        DataWebSocket.clients.add(self)
    def on_message(self, message):
        message_check = json_decode(message)
        print message_check
        if len(message_check) == 4:
            DataWebSocket.join_more_rooms(self, message)

    def on_close(self):
        for aim_id in self.aim_ids:
            h_clients_base = set()
            h_clients_now = DataWebSocket.h_clients.get(aim_id,[])
            h_clients_base = h_clients_base | set(h_clients_now)
            h_clients_base.remove(self)
            if len(h_clients_base) == 0:
                DataWebSocket.h_clients.pop(aim_id)
            else:
                DataWebSocket.h_clients[aim_id] = h_clients_base
            msg = ["LEAVE",{"content":str(id(self)) + 'has left room:'+aim_id},aim_id]
            msg = json_encode(msg);
            DataWebSocket.send_to_all(msg)
        DataWebSocket.clients.remove(self)






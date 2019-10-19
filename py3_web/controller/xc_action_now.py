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

import serial #导入模块
def action(action,d1,d2):
    if d1<0:
        d1=d1+256
    if d2<0:
        d2=d2+256

    a_now = []
    if action == "S_READY":#车辆启动后先发这个，进入待命状态
        a_now = [0x23,0x53,0x01,0x01,0x0A]
    elif action == "J_STOP":#遥控停止
        a_now = [0x23,0x4A,0x00,0x00,0x0A]
    elif action == "J_RUN":#遥控开始
        a_now = [0x23,0x4A,0x01,0x00,0x0A]
    elif action == "D":
        a_now = [0x23,0x44,d1,d2,0x0A]
    elif action == "R":
        a_now = [0x23,0x52,d1,d2,0x0A]
    elif action == "T":
        a_now = [0x23,0x54,d1,d2,0x0A]
    elif action == "W":#消除警报
        a_now = [0x23,0x57,d1,d2,0x0A]
    elif action == "S":
        a_now = [0x23,0x53,0x00,0x00,0x0A]
    elif action == "SF":#强制停止
        a_now = [0x23,0x53,0x00,0x01,0x0A]
    return a_now


class UsbSendAPIHandler(tornado.web.WebRequest):
    def get(self):
        self.post()
    @tornado.gen.coroutine
    def post(self):
        value_now = self.get_argument("value",None)
        action_now = self.get_argument("action",None)
        if not(value_now and action_now):
            return
        value_now = int(value_now)
        a_list = []
        if action_now == "xc_go":
            # action("D",-100,200),
            a_list =[
                action("D",50,value_now)
            ]
        elif action_now == "xc_back":
            a_list =[
                action("D",-50,value_now)
            ]
        elif action_now == "xc_left":
            a_list =[
                action("T",-1,30)
            ]
        elif action_now == "xc_right":
            a_list =[
                action("T",1,30)
            ]
        elif action_now == "xc_cancel_alert_and_ready":
            #消除警报 并车辆准备
            a_list =[
                action("W",0,100),
                action("S_READY",1,1),
                action("J_STOP",0,0),
            ]
        self.finis({"info":"ok","a_list":a_list})

        try:
            #端口，GNU / Linux上的/ dev / ttyUSB0 等 或 Windows上的 COM3 等
            portx_now = "tty.wchusbserial14120"
            portx="/dev/%s" % portx_now
            #波特率，标准值之一：50,75,110,134,150,200,300,600,1200,1800,2400,4800,9600,19200,38400,57600,115200
            bps=115200
            #超时设置,None：永远等待操作，0为立即返回请求结果，其他值为等待超时时间(单位为秒）
            timex=5
            # 打开串口，并得到串口对象
            ser=serial.Serial(portx,bps,timeout=timex)
            # 写数据 最小间隔 80ms
            for a in a_list:
                # result=ser.write("abc".encode("gbk"))
                print(a)
                result=ser.write(a)
                print("写总字节数:",result)
                time.sleep(0.1)
            # while True:
            #     if ser.in_waiting:
            #         stra=ser.read(ser.in_waiting)
            #         if(stra=="exit"):#退出标志
            #             break
            #         else:
            #             print("收到数据：",stra.hex())
            #         # 235701300a
         
            #     # print("---------------")
            ser.close()#关闭串口
        except Exception as e:
            print("---异常---：",e)



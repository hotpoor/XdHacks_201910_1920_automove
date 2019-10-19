#!/bin/env python
#coding=utf-8
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/vendor/')

import tornado.options
import tornado.ioloop
import tornado.web
import tornado.websocket

from tornado import gen
from tornado.escape import json_encode, json_decode

from setting import settings

from controller.base import WebRequest
from controller.base import WebSocket
# from controller import xc_action_now

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


class UsbSendAPIHandler(WebRequest):
    def get(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.post()
    @tornado.gen.coroutine
    def post(self):
        self.set_header("Access-Control-Allow-Origin", "*")
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
        self.finish({"info":"ok","a_list":a_list})

        try:
            #端口，GNU / Linux上的/ dev / ttyUSB0 等 或 Windows上的 COM3 等
            portx_now = "tty.wchusbserial14120"
            portx_now = "tty.wchusbserial1420"
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
class ActionMessageAPIHandler(WebRequest):
    @tornado.gen.coroutine
    def get(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        
        a = self.get_argument("a","0")
        b = self.get_argument("b","0")
        c = self.get_argument("c","0")
        d = self.get_argument("d","0")
        long_str = self.get_argument("str","")
        data = u"CMDXC//a=%s&b=%s&c=%s&d=%s&str=%s"%(a,b,c,d,long_str)

        http_client = tornado.httpclient.AsyncHTTPClient()
        url = "http://www.hotpoor.org/api/comment/submit_data"
        headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
        params = {
            "user_id": "0cd8429c1da249b6935d7eef72d7fc0b",
            "aim_id": "0cd8429c1da249b6935d7eef72d7fc0b",
            "app":"hotpoor",
            "content": data,
        }
        body = json_encode(params)
        print(body)
        request = tornado.httpclient.HTTPRequest(
            url = url,
            method = "POST",
            body = body,
            headers = headers,
            validate_cert = False)
        response = yield http_client.fetch(request)
        print(response.body)
        print("===========")

        self.finish({"info":"ok"})


class MainHandler(WebRequest):
    @gen.coroutine
    def get(self, app):
        self.finish({"info":"ok"})


tornado.httpclient.AsyncHTTPClient.configure("tornado.curl_httpclient.CurlAsyncHTTPClient")

application = tornado.web.Application([
    (r"/api/xc/action_message",ActionMessageAPIHandler),
    (r"/api/xc/action",UsbSendAPIHandler),
    (r"/(.*)", MainHandler),
    ],**settings)

if __name__ == "__main__":
    tornado.options.define("port", default=8088, help="Run server on a specific port", type=int)
    tornado.options.parse_command_line()
    application_server = tornado.httpserver.HTTPServer(application, xheaders=True)
    application_server.listen(tornado.options.options.port)
    tornado.ioloop.IOLoop.instance().start()
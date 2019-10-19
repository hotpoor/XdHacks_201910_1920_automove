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
from controller import xc_action


class MainHandler(WebRequest):
    @gen.coroutine
    def get(self, app):
        self.finish({"info":"ok"})


tornado.httpclient.AsyncHTTPClient.configure("tornado.curl_httpclient.CurlAsyncHTTPClient")

application = tornado.web.Application([
    (r"/api/xc/action",xc_action.UsbSendAPIHandler),
    (r"/(.*)", MainHandler),
    ],**settings)

if __name__ == "__main__":
    tornado.options.define("port", default=8088, help="Run server on a specific port", type=int)
    tornado.options.parse_command_line()
    application_server = tornado.httpserver.HTTPServer(application, xheaders=True)
    application_server.listen(tornado.options.options.port)
    tornado.ioloop.IOLoop.instance().start()
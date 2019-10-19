#!/bin/env python
#coding=utf-8
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/vendor/')
#os.chdir(os.path.dirname(os.path.abspath(__file__)))

import logging
import uuid

settings = {
    "static_path": os.path.join(os.path.dirname(__file__),"static"),
    "demos_path": os.path.join(os.path.dirname(__file__),"demos"),
    "cookie_secret": "hotpoorinchina",
    "cookie_domain": "",
    "hotpoor_developers": [""],
    "QiniuAccessKey": "nyAmycfeo4-RF6drKPf62_KU1RUvj8lFsrmOqJ9K",
    "QiniuSecretKey": "NBaVPYokRuMvmthKWjabxFGCxQ0yx5h-ZSQwsJrk",
    "BaiduYuyinAppID": "9082071",
    "BaiduYuyinAPIKey": "PXirZpvwwZ9hsKqaLYcLXLzq",
    "BaiduYuyinSecretKey":"ef6788d39df2bb689437d0cb9b6dbda6",
    "debug": True,
    "wss_port":8088,
    "LoginCode":"automove",
    "developers":[]
}

# try:
#     import torndb as database
#     conn = database.Connection("127.0.0.1:3306", "video", "root", "root")
#     conn1 = database.Connection("127.0.0.1:3306", "video1", "root", "root")
#     conn2 = database.Connection("127.0.0.1:3306", "video2", "root", "root")
#     ring = [conn1, conn2]
# except:
#     pass

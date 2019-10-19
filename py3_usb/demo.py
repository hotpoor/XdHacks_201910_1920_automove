#!/bin/env python
#coding=utf-8
import serial #导入模块
import time
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
def read_action(str_a):
    list_i = list(str_a)

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
    a_list = [
        # action("D",-100,200),
        # action("SF",0,0),
        # action("S",0,0),
        # action("R",-10,180),
        # action("T",-1,30),
        
        #消除警报 并车辆准备
        action("W",0,100),
        action("S_READY",1,1),
        action("J_STOP",0,0),


        # action("J_STOP",0,100)
    ]
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
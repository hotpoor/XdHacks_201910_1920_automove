#!/bin/env python
#coding=utf-8
import serial #导入模块
def action(action,d1,d2):
    if d1<0:
        d1=d1+256
    if d2<0:
        d2=d2+256

    a_now = []
    if action == "D":
        a_now = [0x23,0x44,d1,d2,0x0A]
    elif action == "R":
        a_now = [0x23,0x52,d1,d2,0x0A]
    elif action == "T":
        a_now = [0x23,0x54,d1,d2,0x0A]
    elif action == "W":
        a_now = [0x23,0x57,d1,d2,0x0A]
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
    # 读数据
    while True:
        if ser.in_waiting:
            stra=ser.read(ser.in_waiting)
            if(stra=="exit"):#退出标志
                break
            else:
                print("收到数据：",stra)
                print("收到数据HEX：",stra.hex())
                if stra.hex().startWith("235701"):
                    a = stra.hex()
                    print("收到警告:需要发送 23 57 00 00 0A 解除")
                    a="235701300a"
                    b= a.split("235701")[1].split("0a")[0]
                    value = int(b, 16)
                    #网络请求
                    print("距离:",value)
            # 235701300a
            # 235701a60a
            # 235701**0a #障碍物距离
 
        # print("---------------")
    # ser.close()#关闭串口
except Exception as e:
    print("---异常---：",e)
from keras.models import model_from_json
import os
import glob
import numpy as np
from PIL import Image
import keyboard
import time
from mss import mss
import cv2
import requests
import asyncio
import functools

os.environ['KMP_DUPLICATE_LIB_OK']='True'

#读取配置文件
screen_config = []
f = open("screen_config.txt", "r")
for line in f:
	screen_config.append(line)
f.close()




mon = {'left': int(screen_config[0]), 'top': int(screen_config[1]), 'width': int(screen_config[2]), 'height': int(screen_config[3])}
sct = mss()

grab_Width = int(screen_config[2])
grab_Height = int(screen_config[3])
width = int(grab_Width/2)
height = int(grab_Height/2)

# Load Model
model = model_from_json(open("model.json", "r").read())
model.load_weights("car_weight.h5")
print(model.summary())

framerate_time = time.time()
counter = 0
i = 0
current_framerate = 0
delay = 0.04
count_time = 0
last_result = 1

responseCount = 0
last_targetX = 0

while True:

    time_start = time.time()
    img = sct.grab(mon)
    img2 = np.array(img)

    #退出机制
    if cv2.waitKey(1) & 0xFF == ord('q'):
        cv2.destroyAllWindows()
        break

    #压缩图像
    im = Image.frombytes('RGB', img.size, img.rgb)
    im = np.array(im.convert("L").resize((width, height)))
    im = im / 255

    time_grab = time.time() - time_start
    time_start = time.time()

    X = np.array([im])
    X = X.reshape(X.shape[0], width, height, 1)
    r = model.predict(X)
    result = np.argmax(r)

    time_predict = time.time() - time_start

    last_result = result

    counter+=1
    if (time.time() - framerate_time) > 1 :
        current_framerate = counter / (time.time() - framerate_time)
        counter = 0
        framerate_time = time.time()
        delay -= 0.0001
        if delay < 0:
            delay = 0

    targetX = int(result/100 *grab_Width)

    new_targetX = int(((targetX - last_targetX)/30) + last_targetX)

    #确认中心点
    centerPointX = int(grab_Width / 2)
    mid = int(centerPointX+(new_targetX - centerPointX) / 2*1.5)
    TargetHeight = 100
    TargetHeightMid = int(TargetHeight/2)

    #绘制参考图案
    cv2.circle(img2, (new_targetX, grab_Height-TargetHeight), 15, (0, 255, 0), 1,cv2.LINE_AA)

    cv2.line(img2, (centerPointX, grab_Height), (mid, grab_Height - TargetHeightMid), (255, 150, 0), 13,cv2.LINE_AA)
    cv2.line(img2, (mid, grab_Height-TargetHeightMid), (new_targetX, grab_Height - TargetHeight), (255, 150, 0), 10,cv2.LINE_AA)

    last_targetX = new_targetX

    #向夏力维发送坐标
    responseCount += 1
    if (responseCount > 30):    #发送间隔
        #response = requests.get("http://127.0.0.1:8088/api/xc/action_message?a=%s&b=%s&c=1&d=1"%(result, 0))
        responseCount = 0

    #CV渲染
    cv2.namedWindow('CV', 0)
    cv2.imshow('CV', img2)



    i += 1
    time.sleep(delay)
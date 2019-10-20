from mss import mss
from PIL import Image
import numpy as np
import cv2
import time

#---------------------------DEF-----------------------------
# 鼠标的回调函数 返回坐标回全局变量
def mouse_event(event, x, y, flags, param):
    if event == cv2.EVENT_MOUSEMOVE:
        global mouseX, mouseY,mousePerX,mousePerY
        mouseX = x
        mouseY = y
        mousePerX = int(x / (grab_Width * 1)*100)
        mousePerY = int(y / (grab_Width * 1)*100)
        #print(x/(grab_Width*2),"     ",y/(grab_Height*2))

#录制按钮
def recordKeyPress():
    global imgRaw
    framerate_time = ("%f" %(time.time()*100))[:12]
    im = Image.frombytes('RGB', imgRaw.size, imgRaw.rgb)
    im.save('./img/{}_{}_{}_.png'.format(framerate_time, mousePerX, mousePerY))  #uuid.uuid4()
#---------------------------SETUP-----------------------------
#读取配置文件
screen_config = []
f = open("screen_config.txt", "r")
for line in f:
	screen_config.append(line)
f.close()

imgRaw = np.zeros((512, 512, 3), np.uint8)
img = np.zeros((512, 512, 3), np.uint8)

mouseX, mouseY,mousePerX,mousePerY = 0,0,0,0
grab_Width = int(screen_config[2])
grab_Height = int(screen_config[3])

cv2.namedWindow('CV',0)
cv2.resizeWindow("CV", grab_Width, grab_Height)
cv2.setMouseCallback('CV', mouse_event)



#---------------------------LOOP------------------------------
while(1):
    #截图
    sct = mss()
    monitor = {'left': int(screen_config[0]), 'top': int(screen_config[1]), 'width': int(screen_config[2]), 'height': int(screen_config[3])}
    imgRaw = sct.grab(monitor)
    img = np.array(imgRaw)

    #绘制UI
    cv2.circle(img, (mouseX, mouseY), 30, (0, 255, 0), 1)

    #渲染
    cv2.imshow('CV', img)

    #间隔25ms截屏一次
    if cv2.waitKey(25) & 0xFF == ord('r'):
        recordKeyPress()

    if cv2.waitKey(25) & 0xFF == ord('q'):
        cv2.destroyAllWindows()
        break



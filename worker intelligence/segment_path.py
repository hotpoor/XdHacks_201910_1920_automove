
import numpy as np
import argparse
import imutils
import time
import cv2
from mss import mss

COLORS = open("RoadSeg/seg-colors.txt").read().strip().split("\n")
COLORS = [np.array(c.split(",")).astype("int") for c in COLORS]
COLORS = np.array(COLORS, dtype="uint8")

net = cv2.dnn.readNet("RoadSeg/seg-model.net")

#读取配置文件
screen_config = []
f = open("screen_config.txt", "r")
for line in f:
	screen_config.append(line)
f.close()


while True:
	#截屏
	sct = mss()
	monitor = {'left': int(screen_config[0]), 'top': int(screen_config[1]), 'width': int(screen_config[2]), 'height': int(screen_config[3])}
	imgRaw = sct.grab(monitor)

	img = np.array(imgRaw)
	image2 = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

	blob = cv2.dnn.blobFromImage(image2, 1 / 255.0, (256, 256), 0,
		swapRB=True, crop=False)
	net.setInput(blob)
	start = time.time()
	output = net.forward()
	end = time.time()


	(numClasses, height, width) = output.shape[1:4]

	classMap = np.argmax(output[0], axis=0)

	mask = COLORS[classMap]
	mask = cv2.resize(mask, (image2.shape[1], image2.shape[0]),
		interpolation=cv2.INTER_NEAREST)
	#---------------------------------------

	gray = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)

	gray = cv2.GaussianBlur(gray, (15, 15),15)
	ret, binary = cv2.threshold(gray, 80, 255, cv2.THRESH_BINARY_INV)

	zoneSegNum = 10
	zoneHeight = int(int(screen_config[3])/10)

	zoneBin = []

	for i in range(10):
		temp = binary[:]
		temp[i:, :] = 255
		temp[i:, :] = 255
		cv2.imshow("bin3", temp)
		key = cv2.waitKey(1) & 0xFF
	bin3 = binary[:]

	bin3[100:300, :] = 255
	bin3[350:, :] = 255

	cv2.imshow("bin3", bin3)

	contours, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)  # for opencv4.1

	if (len(contours) > 1 ):
		mom = cv2.moments(contours[1])
		pt = (int(mom['m10'] / mom['m00']), int(mom['m01'] / mom['m00']))
		cv2.circle(image2, pt, 2, (0, 255, 255), 2)

	cv2.imshow("binaray", binary)

	# ---------------------------------------
	#渲染
	output = ((image2) + (0.5 * mask)).astype("uint8")
	cv2.imshow("Frame", output)
	key = cv2.waitKey(1) & 0xFF
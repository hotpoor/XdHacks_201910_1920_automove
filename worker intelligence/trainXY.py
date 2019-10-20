#--coding:utf-8--
import glob
import os
import random
import numpy as np
import keras
from keras.models import Sequential
from keras.layers import Dense, Dropout, Flatten
from keras.layers import Conv2D, MaxPooling2D
from keras import optimizers
from keras.utils import to_categorical
from PIL import Image
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt


#读取配置文件
screen_config = []
f = open("screen_config.txt", "r")
for line in f:
	screen_config.append(line)
f.close()

#获取图片集合
imgs = glob.glob("./img/*.png")
num_imgs = len(imgs)
print('Image:',num_imgs)
#图片压缩后尺寸
width = int(int(screen_config[2])/2)
height = int(int(screen_config[3])/2)

X = []
Y = []
for img in imgs:
    filename = os.path.basename(img)
    label1 = int(filename.split('_')[1])
    label2 = int(filename.split('_')[2])
    im = np.array(Image.open(img).convert('L').resize((width,height)))
    im = im /255
    X.append(im)
    Y.append(label1)

X = np.array(X)
X = X.reshape(X.shape[0],X.shape[2],X.shape[1],1)
Y = to_categorical(Y,100)
Y = np.array(Y)

#构建神经网络
train_X,test_X,train_Y,test_Y = train_test_split(X,Y,test_size=0.25,random_state=random.randint(112,1112))

model = Sequential()
model.add(
    Conv2D(32,kernel_size=(3,3),
    activation='relu',
    input_shape = (width,height,1))
)
model.add(Conv2D(64,(3,3),activation='relu'))
model.add(MaxPooling2D(pool_size=(2,2)))
model.add(Dropout(0.25))
model.add(Flatten())
model.add(Dense(128,activation='relu'))
model.add(Dropout(0.4))
model.add(Dense(100,activation='softmax'))
print(model.summary())

#读取存档
if os.path.exists("./car_weight.h5"):
    model.load_weights('car_weight.h5')
    print("Load weight file")

#编译
model.compile(loss='categorical_crossentropy',optimizer='SGD',metrics=['accuracy'])
history = model.fit(train_X,
                    train_Y,
                    epochs=100,
                    batch_size=64,
                    verbose=2)
#tensorboard --logdir logs

#存档
open("model.json", "w").write(model.to_json())
model.save_weights('car_weight.h5')
print('File Saved')

# 绘制训练 & 验证的准确率值
plt.plot(history.history['accuracy'])
plt.title('Model accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epoch')
plt.legend(['Train', 'Test'], loc='upper left')
plt.show()



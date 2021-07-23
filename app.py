from sys import stdout
from makeup_artist import Makeup_artist
import logging
from flask import Flask, render_template, Response
from flask_socketio import SocketIO, emit
from camera import Camera
from utils_local import base64_to_pil_image, pil_image_to_base64
import cv2
from PIL import Image
import imageio
import numpy as np
import base64
import io
import matplotlib.pyplot as plt
## Yolo
import torch

app = Flask(__name__)
app.logger.addHandler(logging.StreamHandler(stdout))
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = True
socketio = SocketIO(app)
camera = Camera(Makeup_artist())


@socketio.on('input image', namespace='/test')
def test_message(input):
    input = input.split(",")[1]
    camera.enqueue_input(input)
    image_data = input # Do your magical Image processing here!!
    #image_data = image_data.decode("utf-8")

    ## Yolo
    img = Image.open(io.BytesIO(base64.b64decode(image_data)))
    results = model(img, size=640)

    results.render()  # updates results.imgs with boxes and labels
    for img in results.imgs:
        buffered = io.BytesIO()
        img_base64 = Image.fromarray(img)
        img_base64.save(buffered, format="JPEG")
    b = base64.b64encode(buffered.getvalue()).decode()
    image_data = "data:image/jpeg;base64," + b

    # print("OUTPUT " + image_data)
    emit('out-image-event', {'image_data': image_data}, namespace='/test')
    #camera.enqueue_input(base64_to_pil_image(input))


@socketio.on('connect', namespace='/test')
def test_connect():
    app.logger.info("client connected")


@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('index.html')


def gen():
    """Video streaming generator function."""

    app.logger.info("starting to generate frames!")
    while True:
        frame = camera.get_frame() #pil_image_to_base64(camera.get_frame())

        print(type(frame))
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    model = model = torch.hub.load('ultralytics/yolov5', 'yolov5s').autoshape()
    model.eval()
    socketio.run(app)

if __name__ == 'app':
    print('build model at Heroku')
    model = model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True, force_reload=True).autoshape()
    model.eval()

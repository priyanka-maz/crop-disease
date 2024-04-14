from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import numpy as np
import base64
import io
from models.models import potato_predict, rice_predict, tea_predict

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/', methods=['POST', 'GET'])
def index():
    return render_template("index.html")

@socketio.on('image')
def image(data_image):
    image = data_image['image']
    selected_crop = data_image['crop']

    # decode and convert into image
    b = io.BytesIO(base64.b64decode(image))
    print(selected_crop)
    # Perform prediction based on the selected crop
    if selected_crop == 'rice':
        json_data = rice_predict(b)
    elif selected_crop == 'tea':
        json_data = tea_predict(b)
    elif selected_crop == 'potato':
        json_data = potato_predict(b)
    else:
        json_data = {"label": "Invalid crop selected", "confidence": 100}
    
    # Emit the JSON data to the client
    emit('prediction_result', json_data)
    

if __name__ == "__main__":
    socketio.run(app, port=5000, debug=True)
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import numpy as np
import base64
import io
from models.models import potato_predict, rice_predict

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/', methods=['POST', 'GET'])
def index():
    return render_template("index.html")

@socketio.on('image')
def image(data_image):
    # decode and convert into image
    b = io.BytesIO(base64.b64decode(data_image))

    json_data = rice_predict(b)
    
    # Emit the JSON data to the client
    emit('prediction_result', json_data)

if __name__ == "__main__":
    socketio.run(app, port=5000, debug=True)
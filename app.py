from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np

app = Flask(__name__)

# Access the webcam
video_capture = cv2.VideoCapture(0)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/capture", methods=["POST"])
def capture():
    success, frame = video_capture.read()
    if success:
        # Convert the frame to JPEG format
        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        return frame_bytes
    else:
        return jsonify(error="Failed to capture image from webcam"), 500

if __name__ == "__main__":
    app.run(debug=True)

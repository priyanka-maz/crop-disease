import tensorflow as tf 
import numpy as np
import json
from PIL import Image
import cv2

# def potato_predict_tflite(bytes):
#     interpreter = tf.lite.Interpreter(model_path="models/potato_disease_detection.tflite")
#     interpreter.allocate_tensors()
#     potato_dict = {0: "Early_Blight", 1: "Healthy" , 2: "Late_Blight"}

#     # Get input and output details
#     input_details = interpreter.get_input_details()
#     output_details = interpreter.get_output_details()

#     # Preprocess the image
#     input_shape = (128, 128)
#     img = Image.open(bytes).convert("RGB").resize(input_shape)
#     img_array = np.array(img) / 255.0

#     # Resize and expand dimensions to match the model input shape
#     img_array = np.expand_dims(img_array, axis=0).astype(input_details[0]['dtype'])

#     # Set input tensor
#     interpreter.set_tensor(input_details[0]['index'], img_array)

#     # Run inference
#     interpreter.invoke()

#     # Get output tensor
#     output_data = interpreter.get_tensor(output_details[0]['index'])
#     probability_distribution = tf.nn.softmax(output_data)

#     # Get the predicted label and its corresponding confidence score
#     predicted_label = np.argmax(probability_distribution)
#     confidence_score = probability_distribution[0][predicted_label] * 100  # Convert confidence to percentage
#     confidence_score = float(confidence_score.numpy())

#     label = potato_dict.get(predicted_label, "Unknown")
#     prediction_data = {'label': label, 'confidence': confidence_score}
#     return json.dumps(prediction_data)

def potato_predict(bytes):
    input_shape = (256, 256)  
    img = Image.open(bytes).convert("RGB").resize(input_shape)
    img = np.array(img)
    img = img / 255.0 # normalize the image in 0 to 1 range

    img_array = tf.expand_dims(img, 0)
    model = tf.keras.models.load_model("models\potatoes.h5")
    class_names = ["Early Blight", "Late Blight", "Healthy"]

    predictions = model.predict(img_array)

    predicted_class = class_names[np.argmax(predictions[0])]
    confidence = round(100 * (np.max(predictions[0])), 2)

    return json.dumps({"label": predicted_class, "confidence": confidence})

def rice_predict(bytes):
    model = tf.keras.models.load_model(r"models\rice3_disease_detection_model.h5")

    image = tf.keras.preprocessing.image.load_img(bytes,target_size=(128,128))
    input_arr = tf.keras.preprocessing.image.img_to_array(image)
    input_arr = np.array([input_arr])  # Convert single image to a batch.
    predictions = model.predict(input_arr)

    class_names=['Bacterial Blight', 'Brown Spot', 'Healthy']
    result_index = np.argmax(predictions)
    predicted_class = class_names[result_index]

    confidence = round(100 * (np.max(predictions[0])), 2)

    return json.dumps({"label": predicted_class, "confidence": confidence})


def tea_predict(bytes):
    model = tf.keras.models.load_model(r"models\tea_disease_detection_model.h5")

    image = tf.keras.preprocessing.image.load_img(bytes,target_size=(128,128))
    input_arr = tf.keras.preprocessing.image.img_to_array(image)
    input_arr = np.array([input_arr])  # Convert single image to a batch.
    predictions = model.predict(input_arr)

    print(predictions)
    
    class_names=['Gray Blight', 'Healthy', 'Red Spot']
    result_index = np.argmax(predictions)
    predicted_class = class_names[result_index]

    confidence = round(100 * (np.max(predictions[0])), 2)

    return json.dumps({"label": predicted_class, "confidence": confidence})

# if __name__ == "__main__":
#     image_path = r"static\tea\gb_3.jpg"
#     print(tea_predict(image_path))
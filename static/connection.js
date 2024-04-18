var crops_info = {
    "potato" : {
        "Early Blight" : {
            "Condition": "Early blight is a common fungal disease affecting potato plants, caused by the fungus Alternaria solani. It appears as dark spots with concentric rings on leaves, starting from the bottom of the plant and spreading upwards.", 
            "Care": "To control early blight, practice crop rotation, remove and destroy infected plant debris, and apply fungicides preventatively."
            }, 
        "Late Blight": {
            "Condition": "Late blight is a destructive fungal disease caused by Phytophthora infestans. It manifests as dark, water-soaked lesions on leaves, stems, and tubers, often leading to rapid plant decay.", 
            "Care": "Control late blight by planting resistant potato varieties, applying fungicides preventatively, and ensuring proper air circulation and drainage in the garden."
            }, 
        "Healthy" : {
            "Condition": "Healthy potato plants exhibit vibrant green foliage, free from any signs of disease or distress. Leaves are intact, without spots or lesions, and the overall plant appearance is robust.", 
            "Care": "Maintain plant health by providing adequate water and nutrients, practicing proper crop rotation, and promptly removing any weeds or diseased plant material from the garden."
            } 
        },
    "rice" : {
        "Bacterial Blight" : {
            "Condition": "Bacterial blight affects rice plants, caused by the bacterium Xanthomonas oryzae pv. oryzae. It leads to water-soaked lesions on leaves, turning them yellow or brown over time.", 
            "Care": "Manage bacterial blight by planting resistant rice varieties, avoiding overhead irrigation, and applying copper-based fungicides. Remove and destroy infected plants to prevent further spread."
            },
        "Brown Spot" : {
            "Condition": "Brown spot is a fungal disease of rice caused by the pathogen Cochliobolus miyabeanus. It appears as small, dark brown spots on leaves, gradually expanding and forming lesions.", 
            "Care": "Control brown spot by practicing crop rotation, ensuring proper drainage, and applying fungicides during the early stages of the disease. Remove and destroy infected plant debris to minimize disease spread."
            },
        "Healthy" : {
            "Condition": "Healthy rice plants exhibit vigorous growth with lush green foliage and no signs of disease. Leaves are free from spots or lesions, contributing to optimal plant development.", 
            "Care": "Maintain plant health by providing balanced nutrition, adequate water, and proper weed control. Monitor plants regularly for signs of pests or diseases and take prompt action if any issues arise."
            }
        }, 
    "tea" : {
        "Gray Blight": {
            "Condition": "Gray blight affects tea plants and is caused by the fungus Pestalotiopsis spp. It appears as grayish-brown lesions on leaves, leading to defoliation and reduced yield.",
            "Care": "Manage gray blight by pruning affected branches, improving air circulation, and applying fungicides containing copper or sulfur. Avoid overhead irrigation and remove and destroy infected plant material to prevent spread."
        }, 
        "Red Spot": {
            "Condition": "Red spot is a fungal disease affecting tea plants, caused by the pathogen Cercospora theae. It appears as small, red lesions on leaves, often surrounded by a yellow halo, leading to premature leaf drop.",
            "Care": "Control red spot by practicing good sanitation, removing and destroying infected leaves, and applying fungicides during periods of high humidity. Ensure proper spacing between plants to improve air circulation and reduce disease incidence."
        },
        "Healthy" : {
            "Condition": "Healthy tea plants exhibit vigorous growth with vibrant green foliage and no signs of disease. Leaves are intact and free from discoloration or lesions, contributing to optimal tea production.", 
            "Care": "Maintain plant health through proper cultural practices such as regular watering, fertilization, and pruning. Monitor plants for signs of pests or diseases and take appropriate action if any issues arise."
        }
    }
}
var record = false;

function RecordButton(file){
    var recordButton = document.getElementById('Record');

    document.getElementById('label').textContent = "";
    document.getElementById('score').textContent = "";
    document.getElementById('about-container').style = "display: none";

    if(record == false)
    {
        record = true;
        recordButton.innerHTML = '<i class="fa-solid fa-arrow-rotate-right"></i>Start';
        if(file)
        {   
            stopVideoCapture(file);
        }
        else
        {
            stopVideoCapture();
        }
    }
    else
    {
        record = false;
        recordButton.innerHTML = '<i class="fa-regular fa-circle-dot fa-fade"></i>Snap'; // Start to snap, video must start again

        startVideoCapture();
    }
}

function UploadButton() {
    const fileInput = document.getElementById("fileInput");
    fileInput.click();  // Trigger click on the file input
    fileInput.addEventListener('change', function() {
        const file = this.files[0];

        if (file) {
            // Check file extension and size
            const allowedExtensions = ["jpg", "jpeg", "png"];
            const extension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(extension)) {
                alert("Please select a file with .jpg, .jpeg, or .png extension.");
                return;
            }
            const maxSize = 30 * 1024 * 1024; // 30 MB in bytes
            if (file.size > maxSize) {
                alert("File size exceeds 30 MB.");
                return;
            }

            record = false;
            RecordButton(file);
        } else {
            alert("Please select a file.");
            return;
        }
    });
}


var socket = io.connect('http://localhost:5000');

socket.on('connect', function(){
    console.log("Connected...!", socket.connected)
});

const video = document.querySelector("#videoElement");

video.width = 266; 
video.height = 200; 

var videoStream = null;

window.addEventListener("load", startVideoCapture);

//Video Capture
function startVideoCapture()
{
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            videoStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err0r) {
            console.log(err0r)
            console.log("Something went wrong!");
        });
    }
}


const canvas = document.querySelector("#canvasOutput");
canvas.width = video.width;
canvas.height = video.height;
const context = canvas.getContext('2d', { willReadFrequently: true });

let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let cap = new cv.VideoCapture(video);

var timeout;

function processVideo() {
    let begin = Date.now();
    cap.read(src);
    src.copyTo(dst);
    if(!record)
    {
        cv.imshow("canvasOutput", dst);
    
        // schedule next one.
        let delay = 1000/30 - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
    else
    {
        setTimeout(processVideo, 0);

    }
}

function stopVideoCapture(file) {
    if (videoStream) {
        videoStream = null;
        video.srcObject = null;
    }
    if (file) {
        // If a file is provided, process it as an image
        const reader = new FileReader();
        reader.onload = function(e) {
        const imageData = e.target.result;
        // Display the uploaded image on the canvas
        const img = new Image();
        img.onload = function() {
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Convert the canvas content to base64 image and send to server
            var extension = file.name.split('.').pop().toLowerCase();
            if (extension === "jpg") 
                extension = "jpeg";
            var type = "image/" + extension;
            var data = canvas.toDataURL(type, 0.9);
            data = data.replace('data:' + type + ';base64,', ''); //split off junk 
            var selectedCrop = $('#cropDropdown').val();
            if (!selectedCrop) {
                // If empty, send an alert
                alert('Please select a crop.');
                record = true;
                RecordButton();
            } else {
                showLoadingIndicator();
                socket.emit('image', { image: data, crop: selectedCrop });
            }
        };
        img.src = imageData;
        };
        reader.readAsDataURL(file);
    } else {
        // If no file is provided, capture the last displayed frame from the video
        cap.read(src);
        var type = "image/png";
        var data = document.getElementById("canvasOutput").toDataURL(type, 0.1);
        data = data.replace('data:' + type + ';base64,', ''); //split off junk 
        var selectedCrop = $('#cropDropdown').val();
        if (!selectedCrop) {
            // If empty, send an alert
            alert('Please select a crop.');
            record = true;
            RecordButton();
        } else {
            showLoadingIndicator();
            socket.emit('image', { image: data, crop: selectedCrop });
        }
    }
}

// schedule the first one.
setTimeout(processVideo, 0);

// Listen for the 'prediction_result' event from the server
socket.on('prediction_result', function(data) {
    hideLoadingIndicator();

    // Access the prediction data
    var prediction_data = JSON.parse(data);

    var label = prediction_data.label;
    var confidence = prediction_data.confidence;

    document.getElementById('label').textContent = label;
    document.getElementById('score').textContent = 'Probability: ' + confidence + "%";
    document.getElementById('about-container').style = "display: block";

    var selectedCrop = $('#cropDropdown').val();
    document.getElementById('condition').textContent = crops_info[selectedCrop][label]["Condition"];
    document.getElementById('care').textContent = crops_info[selectedCrop][label]["Care"];

});

function showLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

$('#cropDropdown').change(function() {

    record = true;
    RecordButton(); // if you upload photo and then change crop, it resets
});

// //Get Response from server
// socket.on('response_back', function(image){
//     //const image_id = document.getElementById('image');
//     //image_id.src = image;
//     if(!record)
// {
//     const mood = document.getElementById('mood');
//     var percentage;
//     if(image.percentage != '-')
//         percentage = (parseFloat(image.percentage)*100).toFixed(0) + '%';
//     else
//         percentage = image.percentage;
    
//     const emo = image.emotion;

//     mood.innerHTML = emo.charAt(0).toUpperCase() + emo.slice(1) + ' \t ' + percentage;
//     emotion = image.emotion;

//     switch(emotion)
//     {
//         case 'neutral':
//             root.style.setProperty('--gradient-color1', '#F2F2F2');//
//             break;
//         case 'sad':
//             root.style.setProperty('--gradient-color1', '#c0e5f8');//
//             break;
//         case 'angry':
//             root.style.setProperty('--gradient-color1', '#ffa795');//
//             break;
//         case 'fear':
//             root.style.setProperty('--gradient-color1', '#ffcdff');//
//             break;
//         case 'happy':
//             root.style.setProperty('--gradient-color1', '#ffe99a');//
//             break;
//         case 'disgust':
//             root.style.setProperty('--gradient-color1', '#e1ffc0');//
//             break;
//         case 'surprise':
//             root.style.setProperty('--gradient-color1', '#ffddbc');//
//             break;
            
//     }
// }

// });
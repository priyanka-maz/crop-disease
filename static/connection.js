var record = false;

function RecordButton(file){
    var recordButton = document.getElementById('Record');

    document.getElementById('label').textContent = "";
    document.getElementById('score').textContent = "";

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
    document.getElementById('score').textContent = 'Probability: ' + confidence;

});

function showLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

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
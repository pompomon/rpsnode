# Iteration 3
Goal:

## Changes to public/js/app.js
``` javascript
    const submitImageFromCanvas = (canvasElement) => {
        const request = new XMLHttpRequest();
        request.open('POST', "/predict", true);
        request.setRequestHeader('Content-Type', 'application/octet-stream');
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                console.log(request.responseText);
            } else {
                console.error(request);
            }
        };
    
        request.onerror = function (error) {
            console.error(error);
        };
    
        canvasElement.toBlob(function(blob) {
            request.send(blob);
        });
    };

    const takePhoto = (videoElement, canvasElement) => {
        const canvasContext = canvasElement.getContext('2d');
        const videoSettings = webcamStream.getVideoTracks()[0].getSettings();
        canvasContext.drawImage(videoElement,
            0, 0, videoSettings.width, videoSettings.height,
            0, 0, canvasElement.width, canvasElement.height);
        submitImageFromCanvas(canvasElement);
    };
```
## Changes to index.js
```javascript
const bodyParser = require('body-parser')
const PredictionConfig = require("./config.json");

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.raw());
app.use(express.static('public'));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.post('/predict', (request, response) => {
    const imageData = request.body;
    const fs = require("fs");
    fs.writeFileSync("test.png", imageData);
        
    const customVisionPostOptions = {
        hostname: PredictionConfig.ServerHost,
        port: 443,
        path: PredictionConfig.ModelPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Prediction-key': PredictionConfig.Key
        }             
    };
    // Set up the request
    const https = require('https');
    const customVisionPostRequest = https.request(customVisionPostOptions, (predictionResponse) => {
        predictionResponse.on('data', function (data) {
            const customVisionResponse = JSON.parse(data);
            const predictions = customVisionResponse.predictions;
            console.log(predictions);
        });
    });
    // post the data
    customVisionPostRequest.write(imageData);
    customVisionPostRequest.end();
});
```

## Create config.js with CustomVision API keys
```json
{
    "Key": "<PUT_YOUR_KEY_HERE>",
    "Url": "<PUT_YOUR_FULL_URL_HERE>",
    "ModelPath": "<PUT_PATH_TO_ITERATION_HERE>",
    "ServerHost": "<PUT_HOST_SERVER_HERE>"
}
```

# Troubleshooting
In case you are getting errors about body size on POST, replace the following code in public/js/app.js:

```javascript
    canvasElement.toBlob(function(blob) {
        request.send(blob);
    });

```
with resizing via a new canvas

```javascript
    const resizeCanvas = document.createElement('canvas'),
    resizeCanvasContext = resizeCanvas.getContext('2d'),
    resizeRatio = 0.5; // Set appropriate resize ratio

    resizeCanvas.width = canvasElement.width * resizeRatio;
    resizeCanvas.height = canvasElement.height * resizeRatio;
    resizeCanvasContext.drawImage(canvasElement, 0, 0, resizeCanvas.width, resizeCanvas.height);

    resizeCanvas.toBlob(function(blob) {
        request.send(blob);
    });
```
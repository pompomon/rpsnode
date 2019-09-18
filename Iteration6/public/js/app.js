function init() {
    // Global variables
    let webcamStream;
    const appResults = document.getElementById('appResults');
    const appContainer = document.getElementById('appContainer');
    const videoElement = document.querySelector('video');
    
    const picks = ["rock", "paper", "scissors"];
    const getEnginePick = () => {
        return picks[Math.floor(Math.random() * picks.length)];
    };
    const resultClasses = {
        WIN: "userWin",
        LOST: "userLose",
        DRAW: "draw"
    };
    const getWinner = (userPick, enginePick) => {
        var winnerScheme = {
            "rock": "scissors",
            "scissors": "paper",
            "paper": "rock",
        },
        userPickValue = userPick.toLowerCase(),
        enginePickValue = enginePick.toLowerCase();
    
        if (winnerScheme[userPickValue] === enginePickValue) {
            return "WIN";
        }
    
        if (winnerScheme[enginePickValue] === userPickValue) {
            return "LOST";
        }
    
        return "DRAW";
    };

    let counter = 0;
    const counterStart = 0;
    const counterStop = 4;
    const counterStep = 1;
    const timerTick = 1000;
    const startCounter = () => {
        let counterTimer;
        const videoElement = document.querySelector("video");
        const canvasElement = document.querySelector("canvas");
        const counterElement = appContainer.querySelector(".appCounter");
        // Reset elements
        canvasElement.classList.add('hide');
        counterElement.classList.remove('hide');
        const enginePickElement = document.querySelector('.appEnginePick');
        picks.forEach(pickLabel => {
            enginePickElement.classList.remove(pickLabel);
        });
        Object.keys(resultClasses).forEach(function (key) {
            appContainer.classList.remove(resultClasses[key]);
        });
        appContainer.querySelector(".resultText").classList.add("hide");
        appResults.querySelector(".appUserAnswer").innerHTML = "-";
        appResults.querySelector(".appEngineAnswer").innerHTML = "-";

        const counterTimerTick = function counterTimerTick() {
            if (counterTimer) {
                clearTimeout(counterTimer);
            }
            counter += counterStep;
            counterElement.innerHTML = counter;
            if (counter >= counterStop) {
                counterElement.classList.add('hide');
                takePhoto(videoElement, canvasElement);
                return;
            }
            counterTimer = setTimeout(counterTimerTick, timerTick);
        };
    
        counter = counterStart;
        counterTimerTick();
    };

    const processPrediction = (prediciton, enginePick) => {
        appResults.querySelector(".appUserAnswer").innerHTML = prediciton;
        appResults.querySelector(".appEngineAnswer").innerHTML = enginePick;
        document.querySelector('.appEnginePick').classList.add(enginePick);
        // Update results
        var result = getWinner(prediciton, enginePick);
        appContainer.classList.add(resultClasses[result]);
        appContainer.querySelector(".resultText").classList.remove("hide");
        appContainer.querySelector(".resultText").innerHTML = result;
    };

    const submitImageFromCanvas = (canvasElement) => {
        const request = new XMLHttpRequest();
        request.open('POST', "/predict", true);
        request.setRequestHeader('Content-Type', 'application/octet-stream');
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                const prediction = JSON.parse(request.responseText).prediction;
                const enginePick = getEnginePick();
                processPrediction(prediction, enginePick);
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
        canvasElement.classList.remove('hide');
        const canvasContext = canvasElement.getContext('2d');
        const videoSettings = webcamStream.getVideoTracks()[0].getSettings();
        canvasContext.drawImage(videoElement,
            0, 0, videoSettings.width, videoSettings.height,
            0, 0, canvasElement.width, canvasElement.height);
        submitImageFromCanvas(canvasElement);
    };

    // Initialize camera
    function bindCamera(videoElement) {
        // getMedia polyfill
        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        // Check that getUserMedia is supported
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                // constraints
                {
                    video: { facingMode: 'environment' },
                    audio: false
                },
                // successCallback
                function (localMediaStream) {
                    try {
                        videoElement.srcObject = localMediaStream;
                    } catch (error) {
                        videoElement.src = window.URL.createObjectURL(localMediaStream);
                    }
                    webcamStream = localMediaStream;
                    startCounter();
                },
                // errorCallback
                function (err) {
                    console.log("The following error occured: " + err);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    }

    bindCamera(videoElement);
    appRestart = document.getElementById('appRestartButton');
    appRestart.addEventListener("click", function(){
        startCounter();
    });
}

function onDocumentReady(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

onDocumentReady(init);
// Define different ASCII palettes for each video
const asciiPalette1 = " #+==-  ";
const asciiPalette2 = "  ===#";
// const asciiPalette2 = " .:-=+*#%@";
const asciiPalette3 = "@%#*+=-:.  ";

// Store references to elements and parameters for reinitialization
const videoConfigs = {
    "video1": { selector: "video1", outputSelector: "ascii1", palette: asciiPalette1, rowPercent: 80, colPercent: 70 },
    "video4": { selector: "video4", outputSelector: "ascii4", palette: asciiPalette2, rowPercent: 20, colPercent: 80 }
};

let canvasElements = {};
let contextElements = {};
let processingActive = true;

// Setup videos
const video1 = document.getElementById("video1");
const video4 = document.getElementById("video4");

// Setup ASCII elements
const ascii1 = document.getElementById("ascii1");
const ascii4 = document.getElementById("ascii4");

// Create canvases
const canvas1 = document.createElement("canvas");
const canvas4 = document.createElement("canvas");

const ctx1 = canvas1.getContext("2d");
const ctx4 = canvas4.getContext("2d");

// Store canvas and context references
canvasElements["video1"] = canvas1;
contextElements["video1"] = ctx1;
canvasElements["video4"] = canvas4;
contextElements["video4"] = ctx4;

// Set video sources
video1.src = "assets/dancing.mp4";
video4.src = "assets/totoroheader.mp4";

// Make sure videos load
video1.load();
video4.load();

// Process video frame to ASCII with configurable ASCII characters
function processVideoToAscii(video, asciiOutput, canvas, ctx, asciiChars, centerRowPercentage = 100, centerColumnPercentage = 100, canvas_width) {
    // Check if processing should continue
    if (!processingActive) {
        return;
    }
    
    // Check if video and elements are available
    if (!video || !asciiOutput || !canvas || !ctx || video.paused || video.ended) {
        requestAnimationFrame(() => processVideoToAscii(video, asciiOutput, canvas, ctx, asciiChars, centerRowPercentage, centerColumnPercentage, canvas_width));
        return;
    }
    
    try {
        // Set canvas dimensions
        const height = Math.floor((video.videoHeight / video.videoWidth) * canvas_width / 1.8);
        canvas.width = canvas_width;
        canvas.height = height;
        
        // Draw video to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get pixel data
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        
        // Calculate which rows to keep based on centerRowPercentage
        const totalRows = canvas.height;
        const rowsToKeep = Math.floor(totalRows * (centerRowPercentage / 100));
        const startRow = Math.floor((totalRows - rowsToKeep) / 2);
        const endRow = startRow + rowsToKeep;
        
        // Calculate which columns to keep based on centerColumnPercentage
        const totalColumns = canvas.width;
        const columnsToKeep = Math.floor(totalColumns * (centerColumnPercentage / 100));
        const startColumn = Math.floor((totalColumns - columnsToKeep) / 2);
        const endColumn = startColumn + columnsToKeep;
        
        // Convert to ASCII
        let asciiStr = "";
        for (let y = 0; y < canvas.height; y++) {
            // Skip rows outside the center percentage
            if (y < startRow || y >= endRow) {
                continue;
            }
            
            for (let x = 0; x < canvas.width; x++) {
                // Skip columns outside the center percentage
                if (x < startColumn || x >= endColumn) {
                    continue;
                }
                
                const pos = (y * canvas.width + x) * 4;
                const r = pixels[pos];
                const g = pixels[pos + 1];
                const b = pixels[pos + 2];
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const charIndex = Math.floor((gray / 255) * (asciiChars.length - 1));
                asciiStr += asciiChars[charIndex];
            }
            asciiStr += "\n";
        }
        
        // Check if asciiOutput element exists before updating
        if (asciiOutput) {
            asciiOutput.textContent = asciiStr;
        } else {
            console.warn("ASCII output element is null or undefined");
        }
    } catch (error) {
        console.warn("Error processing video:", error);
    }
    
    // Continue animation with the same percentage parameters
    requestAnimationFrame(() => processVideoToAscii(video, asciiOutput, canvas, ctx, asciiChars, centerRowPercentage, centerColumnPercentage, canvas_width));
}

// Function to reinitialize video processing
function reinitializeVideoProcessing() {
    console.log("Reinitializing video processing");
    processingActive = true;
    
    // Reinitialize each video using the stored configurations
    Object.keys(videoConfigs).forEach(videoId => {
        const config = videoConfigs[videoId];
        
        // Get fresh references to DOM elements
        const videoElement = document.getElementById(config.selector);
        const asciiOutput = document.getElementById(config.outputSelector);
        const canvas = canvasElements[videoId];
        const ctx = contextElements[videoId];
        
        if (videoElement && asciiOutput && canvas && ctx) {
            // Make sure video is playing
            if (videoElement.paused || videoElement.ended) {
                videoElement.play().catch(e => console.warn(`Could not play video ${videoId}:`, e));
            }
            
            // Restart processing
            processVideoToAscii(
                videoElement,
                asciiOutput,
                canvas,
                ctx,
                config.palette,
                config.rowPercent,
                config.colPercent
            );
            
            console.log(`Reinitialized video processing for ${videoId}`);
        } else {
            console.warn(`Could not reinitialize video ${videoId} - missing elements`);
        }
    });
}

// Function to pause video processing
function pauseVideoProcessing() {
    console.log("Pausing video processing");
    processingActive = false;
}

// Page visibility change handler
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        console.log("Page is now visible, reinitializing video processing");
        reinitializeVideoProcessing();
    } else {
        console.log("Page is now hidden, pausing video processing");
        pauseVideoProcessing();
    }
});

// Start processing when videos are ready
video1.addEventListener("loadeddata", () => {
    console.log("Video 1 loaded");
    video1.play();
    processVideoToAscii(video1, ascii1, canvas1, ctx1, asciiPalette1, 80, 70, 260);
});

video4.addEventListener("loadeddata", () => {
    console.log("Video 4 loaded");
    video4.play();
    processVideoToAscii(video4, ascii4, canvas4, ctx4, asciiPalette2, 20, 80, 190);
});
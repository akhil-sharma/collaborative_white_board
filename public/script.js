const socket = io(`http://localhost:3000`);
const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');

let elements = [];  // Store the drawing elements
let currentColor = colorPicker.value;

// Desired aspect ratio (e.g., 16:9, or adjust based on design)
const aspectRatio = 16 / 9

// Handle the color picker change event
colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
});

// Function to resize the canvas based on the container and maintain aspect ratio
function resizeCanvas() {
    const container = document.getElementById('canvasContainer');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
  
    // Calculate the new dimensions while maintaining aspect ratio
    let newCanvasWidth = containerWidth;
    let newCanvasHeight = containerWidth / aspectRatio;
  
    if (newCanvasHeight > containerHeight) {
      newCanvasHeight = containerHeight;
      newCanvasWidth = containerHeight * aspectRatio;
    }
  
    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;
  
    redrawCanvas();
}

// Initialize the canvas size
resizeCanvas();

// Normalize coordinates to percentages
function normalizeCoordinates(x, y) {
    const rect = canvas.getBoundingClientRect(); // Get the canvas's position and size
    return {
        x: (x - rect.left) * (canvas.width / rect.width),  // Scale coordinates correctly after resizing
        y: (y - rect.top)  * (canvas.height / rect.height),
    };
  }

// Denormalize coordinates to absolute values
function denormalizeCoordinates(x, y) {
    return {
        x: parseInt(x * canvas.width),
        y: parseInt(y * canvas.width)
    }
}

function redrawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach(element => {
        context.beginPath();
        const { x: startX, y: startY } = {x: element.startX, y: element.startY}//denormalizeCoordinates(element.startX, element.startY);
        context.moveTo(startX, startY);

        element.path.forEach(point => {
            const { x, y } = {x: point.x, y: point.y}//denormalizeCoordinates(point.x, point.y);
            context.lineTo(x, y);
        });

        context.strokeStyle = element.color;
        context.lineWidth = element.thickness;
        context.stroke();
    });
}
  

function sendDrawnElement(elementData) {
    socket.emit(`canvas_update`, elementData);
}

function deleteElement(index) {
    elements.splice(index, 1);
    redrawCanvas();
    socket.emit('element_delete', index);
}

let currentElement = null;
let thickness = 2;

// Supported Element Types
const SUPPORTED_ELEMENTS = {
    LINE: 'line',
}

canvas.addEventListener("mousedown", (e) => {
    console.debug(`mousedown called with event: ${e}`);
    const {x, y} = normalizeCoordinates(e.clientX, e.clientY);
    currentElement = {
        type: SUPPORTED_ELEMENTS.LINE,
        startX: x,
        startY: y,
        color: currentColor,
        thickness: thickness,
        path: [],
    };
    context.beginPath();
    const {x: denormX, y: denormY} =  {x: currentElement.startX, y: currentElement.startY}//denormalizeCoordinates(currentElement.startX, currentElement.startY);
    context.moveTo(denormX, denormY);
});

canvas.addEventListener("mousemove", (e) => {
    if (!currentElement) return;
    console.debug(`valid mousemove called with event: ${e}`);

    const { x, y } = normalizeCoordinates(e.clientX, e.clientY);
  
    currentElement.path.push({ x, y });
  
    const { x: denormX, y: denormY } = {x, y}//denormalizeCoordinates(x, y);
    context.lineTo(denormX, denormY);
    context.strokeStyle = currentElement.color;
    context.stroke();
});

canvas.addEventListener("mouseout", () => {
    if (!currentElement) return;
    console.debug(`valid mouseout called with event`);
    elements.push(currentElement);
    sendDrawnElement(currentElement);
    currentElement = null;
});

canvas.addEventListener("mouseup", (event) => {
    if (!currentElement) return;
    console.debug(`valid mouseup called with event: ${event}`);
    elements.push(currentElement);
    sendDrawnElement(currentElement);
    currentElement = null;
});


socket.on('connect', () => {
    console.log('Connected to the server.');
});

socket.on('canvas_update', data => {
    console.debug(`received a canvas_update socket event with data: ${data}`);
    elements.push(data);
    redrawCanvas();
});

socket.on('element_delete', index => {
    console.debug(`received a element_delete socket event with index: ${index}`);
    deleteElement(index);
});

socket.on('elements_init', elementsBuffer => {
    console.debug(`received a element_init socket event with elementsBuffer: ${elementsBuffer}`);
    elements = elementsBuffer;
    redrawCanvas();
});

window.addEventListener('resize', resizeCanvas);
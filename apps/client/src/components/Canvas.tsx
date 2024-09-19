import React, {useState, useRef, useEffect} from 'react';
import { CanvasElement, CanvasEvents, Point, ToolTypes } from '@collaborative-drawing-board/shared';
import {toScreenX, toScreenY, toTrueX, toTrueY, trueHeight, trueWidth} from '../utils/helpers';

interface CanvasProps {
    color: string;
    currentTool: ToolTypes;
    elements: Array<CanvasElement>;
    setElements: React.Dispatch<React.SetStateAction<Array<CanvasElement>>>;
    socket: any;
}

const Canvas: React.FC<CanvasProps> = ({color, currentTool, elements, setElements, socket}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [strokeWidth, setStrokeWidth] = useState<number>(2);
    const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState<Boolean>(false);
    const [startPoint, setStartPoint] = useState<Point | null>(null);
    const [canvasSize, setCanvasSize] = useState<{width: number; height: number;}>({width: 0, height: 0});

    // // mouse coordinates
    // const [mouseX, setMousex] = useState<number>(0);
    // const [mouseY, setMouseY] = useState<number>(0);
    // const [prevMouseX, setPrevMouseX] = useState<number>();
    // const [prevMouseY, setPrevMouseY] = useState<number>();

    // // distance from the origin
    // const [offsetX, setOffsetX] = useState<number>(0);
    // const [offsetY, setOffsetY] = useState<number>(0);

    // // zoom
    // const [scale, setScale] = useState<number>(1);

    // // Canvas aspect 
    // const ASPECT_RATIO = 16 / 9;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        resizeCanvas();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
    }, []);

    function handleResize() {
        console.debug(`Handle Resize called.`);
        resizeCanvas();
        drawAllElements();
    };

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const aspectRatio = 16 / 9; // Maintain a 16:9 aspect ratio
          const width = window.innerWidth;
          const height = window.innerHeight;
          const newWidth = width;
          const newHeight = width / aspectRatio > height ? height : width / aspectRatio;

          setCanvasSize({ width: newWidth, height: newHeight });
          
          canvas.width = width;
          canvas.height = newHeight;
          
          drawAllElements(); // Ensure the elements are redrawn after resizing
        }
    };

      // Listen for new elements from the server and update the elements state
    useEffect(() => {
        const handleNewElement = (newElement: CanvasElement) => {
            setElements((prevElements) => [...prevElements, newElement]);
            // drawAllElements();
        };
        socket.on(CanvasEvents.UPDATE_CANVAS, handleNewElement);

        const handleCanvasInitData = (data: Array<CanvasElement>) => {
            setElements((prev) => [...prev, ...data]);
            // drawAllElements();
        }
        socket.on(CanvasEvents.INITIALIZE_CANVAS, handleCanvasInitData);

        // Clean up the event listener when the component unmounts
        return () => {
            socket.off(CanvasEvents.UPDATE_CANVAS, handleNewElement);
            socket.off(CanvasEvents.INITIALIZE_CANVAS, handleCanvasInitData);
        };
    }, [socket, setElements]);

    useEffect(() => {
        drawAllElements();
    }, [elements, currentElement]);
  
    // // Resize canvas
    // const resizeCanvas = () => {
    //   const canvas = canvasRef.current;
    //   if (canvas) {
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;
    //     drawAllElements();
    //   }
    // };

    // Draw all elements from the list + the current element in progress
    const drawAllElements = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Scale based on current canvas size
        const scaleX = canvas.width / canvasSize.width;
        const scaleY = canvas.height / canvasSize.height;

        // Draw the existing elements
        elements.forEach((element) => {
            drawElement(ctx, element, scaleX, scaleY);
        });

        // Draw the current element being drawn in real-time
        if (currentElement) {
            drawElement(ctx, currentElement, scaleX, scaleY);
        }
    };

    // Draw an individual element
    const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement, scaleX: number, scaleY: number) => {
        ctx.strokeStyle = element.color;
        ctx.lineWidth = element.lineWidth;
    
        ctx.beginPath();
    
        if (element.type === ToolTypes.FREE_HAND) {
          smoothFreehand(ctx, element.points, scaleX, scaleY);
        } else if (element.points.length === 2) {
          const [start, end] = element.points;
          const startX = start.x * scaleX;
          const startY = start.y * scaleY;
          const endX = end.x * scaleX;
          const endY = end.y * scaleY;
    
          if (element.type === ToolTypes.LINE) {
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
          } else if (element.type === ToolTypes.RECTANGLE) {
            ctx.rect(startX, startY, endX - startX, endY - startY);
          } else if (element.type === ToolTypes.CIRCLE) {
            const radius = Math.sqrt(Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2));
            const centerX = (startX + endX) / 2;
            const centerY = (startY + endY) / 2;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          }
        }
        ctx.stroke();
      };
    
      const smoothFreehand = (ctx: CanvasRenderingContext2D, points: Point[], scaleX: number, scaleY: number) => {
        if (points.length < 3) {
          // If there are fewer than 3 points, just draw straight lines
          points.forEach((point, index) => {
            const scaledX = point.x * scaleX;
            const scaledY = point.y * scaleY;
            if (index === 0) {
              ctx.moveTo(scaledX, scaledY);
            } else {
              ctx.lineTo(scaledX, scaledY);
            }
          });
          ctx.stroke();
          return;
        }
    
        // Smooth the freehand using Bezier curves
        ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
        for (let i = 1; i < points.length - 2; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2 * scaleX;
          const yc = (points[i].y + points[i + 1].y) / 2 * scaleY;
          ctx.quadraticCurveTo(points[i].x * scaleX, points[i].y * scaleY, xc, yc);
        }
        const lastPoint = points[points.length - 1];
        ctx.lineTo(lastPoint.x * scaleX, lastPoint.y * scaleY);
        ctx.stroke();
      };

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Scale based on current canvas size
        const scaleX = canvas.width / canvasSize.width;
        const scaleY = canvas.height / canvasSize.height;
    
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scaleX; // Account for scaleX
        const y = (e.clientY - rect.top) / scaleY;  // Account for scaleY
    
        if (currentTool === ToolTypes.ERASER) {
            // Detect and erase the element near the clicked point
            const tolerance = 10; // Define how close the mouse should be to erase an element
            const filteredElements = elements.filter((element) => {
              return !isElementNearPoint(element, { x, y }, tolerance, scaleX, scaleY);
            });
        
            setElements(filteredElements);
            //socket.emit('update-elements', filteredElements); // Sync with server
        } else {
          setStartPoint({ x, y });
          setIsDrawing(true);
        }
    };

    // Helper function to determine if the element is near a specific point (with scaling)
    const isElementNearPoint = (element: CanvasElement, point: Point, tolerance: number, scaleX: number, scaleY: number): boolean => {
        for (const elemPoint of element.points) {
        // Apply scaling to element points for correct detection
        const scaledX = elemPoint.x * scaleX;
        const scaledY = elemPoint.y * scaleY;
        const distance = Math.hypot(scaledX - point.x, scaledY - point.y);
        if (distance <= tolerance) {
            return true;
        }
        }
        return false;
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !startPoint) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        let newElement: CanvasElement | null = null;
    
        switch (currentTool) {
          case ToolTypes.LINE:
          case ToolTypes.RECTANGLE:
          case ToolTypes.CIRCLE:
            newElement = {
              id: `${Date.now()}`,
              type: currentTool,
              color,
              points: [startPoint, { x, y }],
              lineWidth: 5,
            };
            break;
          case ToolTypes.FREE_HAND:
            if (currentElement) {
              newElement = {
                ...currentElement,
                points: [...currentElement.points, { x, y }],
              };
            } else {
              newElement = {
                id: `${Date.now()}`,
                type: ToolTypes.FREE_HAND,
                color,
                points: [{ x, y }],
                lineWidth: 5,
              };
            }
            break;
        }
    
        setCurrentElement(newElement);
        drawAllElements();
    };
    
    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            if (currentElement) {
                setElements((prev) => [...prev, currentElement]);
                socket.emit(CanvasEvents.UPDATE_CANVAS, currentElement); // Send the element through socket
                setCurrentElement(null);
            }
        }
    };

    return (
        <canvas
          ref={canvasRef}
          className="block fixed top-0 left-0 w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
    );
}

export default Canvas;
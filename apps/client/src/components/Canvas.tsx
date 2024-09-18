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
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [startPoint, setStartPoint] = useState<Point | null>(null);

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
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
      }
    }, []);
  
    // Resize canvas
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawAllElements();
      }
    };

  // Draw all elements from the list + the current element in progress
  const drawAllElements = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the existing elements
    elements.forEach((element) => {
      drawElement(ctx, element);
    });

    // Draw the current element being drawn in real-time
    if (currentElement) {
      drawElement(ctx, currentElement);
    }
  };


    // Draw an individual element
    const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
        ctx.strokeStyle = element.color;
        ctx.lineWidth = element.lineWidth;
        ctx.beginPath();
    
        if (element.type === ToolTypes.FREE_HAND) {
          element.points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
        } else if (element.points.length === 2) {
          const [start, end] = element.points;
          if (element.type === ToolTypes.LINE) {
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
          } else if (element.type === ToolTypes.RECTANGLE) {
            ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
          } else if (element.type === ToolTypes.CIRCLE) {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
          }
        }
        ctx.stroke();
    };

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        if (currentTool === ToolTypes.ERASER) {
          // Handle erasing logic here (remove elements within eraser range)
          const filteredElements = elements.filter((element) => {
            return !element.points.some((point) => Math.hypot(point.x - x, point.y - y) < 10); // Example eraser radius of 10
          });
          setElements(filteredElements);
        } else {
          setStartPoint({ x, y });
          setIsDrawing(true);
        }
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

    socket.on(CanvasEvents.INITIALIZE_CANVAS, (data: Array<CanvasElement>) => {
        setElements(elements);
        drawAllElements();
    });


    useEffect(() => {
        drawAllElements();
    }, [elements, currentElement]);

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
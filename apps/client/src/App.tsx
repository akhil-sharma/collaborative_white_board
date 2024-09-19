import React, {useEffect, useState, useRef} from "react";
import Canvas from "./components/Canvas";
import { CanvasElement, CanvasEvents, ToolTypes } from "@collaborative-drawing-board/shared";

import { io } from "socket.io-client";
import { API_URL } from "@collaborative-drawing-board/shared";
import Tools from "./components/Tools";

const socket = io(API_URL);

export function App() {
  const [color, setColor] = useState<string>("#ffff32");
  const [elements, setElements] = useState<Array<CanvasElement>>([]);
  const [currentTool, setCurrentTool] = useState<ToolTypes>(ToolTypes.CIRCLE);

  useEffect(() => {
    socket.on(CanvasEvents.INITIALIZE_CANVAS, (data: Array<CanvasElement>) => {
      console.debug(`Initialize_canvas called with data: ${data}.`)
      setElements((prev) => [...prev, ...data]);
    });

    socket.on(CanvasEvents.UPDATE_CANVAS, (data: CanvasElement) => {
      setElements((prev) => [...prev, data]);
    });

    return (() => {
      socket.off(CanvasEvents.INITIALIZE_CANVAS);
      socket.off(CanvasEvents.UPDATE_CANVAS);
    });
  }, [socket, elements]);

  return (
        <div className="relative w-full h-full">
        <Tools
          color={color}
          setColor={setColor}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <Canvas
          color={color}
          currentTool={currentTool}
          elements={elements}
          setElements={setElements}
          socket={socket}
        />
      </div>
  );
}

export default App;

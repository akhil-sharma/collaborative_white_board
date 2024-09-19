import React from "react";
import { ToolTypes } from "@collaborative-drawing-board/shared";

interface ToolsProps {
    currentTool: ToolTypes;
    setCurrentTool: React.Dispatch<React.SetStateAction<ToolTypes>>;
    color: string;
    setColor: React.Dispatch<React.SetStateAction<string>>;
}

const Tools: React.FC<ToolsProps> = ({currentTool, setCurrentTool, color, setColor}) => {
    return (
        <div className="fixed top-0 left-0 p-4 bg-gray-800 text-white z-10 flex items-center gap-4">
            <button 
                className={`p-2 ${currentTool === ToolTypes.LINE ? 'bg-blue-500' : 'bg-gray-500'}`}
                onClick={() => setCurrentTool(ToolTypes.LINE)}
                >
                Line
            </button>
            <button
                className={`p-2 ${currentTool === ToolTypes.RECTANGLE ? 'bg-blue-500' : 'bg-gray-500'}`}
                onClick={() => setCurrentTool(ToolTypes.RECTANGLE)}
            >
                Rectangle
            </button>
            <button
                className={`p-2 ${currentTool === ToolTypes.CIRCLE ? 'bg-blue-500' : 'bg-gray-500'}`}
                onClick={() => setCurrentTool(ToolTypes.CIRCLE)}
            >
                Circle
            </button>
            <button
                className={`p-2 ${currentTool === ToolTypes.FREE_HAND ? 'bg-blue-500' : 'bg-gray-500'}`}
                onClick={() => setCurrentTool(ToolTypes.FREE_HAND)}
            >
                Freehand
            </button>
            <button
                className={`p-2 ${currentTool === ToolTypes.ERASER ? 'bg-blue-500' : 'bg-gray-500'}`}
                onClick={() => setCurrentTool(ToolTypes.ERASER)}
                // onClick={() => console.log(`Feature Under Construction.`)}
            >
                <del>Eraser</del>
            </button>
            <input
                type="color"
                className="ml-4"
                value={color}
                onChange={(e) => setColor(e.target.value)}
            />
        </div>
    );
}

export default Tools;
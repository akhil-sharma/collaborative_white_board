import React, { useState, useRef, useEffect } from 'react'
import { useSocket } from './services/socket'
import { CanvasElement } from '../../../shared/canvasTypes'
import './styles/CanvasDrawing.css'

const App: React.FC = () => {
  const socket = useSocket()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [elements, setElements] = useState<Array<CanvasElement>>([])
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null)
  const [color, setColor] = useState<string>("#bdc4a7")
  const [lineWidth, setLineWidth] = useState<number>(5)
  
  useEffect(() => {

  }, [elements]);

  const handleMousedown = () => {

  }

  const handleMouseMove = () => {

  }

  const handleMouseUp = () => {

  }

  const handleMouseOut = () => {

  }

  const handleOnWheel = () => {

  }

  const handleOnTouchStart = () => {

  }

  const handleOnTouchMove = () => {

  }

  const handleOnTouchCancel = () => {

  }

  const handleOnTouchEnd = () => {

  }

  return (
    <div className='canvas-container'>
      <canvas 
        ref={canvasRef}
        onMouseDown={() => {}}
        onMouseMove={() => {}}
        onMouseUp={() => {}}
        onMouseOut={() => {}}
        onWheel={() => {}}
        onTouchStart={() => {}}
        onTouchMove={() => {}}
        onTouchCancel={() => {}}
        onTouchEnd={() => {}}
        onContextMenu={(e)=> e.preventDefault()}
        ></canvas>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => {setColor(e.target.value)}}
          className='color-picker'
        />
    </div>
  )
}

export default App

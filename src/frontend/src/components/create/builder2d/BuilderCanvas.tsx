import { useRef, useEffect, useState } from 'react';
import { BuilderElement } from '../../../hooks/useBuilder2D';

interface BuilderCanvasProps {
  builder: ReturnType<typeof import('../../../hooks/useBuilder2D').useBuilder2D>;
}

export default function BuilderCanvas({ builder }: BuilderCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [resizeState, setResizeState] = useState<{
    elementId: string;
    handle: 'nw' | 'ne' | 'sw' | 'se';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startElX: number;
    startElY: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, element: BuilderElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    builder.selectElement(element.id);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragState({
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left - element.x,
      offsetY: e.clientY - rect.top - element.y,
    });
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    element: BuilderElement,
    handle: 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    e.stopPropagation();
    builder.selectElement(element.id);

    setResizeState({
      elementId: element.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      startElX: element.x,
      startElY: element.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const newX = e.clientX - rect.left - dragState.offsetX;
        const newY = e.clientY - rect.top - dragState.offsetY;

        builder.updateElement(dragState.elementId, { x: newX, y: newY });
      }

      if (resizeState) {
        const deltaX = e.clientX - resizeState.startX;
        const deltaY = e.clientY - resizeState.startY;

        let newWidth = resizeState.startWidth;
        let newHeight = resizeState.startHeight;
        let newX = resizeState.startElX;
        let newY = resizeState.startElY;

        if (resizeState.handle === 'se') {
          newWidth = Math.max(20, resizeState.startWidth + deltaX);
          newHeight = Math.max(20, resizeState.startHeight + deltaY);
        } else if (resizeState.handle === 'sw') {
          newWidth = Math.max(20, resizeState.startWidth - deltaX);
          newHeight = Math.max(20, resizeState.startHeight + deltaY);
          newX = resizeState.startElX + (resizeState.startWidth - newWidth);
        } else if (resizeState.handle === 'ne') {
          newWidth = Math.max(20, resizeState.startWidth + deltaX);
          newHeight = Math.max(20, resizeState.startHeight - deltaY);
          newY = resizeState.startElY + (resizeState.startHeight - newHeight);
        } else if (resizeState.handle === 'nw') {
          newWidth = Math.max(20, resizeState.startWidth - deltaX);
          newHeight = Math.max(20, resizeState.startHeight - deltaY);
          newX = resizeState.startElX + (resizeState.startWidth - newWidth);
          newY = resizeState.startElY + (resizeState.startHeight - newHeight);
        }

        builder.updateElement(resizeState.elementId, {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
    };

    if (dragState || resizeState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, resizeState, builder]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      builder.selectElement(null);
    }
  };

  const renderShape = (element: BuilderElement) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      opacity: element.opacity,
      transform: `rotate(${element.rotation}deg)`,
      cursor: 'move',
      zIndex: element.zIndex,
    };

    if (element.type === 'decal' && element.imageData) {
      return (
        <div
          key={element.id}
          style={style}
          onMouseDown={(e) => handleMouseDown(e, element)}
        >
          <img
            src={element.imageData}
            alt="Decal"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
          {builder.selectedId === element.id && renderResizeHandles(element)}
        </div>
      );
    }

    const shapeStyle: React.CSSProperties = {
      ...style,
      backgroundColor: element.color,
    };

    if (element.shapeType === 'circle') {
      return (
        <div
          key={element.id}
          style={{ ...shapeStyle, borderRadius: '50%' }}
          onMouseDown={(e) => handleMouseDown(e, element)}
        >
          {builder.selectedId === element.id && renderResizeHandles(element)}
        </div>
      );
    } else if (element.shapeType === 'triangle') {
      return (
        <div
          key={element.id}
          style={style}
          onMouseDown={(e) => handleMouseDown(e, element)}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,10 90,90 10,90"
              fill={element.color}
              opacity={element.opacity}
            />
          </svg>
          {builder.selectedId === element.id && renderResizeHandles(element)}
        </div>
      );
    } else {
      return (
        <div
          key={element.id}
          style={shapeStyle}
          onMouseDown={(e) => handleMouseDown(e, element)}
        >
          {builder.selectedId === element.id && renderResizeHandles(element)}
        </div>
      );
    }
  };

  const renderResizeHandles = (element: BuilderElement) => {
    const handleSize = 8;
    const handleStyle: React.CSSProperties = {
      position: 'absolute',
      width: handleSize,
      height: handleSize,
      backgroundColor: '#3b82f6',
      border: '2px solid white',
      borderRadius: '50%',
      cursor: 'nwse-resize',
      zIndex: 1000,
    };

    return (
      <>
        <div
          style={{ ...handleStyle, top: -handleSize / 2, left: -handleSize / 2, cursor: 'nwse-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, element, 'nw')}
        />
        <div
          style={{ ...handleStyle, top: -handleSize / 2, right: -handleSize / 2, cursor: 'nesw-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, element, 'ne')}
        />
        <div
          style={{ ...handleStyle, bottom: -handleSize / 2, left: -handleSize / 2, cursor: 'nesw-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, element, 'sw')}
        />
        <div
          style={{ ...handleStyle, bottom: -handleSize / 2, right: -handleSize / 2, cursor: 'nwse-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, element, 'se')}
        />
      </>
    );
  };

  const sortedElements = [...builder.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-white relative overflow-hidden"
      onClick={handleCanvasClick}
      style={{ userSelect: 'none' }}
    >
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
      {sortedElements.map(renderShape)}
    </div>
  );
}

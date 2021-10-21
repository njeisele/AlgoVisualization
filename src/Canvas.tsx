import { createCanvas } from "canvas";
import React, { useEffect, useRef, useState } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  radius: number;
}

interface Edge {
    n1: Node;
    n2: Node;
}

// TODO: ignore collisions for now

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();
  const [context, setContext] = useState<CanvasRenderingContext2D | null>();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mouseDownPosX, setMouseDownPosX] = useState(0);
  const [mouseDownPosY, setMouseDownPosY] = useState(0);
  //const [mouseUpPosX, setMouseUpPosX] = useState(0);
  //const [mouseUpPosY, setMouseUpPosY] = useState(0);
  const radius = 10;
  const [isDragging, setIsDragging] = useState(false);
  const [circleMouseDownIn, setCircleMouseDownIn] = useState<Node | null>(null);
  const sourceColor = "#6a0dad";

  useEffect(() => {
    const canvas = canvasRef.current;
    setCanvas(canvas);
    let context = null;
    if (canvas) {
      context = canvas.getContext("2d");
      setContext(context);
    }
    if (context) {
      //context.canvas.height = window.screen.height;
      //context.canvas.width = window.screen.width;

      console.log("w: ", window);
      context.canvas.height = window.innerHeight;
      context.canvas.width = window.innerWidth;

      //Our first draw
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }, []);

  // TODO: add buttons
  // 1) set up nodes and edges  (wipe everything before hand)
  // 2) show animation of the paths
  // 3) Enable clicking to find shortest path

  function isInACircle(x: number, y: number): Node | null {
    for (const n of nodes) {
      // If the distance is less than the radius, we are inside this circle
      const squaredDist = Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2);
      const squaredRadius = Math.pow(n.radius, 2);
      if (squaredDist < squaredRadius) {
        return n;
      }
    }
    return null;
  }

  function drawCircle(x: number, y: number) {
    if (context && canvas) {
      // TODO: Bug when dev tools comes up
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI, false);
      context.fillStyle = nodes.length === 0 ? "#6a0dad" : "#444444";
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = nodes.length === 0 ? "#6a0dad" : "#444444"; // special color for source
      context.stroke();
      const n: Node = { id: nodes.length, x, y, radius };
      nodes.push(n);
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (context && canvas) {
      setMouseDownPosX(e.clientX);
      setMouseDownPosY(e.clientY);
      setIsDragging(true);
      setCircleMouseDownIn(isInACircle(e.clientX, e.clientY));
    }
  }

  function drawEdge(n1: Node | null, n2: Node | null) {
    if (n1 != null && n2 != null && n1.id != n2.id && context) {
        context.beginPath();       // Start a new path
        context.moveTo(n1.x, n1.y);    // Move the pen to (30, 50)
        context.lineTo(n2.x, n2.y);  // Draw a line to (150, 100)
        context.stroke();  
        edges.push({n1, n2});   
    }
    setCircleMouseDownIn(null); // reset
  }

  function handleMouseUp(e: any) {
    if (context && canvas) {
      const mouseUpX = e.clientX;
      const mouseUpY = e.clientY;
      // If this is a different place than down, this was a drag
      if (
        mouseUpX != mouseDownPosX &&
        mouseUpY != mouseDownPosY &&
        isDragging
      ) {
        const upCircle = isInACircle(mouseUpX, mouseUpY);
        drawEdge(circleMouseDownIn, upCircle);
      } else {
        drawCircle(e.clientX, e.clientY);
      }
    }
    setIsDragging(false); // Mouse is no longer down
  }

  return (
    <canvas
      onMouseDown={(e) => {
        handleMouseDown(e); // Record the down position
      }}
      onMouseUp={(e) => {
        handleMouseUp(e);
      }}
      ref={canvasRef}
    />
  );
}

export default Canvas;

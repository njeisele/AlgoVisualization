import { createCanvas } from "canvas";
import React, { useEffect, useRef, useState } from "react";

import _, { min } from 'lodash';

interface Node {
  id: number;
  x: number;
  y: number;
  radius: number;
  prev?: Edge | null; // back pointer
  angleToOrigin: number;
  color: string;
}

interface Edge {
  n1: Node;
  n2: Node;
  color: string;
}

// TODO: ignore collisions for now

function GrahamCanvas() {
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
  // To display for comparing path costs
  const [currentNum, setCurrentNum] = useState(0);
  const [altNum, setAltNum] = useState(0);
  const [anchor2, setAnchor2] = useState<Node | null>();


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

      context.canvas.height = window.innerHeight * (0.8);
      context.canvas.width = window.innerWidth;

      //Our first draw
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }, []);


  // Test ccw works


  function drawCircle(x: number, y: number, createNode: boolean, color1?: string, visited? : boolean) {
    if (context && canvas) {
      // TODO: Bug when dev tools comes up
      let color = "";
      if (visited === true) {
          color = "blue"
      } else {
        color = "#444444"
      }
      if (color1) {
          color = color1;
      }
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI, false);
      context.fillStyle = color;
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = color; // special color for source
      context.stroke();
      if (createNode) { 
        const n: Node = { id: nodes.length, x, y, radius, angleToOrigin: 0, color: "black" };
        nodes.push(n);
      }
    }
  }


  function drawEdge(n1: Node | null, n2: Node | null, color?: string) {
    if (n1 != null && n2 != null && n1.id != n2.id && context) {
      context.beginPath(); // Start a new path
      if (color) {
        context.strokeStyle = color;
      }
      context.moveTo(n1.x, n1.y); // Move the pen to (30, 50)
      context.lineTo(n2.x, n2.y); // Draw a line to (150, 100)
      context.stroke();
    }
  }

  function justDrawEdge(n1: Node | null, n2: Node | null, color?: string) {
    if (n1 != null && n2 != null && n1.id != n2.id && context) {
      context.beginPath(); // Start a new path
      if (color) {
        context.strokeStyle = color;
      }
      context.moveTo(n1.x, n1.y); // Move the pen to (30, 50)
      context.lineTo(n2.x, n2.y); // Draw a line to (150, 100)
      context.stroke();
    }
    setCircleMouseDownIn(null); // reset
  }

  function handleMouseUp(e: any) {
    if (context && canvas) {
      let mouseUpX = e.clientX;
      let mouseUpY = e.clientY;
      const rect = canvas.getBoundingClientRect();
      mouseUpX = mouseUpX - rect.left;
      mouseUpY = mouseUpY - rect.top;
      // If this is a different place than down, this was a drag
      drawCircle(mouseUpX, mouseUpY, true);
    }
    setIsDragging(false); // Mouse is no longer down
  }

  // Get the polar angle b/w this and the anchor point
  // https://muthu.co/understanding-graham-scan-algorithm-for-finding-the-convex-hull-of-a-set-of-points/
  function angle(n1: Node, n2: Node) {
    const y_span = n1.y - n2.y;
    const x_span = n1.x - n2.x;
    return Math.atan2(y_span, x_span)
  }


  // Get an anchor point (bottom left right)
  function getAnchorPoint(): Node {
    let minX = Infinity;
    // If multiple points with lowest y, choose lowest x
    let minY = Infinity;
    let lowestYNode: Node = nodes[0];
    for (let i=0; i < nodes.length; i++) {
      const n = nodes[i];
      //minX = (n.x < minX) ? n.x : minX;
      //minY = (n.y < minY) ? n.y : minY;
      if (n.y < minY) {
        lowestYNode = n;
        minY = n.y;
      }
    }
    // Subtract 1 so it can't overlap
    //const a: Node = { id: -1, x: minX, y: minY, radius: 10, angleToOrigin: 0, color: "blue" }

    return lowestYNode;
  }

  async function sort() {
    let anchor: Node = getAnchorPoint();
    let x: Node = _.cloneDeep(anchor);
    setAnchor2(x);
    if (!anchor) {
      throw Error("no anchor before sorting");
    }
    nodes.forEach(n => {
        n.angleToOrigin = angle(anchor, n); // Compute angle w/ anchor point
    });
    nodes.sort(function(a, b) {
        return b.angleToOrigin - a.angleToOrigin;
      });

    // Shading effect to correspond to sorting order
    const blueChannel = 255;
    for (let i = 0; i < nodes.length; i++) {
        const color = Math.round(blueChannel * i / nodes.length);
        const colorString = color.toString();
        nodes[i].color = `rgb(0,0,${colorString})`;
        console.log(nodes[i].color);
        reDraw(nodes, edges);
        await new Promise(f => setTimeout(f, 500));
    }

    // NOTE: The algorithm includes a check to see if something has the same angle
    // However, this is not used here because it is unlikely that this will happen

    if(nodes.length < 3) {
        return false;
    }
  }

  // Returns positive if ccw
  async function ccw(a: Node, b: Node, c: Node) { 
    const edges1: Edge[] = [];
    edges1.push({n1: a, n2: b, color: "purple"});
    edges1.push({n1: b, n2: c, color: "purple"});
    setEdges(edges1);
    reDraw(nodes, edges1);
    await new Promise(f => setTimeout(f, 1000));

    return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
  }

  async function computeHull() {
    if (nodes.length < 3) {
      alert("Can't find hull if fewer than 3 points");
    }

    // TODO: iron out this loop condition
    // TODO: need a 'clear edge function'
    const result_stack: Node[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      // If turn right to get to this point, pop the middle point 
      
      while (result_stack.length > 1 && await ccw(result_stack[result_stack.length  - 2], result_stack[result_stack.length - 1], p) > 0) {
        const removedNode = result_stack.pop();
        if (removedNode) {
          nodes.forEach(n => {
            if (n.id === removedNode.id) {
              n.color = "red"; // Removed
            }
          });
        }
        
        if (removedNode) {
          drawCircle(removedNode.x ,removedNode?.y, false, "yellow"); // removed node
        }
      }
      result_stack.push(p);
    }

    // Outline the hull
    for (let i = 0; i < result_stack.length; i++){
      const p = result_stack[i];
      drawCircle(p.x, p.y, false, "purple");
      const e: Edge = {n1: result_stack[i] , 
                       n2: result_stack[(i+1) % result_stack.length], 
                       color: "purple"}
      edges.push(e);
    }
    reDraw(nodes, edges);
  }

  async function graham() {
    await sort(); // TODO: Make color based on sorting
    await computeHull();
  }

  // Follow back pointers to get the edges to the source
  function getBackEdges(n: Node): Edge[] {
    let current = n;
    const edges: Edge[] = [];
    while (current.prev) {
      edges.push(current.prev);
      // Don't know which one is current
      if (current.prev.n1 === current) {
        current = current.prev.n2;
      } else {
        current = current.prev.n1;
      }
      
    } 
    return edges;
  }

  function clear() {
    setNodes([]);
    setEdges([]);
  }

  function reDraw(nodes1: Node[], edges1: Edge[]) {
    context && context.clearRect(0, 0, context.canvas.width , context.canvas.height);
    // Draw circles and edges
    for (const n of nodes1) {
      drawCircle(n.x, n.y, false, n.color);
    }
    const a = getAnchorPoint();
    drawCircle(a.x, a.y, false, "blue");
    for (const e of edges1) {
      drawEdge(e.n1, e.n2, e.color);
    }
  }

  useEffect(() => {
    
  }, );

  return (
    <>
      <div style={{width: "100%"}}>
      <span>
      <button style={{ marginBottom: "20px", marginTop: "5px", marginRight: "50px" }}
        onClick={() => graham()}
      >
        Run Graham Scan
      </button>
      <button style={{ marginBottom: "20px", marginTop: "5px", marginRight: "50px" }}
        onClick={() => clear()}
      >
        Clear
      </button>
      </span>
      </div>
      <canvas
        onMouseUp={(e) => {
          handleMouseUp(e);
        }}
        ref={canvasRef}
      />
      
    </>
  );
}

// TODO: Map so I can get click on canvas

export default GrahamCanvas;


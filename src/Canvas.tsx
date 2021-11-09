/*
  TODO: for a node popped off queue, we know its shortest path so its edge going
  in should be blue. Other backedges should be red

  // TODO: When considering/comparing an edge, draw it

  TODO: I think edges maintain nodes in order they were connected so this
  is creating a wacky effect?? look into if we are treating this as a Directed or
  non directed graph???

*/

import { createCanvas } from "canvas";
import React, { useEffect, useRef, useState } from "react";

import _ from 'lodash';

interface Node {
  id: number;
  x: number;
  y: number;
  radius: number;
  prev?: Edge | null; // back pointer
  visited?: boolean;
}

interface Edge {
  n1: Node;
  n2: Node;
  w: number; // Weight will just be based off the visual length of the edge
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
  // To display for comparing path costs
  const [currentNum, setCurrentNum] = useState(0);
  const [altNum, setAltNum] = useState(0);

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

  function makeNode(x: number, y: number, visited? : boolean) {
      const n: Node = { id: nodes.length, x, y, radius, prev: null, visited };
      nodes.push(n);
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (context && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMouseDownPosX(x);
      setMouseDownPosY(y);
      setIsDragging(true);
      setCircleMouseDownIn(isInACircle(x, y));
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
      const w = Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2);
      edges.push({ n1, n2, w });
    }
    setCircleMouseDownIn(null); // reset
  }

  function justDrawEdge(n1: Node | null, n2: Node | null, color?: string) {
    
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
      if (
        mouseUpX != mouseDownPosX &&
        mouseUpY != mouseDownPosY &&
        isDragging
      ) {
        const upCircle = isInACircle(mouseUpX, mouseUpY);
        drawEdge(circleMouseDownIn, upCircle);
      } else {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        makeNode(x, y);

        redraw(edges, null, nodes);
      }
    }
    setIsDragging(false); // Mouse is no longer down
  }

  async function djikstra() {
    if (nodes) {
      const source = nodes[0]; // First node they clicked is source
      const distances = new Map();
      for (const node of nodes) {
        if (node === source) {
          distances.set(node.id, 0);
        } else {
          distances.set(node.id, Infinity);
        }
      }
      console.log('d: ', distances);
      // Optimally this would be a PQ but not doing this for simplicity and b/c this will only be ona  few nodes
      const nodesToVisit: Set<number> = new Set(nodes.map((n) => n.id));
      let current;
      console.log('n: ', nodesToVisit);
      while (nodesToVisit.size > 0) {
        // Find which node to visit
        let minDistance = Infinity;
        let idToVisit = -1;
        const nodesArray = Array.from(nodesToVisit);
        for (const id of nodesArray) {
          if (distances.get(id) <= minDistance) {
            minDistance = distances.get(id);
            idToVisit = id;
          }
        }
        if (idToVisit === -1) {
            throw new Error("Did not find minimum node")
        }
        current = idToVisit;
        // Get the node w/ this id
        let currentNode;
        for (const n of nodes) {
          if (n.id === current) {
            n.visited = true;
            currentNode = n;
            // When we visit a node, recolor it

            // TODO: highlight this
            redraw(edges, null, nodes);
            //makeNode(n.x, n.y, true);
            //colorEdges(getBackEdges(n), "blue"); // Highlight this path for animation
            await new Promise(f => setTimeout(f, 1000)); // Wait so they can see animation
          }
        }
        
        
        nodesToVisit.delete(current); // remove this one

        for (const edge of edges) {
          let otherNode;
          if (edge.n1.id === current) {
            otherNode = edge.n2;
          } else if (edge.n2.id === current) {
            otherNode = edge.n1;
          }
          if (otherNode) {
            // need to store the back edges b/c they might change
            const otherNodeOriginalBackEdges = getBackEdges(otherNode);
            // If the other node has another path to it, draw that so we can compare
            colorEdges(otherNodeOriginalBackEdges, "red"); // new edge we are looking at
            if (otherNode.visited !== true) {
              //colorEdges([edge], "purple"); // new edge we are looking at
              redraw(edges, edge, nodes);
              setAltNum(distances.get(otherNode.id));
              const newDistance = edge.w + distances.get(current);
              setCurrentNum(newDistance);
              await new Promise(f => setTimeout(f, 1000)); // Wait so they can see animation
              
              if (distances.get(otherNode.id) > newDistance) {
                distances.set(otherNode.id, newDistance);
                otherNode.prev = edge;
              }
            }
            //colorEdges(otherNodeOriginalBackEdges, "gray"); // return to normal
          }
        }

        //currentNode && colorEdges(getBackEdges(currentNode), "gray"); //Un highlight
      }
    }
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

  function colorEdges(edges: Edge[], color: string) {
    for (const e of edges) {
      justDrawEdge(e.n1, e.n2, color)
    }
  }

  //  arrow code from here: https://riptutorial.com/html5-canvas/example/18136/line-with-arrowheads
  function drawLineWithArrows(e: Edge, color: string){
    let x0, y0, x1, y1;
    x0 = e.n1.x;
    y0 = e.n1.y;
    x1 = e.n2.x;
    y1 = e.n2.y;
    const aWidth = 10;
    const aLength = 10;
    const arrowStart = false;
    const arrowEnd = true;
    if (context) {
      var dx=x1-x0;
    var dy=y1-y0;
    var angle=Math.atan2(dy,dx);
    var length=Math.sqrt(dx*dx+dy*dy);
    context.translate(x0,y0);
    context.rotate(angle);
    context.beginPath();
    context.moveTo(0,0);
    context.lineTo(length,0);
    context.strokeStyle = color; 
    if(arrowStart){
      context.moveTo(aLength,-aWidth);
      context.lineTo(0,0);
      context.lineTo(aLength,aWidth);
    }
    if(arrowEnd){
      context.moveTo(length-aLength,-aWidth);
      context.lineTo(length,0);
      context.lineTo(length-aLength,aWidth);
    }
    //
    context.stroke();
    context.setTransform(1,0,0,1,0,0);
    }
}

  function drawNodes(nodes: Node[]) {
    if (context && canvas) {
      nodes.forEach((n) => {
      let color = "";
      if (n.visited === true) {
          color = "blue"
      } else {
        color = n.id === 0 ? sourceColor : "#444444"
      }
      context.beginPath();
      context.arc(n.x, n.y, radius, 0, 2 * Math.PI, false);
      context.fillStyle = color;
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = color; // special color for source
      context.stroke();
      // If this node is visited, color its back edge w/ an arrow to show shortest path
      if (n.prev) {
        if (n.visited) {
          // shortest path edge in
          drawLineWithArrows(n.prev, "#0096FF");
        } else {
          // tentative path in
          drawLineWithArrows(n.prev, "red");
        }
      } else {
        // no path to node yet

      }
      })
    }
  }

  function drawEdges(edges: Edge[], color: string) {
    edges.forEach((e) => {
      if (e.n1 != null && e.n2 != null && e.n1.id != e.n2.id && context) {
        context.beginPath(); // Start a new path
        if (color) {
          context.strokeStyle = color;
        }
        context.moveTo(e.n1.x, e.n1.y); 
        context.lineTo(e.n2.x, e.n2.y);
        context.stroke();
      }
    })
  }

  function redraw(
    edges: Edge[],
    considerationEdge: Edge | null,
    nodes: Node[]
  ) {
    if (context) {
      context.fillStyle = "#AAAAAA";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      
      drawEdges(edges, "black");
      drawNodes(nodes);
      // Edge we are comparing current dist w/ TODO: check this
      if (considerationEdge) {
        drawEdges([considerationEdge], "purple");
      }
    }
  }


  function clear() {
    setNodes([]);
    setEdges([]);
  }

  return (
    <>
      <div style={{width: "100%"}}>
      <span>
      <button style={{ marginBottom: "20px", marginTop: "5px", marginRight: "50px" }}
        onClick={() => djikstra()}
      >
        Run Djikstra
      </button>
      {/*<button style={{ marginBottom: "20px", marginTop: "5px", marginRight: "50px" }}
        onClick={() => djikstra()}
      >
        Re-run (In development)
  </button> */}
      <button style={{ marginBottom: "20px", marginTop: "5px", marginRight: "50px" }}
        onClick={() => clear()}
      >
        Clear
      </button>
      </span>
        <span>
        <p style={{color: "purple"}}>
          {currentNum}
        </p>
        <p style={{color: "red"}}>
          {altNum}
        </p>
        </span>
      </div>
      <canvas
        onMouseDown={(e) => {
          handleMouseDown(e); // Record the down position
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
        }}
        ref={canvasRef}
      />
      
    </>
  );
}
// TODO: Map so I can get click on canvas

export default Canvas;

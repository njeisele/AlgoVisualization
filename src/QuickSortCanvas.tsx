import { createCanvas } from "canvas";
import React, { useEffect, useRef, useState } from "react";

import _ from 'lodash';


function QuickSortCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();
  const [context, setContext] = useState<CanvasRenderingContext2D | null>();
  const [maxHeight, setMaxHeight] = useState(0);
  const [numbers, setNumbers] = useState<number[]>();
  const [areFinal, setAreFinal] = useState<Boolean>(false);
  
  // Start/end indices of current quick sort
  const [left, setLeft] = useState<number>();
  const [right, setRight] = useState<number>();
  const [pivotElement, setPivotElement] = useState<number>(-1);


  async function quickSort() {
      
      if (numbers) {
          console.log(" intitial: ", numbers);
          await partition(0, numbers.length);
      }
      console.log("final: ", numbers);
      const sortedNumbers = _.cloneDeep(numbers);
      setNumbers(sortedNumbers);
      setAreFinal(true);
  }

  async function partition(start: number, end: number) {
    if (numbers) {
        //console.log("calling with: ", start, end);
        //console.log("nums are: ", numbers.slice(start, end));
        // Base case
        const count = end - start;
        if (count <= 2) {
           // console.log("meme");
            if (count === 0 || count === 1) {
                return;
            } else {
                const temp = numbers[start];
                if (numbers[start] > numbers[start + 1]) {
                    numbers[start] = numbers[start + 1];
                    numbers[start + 1] = temp;
                }
            }
            return;
        }



        // just select middle element for pivot
        const pivotElement = numbers[Math.floor((end + start) / 2)];
        ////// Visualization /////////
        setPivotElement(pivotElement);
        setLeft(start);
        setRight(end);
        //////////////////////////////
        const numbersCopy = _.cloneDeep(numbers);
        setNumbers(numbersCopy);
        await new Promise(f => setTimeout(f, 1000));
        
        
        // Count # times this element shows up
        let pivotCount = 0;
        // Count # elements less than pivot
        let lessThanPivotCount = 0;
        for (let i = start; i < end; i++) {
            if (numbers[i] === pivotElement) {
                pivotCount++;
            }
            else if (numbers[i] < pivotElement) {
                lessThanPivotCount++;
            }
        }

        // Loop through the elements, putting all the pivots into the space
        // reserved for the pivots
        let pivotPlacementIndex = lessThanPivotCount + start; // Add start to adjust this
        
        for (let i = start; i < end; i++) {
            if (i >= (start + lessThanPivotCount) && 
                i < (start + lessThanPivotCount + pivotCount)) {
                // Skip over the pivot spots
            } else {
                if (numbers[i] === pivotElement) {
                    let pivotPlacement = pivotPlacementIndex;
                    // Wouldn't want to swap it to the placement index
                    // if a pivot element already happens to be there!
                    while (numbers[pivotPlacement] === pivotElement) {
                        pivotPlacement++;
                    }
                    // swap
                    numbers[i] = numbers[pivotPlacement];
                    numbers[pivotPlacement] = pivotElement;
                    // Don't just do pivotPlacementIndex++ b/c it may have increased by multiple spots
                    pivotPlacementIndex = pivotPlacement + 1; 
                }
            }
        }
        //console.log(`nums after moving pivot into place ${start} ${end}: `, 
        //numbers.slice(start, end);

        // All instances of the pivot are now in place

        // Put everything else in place
        let a = start;
        let b = end - 1;
        while (a < start + lessThanPivotCount && b >= start + (lessThanPivotCount + pivotCount)) {
            //console.log("here3");
            if (numbers[a] < pivotElement && numbers[b] > pivotElement) {
                // No swap needed
                a++;
                b--;
                continue;
            } else if (numbers[a] < pivotElement && numbers[b] < pivotElement) {
                // a is fine, but b is not
                a++;
                continue;
            } else if (numbers[a] > pivotElement && numbers[b] > pivotElement) {
                // b is fine but a is not
                b--;
                continue;
            } else if (numbers[a] > pivotElement && numbers[b] < pivotElement) {
                // Both are out of place, swap and continue
                const temp = numbers[a];
                numbers[a] = numbers[b];
                numbers[b] = temp;
                a++;
                b--;
            }
        }

        //// Visualization ////////////////
        const sortedNumbers = _.cloneDeep(numbers);
        setNumbers(sortedNumbers);
        await new Promise(f => setTimeout(f, 500));
        ///////////////////////////////////

        // Partition is complete now, recur
        await partition(start, start + lessThanPivotCount);
        await partition(start + lessThanPivotCount + pivotCount, end);

        return;
    }
  }



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
      context.fillStyle = "#DDDDDD";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      setMaxHeight(context.canvas.height * 0.5);
    }
  }, []);

  // Redraw on updated state
  useEffect(() => {
    if (context) {
        context.fillStyle = "#AAAAAA";
        context.fillRect(0, 0, context.canvas.width , context.canvas.height);
        // Draw a line going across the middle that the numbers will go on:
        context.beginPath(); // Start a new path
        context.moveTo(0, context.canvas.height * .75); 
        context.lineTo(context.canvas.width, context.canvas.height * .75);
        context.stroke();
        if (numbers) {
            for (let i = 0; i < numbers.length; i++) {
                context.strokeStyle = "black"; // normal
                if (left && right && i >= left && i < right) {
                    // If we are in area being sorted, highlight
                    context.strokeStyle = "red"; 
                }
                if (numbers[i] == pivotElement) {
                    // highlight pivot
                    context.strokeStyle = "green"; 
                } 
                if (areFinal) {
                    // If everything is sorted, show in purple
                    context.strokeStyle = "purple";
                }
                
                context.beginPath(); // Start a new path
                const xPos = (i / numbers.length) * context.canvas.width
                context.moveTo(xPos, context.canvas.height * .75); 
                // Subtract the value b/c y increases going down screen
                context.lineTo(xPos, context.canvas.height * .75 - numbers[i]); 
                context.stroke();
            }
        }
    }
    
  }, );

  function generateNumbers() {
      setAreFinal(false);
      const total = 100; // Generate 100 numbers, this is just up to preference
      const nums: number[] = [];
      for (let i = 0; i < total; i++) {
        const x = Math.floor(Math.random() * maxHeight);
        nums.push(x);
      }
      setNumbers(nums); 
      //setNumbers([41, 72, 231, 187, 265, 205]);
  }

  return (
    <>
       <div style={{width: "100%", marginTop: 0, backgroundColor: "black"}}>
      <span>
      <button style={{ marginBottom: "20px", marginTop: "5px", marginRight: "50px" }}
        onClick={() => generateNumbers()}
      >
        Generate numbers
      </button>
      <button style={{ marginBottom: "20px", marginTop: "5px", marginRight: "50px" }}
        onClick={() => quickSort()}
      >
         Quick Sort 
      </button>
      </span>
      </div>
      <canvas
        ref={canvasRef}
      />
      
    </>
  );
}

// TODO: Map so I can get click on canvas

export default QuickSortCanvas;


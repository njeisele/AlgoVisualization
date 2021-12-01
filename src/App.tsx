import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Canvas from "./Canvas";
import GrahamCanvas from "./GrahamCanvas";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import QuickSortCanvas from "./QuickSortCanvas";


function App() {
  return (
    <div className="App">
      <header className="App-header">
          {/* Comment out one to visualiz */}
          {/* <Canvas /> */ }
          {<GrahamCanvas /> }
          {/* <QuickSortCanvas /> */}
      </header>
    </div>
  );
}

export default App;

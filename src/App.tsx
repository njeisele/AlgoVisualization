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

/*
<Router>
<Link to="/dijkstra">
  <Canvas />
</Link>
<Link to="/graham">
  <Canvas />
</Link>
</Router>
*/
function App() {
  return (
    <div className="App">
      <header className="App-header">
          {/* <Canvas /> */}
          { <GrahamCanvas /> }
      </header>
    </div>
  );
}

export default App;

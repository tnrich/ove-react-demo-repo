import React from "react";

import "./App.css";
import Local from "./Local";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "50px",
          backgroundColor: "red",
        }}
      >
        Toolbar
      </div>
      <div
        style={{
          display: "flex",
          height: "700px",
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <h1>Container</h1>
        <Local />
      </div>
      <div
        style={{
          width: "100%",
          height: "50px",
          backgroundColor: "red",
        }}
      >
        Bottom bar
      </div>
    </div>
  );
}

export default App;

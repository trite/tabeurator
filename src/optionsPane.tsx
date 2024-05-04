import React from "react";
import ReactDOM from "react-dom/client";
import Options from "./Options/Options";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);

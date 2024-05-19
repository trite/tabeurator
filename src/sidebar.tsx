import React from "react";
import ReactDOM from "react-dom/client";
import SearchWindow from "./Sidebar/Sidebar";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <SearchWindow />
  </React.StrictMode>
);

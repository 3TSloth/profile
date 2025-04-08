import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import "./App.css";

const domNode = document.getElementById("root");
if (domNode) {
  const root = createRoot(domNode);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error("Root DOM node not found");
}

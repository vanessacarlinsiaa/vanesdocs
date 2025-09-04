import React from "react";
import ReactDOM from "react-dom/client";
//import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css"; // kalau belum ada, buat filenya kosong dulu
import GlobalErrorBoundary from "./GlobalErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);

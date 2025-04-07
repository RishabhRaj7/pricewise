import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <ToastContainer
  position="bottom-center"
  autoClose={3000}
  hideProgressBar={true}
  closeOnClick
  pauseOnHover={false}
  draggable={false}
  toastStyle={{
    marginBottom: "90px", // adjust to just above the button
    borderRadius: "12px",
    textAlign: "center",
    fontSize: "15px",
    maxWidth: "280px",
    marginLeft: "auto",
    marginRight: "auto"
  }}
/>

  </React.StrictMode>
);

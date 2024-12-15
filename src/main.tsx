import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { appStatePersistence } from "./appStatePersistence.ts";
import { BrowserRouter, Route, Routes } from "react-router";
import "./scss/styles.scss";
import { Modal } from "bootstrap";
Modal;
// ^^ WORKS

const baseUrl = import.meta.env.VITE_BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <App appState={appStatePersistence(localStorage)} baseUrl={baseUrl} />
        }
      />
    </Routes>
  </BrowserRouter>,
  // </React.StrictMode>
);

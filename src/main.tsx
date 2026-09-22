import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource-variable/open-sans";
import "./index.css";
import "./workspace.css";

createRoot(document.getElementById("root")!).render(<App />);

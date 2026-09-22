import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "@fontsource-variable/open-sans";
import "./index.css";
import "./workspace.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem={false}
    storageKey="lily-portfolio-theme"
    disableTransitionOnChange
  >
    <App />
  </ThemeProvider>,
);

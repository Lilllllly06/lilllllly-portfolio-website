import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import Dashboard from "./Dashboard";
import "@fontsource-variable/open-sans";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="lily-usage-theme">
    <Dashboard />
  </ThemeProvider>,
);

import { defineConfig, loadEnv, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { handleChat } from "./server/chat";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: "portfolio-chat",
      configureServer(server: ViteDevServer) {
        const env = {
          ...process.env,
          ...loadEnv(mode, process.cwd(), [
            "PORTFOLIO_",
            "OPENAI_API_KEY",
            "GEMINI_API_KEY",
          ]),
        };
        server.middlewares.use("/api/chat", (req, res) => {
          void handleChat(req, res, env);
        });
      },
    },
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

import express from "express";
import path from "node:path";
import { spawn, exec } from "node:child_process";
import fs from "node:fs";
import { createServer as createViteServer } from "vite";
import app from "./server/app";

const PORT = 3000;

async function startServer() {
  // Mount Vite dev server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        res.sendStatus(404);
        return;
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Auto-launch desktop app window in production on Windows
    const isProd = process.env.NODE_ENV === "production";
    const isPkg = (process as any).pkg || false;

    if ((isProd || isPkg) && process.platform === "win32") {
      const edgePaths = [
        process.env["ProgramFiles(x86)"] + "\\Microsoft\\Edge\\Application\\msedge.exe",
        process.env["ProgramFiles"] + "\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
      ];

      let edgePath = "";
      for (const p of edgePaths) {
        if (p && fs.existsSync(p)) {
          edgePath = p;
          break;
        }
      }

      const url = `http://localhost:${PORT}/pos`;

      if (edgePath) {
        const profileDir = path.join(process.cwd(), "data", "browser-profile");
        if (!fs.existsSync(path.join(process.cwd(), "data"))) {
          fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
        }

        const browserProcess = spawn(edgePath, [
          `--app=${url}`,
          `--user-data-dir=${profileDir}`,
          "--no-first-run",
          "--no-default-browser-check"
        ], {
          stdio: "ignore"
        });

        browserProcess.on("exit", () => {
          console.log("Desktop window closed. Exiting server...");
          process.exit(0);
        });

        browserProcess.on("error", () => {
          exec(`start ${url}`);
        });
      } else {
        exec(`start ${url}`);
      }
    }
  });
}

startServer();

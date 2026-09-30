import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// 本地开发用的自签证书是可选的：仅当 ssl/ 下证书存在时才启用 HTTPS。
// CI / dmit 等无证书环境走 HTTP，避免构建因缺少证书直接失败。
const sslKey = path.resolve("ssl/server.key");
const sslCert = path.resolve("ssl/server.crt");
const https =
  fs.existsSync(sslKey) && fs.existsSync(sslCert)
    ? { key: fs.readFileSync(sslKey), cert: fs.readFileSync(sslCert) }
    : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    ...(https ? { https } : {}),
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

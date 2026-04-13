# @ygohel18/mcp-template 🚀

My most comprehensive, production-ready Model Context Protocol (MCP) starter kit. I built this for developers who need OAuth, SSE, and multi-platform compatibility out of the box.

## 🌟 Key Features

- **ChatGPT OAuth Ready**: Fully implemented OAuth2 flow for connecting SSE servers to ChatGPT custom connectors.
- **Robust SSE Engine**: Custom SSE implementation that survives Nginx, Cloudflare, and Proxy buffering.
- **Dual Endpoint Support**: Exposes both `/sse` and `/mcp` to support various studio clients simultaneously.
- **Cross-Platform**: 
  - **Claude** (via Bedrock/Kiro)
  - **VS Code** (SSE support)
  - **LM Studio** (Native MCP)
  - **Kiro CLI** (Stdio support)
  - **Google Gemma** (Ready for `skills.md` ingestion)
- **Minimalist Core**: Only 2 tools (`ping`, `pong`) to ensure you can build your logic without clutter.
- **Modern Stack**: TypeScript, NodeNext, ESM, Winston Logger, Express 5.

## 🚀 Quick Start

1. **Install**:
   ```bash
   npm install
   ```
2. **Setup Env**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
3. **Run**:
   ```bash
   # Stdio mode (Local)
   npm run dev
   
   # SSE mode (Cloud/IDE)
   export MCP_TRANSPORT=sse
   npm run dev
   ```

## 🛠️ Included Tools

- **`ping`**: Returns "pong" with a timestamp. Perfect for testing connectivity.
- **`pong`**: Returns "ping". 

## 🔐 OAuth Configuration (ChatGPT)

To connect this server to ChatGPT as a custom connector:
1. Deploy to a public URL (e.g., via Ngrok or Railway).
2. In ChatGPT, set **Authentication** to `OAuth`.
3. **Client ID**: Any (Matches your `.env`).
4. **Authorization URL**: `https://your-domain.com/oauth/authorize`
5. **Token URL**: `https://your-domain.com/oauth/token`

## 💻 VS Code & LM Studio
- **VS Code**: Use the `MCP Config` extension and point it to `http://localhost:3000/sse`.
- **LM Studio**: Use the SSE URL: `http://localhost:3000/mcp` or `http://localhost:3000/sse`.

## 💎 Support & Skills
- **Connection Guide**: Check [MCP_CONNECTION_GUIDE.md](./MCP_CONNECTION_GUIDE.md) for step-by-step setup for ChatGPT, VS Code, LM Studio, and more.
- **Skills**: Check [skills/skills.md](./skills/skills.md) for detailed integration guides for Google Gemma and Amazon Bedrock.

## 🚢 Deployment

### 🐳 Docker & Dokploy
This repository is optimized for **Dokploy** and standard Docker environments.

**Option 1: Docker Compose**
```bash
npm run docker:up
```

**Option 2: Dokploy**
1. Port forward or deploy to your VPS.
2. In Dokploy, create a new **Compose** or **Application**.
3. Point to this repository; it will automatically use the `Dockerfile` and `docker-compose.yml`.
4. Ensure you set the environment variables in the Dokploy dashboard.

### 🟢 Standalone (PM2)
For production deployment without containers:
```bash
npm run build
npm run pm2:start
```
Use `npm run pm2:logs` to monitor output.

## ✍️ Author

**Yash Gohel**
- **Website**: [yashgohel.com](https://yashgohel.com)
- **Blog**: [blog.yashgohel.com](https://blog.yashgohel.com)
- **GitHub**: [@ygohel18](https://github.com/ygohel18)
- **Instagram**: [@ygohel18](https://instagram.com/ygohel18)
- **X**: [@ygohel18](https://x.com/ygohel18)
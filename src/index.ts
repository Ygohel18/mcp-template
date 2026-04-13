#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import cors from "cors";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { logger } from "./logger.js";
import { appConfig } from "./config.js";

/**
 * MCP Server Template (Built for production)
 * 
 * Features:
 * - SSE Transport with Manual Fix (Works with Nginx/Cloudflare)
 * - ChatGPT/OpenAI OAuth Connector (User-defined OAuth compatible)
 * - Claude, VS Code, LM Studio, Kiro CLI, .codex compatible
 * - Minimalist "Ping/Pong" toolset for rapid testing
 */

const server = new Server(
	{ name: appConfig.NAME, version: appConfig.VERSION },
	{ capabilities: { tools: {} } }
);

// --- Tools (Minimalist Ping/Pong) ---
const TOOLS = [
	{
		name: "ping",
		description: "Standard health check. Returns 'pong' with a timestamp.",
		inputSchema: {
			type: "object",
			properties: {
				message: { type: "string", description: "Optional message to include" }
			}
		}
	},
	{
		name: "pong",
		description: "Inverse health check. Returns 'ping'.",
		inputSchema: {
			type: "object",
			properties: {}
		}
	}
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;
	logger.debug("Tool called", { name });

	try {
		let result: any;

		switch (name) {
			case "ping":
				result = {
					response: "pong",
					timestamp: new Date().toISOString(),
					received: (args as any)?.message || "none"
				};
				break;
			case "pong":
				result = { response: "ping" };
				break;
			default:
				throw new Error(`Unknown tool: ${name}`);
		}

		return {
			content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
		};
	} catch (error: any) {
		logger.error("Tool error", { name, error: error.message });
		return {
			content: [{ type: "text", text: `Error: ${error.message}` }],
			isError: true,
		};
	}
});

const main = async () => {
	const transportMode = appConfig.MCP_TRANSPORT;

	// --- OAuth Storage (In-memory) ---
	const oauthCodes = new Map<string, { clientId: string, redirectUri: string, expiresAt: number }>();
	const oauthTokens = new Map<string, { clientId: string, expiresAt: number }>();

	if (transportMode === "sse") {
		const app = express();
		app.use(cors());
		app.use(express.json());

		// --- Public Endpoints ---
		app.get("/", (req, res) => {
			res.json({
				status: "ok",
				server: appConfig.NAME,
				version: appConfig.VERSION,
				integrations: ["ChatGPT OAuth", "Claude", "VS Code", "LM Studio", "Kiro", "Gemma"]
			});
		});

		// --- ChatGPT / OpenAI OAuth Endpoints ---
		app.get("/oauth/authorize", (req, res) => {
			const { client_id, redirect_uri, state, response_type } = req.query;

			logger.info("OAuth Authorization Request", { client_id, redirect_uri });

			if (appConfig.OAUTH_CLIENT_ID && client_id !== appConfig.OAUTH_CLIENT_ID) {
				return res.status(400).json({ error: "Invalid client_id" });
			}

			const code = "auth_" + Math.random().toString(36).substring(2);
			oauthCodes.set(code, {
				clientId: client_id as string,
				redirectUri: redirect_uri as string,
				expiresAt: Date.now() + 600000
			});

			const redirectUrl = new URL(redirect_uri as string);
			redirectUrl.searchParams.append("code", code);
			if (state) redirectUrl.searchParams.append("state", state as string);

			res.redirect(redirectUrl.toString());
		});

		app.post("/oauth/token", express.urlencoded({ extended: true }), (req, res) => {
			const { grant_type, code, client_id, client_secret } = req.body;

			// Handle Basic Auth
			let effectiveClientId = client_id;
			let effectiveClientSecret = client_secret;
			const authHeader = req.headers.authorization;
			if (authHeader?.startsWith("Basic ")) {
				const [cid, csec] = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
				effectiveClientId = cid;
				effectiveClientSecret = csec;
			}

			if (grant_type !== "authorization_code") return res.status(400).json({ error: "unsupported_grant_type" });

			const storedCode = oauthCodes.get(code);
			if (!storedCode || storedCode.expiresAt < Date.now()) return res.status(400).json({ error: "invalid_grant" });

			oauthCodes.delete(code);

			const accessToken = "at_" + Math.random().toString(36).substring(2);
			oauthTokens.set(accessToken, {
				clientId: effectiveClientId,
				expiresAt: Date.now() + 3600000 * 24 * 30 // 30 days
			});

			res.json({
				access_token: accessToken,
				token_type: "Bearer",
				expires_in: 3600 * 24 * 30
			});
		});

		// --- Auth Middleware ---
		app.use(["/sse", "/message"], (req, res, next) => {
			const authHeader = req.headers.authorization;
			const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : (req.query.token as string || req.query.access_token as string);

			if (!token) return res.status(401).json({ error: "Unauthorized" });

			if (appConfig.MCP_BEARER_TOKEN && token === appConfig.MCP_BEARER_TOKEN) return next();

			const oauthToken = oauthTokens.get(token);
			if (oauthToken && oauthToken.expiresAt > Date.now()) return next();

			return res.status(403).json({ error: "Forbidden: Invalid Token" });
		});

		// --- Robust SSE Implementation (Shared logic for /sse and /mcp) ---
		const sessions = new Map<string, any>();

		const handleSSE = async (req: express.Request, res: express.Response) => {
			const sessionId = Math.random().toString(36).substring(7);

			res.setHeader("Content-Type", "text/event-stream");
			res.setHeader("Cache-Control", "no-cache, no-transform");
			res.setHeader("Connection", "keep-alive");
			res.setHeader("X-Accel-Buffering", "no");
			res.flushHeaders();

			const mcpTransport: any = {
				onclose: undefined,
				onerror: undefined,
				onmessage: undefined,
				start: async () => {
					const token = req.query.token || req.query.access_token || (req.headers.authorization?.split(" ")[1] || "");
					const baseUrl = req.baseUrl || "";
					res.write(`event: endpoint\ndata: ${baseUrl}/message?sessionId=${sessionId}&token=${token}\n\n`);
				},
				send: async (message: any) => {
					if (!res.writableEnded) {
						res.write(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
					}
				},
				close: async () => {
					if (!res.writableEnded) res.end();
				}
			};

			sessions.set(sessionId, { transport: mcpTransport });
			await server.connect(mcpTransport);

			// Keep connections alive for LM Studio/VS Code
			const keepAlive = setInterval(() => {
				if (!res.writableEnded) res.write(": keep-alive\n\n");
			}, 15000);

			req.on("close", () => {
				clearInterval(keepAlive);
				sessions.delete(sessionId);
				logger.info("SSE Connection closed", { sessionId });
			});
		};

		app.get("/sse", handleSSE);
		app.get("/mcp", handleSSE);

		app.post("/message", async (req, res) => {
			const sessionId = req.query.sessionId as string;
			const session = sessions.get(sessionId);
			if (session?.transport.onmessage) {
				await session.transport.onmessage(req.body);
			}
			res.status(200).send("OK");
		});

		const port = appConfig.PORT;
		app.listen(port, "0.0.0.0", () => {
			logger.info(`MCP Ultimate Template listening on 0.0.0.0:${port} (SSE MODE)`);
		});
	} else {
		const transport = new StdioServerTransport();
		await server.connect(transport);
		logger.info("MCP Ultimate Template started (STDIO MODE)");
	}
};

main().catch(logger.error);

import dotenv from "dotenv";
dotenv.config();

export const appConfig = {
	NAME: "@ygohel18/mcp-template",
	VERSION: "1.0.0",
	PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
	MCP_TRANSPORT: process.env.MCP_TRANSPORT || "stdio",
	MCP_BEARER_TOKEN: process.env.MCP_BEARER_TOKEN,
	OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
	OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
	OAUTH_REDIRECT_URI: process.env.OAUTH_REDIRECT_URI,
	AWS_REGION: process.env.AWS_REGION || "us-east-1",
	AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

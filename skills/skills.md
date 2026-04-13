# MCP Server Skills & Integrations

## 🤖 ChatGPT/OpenAI Connector
- **Type**: User-Defined OAuth2
- **Config**: 
  - Authorization URL: `/oauth/authorize`
  - Token URL: `/oauth/token`
  - Scope: `read`, `write` (Internal tracking)
- **Feature**: Supports ChatGPT custom tools with authentication.

## 🌩️ Claude & Bedrock (Kiro Powers)
- **Status**: Supported via `src/tools/awsTools.ts`
- **Model Support**: Claude 3 Opus, Sonnet, Haiku via Amazon Bedrock.
- **Skills**: High-precision reasoning, logic puzzles, and multi-step tool use.

## 💻 VS Code & .codex Support
- **Transport**: SSE (Server-Sent Events)
- **URL**: `http://localhost:3000/sse`
- **Extension**: Works with "MCP Config" or Native VS Code MCP bridging.

## 🎙️ LM Studio support
- **Transport**: SSE
- **URL**: `http://localhost:3000/sse`
- **Mode**: Local inference bridging via standard MCP protocol.

## 🧪 Goggle Gemma Skills
- **Skills.md Path**: `skills/skills.md`
- **Capabilities**: Local LLM steering, prompt stabilization for 7b/2b models.

## 🛠️ Kiro CLI Support
- **Status**: Full compatibility with CLI-based transport (`stdio`).
- **Command**: `mcp-template`

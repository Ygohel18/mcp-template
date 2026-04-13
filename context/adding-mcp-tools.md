# Adding New MCP Tools (Developer Guide)

This guide is for AI IDEs (Cursor, Windsurf, Antigravity, Kiro, Codex, Claude) and developers on how to extend this MCP server with new capabilities.

---

## 1. Overview of Tool Definition
Tools in this template are centrally managed in `src/index.ts`. To add a new tool, you need to follow two primary steps:
1.  **Register the Tool Metadata**: Add the tool definition to the `TOOLS` array.
2.  **Implement the Logic**: Add a case to the request handler's `switch` statement.

---

## 2. Step-by-Step Implementation

### A. Register Metadata
Locate the `TOOLS` array in `src/index.ts` and add your tool's JSON schema:

```typescript
const TOOLS = [
    // ... existing tools
    {
        name: "my_new_tool",
        description: "Does something amazing.",
        inputSchema: {
            type: "object",
            properties: {
                param1: { type: "string", description: "A required input" }
            },
            required: ["param1"]
        }
    }
];
```

### B. Handle the Request
Navigate to `server.setRequestHandler(CallToolRequestSchema, ...)` and add a case for your tool:

```typescript
switch (name) {
    case "ping":
        // ...
    case "my_new_tool":
        const { param1 } = args as { param1: string };
        result = await handleMyNewTool(param1); // Implementation call
        break;
}
```

---

## 3. Organizing Complex Logic
For complex tools (e.g., AWS, OpenAI, Database), do not write logic inline in `index.ts`. 

1.  **Create a file** in `src/tools/` (e.g., `myServices.ts`).
2.  **Export an async function** that handles the heavy lifting.
3.  **Import and call** that function in `src/index.ts`.

Example structure:
- `src/tools/awsTools.ts`: Logic for Bedrock/S3.
- `src/tools/openaiTools.ts`: Logic for Assistants/GPT.

---

## 4. Best Practices for AI IDEs
When asked to "Add a tool that does X", the AI should:
1.  **Check `src/config.ts`**: See if new environment variables (API keys) are needed.
2.  **Check `package.json`**: See if new SDKs (like `@google/generative-ai`) are needed.
3.  **Be Atomic**: Update `TOOLS` and the `switch` statement in one turn.
4.  **Use Logger**: Always use `logger.info` or `logger.error` for debugging visibility in the MCP inspector.

---

## 5. Error Handling
Always wrap tool logic in a `try/catch` block (the template already does this at the handler level). Return meaningful error messages so the LLM using the tool can self-correct:

```typescript
return {
    content: [{ type: "text", text: `Error: ${error.message}` }],
    isError: true,
};
```

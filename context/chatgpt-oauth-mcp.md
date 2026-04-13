# Implementing ChatGPT OAuth for MCP Servers

This guide explains how to add OAuth2 support to an MCP (Model Context Protocol) server so it can be connected as a **ChatGPT Connector**.

---

## 1. Overview of the Flow
1. **Discovery**: ChatGPT attempts to reach your MCP server.
2. **Authorization**: ChatGPT redirects the user to your `/oauth/authorize` endpoint.
3. **Code Exchange**: Your server provides an authorization code, which ChatGPT then exchanges for an `access_token` via your `/oauth/token` endpoint.
4. **Authenticated Requests**: ChatGPT calls your MCP tools with an `Authorization: Bearer <token>` header (or a `token` query parameter).

---

## 2. Prerequisites
- A public URL (HTTPS) for your server (e.g., via Ngrok, Cloudflare Tunnel, or VPS).
- A database or persistent storage (MySQL, SQLite, etc.) to store codes and tokens.

### Database Schema (Example)
```sql
CREATE TABLE oauth_codes (
  code VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255),
  redirect_uri TEXT,
  expires_at TIMESTAMP
);

CREATE TABLE oauth_tokens (
  access_token VARCHAR(255) PRIMARY KEY,
  refresh_token VARCHAR(255),
  client_id VARCHAR(255),
  expires_at TIMESTAMP
);
```

---

## 3. Implementing the Endpoints

### A. Authorization Endpoint (`GET /oauth/authorize`)
This endpoint is where the user "logs in." For most MCP bots, you can automatically redirect back to ChatGPT.

**Query Parameters received:**
- `client_id`
- `redirect_uri`
- `state`
- `response_type` (usually `code`)

**Logic:**
1. Verify `client_id`.
2. Generate a random `code`.
3. Store the `code` and `redirect_uri` with an expiration (e.g., 10 mins).
4. Redirect back to `redirect_uri?code=...&state=...`.

### B. Token Endpoint (`POST /oauth/token`)
This endpoint exchanges the code for a token.

**Body (application/x-www-form-urlencoded):**
- `grant_type`: `authorization_code`
- `code`: The code you just issued.
- `client_id` / `client_secret` (may also come in `Basic Auth` header).

**Logic:**
1. Verify `client_id` and `client_secret`.
2. Look up the `code` in your DB.
3. Generate an `access_token` and `refresh_token`.
4. Store the token in the DB.
5. Return JSON:
   ```json
   {
     "access_token": "...",
     "token_type": "Bearer",
     "expires_in": 2592000
   }
   ```

---

## 4. Protecting the MCP Endpoints
Your `/mcp` or `/register` paths must now validate these tokens.

### Authentication Middleware Strategy
Modern MCP clients might use different ways to send the token. Your middleware should check:
1. **Header**: `Authorization: Bearer <token>`
2. **Query String**: `?token=...` or `?access_token=...` (Crucial for SSE support).

```javascript
async function validate(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const queryToken = req.query.token || req.query.access_token;
    
    let token = authHeader.replace("Bearer ", "") || queryToken;
    
    const isValid = await checkDbForToken(token);
    if (isValid) return next();
    
    res.status(401).send("Unauthorized");
}
```

---

## 5. ChatGPT Configuration
In the ChatGPT "Actions" or "Connectors" dashboard, use these settings:

| Field | Value |
| :--- | :--- |
| **Auth URL** | `https://your-domain.com/oauth/authorize` |
| **Token URL** | `https://your-domain.com/oauth/token` |
| **Callback URL** | Copy from ChatGPT (add to your allowed list if needed) |
| **Scopes** | Usually leave blank or use `base` |
| **Token Auth Method** | `Post` or `Basic Auth` |

---

## 6. Common Pitfalls
- **SSE Headers**: Browser-based SSE clients often cannot set custom headers. Always implement the **query parameter fallback** for authentication.
- **URL Encoding**: Ensure your token endpoint handles `application/x-www-form-urlencoded` bodies.
- **CORS**: Ensure `Authorization` is in your `Access-Control-Allow-Headers` list.

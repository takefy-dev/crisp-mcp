import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "node:http";
import crypto from "node:crypto";
import { crispClient } from "./client/crisp-client.js";
import { OAuthProvider } from "./auth.js";

import { registerConversationTools } from "./tools/conversations.js";
import { registerMessageTools } from "./tools/messages.js";
import { registerPeopleTools } from "./tools/people.js";
import { registerHelpdeskTools } from "./tools/helpdesk.js";
import { registerOperatorTools } from "./tools/operators.js";
import { registerAnalyticsTools } from "./tools/analytics.js";
import { registerCampaignTools } from "./tools/campaigns.js";
import { registerWebsiteTools } from "./tools/website.js";

function createServer(): McpServer {
  const server = new McpServer({
    name: "crisp",
    version: "1.0.0",
  });

  registerConversationTools(server, crispClient);
  registerMessageTools(server, crispClient);
  registerPeopleTools(server, crispClient);
  registerHelpdeskTools(server, crispClient);
  registerOperatorTools(server, crispClient);
  registerAnalyticsTools(server, crispClient);
  registerCampaignTools(server, crispClient);
  registerWebsiteTools(server, crispClient);

  return server;
}

const MODE = process.env.MCP_TRANSPORT || "stdio";
const PORT = parseInt(process.env.PORT || "3000", 10);
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

async function main() {
  if (MODE === "http") {
    const oauth = new OAuthProvider(SERVER_URL);

    const sessions = new Map<string, StreamableHTTPServerTransport>();

    const httpServer = http.createServer(async (req, res) => {
      const url = new URL(req.url || "/", SERVER_URL);
      console.error(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);

      if (req.method === "GET" && url.pathname === "/health") {
        res.writeHead(200);
        res.end("ok");
        return;
      }

      if (await oauth.handleRequest(req, res)) {
        console.error(`  -> OAuth`);
        return;
      }

      if (url.pathname === "/mcp") {
        try {
          const sessionId = req.headers["mcp-session-id"] as string | undefined;

          if (sessionId) {
            const sessionTransport = sessions.get(sessionId);
            if (!sessionTransport) {
              res.writeHead(404);
              res.end("Session not found");
              return;
            }
            console.error(`  -> session ${sessionId}`);
            await sessionTransport.handleRequest(req, res);
            if (req.method === "DELETE") sessions.delete(sessionId);
            console.error(`  <- ${res.statusCode}`);
            return;
          }

          if (req.method === "POST") {
            console.error("  -> new session");

            const transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => crypto.randomUUID(),
              enableJsonResponse: true,
            });
            transport.onerror = (err) => console.error("  !! transport error:", err);
            transport.onclose = () => {
              if (transport.sessionId) sessions.delete(transport.sessionId);
            };

            const mcpServer = createServer();
            await mcpServer.connect(transport);
            await transport.handleRequest(req, res);

            if (transport.sessionId) {
              sessions.set(transport.sessionId, transport);
              console.error(`  <- ${res.statusCode} (session: ${transport.sessionId})`);
            } else {
              console.error(`  <- ${res.statusCode} (no session ID)`);
            }
          } else if (req.method === "GET") {
            res.writeHead(400);
            res.end("Missing mcp-session-id");
          } else if (req.method === "DELETE") {
            res.writeHead(404);
            res.end("Session not found");
          } else {
            res.writeHead(405);
            res.end("Method not allowed");
          }
        } catch (err) {
          console.error(`  !! MCP ERROR:`, err);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: String(err) }, id: null }));
          }
        }
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    httpServer.listen(PORT, () => {
      console.error(`Crisp MCP server running on ${SERVER_URL}/mcp`);
      console.error(`OAuth metadata at ${SERVER_URL}/.well-known/oauth-authorization-server`);
    });
  } else {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Crisp MCP server running on stdio");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

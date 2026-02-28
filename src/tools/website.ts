import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveWebsiteId, handleToolError } from "../client/crisp-client.js";

export function registerWebsiteTools(server: McpServer, crisp: any) {
  // 1. Get website details
  server.tool(
    "get_website",
    "Get general details about the website. Returns the website object including its name, domain, creation date, and plan information.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getWebsite(wid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 2. Get website settings
  server.tool(
    "get_website_settings",
    "Get the full settings and configuration for the website. Returns settings such as chat appearance, language, business hours, notification preferences, and integration configurations.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getWebsiteSettings(wid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 3. Get website availability status
  server.tool(
    "get_website_availability",
    "Get the current availability status of the website. Returns whether the website is 'online', 'offline', or 'away', reflecting operator availability for live chat.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getWebsiteAvailabilityStatus(wid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 4. List inboxes
  server.tool(
    "list_inboxes",
    "List all inbox categories configured for the website. Returns the available inboxes that conversations can be routed to, including their names and IDs.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.listInboxes(wid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}

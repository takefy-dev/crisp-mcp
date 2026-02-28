import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveWebsiteId, handleToolError } from "../client/crisp-client.js";

export function registerAnalyticsTools(server: McpServer, crisp: any) {
  // 1. Get analytics
  server.tool(
    "get_analytics",
    "Get website analytics for a specified date range and metric. Returns aggregated data that can be optionally split by time period (e.g. day, month). Use this to retrieve traffic, conversation, and performance metrics.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      metric: z
        .string()
        .describe("The analytics metric to query (e.g. 'conversations', 'messages', 'visitors')"),
      date_from: z
        .string()
        .describe("Start date for the analytics range in ISO 8601 format (e.g. '2025-01-01')"),
      date_to: z
        .string()
        .describe("End date for the analytics range in ISO 8601 format (e.g. '2025-01-31')"),
      split_by: z
        .string()
        .optional()
        .describe("Time period to split results by (e.g. 'day', 'month'). Omit for a single aggregate result."),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.generateAnalytics(wid, {
          metric: params.metric,
          date_from: params.date_from,
          date_to: params.date_to,
          split_by: params.split_by,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 2. Count visitors
  server.tool(
    "count_visitors",
    "Get the count of currently active (online) visitors on the website. Returns a number representing how many visitors are browsing the site right now.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.countVisitors(wid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 3. List visitors
  server.tool(
    "list_visitors",
    "List currently active visitors on the website, paginated. Returns visitor details including their browsing session info, location, and current page. Use page parameter to navigate through results.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      page: z
        .number()
        .optional()
        .default(1)
        .describe("Page number for pagination (defaults to 1)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.listVisitors(wid, params.page);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}

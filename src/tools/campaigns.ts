import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveWebsiteId, handleToolError } from "../client/crisp-client.js";

export function registerCampaignTools(server: McpServer, crisp: any) {
  // 1. List campaigns
  server.tool(
    "list_campaigns",
    "List all campaigns for the website, paginated. Returns an array of campaign summaries including their IDs, names, types, and statuses. Use page parameter to navigate through results.",
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
        const result = await crisp.website.listCampaigns(wid, params.page);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 2. Get campaign details
  server.tool(
    "get_campaign",
    "Get full details of a specific campaign by its ID. Returns the complete campaign object including its name, type, status, content, targeting rules, and performance statistics.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      campaign_id: z
        .string()
        .describe("The ID of the campaign to retrieve"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getCampaign(wid, params.campaign_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}

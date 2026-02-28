import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveWebsiteId, handleToolError } from "../client/crisp-client.js";

export function registerOperatorTools(server: McpServer, crisp: any) {
  // 1. List all operators
  server.tool(
    "list_operators",
    "List all operators (team members) on the website. Returns an array of operator objects including their user IDs, emails, roles, and availability status.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.listWebsiteOperators(wid);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 2. Get operator details
  server.tool(
    "get_operator",
    "Get detailed information about a specific operator by their user ID. Returns the operator's profile including email, role, availability, and other account details.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      user_id: z
        .string()
        .describe("The user ID of the operator to retrieve"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getWebsiteOperator(wid, params.user_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 3. Invite a new operator
  server.tool(
    "invite_operator",
    "Invite a new operator to the website by email address. The invited user will receive an email invitation to join the team. You can optionally specify their role (defaults to 'member').",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      email: z
        .string()
        .describe("Email address of the person to invite as an operator"),
      role: z
        .enum(["owner", "admin", "member"])
        .optional()
        .describe("Role to assign to the invited operator (defaults to 'member')"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.inviteWebsiteOperator(wid, {
          email: params.email,
          role: params.role || "member",
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}

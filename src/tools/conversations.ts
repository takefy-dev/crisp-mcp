import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveWebsiteId, handleToolError } from "../client/crisp-client.js";

export function registerConversationTools(server: McpServer, crisp: any) {
  // 1. List conversations
  server.tool(
    "list_conversations",
    "List conversations for a website, paginated. Returns an array of conversation summaries including session IDs, states, and participant info. Use page parameter to navigate through results.",
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
        const result = await crisp.website.listConversations(wid, params.page);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 2. Get conversation details
  server.tool(
    "get_conversation",
    "Get full details of a specific conversation by its session ID. Returns the complete conversation object including messages, state, metadata, and participant information.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      session_id: z
        .string()
        .describe("The session ID of the conversation to retrieve"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getConversation(wid, params.session_id);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 3. Create a new conversation
  server.tool(
    "create_conversation",
    "Create a new empty conversation on the website. Returns the newly created conversation object with its session ID. You can then send messages to it or update its metadata.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.createNewConversation(wid);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 4. Update conversation state
  server.tool(
    "update_conversation_state",
    "Change the state of a conversation. Use 'pending' for conversations awaiting action, 'unresolved' for open/active conversations, or 'resolved' to mark a conversation as closed/completed.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      session_id: z
        .string()
        .describe("The session ID of the conversation to update"),
      state: z
        .enum(["pending", "unresolved", "resolved"])
        .describe(
          "The new state for the conversation: 'pending', 'unresolved', or 'resolved'"
        ),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.changeConversationState(
          wid,
          params.session_id,
          params.state
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 5. Get conversation metas
  server.tool(
    "get_conversation_metas",
    "Get the visitor metadata for a conversation. Returns information such as the visitor's nickname, email, phone, avatar, segments, and any custom data associated with the conversation.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      session_id: z
        .string()
        .describe("The session ID of the conversation"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getConversationMetas(
          wid,
          params.session_id
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 6. Update conversation metas
  server.tool(
    "update_conversation_metas",
    "Update the visitor metadata for a conversation. Only the fields you provide will be updated. Use this to set a visitor's nickname, email, phone, avatar URL, segments, or custom data key-value pairs.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      session_id: z
        .string()
        .describe("The session ID of the conversation to update"),
      nickname: z
        .string()
        .optional()
        .describe("Visitor display name / nickname"),
      email: z.string().optional().describe("Visitor email address"),
      phone: z.string().optional().describe("Visitor phone number"),
      avatar: z.string().optional().describe("URL to the visitor's avatar image"),
      segments: z
        .string()
        .optional()
        .describe(
          'JSON string of a segments array, e.g. \'["vip","returning"]\'. Parsed into an array before sending.'
        ),
      data: z
        .string()
        .optional()
        .describe(
          'JSON string of custom data object, e.g. \'{"plan":"pro","company":"Acme"}\'. Parsed into an object before sending.'
        ),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);

        const metas: Record<string, unknown> = {};

        if (params.nickname !== undefined) metas.nickname = params.nickname;
        if (params.email !== undefined) metas.email = params.email;
        if (params.phone !== undefined) metas.phone = params.phone;
        if (params.avatar !== undefined) metas.avatar = params.avatar;

        if (params.segments !== undefined) {
          metas.segments = JSON.parse(params.segments);
        }

        if (params.data !== undefined) {
          metas.data = JSON.parse(params.data);
        }

        const result = await crisp.website.updateConversationMetas(
          wid,
          params.session_id,
          metas
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 7. Assign conversation to an operator
  server.tool(
    "assign_conversation",
    "Assign a conversation to a specific operator by their user ID. This routes the conversation so that the designated operator is responsible for handling it.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      session_id: z
        .string()
        .describe("The session ID of the conversation to assign"),
      operator_user_id: z
        .string()
        .describe("The user ID of the operator to assign the conversation to"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.assignConversationRouting(
          wid,
          params.session_id,
          { assigned: { user_id: params.operator_user_id } }
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 8. Get conversation routing
  server.tool(
    "get_conversation_routing",
    "Get the current operator routing assignment for a conversation. Returns which operator (if any) is currently assigned to handle the conversation.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      session_id: z
        .string()
        .describe("The session ID of the conversation"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getConversationRoutingAssign(
          wid,
          params.session_id
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 9. Mark conversation as read
  server.tool(
    "mark_conversation_read",
    "Mark all messages in a conversation as read from the operator side. Useful after processing or reviewing a conversation's messages.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      session_id: z
        .string()
        .describe("The session ID of the conversation to mark as read"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.markMessagesReadInConversation(
          wid,
          params.session_id,
          { from: "operator", origin: "urn:crisp.im:mcp:0" }
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}

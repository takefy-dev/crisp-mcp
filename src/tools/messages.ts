import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveWebsiteId, handleToolError } from "../client/crisp-client.js";

export function registerMessageTools(server: McpServer, crisp: any) {
  // 1. Get messages in a conversation (with cursor pagination)
  server.tool(
    "get_messages",
    "Retrieve messages in a conversation. Returns messages in reverse chronological order. Use timestamp_before for pagination to fetch older messages.",
    {
      website_id: z.string().optional().describe("Website ID (uses default if not provided)"),
      session_id: z.string().describe("The conversation session ID to retrieve messages from"),
      timestamp_before: z.number().optional().describe("Unix timestamp (in milliseconds) to fetch messages before. Used for pagination — pass the timestamp of the oldest message from the previous page to load older messages."),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getMessagesInConversation(
          wid,
          params.session_id,
          params.timestamp_before ?? undefined
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 2. Send a message in a conversation
  server.tool(
    "send_message",
    "Send a message in a conversation. Supports text messages, internal notes (visible only to operators), and file attachments. The 'origin' field identifies where the message was sent from.",
    {
      website_id: z.string().optional().describe("Website ID (uses default if not provided)"),
      session_id: z.string().describe("The conversation session ID to send the message in"),
      type: z.enum(["text", "note", "file"]).describe("Message type: 'text' for a regular message, 'note' for an internal note only visible to operators, 'file' for a file attachment"),
      from: z.enum(["operator", "user"]).describe("Who the message is from: 'operator' for support agent, 'user' for the end user"),
      origin: z.string().describe("Origin identifier for the message source (e.g. 'chat', 'email')"),
      content: z.string().describe("Message content. For type 'text' or 'note', provide a plain text string. For type 'file', provide a JSON string with file metadata (e.g. {\"name\": \"file.pdf\", \"url\": \"https://...\", \"type\": \"application/pdf\"})."),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);

        let content: string | object = params.content;
        if (params.type === "file") {
          content = JSON.parse(params.content);
        }

        const messageObject = {
          type: params.type,
          from: params.from,
          origin: params.origin,
          content,
        };

        const result = await crisp.website.sendMessageInConversation(
          wid,
          params.session_id,
          messageObject
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 3. Get a single message by fingerprint
  server.tool(
    "get_message",
    "Retrieve a single message from a conversation by its fingerprint (unique message identifier/timestamp).",
    {
      website_id: z.string().optional().describe("Website ID (uses default if not provided)"),
      session_id: z.string().describe("The conversation session ID"),
      fingerprint: z.number().describe("The message fingerprint (unique identifier/timestamp) used to look up the specific message"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getMessageInConversation(
          wid,
          params.session_id,
          params.fingerprint
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 4. Update a message's content
  server.tool(
    "update_message",
    "Edit the content of an existing message in a conversation, identified by its fingerprint.",
    {
      website_id: z.string().optional().describe("Website ID (uses default if not provided)"),
      session_id: z.string().describe("The conversation session ID"),
      fingerprint: z.number().describe("The fingerprint of the message to update"),
      content: z.string().describe("The new content to replace the existing message content with"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.updateMessageInConversation(
          wid,
          params.session_id,
          params.fingerprint,
          { content: params.content }
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 5. Remove a message
  server.tool(
    "remove_message",
    "Delete a message from a conversation, identified by its fingerprint. This action is permanent.",
    {
      website_id: z.string().optional().describe("Website ID (uses default if not provided)"),
      session_id: z.string().describe("The conversation session ID"),
      fingerprint: z.number().describe("The fingerprint of the message to delete"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.removeMessageInConversation(
          wid,
          params.session_id,
          params.fingerprint
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );
}

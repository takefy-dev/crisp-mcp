import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveWebsiteId, handleToolError } from "../client/crisp-client.js";

export function registerPeopleTools(server: McpServer, crisp: any) {
  // 1. List/search contact profiles
  server.tool(
    "list_people",
    "List or search contact profiles in Crisp. Supports filtering by text and field (e.g. email, nickname) with optional sort order. Returns paginated results.",
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
      search_text: z
        .string()
        .optional()
        .describe("Text to search for across contact profiles"),
      search_field: z
        .string()
        .optional()
        .describe(
          'Field to search within, e.g. "email", "nickname"'
        ),
      search_order: z
        .string()
        .optional()
        .describe('Sort order for results: "asc" or "desc"'),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.listPeopleProfiles(
          wid,
          params.page,
          params.search_field,
          params.search_order,
          undefined,
          undefined,
          params.search_text
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 2. Get full profile by people_id
  server.tool(
    "get_person",
    "Get the full contact profile for a specific person by their people_id. Returns all profile fields including email, nickname, avatar, segments, and custom data.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      people_id: z
        .string()
        .describe("The unique identifier of the person to retrieve"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getPeopleProfile(wid, params.people_id);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 3. Find contact by email address
  server.tool(
    "find_person_by_email",
    "Find a contact profile by their email address. This is a convenience wrapper that searches the people list filtered by email. Returns matching profiles.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      email: z
        .string()
        .describe("The email address to search for"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.listPeopleProfiles(
          wid,
          1,
          "email",
          undefined,
          undefined,
          undefined,
          params.email
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 4. Create a new contact profile
  server.tool(
    "create_person",
    "Create a new contact profile in Crisp. At minimum, provide an email or nickname to identify the contact. Returns the newly created profile.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      email: z
        .string()
        .optional()
        .describe("Email address for the new contact"),
      nickname: z
        .string()
        .optional()
        .describe("Display name for the new contact"),
      person_id: z
        .string()
        .optional()
        .describe("Custom person ID to assign to this contact"),
      avatar: z
        .string()
        .optional()
        .describe("URL of the avatar image for the contact"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);

        const profile: Record<string, string> = {};
        if (params.email !== undefined) profile.email = params.email;
        if (params.nickname !== undefined) profile.nickname = params.nickname;
        if (params.person_id !== undefined) profile.person_id = params.person_id;
        if (params.avatar !== undefined) profile.avatar = params.avatar;

        const result = await crisp.website.addNewPeopleProfile(wid, profile);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 5. Update a contact profile
  server.tool(
    "update_person",
    "Update an existing contact profile. Only the fields you provide will be changed; omitted fields remain unchanged. Use this to modify email, nickname, avatar, or phone.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      people_id: z
        .string()
        .describe("The unique identifier of the person to update"),
      email: z
        .string()
        .optional()
        .describe("New email address for the contact"),
      nickname: z
        .string()
        .optional()
        .describe("New display name for the contact"),
      avatar: z
        .string()
        .optional()
        .describe("New avatar image URL for the contact"),
      phone: z
        .string()
        .optional()
        .describe("New phone number for the contact"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);

        const profile: Record<string, string> = {};
        if (params.email !== undefined) profile.email = params.email;
        if (params.nickname !== undefined) profile.nickname = params.nickname;
        if (params.avatar !== undefined) profile.avatar = params.avatar;
        if (params.phone !== undefined) profile.phone = params.phone;

        const result = await crisp.website.updatePeopleProfile(
          wid,
          params.people_id,
          profile
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 6. Remove a contact profile
  server.tool(
    "delete_person",
    "Permanently remove a contact profile from Crisp. This action cannot be undone. The person's conversations are not deleted.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      people_id: z
        .string()
        .describe("The unique identifier of the person to delete"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.removePeopleProfile(wid, params.people_id);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 7. Get custom data fields for a contact
  server.tool(
    "get_person_data",
    "Retrieve the custom data fields associated with a contact profile. Custom data contains arbitrary key-value pairs set via the API or Crisp dashboard.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      people_id: z
        .string()
        .describe("The unique identifier of the person whose custom data to retrieve"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.getPeopleData(wid, params.people_id);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 8. Set custom data fields on a contact
  server.tool(
    "update_person_data",
    'Set or update custom data fields on a contact profile. Provide data as a JSON string of key-value pairs, e.g. \'{"plan":"pro","signup_date":"2024-01-15"}\'. Existing keys are overwritten; new keys are added.',
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      people_id: z
        .string()
        .describe("The unique identifier of the person whose custom data to update"),
      data: z
        .string()
        .describe(
          'JSON string of key-value pairs to set as custom data, e.g. \'{"plan":"pro","company":"Acme"}\''
        ),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const parsedData = JSON.parse(params.data);
        const result = await crisp.website.updatePeopleData(
          wid,
          params.people_id,
          parsedData
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 9. List a person's conversations
  server.tool(
    "list_person_conversations",
    "List all conversations associated with a specific contact. Returns paginated conversation summaries including session IDs, statuses, and last messages.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      people_id: z
        .string()
        .describe("The unique identifier of the person whose conversations to list"),
      page: z
        .number()
        .optional()
        .default(1)
        .describe("Page number for pagination (defaults to 1)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.listPeopleConversations(
          wid,
          params.people_id,
          params.page
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

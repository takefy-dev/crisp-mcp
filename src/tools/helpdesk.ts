import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveWebsiteId, handleToolError } from "../client/crisp-client.js";

export function registerHelpdeskTools(server: McpServer, crisp: any) {
  // 1. List helpdesk articles
  server.tool(
    "list_helpdesk_articles",
    "List all helpdesk articles for a given locale, paginated. Returns an array of article summaries including article IDs, titles, and metadata. Use the locale parameter to specify the language (e.g. 'en' for English) and the page parameter to navigate through results.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the articles (e.g. 'en', 'fr', 'de')"),
      page: z
        .number()
        .optional()
        .default(1)
        .describe("Page number for pagination (defaults to 1)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.listHelpdeskLocaleArticles(
          wid,
          params.locale,
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

  // 2. Get helpdesk article
  server.tool(
    "get_helpdesk_article",
    "Get the full content of a specific helpdesk article by its article ID and locale. Returns the complete article object including title, description, content body, category, section, and publishing status.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the article (e.g. 'en', 'fr', 'de')"),
      article_id: z
        .string()
        .describe("The unique identifier of the helpdesk article to retrieve"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.resolveHelpdeskLocaleArticle(
          wid,
          params.locale,
          params.article_id
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 3. Create helpdesk article
  server.tool(
    "create_helpdesk_article",
    "Create a new helpdesk article in the specified locale. Provide a title to initialize the article. After creation, use update_helpdesk_article to add the full content, description, and other fields. Returns the newly created article object with its article ID.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the new article (e.g. 'en', 'fr', 'de')"),
      title: z
        .string()
        .describe("The title of the new helpdesk article"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.addNewHelpdeskLocaleArticle(
          wid,
          params.locale,
          params.title
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 4. Update helpdesk article
  server.tool(
    "update_helpdesk_article",
    "Update an existing helpdesk article's content and metadata. Only the fields you provide will be updated — omitted fields remain unchanged. Use this to set or modify the article's title, description, or HTML/markdown content body.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the article (e.g. 'en', 'fr', 'de')"),
      article_id: z
        .string()
        .describe("The unique identifier of the helpdesk article to update"),
      title: z
        .string()
        .optional()
        .describe("New title for the article"),
      description: z
        .string()
        .optional()
        .describe("Short description or summary of the article"),
      content: z
        .string()
        .optional()
        .describe("Full article body content (supports HTML or markdown)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);

        const articleObject: Record<string, unknown> = {};

        if (params.title !== undefined) articleObject.title = params.title;
        if (params.description !== undefined) articleObject.description = params.description;
        if (params.content !== undefined) articleObject.content = params.content;

        const result = await crisp.website.updateHelpdeskLocaleArticle(
          wid,
          params.locale,
          params.article_id,
          articleObject
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 5. Delete helpdesk article
  server.tool(
    "delete_helpdesk_article",
    "Permanently delete a helpdesk article by its article ID and locale. This action cannot be undone. The article will be removed from the helpdesk entirely.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the article (e.g. 'en', 'fr', 'de')"),
      article_id: z
        .string()
        .describe("The unique identifier of the helpdesk article to delete"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.deleteHelpdeskLocaleArticle(
          wid,
          params.locale,
          params.article_id
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 6. List helpdesk categories
  server.tool(
    "list_helpdesk_categories",
    "List all helpdesk categories for a given locale, paginated. Returns an array of category objects including category IDs and names. Categories are used to organize helpdesk articles and sections.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the categories (e.g. 'en', 'fr', 'de')"),
      page: z
        .number()
        .optional()
        .default(1)
        .describe("Page number for pagination (defaults to 1)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.listHelpdeskLocaleCategories(
          wid,
          params.locale,
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

  // 7. Create helpdesk category
  server.tool(
    "create_helpdesk_category",
    "Create a new helpdesk category in the specified locale. Categories are top-level organizational units that group related sections and articles. Returns the newly created category object with its category ID.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the new category (e.g. 'en', 'fr', 'de')"),
      name: z
        .string()
        .describe("The name of the new helpdesk category"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.addHelpdeskLocaleCategory(
          wid,
          params.locale,
          params.name
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 8. Get article category
  server.tool(
    "get_helpdesk_article_category",
    "Get the category currently assigned to a helpdesk article. Returns the category object associated with the article in the specified locale.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the article (e.g. 'en', 'fr', 'de')"),
      article_id: z
        .string()
        .describe("The unique identifier of the helpdesk article"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.resolveHelpdeskLocaleArticleCategory(
          wid,
          params.locale,
          params.article_id
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 9. Assign article to category (and optionally section)
  server.tool(
    "update_helpdesk_article_category",
    "Assign or change the category and section of a helpdesk article. Use list_helpdesk_categories to find category IDs and list_helpdesk_sections to find section IDs. Both new and existing articles can be organized this way.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the article (e.g. 'en', 'fr', 'de')"),
      article_id: z
        .string()
        .describe("The unique identifier of the helpdesk article to recategorize"),
      category_id: z
        .string()
        .describe("The unique identifier of the category to assign the article to"),
      section_id: z
        .string()
        .optional()
        .describe("The unique identifier of the section within the category to assign the article to"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.updateHelpdeskLocaleArticleCategory(
          wid,
          params.locale,
          params.article_id,
          params.category_id,
          params.section_id
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return handleToolError(e);
      }
    }
  );

  // 10. List helpdesk sections
  server.tool(
    "list_helpdesk_sections",
    "List all sections within a specific helpdesk category for a given locale, paginated. Sections are sub-groupings within a category that further organize articles. Returns an array of section objects including section IDs and names.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the sections (e.g. 'en', 'fr', 'de')"),
      category_id: z
        .string()
        .describe("The unique identifier of the category whose sections to list"),
      page: z
        .number()
        .optional()
        .default(1)
        .describe("Page number for pagination (defaults to 1)"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.listHelpdeskLocaleSections(
          wid,
          params.locale,
          params.category_id,
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

  // 11. Create helpdesk section
  server.tool(
    "create_helpdesk_section",
    "Create a new section within a helpdesk category. Sections are sub-groupings inside a category used to further organize articles. Returns the newly created section object with its section ID.",
    {
      website_id: z
        .string()
        .optional()
        .describe("Website ID (uses default if not provided)"),
      locale: z
        .string()
        .describe("Locale code for the new section (e.g. 'en', 'fr', 'de')"),
      category_id: z
        .string()
        .describe("The category ID to create the section in"),
      name: z
        .string()
        .describe("The name of the new section"),
    },
    async (params) => {
      try {
        const wid = resolveWebsiteId(params.website_id);
        const result = await crisp.website.addHelpdeskLocaleSection(
          wid,
          params.locale,
          params.category_id,
          params.name
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

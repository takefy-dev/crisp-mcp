import Crisp from "crisp-api";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const identifier = process.env.CRISP_IDENTIFIER;
const key = process.env.CRISP_KEY;

if (!identifier || !key) {
  console.error("CRISP_IDENTIFIER and CRISP_KEY environment variables are required");
  process.exit(1);
}

const crispClient = new Crisp();
crispClient.authenticateTier("plugin", identifier, key);

export { crispClient };

export function resolveWebsiteId(provided?: string): string {
  const wid = provided || process.env.CRISP_WEBSITE_ID;
  if (!wid) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "website_id is required. Provide it as a parameter or set CRISP_WEBSITE_ID environment variable."
    );
  }
  return wid;
}

export function handleToolError(error: unknown): { content: { type: "text"; text: string }[]; isError: true } {
  if (error instanceof McpError) {
    return {
      content: [{ type: "text", text: error.message }],
      isError: true,
    };
  }
  let msg: string;
  if (error instanceof Error) {
    msg = error.message;
  } else if (typeof error === "object" && error !== null) {
    msg = JSON.stringify(error, null, 2);
  } else {
    msg = String(error);
  }
  return {
    content: [{ type: "text", text: `Error: ${msg}` }],
    isError: true,
  };
}

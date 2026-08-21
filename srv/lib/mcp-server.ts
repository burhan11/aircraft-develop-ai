import { Server } from '@modelcontextprotocol/sdk/server/index';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types'

const CAP_BASE_URL = process.env.CAP_BASE_URL || 'http://localhost:4004';

const server = new Server(
  { name: "aircraft-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  {
    name: "searchAeroplaneByRange",
    description: "Search aircraft by flight range in km. Returns aircrafts above given range",
    inputSchema: {
      type: "object",
      properties: {
        range: { type: "number", description: "Minimum range in km (e.g. 5000)" }
      },
      required: ["range"],
      additionalProperties: false,
    }
  },
  {
    name: "enrichAeroplaneData",
    description: "Given a free-text aeroplane description, extract structured data using AI",
    inputSchema: {
      type: "object",
      properties: {
        userPrompt: { type: "string", description: "Free-text description of the aircraft" },
        chatHistory: { type: "string", description: "Old chat history" }
      },
      required: ["userPrompt", "chatHistory"],
      additionalProperties: false,
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params as { name: string; arguments: any };

  try {
    let result: any = null;

    if (name === "searchAeroplaneByRange") {
      const response = await fetch(
        `${CAP_BASE_URL}/odata/v4/aircraft/searchAeroplaneByRange(range=${args.range})`
      );
      result = await response.json();
    } else if (name === "enrichAeroplaneData") {
      const response = await fetch(
        `${CAP_BASE_URL}/odata/v4/aircraft/enrichAeroplaneData`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPrompt: args.userPrompt,
            conversationHistory: args.chatHistory || "[]"
          })
        }
      );
      result = await response.json();
    } else {
      throw new Error(`Unknown tool name: ${name}`);
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify(result.value || result, null, 2)
      }]
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Error executing tool '${name}': ${error?.message || error}`
      }]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
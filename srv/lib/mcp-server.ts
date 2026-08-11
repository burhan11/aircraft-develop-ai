// import { Server } from '@modelcontextprotocol/sdk/server/index';
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
// import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types'

// const server = new Server(
//   { name: "aircraft-mcp-server", version: "1.0.0" },
//   { capabilities: { tools: {} } }
// );

// const TOOLS = [
//   {
//     name: "searchAeroplaneByRange",
//     description: "Search aircraft by flight range in km. Returns aircrafts above given range",
//     inputSchema: {
//       type: "object",
//       properties: {
//         range: { type: "number", description: "Minimum range in km" }
//       },
//       required: ["min"]
//     }
//   },
//   {
//     name: "enrichAeroplaneData",
//     description: "Given a free-text aeroplane description, extract structured data using AI",
//     inputSchema: {
//       type: "object",
//       properties: {
//         userPrompt: { type: "string", description: "Free-text description of the aircraft" },
//         conversationHistory: { type: "string", description: "Old chat history" }
//       },
//       required: ["description"]
//     }
//   }
// ];

// Server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

// server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
//   const { name, arguments: args } = request.params as { name: string; arguments: any };

//   // your fetch() logic goes here — same task as before, just typed now
//   const response = await fetch(
//     `http://localhost:4004/odata/v4/aircraft/searchAeroplaneByRange(range=${args.range})`,
//     {
//       method: "GET",
//       // headers: { "Content-Type": "application/json" },
//       // body: JSON.stringify({ range: [args.min, args.max] })
//     }
//   );
//   const data = await response.json();
// });

// async function main() {
//   const transport = new StdioServerTransport();
//   await server.connect(transport);
// }

// main().catch((err) => {
//   console.error("Failed to start MCP server:", err);
//   process.exit(1);
// });
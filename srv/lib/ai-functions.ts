import OpenAI from "openai";
import referenceData from "../aircraft/data/aircraft-reference.json";
import cds from "@sap/cds";

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (args: any) => Promise<any> | any;
}

// Built-in tools for Aviation domain
export const defaultAviationTools: AITool[] = [
  {
    name: "searchReferenceData",
    description: "Search local dataset of aircraft models (Boeing, Airbus, Cessna, Embraer, ATR, Bombardier) for technical specs (model, manufacturer, category, capacity, range).",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword search string (e.g. 'Boeing', 'A350', 'long-haul')" }
      },
      required: ["query"]
    },
    execute: (args: { query: string }) => {
      const q = (args.query || "").toLowerCase();
      const matches = referenceData.filter(record => {
        const text = `${record.model} ${record.manufacturer} ${record.category} ${record.capacity} ${record.range}`.toLowerCase();
        return text.includes(q);
      });
      return matches.length > 0 ? matches.slice(0, 3) : referenceData.slice(0, 2);
    }
  },
  {
    name: "queryDatabaseEntity",
    description: "Query live database entity records in SAP CAP (e.g. Suppliers or Aircrafts) by filtering attributes like country, payment terms, manufacturer, or model.",
    parameters: {
      type: "object",
      properties: {
        entityName: { type: "string", description: "Entity name e.g. Aircrafts or Suppliers" },
        filterKey: { type: "string", description: "Field name to filter on e.g. Country or Manufacturer" },
        filterValue: { type: "string", description: "Value to match e.g. Germany or Boeing" }
      },
      required: ["entityName"]
    },
    execute: async (args: { entityName: string; filterKey?: string; filterValue?: string }) => {
      try {
        const candidateNames = [
          `AviationService.${args.entityName}`,
          `com.valantic.schema.aviation.${args.entityName}`,
          args.entityName
        ];
        let entity: any = null;
        for (const candidate of candidateNames) {
          if (cds.entities[candidate]) {
            entity = cds.entities[candidate];
            break;
          }
        }
        if (!entity) return [];
        let query = SELECT.from(entity);
        if (args.filterKey && args.filterValue) {
          query = query.where({ [args.filterKey]: args.filterValue });
        }
        const records = await cds.run(query.limit(5));
        return records;
      } catch (err: any) {
        return { error: err?.message || "Failed to query entity" };
      }
    }
  }
];

export const enrichDataUsingAI = async (sInput: any, tools: AITool[] = defaultAviationTools) => {
  const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  let outputText = "";

  try {
    if (tools && tools.length > 0) {
      const openAITools = tools.map(t => ({
        type: "function" as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }
      }));

      const messages: any[] = [
        { role: "user", content: typeof sInput === "string" ? sInput : JSON.stringify(sInput) }
      ];

      let completion = await openAI.chat.completions.create({
        model: modelName,
        messages,
        tools: openAITools
      });

      let message = completion.choices[0]?.message;

      // Function calling loop (up to 1 turns)
      let maxTurns = 1;
      while (message?.tool_calls && message.tool_calls.length > 0 && maxTurns > 0) {
        maxTurns--;
        messages.push(message);

        for (const toolCall of (message.tool_calls as any[])) {
          const toolName = toolCall.function?.name;
          let toolArgs = {};
          try {
            toolArgs = toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {};
          } catch {
            toolArgs = {};
          }

          const targetTool = tools.find(t => t.name === toolName);
          let toolResult: any = "No result returned";

          if (targetTool) {
            try {
              toolResult = await targetTool.execute(toolArgs);
              if (typeof toolResult !== "string") {
                toolResult = JSON.stringify(toolResult);
              }
            } catch (err: any) {
              toolResult = JSON.stringify({ error: `Error executing tool ${toolName}: ${err?.message || err}` });
            }
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult
          });
        }

        completion = await openAI.chat.completions.create({
          model: modelName,
          messages,
          tools: openAITools
        });
        message = completion.choices[0]?.message;
      }

      outputText = message?.content || "";
    } else {
      const completion = await openAI.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: typeof sInput === "string" ? sInput : JSON.stringify(sInput) }]
      });
      outputText = completion.choices[0]?.message?.content || "";
    }
  } catch (err) {
    if ((openAI as any).responses) {
      const response = await (openAI as any).responses.create({
        model: modelName,
        input: sInput,
      });
      outputText = response.output_text || "";
    } else {
      throw err;
    }
  }

  const cleanedText = cleanMarkdownFences(outputText);
  return isJSON(cleanedText) ? JSON.parse(cleanedText) : outputText;
};

const cleanMarkdownFences = (str: string): string => {
  if (!str) return "";
  let trimmed = str.trim();
  if (trimmed.startsWith("```json")) {
    trimmed = trimmed.substring(7);
  } else if (trimmed.startsWith("```")) {
    trimmed = trimmed.substring(3);
  }
  if (trimmed.endsWith("```")) {
    trimmed = trimmed.substring(0, trimmed.length - 3);
  }
  return trimmed.trim();
};

const isJSON = (response: string) => {
  try {
    const parsed = JSON.parse(response);
    return typeof parsed === 'object' && parsed !== null;
  } catch (error) {
    return false;
  }
};
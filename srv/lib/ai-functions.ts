import OpenAI from "openai"

export const enrichDataUsingAI = async (sInput: any) => {
  const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  const response = await openAI.responses.create({
    model: "gpt-5.4-mini",
    input: sInput,
  });
  return JSON.parse(response.output_text);
} 
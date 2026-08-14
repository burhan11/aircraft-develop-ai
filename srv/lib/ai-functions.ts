import OpenAI from "openai"

export const enrichDataUsingAI = async (sInput: any) => {
  const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  const response = await openAI.responses.create({
    model: "gpt-5.4-mini",
    input: sInput,
  });
  const result = (isJSON(response.output_text))
    ? JSON.parse(response.output_text)
    : response.output_text
  return result;
}

const isJSON = (response: string) => {
  try {
    const parsed = JSON.parse(response);
    return typeof parsed === 'object' && parsed !== null;
  } catch (error) {
    return false
  }
}
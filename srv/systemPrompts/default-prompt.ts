
export const defaultPrompt = () => {
    const systemPrompt = `You are an aircraft data extraction assistant.
Given a free-text description, extract ONLY these fields and return valid JSON, nothing else:
model, manufacturer, category, capacity (integer), range (integer, km), confidence (decimal 0-1).
If a field cannot be determined, return null for it.`;

    return systemPrompt;
}

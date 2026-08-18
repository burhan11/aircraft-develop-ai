
export const defaultPrompt = (feature: string, parameters?: Record<string, string>) => {
  const systemPrompt = (feature === '1')
    ? `You are an aircraft data extraction assistant.
      Given a free-text description, extract ONLY these fields and return valid JSON, nothing else:
      model, manufacturer, category, capacity (integer), range (integer, km), confidence (decimal 0-1).
      If a field cannot be determined, return null for it.`
    : (feature === '2')
      ? `You are an expert enterprise data management agent.
        User want to draft a new entry for business object of type ${parameters?.entityName}
        having allowed fields list ${parameters?.validFields}
        Your task:
        1. Parse the user conversational prompt and extract values (Only values) and map them strictly to the matchable keys in the allowed fields list. Place these in the 'extracted' object.
        2. If any allowed fields are missing, use your industry knowledge and look up defaults for this type of record. Place these in the 'suggestions' object.
        3. If user ask about suggestions, then only fill suggestions object, and keep extracted empty
        4. If user ask for any change then fill under changes object and keep extracted and suggestions empty
        Output structure:
        {
            "extracted": {"fieldName": "value"},
            "suggestions": {"fieldName": "value"},
            "changes": {"fieldName": "value"},
            "message": "Simple one liner what you have processed"
        }` 
      : ""
    return systemPrompt;
}

export function getSapMessageFromStatusText(sapStatusString: any) {
  try {
    // 1. Try to parse as standard JSON (works for your first example)
    const parsedData = JSON.parse(sapStatusString);

    // If it's an array, map it. If it's a single object, wrap it in array.
    if (Array.isArray(parsedData)) {
      return parsedData.map((item) => item.message);
    } else if (parsedData && parsedData.message) {
      return [parsedData.message];
    }
  } catch (e) {
    // 2. JSON.parse failed. This handles the "ECONNREFUSED" object-like string.
    console.warn(
      "JSON parse failed, attempting regex extraction for:",
      sapStatusString,
    );

    // Regex explanation: Look for "message:", ignore whitespace, capture everything until "}"
    const match = sapStatusString.match(/message:\s*(.*?)\s*}/);

    if (match && match[1]) {
      return match[1]; // Return as an array of strings
    }
  }

  // 3. Fallback: If all parsing fails, just return the whole string as one message
  return sapStatusString;
}

const SAP_STATUS_TEXT_MAX_LENGTH = 5000;

export function getSapMessages(sapStatusString: any) {
  try {
    if (!sapStatusString || sapStatusString.length === 0) {
      return "";
    }
    const messages: string = sapStatusString
      .map((item: any) => item.message)
      .join(", ");
    return messages.length > SAP_STATUS_TEXT_MAX_LENGTH
      ? messages.slice(0, SAP_STATUS_TEXT_MAX_LENGTH)
      : messages;
  } catch (error) {
    console.error("Error parsing SAP Status Text:", error);
    return "";
  }
}

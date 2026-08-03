const { GoogleGenAI } = require('@google/genai');

let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

/**
 * Reviews a set of file patches using Gemini API and returns structured feedback.
 */
async function analyzeDiffWithGemini(filePatches, focusArea = 'full') {
  if (!ai) {
    // Fallback if client is not configured
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  const prompt = `
You are a highly experienced software engineer and code reviewer.
Review the following Git patch changes for a pull request.
Focus area: ${focusArea}

For each patch, search for potential bugs, security vulnerabilities (like injection, XSS, bad auth, etc.), performance issues, or readability/style violations.
You must output a JSON object strictly matching this schema:
{
  "reviews": [
    {
      "file": "string (the file path exactly)",
      "line": "number (the exact line number in the new file where the issue occurs)",
      "severity": "string ('low' | 'medium' | 'high')",
      "comment": "string (clear, professional, actionable explanation of the issue and suggested fix)"
    }
  ]
}

Only comment on lines that exist in the patch additions (prefixed with '+'). Do not review lines that are deleted or unchanged.
If you find no issues, return an empty array under "reviews".

Patch data:
${JSON.stringify(filePatches, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse.reviews || [];
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return [];
  }
}

module.exports = {
  analyzeDiffWithGemini,
};

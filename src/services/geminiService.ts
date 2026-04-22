import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  notes: string;
}

export async function extractTransactions(fileData: string, mimeType: string): Promise<Transaction[]> {
  try {
    const prompt = `
      Extract ALL transactions from this bank statement. 
      Follow these strict rules:
      1. Extraction: Find every single transaction row. Skip headers, totals, or summary sections.
      2. Format: Return ONLY a JSON array of objects.
      3. Fields:
         - "date": Date in YYYY-MM-DD format.
         - "description": Clear description of the transaction.
         - "amount": Number. NEGATIVE for expenses/outbound, POSITIVE for deposits/inbound.
         - "category": Categorize the transaction (e.g., Groceries, Dining, Transport, Salaries, Bills, Entertainment, Health, Shopping, Other).
         - "notes": Any extra info (e.g., transaction type, merchant location).
      4. Constraints: Handle multi-page documents if present. Ensure all amounts are numeric.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: fileData.split(",")[1] || fileData,
                mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
            required: ["date", "description", "amount", "category", "notes"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Transaction[];
  } catch (error) {
    console.error("Extraction error:", error);
    throw error;
  }
}
